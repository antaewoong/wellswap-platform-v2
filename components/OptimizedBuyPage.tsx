'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

// Import all our optimized components
import InsuranceCard from './InsuranceCard';
import { LazyInsuranceCard } from './LazyLoader';
import InsuranceFiltersComponent from './InsuranceFilters';
import { useOptimizedQuery } from '../lib/database-optimizer';
import { INSURANCE_CATEGORIES } from '../lib/insurance-logos';
import { GlassCard, GlassButton } from './ui/GlassmorphismComponents';
import { MagneticWrapper, FloatingCard, StaggeredText } from './ui/PremiumInteractions';
import { useIsMobile } from './ui/MobileOptimized';

// Sample data with enhanced structure inspired by 10Life
const SAMPLE_INSURANCE_LISTINGS = [
  {
    id: '1',
    company: 'AIA',
    type: 'Whole Life Protection',
    premium: 2500,
    coverage: 500000,
    risk_grade: 'AAA',
    status: 'available',
    blockchain_verified: true,
    valuation: 475000,
    roi: 8.5,
    annual_premium: 2500,
    contract_period: '20 years',
    max_age: 65,
    min_coverage: 100000,
    location: 'Hong Kong',
    rating: 4.8,
    features: ['no_medical', 'online_purchase', 'blockchain_verified'],
    category: 'life'
  },
  {
    id: '2',
    company: 'Prudential',
    type: 'Medical Insurance Plus',
    premium: 1800,
    coverage: 1000000,
    risk_grade: 'AA',
    status: 'available',
    blockchain_verified: true,
    valuation: 890000,
    roi: 7.2,
    annual_premium: 1800,
    contract_period: '15 years',
    max_age: 70,
    min_coverage: 200000,
    location: 'Singapore',
    rating: 4.6,
    features: ['instant_approval', 'flexible_premium', 'blockchain_verified'],
    category: 'health'
  },
  {
    id: '3',
    company: 'Great Eastern',
    type: 'Investment Linked Policy',
    premium: 3200,
    coverage: 750000,
    risk_grade: 'A',
    status: 'limited',
    blockchain_verified: false,
    valuation: 685000,
    roi: 9.1,
    annual_premium: 3200,
    contract_period: '25 years',
    max_age: 60,
    min_coverage: 150000,
    location: 'Malaysia',
    rating: 4.4,
    features: ['flexible_premium', 'online_purchase'],
    category: 'investment'
  },
  {
    id: '4',
    company: 'Zurich',
    type: 'Property & Casualty',
    premium: 850,
    coverage: 300000,
    risk_grade: 'AA',
    status: 'available',
    blockchain_verified: true,
    valuation: 285000,
    roi: 6.8,
    annual_premium: 850,
    contract_period: '10 years',
    max_age: 75,
    min_coverage: 50000,
    location: 'Hong Kong',
    rating: 4.7,
    features: ['instant_approval', 'no_medical', 'blockchain_verified'],
    category: 'property'
  }
];

interface OptimizedBuyPageProps {
  onViewDetails: (listing: any) => void;
  onPurchase: (listing: any) => void;
  className?: string;
}

