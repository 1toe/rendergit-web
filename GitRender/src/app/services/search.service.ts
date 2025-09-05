import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { FileInfo } from './repo-flattener.service';

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

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchSubject = new BehaviorSubject<string>('');
  public searchQuery$ = this.searchSubject.asObservable();

  public searchQuery = signal<string>('');
  public isSearching = signal<boolean>(false);
  public searchResults = signal<SearchResult[]>([]);

  private searchOptions: SearchOptions = {
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    fileTypes: [],
    maxResults: 100
  };

  constructor() {
    // Debounced search
    this.searchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim()) {
        this.performSearch(query);
      } else {
        this.searchResults.set([]);
      }
    });
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  setSearchOptions(options: Partial<SearchOptions>): void {
    this.searchOptions = { ...this.searchOptions, ...options };
  }

  searchFiles(query: string, files: FileInfo[]): Observable<SearchResult[]> {
    return new Observable(observer => {
      this.isSearching.set(true);
      try {
        const results = this.performSearchSync(query, files);
        this.searchResults.set(results);
        observer.next(results);
        observer.complete();
      } catch (error) {
        observer.error(error);
      } finally {
        this.isSearching.set(false);
      }
    });
  }

  private performSearch(query: string): void {
    // This would be called with actual files from the component
    // For now, just clear results if no files provided
    this.searchResults.set([]);
  }

  private performSearchSync(query: string, files: FileInfo[]): SearchResult[] {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const regex = this.buildRegex(query);

    for (const file of files) {
      if (!file.content) continue;

      // Filter by file types if specified
      if (this.searchOptions.fileTypes.length > 0) {
        const fileExt = this.getFileExtension(file.path);
        if (!this.searchOptions.fileTypes.includes(fileExt)) continue;
      }

      const matches = this.findMatches(file.content, regex);
      if (matches.length > 0) {
        const score = this.calculateScore(matches, query);
        results.push({
          file,
          matches,
          score
        });
      }
    }

    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, this.searchOptions.maxResults);
  }

  private buildRegex(query: string): RegExp {
    let pattern = query;
    let flags = 'g';

    if (!this.searchOptions.caseSensitive) {
      flags += 'i';
    }

    if (this.searchOptions.wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    if (!this.searchOptions.regex) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return new RegExp(pattern, flags);
  }

  private findMatches(content: string, regex: RegExp): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        const context = this.getContext(lines, lineIndex, match.index);
        matches.push({
          line: lineIndex + 1,
          column: match.index + 1,
          text: match[0],
          context
        });

        // Prevent infinite loop on zero-width matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    });

    return matches;
  }

  private getContext(lines: string[], lineIndex: number, matchIndex: number): string {
    const line = lines[lineIndex];
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(line.length, matchIndex + 50);
    return line.substring(start, end);
  }

  private calculateScore(matches: SearchMatch[], query: string): number {
    let score = matches.length * 10;

    // Bonus for exact matches
    if (matches.some(m => m.text.toLowerCase() === query.toLowerCase())) {
      score += 50;
    }

    // Bonus for matches at the beginning of lines
    score += matches.filter(m => m.column <= 5).length * 5;

    return score;
  }

  private getFileExtension(path: string): string {
    const parts = path.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  highlightText(text: string, query: string): string {
    if (!query.trim()) return text;

    const regex = this.buildRegex(query);
    return text.replace(regex, '<mark>$&</mark>');
  }
}
