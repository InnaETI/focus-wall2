// Data SDK utilities for Focus Wall app

export interface Goal {
  id: string;
  name: string;
  deadline: string | null;
  why_it_matters: string | null;
  created_at: string;
  completed: boolean;
  completed_at: string | null;
  archived: boolean;
  archived_at: string | null;
  table: 'goals';
}

export interface Task {
  id: string;
  title: string;
  goal_id: string | null;
  priority: 'High' | 'Medium' | 'Low';
  notes: string | null;
  status: string;
  is_top3: boolean;
  created_at: string;
  completed: boolean;
  completed_at: string | null;
  archived: boolean;
  archived_at: string | null;
  table: 'tasks';
}

export interface AppSettings {
  auto_archive_days: number;
}

export interface MotivationalMessage {
  id: string;
  text: string;
  context: 'welcome' | 'completion' | 'empty_state' | 'progress';
  created_at: string;
  updated_at: string;
}

// Note: In a real implementation, you would use @vercel/data SDK
// For now, we'll use a client-side storage approach that can be easily migrated
// to Data SDK when available

export async function getGoals(): Promise<Goal[]> {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('focus_wall_goals');
  if (!stored) return [];
  const goals = JSON.parse(stored);
  // Migrate old goals without new fields
  return goals.map((g: any) => ({
    ...g,
    completed: g.completed ?? false,
    completed_at: g.completed_at ?? null,
    archived: g.archived ?? false,
    archived_at: g.archived_at ?? null,
  }));
}

export async function getTasks(): Promise<Task[]> {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('focus_wall_tasks');
  if (!stored) return [];
  const tasks = JSON.parse(stored);
  // Migrate old tasks without new fields
  return tasks.map((t: any) => ({
    ...t,
    completed: t.completed ?? false,
    completed_at: t.completed_at ?? null,
    archived: t.archived ?? false,
    archived_at: t.archived_at ?? null,
  }));
}

export async function getSettings(): Promise<AppSettings> {
  if (typeof window === 'undefined') return { auto_archive_days: 90 };
  
  const stored = localStorage.getItem('focus_wall_settings');
  if (!stored) return { auto_archive_days: 90 };
  return JSON.parse(stored);
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem('focus_wall_settings', JSON.stringify(updated));
  return updated;
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'table' | 'completed' | 'completed_at' | 'archived' | 'archived_at'>): Promise<Goal> {
  const newGoal: Goal = {
    ...goal,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    table: 'goals',
    completed: false,
    completed_at: null,
    archived: false,
    archived_at: null,
  };
  
  const goals = await getGoals();
  goals.push(newGoal);
  localStorage.setItem('focus_wall_goals', JSON.stringify(goals));
  return newGoal;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'table' | 'is_top3' | 'status' | 'completed' | 'completed_at' | 'archived' | 'archived_at'>): Promise<Task> {
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    table: 'tasks',
    is_top3: false,
    status: 'active',
    completed: false,
    completed_at: null,
    archived: false,
    archived_at: null,
  };
  
  const tasks = await getTasks();
  tasks.push(newTask);
  localStorage.setItem('focus_wall_tasks', JSON.stringify(tasks));
  return newTask;
}

export async function updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
  const goals = await getGoals();
  const index = goals.findIndex(g => g.id === goalId);
  
  if (index === -1) {
    throw new Error('Goal not found');
  }
  
  goals[index] = { ...goals[index], ...updates };
  localStorage.setItem('focus_wall_goals', JSON.stringify(goals));
  return goals[index];
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  
  if (index === -1) {
    throw new Error('Task not found');
  }
  
  tasks[index] = { ...tasks[index], ...updates };
  localStorage.setItem('focus_wall_tasks', JSON.stringify(tasks));
  return tasks[index];
}

export async function archiveGoal(goalId: string, cascadeToTasks: boolean = true): Promise<void> {
  await updateGoal(goalId, {
    archived: true,
    archived_at: new Date().toISOString(),
  });
  
  // Cascade archive to all associated tasks
  if (cascadeToTasks) {
    const tasks = await getTasks();
    const associatedTasks = tasks.filter(t => t.goal_id === goalId && !t.archived);
    for (const task of associatedTasks) {
      await archiveTask(task.id);
    }
  }
}

export async function archiveTask(taskId: string): Promise<void> {
  await updateTask(taskId, {
    archived: true,
    archived_at: new Date().toISOString(),
  });
}

