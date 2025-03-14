
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRandomAnimalName } from '@/utils/animalNames';
import { initializeUserData, importVotesFromSupabase } from '@/utils/localStorageManager';
import { toast } from 'sonner';
import { loginWithName, fetchUserVotes, checkNameExists } from '@/utils/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NameGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Generate a random name on first load
  useEffect(() => {
    generateRandomName();
  }, []);

  const generateRandomName = () => {
    setIsGenerating(true);
    
    // Slight delay to show animation
    setTimeout(() => {
      const animalName = getRandomAnimalName();
      setName(animalName);
      setIsGenerating(false);
    }, 400);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    // Clear any previous error when user types
    if (loginError) {
      setLoginError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      const isExistingProfile = e.currentTarget.getAttribute('data-tab') === 'existing';
      
      if (isExistingProfile) {
        // Check if the name exists first for login attempts
        const nameExists = await checkNameExists(name.trim());
        
        if (!nameExists) {
          setLoginError(`Profile "${name.trim()}" doesn't exist. Please try another name or create a new profile.`);
          setIsLoggingIn(false);
          return;
        }
      }
      
      // Login or register with Supabase
      const { user, error } = await loginWithName(name.trim(), isExistingProfile);
      
      if (error) {
        if (error.message === 'NAME_NOT_FOUND' && isExistingProfile) {
          setLoginError(`Profile "${name.trim()}" doesn't exist. Please try another name or create a new profile.`);
        } else {
          toast.error('Error logging in. Please try again.');
          console.error('Login error:', error);
        }
        setIsLoggingIn(false);
        return;
      }
      
      if (!user) {
        toast.error('Unable to create profile. Please try again.');
        setIsLoggingIn(false);
        return;
      }
      
      // Initialize local user data
      const userData = initializeUserData(name.trim(), user.id);
      
      // Fetch existing votes if any
      const { votes, error: votesError } = await fetchUserVotes(user.id);
      
      if (!votesError && Object.keys(votes).length > 0) {
        // Import votes from Supabase to local storage
        importVotesFromSupabase(userData, votes);
        toast.success(`Welcome back, ${name}!`);
      } else {
        toast.success(`Welcome, ${name}!`);
      }
      
      // Navigate to voting page
      navigate('/vote');
    } catch (err) {
      console.error('Error during login:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2 animate-slide-up">
          STEP 1 OF 2
        </div>
        <h1 className="text-3xl font-semibold mb-2">Choose Your Name</h1>
        <p className="text-gray-500">Create a new profile or login with an existing name.</p>
      </div>
      
      <Tabs defaultValue="new" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="new">New Profile</TabsTrigger>
          <TabsTrigger value="existing">Existing Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <form onSubmit={handleSubmit} data-tab="new" className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Your unique name"
                className={`h-14 pr-12 text-lg transition-all duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
                disabled={isGenerating || isLoggingIn}
              />
              <button
                type="button"
                onClick={generateRandomName}
                className="absolute right-2 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                disabled={isGenerating || isLoggingIn}
              >
                <Shuffle className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-lg group"
              disabled={isGenerating || isLoggingIn || !name.trim()}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating profile...
                </>
              ) : (
                <>
                  Create Profile
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="existing">
          <form onSubmit={handleSubmit} data-tab="existing" className="space-y-4">
            <div>
              <Input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your existing name"
                className="h-14 text-lg"
                disabled={isLoggingIn}
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the exact name you used previously to access your profile and votes.
              </p>
            </div>
            
            {loginError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-14 text-lg group"
              disabled={isLoggingIn || !name.trim()}
              variant="secondary"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <RefreshCw className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NameGenerator;
