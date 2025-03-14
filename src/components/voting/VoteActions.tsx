
import React from 'react';
import { RefreshCw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoteActionsProps {
  isSaving: boolean;
  isAnyVoteCast: boolean;
  onResetVotes: () => void;
  onSubmitVotes: () => void;
}

const VoteActions: React.FC<VoteActionsProps> = ({ 
  isSaving, 
  isAnyVoteCast, 
  onResetVotes, 
  onSubmitVotes 
}) => {
  return (
    <div className="pt-6 flex justify-between">
      <Button 
        variant="outline" 
        onClick={onResetVotes}
        className="gap-2"
        disabled={isSaving}
      >
        <RefreshCw className="h-4 w-4" />
        Reset All Votes
      </Button>
      
      <Button 
        onClick={onSubmitVotes}
        className="gap-2"
        disabled={isSaving || !isAnyVoteCast}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Submit Votes
          </>
        )}
      </Button>
    </div>
  );
};

export default VoteActions;
