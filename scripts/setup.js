const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Setup script for Horizon development environment
 * This script will:
 * 1. Check if .env file exists
 * 2. Create .env from .env.example if it doesn't
 * 3. Run database migrations
 * 4. Seed the database
 * 5. Verify the presence of Qdrant and OpenAI settings
 */

console.log('🌅 Setting up Horizon development environment...\n');

// Check for .env file and create if needed
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('🔧 Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Created .env file. Please update it with your configuration.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Run database migrations
console.log('🔧 Running database migrations...');
try {
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
  console.log('✅ Database migrations complete.\n');
} catch (error) {
  console.error('❌ Failed to run database migrations. Error:', error.message);
  console.log('⚠️ You may need to create the database first or fix your DATABASE_URL in .env\n');
}

// Seed the database
console.log('🔧 Seeding the database...');
try {
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully.\n');
} catch (error) {
  console.error('❌ Failed to seed the database. Error:', error.message);
}

// Check for OpenAI API key
const envContent = fs.readFileSync(envPath, 'utf8');
const openaiKeyMatch = envContent.match(/OPENAI_API_KEY="([^"]*)"/);
const openaiKey = openaiKeyMatch ? openaiKeyMatch[1] : '';

if (!openaiKey) {
  console.log('⚠️ No OpenAI API key found in .env file.');
  console.log('🔍 Vector search will fall back to keyword-based search.');
  console.log('👉 To enable semantic search, add your OpenAI API key to the .env file.\n');
} else {
  console.log('✅ OpenAI API key found.\n');
  
  // Check if Qdrant is configured and try to index content
  console.log('🔧 Indexing content to Qdrant...');
  try {
    execSync('npm run index:content', { stdio: 'inherit' });
    console.log('✅ Content indexed successfully.\n');
  } catch (error) {
    console.error('❌ Failed to index content. Error:', error.message);
    console.log('⚠️ Make sure Qdrant is running if you want to use vector search.\n');
  }
}

console.log('🎉 Setup complete! You can now start the development server:');
console.log('👉 npm run dev\n');
console.log('🌐 The application will be available at http://localhost:3000\n'); 