import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { FiChevronLeft, FiMessageSquare, FiCalendar, FiUser, FiEdit, FiMapPin, FiLink, FiThumbsUp, FiAward, FiUsers, FiBookmark, FiStar, FiGlobe } from "react-icons/fi";
import { db } from "@/lib/db";
import { Metadata } from "next";
import AchievementBadge from "@/components/AchievementBadge";
import { achievements, calculateAchievementProgress } from "@/lib/achievements";
import { getServerSession } from "next-auth";
import UserProfileTabs from "@/components/users/UserProfileTabs";
import AchievementShowcase from "@/components/AchievementShowcase";

export async function generateMetadata({
  params
}: {
  params: { username: string }
}): Promise<Metadata> {
  const user = await db.user.findUnique({
    where: { username: params.username },
  });

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name || user.username}'s Profile | Modern Forum`,
    description: `View ${user.name || user.username}'s profile and contributions to the community`,
  };
}

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export default async function UserProfilePage({
  params: { username },
}: UserProfilePageProps) {
  const session = await getServerSession();
  
  // Decode the username (handles special characters in URL)
  const decodedUsername = decodeURIComponent(username);

  // Fetch user with basic data
  const user = await db.user.findUnique({
    where: { username: decodedUsername },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          comments: true
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Check if the current user is viewing their own profile
  const isOwnProfile = session?.user?.email === user.email;

  return (
    <div className="container max-w-6xl py-6 px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
            <div className="flex flex-col items-center">
              {/* User avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-2xl">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* User info */}
              <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
                {user.name || user.username}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
              
              {/* Quick stats */}
              <div className="w-full mt-4 grid grid-cols-2 gap-2 text-center border-t border-b border-gray-100 dark:border-gray-700 py-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user._count.posts}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Posts</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user._count.comments}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Comments</p>
                </div>
              </div>
              
              {/* Additional info */}
              <div className="w-full mt-4 space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                  </span>
                </div>
              </div>
              
              {/* Profile actions (follow button, edit profile, etc.) */}
              <div className="w-full mt-6">
                {isOwnProfile ? (
                  <a
                    href="/settings/profile"
                    className="w-full py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-150"
                  >
                    Edit Profile
                  </a>
                ) : (
                  <button
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150"
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <AchievementShowcase userId={user.id} className="mb-6" />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <UserProfileTabs username={user.username} />
          </div>
        </div>
      </div>
    </div>
  );
} 