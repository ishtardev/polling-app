"use client";
import { supabase } from '../../lib/supabaseClient';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const router = useRouter();

  // Auto-save to localStorage
  const saveToLocalStorage = useCallback(() => {
    const draft = { question, options: options.filter(opt => opt.trim()) };
    localStorage.setItem('pollDraft', JSON.stringify(draft));
  }, [question, options]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('pollDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.question) setQuestion(draft.question);
        if (draft.options && draft.options.length > 0) {
          setOptions([...draft.options, ...Array(Math.max(0, 2 - draft.options.length)).fill('')]);
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save every 2 seconds when form has content
  useEffect(() => {
    if (question.trim() || options.some(opt => opt.trim())) {
      const timeoutId = setTimeout(saveToLocalStorage, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [question, options, saveToLocalStorage]);

  // Real-time validation
  const validateForm = useCallback(() => {
    const errors: {[key: string]: string} = {};
    
    // Question validation
    if (question.length < 10) {
      errors.question = 'Question must be at least 10 characters long';
    } else if (question.length > 200) {
      errors.question = 'Question must not exceed 200 characters';
    }
    
    // Options validation
    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      errors.options = 'At least 2 options are required';
    }
    
    // Duplicate options check
    const duplicates = filledOptions.filter((opt, index) => 
      filledOptions.indexOf(opt.toLowerCase().trim()) !== index
    );
    if (duplicates.length > 0) {
      errors.duplicates = 'Duplicate options are not allowed';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [question, options]);

  // Validate on form changes
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  // Clear draft after successful creation
  const clearDraft = () => {
    localStorage.removeItem('pollDraft');
  };

  // Reset form
  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    setError('');
    setValidationErrors({});
    clearDraft();
  };

  // Show toast notification
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  function handleOptionChange(idx: number, value: string) {
    setOptions(opts => opts.map((opt, i) => i === idx ? value : opt));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const filledOptions = options.filter(opt => opt.trim());
      
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert([{ question: question.trim() }])
        .select()
        .single();

      if (pollError) {
        throw new Error(`Failed to create poll: ${pollError.message}`);
      }

      const optionsToInsert = filledOptions.map(option => ({
        poll_id: pollData.id,
        text: option.trim()
      }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) {
        throw new Error(`Failed to create options: ${optionsError.message}`);
      }

      // Success! Clear draft and show notification
      clearDraft();
      showToastNotification('Poll created successfully!');
      
      // Navigate after a brief delay to show the toast
      setTimeout(() => {
        router.push(`/poll/${pollData.id}`);
      }, 1000);
      
    } catch (err: any) {
      console.error('Poll creation error:', err);
      setError(err.message || 'An unexpected error occurred while creating the poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            {toastMessage}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Poll</h2>
            <p className="text-gray-600">Ask a question and add options for people to vote on</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poll Question
                <span className="text-xs text-gray-500 ml-2">({question.length}/200 characters)</span>
              </label>
              <input 
                type="text" 
                placeholder="What would you like to ask?" 
                value={question} 
                onChange={e => setQuestion(e.target.value)} 
                className={`poll-input w-full p-4 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 !text-black font-medium ${
                  validationErrors.question 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                style={{ 
                  color: '#000000 !important', 
                  fontSize: '16px',
                  backgroundColor: '#ffffff',
                  caretColor: '#000000'
                }}
                maxLength={200}
                required 
              />
              {validationErrors.question && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.question}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
              <div className="space-y-3">
                {options.map((opt, idx) => {
                  const isDuplicate = options.filter(option => option.trim().toLowerCase() === opt.trim().toLowerCase()).length > 1 && opt.trim();
                  return (
                    <div key={idx} className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <input 
                        type="text" 
                        placeholder={`Option ${idx + 1}`} 
                        value={opt} 
                        onChange={e => handleOptionChange(idx, e.target.value)} 
                        className={`poll-input flex-1 p-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 !text-black font-medium ${
                          isDuplicate 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500'
                        }`}
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
                          disabled={isLoading}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {validationErrors.options && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.options}</p>
              )}
              {validationErrors.duplicates && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.duplicates}</p>
              )}
              
              <button 
                type="button" 
                className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                onClick={() => setOptions(opts => [...opts, ''])}
                disabled={isLoading}
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
                disabled={isLoading || Object.keys(validationErrors).length > 0}
                className={`flex-1 py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg font-semibold flex items-center justify-center ${
                  isLoading || Object.keys(validationErrors).length > 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Poll...
                  </>
                ) : (
                  'Create Poll'
                )}
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button 
                type="button" 
                onClick={() => router.push('/dashboard')}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
          
          {/* Auto-save indicator */}
          {(question.trim() || options.some(opt => opt.trim())) && (
            <div className="text-xs text-gray-500 text-center mt-4">
              ✓ Draft auto-saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
