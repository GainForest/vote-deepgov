
import React from 'react';
import { Candidate } from '@/utils/localStorageManager';
import VotesHeader from '@/components/voting/VotesHeader';
import CandidateCard from '@/components/voting/CandidateCard';
import VoteActions from '@/components/voting/VoteActions';
import { useVoting } from '@/hooks/useVoting';

interface VoteDistributionProps {
  candidates: Candidate[];
}

const VoteDistribution: React.FC<VoteDistributionProps> = ({ candidates }) => {
  const {
    userData,
    isUpdating,
    isSaving,
    isAnyVoteCast,
    handleVoteChange,
    handleSliderChange,
    resetAllVotes,
    handleSubmitVotes
  } = useVoting();

  if (!userData) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <VotesHeader 
        votesRemaining={userData.votesRemaining} 
        totalVotes={userData.totalVotes} 
      />
      
      <div className="space-y-6">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            votes={userData.votes[candidate.id] || 0}
            totalVotes={userData.totalVotes}
            votesRemaining={userData.votesRemaining}
            isUpdating={isUpdating}
            isSaving={isSaving}
            onVoteChange={handleVoteChange}
            onSliderChange={handleSliderChange}
          />
        ))}
      </div>
      
      <VoteActions
        isSaving={isSaving}
        isAnyVoteCast={isAnyVoteCast}
        onResetVotes={resetAllVotes}
        onSubmitVotes={handleSubmitVotes}
      />
    </div>
  );
};

export default VoteDistribution;
