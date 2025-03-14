
import React, { useState, useEffect } from 'react';
import { Plus, Minus, RefreshCw, Save, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Candidate, UserData, updateVotes, getUserData } from '@/utils/localStorageManager';
import { toast } from 'sonner';
import { saveVotes, fetchUserVotes } from '@/utils/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface VoteDistributionProps {
  candidates: Candidate[];
}

const VoteDistribution: React.FC<VoteDistributionProps> = ({ candidates }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSliderChange = (candidateId: string, value: number[]) => {
    if (!userData) return;
    
    setIsUpdating(true);
    
    // Update votes directly to slider value
    const newVoteValue = value[0];
    const updatedUserData = updateVotes(candidateId, newVoteValue);
    
    setUserData(updatedUserData);
    setIsUpdating(false);
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

  const handleSubmitVotes = async () => {
    if (!userData || !userData.id) {
      toast.error("User information missing. Please log in again.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { success, error } = await saveVotes(userData.id, userData.votes);
      
      if (error) {
        toast.error("Failed to submit votes. Please try again.");
        console.error("Error saving votes:", error);
        return;
      }
      
      if (success) {
        // Fetch the updated votes from the server to get the new updated_at timestamp
        const { votes, error: fetchError } = await fetchUserVotes(userData.id);
        
        if (!fetchError) {
          // Update local storage with the fresh data from the server
          const updatedUserData = { ...userData, votes };
          setUserData(updatedUserData);
          localStorage.setItem('voting_app_user_data', JSON.stringify(updatedUserData));
        }
        
        toast.success("Your votes have been submitted successfully!");
      }
    } catch (err) {
      console.error("Error submitting votes:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const openCandidateUrl = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
        <Progress 
          value={(userData.votesRemaining / userData.totalVotes) * 100} 
          className="h-2"
          color={userData.votesRemaining === 0 ? "bg-primary" : "bg-primary/70"}
        />
      </div>
      
      <div className="space-y-6">
        {candidates.map((candidate) => (
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
                        {userData.votes[candidate.id] || 0}
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
                      onClick={() => handleVoteChange(candidate.id, -1)}
                      disabled={isUpdating || (userData.votes[candidate.id] || 0) <= 0 || isSaving}
                      className="h-8 w-8 rounded-full bg-white shadow-sm"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <Slider
                        value={[userData.votes[candidate.id] || 0]}
                        max={userData.totalVotes}
                        step={1}
                        onValueChange={(value) => handleSliderChange(candidate.id, value)}
                        disabled={isUpdating || isSaving}
                        className="py-1"
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleVoteChange(candidate.id, 1)}
                      disabled={isUpdating || userData.votesRemaining <= 0 || isSaving}
                      className="h-8 w-8 rounded-full bg-white shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Progress 
                    value={((userData.votes[candidate.id] || 0) / userData.totalVotes) * 100} 
                    className="h-2 bg-primary/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="pt-6 flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetAllVotes}
          className="gap-2"
          disabled={isSaving}
        >
          <RefreshCw className="h-4 w-4" />
          Reset All Votes
        </Button>
        
        <Button 
          onClick={handleSubmitVotes}
          className="gap-2"
          disabled={isSaving || Object.values(userData.votes).every(v => v === 0)}
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
    </div>
  );
};

export default VoteDistribution;
