import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { defaultCandidates } from '@/utils/localStorageManager';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { toast } from 'sonner';

interface LeaderboardData {
  candidate_id: string;
  total_votes: number;
}

interface VoteHistoryData {
  candidate_id: string;
  votes: number;
  percentage: number;
  timestamp: string;
}

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [voteHistoryData, setVoteHistoryData] = useState<VoteHistoryData[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxVotes, setMaxVotes] = useState(100);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch initial leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Fetch current vote totals
        const { data: leaderboardResult, error: leaderboardError } = await supabase
          .from('candidate_leaderboard')
          .select('*')
          .order('total_votes', { ascending: false });

        if (leaderboardError) {
          console.error('Error fetching leaderboard data:', leaderboardError);
          toast.error('Failed to load leaderboard data');
          return;
        }

        console.log('Fetched leaderboard data:', leaderboardResult);
        
        if (leaderboardResult && leaderboardResult.length > 0) {
          setLeaderboardData(leaderboardResult);
          
          // Find the maximum vote count for scaling
          const highestVoteCount = Math.max(...leaderboardResult.map(item => Number(item.total_votes) || 0));
          setMaxVotes(highestVoteCount > 0 ? highestVoteCount : 100);
          
          // Fetch vote history for each candidate (last 24 hours)
          const allCandidateHistory = await Promise.all(
            defaultCandidates.map(async (candidate) => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              const { data: voteHistory, error: historyError } = await supabase
                .from('votes')
                .select('created_at, vote_count')
                .eq('candidate_id', candidate.id)
                .gte('created_at', yesterday.toISOString())
                .order('created_at', { ascending: true });
                
              if (historyError || !voteHistory) {
                console.error(`Error fetching history for ${candidate.id}:`, historyError);
                return [];
              }
              
              // Calculate running total and percentage
              let runningTotal = 0;
              const candidateData = voteHistory.map(vote => {
                runningTotal += Number(vote.vote_count) || 0;
                return {
                  candidate_id: candidate.id,
                  votes: runningTotal,
                  timestamp: new Date(vote.created_at).toISOString(),
                  percentage: 0 // Will calculate after getting all totals
                };
              });
              
              return candidateData;
            })
          );
          
          setVoteHistoryData(allCandidateHistory);
          
          // Prepare data for the line chart
          prepareChartData(allCandidateHistory, leaderboardResult);
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
        async (payload) => {
          console.log('Votes table changed, refreshing leaderboard', payload);
          
          // Refresh leaderboard data when votes change
          const { data: newLeaderboardData, error: refreshError } = await supabase
            .from('candidate_leaderboard')
            .select('*')
            .order('total_votes', { ascending: false });
          
          if (refreshError) {
            console.error('Error refreshing leaderboard data:', refreshError);
            return;
          }
          
          if (newLeaderboardData) {
            console.log('Updated leaderboard data:', newLeaderboardData);
            setLeaderboardData(newLeaderboardData);
            
            // Update max votes for scaling
            const highestVoteCount = Math.max(...newLeaderboardData.map(item => Number(item.total_votes) || 0));
            setMaxVotes(highestVoteCount > 0 ? highestVoteCount : 100);
            
            // Fetch updated vote history
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const newCandidateHistory = await Promise.all(
              defaultCandidates.map(async (candidate) => {
                const { data: voteHistory, error: historyError } = await supabase
                  .from('votes')
                  .select('created_at, vote_count')
                  .eq('candidate_id', candidate.id)
                  .gte('created_at', yesterday.toISOString())
                  .order('created_at', { ascending: true });
                  
                if (historyError || !voteHistory) {
                  return [];
                }
                
                // Calculate running total
                let runningTotal = 0;
                const candidateData = voteHistory.map(vote => {
                  runningTotal += Number(vote.vote_count) || 0;
                  return {
                    candidate_id: candidate.id,
                    votes: runningTotal,
                    timestamp: new Date(vote.created_at).toISOString(),
                    percentage: 0 // Will calculate after getting all totals
                  };
                });
                
                return candidateData;
              })
            );
            
            setVoteHistoryData(newCandidateHistory);
            prepareChartData(newCandidateHistory, newLeaderboardData);
            
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

  // Prepare data for the chart
  const prepareChartData = (historyData: VoteHistoryData[][], leaderboard: LeaderboardData[]) => {
    // Create a timeline of all timestamps from all candidates
    const allTimestamps = new Set<string>();
    historyData.forEach(candidateHistory => {
      candidateHistory.forEach(dataPoint => {
        allTimestamps.add(dataPoint.timestamp);
      });
    });
    
    // Sort timestamps chronologically
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    if (sortedTimestamps.length === 0) {
      // If no historical data, use current totals only
      const currentData = {
        timestamp: new Date().toLocaleTimeString(),
      };
      
      leaderboard.forEach(candidate => {
        const candidateInfo = defaultCandidates.find(c => c.id === candidate.candidate_id);
        const totalVotes = leaderboard.reduce((sum, c) => sum + Number(c.total_votes), 0);
        const percentage = totalVotes > 0 ? (Number(candidate.total_votes) / totalVotes) * 100 : 0;
        
        currentData[candidateInfo?.name || candidate.candidate_id] = parseFloat(percentage.toFixed(1));
      });
      
      setChartData([currentData]);
      return;
    }
    
    // Create data points for each timestamp
    const formattedChartData = sortedTimestamps.map(timestamp => {
      const dataPoint: any = {
        timestamp: new Date(timestamp).toLocaleTimeString(),
      };
      
      // For each timestamp, find the latest vote count for each candidate
      defaultCandidates.forEach(candidate => {
        const candidateHistory = historyData.find(history => 
          history.length > 0 && history[0].candidate_id === candidate.id
        ) || [];
        
        // Find the latest vote count before or at this timestamp
        const latestVote = candidateHistory
          .filter(point => point.timestamp <= timestamp)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        if (latestVote) {
          dataPoint[candidate.name] = latestVote.votes;
        } else {
          dataPoint[candidate.name] = 0;
        }
      });
      
      // Calculate percentage for each candidate at this timestamp
      const totalVotesAtTimestamp = Object.entries(dataPoint)
        .filter(([key]) => key !== 'timestamp')
        .reduce((sum, [_, votes]) => sum + (Number(votes) || 0), 0);
      
      // Convert vote counts to percentages
      Object.entries(dataPoint).forEach(([key, value]) => {
        if (key !== 'timestamp') {
          dataPoint[key] = totalVotesAtTimestamp > 0 
            ? parseFloat((Number(value) / totalVotesAtTimestamp * 100).toFixed(1)) 
            : 0;
        }
      });
      
      return dataPoint;
    });
    
    // Only keep points that show change (to reduce chart clutter)
    const filteredData = formattedChartData.filter((point, index) => {
      if (index === 0 || index === formattedChartData.length - 1) return true;
      
      const prev = formattedChartData[index - 1];
      let hasChange = false;
      
      // Check if any candidate percentage changed by at least 0.5%
      Object.keys(point).forEach(key => {
        if (key !== 'timestamp' && Math.abs(point[key] - prev[key]) >= 0.5) {
          hasChange = true;
        }
      });
      
      return hasChange;
    });
    
    setChartData(filteredData);
  };

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

  // Generate random colors for each candidate
  const getLineColor = (candidateId: string) => {
    const candidateColors: Record<string, string> = {
      'candidate-1': '#3b82f6', // blue
      'candidate-2': '#ef4444', // red
      'candidate-3': '#10b981', // green
      'candidate-4': '#f59e0b', // amber
      'candidate-5': '#8b5cf6', // purple
    };
    
    return candidateColors[candidateId] || '#6b7280'; // gray as fallback
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
              {/* Line Chart Visualization */}
              <Card className="mb-8 p-4 border-2 border-gray-200 bg-white shadow-md">
                <CardContent>
                  <h2 className="text-xl font-bold mb-6 text-center uppercase tracking-wide">Polling Trends Over Time (%)</h2>
                  <div className="h-64 w-full">
                    <ChartContainer
                      config={{
                        votes: { theme: { light: '#3b82f6', dark: '#60a5fa' } }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis 
                            dataKey="timestamp" 
                            label={{ value: 'Time', position: 'insideBottomRight', offset: 0 }}
                          />
                          <YAxis 
                            label={{ value: 'Support (%)', angle: -90, position: 'insideLeft' }}
                            domain={[0, 100]}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value}%`, '']}
                            labelFormatter={(label) => `Time: ${label}`}
                          />
                          <Legend />
                          {defaultCandidates.map((candidate) => (
                            <Line
                              key={candidate.id}
                              type="monotone"
                              dataKey={candidate.name}
                              stroke={getLineColor(candidate.id)}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
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
