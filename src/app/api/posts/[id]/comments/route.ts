import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for creating a comment
const commentCreateSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

// GET comments for a post
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Safely extract ID with a fallback
    const id = (params ?? {}).id;
    
    if (!id) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 }
      );
    }

    // Get top-level comments (no parentId)
    const comments = await db.comment.findMany({
      where: {
        postId: id,
        parentId: null,
      },
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
        _count: {
          select: {
            votes: true,
            children: true,
          },
        },
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await db.comment.count({
      where: {
        postId: id,
        parentId: null,
      },
    });

    return NextResponse.json({
      comments,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { message: "Could not fetch comments" },
      { status: 500 }
    );
  }
}

// POST create a new comment
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to comment" },
        { status: 401 }
      );
    }

    // Safely extract ID with a fallback
    const id = (params ?? {}).id;
    
    if (!id) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await db.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { content, parentId } = commentCreateSchema.parse(body);

    // If this is a reply, verify parent comment exists and belongs to this post
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.postId !== id) {
        return NextResponse.json(
          { message: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    // Create the comment
    const newComment = await db.comment.create({
      data: {
        content,
        userId: session.user.id,
        postId: id,
        parentId,
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
      },
    });

    return NextResponse.json(
      { comment: newComment, message: "Comment created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating comment:", error);
    return NextResponse.json(
      { message: "Could not create comment" },
      { status: 500 }
    );
  }
} 