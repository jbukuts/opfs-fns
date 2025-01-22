type PathType = string | string[];

interface DeleteItemOpts {
    path: PathType;
    type: 'dir' | 'file';
}

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
declare function statFile(path: PathType): Promise<FileStat | null>;
/**
 * Creates a new file. Can accept data to write to new file.
 *
 * @returns boolean representing whether creation was successful.
 */
declare function createFile(opts: CreateFileOpts): Promise<boolean>;
/**
 * Read contents of existing file as either string or byte data.
 *
 * @returns contents of requested file.
 */
declare function readFile(opts: ReadFileOpts): Promise<string | ArrayBuffer | null>;
/**
 * Write data to existing file. Can either overwrite or append.
 *
 * @returns boolean represent whether write was successful.
 */
declare function writeFile(opts: WriteFileOpts): Promise<boolean>;
/**
 * Append data to existing file.
 *
 * @returns boolean represent whether write was successful.
 */
declare function appendFile(opts: Omit<WriteFileOpts, 'append'>): Promise<boolean>;
/**
 * Deletes existing file.
 *
 * @returns boolean representing whether deletion was successful.
 */
declare function deleteFile(opts: DeleteFileOpts): Promise<boolean>;
/**
 * Move existing file between directories.
 *
 * @returns boolean representing whether move was successful.
 */
declare function moveFile(opts: MoveFileOpts): Promise<boolean>;
/**
 * Rename existing file.
 *
 * @returns boolean representing whether rename was successful.
 */
declare function renameFile(opts: RenameFileOpts): Promise<boolean>;
/**
 * Check if file exists at path.
 *
 * @returns boolean represent whether file exists.
 */
declare function existsFile(path: PathType): Promise<boolean>;

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
declare function ls(opts: LsOpts): Promise<TreeItem[] | null>;
/**
 * Creates a new directory.
 *
 * Attempting to create an existing directory will result in no change to the filesystem.
 *
 * @returns boolean representing whether creation was successful.
 */
declare function createDir(opts: CreateDirOpts): Promise<boolean>;
/**
 * Deletes existing directory.
 *
 * @returns boolean representing whether deletion was successful.
 */
declare function deleteDir(opts: DeleteDirOpts): Promise<boolean>;
/**
 * Moves all the contents of directory from one path to another.
 *
 * @returns whether movement was successful.
 */
declare function moveDir(opts: MoveDirOpts): Promise<boolean>;
/**
 * Rename existing directory.
 *
 * @returns boolean representing whether rename was successful.
 */
declare function renameDir(opts: RenameDirOpts): Promise<boolean>;
/**
 * Delete all items in a given directory.
 *
 * @returns boolean representing whether operation was successful.
 */
declare function emptyDir(path?: PathType): Promise<boolean>;
/**
 * Check if directory exists at path.
 *
 * @returns boolean represent whether directory exists.
 */
declare function existsDir(path: PathType): Promise<boolean>;

declare const opfs: {
    file: {
        exists: typeof existsFile;
        create: typeof createFile;
        read: typeof readFile;
        write: typeof writeFile;
        append: typeof appendFile;
        delete: typeof deleteFile;
        rm: typeof deleteFile;
        mv: typeof moveFile;
        rename: typeof renameFile;
        stat: typeof statFile;
    };
    dir: {
        exists: typeof existsDir;
        create: typeof createDir;
        ls: typeof ls;
        delete: typeof deleteDir;
        rm: typeof deleteDir;
        mv: typeof moveDir;
        rename: typeof renameDir;
        empty: typeof emptyDir;
    };
};

export { opfs as default };
