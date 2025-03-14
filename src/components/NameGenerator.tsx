
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRandomAnimalName } from '@/utils/animalNames';
import CreateProfileForm from './name-generator/CreateProfileForm';
import LoginForm from './name-generator/LoginForm';

const NameGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Generate a random name on first load
  useEffect(() => {
    generateRandomName();
  }, []);

  const generateRandomName = () => {
    const animalName = getRandomAnimalName();
    setName(animalName);
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
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
          <CreateProfileForm 
            initialName={name} 
            onNameChange={handleNameChange} 
            isLoggingIn={isLoggingIn} 
          />
        </TabsContent>
        
        <TabsContent value="existing">
          <LoginForm 
            isLoggingIn={isLoggingIn}
            setIsLoggingIn={setIsLoggingIn}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NameGenerator;
