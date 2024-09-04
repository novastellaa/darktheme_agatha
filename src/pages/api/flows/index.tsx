import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { username } = req.query;
      
      if (!username) {
        return res.status(400).json({ message: 'Username is required' });
      }

      const flows = await prisma.flow.findMany({
        where: {
          userName: username as string,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.status(200).json(flows);
    } catch (error) {
      console.error('Error fetching flows:', error);
      res.status(500).json({ message: 'Error fetching flows' });
    }
  }  else if (req.method === 'POST') {
    try {
      const { name, nodes, edges, userId, userName } = req.body;
      const flow = await prisma.flow.create({
        data: {
          name,
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
          userId: userId as any,
          userName: userName as string,
        },
      });
      res.status(201).json(flow);
    } catch (error) {
      console.error('Error saving flow:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message, error: error.toString() });
      } else {
        res.status(500).json({ message: 'An unknown error occurred', error: String(error) });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}