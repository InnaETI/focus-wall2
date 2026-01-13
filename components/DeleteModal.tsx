'use client';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  taskCount?: number;
  actionType?: 'archive' | 'delete';
  confirmButtonText?: string;
}

export default function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName,
  taskCount = 0,
  actionType = 'delete',
  confirmButtonText
}: DeleteModalProps) {
  if (!isOpen) return null;

  const buttonText = confirmButtonText || (actionType === 'archive' ? 'Archive' : 'Delete');
  const actionColor = actionType === 'archive' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {itemName && (
          <p className="text-sm font-semibold text-gray-800 mb-4 bg-gray-50 p-3 rounded-lg">
            "{itemName}"
          </p>
        )}
        {taskCount > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              ⚠️ This goal has {taskCount} associated task{taskCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-yellow-700">
              {actionType === 'archive' 
                ? 'All associated tasks will also be archived.'
                : 'All associated tasks will also be permanently deleted. This cannot be undone.'}
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white ${actionColor} transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
