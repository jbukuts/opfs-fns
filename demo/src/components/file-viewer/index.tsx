import TextEdit from './text-edit';
import ImageDisplay from './image-display';
import VideoDisplay from './video-display';
import useCurrentPath from '#/hooks/use-current-path';
import { createElement, useEffect, useState } from 'react';
import opfs from 'opfs-fns';

type DisplayComp = typeof TextEdit | typeof VideoDisplay | typeof ImageDisplay;

function Unknown() {
  return <p>Cannot display. Unknown MIME type.</p>;
}

const MIME_COMP_MAP = new Proxy<Record<string, DisplayComp>>(
  {
    text: TextEdit,
    video: VideoDisplay,
    image: ImageDisplay
  },
  {
    get(target, prop, rec) {
      if (typeof prop !== 'string') return File;
      const [a] = prop.split('/');
      if (!(a in target)) return Unknown;
      return Reflect.get(target, a, rec);
    }
  }
);

export default function FileViewer() {
  const [currentPath] = useCurrentPath();
  const [data, setData] = useState<ArrayBuffer>();
  const [type, setType] = useState<string>();

  useEffect(() => {
    if (!currentPath) {
      setData(undefined);
      return;
    }

    const loader = async () => {
      setData(undefined);

      const stats = await opfs.file.stat(currentPath);
      if (stats === null) return;
      setType(stats.type.split('/')[0]);

      const d = await opfs.file.read({ path: currentPath, type: 'bytes' });
      if (d === null) return;

      setData(d as ArrayBuffer);
    };

    loader();
  }, [currentPath]);

  return (
    <div className='h-full'>
      {currentPath === '' && (
        <div className='flex h-full items-center justify-center'>
          <p className='font-semibold'>Select a file from the explorer</p>
        </div>
      )}
      {data !== undefined &&
        currentPath !== '' &&
        createElement(MIME_COMP_MAP[type ?? ''], {
          data,
          path: currentPath
        })}
    </div>
  );
}
