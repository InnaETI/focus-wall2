import Link from 'next/link';

interface NavCardProps {
  href: string;
  title: string;
  subtitle: string;
  featured?: boolean;
  className?: string;
}

export default function NavCard({
  href,
  title,
  subtitle,
  featured = false,
  className = '',
}: NavCardProps) {
  return (
    <Link
      href={href}
      className={`
        block
        bg-white
        border-2
        rounded-lg
        p-6
        transition-all
        duration-200
        hover:border-gray-400
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        ${featured ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
        ${className}
      `}
      aria-label={`Navigate to ${title}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3
            className={`
              text-xl
              font-semibold
              mb-2
              ${featured ? 'text-blue-900' : 'text-gray-900'}
            `}
          >
            {title}
          </h3>
          <p
            className={`
              text-sm
              ${featured ? 'text-blue-700' : 'text-gray-600'}
            `}
          >
            {subtitle}
          </p>
        </div>
        <div
          className={`
            ml-4
            flex-shrink-0
            ${featured ? 'text-blue-600' : 'text-gray-400'}
          `}
          aria-hidden="true"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
