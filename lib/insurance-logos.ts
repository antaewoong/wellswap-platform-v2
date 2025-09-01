'use client';

// Insurance Company Logo Management System
// Inspired by 10Life's comprehensive insurance database

export interface InsuranceCompany {
  code: string;
  name: string;
  fullName: string;
  logoUrl?: string;
  fallbackInitials: string;
  category: 'life' | 'health' | 'property' | 'motor' | 'travel' | 'marine';
  licenseNumber?: string;
  established?: number;
  headquarters: string;
  rating?: {
    moodys?: string;
    sandp?: string;
    fitch?: string;
    local?: string;
  };
  colors: {
    primary: string;
    secondary?: string;
  };
}

// Comprehensive insurance company database based on Hong Kong market
export const INSURANCE_COMPANIES: Record<string, InsuranceCompany> = {
  // Major Life Insurance Companies
  'PRUDENTIAL': {
    code: 'PRUDENTIAL',
    name: 'Prudential',
    fullName: 'Prudential Assurance Company (Singapore) Pte Ltd',
    fallbackInitials: 'PRU',
    category: 'life',
    licenseNumber: 'L0001',
    established: 1938,
    headquarters: 'Hong Kong',
    rating: {
      moodys: 'Aa3',
      sandp: 'AA-',
      local: 'AAA'
    },
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6'
    }
  },
  
  'AIA': {
    code: 'AIA',
    name: 'AIA',
    fullName: 'American International Assurance Company Limited',
    fallbackInitials: 'AIA',
    category: 'life',
    licenseNumber: 'L0002',
    established: 1931,
    headquarters: 'Hong Kong',
    rating: {
      moodys: 'Aa2',
      sandp: 'AA-',
      local: 'AAA'
    },
    colors: {
      primary: '#DC2626',
      secondary: '#EF4444'
    }
  },

  'GREAT_EASTERN': {
    code: 'GREAT_EASTERN',
    name: 'Great Eastern',
    fullName: 'Great Eastern Life Assurance Company Limited',
    fallbackInitials: 'GE',
    category: 'life',
    licenseNumber: 'L0003',
    established: 1908,
    headquarters: 'Malaysia',
    rating: {
      moodys: 'A2',
      sandp: 'A',
      local: 'AA+'
    },
    colors: {
      primary: '#059669',
      secondary: '#10B981'
    }
  },

  'MANULIFE': {
    code: 'MANULIFE',
    name: 'Manulife',
    fullName: 'Manulife (International) Limited',
    fallbackInitials: 'MFC',
    category: 'life',
    licenseNumber: 'L0004',
    established: 1897,
    headquarters: 'Canada',
    rating: {
      moodys: 'A1',
      sandp: 'A+',
      local: 'AA'
    },
    colors: {
      primary: '#16A34A',
      secondary: '#22C55E'
    }
  },

  'SUN_LIFE': {
    code: 'SUN_LIFE',
    name: 'Sun Life',
    fullName: 'Sun Life Hong Kong Limited',
    fallbackInitials: 'SUN',
    category: 'life',
    licenseNumber: 'L0005',
    established: 1892,
    headquarters: 'Canada',
    rating: {
      moodys: 'A1',
      sandp: 'A+',
      local: 'AA'
    },
    colors: {
      primary: '#FBBF24',
      secondary: '#F59E0B'
    }
  },

  // Major General Insurance Companies
  'ZURICH': {
    code: 'ZURICH',
    name: 'Zurich',
    fullName: 'Zurich Insurance Company Ltd',
    fallbackInitials: 'ZUR',
    category: 'property',
    licenseNumber: 'G0001',
    established: 1872,
    headquarters: 'Switzerland',
    rating: {
      moodys: 'Aa3',
      sandp: 'AA-',
      local: 'AAA'
    },
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6'
    }
  },

  'AXA': {
    code: 'AXA',
    name: 'AXA',
    fullName: 'AXA Insurance Pte Ltd',
    fallbackInitials: 'AXA',
    category: 'property',
    licenseNumber: 'G0002',
    established: 1816,
    headquarters: 'France',
    rating: {
      moodys: 'Aa3',
      sandp: 'AA-',
      local: 'AAA'
    },
    colors: {
      primary: '#00008B',
      secondary: '#4169E1'
    }
  },

  'QBE': {
    code: 'QBE',
    name: 'QBE',
    fullName: 'QBE Insurance (Hong Kong) Limited',
    fallbackInitials: 'QBE',
    category: 'property',
    licenseNumber: 'G0003',
    established: 1886,
    headquarters: 'Australia',
    rating: {
      moodys: 'A2',
      sandp: 'A',
      local: 'AA+'
    },
    colors: {
      primary: '#E11D48',
      secondary: '#F43F5E'
    }
  },

  'ALLIANZ': {
    code: 'ALLIANZ',
    name: 'Allianz',
    fullName: 'Allianz General Insurance Company (Singapore) Pte Ltd',
    fallbackInitials: 'AGI',
    category: 'property',
    licenseNumber: 'G0004',
    established: 1890,
    headquarters: 'Germany',
    rating: {
      moodys: 'Aa3',
      sandp: 'AA',
      local: 'AAA'
    },
    colors: {
      primary: '#0F4C96',
      secondary: '#1D4ED8'
    }
  },

  'AVIVA': {
    code: 'AVIVA',
    name: 'Aviva',
    fullName: 'Aviva Ltd',
    fallbackInitials: 'AVI',
    category: 'life',
    licenseNumber: 'L0006',
    established: 1696,
    headquarters: 'United Kingdom',
    rating: {
      moodys: 'A2',
      sandp: 'A',
      local: 'AA'
    },
    colors: {
      primary: '#FBBF24',
      secondary: '#F59E0B'
    }
  }
};

