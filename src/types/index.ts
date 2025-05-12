export interface CommandHistoryType {
  id: string;
  command: string;
  path: string;
}

export interface OutputType {
  id: string;
  content: string[];
  type: string;
}