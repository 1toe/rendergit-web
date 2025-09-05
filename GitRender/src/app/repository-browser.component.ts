import { Component, computed, effect, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { REPO_FILE_STRUCTURE, RepoFileItem, SKIPPED_ITEMS, DB_VALORES_EJEMPLO, AUTH_CONTROLLER_CODE } from './services/repository-browser.data';
import { ThemeService } from './services/theme.service';

// Componente simple de visualización de código (debe declararse antes de usarlo en imports)
@Component({
  selector: 'app-code-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="code-wrapper">
      <pre><code><ng-container *ngFor="let ln of visibleLines; let i = index"><span class="ln">{{ i+1 }}</span>{{ ln }}\n</ng-container></code></pre>
      <button *ngIf="collapsed" type="button" class="show-more" (click)="expand()">Mostrar todo ({{ lines.length }} líneas)</button>
    </div>
  `,
  styles: [`
    .code-wrapper { border: 1px solid var(--border); border-radius: 8px; background: var(--code-bg); overflow:auto; }
    pre { margin:0; padding:12px 16px; font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.4; }
    .ln { display:inline-block; width: 2.5em; opacity:.45; user-select:none; }
    .show-more { width:100%; border:0; background:var(--accent,#6366f1); color:#fff; padding:.45rem .75rem; cursor:pointer; font-size:.7rem; }
    :host-context(.dark) .code-wrapper { --code-bg:#0f172a; --border:#334155; color:#e2e8f0; }
    :host-context(.repo-browser:not(.dark)) .code-wrapper { --code-bg:#f8fafc; --border:#cbd5e1; color:#0f172a; }
  `]
})
export class CodeViewComponent {
  lines: string[] = [];
  visibleLines: string[] = [];
  collapsed = true;
  private maxPreview = 120;
  private _code = '';
  get code() { return this._code; }
  @Input() set code(value: string) { this._code = value; this.lines = value.split(/\r?\n/); this.updateVisible(); }
  @Input() language = '';
  private updateVisible() {
    if (this.collapsed && this.lines.length > this.maxPreview) {
      this.visibleLines = this.lines.slice(0, this.maxPreview);
    } else {
      this.visibleLines = this.lines;
    }
  }
  expand() { this.collapsed = false; this.updateVisible(); }
}

@Component({
  selector: 'app-repository-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeViewComponent],
  styleUrls: ['./repository-browser.component.css'],
  template: `
  <div class="repo-browser" [class.dark]="isDark">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()" (mouseenter)="hoverSidebar(true)" (mouseleave)="hoverSidebar(false)">
        <div class="sidebar-header">
          <h2 *ngIf="sidebarVisible()">Contents ({{ totalFiles() }})</h2>
          <div class="actions">
            <button type="button" (click)="togglePin()" *ngIf="sidebarVisible()" [title]="pinned() ? 'Desanclar' : 'Anclar'">{{ pinned() ? '📌' : '📍' }}</button>
            <button type="button" (click)="toggleCollapse()" [title]="sidebarCollapsed() ? 'Expandir' : 'Colapsar'">{{ sidebarCollapsed() ? '☰' : '✕' }}</button>
          </div>
        </div>
        <div *ngIf="sidebarVisible()" class="search-box">
          <input type="text" placeholder="Buscar..." [(ngModel)]="searchQuery" />
          <button type="button" class="back-top" (click)="scrollTop()">↑ Top</button>
        </div>
        <div *ngIf="sidebarVisible()" class="file-tree-scroll">
          <ng-container *ngFor="let item of filteredStructure()">
            <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{item: item, depth:0}"></ng-container>
          </ng-container>
        </div>
      </aside>

      <main class="main-area">
        <header class="top-bar">
          <div class="repo-info">
            <span class="branch">🔀</span>
            <span>Repository: <a href="https://github.com/1toe/Learn-With-You" target="_blank" rel="noopener">https://github.com/1toe/Learn-With-You</a></span>
            <button type="button" (click)="theme.toggleTheme()" class="theme-toggle" [title]="isDark ? 'Modo claro' : 'Modo oscuro'">{{ isDark ? '🌞' : '🌙' }}</button>
          </div>
          <div class="stats">
            <div class="stat"><strong>{{ totalFiles() }}</strong><span>Total Files</span></div>
            <div class="stat"><strong>51</strong><span>Rendered</span></div>
            <div class="stat"><strong>38</strong><span>Skipped</span></div>
            <div class="stat"><strong>100%</strong><span>Analyzed</span></div>
          </div>
          <div class="view-switch">
            <span>View:</span>
            <button type="button" [class.active]="viewMode() === 'human'" (click)="viewMode.set('human')">🧑 Human</button>
            <button type="button" [class.active]="viewMode() === 'llm'" (click)="viewMode.set('llm')">🤖 LLM</button>
          </div>
          <h1>Directory tree</h1>
        </header>

        <section class="content-area">
          <ng-container [ngSwitch]="currentView()">
            <div *ngSwitchCase="'directory'">
              <pre class="tree-block"><code>{{ directoryAscii }}</code></pre>
              <div *ngIf="selectedFile() === 'app/data/dbConValoresEjemplo.js'" class="file-view">
                <h3>app/data/dbConValoresEjemplo.js <small>14.2 KiB</small></h3>
                <app-code-view [code]="dbCode" language="javascript"></app-code-view>
              </div>
            </div>
            <div *ngSwitchCase="'skipped'">
              <h2>Skipped items</h2>
              <div *ngFor="let cat of skipped"> 
                <h3>{{ cat.category }}</h3>
                <ul><li *ngFor="let it of cat.items">{{ it }}</li></ul>
              </div>
              <h3>app/controllers/AuthController.js <small>10.5 KiB</small></h3>
              <app-code-view [code]="authCode" language="javascript"></app-code-view>
            </div>
            <div *ngSwitchCase="'documentation'">
              <h2>app/docu.md <small>6.8 KiB</small></h2>
              <article class="docu">
                <h1>Elearn</h1>
                <h2>Descripción</h2>
                <p>Elearn es una plataforma de aprendizaje en línea diseñada ...</p>
              </article>
            </div>
          </ng-container>
        </section>
        <button type="button" class="back-to-top" (click)="scrollTop()" [class.visible]="showBackToTop()">↑</button>
      </main>

      <!-- Template recursivo -->
      <ng-template #nodeTpl let-item="item" let-depth="depth">
        <div class="node" [style.paddingLeft.px]="depth * 16 + 8" [class.selected]="selectedFile() === computePath(item, depth)" (click)="selectItem(item, depth)">
          <span class="icon" *ngIf="item.type === 'folder'" (click)="toggleFolder(item, $event)">{{ item.isOpen ? '▼' : '▶' }}</span>
          <span class="icon" *ngIf="item.type === 'folder'">{{ item.isOpen ? '📂' : '📁' }}</span>
          <span class="icon" *ngIf="item.type === 'file'">📄</span>
          <span class="name">{{ item.name }}</span>
          <span class="size" *ngIf="item.size">{{ item.size }}</span>
        </div>
        <div *ngIf="item.children && item.isOpen">
          <ng-container *ngFor="let ch of item.children">
            <ng-container [ngTemplateOutlet]="nodeTpl" [ngTemplateOutletContext]="{item: ch, depth: depth+1}"></ng-container>
          </ng-container>
        </div>
      </ng-template>
    </div>
  `
})
export class RepositoryBrowserComponent {
  structure = signal<RepoFileItem[]>(REPO_FILE_STRUCTURE);
  displayedStructure = signal<RepoFileItem[]>([]); // subset incremental
  private batchSize = 10;
  private loadIndex = 0;
  searchQuery = '';
  selectedFile = signal<string>('app/data/dbConValoresEjemplo.js');
  viewMode = signal<'human' | 'llm'>('human');
  currentView = signal<'directory' | 'skipped' | 'documentation'>('directory');
  sidebarCollapsed = signal(false);
  sidebarHover = signal(false);
  pinned = signal(false);
  showBackToTop = signal(false);

  skipped = SKIPPED_ITEMS;
  dbCode = DB_VALORES_EJEMPLO;
  authCode = AUTH_CONTROLLER_CODE;

  directoryAscii = `repo\n├── app\n│   ├── controllers\n│   │   ├── AuthController.js\n│   │   ├── ContentController.js\n│   │   ├── CourseContentController.js\n│   │   ├── CourseController.js\n│   │   ├── LessonController.js\n│   │   └── ProfileController.js\n│   ├── data\n│   │   ├── database.sqlite\n│   │   ├── db.js\n│   │   └── dbConValoresEjemplo.js\n│   ├── docu.md\n│   ├── models ...`;

  constructor(public theme: ThemeService) {
    // Escuchar scroll global
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 200 && !this.sidebarCollapsed() && !this.pinned()) this.sidebarCollapsed.set(true);
      if (y < 100 && this.sidebarCollapsed() && !this.pinned()) this.sidebarCollapsed.set(false);
      this.showBackToTop.set(y > 400);
    }, { passive: true });
  // Iniciar carga incremental
  this.enqueueBatch();
  }

  get isDark() { return this.theme.isDark(); }

  filteredStructure = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.displayedStructure();
    const filterFn = (items: RepoFileItem[]): RepoFileItem[] => items
      .map(it => ({ ...it }))
      .filter(it => it.name.toLowerCase().includes(q) || (it.children && it.children.some(c => c.name.toLowerCase().includes(q))))
      .map(it => {
        if (it.children) it.children = filterFn(it.children);
        return it;
      });
    return filterFn(this.displayedStructure());
  });

  totalFiles = computed(() => {
    let count = 0;
    const walk = (items: RepoFileItem[]) => items.forEach(it => { if (it.type === 'file') count++; else if (it.children) walk(it.children); });
    walk(this.displayedStructure());
    return count;
  });

  sidebarVisible = computed(() => this.pinned() || this.sidebarHover() || !this.sidebarCollapsed());

  hoverSidebar(v: boolean) { this.sidebarHover.set(v); }
  toggleCollapse() { this.sidebarCollapsed.set(!this.sidebarCollapsed()); }
  togglePin() { this.pinned.set(!this.pinned()); }
  scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  computePath(item: RepoFileItem, depth: number): string {
    if (item.name === 'docu.md') return 'app/docu.md';
    if (item.name === 'dbConValoresEjemplo.js') return 'app/data/dbConValoresEjemplo.js';
    // Simplificación: si es archivo en controllers
    return `app/controllers/${item.name}`;
  }

  selectItem(item: RepoFileItem, depth: number) {
    if (item.type === 'file') {
      const path = this.computePath(item, depth);
      this.selectedFile.set(path);
      if (item.name === 'docu.md') this.currentView.set('documentation');
      else this.currentView.set('directory');
    }
  }

  toggleFolder(item: RepoFileItem, ev: Event) {
    ev.stopPropagation();
    if (item.type === 'folder') item.isOpen = !item.isOpen;
  }

  private enqueueBatch() {
    const flattened: RepoFileItem[] = [];
    const collect = (items: RepoFileItem[]) => {
      for (const it of items) {
        flattened.push(it);
        if (it.children) collect(it.children);
      }
    };
    collect(this.structure());
    const nextPortion = flattened.slice(0, this.loadIndex + this.batchSize);
    this.loadIndex = nextPortion.length;
    // Reconstruir jerarquía parcial
    const rebuild = (items: RepoFileItem[]): RepoFileItem[] => items.map(it => {
      const clone: RepoFileItem = { ...it };
      if (clone.children) {
        clone.children = rebuild(clone.children).filter(ch => flattened.indexOf(ch as any) < this.loadIndex);
      }
      return clone;
    });
    this.displayedStructure.set(rebuild(this.structure()));
    if (this.loadIndex < flattened.length) {
      requestAnimationFrame(() => this.enqueueBatch());
    }
  }
}

// (Fin CodeViewComponent)
