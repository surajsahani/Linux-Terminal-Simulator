interface FileSystemNode {
  type: 'file' | 'directory';
  name: string;
  content?: string;
  children?: Record<string, FileSystemNode>;
}

export class FileSystem {
  private root: FileSystemNode;
  
  constructor() {
    // Initialize with a basic Linux-like directory structure
    this.root = {
      type: 'directory',
      name: '/',
      children: {
        'home': {
          type: 'directory',
          name: 'home',
          children: {
            'user': {
              type: 'directory',
              name: 'user',
              children: {
                'documents': {
                  type: 'directory',
                  name: 'documents',
                  children: {
                    'welcome.txt': {
                      type: 'file',
                      name: 'welcome.txt',
                      content: 'Welcome to LinuxSim!\nThis is a simulated Linux environment running in your browser.'
                    },
                    'notes.txt': {
                      type: 'file',
                      name: 'notes.txt',
                      content: 'Some example notes.\nFeel free to edit this file using echo with redirection.'
                    }
                  }
                },
                'projects': {
                  type: 'directory',
                  name: 'projects',
                  children: {}
                },
                '.config': {
                  type: 'directory',
                  name: '.config',
                  children: {
                    'settings.ini': {
                      type: 'file',
                      name: 'settings.ini',
                      content: '[Settings]\nShowHiddenFiles=false\nTheme=dark'
                    }
                  }
                }
              }
            }
          }
        },
        'bin': {
          type: 'directory',
          name: 'bin',
          children: {
            'bash': {
              type: 'file',
              name: 'bash',
              content: '#!/bin/bash\n# This is a simulated executable'
            },
            'ls': {
              type: 'file',
              name: 'ls',
              content: '#!/bin/bash\n# This is a simulated executable'
            },
            'cat': {
              type: 'file',
              name: 'cat',
              content: '#!/bin/bash\n# This is a simulated executable'
            }
          }
        },
        'etc': {
          type: 'directory',
          name: 'etc',
          children: {
            'passwd': {
              type: 'file',
              name: 'passwd',
              content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash'
            },
            'hosts': {
              type: 'file',
              name: 'hosts',
              content: '127.0.0.1 localhost\n::1 localhost'
            }
          }
        },
        'tmp': {
          type: 'directory',
          name: 'tmp',
          children: {}
        }
      }
    };
  }
  
  // Resolve a path relative to current directory
  public resolvePath(path: string, currentPath: string, createParents: boolean = false): string {
    // Handle absolute paths
    if (path.startsWith('/')) {
      return this.normalizePath(path);
    }
    
    // Handle relative paths
    if (path === '.') {
      return currentPath;
    }
    
    if (path === '..') {
      const parts = currentPath.split('/').filter(p => p !== '');
      if (parts.length === 0) {
        return '/';
      }
      parts.pop();
      return '/' + parts.join('/');
    }
    
    if (path.startsWith('./')) {
      path = path.substring(2);
    }
    
    // Handle paths with parent directory references
    if (path.includes('..')) {
      let result = currentPath;
      const segments = path.split('/');
      
      for (const segment of segments) {
        if (segment === '..') {
          const parts = result.split('/').filter(p => p !== '');
          if (parts.length === 0) {
            result = '/';
          } else {
            parts.pop();
            result = '/' + parts.join('/');
          }
        } else if (segment !== '' && segment !== '.') {
          result = result === '/' ? `/${segment}` : `${result}/${segment}`;
        }
      }
      
      return this.normalizePath(result);
    }
    
    // Handle simple relative paths
    const result = currentPath === '/' ? `/${path}` : `${currentPath}/${path}`;
    return this.normalizePath(result);
  }
  
  // Normalize path (remove double slashes, handle . and ..)
  private normalizePath(path: string): string {
    // Replace multiple slashes with single slash
    path = path.replace(/\/+/g, '/');
    
    // Handle trailing slash
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    return path;
  }
  
