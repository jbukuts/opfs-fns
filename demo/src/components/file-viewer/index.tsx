import useCurrentFile from '#/hooks/use-current-file';
import TextEdit from './text-edit';
import ImageDisplay from './image-display';
import VideoDisplay from './video-display';

const TEXT_FILE_TYPES = [
  '.md',
  '.txt',
  '.yml',
  '.yaml',
  '.toml',
  '.css',
  '.html',
  '.js'
];
const IMG_FILE_TYPES = ['.png', '.jpg', '.jpg', '.gif'];
const VIDEO_FILE_TYPES = ['.mp4', '.webm'];

function extMatch(path: string, exts: string[]) {
  return exts.some((e) => path.endsWith(e));
}

export default function FileViewer() {
  const { currentPath, data } = useCurrentFile();

  return (
    <div className='h-full'>
      {currentPath === '' && (
        <div className='flex h-full items-center justify-center'>
          <p className='font-semibold'>Select a file from the explorer</p>
        </div>
      )}
      {data !== undefined &&
        currentPath !== '' &&
        (() => {
          if (extMatch(currentPath, TEXT_FILE_TYPES))
            return <TextEdit data={data} path={currentPath} />;
          else if (extMatch(currentPath, IMG_FILE_TYPES))
            return <ImageDisplay data={data} />;
          else if (extMatch(currentPath, VIDEO_FILE_TYPES))
            return <VideoDisplay data={data} />;
          return <TextEdit data={data} path={currentPath} />;
        })()}
    </div>
  );
}
