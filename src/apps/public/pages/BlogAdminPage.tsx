import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { toast } from 'react-toastify';
import { ArrowLeft, BookOpen, PenTool, LayoutGrid, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { welliIcon } from '@/assets';
import WelliFooter from '../../../../components/ui/Footer';

export function BlogAdminPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Healthcare Tips');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')         // replace spaces with -
      .replace(/-+/g, '-');         // remove multiple -
    setSlug(generated);
  }, [title]);

  // Pre-fill author name if available in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('ui_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) {
          setAuthor(parsed.name);
        }
      } catch (e) {
        console.error('Failed to parse logged-in user info', e);
      }
    }
  }, []);

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
      await addDoc(collection(db, 'blog_posts'), {
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
      navigate('/blog');
    } catch (error) {
      console.error('Failed to publish article:', error);
      toast.error('Failed to publish article. Please check database permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={welliIcon} alt="WelliRecord" className="h-8 w-8 object-contain" />
            <span className="font-black text-[#071B3F] text-base" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif', letterSpacing: '-0.02em' }}>
              Welli<span className="font-normal text-slate-400">Record</span>™
            </span>
          </Link>
          <Link to="/blog" className="flex items-center gap-1.5 text-sm font-semibold text-[#1e3a8a] hover:text-[#071B3F] transition">
            <ArrowLeft size={15} /> Back to Blog
          </Link>
        </div>
      </header>

      {/* Main Form container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PenTool size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#071B3F] tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
                Publish New Article
              </h1>
              <p className="text-xs text-slate-500 font-medium">Create a dynamic post that updates instantly on the blog listing.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Top 5 Health Tips for the Rainy Season"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>

            {/* Slug & Category */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="slug" className="block text-sm font-bold text-slate-700 mb-2">
                  URL Slug (Auto-generated) <span className="text-red-500">*</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="top-5-health-tips"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-slate-50"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm bg-white"
                >
                  <option value="Healthcare Tips">Healthcare Tips</option>
                  <option value="Regulations">Regulations</option>
                  <option value="Patient Stories">Patient Stories</option>
                </select>
              </div>
            </div>

            {/* Author & Excerpt */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="sm:col-span-1">
                <label htmlFor="author" className="block text-sm font-bold text-slate-700 mb-2">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="author"
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Dr. Amina Bello"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="excerpt" className="block text-sm font-bold text-slate-700 mb-2">
                  Short Excerpt <span className="text-red-500">*</span>
                </label>
                <input
                  id="excerpt"
                  type="text"
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Summarize the article in one or two sentences for the list preview."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Article Content */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="content" className="block text-sm font-bold text-slate-700">
                  Article Content <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Use double Enter to start a new paragraph</span>
              </div>
              <textarea
                id="content"
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article here...&#10;&#10;Use double line-breaks to separate paragraphs."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm leading-relaxed"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#071B3F] hover:bg-[#0c2d66] text-white transition text-sm font-semibold flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Article <BookOpen size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <WelliFooter />
    </div>
  );
}
