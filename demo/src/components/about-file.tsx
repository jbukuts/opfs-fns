import opfs from 'opfs-fns';
import { useEffect, useState } from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { hrByteSize } from '#/lib/utils';

interface AboutFileProps {
  path: string;
}

export default function AboutFile(props: AboutFileProps) {
  const { path } = props;

  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof opfs.file.stat>
  > | null>(null);

  useEffect(() => {
    opfs.file.stat(path).then((s) => {
      setStats(s);
    });
  }, [path]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>About File</DialogTitle>
        <DialogDescription>See file metadata here</DialogDescription>
      </DialogHeader>
      <div>
        {stats !== null && (
          <>
            <p>Name: {stats.name}</p>
            <p>Location: {path}</p>
            <p>Size: {hrByteSize(stats.size)}</p>
            <p>Modified: {new Date(stats.updated).toLocaleDateString()}</p>
          </>
        )}
      </div>
    </DialogContent>
  );
}
