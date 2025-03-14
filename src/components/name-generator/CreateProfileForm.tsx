
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, ChevronRight, Loader2, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRandomAnimalName } from '@/utils/animalNames';
import { initializeUserData } from '@/utils/localStorageManager';
import { toast } from 'sonner';
import { loginWithName } from '@/utils/supabaseClient';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAvatarUrl } from '@/utils/avatarUtils';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  pin: z.string().length(4, { message: "PIN must be exactly 4 digits" }).regex(/^\d+$/, { message: "PIN must contain only digits" }),
});

interface CreateProfileFormProps {
  initialName: string;
  onNameChange: (name: string) => void;
  isLoggingIn: boolean;
}

const CreateProfileForm: React.FC<CreateProfileFormProps> = ({ 
  initialName, 
  onNameChange, 
  isLoggingIn 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const navigate = useNavigate();
  
  // Create form for new profile
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName,
      pin: "",
    },
  });

  useEffect(() => {
    // When initialName changes, update the form and avatar
    form.setValue("name", initialName);
    setAvatarUrl(generateAvatarUrl(initialName));
  }, [initialName, form]);

  const generateRandomName = () => {
    setIsGenerating(true);
    
    // Slight delay to show animation
    setTimeout(() => {
      const animalName = getRandomAnimalName();
      onNameChange(animalName);
      setIsGenerating(false);
    }, 400);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    onNameChange(newName);
    setAvatarUrl(generateAvatarUrl(newName));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Login or register with Supabase
      const { user, error } = await loginWithName(values.name.trim(), values.pin, false);
      
      if (error) {
        toast.error('Error creating profile. Please try again.');
        console.error('Login error:', error);
        return;
      }
      
      if (!user) {
        toast.error('Unable to create profile. Please try again.');
        return;
      }
      
      // Initialize local user data with avatar URL
      initializeUserData(values.name.trim(), user.id, avatarUrl);
      
      toast.success(`Welcome, ${values.name}!`);
      
      // Navigate to voting page
      navigate('/vote');
    } catch (err) {
      console.error('Error during profile creation:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 border-2 border-white shadow-md mb-4">
            <AvatarImage src={avatarUrl} alt="Profile avatar" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initialName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm text-gray-500">Your randomly generated avatar</p>
        </div>
        
        <FormField
          control={form.control}
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
          control={form.control}
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
          disabled={isGenerating || isLoggingIn || !form.formState.isValid}
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
  );
};

export default CreateProfileForm;
