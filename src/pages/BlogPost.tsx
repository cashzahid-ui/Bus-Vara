import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleAd } from '../components/GoogleAd';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">পোস্টটি পাওয়া যায়নি</h1>
        <Link to="/blog" className="text-blue-600 hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> ব্লগে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/blog" className="text-blue-600 hover:underline mb-8 inline-flex items-center gap-2 font-medium">
        <ArrowLeft className="w-4 h-4" /> ব্লগে ফিরে যান
      </Link>
      
      <article className="bg-white rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100 p-6 sm:p-10 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 leading-snug">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-6 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
            <Calendar className="w-4 h-4" />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
        </div>

        <GoogleAd />

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 prose-p:text-lg prose-headings:text-slate-900 prose-strong:text-slate-900 mt-8 mb-8">
          <Markdown>{post.content}</Markdown>
        </div>

        <GoogleAd />
      </article>
    </div>
  );
}
