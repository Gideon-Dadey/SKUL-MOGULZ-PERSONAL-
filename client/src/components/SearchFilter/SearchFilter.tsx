import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PROJECT_CATEGORIES, ProjectCategory } from '../../types';
import './SearchFilter.css';

interface SearchFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: ProjectCategory | 'all';
    onCategoryChange: (category: ProjectCategory | 'all') => void;
    selectedStage: string;
    onStageChange: (stage: string) => void;
}

const STAGES = [
    { value: 'all', label: 'All Stages' },
    { value: 'idea', label: 'Idea' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'mvp', label: 'MVP' },
    { value: 'growth', label: 'Growth' },
    { value: 'scaling', label: 'Scaling' },
];

const SearchFilter: React.FC<SearchFilterProps> = ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedStage,
    onStageChange,
}) => {
    const [showFilters, setShowFilters] = useState(false);

    const clearFilters = () => {
        onSearchChange('');
        onCategoryChange('all');
        onStageChange('all');
    };

    const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedStage !== 'all';

    return (
        <div className="search-filter">
            <div className="search-filter__main">
                <div className="search-filter__search">
                    <Search size={18} className="search-filter__icon" />
                    <input
                        type="text"
                        placeholder="Search projects, updates, ideas..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="search-filter__input"
                    />
                    {searchQuery && (
                        <button
                            className="search-filter__clear"
                            onClick={() => onSearchChange('')}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button
                    className={`search-filter__toggle ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <SlidersHorizontal size={18} />
                    Filters
                </button>
            </div>

            {showFilters && (
                <div className="search-filter__panel">
                    <div className="search-filter__section">
                        <label className="search-filter__label">Category</label>
                        <div className="search-filter__categories">
                            <button
                                className={`search-filter__category ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => onCategoryChange('all')}
                            >
                                All
                            </button>
                            {PROJECT_CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    className={`search-filter__category ${selectedCategory === cat.value ? 'active' : ''}`}
                                    onClick={() => onCategoryChange(cat.value)}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="search-filter__section">
                        <label className="search-filter__label">Project Stage</label>
                        <div className="search-filter__stages">
                            {STAGES.map(stage => (
                                <button
                                    key={stage.value}
                                    className={`search-filter__stage ${selectedStage === stage.value ? 'active' : ''}`}
                                    onClick={() => onStageChange(stage.value)}
                                >
                                    {stage.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button className="search-filter__clear-all" onClick={clearFilters}>
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchFilter;
