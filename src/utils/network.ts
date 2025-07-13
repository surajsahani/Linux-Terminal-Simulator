export interface VirtualMachine {
  id: string;
  ip: string;
  name: string;
  isOnline: boolean;
  vulnerabilities: string[];
}

export const virtualMachines: VirtualMachine[] = [
  {
    id: 'vm-1',
    ip: '192.168.1.10',
    name: 'web-server',
    isOnline: true,
    vulnerabilities: ['sql-injection'],
  },
  {
    id: 'vm-2',
    ip: '192.168.1.20',
    name: 'db-server',
    isOnline: true,
    vulnerabilities: [],
  },
  {
    id: 'vm-3',
    ip: '192.168.1.30',
    name: 'dev-machine',
    isOnline: false,
    vulnerabilities: [],
  },
];

export const ping = (ip: string): string => {
  const vm = virtualMachines.find((vm) => vm.ip === ip);
  if (vm && vm.isOnline) {
    return `PING ${ip} (${ip}) 56(84) bytes of data.\n64 bytes from ${ip}: icmp_seq=1 ttl=64 time=0.042 ms`;
  }
  return `PING ${ip} (${ip}) 56(84) bytes of data.\nFrom 127.0.0.1 icmp_seq=1 Destination Host Unreachable`;
};
