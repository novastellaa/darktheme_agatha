import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextApiRequest, NextApiResponse } from "next";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const flowRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 d"),
});

const chatRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 d"),
});

const aiphoneRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 d"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, type } = req.body;
    let ratelimit;

    switch (type) {
      case 'flow':
        ratelimit = flowRatelimit;
        break;
      case 'chat':
        ratelimit = chatRatelimit;
        break;
      case 'aiphone':
        ratelimit = aiphoneRatelimit;
        break;
      default:
        return res.status(400).json({ error: 'Invalid rate limit type' });
    }

    const { success } = await ratelimit.limit(`${type}-limit-${userId}`);
    
    res.status(200).json({ success });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}