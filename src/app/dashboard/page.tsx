"use client";
import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard Component - User Poll Management Interface
 * 
 * This component serves as the central hub for users to manage their created polls,
 * providing a comprehensive overview of all polls with statistics and management actions.
 * It's the primary interface for poll creators to monitor and control their content.
 * 
 * Context & Purpose:
 * - Accessible via /dashboard route for authenticated users
 * - Displays all polls created by the current user (when auth is implemented)
 * - Provides quick access to poll management actions (edit, view, delete)
 * - Shows real-time statistics for each poll (votes, options, creation date)
 * 
 * Key Features:
 * - Real-time poll statistics aggregation
 * - Inline poll management actions (edit, view, delete)
 * - Empty state handling for new users
 * - Loading states during data fetching
 * - Confirmation dialogs for destructive actions
 * - Quick poll creation access
 * 
 * Data Aggregation:
 * - Fetches polls from 'polls' table
 * - Calculates vote counts from 'votes' table
 * - Counts options from 'options' table
 * - Combines data for comprehensive poll overview
 * 
 * User Experience:
 * - Clean, card-based layout for easy scanning
 * - Color-coded action buttons for different operations
 * - Responsive design for various screen sizes
 * - Immediate feedback for user actions
 * 
 * Performance Considerations:
 * - Multiple database queries for statistics (could be optimized)
 * - Promise.all for parallel data fetching
 * - Client-side filtering for delete operations
 * - No pagination implemented (may be needed for large datasets)
 * 
 * Security Considerations:
 * - Currently shows all polls (needs user-specific filtering)
 * - Delete operations should verify ownership
 * - Relies on Supabase RLS policies for data access control
 * 
 * Error Handling:
 * - Graceful handling of network failures
 * - Silent error handling (could be improved with user feedback)
 * - Fallback values for missing data
 * 
 * Navigation Integration:
 * - Seamless routing to poll creation, editing, and viewing
 * - Maintains user context across navigation
 * 
 * Edge Cases Handled:
 * - Empty poll list for new users
 * - Loading states during data fetching
 * - Confirmation for destructive delete operations
 * - Missing vote or option data
 * 
 * Future Enhancements:
 * - User-specific poll filtering
 * - Pagination for large poll lists
 * - Bulk operations (delete multiple polls)
 * - Poll analytics and insights
 * - Search and filtering capabilities
 * 
 * @returns JSX.Element - Complete dashboard interface with poll management
 */
export default function Dashboard() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    /**
     * fetchPolls - Comprehensive Poll Data Aggregation
     * 
     * This function orchestrates the loading of all poll data along with
     * associated statistics. It performs multiple database queries to build
     * a complete picture of each poll's performance and characteristics.
     * 
     * Data Loading Strategy:
     * 1. Fetch all polls from the polls table
     * 2. For each poll, fetch vote counts and option counts in parallel
     * 3. Combine all data into enriched poll objects
     * 4. Update component state with aggregated data
     * 
     * Performance Optimization:
     * - Uses Promise.all for parallel vote/option fetching
     * - Could be further optimized with database joins or views
     * - Currently fetches all polls (pagination needed for scale)
     * 
     * Error Handling:
     * - Gracefully handles database errors
     * - Provides fallback values for missing data
     * - Continues loading even if individual poll stats fail
     * 
     * Security Considerations:
     * - Currently fetches all polls (needs user filtering)
     * - Should implement RLS policies for user-specific data
     * - Vote and option counts could be sensitive information
     * 
     * Data Integrity:
     * - Handles cases where votes or options might be missing
     * - Provides default values (0) for missing counts
     * - Maintains referential integrity through poll_id relationships
     * 
     * Future Improvements:
     * - Implement user-specific filtering
     * - Add caching for frequently accessed data
     * - Consider server-side aggregation for better performance
     * - Add real-time updates for live statistics
     */
    async function fetchPolls() {
      // Fetch base poll data
      const { data, error } = await supabase.from('polls').select('*');
      if (!error) {
        // Enrich each poll with statistics in parallel
        const pollsWithStats = await Promise.all((data || []).map(async (poll) => {
          // Fetch vote count for this poll
          const { data: votes } = await supabase.from('votes').select('*').eq('poll_id', poll.id);
          // Fetch option count for this poll
          const { data: options } = await supabase.from('options').select('*').eq('poll_id', poll.id);
          return {
            ...poll,
            voteCount: votes?.length || 0, // Default to 0 if no votes
            optionCount: options?.length || 0 // Default to 0 if no options
          };
        }));
        setPolls(pollsWithStats);
      }
      setLoading(false); // Always stop loading, even on error
    }
    fetchPolls();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Your Polls</h2>
            <button 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              onClick={() => router.push('/create-poll')}
            >
              <span>➕</span>
              <span>Create Poll</span>
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="mt-2 text-gray-600">Loading your polls...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No polls yet</h3>
              <p className="text-gray-500 mb-4">Create your first poll to get started!</p>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition duration-200"
                onClick={() => router.push('/create-poll')}
              >
                Create Your First Poll
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map(poll => (
                <div key={poll.id} className="bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-6 transition duration-200 hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{poll.question}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <span>🗳️</span>
                          <span>{poll.voteCount} votes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📝</span>
                          <span>{poll.optionCount} options</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>{new Date(poll.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                        onClick={() => router.push(`/edit-poll/${poll.id}`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                        onClick={() => router.push(`/poll/${poll.id}`)}
                      >
                        View
                      </button>
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                        onClick={async () => {
                          /**
                           * Poll Deletion Handler - Destructive Action with Confirmation
                           * 
                           * Implements safe poll deletion with user confirmation and optimistic
                           * UI updates. This is a critical operation that permanently removes
                           * poll data and all associated votes and options.
                           * 
                           * Safety Measures:
                           * - Requires explicit user confirmation via browser confirm dialog
                           * - Provides clear warning about irreversible action
                           * - Could be enhanced with custom modal for better UX
                           * 
                           * Deletion Process:
                           * 1. Show confirmation dialog to user
                           * 2. If confirmed, delete poll from database
                           * 3. Update local state to remove poll from UI
                           * 4. Cascade deletion handled by database constraints
                           * 
                           * Data Integrity:
                           * - Database foreign key constraints ensure cascade deletion
                           * - Associated votes and options are automatically removed
                           * - Maintains referential integrity across all tables
                           * 
                           * User Experience:
                           * - Immediate UI feedback through optimistic updates
                           * - No loading state (could be added for better feedback)
                           * - Simple confirmation prevents accidental deletions
                           * 
                           * Error Handling:
                           * - Should handle network failures gracefully
                           * - Could implement rollback for failed deletions
                           * - Currently no user feedback for deletion errors
                           * 
                           * Security Considerations:
                           * - Should verify user ownership before deletion
                           * - Relies on RLS policies for access control
                           * - Could implement soft deletion for audit trails
                           * 
                           * Performance:
                           * - Optimistic UI update provides immediate feedback
                           * - Single database operation for poll deletion
                           * - Cascade deletion handled efficiently by database
                           */
                          if (confirm('Delete this poll? This action cannot be undone.')) {
                            // Delete from database
                            await supabase.from('polls').delete().eq('id', poll.id);
                            // Optimistically update UI
                            setPolls(polls => polls.filter(p => p.id !== poll.id));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
