import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { username, offset, limit } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'username is required' });
    }

    try {
      const chatHistory = await prisma.chatHistoryNEW.findMany({
        where: {
          username: username as string,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: parseInt(offset as string) || 0,
        take: parseInt(limit as string) || 10,
      });

      res.status(200).json(chatHistory);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ error: 'Error fetching chat history' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, username, title, messages, prompt, model, temperature, topP, presencePenalty, frequencyPenalty, maxTokens, titlePrompt, titleChat } = req.body;

      const chatHistory = await prisma.chatHistoryNEW.create({
        data: {
          userId,
          username,
          messages,
          prompt,
          model,
          temperature,
          topP,
          presencePenalty,
          frequencyPenalty,
          maxTokens,
          titlePrompt,
          titleChat,
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