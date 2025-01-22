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
  FilePlus,
  Folder,
  FolderOpen,
  FolderPlus,
  Import,
  RefreshCw
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from './ui/collapsible';
import opfs from 'opfs-fns';
import useCurrentFile from '#/hooks/use-current-file';
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
import { refreshFileTree } from '#/lib/utils';
import CreateItem from './create-item';
import ImportItem from './import-item';
import AboutFile from './about-file';

function Tree({ items }: { items: TreeItem }) {
  const { currentPath, setCurrentPath } = useCurrentFile();

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

    if (!children)
      return (
        <Dialog key={`${name}-${type}`}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <SidebarMenuButton
                onClick={() => setCurrentPath(fullPath)}
                isActive={fullPath === currentPath}
                className='data-[active=true]:bg-transparent'>
                <File />
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
        <SidebarMenu className='flex flex-row justify-end gap-0.5'>
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
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
