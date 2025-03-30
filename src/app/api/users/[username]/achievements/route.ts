import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { achievements } from "@/lib/achievements";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    console.log("Achievement API called with username:", params.username);
    const username = params.username;
    
    // Validate username
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await db.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = user.id;

    try {
      // Use type assertion to avoid TypeScript errors
      const prisma = db as any;
      
      // Try to get user achievements
      let userAchievements = [];
      
      try {
        userAchievements = await prisma.userAchievement.findMany({
          where: { userId },
          orderBy: { unlockedAt: 'desc' },
          select: {
            id: true,
            userId: true,
            achievementId: true,
            unlockedAt: true,
          }
        });
      } catch (dbModelError) {
        console.error("UserAchievement model error:", dbModelError);
        // If there's an error with the model, just return empty achievements
        return NextResponse.json({
          achievements: []
        });
      }
      
      // Enrich user achievements with achievement details
      const enrichedAchievements = userAchievements.map((userAchievement: any) => {
        const achievementDetails = achievements.find(
          a => a.id === userAchievement.achievementId
        ) || {
          // Fallback achievement details if not found
          id: userAchievement.achievementId,
          name: "Achievement",
          description: "An achievement",
          icon: "🏆",
          points: 0,
          condition: { type: 'posts', threshold: 1 }
        };
        
        return {
          ...userAchievement,
          achievement: achievementDetails
        };
      });

      return NextResponse.json({
        achievements: enrichedAchievements
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // If there's an error with the database, return empty achievements
      return NextResponse.json({
        achievements: [],
        message: "Unable to fetch achievements, returning empty list"
      });
    }
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user achievements" },
      { status: 500 }
    );
  }
} 