import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { messages, title } = req.body;

      const updatedChat = await prisma.chatHistoryNEW.update({
        where: { id: id as string },
        data: {
          messages,
          title,
        },
      });

      res.status(200).json(updatedChat);
    } catch (error) {
      console.error('Error updating chat history:', error);
      res.status(500).json({ error: 'Error updating chat history' });
    }
  } else if (req.method === 'GET') {
    try {
      const { id, userId } = req.query;
      const updatedChat = await prisma.chatHistoryNEW.findMany({
        where: {
          id: id as string,
          userId: userId as string
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json(updatedChat);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ error: 'Error fetching chat history' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.chatHistoryNEW.delete({
        where: { id: id as string },
      });
      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ error: 'Error deleting chat' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}