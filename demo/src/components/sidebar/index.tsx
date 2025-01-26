import { Button } from '#/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from '#/components/ui/sidebar';
import { FilePlus, FolderPlus, Import, RefreshCw } from 'lucide-react';
import { Dialog, DialogTrigger } from '#/components/ui/dialog';
import useFileTree from '#/hooks/use-file-tree';
import { hrByteSize, refreshFileTree } from '#/lib/utils';
import CreateItem from '#/components/dialogs/create-item-dialog';
import ImportItem from '#/components/dialogs/import-item-dialog';
import { useEffect, useState } from 'react';
import { Tree } from './tree';

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
