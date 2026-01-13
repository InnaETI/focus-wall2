import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Focus Wall - Productivity App',
  description: 'Manage your goals and tasks with Focus Wall',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
