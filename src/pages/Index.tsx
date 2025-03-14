
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserPlus, Vote, ChevronRight, BarChart3 } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-violet-50">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Voting App
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Cast your votes for your favorite candidates
            </p>
          </div>
          
          <div className="grid gap-4">
            <Link to="/name">
              <Button size="lg" className="w-full">
                <UserPlus className="mr-2 h-5 w-5" />
                Create Profile
                <ChevronRight className="ml-auto h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/vote">
              <Button size="lg" variant="secondary" className="w-full">
                <Vote className="mr-2 h-5 w-5" />
                Cast Your Votes
                <ChevronRight className="ml-auto h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className="w-full">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Leaderboard
                <ChevronRight className="ml-auto h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            A simple voting application with real-time updates
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
