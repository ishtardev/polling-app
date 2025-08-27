import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditPoll() {
  const { id } = useParams();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchPoll() {
      const { data: poll } = await supabase.from('polls').select('*').eq('id', id).single();
      setQuestion(poll?.question || '');
      const { data: opts } = await supabase.from('options').select('*').eq('poll_id', id);
      setOptions(opts ? opts.map((o: any) => o.text) : []);
    }
    fetchPoll();
  }, [id]);

  function handleOptionChange(idx: number, value: string) {
    setOptions(opts => opts.map((opt, i) => i === idx ? value : opt));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim())) {
      setError('Question and all options are required.');
      return;
    }
    const { error: pollError } = await supabase.from('polls').update({ question }).eq('id', id);
    if (pollError) {
      setError(pollError.message);
      return;
    }
    // Update options: delete old, insert new
    await supabase.from('options').delete().eq('poll_id', id);
    const optionsData = options.map(text => ({ poll_id: id, text }));
    const { error: optionsError } = await supabase.from('options').insert(optionsData);
    if (optionsError) {
      setError(optionsError.message);
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-2xl mb-4">Edit Poll</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Poll question" value={question} onChange={e => setQuestion(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        {options.map((opt, idx) => (
          <input key={idx} type="text" placeholder={`Option ${idx + 1}`} value={opt} onChange={e => handleOptionChange(idx, e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        ))}
        <button type="button" className="mb-2 bg-gray-300 p-1 rounded" onClick={() => setOptions(opts => [...opts, ''])}>Add Option</button>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Save Changes</button>
      </form>
    </div>
  );
}
