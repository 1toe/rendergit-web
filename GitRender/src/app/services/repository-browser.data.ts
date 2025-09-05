// Datos estáticos adaptados del snippet React para el componente RepositoryBrowser
// Simplificados para Angular.

export interface RepoFileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string; // Mostrar tamaño como string amigable
  children?: RepoFileItem[];
  isOpen?: boolean;
}

export const REPO_FILE_STRUCTURE: RepoFileItem[] = [
  {
    name: '.gitignore',
    type: 'file',
    size: '38 B'
  },
  {
    name: 'app',
    type: 'folder',
    isOpen: true,
    children: [
      {
        name: 'controllers',
        type: 'folder',
        isOpen: true,
        children: [
          { name: 'AuthController.js', type: 'file', size: '10.5 KiB' },
          { name: 'ContentController.js', type: 'file', size: '5.2 KiB' },
          { name: 'CourseContentController.js', type: 'file', size: '8.9 KiB' },
          { name: 'CourseController.js', type: 'file', size: '9.9 KiB' },
          { name: 'LessonController.js', type: 'file', size: '8.6 KiB' },
          { name: 'ProfileController.js', type: 'file', size: '3.0 KiB' }
        ]
      },
      {
        name: 'data',
        type: 'folder',
        isOpen: true,
        children: [
          { name: 'db.js', type: 'file', size: '6.2 KiB' },
          { name: 'dbConValoresEjemplo.js', type: 'file', size: '14.2 KiB' }
        ]
      },
      { name: 'docu.md', type: 'file', size: '6.8 KiB' },
      {
        name: 'models',
        type: 'folder',
        isOpen: true,
        children: [
          { name: 'Answer.js', type: 'file', size: '1.8 KiB' },
          { name: 'Content.js', type: 'file', size: '2.7 KiB' },
          { name: 'Course.js', type: 'file', size: '3.2 KiB' },
          { name: 'Lesson.js', type: 'file', size: '2.3 KiB' },
          { name: 'Progress.js', type: 'file', size: '3.3 KiB' },
          { name: 'Question.js', type: 'file', size: '1.7 KiB' },
          { name: 'StudentAnswer.js', type: 'file', size: '884 B' },
          { name: 'User.js', type: 'file', size: '3.8 KiB' }
        ]
      }
    ]
  }
];

export interface SkippedCategory {
  category: string;
  items: string[];
}

export const SKIPPED_ITEMS: SkippedCategory[] = [
  {
    category: 'Skipped binaries (2)',
    items: [
      'app/public/assets/img/pexels-photo-159888.jpeg (39.3 KiB)',
      'app/public/assets/img/photo-1461749280684-dccba630e2f6.jpg (48.2 KiB)'
    ]
  },
  {
    category: 'Skipped large files (7)',
    items: [
      'app/data/database.sqlite (760 KiB)',
      'app/public/assets/img/g9a124ce5b7a7835f471a75726dd18fe09f48d209e768bade848fc9ead0e11c1be514f133cee6c371bb1ba95e50ae73eb6b030042572cf9b64b0919ac9ae27bb_64.jpg (330.2 KiB)',
      'app/public/assets/img/photo-1461749280684-dccba630e2f6.jpg (114.3 KiB)',
      'app/public/assets/img/photo-1516321497487-e288fb19713f.jpg (151.0 KiB)',
      'app/public/assets/img/photo-1635070041409-e63e783ce3c1.jpg (130.4 KiB)',
      'app.rar (872.5 KiB)',
      'package-lock.json (52.6 KiB)'
    ]
  }
];

export const DB_VALORES_EJEMPLO = `const db = require('./db');\n// Datos de ejemplo...\nmodule.exports = db;`;
export const AUTH_CONTROLLER_CODE = `const Usuario = require("../models/User");\nconst { determineUserType } = require("../utils/validators");`;
