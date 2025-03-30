import Link from "next/link";
import { db } from "@/lib/db";
import { FiFolder, FiMessageSquare, FiUser, FiChevronRight } from "react-icons/fi";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
      creator: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto pt-8 pb-16 px-4 sm:px-6">
      <div className="relative">
        {/* Aurora background effect */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl opacity-20"></div>
        
        {/* Categories Header */}
        <div className="relative mb-8 text-center">
          <h1 className="text-4xl font-bold text-gradient mb-4">Forum Categories</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our community categories and find discussions on topics that interest you.
            Each category contains posts from community members.
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="bg-background border border-border hover:border-primary/20 rounded-xl p-6 transition-all hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FiFolder className="h-6 w-6 text-primary" />
                </div>
                <FiChevronRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                {category.name}
              </h2>
              
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <FiMessageSquare className="mr-1" />
                  <span>{category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <FiUser className="mr-1" />
                  <span>
                    {category.creator.name || category.creator.username}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 