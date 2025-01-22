import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import opfs from './index';

describe('opfs', () => {
  beforeEach(async () => {
    const l = await opfs.dir.ls({ path: '/' });
    expect(l).not.toBe(null);
    expect(l!.length).toBe(0);
  });

  afterEach(async () => {
    await opfs.dir.empty();
  });

  describe('file operations', () => {
    it('will fail to read a bad file path', async () => {
      expect(await opfs.file.read({ path: '/', type: 'text' })).toBe(null);
    });

    it('can create file in root', async () => {
      const path = '/test.txt';
      expect(await opfs.file.create({ path })).toBe(true);
      expect(await opfs.file.exists(path)).toBe(true);
      expect(await opfs.dir.ls({ path: '/' })).toStrictEqual([
        { name: 'test.txt', type: 'file', fullPath: '/test.txt' }
      ]);
    });

    // Currently mock API doesnt implement options for createWritable so this fails as it appends
    // https://github.com/jurerotar/opfs-mock/blob/572fbc8fc3a9b5c289bcb457303291b2d9e34aca/src/opfs.ts#L20
    // it('can create the same file twice', async () => {
    //     const path = 'test.txt'
    //     expect(await opfs.file.create({ path, data: 'test' })).toBe(true)
    //     expect(await opfs.file.read({ path, type: 'text' })).toBe('test')
    //     expect(await opfs.file.create({ path, data: 'sdfsfd' })).toBe(true)
    //     expect(await opfs.file.read({ path, type: 'text' })).toBe('sdfsfd')
    // })

    it('can write to the same file twice', async () => {
      const path = '/test.txt';
      expect(await opfs.file.create({ path, data: '' })).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe('');
      expect(await opfs.file.write({ path, data: 'sdfsfd' })).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe('sdfsfd');
    });

    it('can create nested file', async () => {
      const path = '/nested/test.txt';
      expect(await opfs.file.create({ path, recursive: true })).toBe(true);
      expect(await opfs.dir.ls({ path: '/nested' })).toStrictEqual([
        { name: 'test.txt', type: 'file', fullPath: '/nested/test.txt' }
      ]);
    });

    it('will fail to create when path is invalid', async () => {
      expect(await opfs.file.create({ path: '' })).toBe(false);
      expect(await opfs.file.create({ path: '//' })).toBe(false);
    });

    it('will fail to a create nested file without recursive option', async () => {
      const path = '/nested/test.txt';
      expect(await opfs.file.create({ path, recursive: false })).toBe(false);
      expect(await opfs.file.exists(path)).toBe(false);
    });

    it('will fail to read nonexistent file', async () => {
      expect(
        await opfs.file.read({ path: '/test/fake.txt', type: 'text' })
      ).toBe(null);
    });

    it('can write to file during creation', async () => {
      const path = '/test.txt';
      expect(await opfs.file.create({ path, data: 'test file' })).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe('test file');
    });

    it('can write text to nested file during creation', async () => {
      const path = '/nested/twice/test.txt';
      expect(
        await opfs.file.create({ path, data: 'test file', recursive: true })
      ).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe('test file');
    });

    it('can write to file after creation', async () => {
      const path = '/test.txt';
      const b = new ArrayBuffer(16);
      const view = new Uint8Array(b);
      view.fill(42);

      expect(await opfs.file.create({ path })).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe('');
      expect(await opfs.file.write({ path, data: b })).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe(
        '****************'
      );
    });

    it('can write and append to file', async () => {
      const path = '/test.txt';
      expect(await opfs.file.create({ path, data: 'test file' })).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe('test file');
      expect(
        await opfs.file.append({ path, data: '\ntest file line two' })
      ).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe(
        'test file\ntest file line two'
      );
    });

    it('will fail to write to nonexistent file', async () => {
      expect(
        await opfs.file.write({
          path: '/fake/test.txt',
          data: new ArrayBuffer()
        })
      ).toBe(false);
    });

    it('can delete file', async () => {
      const path = '/test.txt';
      expect(await opfs.file.create({ path, data: 'test file' })).toBe(true);
      expect(await opfs.file.exists(path)).toBe(true);
      expect(await opfs.file.delete({ path })).toBe(true);
      expect(await opfs.file.exists(path)).toBe(false);
    });

    it('can delete nested file', async () => {
      const path = '/nested/test.txt';
      expect(
        await opfs.file.create({ path, data: 'test file', recursive: true })
      ).toBe(true);
      expect(await opfs.file.exists(path)).toBe(true);
      expect(await opfs.file.delete({ path })).toBe(true);
      expect(await opfs.dir.exists('/nested')).toBe(true);
      expect(await opfs.file.exists(path)).toBe(false);
    });

    it('can move file between nested folders', async () => {
      const a = ['a', 'nested', 'test.txt'];
      const b = '/b/test/file.txt';
      const data = 'test file';

      expect(await opfs.file.create({ path: a, recursive: true, data })).toBe(
        true
      );
      expect(await opfs.file.read({ path: a, type: 'text' })).toBe(data);
      expect(await opfs.file.mv({ path: a, newPath: b, recursive: true })).toBe(
        true
      );
      expect(await opfs.file.read({ path: b, type: 'text' })).toBe(data);
      expect(await opfs.file.exists(a)).toBe(false);
    });

    it('can rename file', async () => {
      const a = '/a.txt';
      const b = '/b.txt';
      const data = 'test file';

      expect(await opfs.file.create({ path: a, data })).toBe(true);
      expect(await opfs.file.read({ path: a, type: 'text' })).toBe(data);
      expect(await opfs.file.rename({ path: a, newName: b })).toBe(true);
      expect(await opfs.file.exists(a)).toBe(false);
      expect(await opfs.file.exists(b)).toBe(true);
      expect(await opfs.file.read({ path: b, type: 'text' })).toBe(data);
    });

    it('will fail to read nonexistent file', async () => {
      expect(await opfs.file.read({ path: '/test.txt', type: 'text' })).toBe(
        null
      );
    });

    it('will fail to move file from nonexistent path', async () => {
      expect(
        await opfs.file.mv({
          path: '/fake/test.txt',
          newPath: '/another/fake/test.txt'
        })
      ).toBe(false);
    });

    it('will fail to move file to new path without recursive option', async () => {
      const oldPath = '/fake/test.txt';
      expect(await opfs.file.create({ path: oldPath, recursive: true })).toBe(
        true
      );
      expect(await opfs.file.exists(oldPath)).toBe(true);
      expect(
        await opfs.file.mv({ path: oldPath, newPath: '/another/fake/test.txt' })
      ).toBe(false);
    });

    it('will fail to delete a nonexistent file', async () => {
      const path = '/text/file.txt';
      expect(await opfs.file.delete({ path })).toBe(false);
      expect(await opfs.dir.create({ path, recursive: true })).toBe(true);
      expect(await opfs.file.delete({ path })).toBe(false);
    });

    it('can get file stats', async () => {
      const path = '/test.md';
      const data = 'Hello';

      expect(await opfs.file.create({ path, data })).toBe(true);
      expect(await opfs.file.read({ path, type: 'text' })).toBe('Hello');

      const stats = await opfs.file.stat(path);
      expect(stats?.name).toBe('test.md');
      expect(stats?.size).toBe(5);
    });

    it('will fail to get file stats for nonexistent file', async () => {
      const stats = await opfs.file.stat('/test.md');
      expect(stats).toBe(null);
    });
  });

  describe('directory operations', () => {
    it('can create new dir in root', async () => {
      expect(await opfs.dir.create({ path: '/test' })).toBe(true);
      expect(await opfs.dir.ls({ path: '/' })).toStrictEqual([
        { name: 'test', type: 'directory', fullPath: '/test' }
      ]);
    });

    it('can create new nested dir', async () => {
      const path = '/test/nested/again';
      expect(await opfs.dir.create({ path, recursive: true })).toBe(true);
      expect(await opfs.dir.exists(path)).toBe(true);
    });

    it('will fail to create a nested dir without recursive option', async () => {
      const path = '/test/nested/again';
      expect(await opfs.dir.create({ path, recursive: false })).toBe(false);
      expect(await opfs.dir.exists(path)).toBe(false);
    });

    it('will not overwrite an existing directory when creating it again', async () => {
      expect(
        await opfs.dir.create({ path: '/a/test.txt', recursive: true })
      ).toBe(true);
      expect(await opfs.dir.exists('/a')).toBe(true);
      expect((await opfs.dir.ls({ path: '/a', flat: true }))?.length).toBe(1);
      expect(await opfs.dir.create({ path: '/a' })).toBe(true);
      expect((await opfs.dir.ls({ path: '/a', flat: true }))?.length).toBe(1);
    });

    it('can delete an existing dir', async () => {
      const path = '/test/dir';
      expect(await opfs.dir.create({ path, recursive: true })).toBe(true);
      expect(await opfs.dir.exists(path)).toBe(true);
      expect(await opfs.dir.rm({ path })).toBe(true);
      expect(await opfs.dir.exists(path)).toBe(false);
    });

    it('can list files in the root directory', async () => {
      expect(await opfs.file.create({ path: '/a.txt' })).toBe(true);
      expect(await opfs.file.create({ path: '/b.txt' })).toBe(true);
      expect(await opfs.file.create({ path: '/c.txt' })).toBe(true);
      expect(await opfs.dir.ls({})).toStrictEqual([
        {
          name: 'a.txt',
          fullPath: '/a.txt',
          type: 'file'
        },
        {
          name: 'b.txt',
          fullPath: '/b.txt',
          type: 'file'
        },
        {
          name: 'c.txt',
          fullPath: '/c.txt',
          type: 'file'
        }
      ]);
    });

    it('can list files recursively in the root directory', async () => {
      expect(await opfs.file.create({ path: '/a.txt' })).toBe(true);
      expect(await opfs.file.create({ path: '/b.txt' })).toBe(true);
      expect(
        await opfs.file.create({ path: '/nested/c.txt', recursive: true })
      ).toBe(true);
      expect(await opfs.dir.ls({ recursive: true })).toStrictEqual([
        {
          name: 'a.txt',
          fullPath: '/a.txt',
          type: 'file'
        },
        {
          name: 'b.txt',
          fullPath: '/b.txt',
          type: 'file'
        },
        {
          name: 'nested',
          fullPath: '/nested',
          type: 'directory',
          children: [{ name: 'c.txt', type: 'file', fullPath: '/nested/c.txt' }]
        }
      ]);
    });

    it('can list files recursively in the root directory as a flat list', async () => {
      expect(await opfs.file.create({ path: '/a.txt' })).toBe(true);
      expect(await opfs.file.create({ path: '/b.txt' })).toBe(true);
      expect(
        await opfs.file.create({ path: '/nested/c.txt', recursive: true })
      ).toBe(true);
      expect(await opfs.dir.ls({ recursive: true, flat: true })).toStrictEqual([
        {
          name: 'c.txt',
          type: 'file',
          fullPath: '/nested/c.txt'
        },
        {
          name: 'a.txt',
          fullPath: '/a.txt',
          type: 'file'
        },
        {
          name: 'b.txt',
          fullPath: '/b.txt',
          type: 'file'
        },
        {
          name: 'nested',
          fullPath: '/nested',
          type: 'directory'
        }
      ]);
    });

    it('can move dir', async () => {
      expect(
        await opfs.file.create({ path: '/a/test/file.txt', recursive: true })
      ).toBe(true);
      expect(
        await opfs.file.create({ path: '/a/test.txt', recursive: true })
      ).toBe(true);
      expect(await opfs.dir.create({ path: '/a/empty_dir' })).toBe(true);
      expect(
        (await opfs.dir.ls({ path: '/a', recursive: true, flat: true }))?.length
      ).toBe(4);
      expect(await opfs.dir.mv({ oldPath: '/a', newPath: '/b/nested' })).toBe(
        true
      );
      expect(await opfs.file.exists('/a')).toBe(false);
      const list = await opfs.dir.ls({
        path: '/b/nested',
        recursive: true,
        flat: true
      });
      expect(list?.length).toBe(4);
      expect(await opfs.file.exists('/b/nested/test/file.txt')).toBe(true);
    });

    it('can move root dir', async () => {
      // TODO should contents be deleted?
      expect(
        await opfs.file.create({ path: '/a/test/file.txt', recursive: true })
      ).toBe(true);
      expect(
        await opfs.file.create({ path: '/a/test.txt', recursive: true })
      ).toBe(true);
      expect(await opfs.dir.create({ path: '/a/empty_dir' })).toBe(true);
      expect(
        (await opfs.dir.ls({ path: '/', recursive: true, flat: true }))?.length
      ).toBe(5);
      expect(await opfs.dir.mv({ oldPath: [], newPath: '/b/nested' })).toBe(
        true
      );
      expect(await opfs.dir.exists('/a')).toBe(true);
      const list = await opfs.dir.ls({
        path: '/b/nested',
        recursive: true,
        flat: true
      });
      expect(list?.length).toBe(5);
    });

    it('can rename dir', async () => {
      expect(
        await opfs.file.create({
          path: '/test/nested/test.txt',
          recursive: true
        })
      ).toBe(true);
      expect(await opfs.dir.exists('/test/nested')).toBe(true);

      expect(
        await opfs.dir.rename({ oldPath: '/test/nested', newName: 'changed' })
      ).toBe(true);
      expect(await opfs.dir.exists('/test/nested')).toBe(false);
      expect(await opfs.dir.exists('/test/changed')).toBe(true);
      expect(await opfs.file.exists('/test/nested/test.txt')).toBe(false);
    });

    it('will fail to move a nonexistent dir', async () => {
      expect(await opfs.dir.mv({ oldPath: '/a', newPath: '/b/nested' })).toBe(
        false
      );
    });

    it('will fail to list files in a nonexistent dir', async () => {
      expect(await opfs.dir.ls({ path: '/fake' })).toBe(null);
    });

    it('will fail to delete a nonexistent dir', async () => {
      const path = '/test/test.txt';
      expect(await opfs.file.create({ path, recursive: true })).toBe(true);
      expect(await opfs.file.exists(path)).toBe(true);
      expect(await opfs.dir.rm({ path })).toBe(false);
      expect(await opfs.file.exists(path)).toBe(true);
    });

    it('will fail to empty nonexistent dir', async () => {
      expect(await opfs.dir.empty('/test')).toBe(false);
    });
  });
});
