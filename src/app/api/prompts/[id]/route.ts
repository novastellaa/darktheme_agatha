import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('DELETE request received for prompt ID:', params.id);
    try {
        const id = params.id;

        // Check if the ID is valid
        if (!id || typeof id !== 'string') {
            console.log('Invalid prompt ID:', id);
            return NextResponse.json({ message: 'Invalid prompt ID' }, { status: 400 });
        }

        console.log('Attempting to delete prompt with ID:', id);
        // Attempt to delete the prompt
        const deletedPrompt = await prisma.promptSettings.delete({
            where: {  id: Number(id) },
        });

        if (!deletedPrompt) {
            console.log('Prompt not found for ID:', id);
            return NextResponse.json({ message: 'Prompt not found' }, { status: 404 });
        }

        console.log('Prompt deleted successfully:', deletedPrompt);
        return NextResponse.json({ message: 'Prompt deleted successfully' });
    } catch (error : any) {
        console.error('Error deleting prompt:', error);
        console.error('Error stack:', error.stack);

        // Check if the error is due to the prompt not being found
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Prompt not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Error deleting prompt', error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    const data = await request.json();

    try {
        const updatedPrompt = await prisma.promptSettings.update({
            where: { id: Number(id) },
            data: {
                title: data.title,
                prompt: data.prompt,
                temperature: data.temperature,
                topP: data.topP,
                presencePenalty: data.presencePenalty,
                frequencyPenalty: data.frequencyPenalty,
                maxTokens: data.maxTokens,
            },
        });

        return NextResponse.json(updatedPrompt);
    } catch (error) {
        console.error('Error updating prompt settings:', error);
        return NextResponse.json(
            { message: 'Failed to update prompt settings' },
            { status: 500 }
        );
    }
}