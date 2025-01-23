import { useLocalStorage } from 'usehooks-ts';

export default function useCurrentPath() {
  const [path, setPath] = useLocalStorage<string>('current-file', '');
  return [path, setPath] as const;
}
