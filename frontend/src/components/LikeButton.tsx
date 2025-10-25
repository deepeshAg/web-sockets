'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LikeButtonProps {
  likesCount: number;
  onLike: () => void;
  disabled?: boolean;
}

export function LikeButton({ likesCount, onLike, disabled }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      onLike();
    }
  };

  return (
    <Button
      onClick={handleLike}
      disabled={disabled || isLiked}
      variant="ghost"
      size="sm"
      className="flex items-center space-x-1"
    >
      <Heart 
        className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
      />
      <span>{likesCount + (isLiked ? 1 : 0)}</span>
    </Button>
  );
}
