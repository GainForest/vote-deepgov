
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, ChevronRight, Loader2, RefreshCw, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRandomAnimalName } from '@/utils/animalNames';
import { initializeUserData, importVotesFromSupabase } from '@/utils/localStorageManager';
import { toast } from 'sonner';
import { loginWithName, fetchUserVotes, checkNameExists } from '@/utils/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  pin: z.string().length(4, { message: "PIN must be exactly 4 digits" }).regex(/^\d+$/, { message: "PIN must contain only digits" }),
});

const NameGenerator: React.FC = () => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Create form for new profile
  const newProfileForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      pin: "",
    },
  });
  
  // Create form for existing profile
  const existingProfileForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      pin: "",
    },
  });

  // Generate a random name on first load
  useEffect(() => {
    generateRandomName();
  }, []);

  useEffect(() => {
    // When name changes in the state, update the form
    newProfileForm.setValue("name", name);
  }, [name, newProfileForm]);

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
    const newName = e.target.value;
    setName(newName);
    // Clear any previous error when user types
    if (loginError) {
      setLoginError(null);
    }
  };

  const onCreateProfileSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      // Login or register with Supabase
      const { user, error } = await loginWithName(values.name.trim(), values.pin, false);
      
      if (error) {
        toast.error('Error creating profile. Please try again.');
        console.error('Login error:', error);
        setIsLoggingIn(false);
        return;
      }
      
      if (!user) {
        toast.error('Unable to create profile. Please try again.');
        setIsLoggingIn(false);
        return;
      }
      
      // Initialize local user data
      const userData = initializeUserData(values.name.trim(), user.id);
      
      toast.success(`Welcome, ${values.name}!`);
      
      // Navigate to voting page
      navigate('/vote');
    } catch (err) {
      console.error('Error during profile creation:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onLoginSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      // Check if the name exists first for login attempts
      const nameExists = await checkNameExists(values.name.trim());
      
      if (!nameExists) {
        setLoginError(`Profile "${values.name.trim()}" doesn't exist. Please try another name or create a new profile.`);
        setIsLoggingIn(false);
        return;
      }
      
      // Login with Supabase
      const { user, error } = await loginWithName(values.name.trim(), values.pin, true);
      
      if (error) {
        if (error.message === 'NAME_NOT_FOUND') {
          setLoginError(`Profile "${values.name.trim()}" doesn't exist. Please try another name or create a new profile.`);
        } else if (error.message === 'INVALID_PIN') {
          setLoginError(`Incorrect PIN. Please try again.`);
        } else {
          toast.error('Error logging in. Please try again.');
          console.error('Login error:', error);
        }
        setIsLoggingIn(false);
        return;
      }
      
      if (!user) {
        toast.error('Unable to login. Please try again.');
        setIsLoggingIn(false);
        return;
      }
      
      // Initialize local user data
      const userData = initializeUserData(values.name.trim(), user.id);
      
      // Fetch existing votes if any
      const { votes, error: votesError } = await fetchUserVotes(user.id);
      
      if (!votesError && Object.keys(votes).length > 0) {
        // Import votes from Supabase to local storage
        importVotesFromSupabase(userData, votes);
        toast.success(`Welcome back, ${values.name}!`);
      } else {
        toast.success(`Welcome, ${values.name}!`);
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
          <Form {...newProfileForm}>
            <form onSubmit={newProfileForm.handleSubmit(onCreateProfileSubmit)} className="space-y-4">
              <FormField
                control={newProfileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Your unique name"
                          className="h-14 pr-12 text-lg transition-all duration-300"
                          disabled={isGenerating || isLoggingIn}
                          {...field}
                          value={name || field.value}
                          onChange={(e) => {
                            handleNameChange(e);
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={generateRandomName}
                        className="absolute right-2 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                        disabled={isGenerating || isLoggingIn}
                      >
                        <Shuffle className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newProfileForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-1.5">
                        <LockKeyhole className="h-4 w-4" />
                        Create a 4-digit PIN
                      </div>
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={4} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">You'll need this PIN to log in later.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg group mt-6"
                disabled={isGenerating || isLoggingIn || !newProfileForm.formState.isValid}
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
          </Form>
        </TabsContent>
        
        <TabsContent value="existing">
          <Form {...existingProfileForm}>
            <form onSubmit={existingProfileForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={existingProfileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your existing name"
                        className="h-14 text-lg"
                        disabled={isLoggingIn}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the exact name you used previously to access your profile.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={existingProfileForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-1.5">
                        <LockKeyhole className="h-4 w-4" />
                        Enter your PIN
                      </div>
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={4} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {loginError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg group mt-6"
                disabled={isLoggingIn || !existingProfileForm.formState.isValid}
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
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NameGenerator;
