import { SidebarProvider } from './components/ui/sidebar';
import AppSidebar from './components/app-sidebar';
import FileViewer from './components/file-viewer';
import { Toaster } from './components/ui/toaster';
import { useLocalStorage } from 'usehooks-ts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './components/ui/dialog';
import { Button } from './components/ui/button';
import { isOPFSSupported } from './lib/utils';
import { isMobile, isSafari, browserName } from 'react-device-detect';
import { useState } from 'react';

function NotSupportedDialog() {
  const isSupported = isOPFSSupported();
  const [open, setOpen] = useState(isMobile || isSafari || !isSupported);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Not supported</DialogTitle>
          <DialogDescription>
            This demo is not supported in this browser
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>
            This site has detected you are using <b>{browserName}</b>. Due to
            conflicting/varying support for the OPFS in different browsers this
            demo will probably not work as intended in this browser.
            <br />
            <br />
            Check supported browsers{' '}
            <a
              href='https://caniuse.com/?search=FileSystem'
              className='underline decoration-dashed hover:decoration-solid'
              target='_blank'>
              here
            </a>
            .
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'destructive'}>I'll try anyways</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FirstTimeDialog() {
  const [firstTime, setFirstTime] = useLocalStorage('first-visit', true);
  const isSupported = isOPFSSupported();

  return (
    <Dialog
      open={firstTime && isSupported && !isMobile}
      onOpenChange={setFirstTime}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OPFS demo</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          <p>
            This site is a simple demo showcasing some of the{' '}
            <code>opfs-fns</code> wrapper library's functionality.
            <br />
            <br />
            To learn more about the OPFS see{' '}
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
  );
}

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='grow'>
        <FileViewer />
      </main>
      <Toaster />
      <NotSupportedDialog />
      <FirstTimeDialog />
    </SidebarProvider>
  );
}

export default App;
