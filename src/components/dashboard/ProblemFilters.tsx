'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ProblemFiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onSortChange: (sort: string) => void;
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  selectedSort: string;
  categories?: Array<{ Id: number; NameAr: string; NameEn: string }>;
}

export function ProblemFilters({
  onSearch,
  onCategoryChange,
  onDifficultyChange,
  onSortChange,
  searchQuery,
  selectedCategory,
  selectedDifficulty,
  selectedSort,
  categories = [],
}: ProblemFiltersProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = searchQuery || selectedCategory || selectedDifficulty || selectedSort !== 'newest';

  const clearFilters = () => {
    onSearch('');
    onCategoryChange('');
    onDifficultyChange('');
    onSortChange('newest');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('search.placeholder')}
            className="mw-filter-field mw-filter-search"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label={isRtl?"الفلاتر":"Filters"} aria-expanded={showFilters}
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 ${showFilters ? 'bg-primary/10 border-primary/30' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" aria-label={isRtl?"مسح الفلاتر":"Clear filters"} onClick={clearFilters} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/50 border">
          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('search.categoryLabel')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="mw-filter-field"
            >
              <option value="">{t('search.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.Id} value={cat.Id.toString()}>
                  {locale === 'ar' ? cat.NameAr : cat.NameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('search.difficultyLabel')}
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="mw-filter-field"
            >
              <option value="">{t('search.allDifficulties')}</option>
              <option value="easy">{t('problems.difficulty.easy')}</option>
              <option value="medium">{t('problems.difficulty.medium')}</option>
              <option value="hard">{t('problems.difficulty.hard')}</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('common.sort')}
            </label>
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="mw-filter-field"
            >
              <option value="newest">{t('solved.sort.newest')}</option>
              <option value="oldest">{t('solved.sort.oldest')}</option>
              <option value="points">{t('solved.sort.points')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              {categories.find(c => c.Id.toString() === selectedCategory)?.[isRtl?'NameAr':'NameEn'] || selectedCategory}
              <button onClick={() => onCategoryChange('')} className="hover:text-primary/70">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedDifficulty && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              {t(`problems.difficulty.${selectedDifficulty}`)}
              <button onClick={() => onDifficultyChange('')} className="hover:text-primary/70">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedSort !== 'newest' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              {t(`solved.sort.${selectedSort}`)}
              <button onClick={() => onSortChange('newest')} className="hover:text-primary/70">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}