'use client';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, title, message, itemName }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {itemName && (
          <p className="text-sm font-semibold text-gray-800 mb-6 bg-gray-50 p-3 rounded-lg">
            "{itemName}"
          </p>
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
            className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
