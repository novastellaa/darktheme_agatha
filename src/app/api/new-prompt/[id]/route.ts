import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        await prisma.promptlist.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Prompt deleted successfully' });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        return NextResponse.json({ message: 'Error deleting prompt' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const updatedPrompt = await prisma.promptlist.update({
            where: { id },
            data: {
                title: body.title,
                prompt: body.prompt,
            },
        });
        return NextResponse.json(updatedPrompt);
    } catch (error) {
        console.error('Error updating prompt:', error);
        return NextResponse.json({ message: 'Error updating prompt' }, { status: 500 });
    }
}