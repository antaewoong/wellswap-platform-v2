import React from 'react';
import HomePage from '../pages/HomePage';
import SellPage from '../pages/SellPage';
import BuyPage from '../pages/BuyPage';
import ConciergePage from '../pages/ConciergePage';
import { AdminInquiryPanel } from '../AdminInquiryPanel';

interface PageRouterProps {
  currentPage: string;
  // Sell Page Props
  sellPageProps: any;
  // Buy Page Props
  buyPageProps: any;
  // Inquiry Page Props
  inquiryPageProps: any;
  // Admin Page Props
  adminPageProps: any;
}

export const PageRouter: React.FC<PageRouterProps> = ({
  currentPage,
  sellPageProps,
  buyPageProps,
  inquiryPageProps,
  adminPageProps
}) => {
  // 현재 페이지에 따라 해당 컴포넌트만 렌더링 (메모리 효율성)
  switch (currentPage) {
    case 'home':
      return <HomePage t={sellPageProps.t} setCurrentPage={sellPageProps.setCurrentPage} />;
    
    case 'sell':
      return <SellPage {...sellPageProps} />;
    
    case 'buy':
      return <BuyPage {...buyPageProps} />;
    
    case 'inquiry':
      return <ConciergePage {...inquiryPageProps} />;
    
    case 'admin':
      return <AdminInquiryPanel {...adminPageProps} />;
    
    default:
      return <HomePage t={sellPageProps.t} setCurrentPage={sellPageProps.setCurrentPage} />;
  }
};
