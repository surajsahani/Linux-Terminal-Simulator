import { FileSystem } from './fileSystem';

interface CommandOutput {
  content: string[];
  type: string;
}

interface CommandResult {
  output: CommandOutput;
  newPath?: string;
}

export const processCommand = (
  command: string, 
  currentPath: string,
  fileSystem: FileSystem
): CommandResult => {
  // Split command and arguments
  const args = command.trim().split(/\s+/);
  const cmd = args[0].toLowerCase();
  
  // Initialize default output
  let output: CommandOutput = {
    content: [],
    type: 'normal'
  };
  
  // Process commands
  switch (cmd) {
    case 'cd':
      return handleCd(args, currentPath, fileSystem);
    
    case 'ls':
      return handleLs(args, currentPath, fileSystem);
    
    case 'pwd':
      output.content = [currentPath];
      output.type = 'success';
      return { output };
    
    case 'mkdir':
      return handleMkdir(args, currentPath, fileSystem);
    
    case 'touch':
      return handleTouch(args, currentPath, fileSystem);
    
    case 'cat':
      return handleCat(args, currentPath, fileSystem);
    
    case 'echo':
      return handleEcho(args, currentPath, fileSystem);
    
    case 'clear':
      // Special case - we'll handle this in the Terminal component
      output.content = ['__CLEAR__'];
      return { output };
    
    case 'rm':
      return handleRm(args, currentPath, fileSystem);
    
    case 'whoami':
      output.content = ['user'];
      return { output };
    
    case 'date':
      output.content = [new Date().toString()];
      return { output };
    
    case 'uname':
      if (args.includes('-a')) {
        output.content = ['LinuxSim 1.0.0 Web 2025 JavaScript/React x86_64'];
      } else {
        output.content = ['LinuxSim'];
      }
      return { output };
    
    case 'help':
      output.content = [
        'Available commands:',
        '',
        'cd [directory]   - Change current directory',
        'ls [options] [directory] - List directory contents',
        'pwd              - Print working directory',
        'mkdir [directory]- Create a new directory',
        'touch [file]     - Create a new file',
        'cat [file]       - Display file contents',
        'echo [text]      - Display text',
        'clear            - Clear the terminal',
        'rm [-r] [path]   - Remove file or directory',
        'whoami           - Display current user',
        'date             - Display current date',
        'uname [-a]       - Display system information',
        'help             - Display this help message',
        '',
        'Use arrow up/down to navigate command history',
        'Use tab for command completion',
      ];
      output.type = 'info';
      return { output };
    
    default:
      output.content = [`Command not found: ${cmd}`];
      output.type = 'error';
      return { output };
  }
};

// Command handler functions
function handleCd(
  args: string[], 
  currentPath: string,
  fileSystem: FileSystem
): CommandResult {
  const output: CommandOutput = {
    content: [],
    type: 'normal'
  };
  
  if (args.length === 1) {
    // cd with no args - go to home directory
    return { 
      output,
      newPath: '/home/user'
    };
  }
  
  try {
    const newPath = fileSystem.resolvePath(args[1], currentPath);
    
    if (!fileSystem.isDirectory(newPath)) {
      output.content = [`cd: ${args[1]}: Not a directory`];
      output.type = 'error';
      return { output };
    }
    
    return { 
      output,
      newPath
    };
  } catch (error) {
    output.content = [`cd: ${args[1]}: No such file or directory`];
    output.type = 'error';
    return { output };
  }
}

function handleLs(
  args: string[], 
  currentPath: string,
  fileSystem: FileSystem
): CommandResult {
  const output: CommandOutput = {
    content: [],
    type: 'normal'
  };
  
  let path = currentPath;
  let showHidden = false;
  let showDetails = false;
  
  // Process options and path
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('-')) {
      if (args[i].includes('a')) showHidden = true;
      if (args[i].includes('l')) showDetails = true;
    } else {
      try {
        path = fileSystem.resolvePath(args[i], currentPath);
      } catch (error) {
        output.content = [`ls: cannot access '${args[i]}': No such file or directory`];
        output.type = 'error';
        return { output };
      }
    }
  }
  
  try {
    const contents = fileSystem.listDir(path);
    
    // Filter hidden files if not showing them
    const filteredContents = showHidden 
      ? contents 
      : contents.filter(item => !item.startsWith('.'));
    
    if (showDetails) {
      // Format with file details
      for (const item of filteredContents) {
        const itemPath = `${path}/${item}`.replace(/\/+/g, '/');
        const isDir = fileSystem.isDirectory(itemPath);
        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = isDir ? 4096 : 0;
        const date = new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const displayName = isDir ? `__DIR__${item}` : item;
        output.content.push(`${perms} 1 user user ${size} ${date} ${displayName}`);
      }
    } else {
      // Simple format
      output.content = filteredContents.map(item => {
        const itemPath = `${path}/${item}`.replace(/\/+/g, '/');
        return fileSystem.isDirectory(itemPath) ? `__DIR__${item}` : item;
      });
    }
    
    return { output };
  } catch (error) {
    output.content = [`ls: cannot access '${path}': No such file or directory`];
    output.type = 'error';
    return { output };
  }
}

