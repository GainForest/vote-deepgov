
// Types
export interface UserData {
  id?: string;
  name: string;
  votes: Record<string, number>;
  totalVotes: number;
  votesRemaining: number;
}

export interface Candidate {
  id: string;
  name: string;
  profilePic?: string;
  url?: string;
}

// Default candidates
export const defaultCandidates: Candidate[] = [
  { 
    id: 'c1', 
    name: 'Candidate 1', 
    profilePic: 'https://i.pravatar.cc/150?img=1',
    url: 'https://example.com/candidate1'
  },
  { 
    id: 'c2', 
    name: 'Candidate 2', 
    profilePic: 'https://i.pravatar.cc/150?img=2',
    url: 'https://example.com/candidate2' 
  },
  { 
    id: 'c3', 
    name: 'Candidate 3', 
    profilePic: 'https://i.pravatar.cc/150?img=3',
    url: 'https://example.com/candidate3' 
  },
  { 
    id: 'c4', 
    name: 'Candidate 4', 
    profilePic: 'https://i.pravatar.cc/150?img=4',
    url: 'https://example.com/candidate4' 
  },
  { 
    id: 'c5', 
    name: 'Candidate 5', 
    profilePic: 'https://i.pravatar.cc/150?img=5',
    url: 'https://example.com/candidate5' 
  },
];

// Local storage keys
const STORAGE_KEY = 'voting_app_user_data';
const TOTAL_VOTES = 100;

// Initialize user data with defaults
export function initializeUserData(name: string, userId?: string): UserData {
  const initialVotes: Record<string, number> = {};
  
  // Initialize all candidates with zero votes
  defaultCandidates.forEach(candidate => {
    initialVotes[candidate.id] = 0;
  });

  const userData: UserData = {
    id: userId,
    name,
    votes: initialVotes,
    totalVotes: TOTAL_VOTES,
    votesRemaining: TOTAL_VOTES
  };

  saveUserData(userData);
  return userData;
}

// Save user data to local storage
export function saveUserData(userData: UserData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
}

// Get user data from local storage
export function getUserData(): UserData | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data) as UserData;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
}

// Update votes for a specific candidate
export function updateVotes(candidateId: string, voteCount: number): UserData | null {
  const userData = getUserData();
  if (!userData) return null;

  // Calculate current total allocated votes (excluding the candidate being updated)
  const currentTotalAllocated = Object.entries(userData.votes)
    .filter(([id]) => id !== candidateId)
    .reduce((sum, [_, votes]) => sum + votes, 0);

  // Check if the new vote count would exceed the total available votes
  if (currentTotalAllocated + voteCount > userData.totalVotes) {
    // Adjust the vote count to not exceed total
    voteCount = userData.totalVotes - currentTotalAllocated;
  }

  // Update votes for the specified candidate
  userData.votes[candidateId] = voteCount;

  // Recalculate remaining votes
  userData.votesRemaining = userData.totalVotes - Object.values(userData.votes).reduce((sum, votes) => sum + votes, 0);

  // Save updated data
  saveUserData(userData);
  return userData;
}

// Clear user data from local storage
export function clearUserData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Import votes from Supabase to local storage
export function importVotesFromSupabase(userData: UserData, votes: Record<string, number>): UserData {
  // Create a new user data object with the votes from Supabase
  const updatedUserData = { ...userData };
  
  // Initialize all votes to zero first
  defaultCandidates.forEach(candidate => {
    updatedUserData.votes[candidate.id] = 0;
  });
  
  // Update with actual votes
  Object.entries(votes).forEach(([candidateId, count]) => {
    updatedUserData.votes[candidateId] = count;
  });
  
  // Recalculate remaining votes
  updatedUserData.votesRemaining = updatedUserData.totalVotes - 
    Object.values(updatedUserData.votes).reduce((sum, votes) => sum + votes, 0);
  
  // Save to local storage
  saveUserData(updatedUserData);
  return updatedUserData;
}
