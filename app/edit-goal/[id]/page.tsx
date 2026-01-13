'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getGoals, getTasks, updateGoal, archiveGoal, getActiveTasksForGoal, getAllTasksForGoal, type Goal, type Task } from '@/lib/data';
import DeleteModal from '@/components/DeleteModal';

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [totalTaskCount, setTotalTaskCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [goalId]);

  const loadData = async () => {
    const [goalsData, tasksData] = await Promise.all([getGoals(), getTasks()]);
    const foundGoal = goalsData.find(g => g.id === goalId);
    if (foundGoal) {
      setGoal(foundGoal);
      setName(foundGoal.name);
      setDeadline(foundGoal.deadline || '');
      setWhyItMatters(foundGoal.why_it_matters || '');
    }
    setTasks(tasksData);
    
    // Count tasks for this goal
    const activeTasks = await getActiveTasksForGoal(goalId);
    const allTasks = await getAllTasksForGoal(goalId);
    setActiveTaskCount(activeTasks.length);
    setTotalTaskCount(allTasks.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a goal name');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateGoal(goalId, {
        name: name.trim(),
        deadline: deadline || null,
        why_it_matters: whyItMatters.trim() || null,
      });
      router.push('/');
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    if (activeTaskCount > 0) {
      alert(`Cannot archive goal. There are ${activeTaskCount} active task${activeTaskCount !== 1 ? 's' : ''} associated with this goal. Please complete or remove all tasks first.`);
      return;
    }
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await archiveGoal(goalId, true); // Cascade to tasks
      router.push('/');
    } catch (error) {
      console.error('Error archiving goal:', error);
      alert('Failed to archive goal. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (!goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 py-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Goal Not Found</h2>
            <p className="text-gray-600 mb-6">The goal you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/focus-wall')}
              className="py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Back to Focus Wall
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
            Edit Goal
          </h1>
          <p className="text-lg text-gray-700">Update your goal details</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Goal Name * <span className="text-xs font-normal text-gray-500">({name.length}/100)</span>
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
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={`
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  ${isDeleting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600'
                  }
                  shadow-md hover:shadow-lg
                `}
              >
                Archive Goal
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Delete Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Archive Goal"
          message="Are you sure you want to archive this goal? You can restore it from the Progress Dashboard later."
          itemName={goal?.name}
          taskCount={totalTaskCount}
          actionType="archive"
        />
      </div>
    </div>
  );
}
