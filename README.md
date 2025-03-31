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

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/horizon.git
cd horizon
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the setup script

The easiest way to get started is to run our setup script, which will:
- Create a `.env` file if it doesn't exist
- Run database migrations
- Seed the database with initial data
- Check for OpenAI API key and Qdrant configuration
- Index content if possible

```bash
npm run setup
```

After running this script, you'll be ready to start the development server.

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Manual Configuration (Alternative)

If you prefer to set up manually instead of using the setup script:

### 3. Configure environment variables

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit the `.env` file and set the following values:

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="generate-a-strong-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Add your OpenAI API key for vector search 
# If not provided, the system will use keyword search as fallback
OPENAI_API_KEY=""

# Optional: Configure Qdrant (local or cloud)
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY=""
```

### 4. Set up the database

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed the database with initial data
npm run seed
```

## Setting Up Vector Search (Optional)

For the full semantic search experience, you need to:

1. **Get an OpenAI API Key**: Add this to your `.env` file
2. **Set up Qdrant**:
   - **Option 1**: Run Qdrant using Docker Compose (recommended):
     ```bash
     docker-compose up -d qdrant
     ```
   - **Option 2**: Run Qdrant directly with Docker:
     ```bash
     docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
     ```
   - **Option 3**: Use Qdrant Cloud and add your endpoint/API key to `.env`

3. **Index your content**:
   ```bash
   npm run index:content
   ```

> **Note**: Without an OpenAI API key, the system will automatically fall back to keyword-based search.

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure the `DATABASE_URL` in `.env` is correct
   - Run `npx prisma db push` to ensure schema is applied

2. **Search Not Working**:
   - If using OpenAI, verify your API key is correct
   - If using local Qdrant, check that it's running on port 6333
   - Try running `npm run index:content` to populate the search index

3. **API Route Errors**:
   - Check network tab in browser dev tools for specific errors
   - Make sure all migrations have been applied with `npx prisma migrate dev`

## Project Structure

- `/app`: Next.js application routes and API endpoints
- `/components`: Reusable UI components
- `/lib`: Utility functions, hooks, and database setup
- `/prisma`: Database schema and migrations
- `/public`: Static assets like images and fonts
- `/scripts`: Helper scripts for database seeding and indexing

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


