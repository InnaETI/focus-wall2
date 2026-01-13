'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getGoals, getTasks, updateTask, archiveTask, type Goal, type Task } from '@/lib/data';
import DeleteModal from '@/components/DeleteModal';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [taskId]);

  const loadData = async () => {
    const [goalsData, tasksData] = await Promise.all([getGoals(), getTasks()]);
    setGoals(goalsData);
    
    const foundTask = tasksData.find(t => t.id === taskId);
    if (foundTask) {
      setTask(foundTask);
      setTitle(foundTask.title);
      setGoalId(foundTask.goal_id || '');
      setPriority(foundTask.priority);
      setNotes(foundTask.notes || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTask(taskId, {
        title: title.trim(),
        goal_id: goalId || null,
        priority,
        notes: notes.trim() || null,
      });
      router.push('/');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await archiveTask(taskId);
      router.push('/');
    } catch (error) {
      console.error('Error archiving task:', error);
      alert('Failed to archive task. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 py-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Task Not Found</h2>
            <p className="text-gray-600 mb-6">The task you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
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
            Edit Task
          </h1>
          <p className="text-lg text-gray-700">Update your task details</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Task Title * <span className="text-xs font-normal text-gray-500">({title.length}/100)</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
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
                Archive Task
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
          title="Archive Task"
          message="Are you sure you want to archive this task? You can restore it from the Progress Dashboard later."
          itemName={task?.title}
        />
      </div>
    </div>
  );
}
