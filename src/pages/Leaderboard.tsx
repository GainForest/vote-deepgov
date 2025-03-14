import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trophy, Medal, Award, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { defaultCandidates } from '@/utils/localStorageManager';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
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
          
          const highestVoteCount = Math.max(...leaderboardResult.map(item => Number(item.total_votes) || 0));
          setMaxVotes(highestVoteCount > 0 ? highestVoteCount : 100);
          
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
              
              let runningTotal = 0;
              const candidateData = voteHistory.map(vote => {
                runningTotal += Number(vote.vote_count) || 0;
                return {
                  candidate_id: candidate.id,
                  votes: runningTotal,
                  timestamp: new Date(vote.created_at).toISOString(),
                  percentage: 0
                };
              });
              
              return candidateData;
            })
          );
          
          setVoteHistoryData(allCandidateHistory);
          
          prepareChartData(allCandidateHistory, leaderboardResult);
        }
      } catch (err) {
        console.error('Unexpected error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        async (payload) => {
          console.log('Votes table changed, refreshing leaderboard', payload);
          
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
            
            const highestVoteCount = Math.max(...newLeaderboardData.map(item => Number(item.total_votes) || 0));
            setMaxVotes(highestVoteCount > 0 ? highestVoteCount : 100);
            
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
                
                let runningTotal = 0;
                const candidateData = voteHistory.map(vote => {
                  runningTotal += Number(vote.vote_count) || 0;
                  return {
                    candidate_id: candidate.id,
                    votes: runningTotal,
                    timestamp: new Date(vote.created_at).toISOString(),
                    percentage: 0
                  };
                });
                
                return candidateData;
              })
            );
            
            setVoteHistoryData(newCandidateHistory);
            prepareChartData(newCandidateHistory, newLeaderboardData);
            
            toast('Leaderboard updated!', {
              description: 'New votes have been counted',
              duration: 3000
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const prepareChartData = (historyData: VoteHistoryData[][], leaderboard: LeaderboardData[]) => {
    const allTimestamps = new Set<string>();
    historyData.forEach(candidateHistory => {
      candidateHistory.forEach(dataPoint => {
        allTimestamps.add(dataPoint.timestamp);
      });
    });
    
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    if (sortedTimestamps.length === 0) {
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
    
    const formattedChartData = sortedTimestamps.map(timestamp => {
      const dataPoint: any = {
        timestamp: new Date(timestamp).toLocaleTimeString(),
      };
      
      defaultCandidates.forEach(candidate => {
        const candidateHistory = historyData.find(history => 
          history.length > 0 && history[0].candidate_id === candidate.id
        ) || [];
        
        const latestVote = candidateHistory
          .filter(point => point.timestamp <= timestamp)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        if (latestVote) {
          dataPoint[candidate.name] = latestVote.votes;
        } else {
          dataPoint[candidate.name] = 0;
        }
      });
      
      const totalVotesAtTimestamp = Object.entries(dataPoint)
        .filter(([key]) => key !== 'timestamp')
        .reduce((sum, [votes]) => sum + (Number(votes) || 0), 0);
      
      Object.entries(dataPoint).forEach(([key, value]) => {
        if (key !== 'timestamp') {
          dataPoint[key] = totalVotesAtTimestamp > 0 
            ? parseFloat((Number(value) / totalVotesAtTimestamp * 100).toFixed(1)) 
            : 0;
        }
      });
      
      return dataPoint;
    });
    
    const filteredData = formattedChartData.filter((point, index) => {
      if (index === 0 || index === formattedChartData.length - 1) return true;
      
      const prev = formattedChartData[index - 1];
      let hasChange = false;
      
      Object.keys(point).forEach(key => {
        if (key !== 'timestamp' && Math.abs(point[key] - prev[key]) >= 0.5) {
          hasChange = true;
        }
      });
      
      return hasChange;
    });
    
    setChartData(filteredData);
  };

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

  const getLineColor = (candidateId: string) => {
    const candidateColors: Record<string, string> = {
      'candidate-1': '#3b82f6',
      'candidate-2': '#ef4444',
      'candidate-3': '#10b981',
      'candidate-4': '#f59e0b',
      'candidate-5': '#8b5cf6',
    };
    
    return candidateColors[candidateId] || '#6b7280';
  };

  const openCandidateUrl = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
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
                        className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <CardContent className="p-0">
                          <div className="p-5 bg-gradient-to-r from-violet-50 to-purple-50">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex-shrink-0">
                                {getBadge(index)}
                              </div>
                              
                              <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                                <AvatarImage src={candidate?.profilePic} alt={candidate?.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {candidate?.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-lg">{candidate?.name || item.candidate_id}</h3>
                                  <span className="text-xl font-bold text-primary">
                                    {item.total_votes || 0}
                                  </span>
                                </div>
                                
                                {candidate?.url && (
                                  <button 
                                    onClick={() => openCandidateUrl(candidate.url)}
                                    className="flex items-center text-xs text-primary/80 hover:text-primary transition-colors mt-1"
                                  >
                                    <span>View profile</span>
                                    <ExternalLink className="ml-1 h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Progress 
                                value={votePercentage} 
                                className="h-2 bg-primary/20"
                              />
                              
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">
                                  Position #{index + 1}
                                </span>
                                <span className="text-xs text-gray-500">
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
