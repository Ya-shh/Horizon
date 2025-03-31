"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiLoader, FiMessageCircle, FiFolder, FiUser } from 'react-icons/fi';

interface SearchResult {
  id: string;
  type: 'post' | 'comment' | 'category';
  title?: string;
  content?: string;
  name?: string;
  description?: string;
  username?: string;
  userName?: string;
  categoryName?: string;
  postTitle?: string;
  postId?: string;
  slug?: string;
  score: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`);
        
        if (!response.ok) {
          throw new Error('Search request failed');
        }
        
        const data = await response.json();
        
        if (data.results) {
          setResults(data.results);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error performing search:', err);
        setError('An error occurred while searching. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [query]);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FiMessageCircle className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <FiMessageCircle className="w-5 h-5 text-green-500" />;
      case 'category':
        return <FiFolder className="w-5 h-5 text-purple-500" />;
      default:
        return <FiUser className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'post':
        return `/posts/${result.id}`;
      case 'comment':
        return `/posts/${result.postId}#comment-${result.id}`;
      case 'category':
        return `/categories/${result.slug || result.id}`;
      default:
        return '#';
    }
  };
  
  const getResultTitle = (result: SearchResult) => {
    switch (result.type) {
      case 'post':
        return result.title || 'Untitled Post';
      case 'comment':
        return `Comment on: ${result.postTitle}`;
      case 'category':
        return result.name || 'Unnamed Category';
      default:
        return 'Unknown result';
    }
  };
  
  const getResultSubtitle = (result: SearchResult) => {
    switch (result.type) {
      case 'post':
        return `Posted in ${result.categoryName} by ${result.userName || result.username}`;
      case 'comment':
        return `By ${result.userName || result.username}`;
      case 'category':
        return result.description || 'No description';
      default:
        return '';
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        Search Results for "{query}"
      </h1>
      
      <p className="text-muted-foreground mb-6">
        {isLoading 
          ? 'Searching...' 
          : results.length > 0 
            ? `Found ${results.length} result${results.length === 1 ? '' : 's'}`
            : 'No results found'
        }
      </p>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <FiLoader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-900 text-red-200 p-4 rounded-lg border-2 border-red-700">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-12 text-center">
          <p className="text-lg text-white">No results found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-2">
            Try using different keywords or check your spelling.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={getResultLink(result)}
              className="block bg-gray-800 border-2 border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start">
                <div className="mt-1 mr-4 p-3 bg-gray-700 rounded-full">
                  {getEntityIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-medium text-white">
                      {getResultTitle(result)}
                    </h2>
                    <span className="ml-2 text-sm text-blue-300 bg-blue-900 px-2 py-1 rounded-full whitespace-nowrap">
                      {Math.round(result.score * 100)}% match
                    </span>
                  </div>
                  <p className="text-sm text-blue-300 mt-1">
                    {getResultSubtitle(result)}
                  </p>
                  {result.content && (
                    <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                      {result.content}
                    </p>
                  )}
                  <div className="mt-3 flex items-center">
                    <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 font-medium rounded-full capitalize">
                      {result.type}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 