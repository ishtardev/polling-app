import { supabase } from './supabaseClient';
import { Database } from './database.types';
import { PollOption, PollResultItem, PollVote, calculatePollResults } from './pollUtils';

/**
 * Error class for vote-related errors
 */
export class VoteError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'VoteError';
  }
}

/**
 * Type for the response when casting a vote
 */
export interface CastVoteResponse {
  success: boolean;
  message?: string;
  error?: VoteError;
  results?: PollResultItem[];
}

/**
 * Type for the response when getting poll results
 */
export interface GetPollResultsResponse {
  success: boolean;
  results?: PollResultItem[];
  error?: VoteError;
}

/**
 * Type for vote data
 */
export interface VoteData {
  pollId: string;
  optionId: string;
  userId?: string;
}

/**
 * Cast a vote on an existing poll
 * 
 * This function handles the complete vote casting process including:
 * - User/IP identification
 * - Duplicate vote prevention
 * - Vote recording
 * - Result refreshing
 * 
 * @param voteData - Object containing poll ID, selected option ID, and optional user ID
 * @returns Promise resolving to an object with success status and optional results/error
 * 
 * @example
 * // Cast a vote as an authenticated user
 * const response = await castVote({
 *   pollId: '123e4567-e89b-12d3-a456-426614174000',
 *   optionId: '123e4567-e89b-12d3-a456-426614174001',
 *   userId: 'auth0|123456789' // Optional, will be fetched if not provided
 * });
 * 
 * if (response.success) {
 *   console.log('Vote recorded successfully!');
 *   console.log('Updated results:', response.results);
 * } else {
 *   console.error('Failed to vote:', response.error?.message);
 * }
 */
export async function castVote(voteData: VoteData): Promise<CastVoteResponse> {
  try {
    // 1. Determine the voter's identity (authenticated user or IP address)
    let voterIdentifier: { type: 'auth' | 'anon'; value: string };
    
    if (voteData.userId) {
      voterIdentifier = { type: 'auth', value: voteData.userId };
    } else {
      // Check if the user is authenticated through Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        voterIdentifier = { type: 'auth', value: user.id };
      } else {
        // For anonymous users, fetch their IP address
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          if (!response.ok) {
            throw new VoteError('Could not verify your network. Please try again.', 'NETWORK_ERROR');
          }
          
          const { ip } = await response.json();
          if (!ip) {
            throw new VoteError('Could not determine your IP address for voting.', 'IP_DETECTION_ERROR');
          }
          
          // Hash the IP address before storing it for privacy
          const hashedIp = await hashIPAddress(ip);
          voterIdentifier = { type: 'anon', value: hashedIp };
        } catch (error) {
          if (error instanceof VoteError) {
            throw error;
          }
          throw new VoteError('Failed to identify voter. Please try again.', 'VOTER_ID_ERROR');
        }
      }
    }
    
    // 2. Check if this voter has already voted on this poll
    const voteCheckQuery = supabase
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('poll_id', voteData.pollId);
    
    if (voterIdentifier.type === 'auth') {
      voteCheckQuery.eq('voter_id', voterIdentifier.value);
    } else {
      voteCheckQuery.eq('voter_hash', voterIdentifier.value);
    }
    
    const { count, error: checkError } = await voteCheckQuery;
    
    if (checkError) {
      throw new VoteError('Failed to check for existing vote: ' + checkError.message, 'DB_QUERY_ERROR');
    }
    
    if (count && count > 0) {
      return {
        success: false,
        message: 'You have already voted on this poll.',
        error: new VoteError('You have already voted on this poll.', 'DUPLICATE_VOTE')
      };
    }
    
    // 3. Prepare and insert the new vote
    const newVote = {
      poll_id: voteData.pollId,
      option_id: voteData.optionId,
      ...(voterIdentifier.type === 'auth'
        ? { voter_id: voterIdentifier.value }
        : { voter_hash: voterIdentifier.value })
    };
    
    // Using type assertion to work around type issues with the Supabase client
    const { error: voteError } = await supabase
      .from('votes')
      .insert(newVote as any);
    
    if (voteError) {
      throw new VoteError('Failed to record vote: ' + voteError.message, 'VOTE_INSERTION_ERROR');
    }
    
    // 4. Fetch the updated results
    const results = await getPollResults(voteData.pollId);
    
    if (!results.success) {
      return {
        success: true,
        message: 'Your vote was counted, but we failed to update the results.',
        error: results.error
      };
    }
    
    return {
      success: true,
      results: results.results
    };
  } catch (error) {
    if (error instanceof VoteError) {
      return {
        success: false,
        error
      };
    }
    
    return {
      success: false,
      error: new VoteError(
        error instanceof Error ? error.message : 'An unexpected error occurred while voting.',
        'UNKNOWN_ERROR'
      )
    };
  }
}

/**
 * Hash an IP address for privacy
 * 
 * @param ip - IP address to hash
 * @returns Promise resolving to hashed IP
 */
async function hashIPAddress(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = process.env.NEXT_PUBLIC_IP_SALT || '';
  const data = encoder.encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get results for a specific poll
 * 
 * This function fetches options and votes for a poll, then calculates
 * vote counts, percentages, and identifies the leading option(s).
 * 
 * @param pollId - ID of the poll to get results for
 * @returns Promise resolving to an object with success status and optional results/error
 * 
 * @example
 * // Get poll results
 * const response = await getPollResults('123e4567-e89b-12d3-a456-426614174000');
 * 
 * if (response.success) {
 *   console.log('Poll results:', response.results);
 *   
 *   // Find the leading option(s)
 *   const leaders = response.results.filter(option => option.isLeading);
 *   console.log('Leading options:', leaders);
 * } else {
 *   console.error('Failed to get results:', response.error?.message);
 * }
 */
export async function getPollResults(pollId: string): Promise<GetPollResultsResponse> {
  try {
    // 1. Fetch the poll options
    const { data: options, error: optionsError } = await supabase
      .from('options')
      .select('*')
      .eq('poll_id', pollId)
      .order('position', { ascending: true });
    
    if (optionsError) {
      throw new VoteError('Failed to fetch poll options: ' + optionsError.message, 'OPTIONS_FETCH_ERROR');
    }
    
    if (!options || options.length === 0) {
      throw new VoteError('No options found for this poll.', 'NO_OPTIONS_ERROR');
    }
    
    // 2. Fetch the votes
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('poll_id', pollId);
    
    if (votesError) {
      throw new VoteError('Failed to fetch votes: ' + votesError.message, 'VOTES_FETCH_ERROR');
    }
    
    // 3. Calculate the results using our utility function
    const results = calculatePollResults(options, votes || []);
    
    return {
      success: true,
      results
    };
  } catch (error) {
    if (error instanceof VoteError) {
      return {
        success: false,
        error
      };
    }
    
    return {
      success: false,
      error: new VoteError(
        error instanceof Error ? error.message : 'An unexpected error occurred while fetching results.',
        'UNKNOWN_ERROR'
      )
    };
  }
}