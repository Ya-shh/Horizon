import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for creating a category
const categoryCreateSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
});

// GET all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create a new category
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to create a category" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description } = categoryCreateSchema.parse(body);

    // Create slug from name (lowercase, replace spaces with dashes)
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    // Check if category with same name/slug exists
    const existingCategory = await db.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "A category with this name already exists" },
        { status: 409 }
      );
    }

    // Create new category
    const newCategory = await db.category.create({
      data: {
        name,
        description,
        slug,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(
      { category: newCategory, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { message: "Could not create category" },
      { status: 500 }
    );
  }
} 