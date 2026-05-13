import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, X } from 'lucide-react';

const faqs = [
  {
    question: "এই ওয়েবসাইটে ভাড়ার তালিকা কি বিআরটিএ (BRTA) অনুমোদিত?",
    answer: "হ্যাঁ, এই ওয়েবসাইটে প্রদর্শিত সকল ভাড়ার তালিকা বিআরটিএ (BRTA) কর্তৃক নির্ধারিত সর্বশেষ অফিসিয়াল চার্ট অনুযায়ী করা হয়েছে।"
  },
  {
    question: "এই অ্যাপটি কি প্লে-স্টোরে পাওয়া যাবে? বা এটি কীভাবে ফোনে ইনস্টল করব?",
    answer: "বর্তমানে আপনি আপনার ফোনের ব্রাউজার (যেমন: Chrome) ব্যবহার করেই এই ওয়েবসাইটটিকে একটি অ্যাপ হিসেবে ব্যবহার করতে পারেন। এর জন্য আলাদা করে কোনো ফাইল ডাউনলোড করার প্রয়োজন নেই। নিচের ধাপগুলো অনুসরণ করুন:\n\nঅ্যান্ড্রয়েড (Android) ব্যবহারকারীদের জন্য: ১. আপনার মোবাইলের Chrome ব্রাউজারে সাইটটি ওপেন করুন। ২. ব্রাউজারের একদম উপরে ডান কোণায় থাকা তিনটি ডট (⋮) আইকনে ক্লিক করুন। ৩. অপশনগুলো থেকে 'Install app' অথবা 'Add to Home screen' লেখাটিতে ক্লিক করুন। ৪. এখন আপনার ফোনের অ্যাপ লিস্টে বা হোম স্ক্রিনে এটি অ্যাপ হিসেবে চলে আসবে。\n\nআইফোন (iPhone/iOS) ব্যবহারকারীদের জন্য: ১. আপনার আইফোনের Safari ব্রাউজারে সাইটটি ওপেন করুন। ২. নিচে থাকা 'Share' বাটনে (তীর চিহ্নসহ বক্স) ক্লিক করুন। ৩. একটু নিচে স্ক্রল করে 'Add to Home Screen' অপশনে ক্লিক করুন। ৪. এবার 'Add' বাটনে ক্লিক করলে এটি আপনার হোম স্ক্রিনে সেভ হয়ে যাবে।"
  },
  {
    question: "সর্বনিম্ন ভাড়া (Minimum Fare) বর্তমানে কত টাকা?",
    answer: "ঢাকা মেট্রোপলিটন এলাকায় বর্তমানে বড় বাসের জন্য সর্বনিম্ন ভাড়া ১০ টাকা।"
  },
  {
    question: "আমি কি অফলাইনে ভাড়া চেক করতে পারব?",
    answer: "হ্যাঁ, একবার রুট ডেটা লোড হয়ে গেলে আপনি ইন্টারনেট কানেকশন ছাড়াই প্রধান রুটগুলোর ভাড়া চেক করতে পারবেন।"
  },
  {
    question: "বাস কন্ডাক্টর বেশি ভাড়া দাবি করলে আমার কী করা উচিত?",
    answer: "অতিরিক্ত ভাড়া দাবি করলে আপনি অ্যাপে থাকা বিআরটিএ হেল্পলাইন নম্বর বা নিকটস্থ ট্রাফিক পুলিশের সহায়তা নিতে পারেন। অ্যাপের চার্টটি আপনি কন্ডাক্টরকে প্রমাণ হিসেবে দেখাতে পারেন।"
  },
  {
    question: "এই অ্যাপে কি ঢাকার বাইরের বাসের ভাড়া পাওয়া যাবে?",
    answer: "বর্তমানে এই অ্যাপটি শুধুমাত্র ঢাকা মেট্রোপলিটন এলাকার (সিটি সার্ভিস) বাসের ভাড়ার ওপর ফোকাস করছে। তবে ভবিষ্যতে আন্তঃজেলা বাসের ভাড়াও যুক্ত করার পরিকল্পনা রয়েছে।"
  },
  {
    question: "ছাত্র-ছাত্রীদের জন্য কি হাফ পাসের (Half Fare) হিসাব এখানে আছে?",
    answer: "বর্তমানে এই অ্যাপটি সরকারি প্রজ্ঞাপন অনুযায়ী সাধারণ ভাড়া প্রদর্শন করে। হাফ পাসের জন্য আপনি মূল ভাড়ার অর্ধেক (সর্বনিম্ন ভাড়ার শর্ত প্রযোজ্য) নিজে হিসাব করে নিতে পারেন।"
  },
  {
    question: "নির্দিষ্ট কোনো রুটের বাস খুঁজে না পেলে কী করব?",
    answer: "যদি আপনার কাঙ্ক্ষিত রুটটি অ্যাপে না থাকে, তবে 'Contact for advertisement' অপশনের Email এর মাধ্যমে আমাদের জানান। আমরা পরবর্তী আপডেটে সেটি যুক্ত করে দেব।"
  }
];

export function FAQButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-md transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        FAQ
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string, key?: any }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden transition-colors hover:border-slate-300">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 text-left cursor-pointer"
      >
        <span className="font-semibold text-slate-800 flex-1 pr-6">{question}</span>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
        )}
      </button>
      
      {expanded && (
        <div className="p-4 bg-white border-t border-slate-100 text-slate-600 leading-relaxed whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
}