export async function permanentlyDeleteGoal(goalId: string): Promise<void> {
  const goals = await getGoals();
  const filtered = goals.filter(g => g.id !== goalId);
  localStorage.setItem('focus_wall_goals', JSON.stringify(filtered));
  
  // Also remove tasks associated with this goal
  const tasks = await getTasks();
  const filteredTasks = tasks.filter(t => t.goal_id !== goalId);
  localStorage.setItem('focus_wall_tasks', JSON.stringify(filteredTasks));
}

export async function permanentlyDeleteTask(taskId: string): Promise<void> {
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  localStorage.setItem('focus_wall_tasks', JSON.stringify(filtered));
}

// Auto-archive logic
export async function autoArchiveItems(): Promise<void> {
  const settings = await getSettings();
  const daysInMs = settings.auto_archive_days * 24 * 60 * 60 * 1000;
  const cutoffDate = new Date(Date.now() - daysInMs);
  
  const goals = await getGoals();
  const tasks = await getTasks();
  
  // Archive completed goals older than cutoff
  for (const goal of goals) {
    if (goal.completed && !goal.archived && goal.completed_at) {
      const completedDate = new Date(goal.completed_at);
      if (completedDate < cutoffDate) {
        await archiveGoal(goal.id);
      }
    }
  }
  
  // Archive completed tasks older than cutoff
  for (const task of tasks) {
    if (task.completed && !task.archived && task.completed_at) {
      const completedDate = new Date(task.completed_at);
      if (completedDate < cutoffDate) {
        await archiveTask(task.id);
      }
    }
  }
}

// Helper function to get active tasks for a goal
export async function getActiveTasksForGoal(goalId: string): Promise<Task[]> {
  const tasks = await getTasks();
  return tasks.filter(t => t.goal_id === goalId && !t.completed && !t.archived);
}

// Helper function to get all tasks for a goal (including completed/archived)
export async function getAllTasksForGoal(goalId: string): Promise<Task[]> {
  const tasks = await getTasks();
  return tasks.filter(t => t.goal_id === goalId);
}

