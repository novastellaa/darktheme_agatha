import { EmailTemplate } from '@/components/email-template';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { firstName, to, subject } = req.body;

  const { data, error } = await resend.emails.send({
    from: 'AI RETAIL ADMIN <onboarding@resend.dev>',
    to: [to],
    subject: subject,
    react: EmailTemplate({ firstName: firstName }),
  });

  if (error) {
    return res.status(400).json(error);
  }

  res.status(200).json(data);
};

