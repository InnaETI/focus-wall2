'use client';

import { useRouter } from 'next/navigation';

export interface GoalCardProps {
  id: string;
  name: string;
  deadline: string | null;
  whyItMatters: string | null;
  completed?: boolean;
  onToggleComplete?: (goalId: string) => void;
}

export default function GoalCard({ id, name, deadline, whyItMatters, completed = false, onToggleComplete }: GoalCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/edit-goal/${id}`);
  };
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(id);
    }
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const deadlineDate = formatDate(deadline);
  const isOverdue = deadline && new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();

  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-purple-100 cursor-pointer ${completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleCheckboxClick}
            onClick={handleCheckboxClick}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <h3 className={`text-lg font-semibold flex-1 ${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{name}</h3>
        </div>
        <span className="text-2xl ml-2">🎯</span>
      </div>
      {deadlineDate && (
        <div className={`text-sm mb-2 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
          <span className="font-medium">Deadline:</span> {deadlineDate} {isOverdue && '⚠️'}
        </div>
      )}
      {whyItMatters && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{whyItMatters}</p>
      )}
      <p className="text-xs text-gray-400 mt-3">Click to edit</p>
    </div>
  );
}
