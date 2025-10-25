'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreatePollRequest } from '@/lib/api';

const pollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  option1: z.string().min(1, 'Option 1 is required').max(100, 'Option must be less than 100 characters'),
  option2: z.string().min(1, 'Option 2 is required').max(100, 'Option must be less than 100 characters'),
  option3: z.string().max(100, 'Option must be less than 100 characters').optional(),
  option4: z.string().max(100, 'Option must be less than 100 characters').optional(),
});

type PollFormData = z.infer<typeof pollSchema>;

interface PollFormProps {
  onSubmit: (data: CreatePollRequest) => Promise<void>;
}

export function PollForm({ onSubmit }: PollFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
  });

  const onFormSubmit = async (data: PollFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Create a poll and let people vote on it in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Poll Title *
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="What's your poll about?"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Add more context to your poll..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Poll Options</h3>
            
            {/* Option 1 */}
            <div className="space-y-2">
              <label htmlFor="option1" className="text-sm font-medium">
                Option 1 *
              </label>
              <Input
                id="option1"
                {...register('option1')}
                placeholder="First option"
                className={errors.option1 ? 'border-red-500' : ''}
              />
              {errors.option1 && (
                <p className="text-sm text-red-500">{errors.option1.message}</p>
              )}
            </div>

            {/* Option 2 */}
            <div className="space-y-2">
              <label htmlFor="option2" className="text-sm font-medium">
                Option 2 *
              </label>
              <Input
                id="option2"
                {...register('option2')}
                placeholder="Second option"
                className={errors.option2 ? 'border-red-500' : ''}
              />
              {errors.option2 && (
                <p className="text-sm text-red-500">{errors.option2.message}</p>
              )}
            </div>

            {/* Option 3 */}
            <div className="space-y-2">
              <label htmlFor="option3" className="text-sm font-medium">
                Option 3 (optional)
              </label>
              <Input
                id="option3"
                {...register('option3')}
                placeholder="Third option"
                className={errors.option3 ? 'border-red-500' : ''}
              />
              {errors.option3 && (
                <p className="text-sm text-red-500">{errors.option3.message}</p>
              )}
            </div>

            {/* Option 4 */}
            <div className="space-y-2">
              <label htmlFor="option4" className="text-sm font-medium">
                Option 4 (optional)
              </label>
              <Input
                id="option4"
                {...register('option4')}
                placeholder="Fourth option"
                className={errors.option4 ? 'border-red-500' : ''}
              />
              {errors.option4 && (
                <p className="text-sm text-red-500">{errors.option4.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
