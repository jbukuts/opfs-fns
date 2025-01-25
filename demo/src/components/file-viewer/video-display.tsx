import { useEffect, useRef } from 'react';

interface VideoDisplayProps {
  data: ArrayBuffer;
}

export default function VideoDisplay(props: VideoDisplayProps) {
  const { data } = props;
  const elementRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const blob = new Blob([data], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    elementRef.current.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [data]);

  return (
    <div className='flex h-screen items-center justify-center'>
      <video
        controls
        ref={elementRef}
        className='h-4/5 rounded-lg object-contain'
      />
    </div>
  );
}
