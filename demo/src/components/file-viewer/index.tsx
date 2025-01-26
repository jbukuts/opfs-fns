import TextEdit from './text-edit';
import ImageDisplay from './image-display';
import VideoDisplay from './video-display';
import useCurrentPath from '#/hooks/use-current-path';
import { createElement, useEffect, useState } from 'react';
import opfs from 'opfs-fns';
import ImportItem from '../dialogs/import-item-dialog';
import { Button } from '../ui/button';
import { SidebarTrigger } from '../ui/sidebar';

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
      <SidebarTrigger className='fixed right-0'></SidebarTrigger>
      {currentPath === '' && (
        <div className='flex h-full flex-col items-center justify-center gap-1.5'>
          <p className='font-semibold'>Select a file from the explorer</p>
          <p className='text-xs font-light'>or</p>
          <ImportItem>
            <Button
              size={'lg'}
              variant={'ghost'}
              className='border border-dashed border-gray-700'>
              Import File
            </Button>
          </ImportItem>
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
