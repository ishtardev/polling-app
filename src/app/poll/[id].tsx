import { supabase } from '../../lib/supabaseClient';
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

  useEffect(() => {
    async function fetchPoll() {
      const { data: pollData } = await supabase.from('polls').select('*').eq('id', id).single();
      setPoll(pollData);
      const { data: optionsData } = await supabase.from('options').select('*').eq('poll_id', id);
      setOptions(optionsData || []);
      const { data: votesData } = await supabase.from('votes').select('*').eq('poll_id', id);
      setResults(votesData || []);
    }
    fetchPoll();
  }, [id]);

  async function handleVote() {
    if (!selected) return setError('Select an option.');
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
    if (alreadyVoted) return setError('You have already voted.');
    // Cast vote
    const voteData: any = { poll_id: id, option_id: selected };
    if (user) voteData.voter_id = user.id;
    else voteData.voter_ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(j => j.ip);
    const { error: voteError } = await supabase.from('votes').insert(voteData);
    if (voteError) setError(voteError.message);
    else setVoted(true);
  }

  // Results calculation
  const totalVotes = results.length;
  const optionCounts = options.map(opt => ({
    ...opt,
    count: results.filter(v => v.option_id === opt.id).length,
    percent: totalVotes ? Math.round((results.filter(v => v.option_id === opt.id).length / totalVotes) * 100) : 0
  }));

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded">
      {poll && <>
        <h2 className="text-2xl mb-4">{poll.question}</h2>
        <div className="mb-4">
          <QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : ''} size={128} />
          <p className="text-sm mt-2">Share this poll: <a href={typeof window !== 'undefined' ? window.location.href : ''} className="text-blue-600 underline">{typeof window !== 'undefined' ? window.location.href : ''}</a></p>
        </div>
        {!voted ? (
          <>
            <div className="mb-4">
              {options.map(opt => (
                <label key={opt.id} className="block mb-2">
                  <input type="radio" name="option" value={opt.id} checked={selected === opt.id} onChange={() => setSelected(opt.id)} /> {opt.text}
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <button className="bg-blue-600 text-white p-2 rounded" onClick={handleVote}>Vote</button>
          </>
        ) : (
          <div className="mt-4">
            <h3 className="text-xl mb-2">Results</h3>
            <ul>
              {optionCounts.map(opt => (
                <li key={opt.id} className="mb-1">
                  {opt.text}: {opt.count} votes ({opt.percent}%)
                </li>
              ))}
            </ul>
          </div>
        )}
      </>}
    </div>
  );
}
