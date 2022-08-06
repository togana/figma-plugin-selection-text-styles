import { SelectedTextNodeTable } from './selectedTextNode';

export const selectTextNodes = (table: SelectedTextNodeTable, key: string) => {
  const nodes = table[key]?.nodes
    ?.map((node) => figma.getNodeById(node))
    ?.filter((node) => node !== null) as TextNode[] | undefined;

  if (nodes) {
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
};
