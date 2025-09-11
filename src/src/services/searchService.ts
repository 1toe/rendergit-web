import { useState, useCallback, useEffect } from 'react';
import { FileInfo } from './repoFlattenerService';

export interface SearchResult {
  file: FileInfo;
  matches: SearchMatch[];
  score: number;
}

export interface SearchMatch {
  line: number;
  column: number;
  text: string;
  context: string;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  fileTypes: string[];
  maxResults: number;
}

export const useSearch = (files: FileInfo[] = []) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const searchOptions: SearchOptions = {
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    fileTypes: [],
    maxResults: 50  // Reducir el número máximo de resultados
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const results: SearchResult[] = [];
      const searchTerm = searchOptions.caseSensitive ? query : query.toLowerCase();

      // Limitar la búsqueda solo a los primeros 100 archivos para mejorar performance
      const filesToSearch = files.slice(0, 100);

      for (const file of filesToSearch) {
        if (!file.content) continue;

        const lines = file.content.split('\n');

        const matches: SearchMatch[] = [];
        let score = 0;

        lines.forEach((line, lineIndex) => {
          const lineContent = searchOptions.caseSensitive ? line : line.toLowerCase();
          let searchContent = lineContent;
          let startIndex = 0;

          while (startIndex < searchContent.length) {
            const index = searchContent.indexOf(searchTerm, startIndex);
            if (index === -1) break;

            // Check whole word if required
            if (searchOptions.wholeWord) {
              const beforeChar = index > 0 ? searchContent[index - 1] : ' ';
              const afterChar = index + searchTerm.length < searchContent.length
                ? searchContent[index + searchTerm.length]
                : ' ';

              if (/\w/.test(beforeChar) || /\w/.test(afterChar)) {
                startIndex = index + 1;
                continue;
              }
            }

            const contextStart = Math.max(0, index - 50);
            const contextEnd = Math.min(searchContent.length, index + searchTerm.length + 50);
            const context = lineContent.substring(contextStart, contextEnd);

            matches.push({
              line: lineIndex + 1,
              column: index + 1,
              text: lineContent.substring(index, index + searchTerm.length),
              context
            });

            score += 1;
            startIndex = index + searchTerm.length;
          }
        });

        if (matches.length > 0) {
          results.push({
            file,
            matches,
            score
          });
        }
      }

      // Sort by score and limit results
      results.sort((a, b) => b.score - a.score);
      setSearchResults(results.slice(0, searchOptions.maxResults));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [files, searchOptions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    clearSearch,
    performSearch
  };
};
