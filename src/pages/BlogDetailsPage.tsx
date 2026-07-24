import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

interface BlogPost {
  id: number;
  categoryId: number | null;
  category: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

const CATEGORIES: Record<number, string> = {
  1: 'Actors & Extras',
  3: 'Dancers',
  11: 'MC/RJ/VJ/Voice Over',
};

export default function BlogDetailsPage() {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [prevBlog, setPrevBlog] = useState<BlogPost | null>(null);
  const [nextBlog, setNextBlog] = useState<BlogPost | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogId) return;
    fetchBlogData(parseInt(blogId));
  }, [blogId]);

  const fetchBlogData = async (id: number) => {
    setLoading(true);
    try {
      const [blogRes, allRes] = await Promise.all([
        api.get(`/blogs/${id}`),
        api.get('/blogs', { params: { limit: 100 } }),
      ]);

      if (blogRes.data?.success && blogRes.data?.data) {
        setBlog(blogRes.data.data);
      }

      if (allRes.data?.success && allRes.data?.data?.blogs) {
        const blogs: BlogPost[] = allRes.data.data.blogs;
        setAllBlogs(blogs);

        const currentIndex = blogs.findIndex((b) => b.id === id);
        if (currentIndex > 0) setPrevBlog(blogs[currentIndex - 1]);
        else setPrevBlog(null);
        if (currentIndex < blogs.length - 1) setNextBlog(blogs[currentIndex + 1]);
        else setNextBlog(null);

        const current = blogs.find((b) => b.id === id);
        if (current?.categoryId) {
          setRelatedBlogs(
            blogs.filter((b) => b.categoryId === current.categoryId && b.id !== id).slice(0, 4)
          );
        } else {
          setRelatedBlogs(blogs.filter((b) => b.id !== id).slice(0, 4));
        }
      }
    } catch {
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: string) => {
    if (!image) return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=650';
    if (image.startsWith('http')) return image;
    return `https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/blogs/${image}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6 animate-pulse">
              <div className="aspect-video bg-neutral-200 rounded-2xl" />
              <div className="h-4 bg-neutral-200 rounded w-1/4" />
              <div className="h-8 bg-neutral-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded" />
                <div className="h-4 bg-neutral-200 rounded" />
                <div className="h-4 bg-neutral-200 rounded w-2/3" />
              </div>
            </div>
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-neutral-200 rounded w-1/2" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neutral-500 text-lg">Article not found.</p>
          <Link to="/blogs" className="text-[#C6007E] font-bold text-sm hover:underline">Back to Our Work</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 border-b border-[#f2f2f2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Back link */}
            <Link to="/blogs" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#C6007E] font-bold transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back to Our Work
            </Link>

            {/* Image */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative">
              <img
                src={getImageUrl(blog.image)}
                alt={blog.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/30 via-transparent to-transparent" />
            </div>

            {/* Meta: Date, Category, Posted by */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-neutral-400">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(blog.date)}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span className="text-[#C6007E]">{blog.category}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" />
              <span>Posted by Admin</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl font-black text-neutral-900 leading-tight">
              {blog.title}
            </h1>

            {/* Content */}
            <div className="blog-content text-sm leading-relaxed">
              <ContentView html={blog.description} />
            </div>

            {/* Previous / Next Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-neutral-200">
              {prevBlog ? (
                <Link
                  to={`/blogs/${prevBlog.id}`}
                  className="flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-[#C6007E] transition-colors max-w-[45%]"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span className="truncate">{prevBlog.title}</span>
                </Link>
              ) : <div />}
              {nextBlog ? (
                <Link
                  to={`/blogs/${nextBlog.id}`}
                  className="flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-[#C6007E] transition-colors max-w-[45%] text-right"
                >
                  <span className="truncate">{nextBlog.title}</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Link>
              ) : <div />}
            </div>
          </div>

          {/* Right: Sidebar - Related Blogs */}
          <div className="space-y-6">
            <h3 className="font-display text-lg font-black text-neutral-900">Related Articles</h3>
            {relatedBlogs.length === 0 ? (
              <p className="text-sm text-neutral-400">No related articles.</p>
            ) : (
              <div className="space-y-4">
                {relatedBlogs.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blogs/${related.id}`}
                    className="flex gap-4 p-4 rounded-2xl border border-neutral-200 hover:border-[#C6007E]/30 hover:shadow-md transition-all group"
                  >
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                      <img
                        src={getImageUrl(related.image)}
                        alt={related.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono font-bold text-[#C6007E] block mb-1">{related.category}</span>
                      <h4 className="text-sm font-black text-neutral-900 group-hover:text-[#C6007E] transition-colors line-clamp-2 leading-tight">
                        {related.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function ContentView({ html }: { html: string }) {
  const sanitized = sanitizeContent(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

function sanitizeContent(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined') return html;
  const allowedTags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'iframe', 'blockquote', 'pre', 'code', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'];
  const div = document.createElement('div');
  div.innerHTML = html;
  const nodes = div.querySelectorAll('*');
  nodes.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (!allowedTags.includes(tag)) {
      el.replaceWith(...Array.from(el.childNodes));
      return;
    }
    if (tag === 'iframe') {
      let src = (el as HTMLIFrameElement).getAttribute('src') || '';
      if (!src.startsWith('https://') && !src.startsWith('http://')) {
        src = 'https:' + src;
      }
      (el as HTMLIFrameElement).setAttribute('src', src);
      (el as HTMLIFrameElement).setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
      (el as HTMLIFrameElement).setAttribute('loading', 'lazy');
      (el as HTMLIFrameElement).setAttribute('title', 'YouTube video player');
      (el as HTMLIFrameElement).setAttribute('style', 'width:100%;aspect-ratio:16/9;border-radius:12px;border:none;');
      (el as HTMLIFrameElement).setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    }
    if (tag === 'a') {
      (el as HTMLAnchorElement).setAttribute('target', '_blank');
      (el as HTMLAnchorElement).setAttribute('rel', 'noopener noreferrer');
    }
    if (tag === 'img') {
      (el as HTMLImageElement).setAttribute('loading', 'lazy');
      (el as HTMLImageElement).setAttribute('style', 'max-width:100%;border-radius:12px;');
    }
  });
  return div.innerHTML;
}
