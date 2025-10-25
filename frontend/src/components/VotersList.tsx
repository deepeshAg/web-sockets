'use client';

import { useState, useEffect } from 'react';
import { Heart, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient, PollVotersResponse, VoterInfo } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

interface VotersListProps {
  pollId: number;
  currentUsername?: string;
  pollCreator?: string;
  onLikeUser: (likerUsername: string, likedUsername: string) => Promise<void>;
}

export function VotersList({ pollId, currentUsername, pollCreator, onLikeUser }: VotersListProps) {
  const [voters, setVoters] = useState<PollVotersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likingUsers, setLikingUsers] = useState<Set<string>>(new Set());
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());

  // WebSocket connection for real-time like updates
  useWebSocket('ws://localhost:8000/ws', {
    onMessage: (message) => {
      if (message.type === 'like_toggle_update' && message.poll_id === pollId) {
        console.log('Received like toggle update for poll:', pollId, message.data);
        const { liked_username, is_liked } = message.data;
        
        setLikedUsers(prev => {
          const newSet = new Set(prev);
          if (is_liked) {
            newSet.add(liked_username);
          } else {
            newSet.delete(liked_username);
          }
          return newSet;
        });
      }
    }
  });

  useEffect(() => {
    fetchVoters();
    if (pollCreator) {
      fetchCreatorLikes();
    }
  }, [pollId, pollCreator]);

  const fetchVoters = async () => {
    try {
      setIsLoading(true);
      const votersData = await apiClient.getPollVoters(pollId);
      setVoters(votersData);
    } catch (err) {
      console.error('Error fetching voters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreatorLikes = async () => {
    if (!pollCreator) return;
    
    try {
      const likesData = await apiClient.getUserLikesGiven(pollCreator);
      setLikedUsers(new Set(likesData.liked_users));
    } catch (err) {
      console.error('Error fetching creator likes:', err);
    }
  };

  const handleLikeUser = async (likedUsername: string) => {
    if (!currentUsername || !likedUsername) return;
    
    setLikingUsers(prev => new Set(prev).add(likedUsername));
    try {
      const isCurrentlyLiked = likedUsers.has(likedUsername);
      
      if (isCurrentlyLiked) {
        // Unlike the user
        await apiClient.unlikeUser({
          liker_username: currentUsername,
          liked_username: likedUsername,
          poll_id: pollId
        });
      } else {
        // Like the user
        await apiClient.likeUser({
          liker_username: currentUsername,
          liked_username: likedUsername,
          poll_id: pollId
        });
      }
      
      // Refresh creator's likes to update the display
      await fetchCreatorLikes();
    } finally {
      setLikingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(likedUsername);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderVotersList = (voters: VoterInfo[], optionName: string) => {
    if (voters.length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic">
          No votes yet for {optionName}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {voters.map((voter, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{voter.username || 'Anonymous'}</span>
              {voter.username && likedUsers.has(voter.username) && (
                <Heart className="h-3 w-3 text-red-500" />
              )}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(voter.voted_at)}</span>
              </div>
            </div>
            {currentUsername && 
             pollCreator === currentUsername && 
             voter.username && 
             voter.username !== currentUsername && (
              <Button
                onClick={() => handleLikeUser(voter.username!)}
                disabled={likingUsers.has(voter.username!)}
                variant={likedUsers.has(voter.username!) ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-1"
              >
                <Heart className={`h-3 w-3 ${likedUsers.has(voter.username!) ? 'text-white' : ''}`} />
                <span>
                  {likingUsers.has(voter.username!) 
                    ? 'Updating...' 
                    : likedUsers.has(voter.username!) 
                      ? 'Unlike' 
                      : 'Like'
                  }
                </span>
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading voters...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!voters) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Failed to load voters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Voters</CardTitle>
        <p className="text-sm text-muted-foreground">
          {pollCreator === currentUsername 
            ? "Click 'Like' to show appreciation to voters. Click again to unlike." 
            : "See who voted and who the creator has liked"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Option 1</h4>
          {renderVotersList(voters.option1_voters, "Option 1")}
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Option 2</h4>
          {renderVotersList(voters.option2_voters, "Option 2")}
        </div>
        
        {voters.option3_voters.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Option 3</h4>
            {renderVotersList(voters.option3_voters, "Option 3")}
          </div>
        )}
        
        {voters.option4_voters.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Option 4</h4>
            {renderVotersList(voters.option4_voters, "Option 4")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
