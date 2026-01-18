import React, { useState, useCallback } from 'react';
import './SearchFilters.css';

interface SearchFiltersProps {
  currentFilters: string;
  onFiltersChange: (filters: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ currentFilters, onFiltersChange }) => {
  const [type, setType] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Parse current filters on mount
  React.useEffect(() => {
    if (currentFilters) {
      const parts = currentFilters.split(/\s+/);
      parts.forEach(part => {
        const [key, value] = part.split(':');
        if (key === 'type') setType(value);
        else if (key === 'date') setDate(value);
        else if (key === 'sort') setSort(value);
        else if (key === 'verified') setVerified(value === 'true');
        else if (key === 'role') setRole(value);
      });
    }
  }, [currentFilters]);

  const buildFilterString = useCallback((
    newType?: string | null,
    newDate?: string | null,
    newSort?: string | null,
    newVerified?: boolean | null,
    newRole?: string | null
  ) => {
    const filters = [];
    const t = newType !== undefined ? newType : type;
    const d = newDate !== undefined ? newDate : date;
    const s = newSort !== undefined ? newSort : sort;
    const v = newVerified !== undefined ? newVerified : verified;
    const r = newRole !== undefined ? newRole : role;

    if (t) filters.push(`type:${t}`);
    if (d) filters.push(`date:${d}`);
    if (s) filters.push(`sort:${s}`);
    if (v !== null) filters.push(`verified:${v}`);
    if (r) filters.push(`role:${r}`);

    return filters.join(' ');
  }, [type, date, sort, verified, role]);

  const handleTypeChange = (value: string | null) => {
    setType(value);
    onFiltersChange(buildFilterString(value));
  };

  const handleDateChange = (value: string | null) => {
    setDate(value);
    onFiltersChange(buildFilterString(undefined, value));
  };

  const handleSortChange = (value: string | null) => {
    setSort(value);
    onFiltersChange(buildFilterString(undefined, undefined, value));
  };

  const handleVerifiedChange = (value: boolean | null) => {
    setVerified(value);
    onFiltersChange(buildFilterString(undefined, undefined, undefined, value));
  };

  const handleRoleChange = (value: string | null) => {
    setRole(value);
    onFiltersChange(buildFilterString(undefined, undefined, undefined, undefined, value));
  };

  const handleClearAll = () => {
    setType(null);
    setDate(null);
    setSort(null);
    setVerified(null);
    setRole(null);
    onFiltersChange('');
  };

  const hasActiveFilters = !!(type || date || sort || verified !== null || role);

  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button className="clear-all-btn" onClick={handleClearAll}>
            Clear all
          </button>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-label">Type</label>
        <div className="filter-options">
          {(['post', 'user', 'event'] as const).map((t) => (
            <label key={t} className="filter-checkbox">
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => handleTypeChange(type === t ? null : t)}
              />
              <span className="checkbox-label">
                {t === 'post' && '📝'} {t === 'user' && '👤'} {t === 'event' && '📅'}
                {' '} {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Date</label>
        <div className="filter-options">
          {[
            { value: 'last_day', label: 'Last 24 hours' },
            { value: 'last_week', label: 'Last week' },
            { value: 'last_month', label: 'Last month' },
            { value: 'last_year', label: 'Last year' }
          ].map(({ value, label }) => (
            <label key={value} className="filter-checkbox">
              <input
                type="radio"
                name="date"
                value={value}
                checked={date === value}
                onChange={() => handleDateChange(date === value ? null : value)}
              />
              <span className="checkbox-label">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Sort By</label>
        <div className="filter-options">
          {[
            { value: 'relevance', label: 'Relevance' },
            { value: 'recent', label: 'Most Recent' },
            { value: 'popular', label: 'Most Popular' },
            { value: 'trending', label: 'Trending' }
          ].map(({ value, label }) => (
            <label key={value} className="filter-checkbox">
              <input
                type="radio"
                name="sort"
                value={value}
                checked={sort === value}
                onChange={() => handleSortChange(sort === value ? null : value)}
              />
              <span className="checkbox-label">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">User Role</label>
        <div className="filter-options">
          {[
            { value: 'admin', label: 'Admin' },
            { value: 'moderator', label: 'Moderator' },
            { value: 'user', label: 'Regular User' }
          ].map(({ value, label }) => (
            <label key={value} className="filter-checkbox">
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => handleRoleChange(role === value ? null : value)}
              />
              <span className="checkbox-label">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Verified Users</label>
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="radio"
              name="verified"
              checked={verified === true}
              onChange={() => handleVerifiedChange(verified === true ? null : true)}
            />
            <span className="checkbox-label">✓ Verified Only</span>
          </label>
        </div>
      </div>

      <div className="filter-info">
        <p>💡 You can also type filters directly:</p>
        <code>type:post date:last_week</code>
      </div>
    </div>
  );
};

export default SearchFilters;