function handleMkdir(
  args: string[], 
  currentPath: string,
  fileSystem: FileSystem
): CommandResult {
  const output: CommandOutput = {
    content: [],
    type: 'normal'
  };
  
  if (args.length < 2) {
    output.content = ['mkdir: missing operand'];
    output.type = 'error';
    return { output };
  }
  
  for (let i = 1; i < args.length; i++) {
    try {
      const dirPath = fileSystem.resolvePath(args[i], currentPath, true);
      fileSystem.mkdir(dirPath);
    } catch (error) {
      output.content.push(`mkdir: cannot create directory '${args[i]}': ${(error as Error).message}`);
      output.type = 'error';
    }
  }
  
  return { output };
}

function handleTouch(
  args: string[], 
  currentPath: string,
  fileSystem: FileSystem
): CommandResult {
  const output: CommandOutput = {
    content: [],
    type: 'normal'
  };
  
  if (args.length < 2) {
    output.content = ['touch: missing file operand'];
    output.type = 'error';
    return { output };
  }
  
  for (let i = 1; i < args.length; i++) {
    try {
      const filePath = fileSystem.resolvePath(args[i], currentPath, true);
      fileSystem.touch(filePath);
    } catch (error) {
      output.content.push(`touch: cannot touch '${args[i]}': ${(error as Error).message}`);
      output.type = 'error';
    }
  }
  
  return { output };
}

function handleCat(
  args: string[], 
  currentPath: string,
  fileSystem: FileSystem
): CommandResult {
  const output: CommandOutput = {
    content: [],
    type: 'normal'
  };
  
  if (args.length < 2) {
    output.content = ['cat: missing file operand'];
    output.type = 'error';
    return { output };
  }
  
  for (let i = a1; i < args.length; i++) {
    try {
      const filePath = fileSystem.resolvePath(args[i], currentPath);
      
      if (fileSystem.isDirectory(filePath)) {
        output.content.push(`cat: ${args[i]}: Is a directory`);
        output.type = 'error';
        continue;
      }
      
      const content = fileSystem.readFile(filePath);
      output.content = output.content.concat(content.split('\n'));
    } catch (error) {
      output.content.push(`cat: ${args[i]}: No such file or directory`);
      output.type = 'error';
    }
  }
  
  return { output };
}

function handleEcho(
  args: string[], 
  currentPath: string,
  fileSystem: FileSystem
): CommandResult {
  const output: CommandOutput = {
    content: [],
    type: 'normal'
  };
  
  // Check for redirection
  const commandString = args.slice(1).join(' ');
  const redirectMatch = commandString.match(/(.*?)(?:\s+>\s+(.*?))?$/);
  
  if (!redirectMatch) {
    output.content = [''];
    return { output };
  }
  
  const textToEcho = redirectMatch[1] || '';
  const redirectTo = redirectMatch[2];
  
  if (redirectTo) {
    // Handle redirection to file
    try {
      const filePath = fileSystem.resolvePath(redirectTo, currentPath, true);
      fileSystem.writeFile(filePath, textToEcho);
    } catch (error) {
      output.content = [`echo: ${(error as Error).message}`];
      output.type = 'error';
    }
  } else {
    // Just echo the text
    output.content = [textToEcho];
  }
  
  return { output };
}

function handleRm(
  args: string[], 
  currentPath: string,
  fileSystem: FileSystem
): CommandResult {
  const output: CommandOutput = {
    content: [],
    type: 'normal'
  };
  
  if (args.length < 2) {
    output.content = ['rm: missing operand'];
    output.type = 'error';
    return { output };
  }
  
  let recursive = false;
  let paths: string[] = [];
  
  // Process options
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('-')) {
      if (args[i].includes('r') || args[i].includes('R')) {
        recursive = true;
      }
    } else {
      paths.push(args[i]);
    }
  }
  
  if (paths.length === 0) {
    output.content = ['rm: missing operand'];
    output.type = 'error';
    return { output };
  }
  
  for (const path of paths) {
    try {
      const fullPath = fileSystem.resolvePath(path, currentPath);
      
      if (fileSystem.isDirectory(fullPath)) {
        if (recursive) {
          fileSystem.rmdir(fullPath, recursive);
        } else {
          output.content.push(`rm: cannot remove '${path}': Is a directory`);
          output.type = 'error';
        }
      } else {
        fileSystem.rm(fullPath);
      }
    } catch (error) {
      output.content.push(`rm: cannot remove '${path}': ${(error as Error).message}`);
      output.type = 'error';
    }
  }
  
  return { output };
}