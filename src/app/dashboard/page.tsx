"use client";
import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPolls() {
      const { data, error } = await supabase.from('polls').select('*');
      if (!error) {
        // Fetch vote counts for each poll
        const pollsWithStats = await Promise.all((data || []).map(async (poll) => {
          const { data: votes } = await supabase.from('votes').select('*').eq('poll_id', poll.id);
          const { data: options } = await supabase.from('options').select('*').eq('poll_id', poll.id);
          return {
            ...poll,
            voteCount: votes?.length || 0,
            optionCount: options?.length || 0
          };
        }));
        setPolls(pollsWithStats);
      }
      setLoading(false);
    }
    fetchPolls();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Your Polls</h2>
            <button 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              onClick={() => router.push('/create-poll')}
            >
              <span>➕</span>
              <span>Create Poll</span>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="mt-2 text-gray-600">Loading your polls...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No polls yet</h3>
              <p className="text-gray-500 mb-4">Create your first poll to get started!</p>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition duration-200"
                onClick={() => router.push('/create-poll')}
              >
                Create Your First Poll
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map(poll => (
                <div key={poll.id} className="bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-6 transition duration-200 hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{poll.question}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <span>🗳️</span>
                          <span>{poll.voteCount} votes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📝</span>
                          <span>{poll.optionCount} options</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                        onClick={() => router.push(`/edit-poll/${poll.id}`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                        onClick={() => router.push(`/poll/${poll.id}`)}
                      >
                        View
                      </button>
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                        onClick={async () => {
                          if (confirm('Delete this poll? This action cannot be undone.')) {
                            await supabase.from('polls').delete().eq('id', poll.id);
                            setPolls(polls => polls.filter(p => p.id !== poll.id));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
