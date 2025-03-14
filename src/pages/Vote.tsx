
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VoteDistribution from '@/components/VoteDistribution';
import { defaultCandidates, getUserData, clearUserData } from '@/utils/localStorageManager';
import { toast } from 'sonner';

const Vote = () => {
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has profile, if not redirect to name page
    const userData = getUserData();
    if (!userData) {
      toast.error('Please create a profile first');
      navigate('/name');
      return;
    }
    
    setUserName(userData.name);
    if (userData.id) {
      setUserId(userData.id);
    }
  }, [navigate]);

  const handleLogout = () => {
    clearUserData();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/name" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-xl font-semibold ml-auto mr-auto">Vote Distribution</h1>
          {userName && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-6 bg-gray-50">
        <div className="max-w-xl w-full mx-auto animate-fade-in">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2 animate-slide-up">
              STEP 2 OF 2
            </div>
            <h1 className="text-3xl font-semibold mb-2">Cast Your Votes</h1>
            
            {userName && (
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span>Voting as <span className="font-medium">{userName}</span></span>
              </div>
            )}
            
            <p className="text-gray-500">
              You have 100 total votes to distribute among the candidates.
              Remember to submit your votes when you're done!
            </p>
          </div>
          
          <VoteDistribution candidates={defaultCandidates} />
        </div>
      </main>
    </div>
  );
};

export default Vote;
