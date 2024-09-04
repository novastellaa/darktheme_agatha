import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { prompt, temperature, topP, presencePenalty, frequencyPenalty, maxTokens ,title } = await req.json();

    const promptSettings = await prisma.promptSettings.create({
      data: {
        prompt,
        temperature,
        topP,
        presencePenalty,
        frequencyPenalty,
        maxTokens,
        title
      },
    });

    return NextResponse.json(promptSettings, { status: 201 });
  } catch (error) {
    console.error('Error saving chat settings:', error);
    return NextResponse.json({ message: 'Error saving chat settings' }, { status: 500 });
  }
}