import React, { memo } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: (isOpen: boolean) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export const SearchBar = memo(({
  searchQuery,
  onSearchChange,
  isSearchOpen,
  onToggleSearch,
  searchInputRef
}: SearchBarProps) => {
  return (
    <div className="relative">
      {/* Search Toggle Button */}
      <button
        onClick={() => {
          onToggleSearch(!isSearchOpen);
          setTimeout(() => searchInputRef?.current?.focus(), 0);
        }}
        className="p-2.5 hover:bg-brand-black/10 dark:hover:bg-white/20 rounded-lg transition-colors"
        title="Cari menu"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Search Input (Dropdown) */}
      {isSearchOpen && (
        <div className="absolute top-full right-0 mt-2 z-40 w-64 bg-white dark:bg-brand-black border border-brand-black/10 dark:border-white/10 rounded-xl shadow-xl p-3">
          <div className="flex items-center gap-2 bg-brand-yellow/10 dark:bg-white/5 px-3 py-2 rounded-lg">
            <Search className="w-4 h-4 text-brand-black dark:text-brand-yellow" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm dark:text-white placeholder-brand-black/40 dark:placeholder-white/40"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 hover:bg-brand-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
