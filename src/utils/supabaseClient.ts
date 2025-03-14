
import { supabase } from "@/integrations/supabase/client";

// Types for our tables
export type VoteRecord = {
  id?: string;
  user_id: string;
  candidate_id: string;
  vote_count: number;
  created_at?: string;
};

export type UserProfile = {
  id?: string;
  name: string;
  created_at?: string;
};

// Auth functions
export const loginWithName = async (name: string): Promise<{user: any; error: any}> => {
  // Check if user exists with this name
  const { data: existingUser, error: searchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('name', name)
    .single();

  if (searchError && searchError.code !== 'PGNF') {
    console.error('Error searching for user:', searchError);
    return { user: null, error: searchError };
  }

  // If user exists, return user
  if (existingUser) {
    return { user: existingUser, error: null };
  }

  // Create a new user profile
  const { data: newUser, error: createError } = await supabase
    .from('user_profiles')
    .insert([{ name }])
    .select()
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    return { user: null, error: createError };
  }

  return { user: newUser, error: null };
};

// Vote functions
export const saveVotes = async (userId: string, votes: Record<string, number>): Promise<{success: boolean; error: any}> => {
  // Delete existing votes for this user
  const { error: deleteError } = await supabase
    .from('votes')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error deleting existing votes:', deleteError);
    return { success: false, error: deleteError };
  }

  // Prepare votes for insertion
  const voteRecords: VoteRecord[] = Object.entries(votes)
    .filter(([_, count]) => count > 0) // Only save non-zero votes
    .map(([candidateId, count]) => ({
      user_id: userId,
      candidate_id: candidateId,
      vote_count: count
    }));

  if (voteRecords.length === 0) {
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

  return { success: true, error: null };
};

export const fetchUserVotes = async (userId: string): Promise<{votes: Record<string, number>; error: any}> => {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching votes:', error);
    return { votes: {}, error };
  }

  // Format votes for our local state
  const formattedVotes: Record<string, number> = {};
  data.forEach((vote: VoteRecord) => {
    formattedVotes[vote.candidate_id] = vote.vote_count;
  });

  return { votes: formattedVotes, error: null };
};
