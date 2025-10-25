'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${variant === 'destructive' ? 'text-red-500' : 'text-yellow-500'}`} />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-base">
            {description}
          </CardDescription>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
