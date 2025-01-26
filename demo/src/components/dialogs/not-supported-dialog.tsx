import { isOPFSSupported } from '#/lib/utils';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { isMobile, isSafari, browserName } from 'react-device-detect';

export default function NotSupportedDialog() {
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
