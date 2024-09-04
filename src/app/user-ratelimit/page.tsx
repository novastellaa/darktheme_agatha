'use client';

import { useState, useEffect } from 'react';

interface RateLimitedUser {
  ip: string;
  timestamp: string;
}

export default function RateLimitedUsersPage() {
  const [users, setUsers] = useState<RateLimitedUser[]>([]);

  useEffect(() => {
    async function fetchRateLimitedUsers() {
      const response = await fetch('/api/rate-limited-users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    }

    fetchRateLimitedUsers();
  }, []);

  return (
    <div>
      <h1>Rate Limited Users</h1>
      <table>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.ip}>
              <td>{user.ip}</td>
              <td>{new Date(user.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}