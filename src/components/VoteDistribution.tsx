
import React, { useState, useEffect } from 'react';
import { Plus, Minus, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Candidate, UserData, updateVotes, getUserData, clearUserData } from '@/utils/localStorageManager';
import { toast } from '@/components/ui/sonner';

interface VoteDistributionProps {
  candidates: Candidate[];
}

const VoteDistribution: React.FC<VoteDistributionProps> = ({ candidates }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const data = getUserData();
    setUserData(data);
  }, []);

  const handleVoteChange = (candidateId: string, change: number) => {
    if (!userData) return;
    
    setIsUpdating(true);
    
    // Calculate new vote value
    const currentVotes = userData.votes[candidateId] || 0;
    const newVoteValue = Math.max(0, currentVotes + change); // Ensure we don't go below 0
    
    // Update votes
    const updatedUserData = updateVotes(candidateId, newVoteValue);
    
    setUserData(updatedUserData);
    setIsUpdating(false);
    
    // Show notification if limit reached
    if (updatedUserData && updatedUserData.votesRemaining === 0) {
      toast("You've used all your votes!", {
        description: "You can adjust your votes anytime"
      });
    }
  };

  const resetAllVotes = () => {
    if (!userData) return;
    
    // Reset all votes to 0
    const newUserData = { ...userData };
    candidates.forEach(candidate => {
      newUserData.votes[candidate.id] = 0;
    });
    newUserData.votesRemaining = newUserData.totalVotes;
    
    // Save and update state
    setUserData(newUserData);
    localStorage.setItem('voting_app_user_data', JSON.stringify(newUserData));
    
    toast.success("Votes reset successfully");
  };

  if (!userData) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium text-gray-500">Votes Remaining</div>
          <div className="text-sm font-medium">{userData.votesRemaining} / {userData.totalVotes}</div>
        </div>
        <Progress value={(userData.votesRemaining / userData.totalVotes) * 100} className="h-2" />
      </div>
      
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id} 
            className="rounded-xl p-5 border border-gray-100 bg-white shadow-sm vote-card"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{candidate.name}</span>
              </div>
              <div className="text-lg font-semibold">
                {userData.votes[candidate.id] || 0}
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleVoteChange(candidate.id, -1)}
                disabled={isUpdating || (userData.votes[candidate.id] || 0) <= 0}
                className="h-9 w-9 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Progress 
                value={((userData.votes[candidate.id] || 0) / userData.totalVotes) * 100} 
                className="h-9 flex-1"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleVoteChange(candidate.id, 1)}
                disabled={isUpdating || userData.votesRemaining <= 0}
                className="h-9 w-9 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 flex justify-center">
        <Button 
          variant="outline" 
          onClick={resetAllVotes}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset All Votes
        </Button>
      </div>
    </div>
  );
};

export default VoteDistribution;
