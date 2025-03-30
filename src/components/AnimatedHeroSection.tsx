"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FadeIn, RevealText, ParallaxSection } from '@/components/ui/parallax-elements';
import Link from 'next/link';
import { 
  FiTrendingUp, 
  FiMessageCircle, 
  FiBarChart2, 
  FiUsers, 
  FiChevronRight,
  FiThumbsUp,
  FiClock
} from 'react-icons/fi';

interface AnimatedHeroSectionProps {
  title?: string;
  subtitle?: string;
  stats: {
    activeUsers: number;
    dailyDiscussions: number;
    topicsCovered: number;
  };
}

export default function AnimatedHeroSection({
  title = "Discover Ideas & Discussions",
  subtitle = "Join our vibrant community to discuss, share and discover new ideas with like-minded people.",
  stats
}: AnimatedHeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Track container dimensions
  useEffect(() => {
    if (heroRef.current) {
      setDimensions({
        width: heroRef.current.offsetWidth,
        height: heroRef.current.offsetHeight
      });
    }
    
    const handleResize = () => {
      if (heroRef.current) {
        setDimensions({
          width: heroRef.current.offsetWidth,
          height: heroRef.current.offsetHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate spotlight position
  const spotlightX = mousePosition.x / dimensions.width;
  const spotlightY = mousePosition.y / dimensions.height;

  // Format stats with "+" for large numbers
  const formatStat = (value: number): string => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K+`;
    }
    return `${value}+`;
  };
  
  return (
    <div 
      ref={heroRef}
      className="relative overflow-hidden gradient-card rounded-3xl"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Improved gradient spotlight that follows cursor */}
        <div 
          className="absolute w-full h-full opacity-80 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${spotlightX * 100}% ${spotlightY * 100}%, rgba(139, 92, 246, 0.4) 0%, rgba(79, 70, 229, 0.3) 20%, rgba(16, 185, 129, 0.2) 40%, transparent 70%)`
          }}
        />
        
        {/* Enhanced abstract shapes with animation */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.4, 0.7, 0.4],
            rotate: [0, 15, 0]
          }} 
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute top-14 right-14 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, -10, 0]
          }} 
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1], 
            opacity: [0.2, 0.5, 0.2],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }} 
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl"
        />
        
        {/* Improved grid pattern with animation */}
        <motion.div 
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-[linear-gradient(rgba(180,180,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(180,180,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" 
        />
      </div>
      
      {/* Content container */}
      <div className="relative z-10 container mx-auto px-6 py-24 sm:py-32 md:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left content column */}
          <div className="space-y-10">
            <div className="space-y-6">
              <FadeIn direction="up" delay={0.1}>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 text-violet-200 text-sm font-medium mb-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  <FiTrendingUp className="mr-2 h-4 w-4 text-violet-300" />
                  <span className="tracking-wide">Horizon Experience</span>
                </motion.div>
              </FadeIn>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <RevealText 
                  text={title}
                  className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-violet-400 via-indigo-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-md pb-3 relative animate-reveal after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-1/2 after:h-1 after:bg-gradient-to-r after:from-violet-400 after:to-cyan-400 after:rounded-full after:animate-pulse"
                  delay={0.3}
                  staggerChildren={0.02}
                />
              </motion.div>
              
              <FadeIn direction="up" delay={0.5} className="max-w-xl">
                <motion.p 
                  whileInView={{ 
                    opacity: [0, 0.5, 1],
                    y: [10, 5, 0] 
                  }}
                  transition={{ duration: 1 }}
                  className="text-xl text-gray-300 leading-relaxed font-light tracking-wide text-pretty"
                >
                  {subtitle}
                </motion.p>
              </FadeIn>
            </div>
            
            <FadeIn direction="up" delay={0.7}>
              <div className="flex flex-wrap gap-6">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href="/categories" 
                    className="btn-modern inline-flex items-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-indigo-500/30 transition-all duration-300"
                  >
                    Explore Categories
                    <FiChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href="/posts/create" 
                    className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium transition-all border border-white/20 shadow-lg backdrop-blur-sm"
                  >
                    Start a Discussion
                    <FiMessageCircle className="ml-2 h-5 w-5" />
                  </Link>
                </motion.div>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={0.9}>
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(139, 92, 246, 0.3)" }}
                  className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/20 backdrop-blur-sm transition-all duration-300 hover:border-violet-400/30"
                >
                  <motion.p 
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent bg-[size:200%] mb-1"
                  >
                    {formatStat(stats.activeUsers)}
                  </motion.p>
                  <p className="text-sm text-gray-400 tracking-wide">Active Users</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(79, 70, 229, 0.3)" }}
                  className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/20 backdrop-blur-sm transition-all duration-300 hover:border-indigo-400/30"
                >
                  <motion.p 
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent bg-[size:200%] mb-1"
                  >
                    {formatStat(stats.dailyDiscussions)}
                  </motion.p>
                  <p className="text-sm text-gray-400 tracking-wide">Daily Discussions</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.3)" }}
                  className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30"
                >
                  <motion.p 
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent bg-[size:200%] mb-1"
                  >
                    {formatStat(stats.topicsCovered)}
                  </motion.p>
                  <p className="text-sm text-gray-400 tracking-wide">Topics Covered</p>
                </motion.div>
              </div>
            </FadeIn>
          </div>
          
          {/* Right visual column */}
          <div className="relative">
            <FadeIn delay={0.5} className="relative">
              <motion.div 
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative rounded-2xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-500/20"
              >
                {/* 3D tilting card effect with improved animation */}
                <motion.div
                  className="relative bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-900/90 backdrop-blur-lg aspect-[4/3] rounded-2xl overflow-hidden p-6 hover:shadow-lg"
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: 1000
                  }}
                  animate={{
                    rotateX: spotlightY * 15 - 7.5,
                    rotateY: -spotlightX * 15 + 7.5,
                  }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 120
                  }}
                >
                  {/* Enhanced card glare effect */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      background: `linear-gradient(105deg, 
                        rgba(139,92,246,0) 0%, 
                        rgba(139,92,246,${0.2 * spotlightX * spotlightY}) 30%, 
                        rgba(79,70,229,${0.3 * spotlightX * spotlightY}) 50%,
                        rgba(139,92,246,0) 70%)`
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Content inside the card */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-gray-100/90 to-transparent dark:from-gray-800/90">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className="w-3 h-3 rounded-full bg-red-500"
                      />
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className="w-3 h-3 rounded-full bg-yellow-500"
                      />
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className="w-3 h-3 rounded-full bg-green-500"
                      />
                    </div>
                    <div className="text-xs opacity-80 font-medium tracking-wide text-gray-700 dark:text-gray-300">Forum Discussion</div>
                  </div>
                  
                  <div className="mt-10 space-y-8">
                    {/* Post with category tag and metadata */}
                    <div className="space-y-3">
                      {/* Category and timestamp */}
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1"
                      >
                        <motion.span 
                          whileHover={{ scale: 1.05, y: -1 }}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-800 border border-indigo-200 dark:from-violet-900/50 dark:to-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800 shadow-sm"
                        >
                          Web Development
                        </motion.span>
                        <span className="inline-block">•</span>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center text-gray-500 dark:text-gray-400"
                        >
                          <FiClock className="mr-1 h-3 w-3" />
                          2 hours ago
                        </motion.span>
                      </motion.div>
                      
                      {/* Post title with improved styling */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                      >
                        <motion.h3 
                          whileHover={{ 
                            color: "#6366f1",
                            x: 3
                          }}
                          className="text-base font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300 line-clamp-2 mb-2"
                        >
                          Best resources for beginners in web development?
                        </motion.h3>
                      </motion.div>
                      
                      {/* Post content with improved readability */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="space-y-2"
                      >
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                          I'm new to web development and looking for the best resources to get started. Any recommendations for courses, tutorials, or documentation that helped you when you were learning?
                        </p>
                      </motion.div>
                      
                      {/* User info with enhanced hover effects */}
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="flex items-center pt-2"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          className="relative flex-shrink-0"
                        >
                          <img
                            src="https://randomuser.me/api/portraits/men/32.jpg"
                            alt="User"
                            className="h-6 w-6 rounded-full object-cover border border-violet-200 dark:border-violet-800 shadow-sm"
                          />
                        </motion.div>
                        <motion.span 
                          whileHover={{ x: 2, color: "#6366f1" }}
                          className="text-xs font-medium ml-2 text-gray-800 dark:text-gray-200 transition-all duration-300"
                        >
                          Alex Chen
                        </motion.span>
                      </motion.div>
                    </div>
                    
                    {/* Comment section with improved visual separation */}
                    <div className="space-y-3 pt-1">
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.0, duration: 0.5 }}
                          className="flex gap-2 mb-3"
                        >
                          <div className="hidden sm:flex flex-col items-center space-y-1 pt-1">
                            <motion.div 
                              whileHover={{ scale: 1.15, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 border border-indigo-200 dark:from-violet-900/50 dark:to-indigo-900/50 dark:border-indigo-800 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                            >
                              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">12</span>
                            </motion.div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">votes</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-1 mb-1">
                              <motion.img
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                src="https://randomuser.me/api/portraits/women/44.jpg"
                                alt="User"
                                className="h-5 w-5 rounded-full object-cover border border-violet-200 dark:border-violet-800 shadow-sm"
                              />
                              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Emily Wong</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">• 45m ago</p>
                            </div>
                            <motion.p 
                              whileHover={{ x: 2 }}
                              className="text-xs text-gray-700 dark:text-gray-300"
                            >
                              I recommend FreeCodeCamp and The Odin Project for beginners. Both are free and very comprehensive!
                            </motion.p>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2, duration: 0.5 }}
                          className="flex gap-2 mb-2"
                        >
                          <div className="hidden sm:flex flex-col items-center space-y-1 pt-1">
                            <motion.div 
                              whileHover={{ scale: 1.15, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 border border-indigo-200 dark:from-violet-900/50 dark:to-indigo-900/50 dark:border-indigo-800 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                            >
                              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">8</span>
                            </motion.div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">votes</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-1 mb-1">
                              <motion.img
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                src="https://randomuser.me/api/portraits/men/22.jpg"
                                alt="User"
                                className="h-5 w-5 rounded-full object-cover border border-violet-200 dark:border-violet-800 shadow-sm"
                              />
                              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">James Smith</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">• 20m ago</p>
                            </div>
                            <motion.p 
                              whileHover={{ x: 2 }}
                              className="text-xs text-gray-700 dark:text-gray-300"
                            >
                              MDN Docs is great for reference. Also check out CSS Tricks for layout tutorials!
                            </motion.p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Stats and input with enhanced interactive elements */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex space-x-4 text-xs">
                          <motion.div 
                            className="flex items-center rounded-full px-2 py-1 bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-600 border border-indigo-200 dark:from-violet-900/50 dark:to-indigo-900/50 dark:text-indigo-400 dark:border-indigo-800 transition-all duration-300 shadow-sm"
                            whileHover={{ scale: 1.1, y: -2, boxShadow: "0 8px 16px -4px rgba(99,102,241,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiThumbsUp className="mr-1 h-4 w-4" />
                            <span className="font-medium">24</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center rounded-full px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 border border-blue-200 dark:from-blue-900/50 dark:to-cyan-900/50 dark:text-blue-400 dark:border-blue-800 transition-all duration-300 shadow-sm"
                            whileHover={{ scale: 1.1, y: -2, boxShadow: "0 8px 16px -4px rgba(37,99,235,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiMessageCircle className="mr-1 h-4 w-4" />
                            <span className="font-medium">8</span>
                          </motion.div>
                        </div>
                        
                        <motion.div 
                          whileHover={{ x: -2 }}
                          className="flex items-center text-xs text-gray-600 dark:text-gray-400"
                        >
                          <FiUsers className="mr-1 h-4 w-4 text-blue-500" />
                          <span>3 participants</span>
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        className="flex gap-2 items-center"
                      >
                        <motion.div 
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          className="h-6 w-6 rounded-full flex-shrink-0 overflow-hidden border border-violet-200 dark:border-violet-800 shadow-sm"
                        >
                          <img src="https://randomuser.me/api/portraits/men/85.jpg" alt="Current user" className="h-full w-full object-cover" />
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(99,102,241,0.3)" }}
                          className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-full px-3 flex items-center border border-gray-200 dark:border-gray-700 transition-all duration-300"
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">Add a comment...</p>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Enhanced decorative elements with animations */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3],
                  rotate: [0, 15, 0]
                }}
                transition={{ 
                  duration: 12, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl -z-10"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [0, -10, 0]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -top-10 -left-10 w-60 h-60 rounded-full bg-violet-500/20 blur-3xl -z-10"
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
} 