'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface InsuranceListing {
  id: string;
  company: string;
  type: string;
  premium: number;
  coverage: number;
  risk_grade: string;
  status: string;
  blockchain_verified: boolean;
  valuation: number;
  roi: number;
  annual_premium?: number;
  contract_period?: string;
  max_age?: number;
  min_coverage?: number;
  location?: string;
}

interface InsuranceCardProps {
  listing: InsuranceListing;
  onViewDetails: (listing: InsuranceListing) => void;
  onPurchase: (listing: InsuranceListing) => void;
  compact?: boolean;
  mobile?: boolean;
}

const InsuranceCard: React.FC<InsuranceCardProps> = ({ 
  listing, 
  onViewDetails, 
  onPurchase, 
  compact = false,
  mobile = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Status configuration with 10Life inspired colors
  const statusConfig = useMemo(() => {
    switch (listing.status) {
      case 'available':
        return { 
          bg: 'bg-teal-50 dark:bg-teal-900/20', 
          text: 'text-teal-700 dark:text-teal-300', 
          border: 'border-teal-200 dark:border-teal-700', 
          label: 'Available',
          icon: CheckCircleIcon
        };
      case 'pending':
        return { 
          bg: 'bg-blue-50 dark:bg-blue-900/20', 
          text: 'text-blue-700 dark:text-blue-300', 
          border: 'border-blue-200 dark:border-blue-700', 
          label: 'Under Review',
          icon: ClockIcon
        };
      case 'blockchain_pending':
        return { 
          bg: 'bg-amber-50 dark:bg-amber-900/20', 
          text: 'text-amber-700 dark:text-amber-300', 
          border: 'border-amber-200 dark:border-amber-700', 
          label: 'Processing',
          icon: ClockIcon
        };
      default:
        return { 
          bg: 'bg-gray-50 dark:bg-gray-900/20', 
          text: 'text-gray-600 dark:text-gray-400', 
          border: 'border-gray-200 dark:border-gray-700', 
          label: 'Unavailable',
          icon: ClockIcon
        };
    }
  }, [listing.status]);

  // Risk grade styling inspired by 10Life's rating system
  const getRiskGradeStyle = (grade: string) => {
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper.includes('AAA')) return 'text-emerald-600 font-bold';
    if (gradeUpper.includes('AA')) return 'text-emerald-500 font-bold';
    if (gradeUpper.includes('A')) return 'text-blue-600 font-semibold';
    if (gradeUpper.includes('BBB')) return 'text-blue-500 font-semibold';
    if (gradeUpper.includes('BB')) return 'text-amber-500 font-medium';
    if (gradeUpper.includes('B')) return 'text-orange-500 font-medium';
    return 'text-red-500 font-medium';
  };

  // Company logo with fallback
  const CompanyLogo = () => {
    const companyInitials = listing.company
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 3);

    return (
      <div className="relative">
        {!imageError && (
          <img
            src={`/logos/${listing.company.toLowerCase().replace(/\s+/g, '-')}.png`}
            alt={`${listing.company} logo`}
            className="w-12 h-12 object-contain rounded-lg bg-white shadow-sm"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        {imageError && (
          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-gray-700 font-semibold text-xs">
              {companyInitials}
            </span>
          </div>
        )}
        {listing.blockchain_verified && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    );
  };

  // Mobile layout
  if (mobile) {
    return (
      <motion.div
        className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all duration-500 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden transform-gpu"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <CompanyLogo />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight truncate">
                  {listing.company}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {listing.type}
                </p>
              </div>
            </div>
            
            <div className={`px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
              {statusConfig.label}
            </div>
          </div>

          {/* Key metrics in mobile grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Premium</p>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                ${listing.premium.toLocaleString()}
              </p>
            </div>
            
            <div className="text-center">
              <ShieldCheckIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Coverage</p>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                ${(listing.coverage / 1000000).toFixed(1)}M
              </p>
            </div>
            
            <div className="text-center">
              <StarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Grade</p>
              <p className={`font-bold text-sm ${getRiskGradeStyle(listing.risk_grade)}`}>
                {listing.risk_grade}
              </p>
            </div>
          </div>

          {/* ROI highlight */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-3 border border-teal-100 dark:border-teal-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Expected ROI</span>
              <span className="font-bold text-lg text-teal-600 dark:text-teal-400">
                {listing.roi.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Mobile actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails(listing)}
              className="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/60 transition-all duration-300 text-sm"
            >
              Details
            </button>
            <button
              onClick={() => onPurchase(listing)}
              className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-medium py-2.5 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              Purchase
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop layout - compact or full
  return (
    <motion.div
      className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all duration-700 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden transform-gpu"
      whileHover={{ scale: 1.01, y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Premium glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-gray-900/5 pointer-events-none" />
      
      <div className={`relative z-10 ${compact ? 'p-6' : 'p-8'}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CompanyLogo />
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                {listing.company}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {listing.type}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-2 rounded-xl border text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
            <div className="flex items-center space-x-2">
              <statusConfig.icon className="w-4 h-4" />
              <span>{statusConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        {!compact && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-50/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 rounded-xl p-4 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Annual Premium</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${listing.premium.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 rounded-xl p-4 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Coverage</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(listing.coverage / 1000000).toFixed(1)}M
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 rounded-xl p-4 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <StarIcon className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Grade</span>
              </div>
              <p className={`text-2xl font-bold ${getRiskGradeStyle(listing.risk_grade)}`}>
                {listing.risk_grade}
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-4 backdrop-blur-sm border border-teal-200/50 dark:border-teal-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Expected ROI</span>
              </div>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                {listing.roi.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => onViewDetails(listing)}
            className="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/60 transition-all duration-300"
          >
            View Details
          </button>
          <button
            onClick={() => onPurchase(listing)}
            className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Purchase Insurance
          </button>
        </div>
      </div>

      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 rounded-3xl opacity-0 pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default InsuranceCard;