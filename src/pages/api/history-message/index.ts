import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { chatId, page = '1', limit = '5' } = req.query;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    try {
      const chat = await prisma.chatHistoryNEW.findUnique({
        where: { id: chatId as string },
        select: { messages: true },
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      let messages: any[] = [];
      if (chat.messages) {
        if (typeof chat.messages === 'string') {
          try {
            messages = JSON.parse(chat.messages);
          } catch (parseError) {
            console.error('Error parsing messages:', parseError);
            return res.status(500).json({ error: 'Failed to parse messages', message: String(parseError) });
          }
        } else if (Array.isArray(chat.messages)) {
          messages = chat.messages;
        } else {
          return res.status(500).json({ error: 'Invalid messages format' });
        }
      }

      if (!Array.isArray(messages)) {
        return res.status(500).json({ error: 'Invalid messages format' });
      }

      const startIndex = (pageNumber - 1) * limitNumber;
      const endIndex = startIndex + limitNumber;
      const paginatedMessages = messages.slice(startIndex, endIndex);

      res.status(200).json(paginatedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages', message: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}