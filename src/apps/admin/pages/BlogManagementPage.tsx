import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { db } from '@/shared/lib/firebase';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { toast } from 'react-toastify';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  isStatic?: boolean;
}

export function BlogManagementPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts from Firestore and blend with local posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        let fetched: BlogPost[] = [];
        try {
          const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
          
          const fetchPromise = getDocs(q);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore fetch timeout')), 3000)
          );

          const querySnapshot = (await Promise.race([fetchPromise, timeoutPromise])) as any;

          querySnapshot.forEach((doc: any) => {
            const data = doc.data();
            fetched.push({
              slug: data.slug,
              title: data.title,
              excerpt: data.excerpt,
              date: data.date,
              readTime: data.readTime,
              author: data.author,
              category: data.category,
              isStatic: false
            });
          });
        } catch (error) {
          console.warn("Failed to load blog posts from Firestore:", error);
        }

        try {
          const local = JSON.parse(localStorage.getItem('welli_local_blog_posts') || '[]');
          const localMapped = local.map((p: any) => ({ ...p, isStatic: false, isLocal: true }));
          fetched = [...localMapped, ...fetched];
        } catch (e) {
          console.error("Failed to load local blog posts:", e);
        }

        // Add static placeholders for complete list
        const staticPlaceholders: BlogPost[] = [
          {
            slug: 'securing-electronic-health-records-nigeria',
            title: 'Securing Electronic Health Records: How WelliRecord Guards Your Private Data',
            excerpt: 'Discover the security measures behind WelliRecord...',
            date: 'July 16, 2026',
            readTime: '4 min read',
            author: 'WelliRecord Security Team',
            category: 'Healthcare Tips',
            isStatic: true
          },
          {
            slug: 'owning-your-health-data-nigeria-ndpa-2023',
            title: 'Owning Your Health Data: What the NDPA 2023 Means for Nigerian Patients',
            excerpt: 'Explore how the Nigeria Data Protection Act...',
            date: 'July 10, 2026',
            readTime: '5 min read',
            author: 'Dr. Jude Okafor',
            category: 'Regulations',
            isStatic: true
          },
          {
            slug: 'simple-allergy-check-saved-life',
            title: 'How a Simple Penicillin Allergy Check Saved a Life',
            excerpt: 'A family emergency in Abuja...',
            date: 'June 28, 2026',
            readTime: '4 min read',
            author: 'WelliRecord Editorial',
            category: 'Patient Stories',
            isStatic: true
          },
          {
            slug: 'hidden-cost-fragmented-health-records',
            title: 'The Hidden Cost of Fragmented Health Records in Nigeria',
            excerpt: 'Repeated lab tests, diagnostic delays...',
            date: 'June 15, 2026',
            readTime: '6 min read',
            author: 'Dr. Amina Bello',
            category: 'Healthcare Tips',
            isStatic: true
          }
        ];

        // Combine (dynamic first, then static that aren't overridden)
        const combined = [
          ...fetched,
          ...staticPlaceholders.filter(sp => !fetched.some(dp => dp.slug === sp.slug))
        ];

        setPosts(combined);
      } catch (error) {
        console.error("Failed to load posts:", error);
        toast.error("Failed to load blog posts.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }

    try {
      const localPosts = JSON.parse(localStorage.getItem('welli_local_blog_posts') || '[]');
      const isLocal = localPosts.some((p: any) => p.slug === slug);

      if (isLocal) {
        const filtered = localPosts.filter((p: any) => p.slug !== slug);
        localStorage.setItem('welli_local_blog_posts', JSON.stringify(filtered));
        setPosts(prev => prev.filter(p => p.slug !== slug));
        toast.success("Article deleted successfully (removed locally).");
        return;
      }

      await deleteDoc(doc(db, 'blog_posts', slug));
      setPosts(prev => prev.filter(p => p.slug !== slug));
      toast.success("Article deleted successfully.");
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast.error("Failed to delete article. Check database permissions.");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#e5e7eb]">Blog Manager</h1>
          <p className="text-sm mt-1 text-[#8b949e]">Publish, view, and manage articles on the WelliRecord blog.</p>
        </div>
        <button
          onClick={() => navigate('/admin/blog/write')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition hover:opacity-90"
          style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}
        >
          <Plus size={14} /> Write Article
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm">Loading articles...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d1117' }}>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr style={{ background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="p-4 font-bold text-[#8b949e]">Title</th>
                <th className="p-4 font-bold text-[#8b949e]">Category</th>
                <th className="p-4 font-bold text-[#8b949e]">Author</th>
                <th className="p-4 font-bold text-[#8b949e]">Publish Date</th>
                <th className="p-4 font-bold text-[#8b949e]">Source</th>
                <th className="p-4 text-center font-bold text-[#8b949e]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'rgba(255,255,255,0.06)' }}>
              {posts.map((post) => (
                <tr key={post.slug} className="hover:bg-[#161b22]/50 transition border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <td className="p-4 font-semibold text-[#c9d1d9] max-w-xs truncate">{post.title}</td>
                  <td className="p-4 text-[#8b949e]">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                      {post.category}
                    </span>
                  </td>
                  <td className="p-4 text-[#c9d1d9]">{post.author}</td>
                  <td className="p-4 text-[#8b949e]">{post.date}</td>
                  <td className="p-4">
                    {post.isStatic ? (
                      <span className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>Codebase</span>
                    ) : (
                      <span className="text-xs text-[#58a6ff] font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(88,166,255,0.1)' }}>Database</span>
                    )}
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-800 text-[#58a6ff] transition"
                      title="View Live"
                    >
                      <ExternalLink size={16} />
                    </a>
                    {!post.isStatic ? (
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="p-2 rounded-lg hover:bg-red-950/40 text-[#ff7b72] transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="p-2 opacity-30 cursor-not-allowed text-[#8b949e]"
                        title="Codebase posts cannot be deleted"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
