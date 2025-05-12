import React from 'react';
import { CommandHistoryType, OutputType } from '../../types';

interface TerminalOutputProps {
  outputs: OutputType[];
  commandHistory: CommandHistoryType[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ outputs, commandHistory }) => {
  const renderPrompt = (cmd: CommandHistoryType) => (
    <div className="flex">
      <span className="text-green-500">user@linuxsim</span>
      <span className="text-gray-400">:</span>
      <span className="text-blue-400">{cmd.path}</span>
      <span className="text-gray-400 mr-2">$</span>
      <span>{cmd.command}</span>
    </div>
  );

  const renderContent = (content: string[], type: string) => {
    return content.map((line, i) => {
      // Special formatting for ls output
      if (line.includes('__DIR__')) {
        return (
          <span key={i} className="directory">
            {line.replace('__DIR__', '')}
          </span>
        );
      }
      if (line.includes('__EXEC__')) {
        return (
          <span key={i} className="executable">
            {line.replace('__EXEC__', '')}
          </span>
        );
      }
      
      // Handle normal content based on type
      let className = '';
      if (type === 'error') className = 'command-error';
      if (type === 'success') className = 'command-success';
      if (type === 'warning') className = 'command-warning';
      
      return (
        <span key={i} className={className}>
          {line}
        </span>
      );
    });
  };

  // Merge command history with outputs to show them in sequence
  const renderTerminalHistory = () => {
    let outputIndex = 0;
    let historyIndex = 0;
    const result = [];
    
    // Skip the welcome message
    if (outputs.length > 0) {
      result.push(
        <div key={`output-welcome`} className="mb-2">
          {renderContent(outputs[0].content, outputs[0].type).map((item, i) => (
            <div key={i}>{item}</div>
          ))}
        </div>
      );
      outputIndex = 1;
    }
    
    while (historyIndex < commandHistory.length) {
      // Add command
      result.push(
        <div key={`cmd-${commandHistory[historyIndex].id}`} className="mb-1">
          {renderPrompt(commandHistory[historyIndex])}
        </div>
      );
      
      // Add corresponding output
      if (outputIndex < outputs.length) {
        result.push(
          <div key={`output-${outputs[outputIndex].id}`} className="mb-2 command-appear">
            {renderContent(outputs[outputIndex].content, outputs[outputIndex].type).map((item, i) => (
              <div key={i}>{item}</div>
            ))}
          </div>
        );
        outputIndex++;
      }
      
      historyIndex++;
    }
    
    return result;
  };

  return <div>{renderTerminalHistory()}</div>;
};

export default TerminalOutput;