'use client';

import { useRouter } from 'next/navigation';

export interface GoalCardProps {
  id: string;
  name: string;
  deadline: string | null;
  whyItMatters: string | null;
  completed?: boolean;
  activeTaskCount?: number;
  onToggleComplete?: (goalId: string) => void;
  compact?: boolean; // For list format
}

export default function GoalCard({ id, name, deadline, whyItMatters, completed = false, activeTaskCount = 0, onToggleComplete, compact = false }: GoalCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/edit-goal/${id}`);
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(id);
    }
  };
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const deadlineDate = formatDate(deadline);
  const isOverdue = deadline && new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();

  if (compact) {
    // Compact two-line format for lists
    return (
      <div 
        onClick={handleClick}
        className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-purple-100 cursor-pointer ${completed ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleCheckboxChange}
            onClick={handleCheckboxClick}
            disabled={activeTaskCount > 0}
            className={`w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 ${activeTaskCount > 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            title={activeTaskCount > 0 ? `Cannot complete: ${activeTaskCount} active task${activeTaskCount !== 1 ? 's' : ''} remaining` : ''}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold break-words flex-1 min-w-0 ${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {name}
              </h3>
              <span className="text-lg flex-shrink-0">🎯</span>
            </div>
            {(deadlineDate || activeTaskCount > 0) && (
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 break-words">
                {deadlineDate && (
                  <span className={`break-words ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                    {deadlineDate} {isOverdue && '⚠️'}
                  </span>
                )}
                {activeTaskCount > 0 && (
                  <span className="text-orange-600 break-words">
                    📋 {activeTaskCount} active task{activeTaskCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full format for main page
  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-purple-100 cursor-pointer ${completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={completed}
          onChange={handleCheckboxChange}
          onClick={handleCheckboxClick}
          disabled={activeTaskCount > 0}
          className={`mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 ${activeTaskCount > 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          title={activeTaskCount > 0 ? `Cannot complete: ${activeTaskCount} active task${activeTaskCount !== 1 ? 's' : ''} remaining` : ''}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`text-lg font-semibold break-words flex-1 min-w-0 ${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {name}
            </h3>
            <span className="text-2xl flex-shrink-0">🎯</span>
          </div>
          {activeTaskCount > 0 && (
            <div className="text-xs text-orange-600 font-medium mb-2">
              📋 {activeTaskCount} active task{activeTaskCount !== 1 ? 's' : ''}
            </div>
          )}
          {deadlineDate && (
            <div className={`text-sm mb-2 break-words ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
              <span className="font-medium">Deadline:</span> {deadlineDate} {isOverdue && '⚠️'}
            </div>
          )}
          {whyItMatters && (
            <p className="text-sm text-gray-600 mt-2 break-words">{whyItMatters}</p>
          )}
          <p className="text-xs text-gray-400 mt-3">Click to edit</p>
        </div>
      </div>
    </div>
  );
}
