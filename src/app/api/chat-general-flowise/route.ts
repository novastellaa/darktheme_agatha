import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { question  , prompt} = await req.json();

  try {
    const response = await fetch(
      "https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/f462c2a1-e1b1-4dac-9ffb-3cb183d7963b",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "question": "hi",
          "overrideConfig": {
              "prefix": "Give the answer of every input, only answer about java"
          }
      })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json({ content: result.text });
  } catch (error) {
    console.error('Error querying Flowise:', error);
    return NextResponse.json({ error: 'Failed to get response from Flowise' }, { status: 500 });
  }
}