import { isOPFSSupported } from '#/lib/utils';
import { useLocalStorage } from 'usehooks-ts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Button } from '../ui/button';
import { isMobile } from 'react-device-detect';

export default function FirstTimeDialog() {
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
