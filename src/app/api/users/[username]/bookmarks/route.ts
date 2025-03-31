import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    // The correct pattern is to await the entire params object first
    const resolvedParams = await params;
    const username = resolvedParams.username;
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;
    
    // Get current session
    const session = await getServerSession();
    
    // Check if user exists
    const user = await db.user.findUnique({
      where: { username },
      select: { 
        id: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only allow users to view their own bookmarks
    if (session?.user?.email !== user.email) {
      return NextResponse.json(
        { error: "You can only view your own bookmarks" },
        { status: 403 }
      );
    }

    // Get user's bookmarks with pagination
    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        post: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            votes: {
              select: {
                value: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
      },
    });

    // Get total count for pagination
    const totalBookmarks = await db.bookmark.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      bookmarks,
      pagination: {
        total: totalBookmarks,
        page,
        limit,
        pages: Math.ceil(totalBookmarks / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user bookmarks:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user bookmarks" },
      { status: 500 }
    );
  }
} 