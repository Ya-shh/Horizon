"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiFolder,
  FiPlus,
  FiSearch,
  FiMenu,
  FiX,
  FiUser,
  FiLogIn,
  FiLogOut,
  FiHeart,
  FiBell,
} from "react-icons/fi";
import Image from "next/image";
import NotificationPanel from "../NotificationPanel";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl">
      <div className="absolute inset-0 bg-background/70 border-b border-white/5"></div>
      <div className="container mx-auto px-6 relative">
        <div className="flex justify-between items-center h-16">
          {/* Logo and desktop nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group" onClick={closeMenu}>
              <Image 
                src="/horizon-logo.svg" 
                alt="Horizon Logo" 
                width={24} 
                height={24} 
                className="mr-2 text-primary group-hover:text-accent transition-colors duration-300" 
              />
              <span className="text-xl font-bold tracking-tight gradient-heading">Horizon</span>
            </Link>
            <nav className="hidden md:flex ml-10 space-x-1">
              <NavLink href="/" active={isActive("/")} onClick={closeMenu}>
                <FiHome className="mr-2" />
                Home
              </NavLink>
              <NavLink href="/categories" active={isActive("/categories")} onClick={closeMenu}>
                <FiFolder className="mr-2" />
                Categories
              </NavLink>
              <NavLink href="/posts/new" active={isActive("/posts/new")} onClick={closeMenu}>
                <FiPlus className="mr-2" />
                New Post
              </NavLink>
            </nav>
          </div>

          {/* Desktop user actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="py-1.5 pl-9 pr-4 rounded-full text-sm bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 w-48 transition-all duration-300 text-foreground placeholder:text-muted-foreground"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>

            {session ? (
              <div className="flex items-center space-x-3">
                <NotificationPanel />
                
                <div className="relative group">
                  <Link
                    href={`/users/${session.user.username || session.user.id}`}
                    className="flex items-center space-x-1"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-8 w-8 rounded-full object-cover border border-white/10 group-hover:border-primary/30 transition-colors duration-300"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all duration-300 group-hover:bg-primary/20">
                        <span className="text-sm font-semibold text-primary">
                          {session.user.name?.charAt(0) || session.user.username?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors duration-300">
                      {session.user.name || session.user.username}
                    </span>
                  </Link>

                  <div className="absolute right-0 mt-2 w-48 hidden group-hover:block">
                    <div className="py-2 rounded-xl gradient-card border border-white/10 shadow-xl">
                      <Link 
                        href={`/users/${session.user.username || session.user.id}`}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-white/5 transition-colors"
                      >
                        <FiUser className="inline-block mr-2" /> Profile
                      </Link>
                      <Link 
                        href={`/users/${session.user.username || session.user.id}/bookmarks`}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-white/5 transition-colors"
                      >
                        <FiHeart className="inline-block mr-2" /> Bookmarks
                      </Link>
                      <div className="border-t border-white/5 my-1"></div>
                      <button 
                        onClick={() => signOut()}
                        className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-white/5 transition-colors"
                      >
                        <FiLogOut className="inline-block mr-2" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/sign-in" 
                  className="text-sm font-medium px-4 py-1.5 rounded-full text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="text-sm font-medium px-4 py-1.5 rounded-full bg-primary/90 hover:bg-primary text-white transition-colors shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-white/5 transition-colors"
            >
              {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-4 pt-3 pb-5 space-y-2 bg-background/80 backdrop-blur-md border-t border-white/5">
          <MobileNavLink href="/" active={isActive("/")} onClick={closeMenu}>
            <FiHome className="mr-3" />
            Home
          </MobileNavLink>
          <MobileNavLink href="/categories" active={isActive("/categories")} onClick={closeMenu}>
            <FiFolder className="mr-3" />
            Categories
          </MobileNavLink>
          <MobileNavLink href="/posts/new" active={isActive("/posts/new")} onClick={closeMenu}>
            <FiPlus className="mr-3" />
            New Post
          </MobileNavLink>
          
          <div className="pt-3 pb-1">
            <div className="border-t border-white/5" />
          </div>

          {session ? (
            <>
              <div className="flex items-center p-2 mb-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-white/10">
                    <span className="text-base font-semibold text-primary">
                      {session.user.name?.charAt(0) || session.user.username?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium">{session.user.name || session.user.username}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
              <MobileNavLink
                href={`/users/${session.user.username || session.user.id}`}
                active={isActive(`/users/${session.user.username || session.user.id}`)}
                onClick={closeMenu}
              >
                <FiUser className="mr-3" />
                Profile
              </MobileNavLink>
              <MobileNavLink
                href={`/users/${session.user.username || session.user.id}/bookmarks`}
                active={isActive(`/users/${session.user.username || session.user.id}/bookmarks`)}
                onClick={closeMenu}
              >
                <FiHeart className="mr-3" />
                Bookmarks
              </MobileNavLink>
              <button
                onClick={() => {
                  signOut();
                  closeMenu();
                }}
                className="w-full flex items-center px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
              >
                <FiLogOut className="mr-3" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <MobileNavLink href="/sign-in" active={isActive("/sign-in")} onClick={closeMenu}>
                <FiLogIn className="mr-3" />
                Sign In
              </MobileNavLink>
              <div className="p-2">
                <Link 
                  href="/sign-up" 
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center px-3 py-2.5 text-sm rounded-lg bg-primary/90 hover:bg-primary text-white transition-colors"
                >
                  <FiUser className="mr-2" />
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ href, active, children, onClick }: NavLinkProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/80 hover:text-primary hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
};

const MobileNavLink = ({ href, active, children, onClick }: NavLinkProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/80 hover:text-primary hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
}; 