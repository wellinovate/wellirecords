import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { toast } from 'react-toastify';
import { ArrowLeft, PenTool } from 'lucide-react';

export function BlogAdminPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('WelliRecord Admin');
  const [category, setCategory] = useState('Healthcare Tips');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate slug dynamically from title if user doesn't type it
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Convert to lowercase kebab-case slug
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // collapse multiple hyphens
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !excerpt || !author || !content) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Split content by double newlines into paragraph array
      const paragraphArray = content
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      // Estimate read time
      const totalWords = content.split(/\s+/).length;
      const readTimeMins = Math.max(1, Math.ceil(totalWords / 220));
      const readTime = `${readTimeMins} min read`;

      // Date string format: "Month DD, YYYY"
      const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
      const dateStr = new Date().toLocaleDateString('en-US', dateOptions);

      // Save to Firestore
      await setDoc(doc(db, 'blog_posts', slug), {
        title,
        slug,
        excerpt,
        date: dateStr,
        readTime,
        author,
        category,
        content: paragraphArray,
        createdAt: serverTimestamp(),
      });

      toast.success('Blog article published successfully!');
      navigate('/admin/blog');
    } catch (error) {
      console.warn('Firestore write failed, falling back to local storage:', error);
      try {
        const paragraphArray = content
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        const totalWords = content.split(/\s+/).length;
        const readTimeMins = Math.max(1, Math.ceil(totalWords / 220));
        const readTime = `${readTimeMins} min read`;

        const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        const dateStr = new Date().toLocaleDateString('en-US', dateOptions);

        const localPosts = JSON.parse(localStorage.getItem('welli_local_blog_posts') || '[]');
        const newPost = {
          title,
          slug,
          excerpt,
          date: dateStr,
          readTime,
          author,
          category,
          content: paragraphArray,
          createdAt: new Date().toISOString(),
        };

        const filtered = localPosts.filter((p: any) => p.slug !== slug);
        filtered.unshift(newPost);
        localStorage.setItem('welli_local_blog_posts', JSON.stringify(filtered));

        toast.success('Article published successfully (saved locally)!');
        navigate('/admin/blog');
      } catch (err) {
        console.error('Local storage fallback failed:', err);
        toast.error('Failed to publish article.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/blog')}
          className="p-2 rounded-lg hover:bg-slate-800 text-[#58a6ff] transition flex items-center gap-1.5 text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Back to Blog Manager
        </button>
      </div>

      <div className="rounded-2xl border p-6 sm:p-10" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0d1117' }}>
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-6 mb-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#58a6ff] flex items-center justify-center border border-blue-500/20">
            <PenTool size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#e5e7eb] tracking-tight">
              Publish New Article
            </h1>
            <p className="text-xs text-[#8b949e] font-medium">Create a dynamic post that updates instantly on the blog listing.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-[#c9d1d9]">
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-[#8b949e] mb-2">
              Article Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g., The Future of Decentralised Health Records in Nigeria"
              className="w-full px-4 py-3 rounded-xl border outline-none transition text-sm text-[#c9d1d9]"
              style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.15)' }}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-bold text-[#8b949e] mb-2">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., future-of-decentralised-health-records"
              className="w-full px-4 py-3 rounded-xl border outline-none transition text-sm text-[#c9d1d9]"
              style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.15)' }}
            />
            <p className="text-xs text-[#8b949e] mt-1.5">This forms the URL: wellirecord.com/blog/{"{"}slug{"}"}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-bold text-[#8b949e] mb-2">
                Author Name <span className="text-red-500">*</span>
              </label>
              <input
                id="author"
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Dr. Amina Bello"
                className="w-full px-4 py-3 rounded-xl border outline-none transition text-sm text-[#c9d1d9]"
                style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-[#8b949e] mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border outline-none transition text-sm text-[#c9d1d9]"
                style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                <option value="Healthcare Tips">Healthcare Tips</option>
                <option value="Regulations">Regulations</option>
                <option value="Patient Stories">Patient Stories</option>
                <option value="Company News">Company News</option>
              </select>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-bold text-[#8b949e] mb-2">
              Brief Excerpt <span className="text-red-500">*</span>
            </label>
            <input
              id="excerpt"
              type="text"
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A one-sentence summary of the article displayed on the blog list."
              className="w-full px-4 py-3 rounded-xl border outline-none transition text-sm text-[#c9d1d9]"
              style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.15)' }}
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-bold text-[#8b949e] mb-2">
              Article Content (Markdown or Text) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your article here. Use a double line break (press Enter twice) to start a new paragraph."
              className="w-full px-4 py-3 rounded-xl border outline-none transition text-sm text-[#c9d1d9] leading-relaxed"
              style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.15)' }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/blog')}
              className="px-6 py-2.5 rounded-xl border border-slate-700 text-[#c9d1d9] text-sm font-bold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
