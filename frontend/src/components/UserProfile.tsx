'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, User, BarChart3, MessageSquare } from 'lucide-react';
import { apiClient, UserProfile as UserProfileType } from '@/lib/api';

interface UserProfileProps {
  username: string;
}

export function UserProfile({ username }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await apiClient.getUserProfile(username);
      setProfile(profileData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>{profile.username}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Likes Received</span>
            </div>
            <div className="text-2xl font-bold text-primary">{profile.likes_received}</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Polls Created</span>
            </div>
            <div className="text-2xl font-bold text-primary">{profile.polls_created}</div>
          </div>
        </div>

        {/* Total Votes */}
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <BarChart3 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Total Votes</span>
          </div>
          <div className="text-2xl font-bold text-primary">{profile.total_votes}</div>
        </div>

        {/* Status Badge */}
        <div className="text-center">
          <Badge variant="secondary" className="text-sm">
            {profile.likes_received > 10 ? '🌟 Popular User' : 
             profile.polls_created > 5 ? '📝 Active Creator' : 
             profile.total_votes > 20 ? '🗳️ Active Voter' : 
             '👤 New User'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
