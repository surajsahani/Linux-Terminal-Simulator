import { VirtualMachine } from './network';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  prompt: string;
  solution: string;
}

export const challenges: Challenge[] = [
  {
    id: 'sql-injection',
    name: 'SQL Injection',
    description: 'The web server is vulnerable to SQL injection. You need to find the vulnerability and patch it.',
    prompt: 'You have gained access to the web server. Your task is to find the SQL injection vulnerability in the application and patch it. The application code is located in /var/www/app.js. Good luck!',
    solution: 'The solution is to use parameterized queries.',
  },
];

export const getChallenge = (vm: VirtualMachine): Challenge | null => {
  if (vm.vulnerabilities.length > 0) {
    const challengeId = vm.vulnerabilities[0];
    return challenges.find((c) => c.id === challengeId) || null;
  }
  return null;
};
