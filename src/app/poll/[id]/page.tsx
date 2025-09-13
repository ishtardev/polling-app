"use client";
import { supabase } from '../../../lib/supabaseClient';
import { calculatePollResults } from '../../../lib/pollUtils';
import { castVote, getPollResults } from '../../../lib/pollApi';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

/**
 * PollPage Component - Interactive Poll Voting Interface
 * 
 * This component serves as the main voting interface for individual polls, handling
 * the complete voting lifecycle from option selection to result display. It's a
 * critical component that ensures voting integrity through duplicate prevention
 * mechanisms and provides real-time result visualization.
 * 
 * Context & Purpose:
 * - Accessed via dynamic route /poll/[id] where users can participate in polls
 * - Implements both authenticated (user-based) and anonymous (IP-based) voting
 * - Provides immediate feedback with real-time results after voting
 * - Includes sharing functionality via QR codes and direct links
 * 
 * Key Features:
 * - Duplicate vote prevention using user ID or IP address tracking
 * - Real-time result calculation and visualization with progress bars
 * - Responsive design with mobile-first approach
 * - Social sharing capabilities with QR code generation
 * - Error handling for network issues and invalid poll access
 * 
 * Security Considerations:
 * - Uses Supabase RLS policies to ensure data integrity
 * - IP-based tracking for anonymous users (privacy implications noted)
 * - Prevents multiple votes through database constraints and client-side checks
 * 
 * Dependencies:
 * - Connects to polls, options, and votes tables in Supabase
 * - Integrates with authentication system for user identification
 * - Uses external IP service for anonymous user tracking
 * 
 * Edge Cases Handled:
 * - Poll not found scenarios
 * - Network connectivity issues during voting
 * - Already voted prevention for both authenticated and anonymous users
 * - Loading states during data fetching
 * 
 * @returns JSX.Element - Complete poll voting interface with results
 */
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
    /**
     * fetchPoll - Initialize Poll Data and Voting Context
     * 
     * This function orchestrates the initial data loading for the poll page,
     * fetching all necessary information to render the voting interface and
     * current results. It's called once when the component mounts and whenever
     * the poll ID changes.
     * 
     * Data Loading Strategy:
     * - Fetches poll metadata (question, settings) from polls table
     * - Loads all available voting options from options table
     * - Retrieves current vote data for real-time result calculation
     * 
     * Error Handling:
     * - Gracefully handles network failures and invalid poll IDs
     * - Maintains loading state to prevent UI flickering
     * - Logs errors for debugging while maintaining user experience
     * 
     * Performance Considerations:
     * - Uses single() for poll data to ensure only one result
     * - Parallel data fetching could be optimized with Promise.all
     * - Results in multiple database queries that could be joined
     * 
     * Assumptions:
     * - Poll ID is valid UUID format from URL parameters
     * - Database relationships are properly maintained
     * - Network connectivity is available for initial load
     */
    async function fetchPoll() {
      try {
        // Fetch poll metadata - contains question and configuration
        const { data: pollData } = await supabase.from('polls').select('*').eq('id', id as string).single();
        setPoll(pollData);
        
        // Load all voting options for this poll
        const { data: optionsData } = await supabase.from('options').select('*').eq('poll_id', id as string);
        setOptions(optionsData || []);
        
        // Get current votes and calculate results using our API function
        const resultsResponse = await getPollResults(id as string);
        if (resultsResponse.success && resultsResponse.results) {
          setResults(resultsResponse.results);
        }
      } catch (error) {
        console.error('Error fetching poll:', error);
        // Note: Could implement user-facing error state here
      } finally {
        setLoading(false); // Always stop loading regardless of success/failure
      }
    }
    fetchPoll();
  }, [id]); // Re-run when poll ID changes (navigation between polls)

  /**
   * Handles the voting process for a poll.
   * This function performs validation and delegates to the castVote API function,
   * then updates the UI based on the result.
   * 
   * Voting Flow:
   * 1. Validates user has selected an option
   * 2. Uses the castVote function from pollApi to handle the vote process
   * 3. Updates UI state based on the result
   */
  async function handleVote() {
    // 1. Validate that an option is selected
    if (!selected) {
      setError('Please select an option to vote.');
      return;
    }
    setError('');

    try {
      // 2. Use the castVote function to handle the voting process
      const response = await castVote({
        pollId: id as string,
        optionId: selected
      });

      if (response.success) {
        // 3. Update UI to reflect the successful vote
        setVoted(true);
        
        // 4. Update the results if available
        if (response.results) {
          setResults(response.results);
        }
      } else {
        // Handle known error types
        setError(response.message || response.error?.message || 'Failed to cast your vote.');
      }
    } catch (error: any) {
      // Centralized error handling for unexpected errors
      console.error('An error occurred during the voting process:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Real-time Results Calculation
   * 
   * Transforms raw vote data into displayable statistics for each poll option.
   * Uses the optimized calculatePollResults function from pollUtils.ts to
   * improve performance.
   * 
   * Calculation Logic:
   * - Leverages a single-pass algorithm to count votes per option
   * - Maps each option to include vote count and percentage
   * - Handles division by zero for polls with no votes
   * - Rounds percentages to whole numbers for clean display
   * 
   * Performance Considerations:
   * - O(n+m) complexity where n=options, m=votes (improved from O(n*m))
   * - Single pass through votes array reduces computation significantly
   * - Scales efficiently for larger polls (many options and votes)
   * 
   * Data Integrity:
   * - Assumes all votes reference valid option IDs
   * - Gracefully handles empty results array
   * - Percentage calculation prevents NaN errors
   */
  const totalVotes = results.length;
  const optionCounts = calculatePollResults(options, results);

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
