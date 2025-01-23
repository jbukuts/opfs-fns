# opfs-fns

Simple wrapper allowing for interaction with the OPFS via basic POSIX path strings/arrays.

Don't know what the OPFS is? Read about it [here]().

## Motivation

Currently, interacting with the OPFS is a bit of a hassle. Trying to access nested files/directories requires manually traversing the file system and getting handles to each item. The current API is powerful but requires alot of boilerplate to really get anything useful done. 

To make life a bit simpler this library acts as a tiny wrapper around the base OPFS APIs to allow you to interact with it using absolute POSIX path strings. 

## Features

- Directory operations
    - exists
    - create
    - remove/delete
    - list contents
    - move/rename
- File operations
    - exists
    - stats
    - create
    - write
    - append
    - remove
    - move/rename

## Basic Examples

### Creating a file and writing data to it

To write text to file in the root directory

```ts
import opfs from 'opfs-fns'

const data = 'This is a test'
const path = '/test.txt'

const create = await opfs.file.create({ path })
console.log(create) // expect true

const write = await opfs.file.write({ path, data })
console.log(write) // expect true

const read = await opfs.file.read({ path, type: 'text' })
console.log(read) // expect "This is a test"
```

### Write data to file during creation

You can also pass file data to be written during its creation

```ts
import opfs from 'opfs-fns'

const data = 'This is a test'
const path = '/test.txt'

const create = await opfs.file.create({ path, data })
console.log(create) // expect true

const read = await opfs.file.read({ path, type: 'text' })
console.log(read) // expect "This is a test"
```

### Creating a nested file

You can create nested file easily with just a path string. Just be sure to pass the `recursive` flag. The required directories will also be created.

```ts
import opfs from 'opfs-fns'

const data = 'Hello world'
const path = '/nested/dir/test.txt'

let created = await opfs.file.create({ path, data })
console.log(created) // expect false

created = await opfs.file.create({ path, data, recursive: true })
console.log(created) // expect true

const exist = await opfs.dir.exists('/nested/dir')
console.log(exist) // expect true
```

#### Writing byte data to a file

The `data` param in both the `create` and `write` can also accept byte data

```ts
```

## Limitations

Operations are to be executed in a vaacuum with no knowledge of what the filesystem currently looks like. This is done so that no side effects occur if you decide to manually mutate the OPFS outside this wrapper APIs functions.

For instance, if you were to create a nested file and then write to it as seperate operations the handle to file is grabbed twice. This is not optimal speed-wise but ensures that no operation is ever working with stale file handle references.

Lastly, the `move` and `rename` operations are not optimal. There are currently various proposals to extend the base OPFS API to handle operations like `.remove()` and `.move()` but as of the time of writing this (Jan 2025) they are not widely implemented across browsers. As such the rename/move operations essentially just use the other APIs under-the-hood to copy and paste data to new locations.