const DEFAULT_MOTIVATIONAL_MESSAGES: Omit<MotivationalMessage, 'id'>[] = [
  { text: "Every accomplishment starts with the decision to try. You've got this! 💪", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Progress, not perfection. Every step forward counts! 🌟", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're capable of amazing things. Let's make today count! ✨", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Small steps lead to big achievements. Keep going! 🚀", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your future self will thank you for the work you do today. 💫", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Believe in yourself and all that you are. You're doing great! 🌈", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Success is the sum of small efforts repeated day in and day out. 📈", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're stronger than you think and more capable than you imagine. 💎", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Today is a fresh start. Make it count! 🌅", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "The only way to do great work is to love what you do. Keep pushing! ❤️", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Amazing! You're building momentum. Keep it going! 🎉", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Fantastic work! Every completion brings you closer to your goals! 🌟", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're on fire! Keep up the excellent work! 🔥", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Outstanding! Your dedication is paying off! 💪", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Incredible! You're making real progress! 🚀", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Well done! Consistency is your superpower! ⭐", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Brilliant! You're turning goals into achievements! ✨", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Excellent! Every task completed is a victory! 🏆", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Phenomenal! You're creating positive change! 🌈", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Spectacular! Your hard work is showing results! 💎", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your journey starts here. Every goal begins with a single step! 🌱", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Ready to make your mark? Let's create something amazing together! 🎯", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "This is your canvas. Paint it with your dreams and goals! 🎨", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "The best time to start was yesterday. The second best time is now! ⏰", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your potential is limitless. Let's unlock it together! 🔓", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Every expert was once a beginner. Your journey starts now! 🌟", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Dream big, start small, but most of all, start! 🚀", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "The only way to predict the future is to create it. Let's begin! 🔮", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your story is waiting to be written. What will you create today? ✍️", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Great things never come from comfort zones. Let's get started! 💪", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're building something incredible. Keep tracking your progress! 📊", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Look how far you've come! Your consistency is inspiring! 🌟", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your progress tells a story of dedication and growth. Keep writing it! 📖", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Every data point is a testament to your commitment. Well done! 📈", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're not just tracking progress, you're creating it! 🎯", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your dashboard reflects your hard work. Keep it up! 💎", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Numbers don't lie - and yours show incredible dedication! 🔢", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "This is your success story in the making. Keep going! ✨", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your progress is proof that consistency creates results! 🏆", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Every milestone reached is a celebration of your effort! 🎉", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Rise and shine! Today is full of possibilities. 🌅", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You have the power to make today amazing. Use it! ⚡", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Excellence is not a skill, it's an attitude. Show yours! 💫", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "The secret of getting ahead is getting started. You're here! 🎯", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your attitude determines your direction. Keep it positive! ☀️", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Dreams don't work unless you do. Let's make it happen! 💪", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're one decision away from a completely different life. Choose wisely! 🌟", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "The harder you work, the luckier you get. Time to get lucky! 🍀", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Success isn't just about what you accomplish, it's about what you inspire. Inspire yourself! ✨", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're exactly where you need to be. Now let's move forward! 🚀", context: "welcome" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You did it! Celebrate this win and keep the momentum! 🎊", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Another one in the books! You're unstoppable! 📚", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Mission accomplished! Your future self is proud! 🎖️", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Checkmark achieved! You're building great habits! ✅", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Task conquered! This is how champions are made! 👑", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Done and done! Your productivity is impressive! ⚡", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Nailed it! You're turning plans into reality! 🔨", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Victory! Every completion is a step toward your dreams! 🏅", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Achievement unlocked! Keep the streak going! 🔓", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Success! You're proving to yourself what you can do! 💯", context: "completion" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "A blank page is full of possibilities. What will you write? 📝", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "The first step is always the hardest. You've got this! 👣", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your journey of a thousand miles begins with a single step. Take it! 🗺️", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Every masterpiece starts with a blank canvas. Start painting! 🎨", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "The best projects start with a single idea. What's yours? 💡", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're about to create something from nothing. That's powerful! ⚡", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Empty spaces are opportunities in disguise. Fill them! 📦", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "The beginning is the most important part of the work. Begin now! 🚪", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your potential is waiting. Let's unlock it together! 🔑", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Great things are built one piece at a time. Start with one! 🧩", context: "empty_state" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your stats tell a story of growth. Keep adding chapters! 📖", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Data doesn't lie - and yours shows dedication! 📊", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "You're not just tracking numbers, you're tracking transformation! 🦋", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Every metric is a milestone. Celebrate your journey! 🎯", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your progress chart is a work of art. Keep creating! 🎨", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Numbers are proof of your commitment. Impressive! 🔢", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your dashboard is a reflection of your hard work. Shine on! ✨", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Tracking progress is tracking success. You're winning! 🏆", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Every data point represents effort. Your effort shows! 💪", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
  { text: "Your analytics are inspiring. Keep building that momentum! 📈", context: "progress" as const, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
];


// Motivational Messages Functions
export async function getMotivationalMessages(): Promise<MotivationalMessage[]> {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('focus_wall_motivational_messages');
  if (!stored) {
    // Initialize with default messages
    const defaultMessages: MotivationalMessage[] = DEFAULT_MOTIVATIONAL_MESSAGES.map((msg, index) => ({
      ...msg,
      id: `msg-${index + 1}`,
    }));
    localStorage.setItem('focus_wall_motivational_messages', JSON.stringify(defaultMessages));
    return defaultMessages;
  }
  return JSON.parse(stored);
}

export async function getRandomMotivationalMessage(context?: MotivationalMessage['context']): Promise<string> {
  const messages = await getMotivationalMessages();
  const filtered = context ? messages.filter(m => m.context === context) : messages;
  if (filtered.length === 0) return filtered.length > 0 ? filtered[0].text : "Keep going! You've got this! 💪";
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex].text;
}

export async function updateMotivationalMessage(messageId: string, updates: Partial<MotivationalMessage>): Promise<MotivationalMessage> {
  const messages = await getMotivationalMessages();
  const index = messages.findIndex(m => m.id === messageId);
  
  if (index === -1) {
    throw new Error('Message not found');
  }
  
  messages[index] = { ...messages[index], ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem('focus_wall_motivational_messages', JSON.stringify(messages));
  return messages[index];
}

export async function createMotivationalMessage(message: Omit<MotivationalMessage, 'id' | 'created_at' | 'updated_at'>): Promise<MotivationalMessage> {
  const messages = await getMotivationalMessages();
  const newMessage: MotivationalMessage = {
    ...message,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  messages.push(newMessage);
  localStorage.setItem('focus_wall_motivational_messages', JSON.stringify(messages));
  return newMessage;
}

export async function deleteMotivationalMessage(messageId: string): Promise<void> {
  const messages = await getMotivationalMessages();
  const filtered = messages.filter(m => m.id !== messageId);
  localStorage.setItem('focus_wall_motivational_messages', JSON.stringify(filtered));
}

