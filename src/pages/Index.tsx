
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  // Immediately redirect to the name page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/name');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold">Vote App</h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              WELCOME
            </div>
            <h1 className="text-4xl font-bold mb-3">Voting App</h1>
            <p className="text-gray-500 mb-6">
              You'll be redirected to create your profile in a moment...
            </p>
            
            <Button 
              onClick={() => navigate('/name')} 
              className="mt-4 animate-pulse"
            >
              Continue to Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
