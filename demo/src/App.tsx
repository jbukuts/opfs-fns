import { SidebarProvider } from './components/ui/sidebar';
import AppSidebar from './components/sidebar';
import FileViewer from './components/file-viewer';
import { Toaster } from './components/ui/toaster';
import NotSupportedDialog from './components/dialogs/not-supported-dialog';
import FirstTimeDialog from './components/dialogs/first-time-dialog';

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
