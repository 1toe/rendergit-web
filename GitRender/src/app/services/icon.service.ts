import { Injectable } from '@angular/core';

export interface IconMapping {
  name: string;
  lucideName: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class IconService {
  
  private iconMappings: IconMapping[] = [
    { name: 'pin', lucideName: 'pin', description: 'Pin/Anchor sidebar' },
    { name: 'pin-off', lucideName: 'pin-off', description: 'Unpin sidebar' },
    { name: 'arrow-left', lucideName: 'arrow-left', description: 'Navigate back' },
    { name: 'arrow-right', lucideName: 'arrow-right', description: 'Navigate forward' },
    { name: 'arrow-up', lucideName: 'arrow-up', description: 'Go to top' },
    { name: 'sun', lucideName: 'sun', description: 'Light theme' },
    { name: 'moon', lucideName: 'moon', description: 'Dark theme' },
    { name: 'user', lucideName: 'user', description: 'Human view' },
    { name: 'bot', lucideName: 'bot', description: 'LLM view' },
    { name: 'folder', lucideName: 'folder', description: 'Open folder' },
    { name: 'folder-closed', lucideName: 'folder-closed', description: 'Closed folder' },
    { name: 'file', lucideName: 'file', description: 'File' },
    { name: 'search', lucideName: 'search', description: 'Search' },
    { name: 'x', lucideName: 'x', description: 'Close/Clear' },
    { name: 'menu', lucideName: 'menu', description: 'Menu toggle' },
    { name: 'chevron-down', lucideName: 'chevron-down', description: 'Expand' },
    { name: 'chevron-right', lucideName: 'chevron-right', description: 'Collapse' },
    { name: 'git-branch', lucideName: 'git-branch', description: 'Git branch' },
    { name: 'external-link', lucideName: 'external-link', description: 'External link' },
    { name: 'copy', lucideName: 'copy', description: 'Copy to clipboard' },
    { name: 'check', lucideName: 'check', description: 'Success/Completed' }
  ];

  getIconName(iconKey: string): string {
    const mapping = this.iconMappings.find(m => m.name === iconKey);
    return mapping ? mapping.lucideName : iconKey;
  }

  getIconDescription(iconKey: string): string {
    const mapping = this.iconMappings.find(m => m.name === iconKey);
    return mapping ? mapping.description : '';
  }

  getAllIcons(): IconMapping[] {
    return this.iconMappings;
  }
}
