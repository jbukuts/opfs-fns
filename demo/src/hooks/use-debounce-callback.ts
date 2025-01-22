import { useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useDebouncedCallback(
    useCallback((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }, []),
    delay
  );
}
