import { moveFile } from './file';
import { deleteItem, DeleteItemOpts, getHandle, splitPath } from './shared';
import { PathType } from './types';
import p from 'path-browserify';

interface TreeItem {
  name: string;
  type: FileSystemHandleKind;
  fullPath: string;
  children?: TreeItem[] | null;
}

interface LsOpts {
  path?: PathType;
  recursive?: boolean;
  flat?: boolean;
}

interface CreateDirOpts {
  path: PathType;
  recursive?: boolean;
}

type DeleteDirOpts = Omit<DeleteItemOpts, 'type'>;

interface MoveDirOpts {
  oldPath: PathType;
  newPath: PathType;
}

interface RenameDirOpts {
  oldPath: PathType;
  newName: string;
}

/**
 * List contents of directory as tree-like or flat structure.
 *
 * @returns tree-like/flat structure representing contents.
 */
export async function ls(opts: LsOpts): Promise<TreeItem[] | null> {
  const { path = '/', recursive = false, flat = false } = opts;
  const list: TreeItem[] = [];

  try {
    const dirHandle = await getHandle({ type: 'dir', path });
    const pathArr = splitPath(path);
    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath = p.posix.join('/', ...pathArr, name);
      const { kind: type } = handle;
      list.push({
        name,
        type,
        fullPath,
        ...(recursive && !flat && type === 'directory'
          ? {
              children: await ls({ path: fullPath, recursive, flat })
            }
          : {})
      });

      if (recursive && flat && type === 'directory') {
        const l = await ls({ path: fullPath, recursive, flat });
        list.splice(0, 0, ...l!);
      }
    }

    return list;
  } catch {
    return null;
  }
}

/**
 * Creates a new directory.
 *
 * Attempting to create an existing directory will result in no change to the filesystem.
 *
 * @returns boolean representing whether creation was successful.
 */
export async function createDir(opts: CreateDirOpts) {
  const { path, recursive = false } = opts;

  try {
    await getHandle({
      type: 'dir',
      path,
      recursive,
      create: true
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes existing directory.
 *
 * @returns boolean representing whether deletion was successful.
 */
export async function deleteDir(opts: DeleteDirOpts) {
  return deleteItem({ ...opts, type: 'dir' });
}

/**
 * Moves all the contents of directory from one path to another.
 *
 * @returns whether movement was successful.
 */
export async function moveDir(opts: MoveDirOpts) {
  const { oldPath, newPath } = opts;

  try {
    const allEntries = await ls({
      path: oldPath,
      recursive: true,
      flat: true
    });
    if (allEntries === null) throw new Error('Error parsing existing dir');

    const oldArr = splitPath(oldPath);
    const newArr = splitPath(newPath);

    for (const entry of allEntries) {
      const { type, fullPath } = entry;

      const newFullPath = [
        ...newArr,
        ...splitPath(fullPath).slice(oldArr.length)
      ];
      if (type === 'directory')
        createDir({ path: newFullPath, recursive: true });
      else moveFile({ path: fullPath, newPath: newFullPath, recursive: true });
    }

    await deleteDir({ path: oldPath });
    return true;
  } catch {
    await deleteDir({ path: newPath });
    return false;
  }
}

/**
 * Rename existing directory.
 *
 * @returns boolean representing whether rename was successful.
 */
export async function renameDir(opts: RenameDirOpts) {
  const { oldPath, newName } = opts;

  const arr = splitPath(oldPath);
  return moveDir({
    oldPath,
    newPath: [...arr.slice(0, -1), newName].join('/')
  });
}

/**
 * Delete all items in a given directory.
 *
 * @returns boolean representing whether operation was successful.
 */
export async function emptyDir(path: PathType = '/') {
  try {
    const handle = await getHandle({ type: 'dir', path });
    for await (const k of handle.keys()) {
      await handle.removeEntry(k, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if directory exists at path.
 *
 * @returns boolean represent whether directory exists.
 */
export async function existsDir(path: PathType) {
  try {
    await getHandle({ type: 'dir', path });
    return true;
  } catch {
    return false;
  }
}
