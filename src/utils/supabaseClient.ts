
import { supabase } from "@/integrations/supabase/client";

// Types for our tables
export type VoteRecord = {
  id?: string;
  user_id: string;
  candidate_id: string;
  vote_count: number;
  created_at?: string;
  updated_at?: string;
};

export type UserProfile = {
  id?: string;
  name: string;
  pin: string;
  created_at?: string;
};

// Check if a name exists in the database
export const checkNameExists = async (name: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('name', name);

  if (error) {
    console.error('Error checking if name exists:', error);
    return false;
  }

  return data && data.length > 0;
};

// Verify pin for a user
export const verifyPin = async (name: string, pin: string): Promise<{isValid: boolean; userId?: string}> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, pin')
    .eq('name', name)
    .single();

  if (error || !data) {
    console.error('Error verifying PIN:', error);
    return { isValid: false };
  }

  return { 
    isValid: data.pin === pin,
    userId: data.id
  };
};

// Auth functions
export const loginWithName = async (
  name: string, 
  pin: string, 
  isExistingOnly: boolean = false
): Promise<{user: any; error: any}> => {
  // Check if user exists with this name
  const { data: existingUser, error: searchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('name', name);

  // Handle search errors, but ignore "no rows returned" error
  if (searchError && searchError.code !== 'PGRST116') {
    console.error('Error searching for user:', searchError);
    return { user: null, error: searchError };
  }

  // If user exists, verify PIN
  if (existingUser && existingUser.length > 0) {
    if (existingUser[0].pin !== pin) {
      return { user: null, error: { message: 'INVALID_PIN' } };
    }
    return { user: existingUser[0], error: null };
  }

  // If we're only looking for existing profiles and none found, return error
  if (isExistingOnly) {
    return { user: null, error: { message: 'NAME_NOT_FOUND' } };
  }

  // Create a new user profile with the PIN
  const { data: newUser, error: createError } = await supabase
    .from('user_profiles')
    .insert([{ name, pin }])
    .select();

  if (createError) {
    console.error('Error creating user:', createError);
    return { user: null, error: createError };
  }

  // Return the first item from the array
  return { user: newUser && newUser.length > 0 ? newUser[0] : null, error: null };
};

// Vote functions
export const saveVotes = async (userId: string, votes: Record<string, number>): Promise<{success: boolean; error: any}> => {
  console.log("Starting saveVotes function with userId:", userId);
  console.log("Votes to save:", votes);
  
  try {
    // Delete existing votes for this user
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing votes:', deleteError);
      return { success: false, error: deleteError };
    }

    console.log("Successfully deleted existing votes");

    // Prepare votes for insertion
    const voteRecords: VoteRecord[] = Object.entries(votes)
      .filter(([_, count]) => count > 0) // Only save non-zero votes
      .map(([candidateId, count]) => ({
        user_id: userId,
        candidate_id: candidateId,
        vote_count: count
      }));

    console.log("Prepared vote records for insertion:", voteRecords);

    if (voteRecords.length === 0) {
      console.log("No non-zero votes to save");
      return { success: true, error: null };
    }

    // Insert new votes
    const { error: insertError } = await supabase
      .from('votes')
      .insert(voteRecords);

    if (insertError) {
      console.error('Error saving votes:', insertError);
      return { success: false, error: insertError };
    }

    console.log("Successfully inserted new votes");
    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error in saveVotes:", err);
    return { success: false, error: err };
  }
};

export const fetchUserVotes = async (userId: string): Promise<{votes: Record<string, number>; error: any}> => {
  try {
    console.log("Fetching votes for user:", userId);
    
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching votes:', error);
      return { votes: {}, error };
    }

    console.log("Fetched vote data:", data);
    
    // Format votes for our local state
    const formattedVotes: Record<string, number> = {};
    data.forEach((vote: VoteRecord) => {
      formattedVotes[vote.candidate_id] = vote.vote_count;
    });
    
    console.log("Formatted votes:", formattedVotes);
    return { votes: formattedVotes, error: null };
  } catch (err) {
    console.error("Unexpected error in fetchUserVotes:", err);
    return { votes: {}, error: err };
  }
};
