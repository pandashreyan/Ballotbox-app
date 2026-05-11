import { NextResponse } from 'next/server';
import { compareCandidates } from '@/ai/flows/compare-candidates-flow';

export async function POST(req: Request) {
  try {
    const { candidates } = await req.json();

    if (!candidates || !Array.isArray(candidates) || candidates.length < 2) {
      return NextResponse.json(
        { message: 'Please select at least 2 candidates to compare.' },
        { status: 400 }
      );
    }

    const comparisonResults = await compareCandidates({ candidates });
    return NextResponse.json(comparisonResults, { status: 200 });
  } catch (error: any) {
    console.error('Failed to compare candidate platforms:', error);
    return NextResponse.json(
      { message: error.message || 'An unexpected error occurred during platform comparison.' },
      { status: 500 }
    );
  }
}
