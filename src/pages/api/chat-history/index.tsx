import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        try {
            const chatHistory = await prisma.chatHistory.findMany({
                where: {
                    userId: userId as string,
                },
                orderBy: {
                    timestamp: 'desc',
                },
            });

            res.status(200).json(chatHistory);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching chat history' });
        }
    } else if (req.method === 'POST') {
        try {
            const { id, userId, username, title, messages, timestamp, prompt } = req.body;

            const chatHistory = await prisma.chatHistory.create({
                data: {
                    id,
                    userId,
                    username,
                    title,
                    messages,
                    timestamp: new Date(timestamp),
                    prompt
                },
            });

            res.status(200).json(chatHistory);
        } catch (error) {
            res.status(500).json({ error: 'Error saving chat history' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}