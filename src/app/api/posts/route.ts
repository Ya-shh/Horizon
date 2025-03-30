import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { processMentions } from "@/lib/notifications";

// Updated schema for creating a post with user-defined category
const postCreateSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
  category: z.string().min(1).max(50),
});

// GET all posts with optional filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryName = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Get category if filtering by category name
    let categoryId;
    if (categoryName) {
      const category = await db.category.findFirst({
        where: { name: categoryName },
      });
      categoryId = category?.id;
    }

    const where = categoryId ? { categoryId } : {};

    // Get posts with pagination
    const posts = await db.post.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        category: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await db.post.count({ where });

    return NextResponse.json({
      posts,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Could not fetch posts" },
      { status: 500 }
    );
  }
}

// POST create a new post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("API Debug - Session:", JSON.stringify(session, null, 2));

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to create a post" },
        { status: 401 }
      );
    }

    // Ensure username exists
    if (!session.user.username) {
      console.log("API Debug - Missing username in session");
      return NextResponse.json(
        { error: "User profile is incomplete. Missing username." },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("API Debug - Request body:", body);
    const { title, content, category } = postCreateSchema.parse(body);

    // Find or create category by name (case insensitive)
    let categoryRecord = await db.category.findFirst({
      where: {
        name: {
          contains: category,
          // Using contains as a simple way to do case-insensitive matching in SQLite
          // since it doesn't support full 'mode: "insensitive"' option
        }
      }
    });

    // If category doesn't exist, create it with the current user as creator
    if (!categoryRecord) {
      // Generate a slug from the category name
      const slug = category
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')  // Remove non-word chars
        .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
        
      // Ensure the slug is unique
      const existingSlug = await db.category.findUnique({
        where: { slug }
      });
      
      const finalSlug = existingSlug 
        ? `${slug}-${Date.now().toString().slice(-6)}` 
        : slug;
      
      try {
        categoryRecord = await db.category.create({
          data: {
            name: category,
            description: `Posts related to ${category}`,
            slug: finalSlug,
            creatorId: session.user.id, // Set the creator to the current user
          }
        });
        console.log("API Debug - Created new category:", categoryRecord);
      } catch (categoryError) {
        console.error("Error creating category:", categoryError);
        return NextResponse.json(
          { message: "Could not create category", error: String(categoryError) },
          { status: 500 }
        );
      }
    }

    // Create new post with the found or created category
    const newPost = await db.post.create({
      data: {
        title,
        content,
        categoryId: categoryRecord.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        category: true,
      },
    });

    // Process @mentions - Use try/catch to prevent failures here
    try {
      await processMentions({
        text: content,
        authorId: session.user.id,
        authorUsername: session.user.username || "user", // Provide a fallback
        contentType: 'post',
        contentId: newPost.id,
      });
    } catch (mentionError) {
      console.error("Error processing mentions:", mentionError);
      // Continue with post creation even if mentions processing fails
    }
    
    return NextResponse.json(
      { post: newPost, message: "Post created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    
    if (error instanceof z.ZodError) {
      // Get more specific error messages from Zod validation
      const validationErrors = error.errors.map(err => {
        const fieldName = err.path[0] as string;
        const readableField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        return `${readableField}: ${err.message}`;
      });
      
      const errorMessage = validationErrors.join(". ");
      
      return NextResponse.json(
        { 
          message: "Invalid data", 
          error: errorMessage,
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Could not create post", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 