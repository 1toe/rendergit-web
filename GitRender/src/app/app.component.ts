import { Component, signal, computed, effect, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepoFlattenerService, ProcessResult } from './services/repo-flattener.service';
import hljs from 'highlight.js/lib/common';
import { marked } from 'marked';

@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
  return marked.parse(value) as string;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
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

  filteredToc = computed(() => {
    const r = this.result();
    const f = this.filter().toLowerCase();
    if (!r) return [];
    if (!f) return r.toc;
    return r.toc.filter(i => i.rel.toLowerCase().includes(f));
  });

  constructor(private flattener: RepoFlattenerService) {
    effect(() => {
      const res = this.result();
      if (!res) return;
      queueMicrotask(() => {
        document.querySelectorAll('pre code').forEach(block => {
          try { hljs.highlightElement(block as HTMLElement); } catch {}
        });
      });
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

  bytesHuman(n: number) { return this.flattener.bytesHuman(n); }
  slugify(p: string) { return this.flattener.slugify(p); }
  switchView(mode: 'human'|'llm') { this.viewMode.set(mode); }
}
