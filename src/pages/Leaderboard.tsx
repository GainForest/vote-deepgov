
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trophy, Medal, Award, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { defaultCandidates } from '@/utils/localStorageManager';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

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
    if (historyData.every(history => history.length === 0)) {
      const currentData = {
        timestamp: new Date().toLocaleTimeString(),
      };
      
      leaderboard.forEach(candidate => {
        const candidateInfo = defaultCandidates.find(c => c.id === candidate.candidate_id);
        if (candidateInfo) {
          currentData[candidateInfo.name] = Number(candidate.total_votes) || 0;
        }
      });
      
      setChartData([currentData]);
      return;
    }
    
    const allTimestamps = new Set<string>();
    historyData.forEach(candidateHistory => {
      candidateHistory.forEach(dataPoint => {
        allTimestamps.add(dataPoint.timestamp);
      });
    });
    
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
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
        
        dataPoint[candidate.name] = latestVote ? latestVote.votes : 0;
      });
      
      const totalVotesAtTimestamp = Object.entries(dataPoint)
        .filter(([key]) => key !== 'timestamp')
        .reduce((sum, [votes]) => sum + (Number(votes) || 0), 0);
      
      if (totalVotesAtTimestamp > 0) {
        Object.keys(dataPoint).forEach(key => {
          if (key !== 'timestamp') {
            dataPoint[key] = (Number(dataPoint[key]) / totalVotesAtTimestamp * 100).toFixed(1);
            dataPoint[key] = parseFloat(dataPoint[key]);
          }
        });
      }
      
      return dataPoint;
    });
    
    if (formattedChartData.length < 2) {
      if (formattedChartData.length === 1) {
        const secondPoint = { ...formattedChartData[0] };
        secondPoint.timestamp = new Date().toLocaleTimeString();
        formattedChartData.push(secondPoint);
      } else {
        const currentTime = new Date();
        
        const point1 = { timestamp: new Date(currentTime.getTime() - 3600000).toLocaleTimeString() };
        const point2 = { timestamp: currentTime.toLocaleTimeString() };
        
        defaultCandidates.forEach(candidate => {
          const votes = leaderboardData.find(c => c.candidate_id === candidate.id)?.total_votes || 0;
          point1[candidate.name] = 20;
          point2[candidate.name] = votes > 0 ? 20 : 0;
        });
        
        formattedChartData.push(point1, point2);
      }
    }
    
    console.log('Chart data prepared:', formattedChartData);
    setChartData(formattedChartData);
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
      'c1': '#3b82f6', // Blue
      'c2': '#ef4444', // Red
      'c3': '#10b981', // Green
      'c4': '#f59e0b', // Amber
      'c5': '#8b5cf6', // Purple
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
      
      <main className="flex-1 flex flex-col p-6 md:p-8 max-w-7xl mx-auto w-full">
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
              <ResizablePanelGroup 
                direction="horizontal" 
                className="min-h-[600px] rounded-lg border"
              >
                <ResizablePanel defaultSize={55} className="bg-white p-4">
                  <h2 className="text-xl font-bold mb-6 text-center uppercase tracking-wide border-b pb-3">
                    Polling Trends Over Time (%)
                  </h2>
                  <div className="h-[500px] w-full">
                    <ChartContainer
                      config={{
                        votes: { theme: { light: '#3b82f6', dark: '#60a5fa' } }
                      }}
                    >
                      <div style={{ width: '100%', height: '100%' }} className="recharts-responsive-container">
                        <LineChart 
                          width={500} 
                          height={400} 
                          data={chartData} 
                          margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis 
                            dataKey="timestamp" 
                            label={{ value: 'Time', position: 'insideBottomRight', offset: 0 }}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            label={{ value: 'Support (%)', angle: -90, position: 'insideLeft' }}
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`${value}%`, '']}
                            labelFormatter={(label) => `Time: ${label}`}
                            contentStyle={{ 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                              border: '1px solid #e2e8f0' 
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                          />
                          {defaultCandidates.map((candidate) => (
                            <Line
                              key={candidate.id}
                              type="monotone"
                              dataKey={candidate.name}
                              stroke={getLineColor(candidate.id)}
                              strokeWidth={3}
                              dot={{ r: 4, fill: getLineColor(candidate.id), strokeWidth: 0 }}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                              isAnimationActive={true}
                              animationDuration={1500}
                            />
                          ))}
                        </LineChart>
                      </div>
                    </ChartContainer>
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={45} className="bg-white p-4">
                  <h2 className="text-xl font-bold mb-6 text-center uppercase tracking-wide border-b pb-3">
                    Current Standings
                  </h2>
                  <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
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
                            className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <CardContent className="p-0">
                              <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="flex-shrink-0">
                                    {getBadge(index)}
                                  </div>
                                  
                                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={candidate?.profilePic} alt={candidate?.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                      {candidate?.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-semibold">{candidate?.name || item.candidate_id}</h3>
                                      <span className="text-lg font-bold" style={{ color: getLineColor(item.candidate_id) }}>
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
                                
                                <div className="space-y-1">
                                  <Progress 
                                    value={votePercentage} 
                                    className="h-2 bg-gray-100"
                                    style={{ 
                                      '--progress-background': 'transparent',
                                      '--progress-foreground': getLineColor(item.candidate_id) 
                                    } as React.CSSProperties}
                                  />
                                  
                                  <div className="flex justify-between">
                                    <span className="text-xs font-medium text-gray-500">
                                      Position #{index + 1}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500">
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
                </ResizablePanel>
              </ResizablePanelGroup>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
