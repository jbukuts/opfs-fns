import { Button } from './ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton
} from './ui/sidebar';
import {
  File,
  FileCode,
  FileImage,
  FilePlus,
  FileText,
  FileVideo,
  FolderPlus,
  Import,
  LucideIcon,
  RefreshCw
} from 'lucide-react';
import opfs from 'opfs-fns';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from './ui/context-menu';
import { Dialog, DialogTrigger } from './ui/dialog';
import useFileTree, { TreeItem } from '#/hooks/use-file-tree';
import { hrByteSize, refreshFileTree } from '#/lib/utils';
import CreateItem from './create-item';
import ImportItem from './import-item';
import AboutFile from './about-file';
import { createElement, useEffect, useState } from 'react';
import useCurrentPath from '#/hooks/use-current-path';
import RenameItemDialog from './rename-item-dialog';
import DirTreeItem from './dir-tree-item';

const special: Record<string, LucideIcon> = {
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
      if (b in special) return special[b];
      if (!(a in target)) return File;
      return Reflect.get(target, a, rec);
    }
  }
);

function FileTreeItem(props: { fullPath: string; mime: string; name: string }) {
  const { fullPath, mime, name } = props;
  const [currentPath, setCurrentPath] = useCurrentPath();
  const [dialogType, setDialogType] = useState<'rename' | 'stats'>();

  const handleDelete = () => {
    opfs.file.delete({ path: fullPath }).then(() => {
      refreshFileTree();
      if (currentPath === fullPath || currentPath.startsWith(fullPath))
        setCurrentPath('');
    });
  };

  return (
    <Dialog
      open={dialogType !== undefined}
      onOpenChange={() => setDialogType(undefined)}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton
            onClick={() => setCurrentPath(fullPath)}
            isActive={fullPath === currentPath}
            className='data-[active=true]:bg-transparent'>
            {createElement(FILE_ICONS[mime!])}
            {name}
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy Path</ContextMenuItem>
          <ContextMenuItem onClick={() => setDialogType('stats')}>
            File Stats
          </ContextMenuItem>
          <ContextMenuSeparator></ContextMenuSeparator>
          <ContextMenuItem onClick={() => setDialogType('rename')}>
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {dialogType === 'stats' && <AboutFile path={fullPath} />}
      {dialogType === 'rename' && (
        <RenameItemDialog name={name} type={'file'} fullPath={fullPath} />
      )}
    </Dialog>
  );
}

export function Tree({ items }: { items: TreeItem }) {
  return items.map((entry) => {
    const { name, children, fullPath, type } = entry;

    if (!children)
      return (
        <FileTreeItem
          key={`${name}-${type}`}
          fullPath={fullPath}
          name={name}
          mime={entry.mime!}
        />
      );

    return <DirTreeItem key={`${name}-${type}`} {...entry} />;
  });
}

export default function AppSidebar() {
  const fileTree = useFileTree();
  const [dirOpen, setDirOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);
  const [estimate, setEstimate] = useState<StorageEstimate>({
    usage: 0,
    quota: 1
  });

  useEffect(() => {
    const refreshEstimate = () => {
      navigator.storage.estimate().then((e) => {
        if (!e.usage) return;
        setEstimate(e);
      });
    };

    document.addEventListener('refresh-explorer', refreshEstimate);
    document.dispatchEvent(new Event('refresh-explorer'));
    return () => {
      document.removeEventListener('refresh-explorer', refreshEstimate);
    };
  }, []);

  return (
    <Sidebar className='border-gray-800'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='uppercase'>
            OPFS Explorer
          </SidebarGroupLabel>
          <SidebarGroupAction
            title='Refresh Explorer'
            onClick={refreshFileTree}>
            <RefreshCw />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <Tree items={fileTree} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className='flex flex-row items-center justify-between'>
          <p className='text-xs text-gray-300'>
            {estimate.usage && hrByteSize(estimate.usage, true)}/
            {estimate.quota && hrByteSize(estimate.quota, true)}
          </p>

          <div className='flex gap-0.5'>
            <Dialog open={fileOpen} onOpenChange={setFileOpen}>
              <DialogTrigger asChild>
                <Button variant={'ghost'} size={'icon'}>
                  <FilePlus />
                </Button>
              </DialogTrigger>
              <CreateItem type='file' close={() => setFileOpen(false)} />
            </Dialog>
            <Dialog open={dirOpen} onOpenChange={setDirOpen}>
              <DialogTrigger asChild>
                <Button variant={'ghost'} size={'icon'}>
                  <FolderPlus />
                </Button>
              </DialogTrigger>
              <CreateItem type='directory' close={() => setDirOpen(false)} />
            </Dialog>
            <ImportItem>
              <Button variant={'ghost'} size={'icon'}>
                <Import />
              </Button>
            </ImportItem>
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
