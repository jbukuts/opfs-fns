import { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import opfs from 'opfs-fns';

export default function useCurrentFile() {
  const [path, setPath] = useLocalStorage<string>('current-file', '');
  const [internal, setInternal] = useState<string>(path);
  const [data, setData] = useState<ArrayBuffer>();

  useEffect(() => {
    if (!path) {
      setInternal('');
      setData(undefined);
      return;
    }

    opfs.file.read({ path, type: 'bytes' }).then((d) => {
      if (d === null) return;
      setData(d as ArrayBuffer);
      setInternal(path);
    });
  }, [path]);

  return {
    currentPath: internal,
    setCurrentPath: setPath,
    data
  };
}
