import React, { useState, useEffect, useRef } from 'react';
import { CommandHistoryType } from '../../types';
import { FileSystem } from '../../utils/fileSystem';

interface TerminalPromptProps {
  currentPath: string;
  onCommand: (command: string) => void;
  commandHistory: CommandHistoryType[];
  fileSystem: FileSystem;
  user: string;
  host: string;
}

const TerminalPrompt: React.FC<TerminalPromptProps> = ({
  currentPath,
  onCommand,
  commandHistory,
  fileSystem,
  user,
  host,
}) => {
  const [command, setCommand] = useState('');
  const [historyPosition, setHistoryPosition] = useState(-1);
  const [tabCompletions, setTabCompletions] = useState<string[]>([]);
  const [showCompletions, setShowCompletions] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset history position when new command is added
    setHistoryPosition(-1);
  }, [commandHistory]);

  useEffect(() => {
    // Make sure the input is focused when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommand(command);
      setCommand('');
      setShowCompletions(false);
      setTabCompletions([]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newPosition =
          historyPosition < commandHistory.length - 1
            ? historyPosition + 1
            : historyPosition;

        setHistoryPosition(newPosition);
        if (newPosition >= 0) {
          setCommand(
            commandHistory[commandHistory.length - 1 - newPosition].command
          );
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPosition > 0) {
        const newPosition = historyPosition - 1;
        setHistoryPosition(newPosition);
        setCommand(
          commandHistory[commandHistory.length - 1 - newPosition].command
        );
      } else if (historyPosition === 0) {
        setHistoryPosition(-1);
        setCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();

      if (showCompletions && tabCompletions.length > 0) {
        // Cycle through existing completions
        const nextIndex = (tabIndex + 1) % tabCompletions.length;
        setTabIndex(nextIndex);
        setCommand(tabCompletions[nextIndex]);
      } else {
        // Generate new completions
        const parts = command.split(' ');

        if (parts.length <= 1) {
          // Complete command
          const availableCommands = [
            'cd',
            'ls',
            'mkdir',
            'touch',
            'cat',
            'echo',
            'pwd',
            'clear',
            'rm',
            'help',
            'date',
            'whoami',
            'uname',
            'ping',
            'ssh',
          ];

          const matches = availableCommands.filter((cmd) =>
            cmd.startsWith(command.toLowerCase())
          );

          if (matches.length === 1) {
            setCommand(matches[0] + ' ');
            setShowCompletions(false);
          } else if (matches.length > 1) {
            setTabCompletions(matches);
            setTabIndex(0);
            setShowCompletions(true);
          }
        } else {
          // Complete file/directory path
          const lastPart = parts[parts.length - 1];
          const basePath = lastPart.startsWith('/') ? '' : currentPath;

          const searchPath = lastPart.startsWith('/')
            ? lastPart
            : `${basePath}/${lastPart}`.replace(/\/+/g, '/');

          const dirPath = searchPath.substring(0, searchPath.lastIndexOf('/') + 1);
          const prefix = searchPath.substring(searchPath.lastIndexOf('/') + 1);

          try {
            const items = fileSystem.listDir(dirPath);
            const matches = items.filter((item) => item.startsWith(prefix));

            if (matches.length === 1) {
              const isDir = fileSystem.isDirectory(`${dirPath}${matches[0]}`);
              const completion =
                parts.slice(0, -1).join(' ') +
                ' ' +
                (lastPart.startsWith('/')
                  ? `${dirPath}${matches[0]}${isDir ? '/' : ''}`
                  : dirPath === currentPath + '/'
                  ? matches[0] + (isDir ? '/' : '')
                  : `${dirPath}${matches[0]}${isDir ? '/' : ''}`);

              setCommand(completion);
              setShowCompletions(false);
            } else if (matches.length > 1) {
              const completions = matches.map((match) => {
                const isDir = fileSystem.isDirectory(`${dirPath}${match}`);
                return (
                  parts.slice(0, -1).join(' ') +
                  ' ' +
                  (lastPart.startsWith('/')
                    ? `${dirPath}${match}${isDir ? '/' : ''}`
                    : dirPath === currentPath + '/'
                    ? match + (isDir ? '/' : '')
                    : `${dirPath}${match}${isDir ? '/' : ''}`)
                );
              });

              setTabCompletions(completions);
              setTabIndex(0);
              setShowCompletions(true);
            }
          } catch (error) {
            // Directory not found, no completions
          }
        }
      }
    } else {
      setShowCompletions(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex">
        <span className="text-green-500">{user}@{host}</span>
        <span className="text-gray-400">:</span>
        <span className="text-blue-400">{currentPath}</span>
        <span className="text-gray-400 mr-2">{user === 'root' ? '#' : '$'}</span>
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent flex-1 focus:outline-none terminal-font"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <span className="cursor-blink text-gray-300">█</span>
      </div>

      {showCompletions && tabCompletions.length > 0 && (
        <div className="mt-2 p-2 bg-gray-800 rounded command-appear">
          <div className="grid grid-cols-3 gap-2">
            {tabCompletions.map((completion, index) => (
              <div
                key={index}
                className={`px-2 py-1 rounded ${
                  index === tabIndex ? 'bg-blue-800' : ''
                }`}
              >
                {completion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalPrompt;