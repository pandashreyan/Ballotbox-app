import { NextRequest } from 'next/server';
import { globalEmitter } from '@/lib/events';
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ electionId: string }> }) {
  const { electionId } = await params;

  if (!ObjectId.isValid(electionId)) {
    return new Response('Invalid election ID format.', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send connection acknowledgement
      controller.enqueue(encoder.encode(': ok\n\n'));

      const fetchResults = async () => {
        try {
          const client = await clientPromise;
          const db = client.db(dbName);
          const election = await db.collection('elections').findOne({ _id: new ObjectId(electionId) });
          if (election) {
            return {
              electionId,
              electionName: election.name,
              results: election.candidates.map((candidate: any) => ({
                candidateId: candidate.id,
                candidateName: candidate.name,
                voteCount: typeof candidate.voteCount === 'number' ? candidate.voteCount : 0,
              })).sort((a: any, b: any) => b.voteCount - a.voteCount),
            };
          }
        } catch (err) {
          console.error('SSE fetch results error:', err);
        }
        return null;
      };

      // Send initial results on connection
      const initialResults = await fetchResults();
      if (initialResults) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialResults)}\n\n`));
      }

      // Handler for real-time updates
      const onVote = (updatedResults: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(updatedResults)}\n\n`));
        } catch (err) {
          console.error('SSE write failed:', err);
        }
      };

      globalEmitter.on(`vote:${electionId}`, onVote);

      // Keep-alive heartbeat interval (every 10 seconds)
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch (err) {
          clearInterval(keepAlive);
        }
      }, 10000);

      // Clean up when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        globalEmitter.off(`vote:${electionId}`, onVote);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
