/**
 * Optimized results calculation function
 * 
 * This function calculates the vote counts and percentages for each poll option.
 * The optimized version uses a single pass through the votes array to build a count map,
 * rather than filtering the votes array multiple times per option.
 * 
 * @param options - Array of poll options
 * @param votes - Array of votes cast on the poll
 * @returns Array of options with count and percentage data
 */
export function calculateResults(options: any[], votes: any[]) {
  const totalVotes = votes.length;
  
  // Build a map of option_id -> vote count in a single pass
  const voteCounts = votes.reduce<Record<string, number>>((counts, vote) => {
    const optionId = vote.option_id;
    counts[optionId] = (counts[optionId] || 0) + 1;
    return counts;
  }, {});
  
  // Map the options with their vote counts and percentages
  const optionCounts = options.map(opt => {
    const count = voteCounts[opt.id] || 0;
    const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
    
    return {
      ...opt,
      count,
      percent
    };
  });
  
  return optionCounts;
}
