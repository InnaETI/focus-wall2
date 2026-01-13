'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGoals, getTasks, updateTask, updateGoal, autoArchiveItems, type Goal, type Task } from '@/lib/data';
import TaskTile from '@/components/TaskTile';
import GoalCard from '@/components/GoalCard';

export default function FocusWallPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTop3, setDragOverTop3] = useState(false);
  const [dragOverOther, setDragOverOther] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-archive in background
    autoArchiveItems();
  }, []);

  const loadData = async () => {
    const [goalsData, tasksData] = await Promise.all([getGoals(), getTasks()]);
    setGoals(goalsData);
    setTasks(tasksData);
  };

  // Filter out completed and archived items
  const activeGoals = goals.filter(g => !g.completed && !g.archived);
  const activeTasks = tasks.filter(t => !t.completed && !t.archived);
  
  const top3Tasks = activeTasks.filter(t => t.is_top3).slice(0, 3);
  const otherTasks = activeTasks.filter(t => !t.is_top3);
  
  // Count completed today
  const today = new Date().toDateString();
  const completedToday = tasks.filter(t => {
    if (!t.completed || !t.completed_at) return false;
    return new Date(t.completed_at).toDateString() === today;
  }).length;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight delay to allow the drag image to be set
    setTimeout(() => {
      const element = document.getElementById(taskId);
      if (element) {
        element.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = () => {
    if (draggedTaskId) {
      const element = document.getElementById(draggedTaskId);
      if (element) {
        element.style.opacity = '1';
      }
    }
    setDraggedTaskId(null);
    setDragOverTop3(false);
    setDragOverOther(false);
  };

  const handleDragOver = (e: React.DragEvent, zone: 'top3' | 'other') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (zone === 'top3') {
      setDragOverTop3(true);
      setDragOverOther(false);
    } else {
      setDragOverOther(true);
      setDragOverTop3(false);
    }
  };

  const handleDragLeave = (zone: 'top3' | 'other') => {
    if (zone === 'top3') {
      setDragOverTop3(false);
    } else {
      setDragOverOther(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, zone: 'top3' | 'other') => {
    e.preventDefault();
    setDragOverTop3(false);
    setDragOverOther(false);

    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (zone === 'top3') {
      // Check if Top 3 is already full
      if (top3Tasks.length >= 3 && !task.is_top3) {
        alert('Today\'s Top 3 is already full! Remove a task first.');
        setDraggedTaskId(null);
        return;
      }
      await updateTask(taskId, { is_top3: true });
    } else {
      await updateTask(taskId, { is_top3: false });
    }

    await loadData();
    setDraggedTaskId(null);
  };

  const getGoalById = (goalId: string | null): Goal | null => {
    if (!goalId) return null;
    return goals.find(g => g.id === goalId) || null;
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newCompleted = !task.completed;
    await updateTask(taskId, {
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
      is_top3: newCompleted ? false : task.is_top3, // Remove from Top 3 when completed
    });
    await loadData();
  };

  const handleGoalComplete = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    // Check if there are incomplete tasks for this goal
    const incompleteTasks = tasks.filter(t => t.goal_id === goalId && !t.completed && !t.archived);
    if (incompleteTasks.length > 0) {
      alert('Cannot complete goal. There are incomplete tasks associated with this goal.');
      return;
    }
    
    const newCompleted = !goal.completed;
    await updateGoal(goalId, {
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    });
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-800 bg-clip-text text-transparent mb-2">
                Focus Wall
              </h1>
              <p className="text-lg text-gray-700">Welcome back! 👋</p>
            </div>
            <div className="flex items-center gap-4">
              {completedToday > 0 && (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  ✅ {completedToday} completed today
                </div>
              )}
              <button
                onClick={() => router.push('/progress-dashboard')}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                📊 Progress Dashboard
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
                aria-label="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Top 3 Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>⭐</span>
            Today's Top 3
          </h2>
          <div
            onDragOver={(e) => handleDragOver(e, 'top3')}
            onDragLeave={() => handleDragLeave('top3')}
            onDrop={(e) => handleDrop(e, 'top3')}
            className={`
              min-h-[200px]
              rounded-2xl
              p-6
              transition-all
              duration-200
              ${dragOverTop3 
                ? 'bg-white/90 border-4 border-pink-400 border-dashed shadow-xl' 
                : 'bg-white/60 border-2 border-pink-200 shadow-md'
              }
            `}
          >
            {top3Tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-gray-400">
                <div className="text-6xl mb-4">📌</div>
                <p className="text-lg font-medium">Drag tasks here to focus</p>
                <p className="text-sm mt-1">Maximum 3 tasks</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {top3Tasks.map((task, index) => {
                  const goal = getGoalById(task.goal_id);
                  return (
                      <TaskTile
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        goal={goal}
                        priority={task.priority}
                        isDragging={draggedTaskId === task.id}
                        colorIndex={index}
                        completed={task.completed}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onToggleComplete={handleTaskComplete}
                      />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Other Tasks Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Other Tasks</h2>
          <div
            onDragOver={(e) => handleDragOver(e, 'other')}
            onDragLeave={() => handleDragLeave('other')}
            onDrop={(e) => handleDrop(e, 'other')}
            className={`
              rounded-2xl
              p-6
              transition-all
              duration-200
              ${dragOverOther 
                ? 'bg-white/90 border-4 border-blue-400 border-dashed shadow-xl' 
                : 'bg-white/60 border-2 border-blue-200 shadow-md'
              }
            `}
          >
            {otherTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-lg font-medium">No tasks yet</p>
                <p className="text-sm mt-1">Add a task to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherTasks.map((task, index) => {
                  const goal = getGoalById(task.goal_id);
                  return (
                      <TaskTile
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        goal={goal}
                        priority={task.priority}
                        isDragging={draggedTaskId === task.id}
                        colorIndex={index + top3Tasks.length}
                        completed={task.completed}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onToggleComplete={handleTaskComplete}
                      />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Goals Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🎯</span>
            Your Goals
          </h2>
          <div className="bg-white/60 rounded-2xl p-6 border-2 border-purple-200 shadow-md">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-lg font-medium">No goals yet</p>
                <p className="text-sm mt-1">Create your first goal to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    id={goal.id}
                    name={goal.name}
                    deadline={goal.deadline}
                    whyItMatters={goal.why_it_matters}
                    completed={goal.completed}
                    onToggleComplete={handleGoalComplete}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-pink-200 shadow-lg z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/add-task')}
              disabled={activeGoals.length === 0}
              className={`
                flex-1
                py-3
                px-6
                rounded-xl
                font-semibold
                text-white
                transition-all
                duration-200
                ${activeGoals.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md hover:shadow-lg'
                }
              `}
            >
              + Add Task
            </button>
            <button
              onClick={() => router.push('/add-goal')}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              + Add Goal
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
