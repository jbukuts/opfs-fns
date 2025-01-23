import useDebounceCallback from '#/hooks/use-debounce-callback';
import { useEffect, useState } from 'react';
import opfs from 'opfs-fns';
import { Textarea } from '../ui/textarea';
import { useToast } from '#/hooks/use-toast';

const DECODER = new TextDecoder('utf-8');

export default function TextEdit(props: { data: ArrayBuffer; path: string }) {
  const { data, path } = props;
  const [text, setText] = useState<string>();
  const { toast } = useToast();

  const debounced = useDebounceCallback((t: string) => {
    opfs.file.write({ path, data: t }).then((s) => {
      if (!s) return;
      toast({
        title: 'Autosaved',
        description: `Changes saved to ${path}`
      });
    });
  }, 300);

  useEffect(() => {
    setText(DECODER.decode(data));
  }, [data]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    debounced(newText);
  };

  return (
    <Textarea
      className='h-screen resize-none border-none focus-visible:ring-0'
      placeholder='Type text here'
      value={text}
      onChange={handleTextChange}
    />
  );
}
