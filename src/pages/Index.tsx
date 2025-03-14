
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Vote, BarChart3, ChevronRight } from 'lucide-react';
import { getUserData } from '@/utils/localStorageManager';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const handleVoteClick = () => {
    const userData = getUserData();
    if (!userData) {
      toast.info('Please create your profile before voting', {
        description: 'You need to set up your voting profile first',
        duration: 5000,
      });
      navigate('/name');
      return;
    }
    navigate('/vote');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-red-50">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center animate-fade-in">
          <div>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-white p-3 shadow-md">
                <Vote className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-600">
              DeepGov Vote
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Vote for the AI Engine.
            </p>
          </div>
          
          <div className="grid gap-4">
            <Button size="lg" className="w-full" onClick={handleVoteClick}>
              <Vote className="mr-2 h-5 w-5" />
              Cast Your Votes
              <ChevronRight className="ml-auto h-5 w-5" />
            </Button>
            
            <Link to="/leaderboard">
              <Button size="lg" variant="secondary" className="w-full">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Voting Results
                <ChevronRight className="ml-auto h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            A Deep Governance Voting Platform for the Future
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
