import useCurrentPath from '#/hooks/use-current-path';
import { refreshFileTree } from '#/lib/utils';
import { createElement, useState } from 'react';
import opfs from 'opfs-fns';
import { Dialog } from '../ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '../ui/context-menu';
import { SidebarMenuButton } from '../ui/sidebar';
import AboutFileDialog from '../dialogs/about-file-dialog';
import RenameItemDialog from '../dialogs/rename-item-dialog';
import {
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  LucideIcon
} from 'lucide-react';
import type { TreeItem } from '#/hooks/use-file-tree';
import { useCopyToClipboard } from 'usehooks-ts';
import { useToast } from '#/hooks/use-toast';

const SPECIAL_ICONS: Record<string, LucideIcon> = {
  javascript: FileCode
};

const FILE_ICONS = new Proxy<Record<string, LucideIcon>>(
  {
    text: FileText,
    image: FileImage,
    video: FileVideo
  },
  {
    get(target, prop, rec) {
      if (typeof prop !== 'string') return File;
      const [a, b] = prop.split('/');
      if (b in SPECIAL_ICONS) return SPECIAL_ICONS[b];
      if (!(a in target)) return File;
      return Reflect.get(target, a, rec);
    }
  }
);

export default function FileTreeItem(props: TreeItem[number]) {
  const { fullPath, mime, name } = props;
  const [currentPath, setCurrentPath] = useCurrentPath();
  const [dialogType, setDialogType] = useState<'rename' | 'stats'>();
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copy] = useCopyToClipboard();

  const handleDelete = () => {
    opfs.file.delete({ path: fullPath }).then(() => {
      refreshFileTree();
      if (currentPath === fullPath || currentPath.startsWith(fullPath))
        setCurrentPath('');
    });
  };

  const handleCopyText = () => {
    console.log('sdfsdf');
    copy(fullPath).then(() => {
      toast({
        title: 'Path copied to clipboard',
        description: `${fullPath} was copied to the clipboard`
      });
    });
  };

  const changeDialog = (t: typeof dialogType) => {
    return () => setDialogType(t);
  };

  return (
    <Dialog
      open={dialogType !== undefined}
      onOpenChange={changeDialog(undefined)}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton
            title={name}
            onClick={() => setCurrentPath(fullPath)}
            isActive={fullPath === currentPath}
            className='data-[active=true]:bg-transparent'>
            {createElement(FILE_ICONS[mime!])}
            <span className='truncate'>{name}</span>
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleCopyText}>Copy Path</ContextMenuItem>
          <ContextMenuItem onClick={changeDialog('stats')}>
            File Stats
          </ContextMenuItem>
          <ContextMenuSeparator></ContextMenuSeparator>
          <ContextMenuItem onClick={changeDialog('rename')}>
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {dialogType === 'stats' && <AboutFileDialog path={fullPath} />}
      {dialogType === 'rename' && (
        <RenameItemDialog name={name} type={'file'} fullPath={fullPath} />
      )}
    </Dialog>
  );
}
