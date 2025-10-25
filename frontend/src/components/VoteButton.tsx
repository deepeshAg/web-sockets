'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface VoteButtonProps {
  option: number;
  onVote: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  className?: string;
  label: string; // Add label prop
}

export function VoteButton({ option, onVote, disabled, isSelected, className, label }: VoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    try {
      await onVote();
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Button
      onClick={handleVote}
      disabled={disabled || isVoting}
      variant="ghost"
      size="sm"
      className={`transition-all duration-200 text-left font-medium text-gray-800 hover:text-gray-900 ${
        className || ""
      }`}
    >
      {isVoting ? 'Voting...' : label}
    </Button>
  );
}
