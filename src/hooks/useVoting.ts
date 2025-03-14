
import { useState, useEffect } from 'react';
import { UserData, getUserData, updateVotes } from '@/utils/localStorageManager';
import { saveVotes, fetchUserVotes } from '@/utils/supabaseClient';
import { toast } from 'sonner';

export const useVoting = () => {
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
    Object.keys(newUserData.votes).forEach(candidateId => {
      newUserData.votes[candidateId] = 0;
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

  // Check if any votes have been cast
  const isAnyVoteCast = userData ? Object.values(userData.votes).some(v => v > 0) : false;

  return {
    userData,
    isUpdating,
    isSaving,
    isAnyVoteCast,
    handleVoteChange,
    handleSliderChange,
    resetAllVotes,
    handleSubmitVotes
  };
};
