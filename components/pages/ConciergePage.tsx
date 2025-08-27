'use client';
import React, { useState, useCallback } from 'react';

interface ConciergePageProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function ConciergePage({ currentPage, setCurrentPage }: ConciergePageProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiry: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 문의 제출 로직
      console.log('Inquiry submitted:', formData);
      // API 호출 로직 추가
      alert('Inquiry submitted successfully!');
      setFormData({ name: '', phone: '', email: '', inquiry: '' });
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  if (currentPage !== 'concierge') return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          <span className=""><span className="animate-pulse">|</span></span>
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">Professional Insurance Transfer Expert Service</p>
      </div>
      
      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50" style={{clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)'}}>
              <h2 className="text-xl md:text-2xl font-extralight text-zinc-900 mb-4 md:mb-6">Professional Concierge Service</h2>
              <div className="space-y-3 md:space-y-4 text-sm md:text-base text-zinc-600 font-light">
                <p>Our team of experts assists with every step of the insurance asset transfer process. From complex legal procedures to international regulatory compliance, we ensure safe and efficient transfers.</p>
                <ul className="space-y-1 md:space-y-2 pl-4">
                  <li>• Legal documentation and review</li>
                  <li>• Transfer process management</li>
                  <li>• Cross-border regulatory compliance</li>
                  <li>• Due diligence and risk assessment</li>
                </ul>
              </div>
              <div className="mt-6 md:mt-8">
                <h3 className="text-base md:text-lg font-light text-zinc-900 mb-3 md:mb-4">Contact Information</h3>
                <div className="space-y-1 md:space-y-2 text-sm md:text-base text-zinc-600 font-light">
                  <p>Email: concierge@wellswap.com</p>
                  <p>Phone: +852 1234 5678</p>
                  <p>Operating Hours: Monday - Friday, 9:00 AM - 6:00 PM (HKT)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">Inquiry Form</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Phone *</label>
                <input 
                  type="tel" 
                  placeholder="Enter your phone number" 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="Enter your email (optional)" 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Inquiry Details *</label>
                <textarea 
                  placeholder="Please provide detailed information about your inquiry"
                  rows={4} 
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors resize-none" 
                  style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
                  value={formData.inquiry}
                  onChange={(e) => handleInputChange('inquiry', e.target.value)}
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transform hover:translate-x-2 hover:translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)'}}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
