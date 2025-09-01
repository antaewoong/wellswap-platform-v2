'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon, 
  XMarkIcon, 
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from './ui/GlassmorphismComponents';

// Filter types inspired by 10Life's comprehensive filtering system
export interface InsuranceFilters {
  category: string[];
  status: string[];
  premiumRange: [number, number];
  coverageRange: [number, number];
  riskGrade: string[];
  company: string[];
  features: string[];
  rating: number;
  location: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<any>;
  description?: string;
}

// 10Life-inspired filter categories
const FILTER_CATEGORIES = {
  category: [
    { value: 'life', label: 'Life Insurance', count: 23, icon: ShieldCheckIcon, description: 'Term, whole life, and universal life policies' },
    { value: 'health', label: 'Health & Medical', count: 34, icon: CheckCircleIcon, description: 'Medical, critical illness, and hospitalization' },
    { value: 'property', label: 'Property & Casualty', count: 18, icon: ShieldCheckIcon, description: 'Home, motor, and business insurance' },
    { value: 'travel', label: 'Travel Insurance', count: 12, icon: ShieldCheckIcon, description: 'Single trip, annual, and business travel' },
    { value: 'investment', label: 'Investment-Linked', count: 15, icon: CurrencyDollarIcon, description: 'Unit-linked and variable life policies' },
    { value: 'savings', label: 'Savings & Endowment', count: 28, icon: CurrencyDollarIcon, description: 'Traditional and participating policies' }
  ],
  status: [
    { value: 'available', label: 'Available', count: 89, description: 'Ready for immediate purchase' },
    { value: 'limited', label: 'Limited Availability', count: 15, description: 'Limited time or quantity offers' },
    { value: 'new', label: 'New Products', count: 7, description: 'Recently launched products' },
    { value: 'premium', label: 'Premium Selection', count: 12, description: 'High-value premium products' }
  ],
  riskGrade: [
    { value: 'AAA', label: 'AAA - Excellent', count: 12, description: 'Highest credit quality' },
    { value: 'AA', label: 'AA - Very Good', count: 23, description: 'Very high credit quality' },
    { value: 'A', label: 'A - Good', count: 34, description: 'High credit quality' },
    { value: 'BBB', label: 'BBB - Adequate', count: 28, description: 'Adequate credit quality' },
    { value: 'BB', label: 'BB - Speculative', count: 15, description: 'Speculative credit quality' },
    { value: 'B', label: 'B - Highly Speculative', count: 8, description: 'Highly speculative' }
  ],
  features: [
    { value: 'blockchain_verified', label: 'Blockchain Verified', count: 45, icon: CheckCircleIcon },
    { value: 'no_medical', label: 'No Medical Exam', count: 67, icon: CheckCircleIcon },
    { value: 'instant_approval', label: 'Instant Approval', count: 34, icon: CheckCircleIcon },
    { value: 'online_purchase', label: 'Online Purchase', count: 89, icon: CheckCircleIcon },
    { value: 'flexible_premium', label: 'Flexible Premiums', count: 23, icon: CheckCircleIcon },
    { value: 'guaranteed_issue', label: 'Guaranteed Issue', count: 12, icon: CheckCircleIcon }
  ],
  location: [
    { value: 'hk', label: 'Hong Kong', count: 78 },
    { value: 'sg', label: 'Singapore', count: 45 },
    { value: 'my', label: 'Malaysia', count: 23 },
    { value: 'th', label: 'Thailand', count: 18 },
    { value: 'id', label: 'Indonesia', count: 15 }
  ]
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'premium_asc', label: 'Premium: Low to High' },
  { value: 'premium_desc', label: 'Premium: High to Low' },
  { value: 'coverage_asc', label: 'Coverage: Low to High' },
  { value: 'coverage_desc', label: 'Coverage: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'roi_desc', label: 'Best ROI' }
];

interface InsuranceFiltersProps {
  filters: InsuranceFilters;
  onFiltersChange: (filters: InsuranceFilters) => void;
  isLoading?: boolean;
  totalResults?: number;
  className?: string;
}

