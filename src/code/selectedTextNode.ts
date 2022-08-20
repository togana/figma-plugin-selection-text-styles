type Table = {
  textStyleId: string;
  textStyleName: string;
  fontSize: string;
  lineHeight: string;
  nodes?: string[];
};

export type SelectedTextNodeTable = Record<string, Table>;

const recursionNodes = (node: SceneNode): SceneNode[] => {
  return (
    'children' in node ? node.children.map((n) => recursionNodes(n)) : [node]
  ).flat();
};

const roundDecimal = (value: number, n: number) =>
  Math.round(value * Math.pow(10, n)) / Math.pow(10, n);

export const selectedTextNodeTable = (): SelectedTextNodeTable => {
  const selectedNodes = figma.currentPage.selection;

  const selectedTextNodes = selectedNodes
    .reduce((previousValue, node) => {
      const n = recursionNodes(node);
      return [...previousValue, ...n];
    }, [] as SceneNode[])
    .filter((node) => node.type === 'TEXT') as TextNode[];

  const table = selectedTextNodes.reduce((previousValue, text) => {
    if (
      text.textStyleId === figma.mixed ||
      text.fontSize === figma.mixed ||
      text.lineHeight === figma.mixed
    ) {
      const table: Table = {
        textStyleId: 'mixed',
        textStyleName: 'mixed',
        fontSize: 'mixed',
        lineHeight: 'mixed',
        nodes: [...(previousValue['mixed']?.nodes ?? []), text.id],
      };
      return {
        ...previousValue,
        ...{
          mixed: table,
        },
      };
    }

    const fontSize = String(text.fontSize);
    const l = text.lineHeight as LineHeight;
    const lineHeightValue =
      l.unit === 'AUTO' ? 'Auto' : roundDecimal(l.value, 2);
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

  return Object.fromEntries(
    Object.entries(table)
      .sort(([key1, value1], [key2, value2]) => {
        if (value1.textStyleName === 'mixed') {
          return -1;
        }
        if (value2.textStyleName === 'mixed') {
          return 1;
        }
        return 0;
      })
      .sort(([key1, value1], [key2, value2]) => {
        if (value1.lineHeight === 'mixed' || value2.lineHeight === 'mixed') {
          return 0;
        }
        if (Number(value1.lineHeight) < Number(value2.lineHeight)) {
          return -1;
        }
        if (Number(value1.lineHeight) > Number(value2.lineHeight)) {
          return 1;
        }
        return 0;
      })
      .sort(([key1, value1], [key2, value2]) => {
        if (value1.fontSize === 'mixed' || value2.fontSize === 'mixed') {
          return 0;
        }
        if (Number(value1.fontSize) < Number(value2.fontSize)) {
          return -1;
        }
        if (Number(value1.fontSize) > Number(value2.fontSize)) {
          return 1;
        }
        return 0;
      })
      .sort(([key1, value1], [key2, value2]) => {
        if (
          value1.textStyleName === 'mixed' ||
          value2.textStyleName === 'mixed'
        ) {
          return 0;
        }
        if (value1.textStyleName < value2.textStyleName) {
          return -1;
        }
        if (value1.textStyleName > value2.textStyleName) {
          return 1;
        }
        return 0;
      })
  );
};
