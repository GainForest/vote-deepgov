
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRandomAnimalName } from '@/utils/animalNames';
import { initializeUserData } from '@/utils/localStorageManager';
import { toast } from 'sonner';

const NameGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    
    // Initialize user data with the selected name
    initializeUserData(name.trim());
    toast.success(`Welcome, ${name}!`);
    
    // Navigate to voting page
    navigate('/vote');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2 animate-slide-up">
          STEP 1 OF 2
        </div>
        <h1 className="text-3xl font-semibold mb-2">Choose Your Name</h1>
        <p className="text-gray-500">We've selected an animal name for you, but feel free to change it.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter your name"
            className={`h-14 pr-12 text-lg transition-all duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
            disabled={isGenerating}
          />
          <button
            type="button"
            onClick={generateRandomName}
            className="absolute right-2 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
            disabled={isGenerating}
          >
            <Shuffle className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-14 text-lg group"
          disabled={isGenerating || !name.trim()}
        >
          Continue
          <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </div>
  );
};

export default NameGenerator;
