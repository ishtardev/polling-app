/**
 * Function to calculate poll results with optimized performance
 * 
 * This function transforms raw vote data into statistics for each poll option.
 * The optimized version creates a vote count map in a single pass through the votes
 * array, rather than filtering multiple times.
 * 
 * @param options - Array of poll options
 * @param votes - Array of cast votes
 * @returns Array of options with vote counts and percentages
 */
export function calculatePollResults(options: any[], votes: any[]) {
  const totalVotes = votes.length;
  
  // Build a map of option_id -> vote count in a single pass (O(m) where m = number of votes)
  const voteCounts = votes.reduce<Record<string, number>>((counts, vote) => {
    const optionId = vote.option_id;
    counts[optionId] = (counts[optionId] || 0) + 1;
    return counts;
  }, {});
  
  // Map options with their vote counts and percentages (O(n) where n = number of options)
  const optionResults = options.map(option => {
    const count = voteCounts[option.id] || 0;
    const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
    
    return {
      ...option,
      count,
      percent
    };
  });
  
  return optionResults;
}
