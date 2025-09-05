import { Component, signal, computed, effect, Pipe, PipeTransform, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { RepoFlattenerService, ProcessResult } from './services/repo-flattener.service';
import { ThemeService } from './services/theme.service';
import { NavigationService } from './services/navigation.service';
import { SearchService } from './services/search.service';
import { SettingsService } from './services/settings.service';
import { FileService } from './services/file.service';
import hljs from 'highlight.js/lib/common';
import { CollapsibleSectionComponent } from './collapsible-section.component';
import { ThemeToggleComponent } from './theme-toggle.component';
import { FileTreeComponent } from './file-tree.component';
import { ButtonComponent, CardComponent, BadgeComponent, SeparatorComponent, InputComponent } from './ui';

@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    // Escape básico para evitar inyección
  const esc = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c] || c));
    // Code fences ```
  let html = value.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      return `<pre><code class="lang-${lang}">${esc(code)}</code></pre>`;
    });
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, (_m, code) => `<code>${esc(code)}</code>`);
    const parts = html.split(/\n{2,}/).map(block => {
      if (block.startsWith('<pre><code')) return block; // ya es code fence
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    });
    return parts.join('\n');
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatExpansionModule,
    CollapsibleSectionComponent,
    ThemeToggleComponent,
    FileTreeComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SeparatorComponent,
    InputComponent,
  MarkdownPipe,
  RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RenderGit';
  repoUrl = '';
  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<ProcessResult | null>(null);
  viewMode = signal<'human' | 'llm'>('human');
  filter = signal('');
  // Incremental rendering
  visibleRendered = signal<any[]>([]); // subset de result().rendered
  private batchSize = 8;
  private loadIndex = 0;

  // Services
  public themeService = inject(ThemeService);
  public navigationService = inject(NavigationService);
  private searchService = inject(SearchService);
  private settingsService = inject(SettingsService);
  private fileService = inject(FileService);

  // UI State
  sidebarCollapsed = signal(false);
  sidebarPinned = signal(false);
  searchQuery = signal('');
  selectedFiles = signal<string[]>([]);
  currentFile = signal<string>('');

  // Computed signals
  public filteredToc = computed(() => {
    const r = this.result();
    const f = this.filter().toLowerCase();
    if (!r) return [];
    if (!f) return r.toc;
    return r.toc.filter(i => i.rel.toLowerCase().includes(f));
  });

  isDarkTheme = computed(() => this.themeService.isDark());
  userPreferences = computed(() => this.settingsService.userPreferences());

  // Public methods for template access
  public canGoBack(): boolean {
    return this.navigationService.canGoBack();
  }

  public canGoForward(): boolean {
    return this.navigationService.canGoForward();
  }

  public goBack(): void {
    if (this.navigationService.goBack()) {
      const path = this.navigationService.navigationState().currentPath;
      this.scrollToFile(path);
    }
  }

  public goForward(): void {
    if (this.navigationService.goForward()) {
      const path = this.navigationService.navigationState().currentPath;
      this.scrollToFile(path);
    }
  }

  public scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Global collapse/expand methods
  expandAllSections(): void {
    // This would be implemented with a service to communicate with all collapsible sections
    console.log('Expand all sections');
  }

  collapseAllSections(): void {
    // This would be implemented with a service to communicate with all collapsible sections
    console.log('Collapse all sections');
  }

  constructor(private flattener: RepoFlattenerService) {
    // Initialize theme on app start
    this.themeService.setTheme(this.themeService.currentTheme());

    effect(() => {
      const res = this.result();
      if (!res) return;
  // Reiniciar incremental
  this.visibleRendered.set([]);
  this.loadIndex = 0;
  this.enqueueBatch();
    });

    // Initialize file tree when result changes
    effect(() => {
      const res = this.result();
      if (res) {
        this.fileService.buildFileTree(res.files);
      }
    });

    // Sync search query
    effect(() => {
      this.searchService.setSearchQuery(this.searchQuery());
    });
  }

  async onSubmit() {
    this.error.set(null);
    this.result.set(null);
    this.loading.set(true);
    try {
      const res = await this.flattener.processRepo(this.repoUrl.trim());
      this.result.set(res);
      this.viewMode.set('human');
    } catch (e: any) {
      this.error.set(e.message || 'Error desconocido');
    } finally {
      this.loading.set(false);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const scrollY = window.scrollY;
    const shouldCollapse = scrollY > 100;

    if (!this.sidebarPinned() && shouldCollapse !== this.sidebarCollapsed()) {
      this.sidebarCollapsed.set(shouldCollapse);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleSidebarPin(): void {
    this.sidebarPinned.set(!this.sidebarPinned());
    if (!this.sidebarPinned()) {
      this.sidebarCollapsed.set(false);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onFileSelect(filePath: string): void {
    this.currentFile.set(filePath);
    this.navigationService.navigateTo(filePath);
  }

  // File tree state
  fileTree = computed(() => this.fileService.fileTree());

  onFileTreeToggle(node: any): void {
    // Handle directory expansion/collapse
    console.log('Directory toggled:', node);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onTextareaFocus(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target && target.select) {
      target.select();
    }
  }

  private scrollToFile(path: string): void {
    const element = document.getElementById('file-' + this.flattener.slugify(path));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  bytesHuman(n: number) { return this.flattener.bytesHuman(n); }
  slugify(p: string) { return this.flattener.slugify(p); }
  switchView(mode: 'human'|'llm') { this.viewMode.set(mode); }

  enqueueBatch() {
    const res = this.result();
    if (!res) return;
    const next = res.rendered.slice(0, this.loadIndex + this.batchSize);
    this.loadIndex = next.length;
    this.visibleRendered.set(next);
    if (this.loadIndex < res.rendered.length) {
      requestAnimationFrame(() => this.enqueueBatch());
    }
  }
}
