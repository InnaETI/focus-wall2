'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSettings, updateSettings } from '@/lib/data';

export default function SettingsPage() {
  const router = useRouter();
  const [autoArchiveDays, setAutoArchiveDays] = useState(90);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setAutoArchiveDays(settings.auto_archive_days);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({ auto_archive_days: autoArchiveDays });
      alert('Settings saved successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-800 bg-clip-text text-transparent mb-2">
                Settings
              </h1>
              <p className="text-lg text-gray-700">Configure your app preferences</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Instructions Section */}
        <details className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-200">
          <summary className="cursor-pointer flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <h2 className="text-2xl font-bold text-gray-800">How to Use Focus Wall</h2>
            <span className="ml-auto text-sm text-gray-600">Click to expand</span>
          </summary>
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Getting Started with Goals
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">1.</span>
                  <span>Click <strong>"+ Add Goal"</strong> to create your first goal. Give it a name (up to 100 characters), set a deadline if you want, and tell yourself why it matters! 💪</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">2.</span>
                  <span>Your goals appear in a clean list format. Click any goal to edit it or check it off when complete! ✨</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">3.</span>
                  <span><strong>Important:</strong> You can only complete a goal when all its tasks are done. This keeps you focused! 🎯</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Managing Tasks
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span>Click <strong>"+ Add Task"</strong> to create tasks. Every task must be linked to an active goal - no orphan tasks allowed! 📋</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>Drag tasks into <strong>"Today's Top 3"</strong> to focus on your most important work (max 3 tasks). Drag them out when done! ⭐</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span>Click the checkbox on any task to mark it complete. You'll get a celebratory message! 🎉</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  <span>Click any task tile to edit or archive it. Long names wrap automatically! 📝</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Progress Dashboard
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">1.</span>
                  <span>Visit the <strong>Progress Dashboard</strong> to see your completion stats, daily charts, and motivational messages! 📈</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">2.</span>
                  <span>View completed and archived items. You can restore them or permanently delete archived items. 🔄</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">3.</span>
                  <span>Each time you reload, you'll see a new motivational message at the top! 🌟</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Tips & Tricks
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">💡</span>
                  <span><strong>Character Limits:</strong> Task and goal names are limited to 100 characters to keep things concise and readable.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">💡</span>
                  <span><strong>Auto-Archive:</strong> Completed items automatically archive after the number of days you set (default: 90 days).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">💡</span>
                  <span><strong>Text Wrapping:</strong> All text automatically wraps if it's too long - no more cut-off text! 📐</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">💡</span>
                  <span><strong>Data Safety:</strong> Everything is stored locally in your browser. Your data stays private! 🔒</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-4 border-2 border-pink-200">
              <p className="text-center text-gray-800 font-medium">
                <span className="text-2xl">🚀</span> Ready to get started? Create your first goal and watch your productivity soar!
              </p>
            </div>
          </div>
        </details>

        {/* Settings Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Auto-Archive Days */}
            <div>
              <label htmlFor="autoArchiveDays" className="block text-sm font-semibold text-gray-700 mb-2">
                Auto-Archive After (Days)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Completed items will be automatically archived after this many days. Default: 90 days (3 months).
              </p>
              <input
                type="number"
                id="autoArchiveDays"
                min="1"
                max="365"
                value={autoArchiveDays}
                onChange={(e) => setAutoArchiveDays(parseInt(e.target.value) || 90)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-2">
                Current setting: {autoArchiveDays} day{autoArchiveDays !== 1 ? 's' : ''} ({Math.round(autoArchiveDays / 30)} month{Math.round(autoArchiveDays / 30) !== 1 ? 's' : ''})
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`
                  flex-1
                  py-3
                  px-6
                  rounded-xl
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  ${isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md hover:shadow-lg'
                  }
                `}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
