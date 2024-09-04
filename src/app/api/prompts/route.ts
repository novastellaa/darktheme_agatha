import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prompts = await prisma.promptSettings.findMany({
      select: {
        id: true,
        title: true,
        prompt: true,
        temperature: true,
        topP: true,
        presencePenalty: true,
        frequencyPenalty: true,
        maxTokens: true,
      },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ message: 'Error fetching prompts' }, { status: 500 });
  }
}

