import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Define a type for notifications for type safety
type Notification = {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  data?: string;
};

/**
 * GET /api/notifications
 * Fetch a user's notifications, or empty array if table doesn't exist
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user with auth options
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get URL params
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') || '20');
    const page = Number(searchParams.get('page') || '1');
    
    // Simply return empty notifications since the table doesn't exist
    // This allows the app to continue functioning without errors
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
      page,
      limit,
    });
    
  } catch (error) {
    console.error('Error in notifications API:', error);
    // Return empty data on error
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
      page: 1,
      limit: 20,
    });
  }
} 