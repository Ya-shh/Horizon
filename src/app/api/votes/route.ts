import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for voting
const voteSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  value: z.number().min(-1).max(1), // -1 for downvote, 0 for removing vote, 1 for upvote
});

// POST create/update/delete a vote
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const { postId, commentId, value } = await request.json();
    
    if ((!postId && !commentId) || (postId && commentId)) {
      return NextResponse.json(
        { error: "Either postId or commentId must be provided, but not both" },
        { status: 400 }
      );
    }
    
    // Allow values -1, 0, 1
    if (![1, -1, 0].includes(value)) {
      return NextResponse.json(
        { error: "Value must be -1, 0, or 1" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Check if the user has already voted
    const existingVote = await db.vote.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : { commentId }),
      },
    });
    
    // If value is 0, delete the vote (if it exists)
    if (value === 0 && existingVote) {
      await db.vote.delete({
        where: {
          id: existingVote.id,
        },
      });
      
      return NextResponse.json({ 
        removed: true, 
        message: "Vote removed successfully" 
      });
    }
    
    if (existingVote) {
      // If the vote is the same, remove it (toggle)
      if (existingVote.value === value) {
        await db.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        
        return NextResponse.json({ 
          removed: true, 
          message: "Vote removed successfully" 
        });
      } else {
        // Otherwise, update the vote
        const updatedVote = await db.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            value,
          },
        });
        
        return NextResponse.json({ 
          vote: updatedVote, 
          message: "Vote updated successfully" 
        });
      }
    } else if (value !== 0) {  // Only create a new vote if value is not 0
      // Create a new vote
      const newVote = await db.vote.create({
        data: {
          value,
          userId,
          ...(postId ? { postId } : { commentId }),
        },
      });
      
      return NextResponse.json({ 
        vote: newVote, 
        message: "Vote created successfully" 
      });
    } else {
      // Value is 0 but no existing vote to delete
      return NextResponse.json({ 
        message: "No vote to remove" 
      });
    }
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
} 