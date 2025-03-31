import { NextRequest, NextResponse } from 'next/server';
import { vectorSearch } from '@/lib/qdrant';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Check if query parameter exists
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Perform vector search
    const results = await vectorSearch(query, limit);
    
    return NextResponse.json({
      results,
      meta: {
        query,
        count: results.length,
      }
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'An error occurred during search' },
      { status: 500 }
    );
  }
} 