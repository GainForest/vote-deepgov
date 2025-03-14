
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NameGenerator from '@/components/NameGenerator';

const Name: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-violet-50">
      <header className="py-4 px-6 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Home
          </Link>
          <h1 className="text-xl font-semibold">Create Your Profile</h1>
          <Link to="/leaderboard">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <BarChart3 className="h-4 w-4 mr-1" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-6 md:p-8 max-w-3xl mx-auto w-full">
        <div className="w-full animate-fade-in">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2 animate-slide-up">
              STEP 1 OF 2
            </div>
            <h1 className="text-3xl font-semibold mb-4">Set Up Your Profile</h1>
            <p className="text-gray-600">
              Create a profile or log in with an existing one to cast your votes.
            </p>
          </div>
          
          <NameGenerator />
        </div>
      </main>
    </div>
  );
};

export default Name;
