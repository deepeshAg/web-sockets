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

      // WebSocket connection for real-time updates
      useWebSocket('ws://localhost:8001/ws', {
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
          } else if (message.type === 'vote_update' && message.poll_id === pollId) {
            console.log('Received vote update for poll:', pollId, 'refreshing voters list');
            // Refresh voters list when votes change
            fetchVoters();
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
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-200/50 hover:bg-gray-100/80 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">{voter.username || 'Anonymous'}</span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(voter.voted_at)}</span>
                </div>
              </div>
              {voter.username && likedUsers.has(voter.username) && (
                <Heart className="h-4 w-4 text-red-500" />
              )}
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
                className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                  likedUsers.has(voter.username!) 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${likedUsers.has(voter.username!) ? 'text-white' : ''}`} />
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
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">Voters</CardTitle>
        <p className="text-sm text-gray-600">
          {pollCreator === currentUsername 
            ? "Tap ❤️ to appreciate voters" 
            : "See who voted and who the creator appreciated"}
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
