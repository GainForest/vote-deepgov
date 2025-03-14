
// Types
export interface UserData {
  name: string;
  votes: Record<string, number>;
  totalVotes: number;
  votesRemaining: number;
}

export interface Candidate {
  id: string;
  name: string;
}

// Default candidates
export const defaultCandidates: Candidate[] = [
  { id: 'c1', name: 'Candidate 1' },
  { id: 'c2', name: 'Candidate 2' },
  { id: 'c3', name: 'Candidate 3' },
  { id: 'c4', name: 'Candidate 4' },
  { id: 'c5', name: 'Candidate 5' },
];

// Local storage keys
const STORAGE_KEY = 'voting_app_user_data';
const TOTAL_VOTES = 100;

// Initialize user data with defaults
export function initializeUserData(name: string): UserData {
  const initialVotes: Record<string, number> = {};
  
  // Initialize all candidates with zero votes
  defaultCandidates.forEach(candidate => {
    initialVotes[candidate.id] = 0;
  });

  const userData: UserData = {
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
