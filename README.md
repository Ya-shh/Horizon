# Horizon - Modern Discussion Forum Platform

A next-generation community platform with semantic search powered by Qdrant vector database.

![Horizon Logo](public/horizon-logo.svg)

## Features

- **Modern UI**: Clean, responsive interface with dark mode support
- **Organized Categories**: Browse discussions by topic
- **Threaded Conversations**: Nested comments for better discussion flow
- **Vector Search**: Semantic search using Qdrant and OpenAI embeddings
- **User Profiles**: Customizable user profiles with achievements
- **Authentication**: Secure user authentication with NextAuth
- **Bookmarks**: Save favorite discussions for later
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **UI**: TailwindCSS 
- **Database**: Prisma with SQLite (easily switchable to PostgreSQL)
- **Authentication**: NextAuth.js
- **Search**: Qdrant vector database with OpenAI embeddings
- **State Management**: React hooks

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- Git
- Docker (for running Qdrant vector database)

## Getting Started: Complete Setup Guide

For the best experience, follow these steps in order:

### 1. Clone the repository

```bash
git clone https://github.com/Ya-shh/Horizon.git
cd Horizon
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Docker and launch the Qdrant container

Make sure Docker is running on your system, then start the Qdrant vector database:

```bash
docker-compose up -d
```

This will start Qdrant in the background with data persistence.

### 4. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default configuration in the `.env` file should work out of the box for local development:

```
DATABASE_URL="file:/Users/yourname/path-to-project/Horizon/prisma/dev.db"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000" 

# Optional: Add your OpenAI API key for semantic vector search
# If not provided, the system will use keyword search as fallback
OPENAI_API_KEY=""

# Qdrant Configuration - already set for local development
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY=""
```

**Important:** Update the `DATABASE_URL` to include the full absolute path to your project's database file.

### 5. Run the setup script

```bash
npm run setup
```

The setup script performs the following operations:
- Creates a `.env` file if it doesn't exist
- Runs database migrations
- Seeds the database with initial data
- Checks for OpenAI API key and Qdrant configuration
- Prepares vector collections in Qdrant

> **Note:** If you encounter Prisma validation errors during setup, you may need to run these commands manually:
> ```bash
> npx prisma format
> npx prisma generate
> npx prisma migrate dev --name init
> npx prisma db seed
> ```

### 6. Start the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Setting Up Vector Search (For Advanced Features)

For the full semantic search experience, you need an OpenAI API key:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Update your `.env` file with the key:
   ```
   OPENAI_API_KEY="your-openai-api-key"
   ```
3. Index your content to populate the vector database:
   ```bash
   npm run index:content
   ```

Without an OpenAI API key, the system will automatically fall back to keyword-based search which still works well.

## Troubleshooting Common Issues

### Database and Prisma Issues
- If you encounter Prisma schema validation errors during setup (e.g., missing relation fields), run these commands in sequence:
  ```bash
  npx prisma format
  npx prisma generate
  npx prisma migrate dev --name init
  npx prisma db seed
  ```

- If you see "unique constraint failed" errors during seeding, it means the database already has data - this is usually fine and you can proceed

### Docker / Qdrant Issues
- Verify Docker is running with `docker ps`
- Check Qdrant is running with `curl http://localhost:6333/readiness`
- Restart the container with `docker-compose restart qdrant`

### TypeScript Files Not Running
- If you encounter issues with TypeScript files like `Error: Unknown file extension ".ts"`:
  ```bash
  npm install -D typescript ts-node @types/node
  ```

## Project Structure

- `/app`: Next.js application routes and API endpoints
- `/components`: Reusable UI components
- `/lib`: Utility functions, hooks, and database setup
- `/prisma`: Database schema and migrations
- `/public`: Static assets like images and fonts
- `/scripts`: Helper scripts for database seeding and indexing

## API Reference

The platform provides several API endpoints:

- `/api/search` - Vector or keyword search across all content
- `/api/posts` - CRUD operations for discussion posts
- `/api/comments` - Comment management
- `/api/categories` - Content categories
- `/api/users` - User information
- `/api/auth/*` - Authentication (powered by NextAuth)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for an amazing React framework
- Prisma team for the excellent ORM
- TailwindCSS for the utility-first styling
- NextAuth.js for simplified authentication
- Qdrant team for the vector database
- OpenAI for embeddings API
- The open-source community for inspiration


