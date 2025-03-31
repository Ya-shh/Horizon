import { prisma } from './db/hooks';

// Re-export the Prisma instance with hooks
export const db = prisma; 