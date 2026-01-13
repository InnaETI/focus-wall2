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

export async function archiveGoal(goalId: string): Promise<void> {
  await updateGoal(goalId, {
    archived: true,
    archived_at: new Date().toISOString(),
  });
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
