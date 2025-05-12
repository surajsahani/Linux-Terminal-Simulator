import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, X } from 'lucide-react';
import TerminalPrompt from './TerminalPrompt';
import TerminalOutput from './TerminalOutput';
import { processCommand } from '../../utils/commandProcessor';
import { FileSystem } from '../../utils/fileSystem';
import { CommandHistoryType, OutputType } from '../../types';

const Terminal: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/home/user');
  const [outputs, setOutputs] = useState<OutputType[]>([
    { 
      id: 'welcome', 
      content: [
        'Welcome to LinuxSim Terminal v1.0.0',
        'Type "help" to see available commands.',
        ''
      ],
      type: 'info'
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<CommandHistoryType[]>([]);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const fileSystem = useRef(new FileSystem());

  const handleCommand = (command: string) => {
    if (command.trim() === '') return;
    
    // Add command to history
    const newCommandOutput: CommandHistoryType = {
      id: Date.now().toString(),
      command,
      path: currentPath
    };
    
    setCommandHistory(prev => [...prev, newCommandOutput]);
    
    // Process command and get output
    const { output, newPath } = processCommand(command, currentPath, fileSystem.current);
    
    // Update path if command changed it (e.g., cd)
    if (newPath && newPath !== currentPath) {
      setCurrentPath(newPath);
    }
    
    // Add output to terminal
    setOutputs(prev => [
      ...prev, 
      { 
        id: `output-${Date.now()}`, 
        content: output.content,
        type: output.type
      }
    ]);
    
    // Scroll to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 0);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  return (
    <div 
      className={`terminal-window bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ${
        isMaximized ? 'fixed inset-0 w-full h-full rounded-none' : 'w-full max-w-4xl h-[80vh]'
      }`}
    >
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <TerminalIcon size={18} className="text-gray-400 mr-2" />
          <span className="text-gray-200 terminal-font text-sm">Terminal ~ {currentPath}</span>
        </div>
        <div className="window-controls flex space-x-2">
          <button 
            onClick={() => setIsMaximized(!isMaximized)} 
            className="focus:outline-none"
            aria-label={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 size={14} className="text-gray-400 hover:text-gray-200" />
            ) : (
              <Maximize2 size={14} className="text-gray-400 hover:text-gray-200" />
            )}
          </button>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div 
        ref={terminalRef} 
        className="terminal-content bg-gray-900 text-gray-200 p-4 h-full overflow-y-auto terminal-font"
      >
        <TerminalOutput outputs={outputs} commandHistory={commandHistory} />
        <TerminalPrompt 
          currentPath={currentPath} 
          onCommand={handleCommand} 
          commandHistory={commandHistory}
          fileSystem={fileSystem.current}
        />
      </div>
    </div>
  );
};

export default Terminal;