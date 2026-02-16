import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Search,
  Building2,
  Users,
  FolderKanban,
  Home,
  X,
  ArrowRight,
  Loader2,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { projectService } from '@/services/projectService';
import { opportunityService } from '@/services/opportunityService';
import { supabase } from '@/lib/supabase';

/**
 * GlobalSearch - Cmd+K / Ctrl+K search overlay
 *
 * Searches across Projects, Opportunities, Contacts, Entities, and Houses.
 * Groups results by category with icons, keyboard navigation, and clean UX.
 */

const CATEGORIES = [
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'opportunities', label: 'Opportunities', icon: Building2 },
  { key: 'contacts', label: 'Contacts', icon: Users },
  { key: 'entities', label: 'Entities', icon: Building2 },
  { key: 'houses', label: 'Houses', icon: Home },
];

function getResultRoute(category, item) {
  switch (category) {
    case 'projects':
      return `/project/${item.id}`;
    case 'opportunities':
      return `/opportunity/${item.id}`;
    case 'contacts':
      return `/contact/${item.id}`;
    case 'entities':
      return `/entity/${item.id}`;
    case 'houses':
      return `/construction/${item.id}`;
    default:
      return '/';
  }
}

function getResultLabel(category, item) {
  switch (category) {
    case 'projects':
      return {
        title: item.name || item.address || 'Untitled Project',
        subtitle: [item.city, item.state].filter(Boolean).join(', ') || item.status || null,
      };
    case 'opportunities':
      return {
        title: item.address || item.deal_number || 'Untitled Opportunity',
        subtitle: [item.deal_number, item.city, item.state].filter(Boolean).join(' · ') || item.stage || null,
      };
    case 'contacts':
      return {
        title: item.name || [item.first_name, item.last_name].filter(Boolean).join(' ') || 'Unnamed Contact',
        subtitle: [item.company, item.email].filter(Boolean).join(' · ') || null,
      };
    case 'entities':
      return {
        title: item.name || 'Unnamed Entity',
        subtitle: item.type || null,
      };
    case 'houses':
      return {
        title: item.house_number
          ? `House ${item.house_number}`
          : item.address || 'Unnamed House',
        subtitle: [item.current_milestone, item.status].filter(Boolean).join(' · ') || null,
      };
    default:
      return { title: 'Unknown', subtitle: null };
  }
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // Flatten results for keyboard navigation
  const flatResults = React.useMemo(() => {
    const flat = [];
    for (const cat of CATEGORIES) {
      const items = results[cat.key];
      if (items && items.length > 0) {
        for (const item of items) {
          flat.push({ category: cat.key, item });
        }
      }
    }
    return flat;
  }, [results]);

  // Register Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({});
      setSelectedIndex(0);
      setError(null);
      // Small delay to ensure dialog is mounted
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults({});
      setSelectedIndex(0);
      return;
    }

    let cancelled = false;

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      const searchQuery = debouncedQuery.trim();
      const searchResults = {};

      try {
        // Run all searches in parallel
        const [projectsResult, opportunitiesResult, contactsResult, entitiesResult, housesResult] =
          await Promise.allSettled([
            // Projects - use the service search method
            projectService.search(searchQuery, 5),

            // Opportunities - use the service search method
            opportunityService.search(searchQuery, 5),

            // Contacts - direct supabase query
            supabase
              .from('contacts')
              .select('id, name, first_name, last_name, company, phone, email')
              .or(`name.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
              .limit(5),

            // Entities - direct supabase query
            supabase
              .from('entities')
              .select('id, name, type')
              .ilike('name', `%${searchQuery}%`)
              .limit(5),

            // Houses - direct supabase query
            supabase
              .from('construction_houses')
              .select('id, house_number, address, current_milestone, status, project_id')
              .or(`house_number.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`)
              .limit(5),
          ]);

        if (cancelled) return;

        // Process results - handle both fulfilled and rejected promises gracefully
        if (projectsResult.status === 'fulfilled' && projectsResult.value) {
          searchResults.projects = Array.isArray(projectsResult.value)
            ? projectsResult.value
            : [];
        }

        if (opportunitiesResult.status === 'fulfilled' && opportunitiesResult.value) {
          searchResults.opportunities = Array.isArray(opportunitiesResult.value)
            ? opportunitiesResult.value
            : [];
        }

        if (contactsResult.status === 'fulfilled' && contactsResult.value?.data) {
          searchResults.contacts = contactsResult.value.data;
        }

        if (entitiesResult.status === 'fulfilled' && entitiesResult.value?.data) {
          searchResults.entities = entitiesResult.value.data;
        }

        if (housesResult.status === 'fulfilled' && housesResult.value?.data) {
          searchResults.houses = housesResult.value.data;
        }

        setResults(searchResults);
        setSelectedIndex(0);
      } catch (err) {
        if (!cancelled) {
          console.error('GlobalSearch error:', err);
          setError('Something went wrong. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Handle selecting a result
  const handleSelect = useCallback(
    (category, item) => {
      const route = getResultRoute(category, item);
      setOpen(false);
      navigate(route);
    },
    [navigate]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          const { category, item } = flatResults[selectedIndex];
          handleSelect(category, item);
        }
      }
    },
    [flatResults, selectedIndex, handleSelect]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedEl = resultsRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const hasResults = flatResults.length > 0;
  const hasQuery = debouncedQuery && debouncedQuery.trim().length >= 2;
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  let flatIndex = 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[560px] p-0 gap-0 overflow-hidden top-[20%] translate-y-0 sm:translate-y-0"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search projects, contacts, opportunities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="ml-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div
          ref={resultsRef}
          className="max-h-[360px] overflow-y-auto"
        >
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="px-4 py-8 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Empty State - No query yet */}
          {!loading && !error && !hasQuery && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Type to search across your workspace
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Projects, opportunities, contacts, entities, and houses
              </p>
            </div>
          )}

          {/* Empty State - No results found */}
          {!loading && !error && hasQuery && !hasResults && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No results found for "<span className="font-medium text-foreground">{debouncedQuery}</span>"
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}

          {/* Results grouped by category */}
          {!loading && hasResults && (
            <div className="py-1">
              {CATEGORIES.map((cat) => {
                const items = results[cat.key];
                if (!items || items.length === 0) return null;

                const CategoryIcon = cat.icon;

                return (
                  <div key={cat.key}>
                    {/* Category Header */}
                    <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <CategoryIcon className="w-3 h-3" />
                      {cat.label}
                    </div>

                    {/* Category Items */}
                    {items.map((item) => {
                      const currentIndex = flatIndex++;
                      const isSelected = currentIndex === selectedIndex;
                      const { title, subtitle } = getResultLabel(cat.key, item);

                      return (
                        <button
                          key={`${cat.key}-${item.id}`}
                          data-selected={isSelected}
                          onClick={() => handleSelect(cat.key, item)}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors group',
                            isSelected
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/50'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {title}
                            </p>
                            {subtitle && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {subtitle}
                              </p>
                            )}
                          </div>
                          <ArrowRight
                            className={cn(
                              'w-3.5 h-3.5 flex-shrink-0 transition-opacity',
                              isSelected
                                ? 'opacity-100 text-muted-foreground'
                                : 'opacity-0 group-hover:opacity-100 text-muted-foreground'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground/60 bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-background text-[10px] font-mono">
                <span className="inline-flex items-center">
                  <span className="mr-0.5">&uarr;</span>
                  <span>&darr;</span>
                </span>
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-background text-[10px] font-mono">
                Enter
              </kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-background text-[10px] font-mono">
                Esc
              </kbd>
              <span>close</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border bg-background text-[10px] font-mono">
              {isMac ? (
                <span className="inline-flex items-center gap-0.5">
                  <Command className="w-2.5 h-2.5" />K
                </span>
              ) : (
                'Ctrl+K'
              )}
            </kbd>
            <span>search</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
