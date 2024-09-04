import { NextResponse } from 'next/server';
import { kv } from "@vercel/kv";

export async function GET(req: Request) {
  try {
    const keys = await kv.keys('rate_limited_*');
    const rateLimitedUsers = await Promise.all(
      keys.map(async (key) => {
        const timestamp = await kv.get(key);
        return {
          ip: key.replace('rate_limited_', ''),
          timestamp: new Date(timestamp as number).toISOString()
        };
      })
    );

    return NextResponse.json(rateLimitedUsers);
  } catch (error) {
    console.error('Error fetching rate-limited users:', error);
    return NextResponse.json({ error: 'Failed to fetch rate-limited users' }, { status: 500 });
  }
}