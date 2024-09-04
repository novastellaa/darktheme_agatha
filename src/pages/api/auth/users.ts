import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;

  switch (method) {
    case 'GET':
      return handleGetUsers(req, res);
    case 'PUT':
      return handleUpdateUser(req, res);
    case 'DELETE':
      return handleDeleteUser(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [users, dailyCount, weeklyCount, totalCount] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo,
          },
        },
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      users,
      dailyCount,
      weeklyCount,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data', error: 'An unexpected error occurred' });
  }
}

async function handleUpdateUser(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const data = req.body;
  
    const userId = parseInt(id as string, 10);
  
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user', error: 'An unexpected error occurred' });
    }
  }
  
  async function handleDeleteUser(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
  
    const userId = parseInt(id as string, 10);
  
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
  
    try {
      await prisma.user.delete({
        where: { id: userId }
      });
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user', error: 'An unexpected error occurred' });
    }
  }