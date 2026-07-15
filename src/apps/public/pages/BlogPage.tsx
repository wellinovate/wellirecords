import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, ArrowRight, BookOpen, Share2 } from 'lucide-react';
import { welliIcon } from '@/assets';
import WelliFooter from '../../../../components/ui/Footer';

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  content: string[];
}

const POSTS: Post[] = [
  {
    slug: 'your-custom-url-slug',
    title: 'Your Article Title',
    excerpt: 'A short one-sentence summary that will show on the blog listing page.',
    date: 'July 16, 2026',
    readTime: '3 min read',
    author: 'Your Name',
    category: 'Healthcare Tips', // Can be 'Regulations', 'Patient Stories', or 'Healthcare Tips'
    content: [
      'This is the first paragraph of your article.',
      'This is the second paragraph. You can add as many paragraphs as you like here, separated by commas.'
    ]
  },

  {
    slug: 'securing-electronic-health-records-nigeria',
    title: 'Securing Electronic Health Records: How WelliRecord Guards Your Private Data',
    excerpt: 'Discover the security measures behind WelliRecord, including server-side credential isolation, encrypted transfers, and user-controlled data access.',
    date: 'July 16, 2026',
    readTime: '4 min read',
    author: 'WelliRecord Security Team',
    category: 'Healthcare Tips',
    content: [
      'In today’s digital age, security isn’t just a feature of healthcare technology—it is the foundation. As Nigeria shifts toward decentralized electronic health records under the Nigeria Data Protection Act (NDPA) 2023, ensuring that sensitive patient files remain private and tamper-proof is our highest priority at WelliRecord.',
      'To guarantee this privacy, WelliRecord employs a "Sovereign Health Vault" architecture. Unlike traditional hospital systems where data is stored in vulnerable local servers, WelliRecord uses end-to-end encrypted databases and isolates sensitive API keys. In our latest infrastructure upgrade, we moved all artificial intelligence features behind a secure backend proxy. This prevents sensitive credentials from ever being exposed to web browsers or client devices, neutralizing potential security vectors before they can be exploited.',
      'Furthermore, data access is fully in the patient’s hands. Your medical files can only be accessed by doctor credentials after you authorize them with a secure, one-time passcode (OTP) sent directly to your device. This keeps you in absolute control of who sees your history, when, and for how long. At WelliRecord, we believe that security and patient ownership go hand-in-hand to build a healthier, safer Nigeria.'
    ]
  },
  {
    slug: 'owning-your-health-data-nigeria-ndpa-2023',
    title: 'Owning Your Health Data: What the NDPA 2023 Means for Nigerian Patients',
    excerpt: 'Explore how the Nigeria Data Protection Act (NDPA) 2023 shifts health data ownership directly to you, and how to exercise your rights.',
    date: 'July 10, 2026',
    readTime: '5 min read',
    author: 'Dr. Jude Okafor',
    category: 'Regulations',
    content: [
      'For decades, patient records in Nigeria were treated as the property of the hospitals that wrote them down. If you wanted your file, you had to ask for permission. If you changed hospitals, your history stayed behind. But the legal landscape has fundamentally shifted.',
      'Signed into law by the President, the Nigeria Data Protection Act (NDPA) 2023 establishes a clear framework for data privacy, placing the patient at the absolute centre. Under the NDPA, health information is classified as "Sensitive Personal Data," granting it the highest level of protection and granting you, the patient, unambiguous rights.',
      'Key Rights Under the NDPA 2023:',
      '1. Right to Consent: Healthcare providers cannot process, share, or store your health data without your explicit, free, and informed consent.',
      '2. Right to Access & Portability: You have the right to request a complete copy of your records in a structured, commonly used electronic format to take to any other provider.',
      '3. Right to Correction & Erasure: If a record is inaccurate or outdated, you have the right to request immediate correction or deletion.',
      'WelliRecord is built from the ground up to enforce these exact rights. When you register your vault, you become the legal custodian. Providers must request permission to view or write to your record, and you grant it using a secure OTP code.',
      'By digitizing and placing the record in your hands, WelliRecord turns the legal promise of the NDPA 2023 into a practical, everyday reality.'
    ]
  },
  {
    slug: 'simple-allergy-check-saved-life',
    title: 'How a Simple Penicillin Allergy Check Saved a Life',
    excerpt: 'A family emergency in Abuja illustrated why having one secure, instant-access health record matters most when seconds count.',
    date: 'June 28, 2026',
    readTime: '4 min read',
    author: 'WelliRecord Editorial',
    category: 'Patient Stories',
    content: [
      'In a medical emergency, the most important question is often the simplest: "Does the patient have any allergies?" When someone is unconscious or unable to speak, the answer to that question can mean the difference between recovery and fatal complications.',
      'A family emergency in Abuja was the catalyst that started WelliRecord. A patient was rushed to the clinic. The medical team was preparing to administer antibiotics, including penicillin. The patient was unable to communicate, and the family members present were unsure of their complete medical history.',
      'Fortunately, a quick check of an allergy note from a previous consultation at a different clinic was located in a secure personal vault within seconds. The patient had a documented anaphylactic reaction to penicillin. The team immediately switched the treatment course.',
      'This situation is far too common. Most Nigerians visit multiple hospitals, diagnostic labs, and pharmacies over their lifetimes. Their medical history is fragmented across paper folders in different basements. In an emergency, those fragments are inaccessible.',
      'WelliRecord was built to ensure that critical, life-saving information—starting with your severe allergies and blood group—is instantly accessible to responders via a secure QR code on your Emergency Card. It is one trusted record, accessible when it matters.'
    ]
  },
  {
    slug: 'hidden-cost-fragmented-health-records',
    title: 'The Hidden Cost of Fragmented Health Records in Nigeria',
    excerpt: 'Repeated lab tests, diagnostic delays, and dangerous drug interactions. How disjointed medical history costs you time and money.',
    date: 'June 15, 2026',
    readTime: '6 min read',
    author: 'Dr. Amina Bello',
    category: 'Healthcare Tips',
    content: [
      'Have you ever had a doctor order a blood test, only to remember that you had the exact same test done at a diagnostic lab down the street two weeks ago? Or have you had to explain your entire medication history from memory to a new specialist?',
      'Fragmented health records are a massive, hidden tax on Nigerian patients. Because records do not travel between facilities, patients bear the burden of:',
      '• Financial Waste: Paying out-of-pocket to repeat diagnostic scans, x-rays, and lab tests because the new clinic cannot access the previous results.',
      '• Diagnostic Delays: Doctors spending valuable time guessing or waiting for new tests to be run instead of reviewing past trends.',
      '• Prescription Risks: The risk of adverse drug interactions when a doctor prescribes a medication that clashes with something another clinic prescribed.',
      'With WelliRecord, your diagnoses, test results, and prescriptions are unified in a single digital vault. When you visit a partner facility, you simply share your OTP. The doctor sees your history, the lab reviews previous baselines, and the pharmacy verifies your active medications. It saves money, saves time, and protects your health.'
    ]
  }
];