const InsuranceFiltersComponent: React.FC<InsuranceFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading = false,
  totalResults = 0,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('category');
  const [localFilters, setLocalFilters] = useState<InsuranceFilters>(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Apply filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(localFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, onFiltersChange]);

  const updateFilter = <K extends keyof InsuranceFilters>(
    key: K,
    value: InsuranceFilters[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof Pick<InsuranceFilters, 'category' | 'status' | 'riskGrade' | 'company' | 'features' | 'location'>, value: string) => {
    const currentValues = localFilters[key];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilter(key, newValues);
  };

  const clearAllFilters = () => {
    const clearedFilters: InsuranceFilters = {
      category: [],
      status: [],
      premiumRange: [0, 1000000],
      coverageRange: [0, 10000000],
      riskGrade: [],
      company: [],
      features: [],
      rating: 0,
      location: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return (
      localFilters.category.length +
      localFilters.status.length +
      localFilters.riskGrade.length +
      localFilters.features.length +
      localFilters.location.length +
      (localFilters.rating > 0 ? 1 : 0) +
      (localFilters.premiumRange[0] > 0 || localFilters.premiumRange[1] < 1000000 ? 1 : 0) +
      (localFilters.coverageRange[0] > 0 || localFilters.coverageRange[1] < 10000000 ? 1 : 0)
    );
  };

  const renderFilterOptions = (categoryKey: keyof typeof FILTER_CATEGORIES) => {
    const options = FILTER_CATEGORIES[categoryKey];
    const selectedValues = localFilters[categoryKey] as string[];

    return (
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const Icon = 'icon' in option ? option.icon : undefined;
          
          return (
            <motion.button
              key={option.value}
              className={`
                w-full p-3 text-left rounded-xl border transition-all duration-300 group
                ${isSelected 
                  ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-200' 
                  : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleArrayFilter(categoryKey, option.value)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {Icon && <Icon className="w-5 h-5 text-current opacity-70" />}
                  <div>
                    <span className="font-medium">{option.label}</span>
                    {'description' in option && option.description && (
                      <p className="text-sm opacity-70 mt-0.5">{option.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {option.count && (
                    <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {option.count}
                    </span>
                  )}
                  {isSelected && (
                    <CheckCircleIcon className="w-5 h-5 text-teal-600" />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  const renderRangeFilter = (
    label: string,
    range: [number, number],
    onChange: (range: [number, number]) => void,
    min: number,
    max: number,
    step: number,
    formatter: (value: number) => string
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatter(range[0])} - {formatter(range[1])}
        </span>
      </div>
      
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={range[0]}
          onChange={(e) => onChange([parseInt(e.target.value), range[1]])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={range[1]}
          onChange={(e) => onChange([range[0], parseInt(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
      
      <div className="flex space-x-3">
        <input
          type="number"
          value={range[0]}
          onChange={(e) => onChange([parseInt(e.target.value) || 0, range[1]])}
          className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          placeholder="Min"
        />
        <input
          type="number"
          value={range[1]}
          onChange={(e) => onChange([range[0], parseInt(e.target.value) || max])}
          className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          placeholder="Max"
        />
      </div>
    </div>
  );

  const filterTabs = [
    { id: 'category', label: 'Category', icon: FunnelIcon },
    { id: 'status', label: 'Status', icon: CheckCircleIcon },
    { id: 'riskGrade', label: 'Rating', icon: StarIcon },
    { id: 'features', label: 'Features', icon: AdjustmentsHorizontalIcon },
    { id: 'location', label: 'Location', icon: ShieldCheckIcon }
  ];

  return (
    <GlassCard className={`${className}`} variant="subtle">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <FunnelIcon className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
            <ChevronDownIcon 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {totalResults > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading ? 'Searching...' : `${totalResults.toLocaleString()} results found`}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={`${localFilters.sortBy}_${localFilters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              updateFilter('sortBy', sortBy);
              updateFilter('sortOrder', sortOrder as 'asc' | 'desc');
            }}
            className="px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {filterTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                      ${activeTab === tab.id
                        ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Main Filter Options */}
              <div className="col-span-1 lg:col-span-2 xl:col-span-2">
                {(activeTab === 'category' || activeTab === 'status' || activeTab === 'riskGrade' || activeTab === 'features' || activeTab === 'location') && 
                  renderFilterOptions(activeTab as keyof typeof FILTER_CATEGORIES)
                }
              </div>

              {/* Range Filters */}
              <div className="space-y-6">
                {renderRangeFilter(
                  'Premium Range',
                  localFilters.premiumRange,
                  (range) => updateFilter('premiumRange', range),
                  0,
                  1000000,
                  10000,
                  (value) => `$${(value / 1000).toFixed(0)}K`
                )}

                {renderRangeFilter(
                  'Coverage Range',
                  localFilters.coverageRange,
                  (range) => updateFilter('coverageRange', range),
                  0,
                  10000000,
                  100000,
                  (value) => `$${(value / 1000000).toFixed(1)}M`
                )}

                {/* Rating Filter */}
                <div className="space-y-4">
                  <span className="font-medium">Minimum Rating</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => updateFilter('rating', star === localFilters.rating ? 0 : star)}
                        className={`
                          p-1 transition-colors
                          ${star <= localFilters.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                        `}
                      >
                        <StarIcon className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default InsuranceFiltersComponent;