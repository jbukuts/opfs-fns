export default function ImageDisplay(props: { data: ArrayBuffer }) {
  const blob = new Blob([props.data], { type: 'image/png' }); // Replace type based on your image type
  const objectURL = URL.createObjectURL(blob);

  return (
    <div className='flex h-screen items-center justify-center'>
      <img
        className='h-4/5 rounded-lg object-contain'
        src={objectURL}
        onLoad={() => URL.revokeObjectURL(objectURL)}
      />
    </div>
  );
}
