import opfs from 'opfs-fns';
import { useEffect, useState } from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { hrByteSize } from '#/lib/utils';

interface AboutFileProps {
  path: string;
}

export default function AboutFileDialog(props: AboutFileProps) {
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
      <div className='grid grid-cols-2'>
        {stats !== null && (
          <>
            <p>Name:</p>
            <p>{stats.name}</p>
            <p>Location:</p>
            <p>{path}</p>
            <p>Size:</p>
            <p>{hrByteSize(stats.size)}</p>
            <p>MIME:</p>
            <p>{stats.type ?? 'unknown'}</p>
            <p>Modified:</p>
            <p>{new Date(stats.updated).toLocaleDateString()}</p>
          </>
        )}
      </div>
    </DialogContent>
  );
}
