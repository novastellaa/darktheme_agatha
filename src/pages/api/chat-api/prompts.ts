import { prisma } from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const prompt = await prisma.Promptlist.create({
        data: {
          userId: req.body.userId,
          username: req.body.username,
          title: req.body.title,
          prompt: req.body.prompt,
          model: req.body.model,
          temperature: req.body.temperature,
          topP: req.body.topP,
          maxTokens: req.body.maxTokens,
          presencePenalty: req.body.presencePenalty,
          frequencyPenalty: req.body.frequencyPenalty,
        },
      })
      res.status(200).json(prompt)
    } catch (error) {
      res.status(500).json({ error: 'Error creating prompt' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}