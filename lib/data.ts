// Data SDK utilities for Focus Wall app

export interface Goal {
  id: string;
  name: string;
  deadline: string | null;
  why_it_matters: string | null;
  created_at: string;
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
  table: 'tasks';
}

// Note: In a real implementation, you would use @vercel/data SDK
// For now, we'll use a client-side storage approach that can be easily migrated
// to Data SDK when available

export async function getGoals(): Promise<Goal[]> {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('focus_wall_goals');
  if (!stored) return [];
  return JSON.parse(stored);
}

export async function getTasks(): Promise<Task[]> {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('focus_wall_tasks');
  if (!stored) return [];
  return JSON.parse(stored);
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'table'>): Promise<Goal> {
  const newGoal: Goal = {
    ...goal,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    table: 'goals',
  };
  
  const goals = await getGoals();
  goals.push(newGoal);
  localStorage.setItem('focus_wall_goals', JSON.stringify(goals));
  return newGoal;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'table' | 'is_top3' | 'status'>): Promise<Task> {
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    table: 'tasks',
    is_top3: false,
    status: 'active',
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

export async function deleteGoal(goalId: string): Promise<void> {
  const goals = await getGoals();
  const filtered = goals.filter(g => g.id !== goalId);
  localStorage.setItem('focus_wall_goals', JSON.stringify(filtered));
  
  // Also remove tasks associated with this goal
  const tasks = await getTasks();
  const filteredTasks = tasks.filter(t => t.goal_id !== goalId);
  localStorage.setItem('focus_wall_tasks', JSON.stringify(filteredTasks));
}

export async function deleteTask(taskId: string): Promise<void> {
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  localStorage.setItem('focus_wall_tasks', JSON.stringify(filtered));
}
