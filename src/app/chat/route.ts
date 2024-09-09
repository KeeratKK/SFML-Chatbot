import { NextResponse } from 'next/server';
import { chain } from '@/utils/chain';
import { Message } from '@/types/messages';
import { createRetrievalChain } from 'langchain/chains/retrieval';

export async function POST(req: Request) {

    const body = await req.json();

    const question: string = body.query;
    const history: Message[] = body.history ?? [];

    const answer = await chain.stream({
        chat_history: history.map(h => h.content).join("\n"),
        input: question,
    });

    const { readable, writable } = new TransformStream();

    const reader = answer.getReader();
    const writer = writable.getWriter();

    const pump = async () => {

        while(true) {
            const {done, value} = await reader.read();

            if(done) {
                writer.close();
                break;
            }

            const chunkString = JSON.stringify(value);
            writer.write(new TextEncoder().encode(chunkString));
        }

    };

    pump().catch(err => writer.abort(err));
 
    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
        },
    });

}