import { TreeItem } from '#/hooks/use-file-tree';
import { Folder, FolderOpen } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '#/components/ui/collapsible';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '#/components/ui/context-menu';
import { Dialog } from '#/components/ui/dialog';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub
} from '#/components/ui/sidebar';
import RenameItemDialog from '#/components/dialogs/rename-item-dialog';
import { refreshFileTree } from '#/lib/utils';
import opfs from 'opfs-fns';
import useCurrentPath from '#/hooks/use-current-path';
import { useState } from 'react';
import CreateItem from '#/components/dialogs/create-item-dialog';
import { Tree } from './tree';
import { useToast } from '#/hooks/use-toast';
import { useCopyToClipboard } from 'usehooks-ts';

export default function DirTreeItem(props: TreeItem[number]) {
  const { name, children, fullPath } = props;
  const [currentPath, setCurrentPath] = useCurrentPath();
  const [dialog, setDialog] = useState<
    'rename' | 'create-folder' | 'create-file'
  >();
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copy] = useCopyToClipboard();

  const handleDelete = () => {
    opfs.dir.delete({ path: fullPath }).then(() => {
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

  const changeDialog = (t: typeof dialog) => {
    return () => setDialog(t);
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

  return (
    <SidebarMenuItem>
      <Collapsible className='group/collapsible [&>button>svg:nth-child(2)]:hidden [&[data-state=open]>button>svg:first-child]:hidden [&[data-state=open]>button>svg:nth-child(2)]:block'>
        <Dialog
          open={dialog !== undefined}
          onOpenChange={changeDialog(undefined)}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton title={name}>
                  <Folder />
                  <FolderOpen />
                  <span>{name}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={changeDialog('create-file')}>
                Create File
              </ContextMenuItem>
              <ContextMenuItem onClick={changeDialog('create-folder')}>
                Create Folder
              </ContextMenuItem>
              <ContextMenuItem onClick={handleCopyText}>
                Copy Path
              </ContextMenuItem>
              <ContextMenuItem onClick={handleEmpty}>Empty</ContextMenuItem>
              <ContextMenuSeparator></ContextMenuSeparator>
              <ContextMenuItem onClick={changeDialog('rename')}>
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          {dialog === 'rename' && (
            <RenameItemDialog
              fullPath={fullPath}
              name={name}
              type='directory'
            />
          )}
          {(dialog === 'create-file' || dialog === 'create-folder') && (
            <CreateItem
              startingPath={fullPath + '/'}
              type={dialog === 'create-file' ? 'file' : 'directory'}
              close={changeDialog(undefined)}
            />
          )}
        </Dialog>
        {children!.length > 0 && (
          <CollapsibleContent>
            <SidebarMenuSub className='mr-0 pr-0'>
              <Tree items={children!} />
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarMenuItem>
  );
}
