'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Goal } from '@/lib/data';

export interface TaskTileProps {
  id: string;
  title: string;
  goal: Goal | null;
  priority: 'High' | 'Medium' | 'Low';
  isDragging?: boolean;
  colorIndex: number;
  completed?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: () => void;
  onToggleComplete?: (taskId: string) => void;
}

const priorityColors = {
  High: 'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
};

const gradientColors = [
  'from-orange-200 via-pink-200 to-rose-200', // peach
  'from-emerald-200 via-teal-200 to-cyan-200', // mint
  'from-blue-200 via-indigo-200 to-purple-200', // blue
  'from-purple-200 via-pink-200 to-rose-200', // lavender
];

export default function TaskTile({ id, title, goal, priority, isDragging = false, colorIndex, completed = false, onDragStart, onDragEnd, onToggleComplete }: TaskTileProps) {
  const router = useRouter();
  const gradient = gradientColors[colorIndex % gradientColors.length];
  const [wasDragged, setWasDragged] = useState(false);
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(id);
    }
  };
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleDragStartInternal = (e: React.DragEvent) => {
    setWasDragged(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    if (onDragStart) {
      onDragStart(e, id);
    }
    // Add a slight delay to allow the drag image to be set
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.style.opacity = '0.5';
      }
    }, 0);
  };
  
  const handleDragEndInternal = (e: React.DragEvent) => {
    setWasDragged(false);
    const element = document.getElementById(id);
    if (element) {
      element.style.opacity = '1';
    }
    if (onDragEnd) {
      onDragEnd();
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if user was dragging
    if (wasDragged || isDragging) {
      setWasDragged(false);
      return;
    }
    e.stopPropagation();
    router.push(`/edit-task/${id}`);
  };
  
  return (
    <div
      id={id}
      draggable
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onClick={handleClick}
      className={`
        relative
        bg-gradient-to-br ${gradient}
        rounded-xl
        p-4
        shadow-md
        cursor-pointer
        transition-all
        duration-200
        hover:shadow-lg
        hover:scale-[1.02]
        active:scale-95
        ${isDragging ? 'opacity-50 scale-95 cursor-move' : 'opacity-100'}
        ${completed ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleCheckboxChange}
            onClick={handleCheckboxClick}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold mb-2 text-lg break-words ${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{title}</h3>
            {goal && (
              <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-2">
                <span>🏁</span>
                <span className="truncate">{goal.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${priorityColors[priority]}`}>
                {priority}
              </div>
              <span className="text-xs text-gray-500 opacity-70">Click to edit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
