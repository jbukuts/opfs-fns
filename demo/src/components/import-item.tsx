import { ChangeEvent, ReactNode, useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { Input } from './ui/input';
import opfs from 'opfs-fns';
import { refreshFileTree } from '#/lib/utils';
import { useToast } from '#/hooks/use-toast';
import { Loader } from 'lucide-react';
import useCurrentPath from '#/hooks/use-current-path';

const readFileAsArrayBuffer = async (
  file: File
): Promise<ArrayBuffer | null> => {
  const reader = new FileReader();

  return new Promise((res) => {
    reader.onload = (event) => {
      const result = event.target?.result as ArrayBuffer;
      res(result);
    };

    reader.onerror = (err) => {
      console.error(err);
      res(null);
    };

    reader.readAsArrayBuffer(file);
  });
};

interface ImportItemProps {
  startingPath?: string;
  children: ReactNode;
}

export default function ImportItem(props: ImportItemProps) {
  const { children, startingPath = '/' } = props;

  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCurrentPath] = useCurrentPath();
  const [error, setError] = useState<string>();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 2147483648)
      setError('File size is too large. Maximum allowed is 2GB.');
    else setError('');
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (file === null) return;
    setLoading(true);
    const fullPath = startingPath + file.name;
    const data = await readFileAsArrayBuffer(file);
    if (data === null) {
      setError('Could not read file for import');
      setLoading(false);
      return;
    }

    opfs.file
      .create({ path: fullPath, data })
      .then(() => {
        refreshFileTree();

        setOpen(false);
        setCurrentPath(fullPath);
        toast({
          title: 'File imported',
          description: `File imported to ${fullPath}`
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import File</DialogTitle>
          <DialogDescription>
            Select a file to import into the OPFS.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            accept='video/*,image/*,text/*'
            type='file'
            onChange={handleFileChange}
          />
          {error && <p className='mt-1 text-xs text-red-700'>{error}</p>}
        </div>
        <DialogFooter>
          <Button
            disabled={file === null || loading || !!error}
            onClick={handleImport}>
            {loading && <Loader className='animate-spin' />}
            Import
          </Button>
          <DialogClose asChild>
            <Button variant={'secondary'}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
