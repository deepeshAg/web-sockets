'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsernameModal } from '@/components/UsernameModal';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [showUsernameModal, setShowUsernameModal] = useState(true);

  const handleUsernameSubmit = (username: string) => {
    // Navigate to the username route
    router.push(`/${username}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to Polls!</h1>
        <p className="text-muted-foreground mb-8">Choose a username to start voting and creating polls</p>
      </div>
      
      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={handleUsernameSubmit}
      />
    </div>
  );
}