export function BlogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  // Detail view
  if (slug) {
    const post = POSTS.find((p) => p.slug === slug);
    if (!post) {
      return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
          <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <Link to="/" className="flex items-center gap-2.5">
                <img src={welliIcon} alt="WelliRecord" className="h-8 w-8 object-contain" />
                <span className="font-black text-[#071B3F] text-base" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
                  Welli<span className="font-normal text-slate-400">Record</span>™
                </span>
              </Link>
              <Link to="/blog" className="text-sm font-semibold text-[#1e3a8a] hover:underline">
                Back to Blog
              </Link>
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-2xl font-bold text-[#071B3F] mb-4">Article Not Found</h1>
            <p className="text-slate-500 mb-6">The blog post you are looking for does not exist or has been moved.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 bg-[#071B3F] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#0c2d66]">
              <ArrowLeft size={16} /> Back to Blog
            </Link>
          </main>
          <WelliFooter />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
        {/* Dynamic JSON-LD injection for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": post.date,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "WelliRecord",
              "logo": "https://wellirecord.com/welli-icon.png"
            }
          })}
        </script>

        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
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

        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-8">
            <span className="inline-block bg-blue-50 text-[#1e3a8a] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#071B3F] leading-tight tracking-tight mb-4" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-6">
              <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-8 text-base sm:text-lg">
            {post.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <h4 className="font-bold text-[#071B3F] mb-4">Subscribe to WelliRecord Updates</h4>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Get notified when new articles, pilot announcements, and updates are posted.</p>
            <Link to="/#updates" className="inline-flex items-center gap-2 bg-[#071B3F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0c2d66] transition shadow-sm">
              Subscribe to Newsletter <BookOpen size={16} />
            </Link>
          </div>
        </main>

        <WelliFooter />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={welliIcon} alt="WelliRecord" className="h-8 w-8 object-contain" />
            <span className="font-black text-[#071B3F] text-base" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif', letterSpacing: '-0.02em' }}>
              Welli<span className="font-normal text-slate-400">Record</span>™
            </span>
          </Link>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1e3a8a] hover:text-[#071B3F] transition"
          >
            <ArrowLeft size={15} /> Back to Home
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#1e3a8a] mb-3">WelliRecord Journal</p>
          <h1 className="text-4xl font-black tracking-tight text-[#071B3F] sm:text-5xl mb-4" style={{ fontFamily: 'Bricolage Grotesque, Inter, sans-serif' }}>
            Latest Insights & Resources
          </h1>
          <p className="text-slate-500 text-lg leading-8 max-w-2xl mx-auto">
            Stay informed on digital health regulations, patient data rights, and updates on the Abuja pilot program.
          </p>
        </div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {POSTS.map((post) => (
            <div key={post.slug} className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-blue-50 text-[#1e3a8a] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-3">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-lg text-[#071B3F] leading-tight mb-2 hover:text-[#1e3a8a] transition">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-100 mt-4">
                  <span>{post.date}</span>
                  <span className="font-semibold text-[#1e3a8a] hover:underline flex items-center gap-1">
                    <Link to={`/blog/${post.slug}`} className="flex items-center gap-1">Read Article <ArrowRight size={14} /></Link>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <WelliFooter />
    </div>
  );
}
