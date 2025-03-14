
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initializeUserData, importVotesFromSupabase } from '@/utils/localStorageManager';
import { toast } from 'sonner';
import { loginWithName, fetchUserVotes, checkNameExists } from '@/utils/supabaseClient';
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

interface LoginFormProps {
  isLoggingIn: boolean;
  setIsLoggingIn: (value: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isLoggingIn, setIsLoggingIn }) => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Create form for existing profile
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      pin: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
          disabled={isLoggingIn || !form.formState.isValid}
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
  );
};

export default LoginForm;
