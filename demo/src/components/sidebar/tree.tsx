import DirTreeItem from './dir-tree-item';
import FileTreeItem from './file-tree-item';
import type { TreeItem } from '#/hooks/use-file-tree';
import { createElement } from 'react';

interface TreeProps {
  items: TreeItem;
}

export function Tree(props: TreeProps) {
  const { items } = props;
  return items.map((entry) => {
    const { name, children, type } = entry;

    return createElement(!children ? FileTreeItem : DirTreeItem, {
      ...entry,
      key: `${name}-${type}`
    });
  });
}
