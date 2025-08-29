import React from 'react';

interface LanguageSelectorProps {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  setCurrentLanguage
}) => {
  return (
    <div className="relative">
      <select 
        value={currentLanguage}
        onChange={(e) => setCurrentLanguage(e.target.value)}
        className="appearance-none bg-transparent border border-zinc-300 rounded px-3 py-1 text-sm font-light focus:outline-none focus:border-zinc-500"
      >
        <option value="en">🇺🇸 English</option>
        <option value="ko">🇰🇷 한국어</option>
        <option value="zh">🇨🇳 中文</option>
        <option value="ja">🇯🇵 日本語</option>
      </select>
    </div>
  );
};
