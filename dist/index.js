'use strict';

var p = require('path-browserify');
var fileType = require('file-type');

const ABSOLUTE_PATH_REGEX = /^(\/([^/\0]+\/?)*|\/)$/;
async function getRoot() {
  return navigator.storage.getDirectory();
}
function splitPath(path) {
  return Array.isArray(path) ? structuredClone(path) : path.split(p.posix.sep).filter(Boolean);
}
function separatePath(path) {
  if (!Array.isArray(path) && !ABSOLUTE_PATH_REGEX.test(path))
    throw new Error("Not an absolute path");
  const arr = splitPath(path);
  const name = arr.pop();
  return [arr, name];
}
async function getHandle(opts) {
  const { path, type, recursive = false, create = false } = opts;
  const [folders, name] = separatePath(path);
  if (create && name === undefined || name === undefined && type === "file")
    throw new Error("No name provided");
  let handle = await getRoot();
  for await (const f of folders) {
    handle = await handle.getDirectoryHandle(f, { create: recursive });
  }
  return name === undefined ? handle : handle[type === "dir" ? "getDirectoryHandle" : "getFileHandle"](name, {
    create
  });
}
async function deleteItem(opts) {
  const { path, type } = opts;
  try {
    const [folders, name] = separatePath(path);
    if (name === void 0) throw new Error("No name provided");
    const handle = await getHandle({
      type: "dir",
      path: folders,
      recursive: false
    });
    const e = await handle[type === "file" ? "getFileHandle" : "getDirectoryHandle"](name).catch(() => null);
    if (e === null) throw new Error(`No such ${type} exists`);
    await handle.removeEntry(name, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

async function statFile(path) {
  try {
    const handle = await getHandle({ type: "file", path });
    const file = await handle.getFile();
    const { name, size, lastModified: updated, type } = file;
    return {
      name,
      type: type === "" ? (await fileType.fileTypeFromBuffer(await file.arrayBuffer()))?.mime ?? "" : type,
      dir: Array.isArray(path) ? "/" + path.slice(0, -1).join("/") : path.slice(0, -name.length),
      size,
      updated
    };
  } catch {
    return null;
  }
}
async function createFile(opts) {
  const { path, recursive = false, data } = opts;
  try {
    const handle = await getHandle({
      path,
      recursive,
      create: true,
      type: "file"
    });
    if (data !== void 0) {
      const writable = await handle.createWritable({ keepExistingData: false });
      await writable.write(
        typeof data === "string" ? new TextEncoder().encode(data) : data
      );
      await writable.close();
    }
    return true;
  } catch {
    return false;
  }
}
async function readFile(opts) {
  const { path, type } = opts;
  try {
    const file = await getHandle({
      type: "file",
      path,
      recursive: false,
      create: false
    }).then((h) => h.getFile());
    if (type === "bytes") return file.arrayBuffer();
    else return file.text();
  } catch {
    return null;
  }
}
async function writeFile(opts) {
  const { path, data, append = false } = opts;
  try {
    const handle = await getHandle({
      type: "file",
      path,
      recursive: false,
      create: false
    });
    const writable = await handle.createWritable({ keepExistingData: append });
    await writable.write(
      typeof data === "string" ? new TextEncoder().encode(data) : data
    );
    await writable.close();
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
async function appendFile(opts) {
  return writeFile({ ...opts, append: true });
}
async function deleteFile(opts) {
  return deleteItem({ ...opts, type: "file" });
}
async function moveFile(opts) {
  const { oldPath, newPath, recursive = false } = opts;
  try {
    const oldData = await readFile({ path: oldPath, type: "bytes" });
    if (oldData === null) throw new Error("No such file");
    const created = await createFile({
      path: newPath,
      recursive,
      data: oldData
    });
    if (!created) throw new Error("Unable to create new file");
    await deleteFile({ path: oldPath });
    return true;
  } catch {
    return false;
  }
}
async function renameFile(opts) {
  const { oldPath, newName } = opts;
  const folders = splitPath(oldPath);
  return moveFile({
    oldPath,
    newPath: [...folders.slice(0, -1), newName],
    recursive: false
  });
}
async function existsFile(path) {
  try {
    await getHandle({ type: "file", path });
    return true;
  } catch {
    return false;
  }
}

async function ls(opts) {
  const { path = "/", recursive = false, flat = false } = opts;
  const promises = [];
  try {
    const dirHandle = await getHandle({ type: "dir", path });
    const pathArr = splitPath(path);
    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath = p.posix.join("/", ...pathArr, name);
      const { kind: type } = handle;
      if (type === "file") {
        promises.push(
          handle.getFile().then(async (f) => ({
            name,
            fullPath,
            type,
            mime: f.type === "" ? (await fileType.fileTypeFromBuffer(await f.arrayBuffer()))?.mime ?? "" : f.type,
            size: f.size,
            modified: f.lastModified
          }))
        );
      } else {
        promises.push(
          (async () => {
            return {
              name,
              type,
              fullPath,
              ...!flat && recursive ? { children: await ls({ path: fullPath, recursive, flat }) } : {}
            };
          })()
        );
        if (flat && recursive) {
          const l = await ls({ path: fullPath, recursive, flat });
          promises.splice(0, 0, ...l);
        }
      }
    }
    return await Promise.all(promises);
  } catch {
    return null;
  }
}
async function createDir(opts) {
  const { path, recursive = false } = opts;
  try {
    await getHandle({
      type: "dir",
      path,
      recursive,
      create: true
    });
    return true;
  } catch {
    return false;
  }
}
async function deleteDir(opts) {
  return deleteItem({ ...opts, type: "dir" });
}
async function moveDir(opts) {
  const { oldPath, newPath } = opts;
  try {
    const allEntries = await ls({
      path: oldPath,
      recursive: true,
      flat: true
    });
    if (allEntries === null) throw new Error("Error parsing existing dir");
    allEntries?.sort((a, b) => {
      if (a.type === "directory" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "directory") return 1;
      return a.fullPath.length - b.fullPath.length;
    });
    console.log(allEntries);
    const oldArr = splitPath(oldPath);
    const newArr = splitPath(newPath);
    for (const entry of allEntries) {
      const { type, fullPath } = entry;
      const newFullPath = [
        ...newArr,
        ...splitPath(fullPath).slice(oldArr.length)
      ];
      console.log(newFullPath, type);
      if (type === "directory")
        await createDir({ path: newFullPath, recursive: true });
      else
        await moveFile({
          oldPath: fullPath,
          newPath: newFullPath,
          recursive: true
        });
    }
    await deleteDir({ path: oldPath });
    return true;
  } catch {
    await deleteDir({ path: newPath });
    return false;
  }
}
async function renameDir(opts) {
  const { oldPath, newName } = opts;
  const arr = splitPath(oldPath);
  return moveDir({
    oldPath,
    newPath: [...arr.slice(0, -1), newName]
  });
}
async function emptyDir(path = "/") {
  try {
    const handle = await getHandle({ type: "dir", path });
    for await (const k of handle.keys()) {
      await handle.removeEntry(k, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}
async function existsDir(path) {
  try {
    await getHandle({ type: "dir", path });
    return true;
  } catch {
    return false;
  }
}

const opfs = {
  file: {
    exists: existsFile,
    create: createFile,
    read: readFile,
    write: writeFile,
    append: appendFile,
    delete: deleteFile,
    rm: deleteFile,
    mv: moveFile,
    rename: renameFile,
    stat: statFile
  },
  dir: {
    exists: existsDir,
    create: createDir,
    ls,
    delete: deleteDir,
    rm: deleteDir,
    mv: moveDir,
    rename: renameDir,
    empty: emptyDir
  }
};

module.exports = opfs;
