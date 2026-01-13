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
