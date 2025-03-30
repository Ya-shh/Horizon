const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');
const { faker } = require('@faker-js/faker');

// Set faker to use English locale only
const { faker: englishFaker } = require('@faker-js/faker/locale/en');

const prisma = new PrismaClient();

async function cleanup() {
  // Delete all existing data in reverse order of dependencies
  console.log('Cleaning up existing data...');
  
  try {
    // Delete data using Prisma's deleteMany instead of raw SQL
    await prisma.vote.deleteMany({});
    console.log('Votes deleted');
    
    await prisma.comment.deleteMany({});
    console.log('Comments deleted');
    
    await prisma.post.deleteMany({});
    console.log('Posts deleted');
    
    await prisma.category.deleteMany({});
    console.log('Categories deleted');
    
    await prisma.user.deleteMany({});
    console.log('Users deleted');
    
    // If the models below exist, attempt to delete them too
    try { await prisma.notification.deleteMany({}); } catch (e) { console.log('No notifications to delete'); }
    try { await prisma.bookmark.deleteMany({}); } catch (e) { console.log('No bookmarks to delete'); }
    try { await prisma.categoryFollow.deleteMany({}); } catch (e) { console.log('No category follows to delete'); }
    try { await prisma.follow.deleteMany({}); } catch (e) { console.log('No follows to delete'); }
    try { await prisma.userAchievement.deleteMany({}); } catch (e) { console.log('No user achievements to delete'); }
    try { await prisma.session.deleteMany({}); } catch (e) { console.log('No sessions to delete'); }
    try { await prisma.account.deleteMany({}); } catch (e) { console.log('No accounts to delete'); }
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
  
  console.log('All existing data deleted.');
}

async function seedUsers(count = 10) {
  console.log(`Creating ${count} users...`);
  
  // Create admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@horizon.com',
      username: 'admin',
      password: adminPassword,
    },
  });
  
  // Create regular users
  const users = [admin];
  
  for (let i = 0; i < count - 1; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.userName({ firstName, lastName }).toLowerCase();
    
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName, provider: 'horizon.com' }),
        username: username.replace(/[^a-z0-9]/g, ''),
        password: await hash('password123', 10),
      },
    });
    
    users.push(user);
  }
  
  console.log(`Created ${users.length} users.`);
  return users;
}

async function seedCategories(users) {
  console.log('Creating categories...');
  
  const categoryData = [
    {
      name: 'Technology',
      description: 'Discussions about the latest in tech, programming, and digital innovation',
      slug: 'technology',
    },
    {
      name: 'Science',
      description: 'Scientific discoveries, research, and discussions',
      slug: 'science',
    },
    {
      name: 'Business',
      description: 'Entrepreneurship, startups, finance, and market trends',
      slug: 'business',
    },
    {
      name: 'Health',
      description: 'Health, wellness, fitness, and medical breakthroughs',
      slug: 'health',
    },
    {
      name: 'Arts & Culture',
      description: 'Art, literature, music, film, and cultural discussions',
      slug: 'arts-culture',
    },
    {
      name: 'Education',
      description: 'Learning resources, educational discussions, and academic topics',
      slug: 'education',
    },
    {
      name: 'Gaming',
      description: 'Video games, tabletop games, and gaming culture',
      slug: 'gaming',
    },
  ];
  
  const categories = [];
  
  for (const data of categoryData) {
    // Randomly select a creator from the users list
    const creator = users[Math.floor(Math.random() * users.length)];
    
    const category = await prisma.category.create({
      data: {
        ...data,
        creatorId: creator.id,
      },
    });
    
    categories.push(category);
  }
  
  console.log(`Created ${categories.length} categories.`);
  return categories;
}

