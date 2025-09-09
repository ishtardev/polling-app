import { Database } from './database.types';

/**
 * Type definitions for function parameters and return values
 */
export type PollOption = Database['public']['Tables']['options']['Row'];
export type PollVote = Database['public']['Tables']['votes']['Row'];

export interface PollResultItem extends PollOption {
  count: number;
  percent: number;
  isLeading: boolean;
}

/**
 * Function to calculate poll results with optimized performance
 * 
 * This function transforms raw vote data into statistics for each poll option.
 * The optimized version creates a vote count map in a single pass through the votes
 * array, rather than filtering multiple times.
 * 
 * @param options - Array of poll options
 * @param votes - Array of cast votes
 * @returns Array of options with vote counts, percentages and leading status
 */
export function calculatePollResults(options: PollOption[], votes: PollVote[]): PollResultItem[] {
  if (!options || !votes) {
    console.warn('calculatePollResults received undefined or null input');
    return [];
  }
  
  const totalVotes = votes.length;
  
  // Build a map of option_id -> vote count in a single pass (O(m) where m = number of votes)
  const voteCounts = votes.reduce<Record<string, number>>((counts, vote) => {
    const optionId = vote.option_id;
    counts[optionId] = (counts[optionId] || 0) + 1;
    return counts;
  }, {});
  
  // Find the maximum vote count to determine the leading option(s)
  let maxCount = 0;
  for (const optionId in voteCounts) {
    maxCount = Math.max(maxCount, voteCounts[optionId]);
  }
  
  // Map options with their vote counts, percentages and leading status
  const optionResults = options.map(option => {
    const count = voteCounts[option.id] || 0;
    const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
    const isLeading = count > 0 && count === maxCount;
    
    return {
      ...option,
      count,
      percent,
      isLeading
    };
  });
  
  return optionResults;
}

/**
 * Returns a human-readable summary of poll results
 * 
 * @param results - Processed poll results from calculatePollResults
 * @returns A string summarizing the poll results
 */
export function generatePollSummary(results: PollResultItem[]): string {
  if (!results || results.length === 0) {
    return "No votes have been cast yet.";
  }
  
  const totalVotes = results.reduce((sum, option) => sum + option.count, 0);
  const leadingOptions = results.filter(option => option.isLeading && option.count > 0);
  
  if (totalVotes === 0) {
    return "No votes have been cast yet.";
  }
  
  if (leadingOptions.length === 1) {
    const leader = leadingOptions[0];
    return `"${leader.text}" is leading with ${leader.percent}% (${leader.count} votes).`;
  } else if (leadingOptions.length > 1) {
    const tiedText = leadingOptions.map(option => `"${option.text}"`).join(" and ");
    return `There's a tie between ${tiedText} with ${leadingOptions[0].percent}% each.`;
  }
  
  return `${totalVotes} votes have been cast.`;
}
