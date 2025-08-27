"use client";
import { supabase } from '../../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

export default function PollPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoll() {
      try {
        const { data: pollData } = await supabase.from('polls').select('*').eq('id', id).single();
        setPoll(pollData);
        const { data: optionsData } = await supabase.from('options').select('*').eq('poll_id', id);
        setOptions(optionsData || []);
        const { data: votesData } = await supabase.from('votes').select('*').eq('poll_id', id);
        setResults(votesData || []);
      } catch (error) {
        console.error('Error fetching poll:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPoll();
  }, [id]);

  async function handleVote() {
    if (!selected) return setError('Please select an option to vote.');
    
    setError('');
    
    // Prevent multiple votes: check if already voted by user or IP
    const user = (await supabase.auth.getUser()).data.user;
    let alreadyVoted = false;
    
    if (user) {
      const { data } = await supabase.from('votes').select('*').eq('poll_id', id).eq('voter_id', user.id);
      alreadyVoted = !!(data && data.length > 0);
    } else {
      const ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(j => j.ip);
      const { data } = await supabase.from('votes').select('*').eq('poll_id', id).eq('voter_ip', ip);
      alreadyVoted = !!(data && data.length > 0);
    }
    
    if (alreadyVoted) return setError('You have already voted on this poll.');
    
    // Cast vote
    const voteData: any = { poll_id: id, option_id: selected };
    if (user) voteData.voter_id = user.id;
    else voteData.voter_ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(j => j.ip);
    
    const { error: voteError } = await supabase.from('votes').insert(voteData);
    if (voteError) {
      setError(voteError.message);
    } else {
      setVoted(true);
      // Refresh results
      const { data: votesData } = await supabase.from('votes').select('*').eq('poll_id', id);
      setResults(votesData || []);
    }
  }

  // Results calculation
  const totalVotes = results.length;
  const optionCounts = options.map(opt => ({
    ...opt,
    count: results.filter(v => v.option_id === opt.id).length,
    percent: totalVotes ? Math.round((results.filter(v => v.option_id === opt.id).length / totalVotes) * 100) : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Poll Not Found</h1>
            <p className="text-gray-600">The poll you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-12 text-white">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold mb-4">{poll.question}</h1>
              <p className="text-emerald-100 text-lg">
                {voted ? 'Thank you for voting! Here are the results:' : 'Cast your vote and see the results instantly.'}
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {!voted ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose your option:</h3>
                      <div className="space-y-3">
                        {options.map(opt => (
                          <label 
                            key={opt.id} 
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                              selected === opt.id 
                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' 
                                : 'border-gray-200'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="option" 
                              value={opt.id} 
                              checked={selected === opt.id} 
                              onChange={() => setSelected(opt.id)}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <span className="ml-3 text-gray-900 font-medium">{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 font-medium">{error}</p>
                      </div>
                    )}

                    <button 
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      onClick={handleVote}
                      disabled={!selected}
                    >
                      {selected ? 'Cast Your Vote' : 'Select an Option'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Vote Submitted!</h3>
                      <p className="text-gray-600">Your vote has been recorded. Here are the current results:</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-900">Results ({totalVotes} total votes)</h4>
                      {optionCounts.map(opt => (
                        <div key={opt.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{opt.text}</span>
                            <span className="text-sm text-gray-600">{opt.count} votes ({opt.percent}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${opt.percent}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Share This Poll</h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <QRCodeSVG 
                        value={typeof window !== 'undefined' ? window.location.href : ''} 
                        size={160}
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3">Scan QR code to share</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Direct Link:</h5>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <input 
                        type="text" 
                        value={typeof window !== 'undefined' ? window.location.href : ''} 
                        readOnly
                        className="w-full text-sm text-gray-600 bg-transparent border-none focus:outline-none"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                      className="w-full mt-2 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Copy Link
                    </button>
                  </div>

                  {totalVotes > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Poll Stats</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Votes:</span>
                          <span className="font-medium">{totalVotes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Options:</span>
                          <span className="font-medium">{options.length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
