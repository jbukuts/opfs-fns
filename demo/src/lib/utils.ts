import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function refreshFileTree() {
  document.dispatchEvent(new Event('refresh-explorer'));
}

export function hrByteSize(size: number, round: boolean = false) {
  const sizes = [' B', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];

  for (let i = 1; i < sizes.length; i++) {
    if (size < Math.pow(1024, i)) {
      const v = Math.round((size / Math.pow(1024, i - 1)) * 100) / 100;
      return (round ? Math.ceil(v) : v) + sizes[i - 1];
    }
  }
  return size;
}

export function isOPFSSupported() {
  return 'showOpenFilePicker' in window;
}
