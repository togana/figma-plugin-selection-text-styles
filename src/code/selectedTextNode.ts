type Table = {
  textStyleId: string;
  textStyleName: string;
  fontFamily: string;
  fontStyle: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
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
      text.fontName === figma.mixed ||
      text.fontSize === figma.mixed ||
      text.lineHeight === figma.mixed ||
      text.letterSpacing === figma.mixed
    ) {
      const table: Table = {
        textStyleId: 'mixed',
        textStyleName: 'mixed',
        fontFamily: 'mixed',
        fontStyle: 'mixed',
        fontSize: 'mixed',
        lineHeight: 'mixed',
        letterSpacing: 'mixed',
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
    const lh = text.lineHeight as LineHeight;
    const lineHeightValue =
      lh.unit === 'AUTO' ? 'Auto' : roundDecimal(lh.value, 2);
    const lineHeightUnit =
      lh.unit === 'AUTO' ? '' : lh.unit === 'PERCENT' ? '%' : 'px';
    const lineHeight = `${lineHeightValue}${lineHeightUnit}`;
    const keys = text.textStyleId
      ? text.textStyleId
      : `${fontSize}:${lineHeight}`;
    const textStyleName = text.textStyleId
      ? figma.getStyleById(String(text.textStyleId))?.name ?? ''
      : '';
    const fontFamily = text.fontName.family;
    const fontStyle = text.fontName.style;
    const ls = text.letterSpacing as LetterSpacing;
    const letterSpacingValue = roundDecimal(ls.value, 2);
    const letterSpacingUnit = ls.unit === 'PERCENT' ? '%' : 'px';
    const letterSpacing = `${letterSpacingValue}${letterSpacingUnit}`;

    const table: Table = {
      textStyleId: String(text.textStyleId),
      textStyleName,
      fontFamily,
      fontStyle,
      fontSize,
      lineHeight,
      letterSpacing,
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
