# AI Forum - Next-Generation Community Platform

A modern, AI-enhanced forum application designed to replace traditional platforms like Reddit, Quora, and Twitter. Built with performance, scalability, and user experience in mind.

## Key Features

- **Organized Categories**: Browse discussions by topic and interests
- **Threaded Conversations**: Nested comments for better discussion flow
- **Upvoting System**: Help the best content rise to the top
- **Mobile-Responsive Design**: Perfect experience on all devices
- **Dark Mode Support**: Easy on the eyes in low-light environments
- **User Authentication**: Secure account creation and login
- **Permission Management**: Control who can do what
- **Moderation Tools**: Keep communities healthy and on-topic

## Tech Stack

- **Frontend**: Next.js 14 with App Router and React
- **Styling**: Tailwind CSS for responsive design
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React hooks for local state
- **Deployment**: Ready for Vercel deployment

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-forum.git
   cd ai-forum
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```
   # Copy the example env file
   cp .env.example .env
   
   # Edit the DATABASE_URL and other settings
   ```

4. Set up the database:
   ```bash
   # Run Prisma migrations
   npx prisma migrate dev
   
   # Seed the database (optional)
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a relational database with the following main entities:

- **Users**: Account information and profiles
- **Categories**: Topic areas for organizing discussions
- **Posts**: Main discussion threads
- **Comments**: Responses to posts or other comments
- **Votes**: Upvotes/downvotes for posts and comments

## API Endpoints

The application provides the following API endpoints:

- **/api/auth/[...nextauth]**: Authentication endpoints
- **/api/register**: User registration
- **/api/categories**: List and create categories
- **/api/posts**: List and create posts
- **/api/posts/[postId]/comments**: Comments for a specific post
- **/api/votes**: Voting functionality

## Future Enhancements

- Real-time chat and notifications
- AI-powered content recommendations
- Advanced search capabilities
- Content moderation with ML
- Community features (polls, events)

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

- Next.js team for an amazing framework
- Prisma team for the best ORM experience
- TailwindCSS for simplifying styling
- The open-source community for inspiration
