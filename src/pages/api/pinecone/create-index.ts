import { NextApiRequest, NextApiResponse } from 'next';
import { Pinecone } from '@pinecone-database/pinecone';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { indexName, dimension, metric, spec } = req.body;

  if (!indexName || !dimension || !metric || !spec) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  try {
    await pinecone.createIndex({
      name: indexName,
      dimension,
      metric,
      spec,
    });

    res.status(200).json({ message: 'Index created successfully' });
  } catch (error: any) {
    console.error('Error creating Pinecone index:', error);
    res.status(500).json({ 
      message: 'Error creating Pinecone index', 
      error: error.message || 'Unknown error'
    });
  }
}