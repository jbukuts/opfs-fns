export default function VideoDisplay(props: { data: ArrayBuffer }) {
  const blob = new Blob([props.data], { type: 'video/mp4' }); // Replace type based on your image type
  const objectURL = URL.createObjectURL(blob);

  return (
    <div className='flex h-screen items-center justify-center'>
      <video
        controls
        className='h-4/5 rounded-lg object-contain'
        src={objectURL}
      />
    </div>
  );
}
