import Link from "next/link";
import { db } from "@/lib/db";

export default async function DebugPage() {
  // Fetch all posts
  const posts = await db.post.findMany({
    include: {
      user: {
        select: {
          username: true,
          name: true,
        },
      },
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch all categories
  const categories = await db.category.findMany();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="card p-6 bg-card shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Database Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold">{posts.length}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
        </div>
      </div>
      
      <div className="card p-6 bg-card shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">All Posts (Latest First)</h2>
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Title</th>
                <th className="text-left p-2">Author</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b hover:bg-muted/10">
                  <td className="p-2 font-mono text-sm">{post.id}</td>
                  <td className="p-2">{post.title}</td>
                  <td className="p-2">{post.user.name || post.user.username}</td>
                  <td className="p-2">{post.category.name}</td>
                  <td className="p-2">
                    <Link 
                      href={`/posts/${post.id}`}
                      className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/80 transition-colors mr-2"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card p-6 bg-card shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="p-4 bg-muted/10 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-muted-foreground">{category.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 