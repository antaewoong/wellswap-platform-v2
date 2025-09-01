// 보험 관련 유틸리티 함수들

export const getDefaultInsuranceIcon = (companyName: string): string => {
  const initials = companyName.slice(0, 2).toUpperCase();
  return `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold">${initials}</div>`;
};

export const formatInsuranceCompanyName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const getInsuranceCompanyColor = (companyName: string): string => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800', 
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
    'bg-teal-100 text-teal-800'
  ];
  
  const index = companyName.length % colors.length;
  return colors[index];
};