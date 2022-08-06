type Table = {
  textStyleId: string;
  textStyleName: string;
  fontSize: number;
  lineHeight: string;
  nodes?: string[];
};

export type SelectedTextNodeTable = Record<string, Table>;

const recursionNodes = (node: SceneNode): SceneNode[] => {
  return (
    'children' in node ? node.children.map((n) => recursionNodes(n)) : [node]
  ).flat();
};

export const selectedTextNodeTable = (): SelectedTextNodeTable => {
  const selectedNodes = figma.currentPage.selection;

  const selectedTextNodes = selectedNodes
    .reduce((previousValue, node) => {
      const n = recursionNodes(node);
      return [...previousValue, ...n];
    }, [] as SceneNode[])
    .filter((node) => node.type === 'TEXT') as TextNode[];

  return selectedTextNodes.reduce((previousValue, text) => {
    const fontSize = Number(text.fontSize);
    const l = text.lineHeight as LineHeight;
    const lineHeightValue = l.unit === 'AUTO' ? 'AUTO' : l.value;
    const lineHeightUnit =
      l.unit === 'AUTO' ? '' : l.unit === 'PERCENT' ? '%' : 'px';
    const lineHeight = `${lineHeightValue}${lineHeightUnit}`;
    const keys = text.textStyleId
      ? text.textStyleId
      : `${fontSize}:${lineHeight}`;
    const textStyleName = text.textStyleId
      ? figma.getStyleById(String(text.textStyleId))?.name ?? ''
      : '';

    const table: Table = {
      textStyleId: String(text.textStyleId),
      textStyleName,
      fontSize,
      lineHeight,
      nodes: [...(previousValue[String(keys)]?.nodes ?? []), text.id],
    };

    return {
      ...previousValue,
      ...{
        [keys]: table,
      },
    };
  }, {} as SelectedTextNodeTable);
};
