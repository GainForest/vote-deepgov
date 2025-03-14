
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VoteDistribution from '@/components/VoteDistribution';
import { defaultCandidates, getUserData, clearUserData } from '@/utils/localStorageManager';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Vote = () => {
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
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
    if (userData.avatarUrl) {
      setAvatarUrl(userData.avatarUrl);
    }
  }, [navigate]);

  const handleLogout = () => {
    clearUserData();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-violet-50">
      <header className="py-4 px-6 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
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
      
      <main className="flex-1 flex flex-col p-6 md:p-8 max-w-3xl mx-auto w-full">
        <div className="w-full animate-fade-in">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2 animate-slide-up">
              STEP 2 OF 2
            </div>
            <h1 className="text-3xl font-semibold mb-4">Cast Your Votes</h1>
            
            {userName && (
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 mb-6">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={avatarUrl} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500">Voting as</p>
                  <p className="font-medium">{userName}</p>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              You have 100 total votes to distribute among the candidates.
              Drag the sliders or use the plus/minus buttons to allocate your votes.
            </p>
          </div>
          
          <VoteDistribution candidates={defaultCandidates} />
        </div>
      </main>
    </div>
  );
};

export default Vote;
