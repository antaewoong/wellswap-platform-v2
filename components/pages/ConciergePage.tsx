'use client';
import React, { useState, useCallback } from 'react';
import { TypewriterText } from '../animations/AnimationComponents';

interface ConciergePageProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  inquiry: string;
}

export default function ConciergePage({ currentPage, setCurrentPage }: ConciergePageProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    inquiry: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitStatus !== 'idle') setSubmitStatus('idle');
  }, [submitStatus]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', phone: '', email: '', inquiry: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.message || 'Submission failed');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  if (currentPage !== 'concierge') return null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative">
          <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
            <TypewriterText 
              text="CONCIERGE"
              speed={150}
              delay={500}
              repeat={true}
              pauseAfterComplete={2000}
              className=""
            />
          </h1>
        </div>
        <div className="w-32 h-px bg-zinc-900 mx-auto mb-8"></div>
      </div>
      
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
          Premium white-glove insurance asset transfer service with personalized expertise
        </p>
      </div>
      
      <div className="max-w-6xl mx-auto text-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Service Overview */}
          <div className="space-y-6 text-left">
            <h2 className="text-2xl font-extralight text-zinc-900">Premium Services</h2>
            
            <div className="p-6 border border-zinc-200 bg-zinc-50">
              <h3 className="text-lg font-light text-zinc-900 mb-4">Executive Service</h3>
              <p className="text-zinc-600 font-light mb-4">
                Our elite team includes US-licensed attorneys, MBA business consultants, and certified international accounting professionals.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-zinc-900 text-sm">Legal Documentation & Compliance</h4>
                    <p className="text-zinc-600 font-light text-xs">Expert review and preparation of all required legal documents</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-zinc-900 text-sm">Cross-Border Transfer Management</h4>
                    <p className="text-zinc-600 font-light text-xs">Seamless coordination across Hong Kong, Singapore, and international markets</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-zinc-900 text-sm">24/7 Dedicated Support</h4>
                    <p className="text-zinc-600 font-light text-xs">Round-the-clock assistance with priority response times</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Contact Form */}
          <div className="space-y-6 text-left">
            <h2 className="text-2xl font-extralight text-zinc-900">Request Consultation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  placeholder="+852 / +65 / +1 ..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">Inquiry Details *</label>
                <textarea
                  value={formData.inquiry}
                  onChange={(e) => handleInputChange('inquiry', e.target.value)}
                  rows={4}
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors resize-none"
                  placeholder="Please describe your insurance transfer requirements..."
                  required
                />
              </div>
              
              {submitStatus === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-light">
                  Your consultation request has been submitted successfully. Our team will contact you within 24 hours.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-light">
                  {errorMessage || 'An error occurred. Please try again.'}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Request Premium Consultation'}
              </button>
            </form>
            
            <div className="text-xs text-zinc-500 text-center font-light">
              Your information is protected with bank-level encryption. 
              We will never share your details with third parties.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}