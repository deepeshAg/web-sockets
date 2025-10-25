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
    <Card className="w-full bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">{profile.username}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm font-semibold text-red-700">Likes Received</span>
            </div>
            <div className="text-3xl font-bold text-red-600">{profile.likes_received}</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">Polls Created</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{profile.polls_created}</div>
          </div>
        </div>

        {/* Total Votes */}
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-semibold text-green-700">Total Votes</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{profile.total_votes}</div>
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