const OptimizedBuyPage: React.FC<OptimizedBuyPageProps> = ({
  onViewDetails,
  onPurchase,
  className = ''
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState(SAMPLE_INSURANCE_LISTINGS);
  
  // Filters state using the comprehensive filter system
  const [filters, setFilters] = useState({
    category: [],
    status: [],
    premiumRange: [0, 1000000] as [number, number],
    coverageRange: [0, 10000000] as [number, number],
    riskGrade: [],
    company: [],
    features: [],
    rating: 0,
    location: [],
    sortBy: 'relevance',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Hooks
  const isMobile = useIsMobile();
  const { db, clearCache } = useOptimizedQuery();

  // Memoized filtered and sorted listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(listing => 
        listing.company.toLowerCase().includes(query) ||
        listing.type.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      result = result.filter(listing => 
        filters.category.includes(listing.category as never)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(listing => 
        filters.status.includes(listing.status as never)
      );
    }

    // Apply premium range filter
    result = result.filter(listing => 
      listing.premium >= filters.premiumRange[0] && 
      listing.premium <= filters.premiumRange[1]
    );

    // Apply coverage range filter
    result = result.filter(listing => 
      listing.coverage >= filters.coverageRange[0] && 
      listing.coverage <= filters.coverageRange[1]
    );

    // Apply risk grade filter
    if (filters.riskGrade.length > 0) {
      result = result.filter(listing => 
        filters.riskGrade.includes(listing.risk_grade)
      );
    }

    // Apply company filter
    if (filters.company.length > 0) {
      result = result.filter(listing => 
        filters.company.includes(listing.company)
      );
    }

    // Apply features filter
    if (filters.features.length > 0) {
      result = result.filter(listing => 
        filters.features.some(feature => 
          listing.features?.includes(feature)
        )
      );
    }

    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter(listing => 
        listing.rating >= filters.rating
      );
    }

    // Apply location filter
    if (filters.location.length > 0) {
      result = result.filter(listing => 
        filters.location.some(loc => 
          listing.location.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    // Apply sorting
    const sortFunctions = {
      relevance: () => 0, // Keep original order for relevance
      premium_asc: (a: any, b: any) => a.premium - b.premium,
      premium_desc: (a: any, b: any) => b.premium - a.premium,
      coverage_asc: (a: any, b: any) => a.coverage - b.coverage,
      coverage_desc: (a: any, b: any) => b.coverage - a.coverage,
      rating_desc: (a: any, b: any) => (b.rating || 0) - (a.rating || 0),
      roi_desc: (a: any, b: any) => b.roi - a.roi,
      newest: (a: any, b: any) => new Date(b.listingDate || Date.now()).getTime() - new Date(a.listingDate || Date.now()).getTime()
    };

    const sortKey = `${filters.sortBy}_${filters.sortOrder}` as keyof typeof sortFunctions;
    if (sortFunctions[sortKey]) {
      result.sort(sortFunctions[sortKey]);
    }

    return result;
  }, [listings, searchQuery, filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    
    // Clear cache when filters change to ensure fresh data
    if (clearCache) {
      clearCache('insurance_listings');
    }
  }, [clearCache]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  // Handle view details
  const handleViewDetails = useCallback((listing: any) => {
    console.log('View details for listing:', listing.id);
    onViewDetails(listing);
  }, [onViewDetails]);

  // Handle purchase
  const handlePurchase = useCallback((listing: any) => {
    console.log('Purchase listing:', listing.id);
    onPurchase(listing);
  }, [onPurchase]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}>
      {/* Header Section */}
      <div className="relative overflow-hidden py-12 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <StaggeredText 
                text="Premium Insurance Marketplace"
                className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white"
              />
            </motion.div>
            
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Discover and purchase premium insurance products from top-rated companies worldwide
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {[
                { label: 'Total Products', value: filteredListings.length, icon: '📊' },
                { label: 'Avg. Rating', value: '4.6', icon: '⭐' },
                { label: 'Companies', value: '50+', icon: '🏢' },
                { label: 'Countries', value: '15', icon: '🌍' }
              ].map((stat, index) => (
                <FloatingCard key={stat.label} index={index}>
                  <GlassCard className="text-center p-6" variant="subtle">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </GlassCard>
                </FloatingCard>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Search Bar */}
          <GlassCard className="mb-8" variant="subtle">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search insurance products, companies, or types..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <MagneticWrapper strength={0.2}>
                  <GlassButton
                    variant={viewMode === 'grid' ? 'accent' : 'secondary'}
                    onClick={() => setViewMode('grid')}
                    className="p-3"
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </GlassButton>
                </MagneticWrapper>
                
                <MagneticWrapper strength={0.2}>
                  <GlassButton
                    variant={viewMode === 'list' ? 'accent' : 'secondary'}
                    onClick={() => setViewMode('list')}
                    className="p-3"
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </GlassButton>
                </MagneticWrapper>
              </div>
            </div>
          </GlassCard>

          {/* Filters */}
          <InsuranceFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
            totalResults={filteredListings.length}
            className="mb-8"
          />
        </motion.div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          {filteredListings.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <GlassCard variant="subtle" className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search criteria or filters to find what you're looking for.
                </p>
                <GlassButton
                  variant="primary"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      ...filters,
                      category: [],
                      status: [],
                      riskGrade: [],
                      company: [],
                      features: [],
                      location: [],
                      rating: 0
                    });
                  }}
                >
                  Clear All Filters
                </GlassButton>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === 'grid'
                  ? `grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`
                  : 'space-y-6'
              }
            >
              {filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  {/* Use lazy loading for performance */}
                  <LazyInsuranceCard
                    listing={listing}
                    onViewDetails={handleViewDetails}
                    onPurchase={handlePurchase}
                    mobile={isMobile}
                    compact={viewMode === 'list'}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button (if needed for pagination) */}
        {filteredListings.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <MagneticWrapper strength={0.4}>
              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => {
                  // Implement pagination logic
                  console.log('Load more results');
                }}
              >
                Load More Products
              </GlassButton>
            </MagneticWrapper>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OptimizedBuyPage;