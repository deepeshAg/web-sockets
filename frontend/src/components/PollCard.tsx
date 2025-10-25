'use client';

import { useState } from 'react';
import { Heart, BarChart3, Users, Trash2, RotateCcw, User, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Poll, VoteStats } from '@/lib/api';
import { VoteButton } from './VoteButton';
import { ConfirmDialog } from './ConfirmDialog';
import { VotersList } from './VotersList';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: number, option: number) => Promise<void>;
  onLikeUser: (likerUsername: string, likedUsername: string) => Promise<void>;
  onDelete?: (pollId: number) => Promise<void>;
  onResetVotes?: (pollId: number) => Promise<void>;
  currentUsername?: string;
}

export function PollCard({ poll, onVote, onLikeUser, onDelete, onResetVotes, currentUsername }: PollCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVoters, setShowVoters] = useState(false);

  const handleVote = async (option: number) => {
    setIsVoting(true);
    try {
      await onVote(poll.id, option);
    } finally {
      setIsVoting(false);
    }
  };

  const handleLikeUser = async () => {
    if (!currentUsername || !poll.creator_username || currentUsername === poll.creator_username) {
      return; // Can't like yourself or if no username
    }
    
    setIsLiking(true);
    try {
      await onLikeUser(currentUsername, poll.creator_username);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(poll.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetVotes = async () => {
    if (!onResetVotes) return;
    setIsResetting(true);
    try {
      await onResetVotes(poll.id);
    } finally {
      setIsResetting(false);
    }
  };

  const getTotalVotes = (votes: VoteStats) => {
    return votes.option1 + votes.option2 + votes.option3 + votes.option4;
  };

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const totalVotes = getTotalVotes(poll.votes);

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{poll.title}</CardTitle>
            {poll.description && (
              <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">{poll.description}</CardDescription>
            )}
            {poll.creator_username && (
              <div className="flex items-center mt-3 text-sm text-gray-500">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                  <User className="h-3 w-3 text-white" />
                </div>
                <span>Created by <span className="font-semibold text-gray-700">{poll.creator_username}</span></span>
              </div>
            )}
          </div>
    <div className="flex space-x-2">
        {/* View voters button - visible to all users */}
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVoters(!showVoters)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View voters"
        >
            <Eye className="h-4 w-4 text-gray-600" />
        </Button>
        
        {/* Admin buttons - only for poll creator */}
        {onDelete && currentUsername && poll.creator_username === currentUsername && (
            <>
                {onResetVotes && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetVotes}
                        disabled={isResetting}
                        className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Reset votes"
                    >
                        <RotateCcw className="h-4 w-4 text-orange-600" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete poll"
                >
                    <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
            </>
        )}
    </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vote Options - Stunning Style */}
        <div className="space-y-3">
          {[
            { key: 'option1', label: poll.option1, votes: poll.votes.option1 },
            { key: 'option2', label: poll.option2, votes: poll.votes.option2 },
            ...(poll.option3 ? [{ key: 'option3', label: poll.option3, votes: poll.votes.option3 }] : []),
            ...(poll.option4 ? [{ key: 'option4', label: poll.option4, votes: poll.votes.option4 }] : []),
          ].map((option, index) => {
            const percentage = getVotePercentage(option.votes, totalVotes);
            return (
              <div key={option.key} className="group">
                <div className="relative overflow-hidden rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 border border-gray-200/50">
                  <VoteButton
                    option={index + 1}
                    onVote={() => handleVote(index + 1)}
                    disabled={isVoting}
                    className="w-full justify-start p-4 text-left hover:bg-transparent text-sm sm:text-base"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-gray-600">
                    {option.votes} ({percentage}%)
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
                       style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">{totalVotes} votes</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <span>Live results</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Voters List - Show for all users */}
      {showVoters && (
        <div className="px-6 pb-6">
          <VotersList
            pollId={poll.id}
            currentUsername={currentUsername}
            pollCreator={poll.creator_username}
            onLikeUser={onLikeUser}
          />
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Poll"
        description={`Are you sure you want to delete "${poll.title}"? This action cannot be undone and will remove all votes and likes.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </Card>
  );
}
