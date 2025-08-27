"use client";
import { supabase } from '../../lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const router = useRouter();

  function handleOptionChange(idx: number, value: string) {
    setOptions(opts => opts.map((opt, i) => i === idx ? value : opt));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (options.some(opt => !opt.trim()) || !question.trim()) {
      setError('Question and all options are required.');
      return;
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError('You must be logged in to create a poll.');
      return;
    }
    const { data: poll, error: pollError } = await supabase.from('polls').insert({ question, creator_id: user.id }).select().single();
    if (pollError) {
      setError(pollError.message);
      return;
    }
    const optionsData = options.map(text => ({ poll_id: poll.id, text }));
    const { error: optionsError } = await supabase.from('options').insert(optionsData);
    if (optionsError) {
      setError(optionsError.message);
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Poll</h2>
            <p className="text-gray-600">Ask a question and add options for people to vote on</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poll Question</label>
              <input 
                type="text" 
                placeholder="What would you like to ask?" 
                value={question} 
                onChange={e => setQuestion(e.target.value)} 
                className="poll-input w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 !text-black font-medium" 
                style={{ 
                  color: '#000000 !important', 
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  caretColor: '#000000'
                }}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
              <div className="space-y-3">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {idx + 1}
                    </span>
                    <input 
                      type="text" 
                      placeholder={`Option ${idx + 1}`} 
                      value={opt} 
                      onChange={e => handleOptionChange(idx, e.target.value)} 
                      className="poll-input flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200 !text-black font-medium" 
                      style={{ 
                        color: '#000000 !important', 
                        fontSize: '16px',
                        backgroundColor: '#ffffff',
                        caretColor: '#000000'
                      }}
                      required 
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setOptions(opts => opts.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                onClick={() => setOptions(opts => [...opts, ''])}
              >
                <span>➕</span>
                <span>Add Option</span>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                Create Poll
              </button>
              <button 
                type="button" 
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
