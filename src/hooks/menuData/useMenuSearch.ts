import { useCallback, useState } from 'react';
import { dataService } from '../../services/dataService';
import type { MenuItem } from '../../types/menu';

/**
 * Hook для поиска блюд
 */
export function useMenuSearch(restaurantId: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MenuItem[]>([]);

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      if (searchQuery.trim() === '') {
        setResults([]);
        return;
      }

      setResults(dataService.searchItems(restaurantId, searchQuery));
    },
    [restaurantId]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    results,
    search,
    clearSearch,
    hasResults: results.length > 0,
  };
}
