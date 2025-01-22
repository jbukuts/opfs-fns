import p from 'path-browserify';
import { PathType } from './types';

export interface DeleteItemOpts {
  path: PathType;
  type: 'dir' | 'file';
}

type GetFileHandleOpts = {
  path: PathType;
  recursive?: boolean;
  create?: boolean;
  type: 'file';
};

type GetDirHandleOpts = {
  path: PathType;
  recursive?: boolean;
  create?: boolean;
  type: 'dir';
};

const ABSOLUTE_PATH_REGEX = /^(\/([^/\0]+\/?)*|\/)$/;

export async function getRoot() {
  return navigator.storage.getDirectory();
}

export function splitPath(path: PathType): string[] {
  // create copy if path is array to avoid pass by ref issues with pop
  return Array.isArray(path)
    ? structuredClone(path)
    : path.split(p.posix.sep).filter(Boolean);
}

export function separatePath(path: PathType): [string[], string | undefined] {
  if (!Array.isArray(path) && !ABSOLUTE_PATH_REGEX.test(path))
    throw new Error('Not an absolute path');
  const arr = splitPath(path);
  const name = arr.pop();
  return [arr, name];
}

export async function getHandle(
  opts: GetDirHandleOpts
): Promise<FileSystemDirectoryHandle>;
export async function getHandle(
  opts: GetFileHandleOpts
): Promise<FileSystemFileHandle>;
export async function getHandle(opts: GetDirHandleOpts | GetFileHandleOpts) {
  const { path, type, recursive = false, create = false } = opts;

  const [folders, name] = separatePath(path);
  if ((create && name === undefined) || (name === undefined && type === 'file'))
    throw new Error('No name provided');
  let handle = await getRoot();
  for await (const f of folders) {
    handle = await handle.getDirectoryHandle(f, { create: recursive });
  }

  return name === undefined
    ? handle
    : handle[type === 'dir' ? 'getDirectoryHandle' : 'getFileHandle'](name, {
        create
      });
}

export async function deleteItem(opts: DeleteItemOpts) {
  const { path, type } = opts;

  try {
    const [folders, name] = separatePath(path);
    if (name === undefined) throw new Error('No name provided');
    const handle = await getHandle({
      type: 'dir',
      path: folders,
      recursive: false
    });

    const e = await handle[
      type === 'file' ? 'getFileHandle' : 'getDirectoryHandle'
    ](name).catch(() => null);
    if (e === null) throw new Error(`No such ${type} exists`);
    await handle.removeEntry(name, { recursive: true });
    return true;
  } catch {
    return false;
  }
}
