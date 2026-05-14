import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import { GoogleAd } from '../components/GoogleAd';

export default function Blog() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          আমাদের ব্লগ
        </h1>
        <p className="text-slate-600">ঢাকা শহরের বাস যাতায়াত, সিটিং সার্ভিস এবং অন্যান্য গুরুত্বপূর্ণ তথ্য</p>
      </div>

      <GoogleAd />

      <div className="grid gap-6 md:grid-cols-2">
        {blogPosts.map(post => (
          <Link 
            key={post.slug} 
            to={`/blog/${post.slug}`}
            className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
          >
            <div className="p-6 flex flex-col h-full">
              <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-600 mb-4 line-clamp-2 flex-grow">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-auto">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
