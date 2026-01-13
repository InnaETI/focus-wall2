'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGoal } from '@/lib/data';

export default function AddGoalPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a goal name');
      return;
    }

    setIsSubmitting(true);
    try {
      await createGoal({
        name: name.trim(),
        deadline: deadline || null,
        why_it_matters: whyItMatters.trim() || null,
      });
      router.push('/focus-wall');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/focus-wall');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-800 bg-clip-text text-transparent mb-2">
            Add Goal
          </h1>
          <p className="text-lg text-gray-700">Set a new goal to work towards</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Goal Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Learn Spanish, Run a Marathon"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200"
                required
              />
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200"
              />
            </div>

            {/* Why It Matters */}
            <div>
              <label htmlFor="whyItMatters" className="block text-sm font-semibold text-gray-700 mb-2">
                Why It Matters
              </label>
              <textarea
                id="whyItMatters"
                value={whyItMatters}
                onChange={(e) => setWhyItMatters(e.target.value)}
                placeholder="What makes this goal important to you?"
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
                {isSubmitting ? 'Saving...' : 'Save Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
