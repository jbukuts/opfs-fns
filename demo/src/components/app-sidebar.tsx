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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub
} from './ui/sidebar';
import {
  File,
  FileCode,
  FileImage,
  FilePlus,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  FolderPlus,
  Import,
  LucideIcon,
  RefreshCw
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from './ui/collapsible';
import opfs from 'opfs-fns';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from './ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import useFileTree, { TreeItem } from '#/hooks/use-file-tree';
import { hrByteSize, refreshFileTree } from '#/lib/utils';
import CreateItem from './create-item';
import ImportItem from './import-item';
import AboutFile from './about-file';
import { createElement, useEffect, useState } from 'react';
import useCurrentPath from '#/hooks/use-current-path';

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

function Tree({ items }: { items: TreeItem }) {
  const [currentPath, setCurrentPath] = useCurrentPath();

  return items.map((entry) => {
    const { name, children, fullPath, type } = entry;

    const handleDelete = () => {
      opfs[type === 'file' ? 'file' : 'dir']
        .delete({ path: fullPath })
        .then(() => {
          refreshFileTree();
          if (currentPath === fullPath || currentPath.startsWith(fullPath))
            setCurrentPath('');
        });
    };

    const handleEmpty = () => {
      opfs.dir.empty(fullPath).then(() => {
        refreshFileTree();
      });
    };

    if (!children) {
      return (
        <Dialog key={`${name}-${type}`}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <SidebarMenuButton
                onClick={() => setCurrentPath(fullPath)}
                isActive={fullPath === currentPath}
                className='data-[active=true]:bg-transparent'>
                {createElement(FILE_ICONS[entry.mime!])}
                {name}
              </SidebarMenuButton>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <DialogTrigger asChild>
                <ContextMenuItem>About File</ContextMenuItem>
              </DialogTrigger>
              <ContextMenuItem onClick={handleDelete}>
                Delete file
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About File</DialogTitle>
              <DialogDescription>See file metadata here</DialogDescription>
            </DialogHeader>
            <AboutFile path={fullPath} />
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <SidebarMenuItem key={`${name}-${type}`}>
        <Collapsible className='group/collapsible [&>button>svg:nth-child(2)]:hidden [&[data-state=open]>button>svg:first-child]:hidden [&[data-state=open]>button>svg:nth-child(2)]:block'>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Folder />
                  <FolderOpen />
                  {name}
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={handleEmpty}>Empty</ContextMenuItem>
              <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          {children.length > 0 && (
            <CollapsibleContent>
              <SidebarMenuSub className='mr-0 pr-0'>
                <Tree items={children} />
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </Collapsible>
      </SidebarMenuItem>
    );
  });
}

export default function AppSidebar() {
  const fileTree = useFileTree();
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
            <CreateItem type='file'>
              <Button variant={'ghost'} size={'icon'}>
                <FilePlus />
              </Button>
            </CreateItem>
            <CreateItem type='directory'>
              <Button variant={'ghost'} size={'icon'}>
                <FolderPlus />
              </Button>
            </CreateItem>
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
