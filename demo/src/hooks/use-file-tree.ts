import { useEffect, useState } from 'react';
import opfs from 'opfs-fns';

export type TreeItem = NonNullable<Awaited<ReturnType<typeof opfs.dir.ls>>>;

export default function useFileTree() {
  const [tree, setTree] = useState<TreeItem>([]);

  useEffect(() => {
    const refreshTree = () => {
      console.log('refreshing tree');
      opfs.dir.ls({ recursive: true }).then((t) => {
        console.log(t);
        if (t !== null) setTree(t);
      });
    };

    document.addEventListener('refresh-explorer', refreshTree);
    document.dispatchEvent(new Event('refresh-explorer'));
    return () => {
      document.removeEventListener('refresh-explorer', refreshTree);
    };
  }, []);

  return tree;
}
