import { splitPath, deleteItem, DeleteItemOpts, getHandle } from './shared';
import { PathType } from './types';

interface CreateFileOpts {
  path: PathType;
  recursive?: boolean;
  data?: FileSystemWriteChunkType;
}

interface ReadFileOpts {
  path: PathType;
  type: keyof Pick<File, 'bytes' | 'text'>;
}

interface WriteFileOpts {
  path: string | string[];
  data: FileSystemWriteChunkType;
  append?: boolean;
}

type DeleteFileOpts = Omit<DeleteItemOpts, 'type'>;

interface MoveFileOpts {
  path: PathType;
  newPath: PathType;
  recursive?: boolean;
}

interface RenameFileOpts {
  path: string;
  newName: string;
}

interface FileStat {
  name: string;
  dir: string;
  size: number;
  updated: number;
}

/**
 * Get file information.
 *
 * @returns Object containing file information.
 */
export async function statFile(path: PathType): Promise<FileStat | null> {
  try {
    const handle = await getHandle({ type: 'file', path });
    const { name, size, lastModified: updated } = await handle.getFile();
    return {
      name: name,
      dir: '',
      size: size,
      updated
    };
  } catch {
    return null;
  }
}

/**
 * Creates a new file. Can accept data to write to new file.
 *
 * @returns boolean representing whether creation was successful.
 */
export async function createFile(opts: CreateFileOpts) {
  const { path, recursive = false, data } = opts;

  try {
    const handle = await getHandle({
      path,
      recursive,
      create: true,
      type: 'file'
    });
    if (data !== undefined) {
      const writable = await handle.createWritable({ keepExistingData: false });
      await writable.write(
        typeof data === 'string' ? new TextEncoder().encode(data) : data
      );
      await writable.close();
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Read contents of existing file as either string or byte data.
 *
 * @returns contents of requested file.
 */
export async function readFile(opts: ReadFileOpts) {
  const { path, type } = opts;

  try {
    const file = await getHandle({
      type: 'file',
      path,
      recursive: false,
      create: false
    }).then((h) => h.getFile());

    if (type === 'bytes') return file.arrayBuffer();
    else return file.text();
  } catch (e) {
    console.log(e);
    return null;
  }
}

/**
 * Write data to existing file. Can either overwrite or append.
 *
 * @returns boolean represent whether write was successful.
 */
export async function writeFile(opts: WriteFileOpts) {
  const { path, data, append = false } = opts;

  try {
    const handle = await getHandle({
      type: 'file',
      path,
      recursive: false,
      create: false
    });
    const writable = await handle.createWritable({ keepExistingData: append });
    await writable.write(
      typeof data === 'string' ? new TextEncoder().encode(data) : data
    );
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

/**
 * Append data to existing file.
 *
 * @returns boolean represent whether write was successful.
 */
export async function appendFile(opts: Omit<WriteFileOpts, 'append'>) {
  return writeFile({ ...opts, append: true });
}

/**
 * Deletes existing file.
 *
 * @returns boolean representing whether deletion was successful.
 */
export async function deleteFile(opts: DeleteFileOpts) {
  return deleteItem({ ...opts, type: 'file' });
}

/**
 * Move existing file between directories.
 *
 * @returns boolean representing whether move was successful.
 */
export async function moveFile(opts: MoveFileOpts) {
  const { path, newPath, recursive = false } = opts;

  try {
    const oldData = await readFile({ path, type: 'bytes' });
    if (oldData === null) throw new Error('No such file');
    const created = await createFile({
      path: newPath,
      recursive,
      data: oldData
    });
    if (!created) throw new Error('Unable to create new file');
    await deleteFile({ path });
    return true;
  } catch {
    return false;
  }
}

/**
 * Rename existing file.
 *
 * @returns boolean representing whether rename was successful.
 */
export async function renameFile(opts: RenameFileOpts) {
  const { path, newName } = opts;
  const folders = splitPath(path);
  return moveFile({
    path,
    newPath: [...folders.slice(0, -1), newName].join('/'),
    recursive: false
  });
}

/**
 * Check if file exists at path.
 *
 * @returns boolean represent whether file exists.
 */
export async function existsFile(path: PathType) {
  try {
    await getHandle({ type: 'file', path });
    return true;
  } catch {
    return false;
  }
}
