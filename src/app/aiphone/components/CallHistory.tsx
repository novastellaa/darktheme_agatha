'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Table } from 'lucide-react';
import { z } from 'zod';
import { Skeleton } from "@/components/ui/skeleton";

interface CallHistoryProps {
    refreshTrigger: number;
}

const CallHistoryItemSchema = z.object({
    username: z.string(),
    phoneNumberId: z.string(),
    phoneNumber: z.string(),
    timestamp: z.string(),
    twilioPhoneNumber: z.string(),
    contact: z.string().optional(),
    userId: z.string(),
});

const CallHistorySchema = z.array(CallHistoryItemSchema);

type CallHistoryItem = z.infer<typeof CallHistoryItemSchema>;

export default function CallHistory({ refreshTrigger }: CallHistoryProps) {
    const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCallHistory = async () => {
            if (user?.id) {
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/call-history?userId=${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        const validatedData = CallHistorySchema.safeParse(data);
                        if (validatedData.success) {
                            setCallHistory(validatedData.data);
                            setError(null);
                        } else {
                            console.error('Data validation error:', validatedData.error);
                            setError('Failed to validate call history data');
                        }
                    } else {
                        console.error('Failed to fetch call history');
                        setError('Failed to fetch call history');
                    }
                } catch (error) {
                    console.error('Error fetching call history:', error);
                    setError('Error fetching call history');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchCallHistory();
    }, [user, refreshTrigger]);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-4">
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                    ))}
                </div>
            ) : callHistory.length === 0 ? (
                <p>No call history available.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Phone Number</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Twilio Number</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {callHistory.map((call, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.phoneNumberId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.phoneNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(call.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.twilioPhoneNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.contact || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}