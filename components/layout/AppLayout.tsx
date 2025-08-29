import React from 'react';
import { Navigation } from './Navigation';
import { LanguageSelector } from './LanguageSelector';
import { AuthSection } from './AuthSection';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  isAuthenticated: boolean;
  showAdminMenu: boolean;
  handleGmailLogin: () => void;
  t: any;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPage,
  setCurrentPage,
  currentLanguage,
  setCurrentLanguage,
  isAuthenticated,
  showAdminMenu,
  handleGmailLogin,
  t
}) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-2xl font-extralight tracking-wider text-zinc-900"
          >
            WELLSWAP
          </button>
          
          <Navigation 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            showAdminMenu={showAdminMenu}
            t={t}
          />
        </div>
        
        {/* Language Selector & Auth */}
        <div className="flex items-center space-x-4">
          <AuthSection 
            isAuthenticated={isAuthenticated}
            handleGmailLogin={handleGmailLogin}
          />
          
          <LanguageSelector 
            currentLanguage={currentLanguage}
            setCurrentLanguage={setCurrentLanguage}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
};
