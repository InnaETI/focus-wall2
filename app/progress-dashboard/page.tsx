'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGoals, getTasks, updateGoal, updateTask, permanentlyDeleteGoal, permanentlyDeleteTask, getRandomMotivationalMessage, type Goal, type Task } from '@/lib/data';
import TaskTile from '@/components/TaskTile';
import GoalCard from '@/components/GoalCard';

export default function ProgressDashboardPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showArchived, setShowArchived] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [completionMessage, setCompletionMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [goalsData, tasksData] = await Promise.all([getGoals(), getTasks()]);
    setGoals(goalsData);
    setTasks(tasksData);
    
    // Get random motivational messages
    const welcome = await getRandomMotivationalMessage('welcome');
    const completion = await getRandomMotivationalMessage('completion');
    setWelcomeMessage(welcome);
    setCompletionMessage(completion);
  };

  const completedGoals = goals.filter(g => g.completed && !g.archived);
  const archivedGoals = goals.filter(g => g.archived);
  const completedTasks = tasks.filter(t => t.completed && !t.archived);
  const archivedTasks = tasks.filter(t => t.archived);

  const handleRestoreGoal = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    await updateGoal(goalId, {
      completed: false,
      completed_at: null,
      archived: false,
      archived_at: null,
    });
    await loadData();
  };

  const handleRestoreTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    await updateTask(taskId, {
      completed: false,
      completed_at: null,
      archived: false,
      archived_at: null,
    });
    await loadData();
  };

  const handlePermanentlyDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to permanently delete this goal? This cannot be undone.')) {
      await permanentlyDeleteGoal(goalId);
      await loadData();
    }
  };

  const handlePermanentlyDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to permanently delete this task? This cannot be undone.')) {
      await permanentlyDeleteTask(taskId);
      await loadData();
    }
  };

  const getGoalById = (goalId: string | null): Goal | null => {
    if (!goalId) return null;
    return goals.find(g => g.id === goalId) || null;
  };

  // Analytics calculations
  const today = new Date().toDateString();
  const completedToday = tasks.filter(t => {
    if (!t.completed || !t.completed_at) return false;
    return new Date(t.completed_at).toDateString() === today;
  }).length;

  const thisWeek = getWeekDates();
  const completedThisWeek = tasks.filter(t => {
    if (!t.completed || !t.completed_at) return false;
    const completedDate = new Date(t.completed_at);
    return thisWeek.some(date => date.toDateString() === completedDate.toDateString());
  }).length;

  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const totalGoals = goals.length;
  const totalCompletedGoals = goals.filter(g => g.completed).length;
  const goalCompletionRate = totalGoals > 0 ? Math.round((totalCompletedGoals / totalGoals) * 100) : 0;

  // Daily completion chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailyCompletions = last7Days.map(date => {
    const dateStr = date.toDateString();
    return tasks.filter(t => {
      if (!t.completed || !t.completed_at) return false;
      return new Date(t.completed_at).toDateString() === dateStr;
    }).length;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-800 bg-clip-text text-transparent mb-2">
                Progress Dashboard
              </h1>
              <p className="text-lg text-gray-700">Track your productivity and achievements</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        {welcomeMessage && (
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-4 mb-6 border-2 border-pink-200">
            <p className="text-center text-gray-800 font-medium italic">"{welcomeMessage}"</p>
          </div>
        )}
        {/* Analytics Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-3xl font-bold text-pink-600">{completedToday}</div>
              <div className="text-sm text-gray-600">Completed Today</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-3xl font-bold text-blue-600">{completedThisWeek}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
              <div className="text-sm text-gray-600">Task Completion Rate</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-3xl font-bold text-purple-600">{goalCompletionRate}%</div>
              <div className="text-sm text-gray-600">Goal Completion Rate</div>
            </div>
          </div>

          {/* Daily Chart */}
          <div className="bg-white rounded-xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Completions (Last 7 Days)</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {last7Days.map((date, index) => {
                const count = dailyCompletions[index];
                const maxCount = Math.max(...dailyCompletions, 1);
                const height = (count / maxCount) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-pink-200 rounded-t-lg flex items-end justify-center" style={{ height: `${height}%`, minHeight: count > 0 ? '20px' : '4px' }}>
                      {count > 0 && <span className="text-xs font-semibold text-pink-800 mb-1">{count}</span>}
                    </div>
                    <div className="text-xs text-gray-600 mt-2 text-center">
                      <div className="font-semibold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Filter Toggles */}
        <div className="mb-6 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Completed</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Archived</span>
          </label>
        </div>

        {/* Completed Tasks */}
        {showCompleted && (
          <section className="mb-8">
            <details className="bg-white/60 rounded-2xl p-6 border-2 border-green-200 shadow-md">
              <summary className="text-2xl font-semibold text-gray-800 mb-4 cursor-pointer flex items-center gap-2">
                <span>✅</span>
                Completed Tasks ({completedTasks.length})
              </summary>
              {completedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-lg font-medium">No completed tasks yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {completedTasks.map((task, index) => {
                    const goal = getGoalById(task.goal_id);
                    const completedDate = task.completed_at ? new Date(task.completed_at).toLocaleDateString() : '';
                    return (
                      <div key={task.id} className="relative">
                        <TaskTile
                          id={task.id}
                          title={task.title}
                          goal={goal}
                          priority={task.priority}
                          colorIndex={index}
                          completed={true}
                          onToggleComplete={handleRestoreTask}
                        />
                        <div className="text-xs text-gray-500 mt-2 ml-1">Completed: {completedDate}</div>
                        <button
                          onClick={() => handleRestoreTask(task.id)}
                          className="mt-2 w-full py-2 px-4 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                        >
                          ↺ Restore
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </details>
            {completedTasks.length > 0 && completionMessage && (
              <div className="mt-4 bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-sm text-center text-green-800 italic">"{completionMessage}"</p>
              </div>
            )}
          </section>
        )}

        {/* Completed Goals */}
        {showCompleted && (
          <section className="mb-8">
            <details className="bg-white/60 rounded-2xl p-6 border-2 border-green-200 shadow-md">
              <summary className="text-2xl font-semibold text-gray-800 mb-4 cursor-pointer flex items-center gap-2">
                <span>🎯</span>
                Completed Goals ({completedGoals.length})
              </summary>
              {completedGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-lg font-medium">No completed goals yet</p>
                </div>
              ) : (
                <div className="space-y-2 mt-4">
                  {completedGoals.map((goal) => {
                    const completedDate = goal.completed_at ? new Date(goal.completed_at).toLocaleDateString() : '';
                    return (
                      <div key={goal.id} className="relative">
                        <GoalCard
                          id={goal.id}
                          name={goal.name}
                          deadline={goal.deadline}
                          whyItMatters={goal.why_it_matters}
                          completed={true}
                          compact={true}
                          onToggleComplete={handleRestoreGoal}
                        />
                        <div className="flex items-center justify-between mt-2 ml-7">
                          <span className="text-xs text-gray-500">Completed: {completedDate}</span>
                          <button
                            onClick={() => handleRestoreGoal(goal.id)}
                            className="py-1 px-3 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                          >
                            ↺ Restore
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </details>
          </section>
        )}

        {/* Archived Tasks */}
        {showArchived && (
          <section className="mb-8">
            <details className="bg-white/60 rounded-2xl p-6 border-2 border-gray-200 shadow-md">
              <summary className="text-2xl font-semibold text-gray-800 mb-4 cursor-pointer flex items-center gap-2">
                <span>📦</span>
                Archived Tasks ({archivedTasks.length})
              </summary>
              {archivedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-lg font-medium">No archived tasks</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {archivedTasks.map((task, index) => {
                    const goal = getGoalById(task.goal_id);
                    const archivedDate = task.archived_at ? new Date(task.archived_at).toLocaleDateString() : '';
                    return (
                      <div key={task.id} className="relative opacity-70">
                        <TaskTile
                          id={task.id}
                          title={task.title}
                          goal={goal}
                          priority={task.priority}
                          colorIndex={index}
                          completed={task.completed}
                        />
                        <div className="text-xs text-gray-500 mt-2 ml-1">Archived: {archivedDate}</div>
                        <button
                          onClick={() => handlePermanentlyDeleteTask(task.id)}
                          className="mt-2 w-full py-2 px-4 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-all duration-200"
                        >
                          🗑️ Permanently Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </details>
          </section>
        )}

        {/* Archived Goals */}
        {showArchived && (
          <section className="mb-8">
            <details className="bg-white/60 rounded-2xl p-6 border-2 border-gray-200 shadow-md">
              <summary className="text-2xl font-semibold text-gray-800 mb-4 cursor-pointer flex items-center gap-2">
                <span>📦</span>
                Archived Goals ({archivedGoals.length})
              </summary>
              {archivedGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-lg font-medium">No archived goals</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {archivedGoals.map((goal) => {
                    const archivedDate = goal.archived_at ? new Date(goal.archived_at).toLocaleDateString() : '';
                    return (
                      <div key={goal.id} className="relative opacity-70">
                        <GoalCard
                          id={goal.id}
                          name={goal.name}
                          deadline={goal.deadline}
                          whyItMatters={goal.why_it_matters}
                          completed={goal.completed}
                        />
                        <div className="text-xs text-gray-500 mt-2 ml-1">Archived: {archivedDate}</div>
                        <button
                          onClick={() => handlePermanentlyDeleteGoal(goal.id)}
                          className="mt-2 w-full py-2 px-4 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-all duration-200"
                        >
                          🗑️ Permanently Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </details>
          </section>
        )}
      </main>
    </div>
  );
}

function getWeekDates(): Date[] {
  const today = new Date();
  const dates: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  return dates;
}
