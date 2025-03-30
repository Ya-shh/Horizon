"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FiMenu, FiX, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Theme toggle rendering is now safely handled with mounted check
  const renderThemeChanger = () => {
    if (!mounted) return null;
    
    return (
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
      </button>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/" 
                className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                Horizon
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/categories"
                className="border-transparent text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Categories
              </Link>
              <Link
                href="/trending"
                className="border-transparent text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Trending
              </Link>
              <Link
                href="/latest"
                className="border-transparent text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Latest
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {renderThemeChanger()}

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/create-post"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Post
                  </Link>
                  <div className="relative group">
                    <button className="flex text-sm rounded-full focus:outline-none">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                        {session.user?.image ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={session.user.image}
                            alt="User avatar"
                          />
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                            {session.user?.name?.charAt(0) || session.user?.username?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                    </button>
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => signOut()}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => signIn()}
                    className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </button>
                  <Link
                    href="/sign-up"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-4">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/categories"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-base font-medium"
              onClick={toggleMenu}
            >
              Categories
            </Link>
            <Link
              href="/trending"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-base font-medium"
              onClick={toggleMenu}
            >
              Trending
            </Link>
            <Link
              href="/latest"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-base font-medium"
              onClick={toggleMenu}
            >
              Latest
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {session ? (
              <div>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {session.user?.image ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={session.user.image}
                        alt="User avatar"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                          {session.user?.name?.charAt(0) || session.user?.username?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                      {session.user?.name || session.user?.username}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {session.user?.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={toggleMenu}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/create-post"
                    className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={toggleMenu}
                  >
                    Create Post
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      toggleMenu();
                    }}
                    className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <button
                  onClick={() => {
                    signIn();
                    toggleMenu();
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                >
                  Sign in
                </button>
                <Link
                  href="/sign-up"
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                  onClick={toggleMenu}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 