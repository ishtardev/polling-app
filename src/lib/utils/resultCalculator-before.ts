// Original results calculation code
export function calculateResults(options: any[], votes: any[]) {
  const totalVotes = votes.length;
  const optionCounts = options.map(opt => ({
    ...opt,
    count: votes.filter(v => v.option_id === opt.id).length,
    percent: totalVotes ? Math.round((votes.filter(v => v.option_id === opt.id).length / totalVotes) * 100) : 0
  }));
  
  return optionCounts;
}
