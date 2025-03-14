
import React from 'react';
import { Plus, Minus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Candidate } from '@/utils/localStorageManager';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface CandidateCardProps {
  candidate: Candidate;
  votes: number;
  totalVotes: number;
  votesRemaining: number;
  isUpdating: boolean;
  isSaving: boolean;
  onVoteChange: (candidateId: string, change: number) => void;
  onSliderChange: (candidateId: string, value: number[]) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, 
  votes, 
  totalVotes, 
  votesRemaining, 
  isUpdating,
  isSaving,
  onVoteChange, 
  onSliderChange 
}) => {
  const openCandidateUrl = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      key={candidate.id} 
      className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300"
    >
      <CardContent className="p-0">
        <div className="p-5 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src={candidate.profilePic} alt={candidate.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {candidate.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <span className="text-xl font-bold text-primary">
                  {votes || 0}
                </span>
              </div>
              
              {candidate.url && (
                <button 
                  onClick={() => openCandidateUrl(candidate.url)}
                  className="flex items-center text-xs text-primary/80 hover:text-primary transition-colors mt-1"
                >
                  <span>View profile</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onVoteChange(candidate.id, -1)}
                disabled={isUpdating || votes <= 0 || isSaving}
                className="h-8 w-8 rounded-full bg-white shadow-sm"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <Slider
                  value={[votes || 0]}
                  max={totalVotes}
                  step={1}
                  onValueChange={(value) => onSliderChange(candidate.id, value)}
                  disabled={isUpdating || isSaving}
                  className="py-1"
                />
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => onVoteChange(candidate.id, 1)}
                disabled={isUpdating || votesRemaining <= 0 || isSaving}
                className="h-8 w-8 rounded-full bg-white shadow-sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Progress 
              value={((votes || 0) / totalVotes) * 100} 
              className="h-2 bg-primary/20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
