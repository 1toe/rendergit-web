export interface RenderDecision {
  include: boolean;
  reason: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
}

export interface FileInfo {
  path: string;
  size: number;
  decision: RenderDecision;
  content?: string;
  isMarkdown?: boolean;
}

export interface ProcessResult {
  owner: string;
  repo: string;
  commitSha: string;
  files: FileInfo[];
  rendered: FileInfo[];
  skippedBinary: FileInfo[];
  skippedLarge: FileInfo[];
  skippedIgnored: FileInfo[];
  treeText: string;
  cxmlText: string;
  toc: { anchor: string; rel: string; size: number; }[];
}

const MAX_BYTES = 50 * 1024;
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.ico',
  '.pdf', '.zip', '.tar', '.gz', '.bz2', '.xz', '.7z', '.rar',
  '.mp3', '.mp4', '.mov', '.avi', '.mkv', '.wav', '.ogg', '.flac',
  '.ttf', '.otf', '.eot', '.woff', '.woff2',
  '.so', '.dll', '.dylib', '.class', '.jar', '.exe', '.bin'
]);
const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd', '.mkdn']);

export class RepoFlattenerService {
  async processRepo(url: string, commitSha?: string, signal?: AbortSignal): Promise<ProcessResult> {
    const { owner, repo } = this.parseRepoUrl(url);
    const commit = commitSha 
      ? await this.getCommit(owner, repo, commitSha, signal)
      : await this.getLatestCommit(owner, repo, signal);
    const tree = await this.getTree(owner, repo, commit.sha, signal);

    const files: FileInfo[] = [];
    for (const item of tree) {
      if (item.type !== 'blob') continue;
      const size = item.size ?? 0;
      const decision = this.decideFile(item.path, size);
      const info: FileInfo = { path: item.path, size, decision };
      if (decision.include) {
        try {
          const text = await this.getFileContent(owner, repo, commit.sha, item.path, signal, size);
          info.content = text;
          const lower = item.path.toLowerCase();
          info.isMarkdown = [...MARKDOWN_EXTENSIONS].some(ext => lower.endsWith(ext));
        } catch (err) {
          info.decision = { include: false, reason: 'fetch_error' };
        }
      }
      files.push(info);
    }

    const rendered = files.filter(f => f.decision.include);
    const skippedBinary = files.filter(f => f.decision.reason === 'binary');
    const skippedLarge = files.filter(f => f.decision.reason === 'too_large');
    const skippedIgnored = files.filter(f => f.decision.reason === 'ignored');

    const treeText = this.generateTreeText(tree, repo);
    const cxmlText = this.generateCxml(rendered, url);
    const toc = rendered.map(r => ({ anchor: this.slugify(r.path), rel: r.path, size: r.size }));

    return { owner, repo, commitSha: commit.sha, files, rendered, skippedBinary, skippedLarge, skippedIgnored, treeText, cxmlText, toc };
  }

  private parseRepoUrl(repoUrl: string): { owner: string; repo: string; } {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/#?]+)/i);
    if (!match) throw new Error('URL de repositorio inválida');
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');
    return { owner, repo };
  }

  async getCommits(repoUrl: string, perPage: number = 30): Promise<CommitInfo[]> {
    const { owner, repo } = this.parseRepoUrl(repoUrl);
    const commits = await this.fetchJson(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}`);
    if (!Array.isArray(commits)) throw new Error('Error al obtener commits');
    
    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date
      },
      committer: {
        name: commit.commit.committer.name,
        email: commit.commit.committer.email,
        date: commit.commit.committer.date
      }
    }));
  }

  private async getCommit(owner: string, repo: string, sha: string, signal?: AbortSignal): Promise<any> {
    const commit = await this.fetchJson(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, signal);
    return commit;
  }

  private async getLatestCommit(owner: string, repo: string, signal?: AbortSignal): Promise<any> {
    const commits = await this.fetchJson(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, signal);
    if (!Array.isArray(commits) || !commits.length) throw new Error('No se encontró commit');
    return commits[0];
  }

  private async getTree(owner: string, repo: string, sha: string, signal?: AbortSignal): Promise<any[]> {
    const root = await this.fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, signal);
    return root.tree || [];
  }

  private async getFileContent(owner: string, repo: string, sha: string, path: string, signal: AbortSignal | undefined, size: number): Promise<string> {
    if (size > MAX_BYTES) throw new Error('too large');
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/${path}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('fetch failed');
    const buf = await res.arrayBuffer();
    if (this.looksBinary(new Uint8Array(buf), path)) throw new Error('binary');
    return new TextDecoder('utf-8', { fatal: false }).decode(buf);
  }

  private fetchJson(url: string, signal?: AbortSignal): Promise<any> {
    return fetch(url, { signal }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  private decideFile(rel: string, size: number): RenderDecision {
    if (rel.includes('/.git/') || rel.startsWith('.git/')) return { include: false, reason: 'ignored' };
    if (size > MAX_BYTES) return { include: false, reason: 'too_large' };
    if (this.extensionBinary(rel)) return { include: false, reason: 'binary' };
    return { include: true, reason: 'ok' };
  }

  private extensionBinary(path: string): boolean {
    const lower = path.toLowerCase();
    for (const ext of BINARY_EXTENSIONS) if (lower.endsWith(ext)) return true;
    return false;
  }

  private looksBinary(bytes: Uint8Array, path: string): boolean {
    if (this.extensionBinary(path)) return true;
    const sample = bytes.subarray(0, Math.min(8192, bytes.length));
    let zero = 0;
    for (const b of sample) { if (b === 0) { zero++; if (zero > 1) return true; } }
    return false;
  }

  bytesHuman(n: number): string {
    const units = ['B','KiB','MiB','GiB','TiB'];
    let f = n; let i = 0;
    while (f >= 1024 && i < units.length - 1) { f /= 1024; i++; }
    return i === 0 ? `${f.toFixed(0)} ${units[i]}` : `${f.toFixed(1)} ${units[i]}`;
  }

  generateCxml(rendered: FileInfo[], repoUrl: string): string {
    const lines: string[] = ['<documents>'];
    rendered.forEach((f, idx) => {
      lines.push(`<document index="${idx+1}" path="${this.escapeAttr(f.path)}" bytes="${f.size}" repo="${this.escapeAttr(repoUrl)}">`);
      lines.push('<![CDATA[' + f.content?.replace(/]]>/g, ']]]]><![CDATA[>') + ']]>');
      lines.push('</document>');
    });
    lines.push('</documents>');
    return lines.join('\n');
  }

  private escapeAttr(t: string): string { return t.replace(/['"<&]/g, c => ({'"':'&quot;','\'':'&apos;','<':'&lt;','&':'&amp;'} as any)[c] || c); }

  private generateTreeText(tree: any[], repo: string): string {
    const lines = [repo];
    const items = tree.filter(i => i.type === 'tree' || i.type === 'blob').map(i => i.path).sort();
    for (const p of items) lines.push(p);
    return lines.join('\n');
  }

  slugify(path: string): string { return path.replace(/[^a-zA-Z0-9\-_]/g, '-'); }
}

// Exportar instancia singleton
export const repoFlattenerService = new RepoFlattenerService();
