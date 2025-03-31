import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // The correct pattern is to await the entire params object first
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) {
      return new NextResponse("Comment ID is required", { status: 400 });
    }

    // Check if comment exists
    const comment = await db.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    // Check if user already liked this comment
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        commentId: id,
        value: 1 // 1 for like, -1 for dislike
      }
    });

    let liked = false;

    if (existingVote) {
      // User already liked the comment, so remove the vote
      await db.vote.delete({
        where: {
          id: existingVote.id
        }
      });
      liked = false;
    } else {
      // Check if the user has a dislike on this comment
      const existingDislike = await db.vote.findFirst({
        where: {
          userId: session.user.id,
          commentId: id,
          value: -1
        }
      });

      if (existingDislike) {
        // Update the dislike to a like
        await db.vote.update({
          where: {
            id: existingDislike.id
          },
          data: {
            value: 1
          }
        });
      } else {
        // Create a new like vote
        await db.vote.create({
          data: {
            userId: session.user.id,
            commentId: id,
            value: 1
          }
        });
      }
      liked = true;
    }

    // Get updated count of likes for this comment
    const likesCount = await db.vote.count({
      where: {
        commentId: id,
        value: 1
      }
    });

    return NextResponse.json({ 
      message: liked ? "Comment liked successfully" : "Like removed successfully", 
      liked,
      likeCount: likesCount
    });
  } catch (error) {
    console.error("Error in comment like route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Also implement GET to check if user has liked a comment
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // The correct pattern is to await the entire params object first
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) {
      return new NextResponse("Comment ID is required", { status: 400 });
    }

    // Check if user has liked this comment
    const vote = await db.vote.findFirst({
      where: {
        commentId: id,
        userId: session.user.id,
        value: 1
      }
    });

    // Get count of likes for this comment
    const likesCount = await db.vote.count({
      where: {
        commentId: id,
        value: 1
      }
    });

    return NextResponse.json({ 
      liked: !!vote,
      likeCount: likesCount
    });
  } catch (error) {
    console.error("Error in comment like GET route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 