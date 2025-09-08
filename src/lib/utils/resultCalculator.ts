/**
 * calculateResults - Optimized Poll Results Calculation Engine
 * 
 * This function serves as the core analytics engine for the polling application,
 * efficiently calculating vote counts and percentages for poll options. It's designed
 * for high performance and is used throughout the application for real-time results
 * display, dashboard statistics, and poll analytics.
 * 
 * Context & Purpose:
 * - Central calculation engine for all poll result displays
 * - Used in poll viewing pages for real-time results
 * - Powers dashboard statistics and poll summaries
 * - Enables consistent result formatting across the application
 * 
 * Performance Optimization:
 * - Uses single-pass algorithm (O(n)) instead of nested loops (O(n*m))
 * - Builds vote count map in one iteration through votes array
 * - Avoids repeated array filtering operations per option
 * - Significantly faster for polls with many options or votes
 * 
 * Algorithm Efficiency:
 * - Time Complexity: O(n + m) where n = votes, m = options
 * - Space Complexity: O(m) for the vote counts map
 * - Previous implementation: O(n * m) time complexity
 * - Performance improvement scales with poll size
 * 
 * Data Processing:
 * - Handles missing vote data gracefully (defaults to 0)
 * - Calculates accurate percentages with proper rounding
 * - Maintains option order from input array
 * - Preserves all original option properties
 * 
 * Mathematical Accuracy:
 * - Uses Math.round() for percentage calculation
 * - Handles division by zero (no votes scenario)
 * - Ensures percentages are integers for clean display
 * - Could implement more sophisticated rounding strategies
 * 
 * Error Handling:
 * - Gracefully handles empty arrays (options or votes)
 * - Provides fallback values for missing data
 * - Maintains data structure integrity
 * - No error throwing for invalid input (defensive programming)
 * 
 * Usage Patterns:
 * - Called after vote casting for immediate result updates
 * - Used in dashboard for poll statistics display
 * - Integrated with real-time result visualization
 * - Powers poll analytics and reporting features
 * 
 * Data Structure Requirements:
 * - Options must have 'id' property for vote matching
 * - Votes must have 'option_id' property for aggregation
 * - Maintains referential integrity through ID relationships
 * - Flexible with additional properties (passed through)
 * 
 * Integration Points:
 * - Poll viewing components for result display
 * - Dashboard components for statistics
 * - Analytics utilities for reporting
 * - Real-time update systems
 * 
 * Future Enhancements:
 * - Support for weighted voting systems
 * - Advanced statistical calculations (median, mode)
 * - Time-based result analysis
 * - Demographic breakdown capabilities
 * - Caching for frequently accessed results
 * 
 * @param options - Array of poll option objects with id property
 * @param votes - Array of vote objects with option_id property
 * @returns Array of enriched options with count and percentage data
 */
export function calculateResults(options: any[], votes: any[]) {
  // Calculate total votes for percentage calculations
  // This is used as denominator for all percentage calculations
  const totalVotes = votes.length;
  
  /**
   * Optimization: Single-Pass Vote Counting
   * 
   * Instead of filtering the votes array for each option (O(n*m) complexity),
   * we build a hash map of vote counts in a single pass (O(n) complexity).
   * This dramatically improves performance for polls with many options or votes.
   * 
   * The reduce operation:
   * 1. Iterates through each vote exactly once
   * 2. Increments the count for the voted option
   * 3. Handles first votes for an option (|| 0 fallback)
   * 4. Builds complete vote count map efficiently
   */
  const voteCounts = votes.reduce<Record<string, number>>((counts, vote) => {
    const optionId = vote.option_id;
    counts[optionId] = (counts[optionId] || 0) + 1; // Increment count, default to 0 for first vote
    return counts;
  }, {});
  
  /**
   * Result Enrichment: Add Statistics to Options
   * 
   * Transform each option by adding calculated statistics:
   * - count: Number of votes received (from our optimized map)
   * - percent: Percentage of total votes (rounded to nearest integer)
   * 
   * Preserves all original option properties using spread operator.
   * Handles edge cases like zero votes and missing vote data gracefully.
   */
  const optionCounts = options.map(opt => {
    const count = voteCounts[opt.id] || 0; // Get count from map, default to 0 if no votes
    
    // Calculate percentage with division by zero protection
    // Math.round ensures clean integer percentages for display
    const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
    
    return {
      ...opt, // Preserve all original option properties
      count,  // Add vote count
      percent // Add percentage
    };
  });
  
  return optionCounts;
}
