import {
  type SelectedTextNodeTable,
  selectedTextNodeTable,
} from './selectedTextNode';
import { selectTextNodes } from './selectTextNode';

figma.showUI(__html__, { width: 600, height: 300 });

const init = () => {
  const table = selectedTextNodeTable();
  figma.ui.postMessage({
    type: 'init',
    message: 'hello',
    table,
  });
};

init();

figma.ui.onmessage = async (msg: {
  type: 'select-text-node';
  table: SelectedTextNodeTable;
  key: string;
}) => {
  switch (msg.type) {
    case 'select-text-node':
      await selectTextNodes(msg.table, msg.key);
      break;
  }
};
