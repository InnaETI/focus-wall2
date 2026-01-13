'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGoals, createTask, type Goal } from '@/lib/data';

export default function AddTaskPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const goalsData = await getGoals();
    setGoals(goalsData);
    if (goalsData.length > 0 && !goalId) {
      setGoalId(goalsData[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (goals.length === 0) {
      alert('Please create a goal first');
      router.push('/focus-wall/add-goal');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        goal_id: goalId || null,
        priority,
        notes: notes.trim() || null,
      });
      router.push('/focus-wall');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/focus-wall');
  };

  if (goals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 py-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Goals Yet</h2>
            <p className="text-gray-600 mb-6">You need to create at least one goal before adding tasks.</p>
            <button
              onClick={() => router.push('/focus-wall/add-goal')}
              className="py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Create Your First Goal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-800 bg-clip-text text-transparent mb-2">
            Add Task
          </h1>
          <p className="text-lg text-gray-700">Create a new task to work on</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete Spanish lesson 1, Run 5km"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200"
                required
              />
            </div>

            {/* Goal Selection */}
            <div>
              <label htmlFor="goalId" className="block text-sm font-semibold text-gray-700 mb-2">
                Associated Goal
              </label>
              <select
                id="goalId"
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200"
              >
                <option value="">No Goal (Other Tasks)</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details or reminders..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  flex-1
                  py-3
                  px-6
                  rounded-xl
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  ${isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md hover:shadow-lg'
                  }
                `}
              >
                {isSubmitting ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
