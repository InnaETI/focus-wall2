# Focus Wall - Productivity App

A beautiful productivity app to manage your goals and tasks with drag-and-drop functionality.

## Features

- 🎯 Create Goals with deadlines and descriptions
- ✅ Create Tasks linked to Goals
- ⭐ Focus on your Top 3 tasks for today
- 🎨 Beautiful gradient UI with smooth animations
- 📱 Responsive design
- 💾 Data persistence using localStorage
- ✏️ Edit and delete goals and tasks

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically redirect to `/focus-wall`.

## Deploy to Vercel (Free)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js and deploy!

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Usage

1. **Create a Goal**: Click "+ Add Goal" to create your first goal
2. **Add Tasks**: Click "+ Add Task" to add tasks linked to your goals
3. **Focus on Top 3**: Drag tasks into the "Today's Top 3" section (max 3 tasks)
4. **Edit Tasks/Goals**: Click on any task or goal to edit or delete it
5. **Manage Tasks**: Drag tasks back to "Other Tasks" when done

## Project Structure

```
/app
  /focus-wall
    page.tsx          # Main Focus Wall page
    /add-goal
      page.tsx        # Add Goal form
    /add-task
      page.tsx        # Add Task form
    /edit-goal/[id]
      page.tsx        # Edit Goal form
    /edit-task/[id]
      page.tsx        # Edit Task form
/components
  TaskTile.tsx        # Task tile component
  GoalCard.tsx        # Goal card component
  DeleteModal.tsx    # Delete confirmation modal
/lib
  data.ts             # Data utilities (localStorage)
```

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## Data Storage

Currently uses browser localStorage. To migrate to a database:
- Replace functions in `lib/data.ts` with your database calls
- The data structure is already set up for easy migration

## License

MIT