// Get company by name (fuzzy matching)
export const getInsuranceCompany = (companyName: string): InsuranceCompany | null => {
  const normalizedInput = companyName.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Direct match
  if (INSURANCE_COMPANIES[normalizedInput]) {
    return INSURANCE_COMPANIES[normalizedInput];
  }
  
  // Fuzzy matching
  for (const [key, company] of Object.entries(INSURANCE_COMPANIES)) {
    const normalizedCompanyName = company.name.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normalizedFullName = company.fullName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (normalizedInput.includes(normalizedCompanyName) || 
        normalizedCompanyName.includes(normalizedInput) ||
        normalizedInput.includes(normalizedFullName) ||
        normalizedFullName.includes(normalizedInput)) {
      return company;
    }
  }
  
  return null;
};

// Get all companies by category
export const getCompaniesByCategory = (category: InsuranceCompany['category']): InsuranceCompany[] => {
  return Object.values(INSURANCE_COMPANIES).filter(company => company.category === category);
};

// Get company logo with fallback
export const getCompanyLogo = (companyName: string): { 
  logoUrl?: string; 
  fallbackInitials: string; 
  colors: InsuranceCompany['colors'];
  company: InsuranceCompany | null;
} => {
  const company = getInsuranceCompany(companyName);
  
  if (company) {
    return {
      fallbackInitials: company.fallbackInitials,
      colors: company.colors,
      company
    };
  }
  
  // Generate fallback for unknown companies
  const fallbackInitials = companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();
    
  return {
    fallbackInitials,
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF'
    },
    company: null
  };
};

// Logo component data for React components
export const getLogoComponentProps = (companyName: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const { fallbackInitials, colors, company } = getCompanyLogo(companyName);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  const fallbackStyle = {
    backgroundColor: colors.primary + '20',
    color: colors.primary,
    borderColor: colors.primary + '40'
  };

  return {
    fallbackInitials,
    colors,
    company,
    sizeClasses: sizeClasses[size],
    fallbackStyle
  };
};

// Export categories for filtering
export const INSURANCE_CATEGORIES = [
  { id: 'life', name: 'Life Insurance', count: 6 },
  { id: 'health', name: 'Health & Medical', count: 8 },
  { id: 'property', name: 'Property & Casualty', count: 5 },
  { id: 'motor', name: 'Motor Insurance', count: 4 },
  { id: 'travel', name: 'Travel Insurance', count: 3 },
  { id: 'marine', name: 'Marine & Aviation', count: 2 }
] as const;

export default {
  INSURANCE_COMPANIES,
  getInsuranceCompany,
  getCompaniesByCategory,
  getCompanyLogo,
  getLogoComponentProps,
  INSURANCE_CATEGORIES
};