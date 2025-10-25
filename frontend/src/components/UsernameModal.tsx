'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Smile } from 'lucide-react';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: (username: string) => void;
}

export function UsernameModal({ isOpen, onClose }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    
    if (username.trim().length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    
    onClose(username.trim());
  };

  const getRandomUsername = () => {
    const adjectives = ['Happy', 'Cool', 'Smart', 'Funny', 'Kind', 'Bright', 'Swift', 'Bold'];
    const nouns = ['Tiger', 'Eagle', 'Fox', 'Wolf', 'Bear', 'Lion', 'Hawk', 'Falcon'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 99) + 1;
    return `${adj}${noun}${num}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Polls!</CardTitle>
          <CardDescription>
            Choose a username to start voting and creating polls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="flex space-x-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your username"
                  className={error ? 'border-destructive' : ''}
                  maxLength={20}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUsername(getRandomUsername())}
                  className="px-3"
                  title="Generate random username"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Your username will be visible to other users when you vote or create polls
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
