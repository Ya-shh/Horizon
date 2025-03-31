const { execSync } = require('child_process');
const path = require('path');

// Run the database migration
console.log('Running prisma migrations...');
execSync('npx prisma migrate deploy', { stdio: 'inherit' });

// Seed the database with initial data
console.log('Seeding the database...');
execSync('npm run seed', { stdio: 'inherit' });

// Index content to Qdrant
console.log('Indexing content to Qdrant vector database...');
execSync('npm run index:content', { stdio: 'inherit' });

console.log('Initialization completed successfully!'); 