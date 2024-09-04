import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const now = Date.now();
   
    if (req.method === 'GET') {
        const { userId } = req.query;
    
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
    
        try {
            const chatHistory = await prisma.historyCalls.findMany({
                where: {
                    userId: userId as string,
                },
                orderBy: {
                    timestamp: 'desc',
                },
            });
    
            res.status(200).json(chatHistory);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            res.status(500).json({ error: 'Error fetching chat history' });
        }
    } else if (req.method === 'POST') {
            try {
                const { userId, username, phoneNumberId, phoneNumber, contact, twilioPhoneNumber, timestamp } = req.body;

            const chatHistory = await prisma.historyCalls.create({
              data: {
                userId,
                username,
                phoneNumberId,
                phoneNumber,
                contact,
                twilioPhoneNumber,
                timestamp: timestamp,
              },
            });
            res.status(200).json(chatHistory);
        } catch (error) {
            console.error('Error saving chat history:', error);
            if (error instanceof Error) {
                res.status(500).json({ error: 'Error saving chat history', details: error.message });
            } else {
                res.status(500).json({ error: 'Error saving chat history', details: 'An unknown error occurred' });
            }
        }
    } else {
        res.setHeader('Allow', ['POST' , 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}