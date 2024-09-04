import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { id } = req.query;
            const flow = await prisma.flow.findUnique({
                where: { id: String(id) },
            });
            if (flow) {
                res.status(200).json({
                    ...flow,
                    nodes: JSON.parse(flow.nodes),
                    edges: JSON.parse(flow.edges),
                });
            } else {
                res.status(404).json({ message: 'Flow not found' });
            }
        } catch (error) {
            console.error('Error loading flow:', error);
            res.status(500).json({ message: 'Error loading flow' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { id } = req.query;
            const { nodes, edges } = req.body;
            const updatedFlow = await prisma.flow.update({
                where: { id: String(id) },
                data: {
                    nodes: JSON.stringify(nodes),
                    edges: JSON.stringify(edges),
                },
            });
            res.status(200).json(updatedFlow);
        } catch (error) {
            console.error('Error updating flow:', error);
            res.status(500).json({ message: 'Error updating flow' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            await prisma.flow.delete({
                where: { id: String(id) },
            });
            res.status(200).json({ message: 'Flow deleted successfully' });
        } catch (error) {
            console.error('Error deleting flow:', error);
            res.status(500).json({ message: 'Error deleting flow' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);

    } 
}