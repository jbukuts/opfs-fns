import { useState } from 'react';
import { Button } from '#/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '#/components/ui/dialog';
import { Input } from '#/components/ui/input';
import opfs from 'opfs-fns';
import { useToast } from '#/hooks/use-toast';
import { refreshFileTree } from '#/lib/utils';
import useCurrentPath from '#/hooks/use-current-path';

interface RenameItemDialogProps {
  name: string;
  type: 'directory' | 'file';
  fullPath: string;
}

export default function RenameItemDialog(props: RenameItemDialogProps) {
  const { name, type, fullPath } = props;

  const [currentPath, setCurrentPath] = useCurrentPath();
  const [newName, setNewName] = useState(name);
  const { toast } = useToast();

  const handleRename = () => {
    if (newName === name) return;
    if (currentPath.startsWith(fullPath)) setCurrentPath('');
    opfs[type === 'directory' ? 'dir' : 'file']
      .rename({ oldPath: fullPath, newName })
      .then((s) => {
        if (!s) return;
        refreshFileTree();
        toast({
          title: 'Rename successful',
          description: `Successfully rename ${name} to ${newName}`
        });
      });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='capitalize'>Rename {type}</DialogTitle>
        <DialogDescription>Enter new name of {type} here.</DialogDescription>
      </DialogHeader>
      <div>
        <Input
          type='text'
          placeholder={`Type ${type} name here`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button onClick={handleRename} disabled={newName === name}>
          Rename
        </Button>
        <DialogClose asChild>
          <Button variant={'secondary'}>Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
