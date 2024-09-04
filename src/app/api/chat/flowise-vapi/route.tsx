import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { question } = await req.json();

  try {
    const response = await fetch(
      "https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/0d1fd767-6d79-49db-8a69-25ecdf90f429",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
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