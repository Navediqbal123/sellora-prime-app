import React, { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

interface ReviewSectionProps {
  productId: string;
  sellerId: string;
}

const StarRating = ({ rating, onRate, interactive = false, size = 'md' }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md';
}) => {
  const [hover, setHover] = useState(0);
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= (hover || rating)
                ? 'fill-[hsl(var(--sellora-gold))] text-[hsl(var(--sellora-gold))]'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, sellerId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user names separately
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      let nameMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        (profiles || []).forEach((p: any) => {
          nameMap[p.id] = p.full_name || p.email?.split('@')[0] || 'User';
        });
      }

      const reviewsWithNames = (data || []).map(r => ({
        ...r,
        user_name: nameMap[r.user_id] || 'Anonymous',
      }));

      setReviews(reviewsWithNames);

      // Check if current user already reviewed
      if (user) {
        setHasReviewed(reviewsWithNames.some(r => r.user_id === user.id));
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please log in to leave a review', variant: 'destructive' });
      return;
    }
    if (rating === 0) {
      toast({ title: 'Rating Required', description: 'Please select a star rating', variant: 'destructive' });
      return;
    }
    if (user.id === sellerId) {
      toast({ title: 'Not Allowed', description: 'You cannot review your own product', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      });

      if (error) throw error;

      toast({ title: 'Review Submitted!', description: 'Thank you for your feedback' });
      setRating(0);
      setComment('');
      fetchReviews();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit review', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reviews & Ratings</h2>
          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={Math.round(Number(avgRating))} />
            <span className="text-lg font-semibold text-foreground">{avgRating}</span>
            <span className="text-muted-foreground text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
        </div>
      </div>

      {/* Add Review Form */}
      {user && !hasReviewed && user.id !== sellerId && (
        <div className="card-premium p-5 mb-8 space-y-4">
          <h3 className="font-semibold text-foreground">Write a Review</h3>
          <StarRating rating={rating} onRate={setRating} interactive size="md" />
          <Textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-secondary/50 border-border/50 min-h-[80px] resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="btn-glow"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {hasReviewed && (
        <p className="text-sm text-muted-foreground mb-6 italic">You've already reviewed this product.</p>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="card-premium p-5 transition-all duration-300 hover:border-primary/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{review.user_name}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(review.created_at)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-3 pl-12">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
