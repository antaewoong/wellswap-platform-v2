'use client';
import React, { useState, useCallback } from 'react';

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
        setErrorMessage(result.error || '문의 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  if (currentPage !== 'concierge') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative px-6 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto">
          {/* Premium Typography */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-amber-400 to-orange-500"></div>
              <span className="text-sm font-medium text-amber-600 uppercase tracking-wider">Exclusive Service</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[0.9] text-slate-900 mb-6">
              Premium
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-light">
                Concierge
              </span>
            </h1>
            
            <div className="w-32 h-0.5 bg-gradient-to-r from-slate-900 to-slate-600 mb-8"></div>
            
            <p className="text-xl md:text-2xl text-slate-600 font-light max-w-2xl leading-relaxed">
              White-glove insurance asset transfer service with 
              <span className="text-amber-600 font-medium"> personalized expertise</span> 
              and regulatory compliance
            </p>
          </div>

          {/* Premium Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left Column - Service Overview */}
            <div className="space-y-8">
              
              {/* Premium Service Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 rounded-2xl transform group-hover:scale-105 transition-all duration-700"></div>
                <div className="relative p-8 md:p-10 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light text-slate-900">Executive Service</h2>
                  </div>
                  
                  <p className="text-slate-600 font-light text-lg leading-relaxed mb-8">
                    Our elite team includes US-licensed attorneys, MBA business consultants, venture capital specialists, and certified international accounting professionals who provide comprehensive support throughout your entire asset transfer journey.
                  </p>
                  
                  {/* Premium Features */}
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">Legal Documentation & Compliance</h4>
                        <p className="text-slate-600 font-light text-sm">Expert review and preparation of all required legal documents with international regulatory compliance</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">Cross-Border Transfer Management</h4>
                        <p className="text-slate-600 font-light text-sm">Seamless coordination across jurisdictions including Hong Kong, Singapore, and international markets</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">Due Diligence & Risk Assessment</h4>
                        <p className="text-slate-600 font-light text-sm">Comprehensive evaluation and risk mitigation strategies for complex insurance portfolios</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-1">24/7 Dedicated Support</h4>
                        <p className="text-slate-600 font-light text-sm">Round-the-clock assistance with priority response times and direct access to senior specialists</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expert Team Section */}
              <div className="p-8 md:p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
                <h3 className="text-2xl font-light text-slate-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Expert Advisory Team
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/60 p-6 rounded-xl border border-white/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900">Legal Counsel</h4>
                    </div>
                    <p className="text-slate-600 text-sm font-light leading-relaxed">
                      <strong>US-Licensed Attorneys</strong> specializing in international insurance law, cross-border regulations, and complex asset transfers with expertise in US, Hong Kong, and Singapore jurisdictions.
                    </p>
                  </div>
                  
                  <div className="bg-white/60 p-6 rounded-xl border border-white/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900">Business Strategy</h4>
                    </div>
                    <p className="text-slate-600 text-sm font-light leading-relaxed">
                      <strong>MBA Business Consultants</strong> and venture capital specialists providing strategic insights for portfolio optimization, risk management, and institutional-grade investment strategies.
                    </p>
                  </div>
                  
                  <div className="bg-white/60 p-6 rounded-xl border border-white/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900">Financial Advisory</h4>
                    </div>
                    <p className="text-slate-600 text-sm font-light leading-relaxed">
                      <strong>Certified International Accountants</strong> ensuring tax optimization, regulatory compliance, and comprehensive financial structuring across multiple jurisdictions.
                    </p>
                  </div>
                  
                  <div className="bg-white/60 p-6 rounded-xl border border-white/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900">Innovation Labs</h4>
                    </div>
                    <p className="text-slate-600 text-sm font-light leading-relaxed">
                      <strong>Venture & Startup Experts</strong> leveraging cutting-edge technology and innovative solutions to streamline complex processes and deliver next-generation financial services.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl border border-indigo-200/50">
                  <p className="text-indigo-800 text-sm font-medium text-center">
                    💼 Personalized service matched to your specific needs and portfolio requirements
                  </p>
                </div>
              </div>

              {/* Hong Kong & Singapore Specialized Services */}
              <div className="p-8 md:p-10 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-200/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-slate-900 mb-1">
                      Common Law Jurisdiction Excellence
                    </h3>
                    <p className="text-emerald-700 font-medium text-sm">Hong Kong • Singapore • International Markets</p>
                  </div>
                </div>
                
                <p className="text-slate-600 font-light text-lg leading-relaxed mb-8">
                  Specialized expertise in English Common Law jurisdictions with comprehensive coverage of financial, legal, and corporate structuring services across Asia-Pacific markets.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white/60 p-5 rounded-xl border border-white/30 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">Tax & Accounting Services</h4>
                      </div>
                      <ul className="text-slate-600 text-xs font-light space-y-1">
                        <li>• International tax optimization strategies</li>
                        <li>• Cross-border compliance management</li>
                        <li>• Regulatory reporting & documentation</li>
                        <li>• Multi-jurisdiction tax planning</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/60 p-5 rounded-xl border border-white/30 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-md flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">Corporate Establishment</h4>
                      </div>
                      <ul className="text-slate-600 text-xs font-light space-y-1">
                        <li>• Hong Kong & Singapore incorporation</li>
                        <li>• Offshore corporate structuring</li>
                        <li>• Regulatory licensing & permits</li>
                        <li>• Corporate governance frameworks</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/60 p-5 rounded-xl border border-white/30 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">Estate & Succession Planning</h4>
                      </div>
                      <ul className="text-slate-600 text-xs font-light space-y-1">
                        <li>• International inheritance strategies</li>
                        <li>• Cross-border gift planning</li>
                        <li>• Trust & foundation structures</li>
                        <li>• Succession tax optimization</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/60 p-5 rounded-xl border border-white/30 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">Regulatory Compliance</h4>
                      </div>
                      <ul className="text-slate-600 text-xs font-light space-y-1">
                        <li>• Common Law regulatory expertise</li>
                        <li>• Financial services compliance</li>
                        <li>• Anti-money laundering (AML)</li>
                        <li>• Know Your Customer (KYC) protocols</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 rounded-xl border border-emerald-200/50">
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <p className="text-emerald-800 text-sm font-medium">
                      Complete end-to-end service delivery across all Common Law jurisdictions
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white">
                <h3 className="text-xl font-light mb-6 text-amber-400">Direct Access</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>concierge@wellswap.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span>+852 1234 5678</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span>24/7 Premium Support Available</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Premium Form */}
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl transform rotate-1"></div>
                <div className="relative p-8 md:p-10 bg-white rounded-2xl shadow-2xl border border-slate-200/50">
                  
                  <div className="mb-8">
                    <h2 className="text-3xl font-light text-slate-900 mb-2">Private Consultation</h2>
                    <p className="text-slate-600 font-light mb-4">Schedule your complimentary consultation with our experts</p>
                    <div className="flex items-center gap-2 text-sm text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Matched with US-licensed attorneys & certified specialists</span>
                    </div>
                  </div>
                  
                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800">문의가 성공적으로 접수되었습니다</h4>
                          <p className="text-green-600 text-sm">전문 상담사가 24시간 내에 연락드리겠습니다.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-800">문의 제출 실패</h4>
                          <p className="text-red-600 text-sm">{errorMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Enter your full name" 
                          className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 font-light focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-300 group-hover:bg-white" 
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Phone Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="tel" 
                          placeholder="+852 1234 5678" 
                          className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 font-light focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-300 group-hover:bg-white" 
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Email Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <input 
                          type="email" 
                          placeholder="your.email@company.com (optional)" 
                          className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 font-light focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-300 group-hover:bg-white" 
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Inquiry Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Consultation Details <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <textarea 
                          placeholder="Please describe your insurance transfer requirements, portfolio size, jurisdiction preferences, and any specific concerns you'd like our experts to address..."
                          rows={5} 
                          className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 font-light focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-300 resize-none group-hover:bg-white" 
                          value={formData.inquiry}
                          onChange={(e) => handleInputChange('inquiry', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-medium rounded-xl hover:from-slate-800 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center gap-3">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing Request...
                          </>
                        ) : (
                          <>
                            Request Consultation
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                  
                  {/* Privacy Note */}
                  <p className="mt-6 text-xs text-slate-500 text-center font-light">
                    Your information is protected with bank-level encryption. 
                    We will never share your details with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
