import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 360 * 60 * 1000; // 5 minutes in milliseconds

export function InactivityHandler() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const resetTimer = () => setLastActivity(Date.now());

    // Add event listeners for user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    const checkInactivity = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        // Logout the user
        signOut();
      }
    }, 1000); // Check every second

    return () => {
      // Clean up event listeners and interval
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearInterval(checkInactivity);
    };
  }, [lastActivity, signOut, router]);

  return null; // This component doesn't render anything
}