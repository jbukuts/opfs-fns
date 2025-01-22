import {
  createFile,
  readFile,
  writeFile,
  appendFile,
  deleteFile,
  moveFile,
  renameFile,
  statFile,
  existsFile
} from './file';
import {
  createDir,
  deleteDir,
  emptyDir,
  existsDir,
  ls,
  moveDir,
  renameDir
} from './folder';

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
    ls: ls,
    delete: deleteDir,
    rm: deleteDir,
    mv: moveDir,
    rename: renameDir,
    empty: emptyDir
  }
};

export default opfs;
