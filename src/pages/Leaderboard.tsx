
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { defaultCandidates } from '@/utils/localStorageManager';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface LeaderboardData {
  candidate_id: string;
  total_votes: number;
}

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxVotes, setMaxVotes] = useState(100);

  // Fetch initial leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const { data, error } = await supabase
          .from('candidate_leaderboard')
          .select('*')
          .order('total_votes', { ascending: false });

        if (error) {
          console.error('Error fetching leaderboard data:', error);
          toast.error('Failed to load leaderboard data');
          return;
        }

        console.log('Fetched leaderboard data:', data);
        
        if (data && data.length > 0) {
          setLeaderboardData(data);
          
          // Find the maximum vote count for scaling
          const highestVoteCount = Math.max(...data.map(item => Number(item.total_votes) || 0));
          setMaxVotes(highestVoteCount > 0 ? highestVoteCount : 100);
        }
      } catch (err) {
        console.error('Unexpected error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'votes'
        },
        async () => {
          console.log('Votes table changed, refreshing leaderboard');
          
          // Refresh leaderboard data when votes change
          const { data, error } = await supabase
            .from('candidate_leaderboard')
            .select('*')
            .order('total_votes', { ascending: false });
          
          if (error) {
            console.error('Error refreshing leaderboard data:', error);
            return;
          }
          
          if (data) {
            console.log('Updated leaderboard data:', data);
            setLeaderboardData(data);
            
            // Update max votes for scaling
            const highestVoteCount = Math.max(...data.map(item => Number(item.total_votes) || 0));
            setMaxVotes(highestVoteCount > 0 ? highestVoteCount : 100);
            
            // Show a toast notification for the update
            toast('Leaderboard updated!', {
              description: 'New votes have been counted',
              duration: 3000
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Prepare chart data
  const chartData = leaderboardData.map(item => {
    const candidate = defaultCandidates.find(c => c.id === item.candidate_id);
    return {
      name: candidate?.name || item.candidate_id,
      votes: Number(item.total_votes) || 0
    };
  });

  // Get badge based on position
  const getBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-red-50">
      <header className="py-4 px-6 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Home
          </Link>
          <h1 className="text-xl font-semibold ml-auto mr-auto">Election Results Live</h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div className="w-full animate-fade-in">
          <div className="mb-8">
            <div className="bg-blue-100 border-l-4 border-blue-600 px-4 py-2 mb-6 rounded-r">
              <h1 className="text-3xl font-bold mb-3 text-blue-900">OFFICIAL ELECTION RESULTS</h1>
              <p className="text-blue-800">
                Live polling data from all voting districts. Results update in real-time as votes are tallied.
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse-light text-primary font-medium">Counting votes...</div>
            </div>
          ) : (
            <>
              {/* Bar Chart Visualization */}
              <Card className="mb-8 p-4 border-2 border-gray-200 bg-white shadow-md">
                <CardContent>
                  <h2 className="text-xl font-bold mb-6 text-center uppercase tracking-wide">Popular Vote Distribution</h2>
                  <div className="h-64 w-full">
                    <ChartContainer
                      config={{
                        votes: { theme: { light: '#3b82f6', dark: '#60a5fa' } }
                      }}
                    >
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votes" fill="var(--color-votes)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Leaderboard Cards */}
              <div className="space-y-4">
                {leaderboardData.length === 0 ? (
                  <div className="text-center p-10 border border-dashed rounded-lg">
                    <p className="text-gray-500">No votes have been cast yet!</p>
                    <p className="text-sm text-gray-400 mt-2">Be the first to vote for your favorite candidates.</p>
                  </div>
                ) : (
                  leaderboardData.map((item, index) => {
                    const candidate = defaultCandidates.find(c => c.id === item.candidate_id);
                    const votePercentage = maxVotes ? (Number(item.total_votes) / maxVotes) * 100 : 0;
                    
                    return (
                      <Card 
                        key={item.candidate_id} 
                        className={`vote-card transform transition-all ${index === 0 ? 'border-blue-300 bg-blue-50/70' : index === 1 ? 'border-red-300 bg-red-50/70' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-10 flex justify-center">
                              {getBadge(index)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex gap-2 items-center">
                                  <span className="font-bold text-lg">
                                    {candidate?.name || item.candidate_id}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    #{index + 1}
                                  </span>
                                </div>
                                <span className="text-lg font-bold">
                                  {item.total_votes || 0}
                                </span>
                              </div>
                              
                              <Progress 
                                value={votePercentage} 
                                className={`h-3 ${index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-red-100' : ''}`}
                              />
                              
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-400">
                                  {votePercentage.toFixed(1)}% of total votes
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
