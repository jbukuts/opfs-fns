import { useEffect, useRef } from 'react';

export default function ImageDisplay(props: { data: ArrayBuffer }) {
  const { data } = props;
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const blob = new Blob([data], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    imgRef.current.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [data]);

  return (
    <div className='flex h-screen items-center justify-center'>
      <img
        className='h-4/5 rounded-lg object-contain'
        ref={imgRef}
        alt='Failed to display'
      />
    </div>
  );
}
