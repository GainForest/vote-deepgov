
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface VotesHeaderProps {
  votesRemaining: number;
  totalVotes: number;
}

const VotesHeader: React.FC<VotesHeaderProps> = ({ votesRemaining, totalVotes }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-500">Votes Remaining</div>
        <div className="text-sm font-medium">{votesRemaining} / {totalVotes}</div>
      </div>
      <Progress 
        value={(votesRemaining / totalVotes) * 100} 
        className="h-2"
        color={votesRemaining === 0 ? "bg-primary" : "bg-primary/70"}
      />
    </div>
  );
};

export default VotesHeader;
