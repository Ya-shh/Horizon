import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FiHome, FiPlus, FiMessageCircle, FiTrendingUp, FiUsers, FiCompass } from "react-icons/fi";
import { db } from "@/lib/db";
import {
  FiArrowRight,
  FiClock,
  FiUser,
  FiThumbsUp,
  FiBookmark,
  FiCode,
  FiBarChart2,
  FiGlobe,
  FiShield,
  FiBookOpen,
} from "react-icons/fi";
import AnimatedHeroSection from "@/components/AnimatedHeroSection";
import { NoiseTexture, FloatingParticles, AnimatedGradientBackground } from "@/components/ui/animated-background";
import { FadeIn, ParallaxSection } from "@/components/ui/parallax-elements";
import DiscussionCard from "@/components/ui/discussion-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Calculate vote score from votes array
function calculateVoteScore(votes: any[]) {
  return votes.reduce((acc, vote) => acc + vote.value, 0);
}

// Get date from X days ago
function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export default async function HomePage() {
  // Fetch latest posts
  const latestPosts = await db.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      category: true,
      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
      votes: true,
    },
  });

  // Fetch popular categories
  const categories = await db.category.findMany({
    take: 5,
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  // Get total number of active users (users with activity in the last 30 days)
  const thirtyDaysAgo = getDateDaysAgo(30);
  const activeUsersCount = await db.user.count({
    where: {
      OR: [
        { posts: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { comments: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { votes: { some: { createdAt: { gte: thirtyDaysAgo } } } },
      ],
    },
  });

  // Get number of discussions posted in the last 24 hours
  const oneDayAgo = getDateDaysAgo(1);
  const dailyDiscussionsCount = await db.post.count({
    where: {
      createdAt: { gte: oneDayAgo },
    },
  });

  // Get total number of categories (topics)
  const topicsCount = await db.category.count();

  // Prepare stats for the hero section
  const forumStats = {
    activeUsers: activeUsersCount,
    dailyDiscussions: dailyDiscussionsCount,
    topicsCovered: topicsCount,
  };

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <AnimatedGradientBackground />
      <FloatingParticles particleCount={60} color="mixed" />
      <NoiseTexture opacity={0.03} />
      
      <div className="space-y-12 container mx-auto px-4 max-w-screen-xl pt-6 pb-16">
        {/* Hero section */}
        <section className="py-8">
          <AnimatedHeroSection 
            title="Horizon"
            subtitle="Join our vibrant community to discuss, share and discover innovative concepts with passionate thinkers worldwide."
            stats={forumStats}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - Latest discussions */}
          <div className="lg:col-span-2 space-y-8">
            <FadeIn direction="up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Latest Discussions</h2>
                <Link
                  href="/posts"
                  className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  View all
                  <FiArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </FadeIn>

            <div className="space-y-6">
              {latestPosts.map((post, index) => (
                <FadeIn key={post.id} direction="up" delay={index * 0.1} distance={20}>
                  <ParallaxSection speed={5} className="card-modern hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Vote count */}
                        <div className="hidden sm:flex flex-col items-center space-y-1 pt-2">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100/10 border border-indigo-200/20">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {calculateVoteScore(post.votes)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">votes</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <Link
                              href={`/categories/${post.category.slug}`}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100/10 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100/20 transition-colors"
                            >
                              {post.category.name}
                            </Link>
                            <span className="inline-block">•</span>
                            <span className="inline-flex items-center">
                              <FiClock className="mr-1 h-3 w-3" />
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <Link href={`/posts/${post.id}`}>
                            <h3 className="text-xl font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                              {post.title}
                            </h3>
                          </Link>
                          
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="relative flex-shrink-0">
                                {post.user.image ? (
                                  <img
                                    src={post.user.image}
                                    alt={post.user.name || post.user.username}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                    <FiUser className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                )}
                              </div>
                              <Link
                                href={`/users/${post.user.username}`}
                                className="text-sm font-medium ml-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                {post.user.name || post.user.username}
                              </Link>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              {/* Mobile vote display */}
                              <div className="flex items-center sm:hidden">
                                <FiThumbsUp className="mr-1 h-4 w-4" />
                                <span>{calculateVoteScore(post.votes)}</span>
                              </div>
                              <div className="flex items-center">
                                <FiMessageCircle className="mr-1 h-4 w-4" />
                                <span>{post._count.comments}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ParallaxSection>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Welcome card */}
            <FadeIn direction="left" delay={0.3}>
              <div className="card-modern overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Welcome to Horizon!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Where ideas connect and communities thrive together.
                  </p>
                  <div className="space-y-2">
                    <Link
                      href="/sign-up"
                      className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                    >
                      Join Community
                    </Link>
                    <Link
                      href="/sign-in"
                      className="block w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg text-center border border-gray-200 dark:border-gray-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Popular categories */}
            <FadeIn direction="left" delay={0.5}>
              <div className="card-modern">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Popular Categories</h3>
                  <div className="space-y-4">
                    {categories.map((category, index) => (
                      <FadeIn key={category.id} direction="left" delay={0.1 + index * 0.1}>
                        <Link
                          href={`/categories/${category.slug}`}
                          className="flex items-center justify-between group p-2 hover:bg-gray-100/20 dark:hover:bg-gray-800/30 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100/10 flex items-center justify-center border border-indigo-200/20">
                              {getCategoryIcon(category.name)}
                            </div>
                            <div>
                              <h4 className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {category.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {category._count.posts} {category._count.posts === 1 ? "post" : "posts"}
                              </p>
                            </div>
                          </div>
                          <FiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1" />
                        </Link>
                      </FadeIn>
                    ))}
                  </div>
                  <Link
                    href="/categories"
                    className="mt-4 flex items-center justify-center w-full py-2 px-4 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    View All Categories
                    <FiArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  
  if (name.includes("tech") || name.includes("programming")) {
    return <FiCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
  } else if (name.includes("business") || name.includes("finance")) {
    return <FiBarChart2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
  } else if (name.includes("travel") || name.includes("world")) {
    return <FiGlobe className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
  } else if (name.includes("gaming") || name.includes("entertainment")) {
    return <FiBookmark className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
  } else if (name.includes("health") || name.includes("fitness")) {
    return <FiShield className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
  } else {
    return <FiBookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
  }
}
