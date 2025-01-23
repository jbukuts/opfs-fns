import { SidebarProvider } from './components/ui/sidebar';
import AppSidebar from './components/app-sidebar';
import FileViewer from './components/file-viewer';
import { Toaster } from './components/ui/toaster';
import { useLocalStorage } from 'usehooks-ts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './components/ui/dialog';
import { Button } from './components/ui/button';
import { isOPFSSupported } from './lib/utils';

function App() {
  const [firstTime, setFirstTime] = useLocalStorage('first-visit', true);
  const isSupported = isOPFSSupported();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='grow'>
        <FileViewer />
      </main>
      <Toaster />
      <Dialog open={firstTime && isSupported} onOpenChange={setFirstTime}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OPFS Functions Demo</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <p>
              This site is a simple demo showcasing the <code>opfs-fns</code>{' '}
              wrapper library's functionality. To learn more about the OPFS see{' '}
              <a
                target='_blank'
                href='https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system'
                className='underline decoration-dotted hover:cursor-pointer hover:decoration-solid'>
                here
              </a>
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Continue</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export default App;
