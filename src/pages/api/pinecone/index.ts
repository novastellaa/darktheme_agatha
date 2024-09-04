import { NextApiRequest, NextApiResponse } from 'next';
import { Pinecone } from '@pinecone-database/pinecone';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });
      const indexes = await pc.listIndexes();
      res.status(200).json(indexes);
    } catch (error) {
      console.error('Error listing Pinecone indexes:', error);
      res.status(500).json({ error: 'Failed to list Pinecone indexes' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}