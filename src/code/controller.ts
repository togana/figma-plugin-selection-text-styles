import {
  type SelectedTextNodeTable,
  selectedTextNodeTable,
} from './selectedTextNode';
import { selectTextNodes } from './selectTextNode';

figma.showUI(__html__, { width: 400, height: 600 });

figma.clientStorage
  .getAsync('size')
  .then((size) => {
    if (size) figma.ui.resize(size.w, size.h);
  })
  .catch((err) => {});

const init = () => {
  const table = selectedTextNodeTable();
  figma.ui.postMessage({
    type: 'init',
    table,
  });
};

init();

figma.on('selectionchange', () => {
  init();
});

figma.ui.onmessage = (
  msg:
    | {
        type: 'select-text-node';
        table: SelectedTextNodeTable;
        key: string;
      }
    | {
        type: 'resize';
        size: {
          w: number;
          h: number;
        };
      }
) => {
  switch (msg.type) {
    case 'select-text-node':
      selectTextNodes(msg.table, msg.key);
      break;

    case 'resize':
      figma.ui.resize(msg.size.w, msg.size.h);
      figma.clientStorage.setAsync('size', msg.size).catch((err) => {});
      break;
  }
};
