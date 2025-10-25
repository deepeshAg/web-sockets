'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PollCard } from '@/components/PollCard';
import { PollForm } from '@/components/PollForm';
import { UsernameModal } from '@/components/UsernameModal';
import { UserProfile } from '@/components/UserProfile';
import { apiClient, Poll, CreatePollRequest } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import { Plus, Wifi, WifiOff, User, ArrowLeft } from 'lucide-react';

export default function UserPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket connection
  const { isConnected } = useWebSocket('ws://localhost:8000/ws', {
    onMessage: (message) => {
      console.log('WebSocket message received:', message);
      
      if (message.type === 'vote_update') {
        console.log('Processing vote update for poll:', message.poll_id, 'data:', message.data);
        setPolls(prevPolls => 
          prevPolls.map(poll => 
            poll.id === message.poll_id 
              ? { ...poll, votes: message.data.votes }
              : poll
          )
        );
      } else if (message.type === 'user_like_update') {
        console.log('Processing user like update:', message.data);
        // User like updates don't affect polls directly, but we could show notifications
        // For now, we'll just log it
      } else if (message.type === 'like_toggle_update') {
        console.log('Processing like toggle update:', message.data);
        // This will be handled by the VotersList component
        // We could trigger a refresh of the voters list here if needed
      } else if (message.type === 'poll_created') {
        console.log('Processing poll created event');
        // Refresh polls list
        fetchPolls();
      } else if (message.type === 'poll_deleted') {
        console.log('Processing poll deleted event for poll:', message.poll_id);
        // Remove the deleted poll from the list
        setPolls(prevPolls => prevPolls.filter(poll => poll.id !== message.poll_id));
      }
    },
    onOpen: () => {
      console.log('WebSocket connection opened');
    },
    onClose: () => {
      console.log('WebSocket connection closed');
    }
  });

  const fetchPolls = async () => {
    try {
      setIsLoading(true);
      const pollsData = await apiClient.getPolls();
      setPolls(pollsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch polls';
      setError(errorMessage);
      console.error('Error fetching polls:', err);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    // Check if username is valid
    if (!username || username.length < 2) {
      setShowUsernameModal(true);
    }
  }, [username]);

  const handleUsernameSubmit = (newUsername: string) => {
    // Navigate to the new username route
    router.push(`/${newUsername}`);
  };

  const handleCreatePoll = async (data: CreatePollRequest) => {
    try {
      await apiClient.createPoll({ ...data, creator_username: username });
      setShowCreateForm(false);
      await fetchPolls(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create poll';
      setError(errorMessage);
      console.error('Error creating poll:', err);
    }
  };

  const handleVote = async (pollId: number, option: number) => {
    try {
      await apiClient.voteOnPoll(pollId, { option, voter_username: username });
      // Optimistic update - the WebSocket will provide the real update
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
      setError(errorMessage);
      console.error('Error voting:', err);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleLikeUser = async (likerUsername: string, likedUsername: string) => {
    try {
      await apiClient.likeUser({ liker_username: likerUsername, liked_username: likedUsername });
      // Optimistic update - the WebSocket will provide the real update
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like user';
      setError(errorMessage);
      console.error('Error liking user:', err);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    try {
      await apiClient.deletePoll(pollId);
      // The WebSocket will handle removing the poll from the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete poll';
      setError(errorMessage);
      console.error('Error deleting poll:', err);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleResetVotes = async (pollId: number) => {
    try {
      await apiClient.resetPollVotes(pollId);
      // The WebSocket will handle updating the vote counts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset votes';
      setError(errorMessage);
      console.error('Error resetting votes:', err);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Real-time Polls</h1>
            </div>
            <p className="text-muted-foreground">Vote on polls and see results update in real-time</p>
            {username && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-1" />
                <span>Logged in as <span className="font-medium text-primary">{username}</span></span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Profile Button */}
            <Button
              variant="outline"
              onClick={() => setShowUserProfile(!showUserProfile)}
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">Offline</span>
                </>
              )}
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/80 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* User Profile */}
        {showUserProfile && (
          <div className="mb-8 flex justify-center">
            <UserProfile username={username} />
          </div>
        )}

        {/* Create Poll Form */}
        {showCreateForm && (
          <div className="mb-8">
            <PollForm onSubmit={handleCreatePoll} />
          </div>
        )}

        {/* Polls List */}
        {polls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No polls yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a poll!</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Poll
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
                onLikeUser={handleLikeUser}
                onDelete={handleDeletePoll}
                onResetVotes={handleResetVotes}
                currentUsername={username}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={handleUsernameSubmit}
      />
    </div>
  );
}
