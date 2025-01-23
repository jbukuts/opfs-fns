import { ReactNode, useEffect, useState } from 'react';
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
import useCurrentPath from '#/hooks/use-current-path';

const ABSOLUTE_PATH_REGEX = /^(\/([^/\0]+\/?)*|\/)$/;

interface CreateItemProps {
  type: 'directory' | 'file';
  startingPath?: string;
  children: ReactNode;
}

export default function CreateItem(props: CreateItemProps) {
  const { type, children, startingPath = '/' } = props;

  const [input, setInput] = useState<string>('');
  const [valid, setValid] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCurrentPath] = useCurrentPath();
  const { toast } = useToast();

  useEffect(() => {
    if (!input) return;
    setValid(ABSOLUTE_PATH_REGEX.test(startingPath + input));
  }, [input, startingPath]);

  const handleCreate = () => {
    opfs[type === 'directory' ? 'dir' : 'file']
      .create({ path: startingPath + input, recursive: true })
      .then((s) => {
        if (!s) return;
        refreshFileTree();
        setOpen(false);
        if (type === 'file') setCurrentPath(startingPath + input);
        toast({
          title: `New ${type} created`,
          description: `${type} created at "${startingPath + input}"`
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className='capitalize'>Create New {type}</DialogTitle>
          <DialogDescription>
            Type the absolute path of the {type} to create.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className='flex h-9 items-center overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-gray-300 focus-within:ring-offset-1'>
            <span className='flex h-full items-center border-r bg-gray-800 px-2 text-xs'>
              <code>{startingPath}</code>
            </span>
            <Input
              className='border-none focus-visible:ring-0 focus-visible:ring-offset-0'
              type='text'
              placeholder={
                '/nest/file/path' + type === 'file' ? '/test.txt' : ''
              }
              value={input}
              onChange={(v) => setInput(v.target.value)}
            />
          </div>
          {!valid && <p className='mt-1 text-xs text-red-700'>Invalid path</p>}
        </div>

        <DialogFooter>
          <Button
            type='submit'
            disabled={!valid || !input}
            onClick={handleCreate}>
            Create
          </Button>
          <DialogClose asChild>
            <Button variant={'secondary'}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
