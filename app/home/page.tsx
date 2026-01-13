import Link from 'next/link';
import NavCard from '@/components/NavCard';

const ROUTES = {
  TEST: '/test',
  UPLOAD: '/upload',
  POLICIES: '/policies',
  FOCUS_WALL: '/focus-wall',
} as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Policy Engine</h1>
            <div className="w-8 h-8 rounded-full bg-gray-300" aria-label="User menu" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Home</h2>
          <p className="text-lg text-gray-600">Choose what you want to do.</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Featured Card */}
          <NavCard
            href={ROUTES.TEST}
            title="Test a Policy"
            subtitle="Ask questions like 'MRI of the head' and get answers with citations."
            featured
            className="lg:col-span-2"
          />

          {/* Upload Policy Card */}
          <NavCard
            href={ROUTES.UPLOAD}
            title="Upload Policy"
            subtitle="Upload a PDF and review extracted details."
          />

          {/* Policies Card */}
          <NavCard
            href={ROUTES.POLICIES}
            title="Policies"
            subtitle="Browse policies and processing status."
          />

          {/* Focus Wall Card */}
          <NavCard
            href={ROUTES.FOCUS_WALL}
            title="Focus Wall"
            subtitle="Productivity app to manage goals and tasks."
            featured
          />
        </div>
      </main>
    </div>
  );
}
