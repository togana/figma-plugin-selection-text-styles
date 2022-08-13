import {
  type SelectedTextNodeTable,
  selectedTextNodeTable,
} from './selectedTextNode';
import { selectTextNodes } from './selectTextNode';

figma.showUI(__html__, { width: 262, height: 300 });

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

figma.ui.onmessage = (msg: {
  type: 'select-text-node';
  table: SelectedTextNodeTable;
  key: string;
}) => {
  switch (msg.type) {
    case 'select-text-node':
      selectTextNodes(msg.table, msg.key);
      break;
  }
};