async function seedPosts(users, categories, count = 40) {
  console.log(`Creating ${count} posts...`);
  
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    // Randomly select a user and category
    const user = users[Math.floor(Math.random() * users.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Generate English titles based on the category
    let title;
    const categoryName = category.name.toLowerCase();
    
    if (categoryName.includes('tech')) {
      title = `${englishFaker.hacker.adjective()} ${englishFaker.hacker.noun()} in ${englishFaker.hacker.ingverb()}`;
    } else if (categoryName.includes('business')) {
      title = `The future of ${englishFaker.company.buzzNoun()} in ${englishFaker.company.buzzAdjective()} industry`;
    } else if (categoryName.includes('science')) {
      title = `New research on ${englishFaker.science.chemicalElement()} shows promising results`;
    } else if (categoryName.includes('health')) {
      title = `${englishFaker.science.chemicalElement()} might be the key to better health`;
    } else if (categoryName.includes('gaming')) {
      title = `What makes ${englishFaker.company.name()} games so addictive?`;
    } else {
      title = englishFaker.lorem.sentence(4).slice(0, -1);
    }
    
    // Generate English paragraphs for the content
    const content = englishFaker.lorem.paragraphs(englishFaker.number.int({ min: 1, max: 3 }));
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId: user.id,
        categoryId: category.id,
        createdAt: englishFaker.date.recent({ days: 30 }),
      },
    });
    
    posts.push(post);
  }
  
  console.log(`Created ${posts.length} posts.`);
  return posts;
}

async function seedComments(users, posts, count = 100) {
  console.log(`Creating ${count} comments...`);
  
  const comments = [];
  
  // Create initial comments
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const post = posts[Math.floor(Math.random() * posts.length)];
    
    const comment = await prisma.comment.create({
      data: {
        content: englishFaker.lorem.paragraph(),
        userId: user.id,
        postId: post.id,
        createdAt: englishFaker.date.recent({ days: 20 }),
      },
    });
    
    comments.push(comment);
  }
  
  // Create some replies (nested comments)
  const repliesCount = Math.floor(count * 0.4); // 40% of additional comments will be replies
  
  for (let i = 0; i < repliesCount; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const parentComment = comments[Math.floor(Math.random() * comments.length)];
    
    const reply = await prisma.comment.create({
      data: {
        content: englishFaker.lorem.paragraph(),
        userId: user.id,
        postId: parentComment.postId,
        parentId: parentComment.id,
        createdAt: englishFaker.date.recent({ days: 15 }),
      },
    });
    
    comments.push(reply);
  }
  
  console.log(`Created ${comments.length} comments (including replies).`);
  return comments;
}

async function seedVotes(users, posts, comments) {
  console.log('Creating votes...');
  
  const votes = [];
  
  // Create votes for posts
  for (const post of posts) {
    // Determine a random number of votes for this post
    const numVotes = Math.floor(Math.random() * 15) + 1;
    const selectedUsers = faker.helpers.arrayElements(users, numVotes);
    
    for (const user of selectedUsers) {
      // 80% chance of upvote, 20% chance of downvote
      const value = Math.random() < 0.8 ? 1 : -1;
      
      try {
        const vote = await prisma.vote.create({
          data: {
            value,
            userId: user.id,
            postId: post.id,
            createdAt: faker.date.recent({ days: 10 }),
          },
        });
        
        votes.push(vote);
      } catch (error) {
        // Skip if there's a unique constraint violation
        console.log(`Skipping duplicate vote from user ${user.id} on post ${post.id}`);
      }
    }
  }
  
  // Create votes for comments
  for (const comment of comments) {
    // 50% chance of getting votes
    if (Math.random() < 0.5) {
      const numVotes = Math.floor(Math.random() * 5) + 1;
      const selectedUsers = faker.helpers.arrayElements(users, numVotes);
      
      for (const user of selectedUsers) {
        // 85% chance of upvote, 15% chance of downvote for comments
        const value = Math.random() < 0.85 ? 1 : -1;
        
        try {
          const vote = await prisma.vote.create({
            data: {
              value,
              userId: user.id,
              commentId: comment.id,
              createdAt: faker.date.recent({ days: 5 }),
            },
          });
          
          votes.push(vote);
        } catch (error) {
          // Skip if there's a unique constraint violation
          console.log(`Skipping duplicate vote from user ${user.id} on comment ${comment.id}`);
        }
      }
    }
  }
  
  console.log(`Created ${votes.length} votes.`);
  return votes;
}

async function main() {
  try {
    // Clean up existing data
    await cleanup();
    
    // Seed new data
    const users = await seedUsers(15);
    const categories = await seedCategories(users);
    const posts = await seedPosts(users, categories, 40);
    const comments = await seedComments(users, posts, 100);
    await seedVotes(users, posts, comments);
    
    console.log('Database reset and seed completed successfully!');
  } catch (error) {
    console.error('Error resetting and seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 