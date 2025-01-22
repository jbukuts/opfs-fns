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

const readFileAsArrayBuffer = async (file: File): Promise<ArrayBuffer> => {
  const reader = new FileReader();

  return new Promise((res) => {
    reader.onload = (event) => {
      const result = event.target?.result as ArrayBuffer;
      res(result);
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
  const [data, setData] = useState<ArrayBuffer | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      readFileAsArrayBuffer(selectedFile).then((d) => {
        setData(d);
      });
    }
  };

  const handleImport = () => {
    if (file === null || data === null) return;
    const fullPath = startingPath + file.name;
    opfs.file.create({ path: fullPath, data }).then(() => {
      refreshFileTree();
      setOpen(false);
      toast({
        title: 'File imported',
        description: `File imported to ${fullPath}`
      });
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
            onChange={handleFileChange}></Input>
        </div>
        <DialogFooter>
          <Button
            disabled={data === null || file === null}
            onClick={handleImport}>
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
