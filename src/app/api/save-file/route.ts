import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { fileName, userId, file , userName } = await request.json();

        const savedFile = await prisma.file.create({
            data: {
                fileName,
                userId,
                file,
                created: new Date(),
                userName,
            },
        });

        return NextResponse.json({ message: 'File saved successfully', id: savedFile.id }, { status: 201 });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}