  // Get node at path
  private getNode(path: string): FileSystemNode | null {
    if (path === '/') {
      return this.root;
    }
    
    const parts = path.split('/').filter(p => p !== '');
    let current: FileSystemNode = this.root;
    
    for (const part of parts) {
      if (!current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    
    return current;
  }
  
  // Get parent directory node and name of the target
  private getParentAndName(path: string): { parent: FileSystemNode | null, name: string } {
    const parts = path.split('/').filter(p => p !== '');
    
    if (parts.length === 0) {
      return { parent: null, name: '/' };
    }
    
    const name = parts.pop()!;
    const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
    const parent = this.getNode(parentPath);
    
    return { parent, name };
  }
  
  // Check if a path exists
  public exists(path: string): boolean {
    return this.getNode(path) !== null;
  }
  
  // Check if a path is a directory
  public isDirectory(path: string): boolean {
    const node = this.getNode(path);
    return node !== null && node.type === 'directory';
  }
  
  // List directory contents
  public listDir(path: string): string[] {
    const node = this.getNode(path);
    
    if (!node || node.type !== 'directory') {
      throw new Error(`No such directory: ${path}`);
    }
    
    return Object.keys(node.children || {});
  }
  
  // Create directory
  public mkdir(path: string): void {
    if (this.exists(path)) {
      throw new Error(`File exists: ${path}`);
    }
    
    const { parent, name } = this.getParentAndName(path);
    
    if (!parent) {
      throw new Error(`Cannot create directory '${path}': No such file or directory`);
    }
    
    if (parent.type !== 'directory') {
      throw new Error(`Not a directory: ${path}`);
    }
    
    if (!parent.children) {
      parent.children = {};
    }
    
    parent.children[name] = {
      type: 'directory',
      name,
      children: {}
    };
  }
  
  // Create file
  public touch(path: string): void {
    // If file already exists, we just update its timestamp (not implemented here)
    if (this.exists(path)) {
      return;
    }
    
    const { parent, name } = this.getParentAndName(path);
    
    if (!parent) {
      throw new Error(`Cannot create file '${path}': No such file or directory`);
    }
    
    if (parent.type !== 'directory') {
      throw new Error(`Not a directory: ${path}`);
    }
    
    if (!parent.children) {
      parent.children = {};
    }
    
    parent.children[name] = {
      type: 'file',
      name,
      content: ''
    };
  }
  
  // Read file
  public readFile(path: string): string {
    const node = this.getNode(path);
    
    if (!node) {
      throw new Error(`No such file or directory: ${path}`);
    }
    
    if (node.type !== 'file') {
      throw new Error(`Is a directory: ${path}`);
    }
    
    return node.content || '';
  }
  
  // Write to file
  public writeFile(path: string, content: string): void {
    // Create file if it doesn't exist
    if (!this.exists(path)) {
      this.touch(path);
    }
    
    const node = this.getNode(path);
    
    if (!node) {
      throw new Error(`No such file or directory: ${path}`);
    }
    
    if (node.type !== 'file') {
      throw new Error(`Is a directory: ${path}`);
    }
    
    node.content = content;
  }
  
  // Remove file
  public rm(path: string): void {
    const { parent, name } = this.getParentAndName(path);
    
    if (!parent || !parent.children || !parent.children[name]) {
      throw new Error(`No such file or directory: ${path}`);
    }
    
    if (parent.children[name].type === 'directory') {
      throw new Error(`Is a directory: ${path}`);
    }
    
    delete parent.children[name];
  }
  
  // Remove directory
  public rmdir(path: string, recursive: boolean = false): void {
    // Cannot remove root
    if (path === '/') {
      throw new Error('Cannot remove root directory');
    }
    
    const { parent, name } = this.getParentAndName(path);
    
    if (!parent || !parent.children || !parent.children[name]) {
      throw new Error(`No such file or directory: ${path}`);
    }
    
    const dir = parent.children[name];
    
    if (dir.type !== 'directory') {
      throw new Error(`Not a directory: ${path}`);
    }
    
    if (!recursive && dir.children && Object.keys(dir.children).length > 0) {
      throw new Error(`Directory not empty: ${path}`);
    }
    
    delete parent.children[name];
  }
}