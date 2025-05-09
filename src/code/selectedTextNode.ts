import { SelectedTextNodeTable, Table } from '../typed-events'

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
        fontSizeValue: 0,
        fontSize: 'mixed',
        lineHeightValue: 0,
        lineHeight: 'mixed',
        letterSpacingValue: 0,
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
    const fontSizeValue = text.fontSize;
    const lh = text.lineHeight as LineHeight;
    const lineHeightValue: 'Auto' | number =
      lh.unit === 'AUTO' ? 'Auto' : roundDecimal(lh.value, 2);
    const lineHeightUnit =
      lh.unit === 'AUTO' ? '' : lh.unit === 'PERCENT' ? '%' : 'px';
    const lineHeight = `${lineHeightValue}${lineHeightUnit}`;
    const textStyleName = text.textStyleId
      ? figma.getStyleById(String(text.textStyleId))?.name ?? ''
      : '';
    const fontFamily = text.fontName.family;
    const fontStyle = text.fontName.style;
    const ls = text.letterSpacing as LetterSpacing;
    const letterSpacingValue = roundDecimal(ls.value, 2);
    const letterSpacingUnit = ls.unit === 'PERCENT' ? '%' : 'px';
    const letterSpacing = `${letterSpacingValue}${letterSpacingUnit}`;
    const keys = text.textStyleId
      ? text.textStyleId
      : `${fontFamily}:${fontStyle}:${fontSize}:${lineHeight}:${letterSpacing}`;

    const table: Table = {
      textStyleId: String(text.textStyleId),
      textStyleName,
      fontFamily,
      fontSizeValue,
      fontStyle,
      fontSize,
      lineHeightValue,
      lineHeight,
      letterSpacingValue,
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
      .sort(([_key1, value1], [_key2, value2]) => {
        if (value1.textStyleName === 'mixed') {
          return -1;
        }
        if (value2.textStyleName === 'mixed') {
          return 1;
        }
        if (value1.lineHeightValue === 'Auto') {
          return -1;
        }
        if (value2.lineHeightValue === 'Auto') {
          return 1;
        }
        return 0;
      })
      .sort(([_key1, value1], [_key2, value2]) => {
        if (
          value1.letterSpacing === 'mixed' ||
          value2.letterSpacing === 'mixed'
        ) {
          return 0;
        }
        if (value1.letterSpacingValue < value2.letterSpacingValue) {
          return -1;
        }
        if (value1.letterSpacingValue > value2.letterSpacingValue) {
          return 1;
        }
        return 0;
      })
      .sort(([_key1, value1], [_key2, value2]) => {
        if (
          value1.lineHeight === 'mixed' ||
          value2.lineHeight === 'mixed' ||
          value1.lineHeightValue === 'Auto' ||
          value2.lineHeightValue === 'Auto'
        ) {
          return 0;
        }

        if (value1.lineHeightValue < value2.lineHeightValue) {
          return -1;
        }
        if (value1.lineHeightValue > value2.lineHeightValue) {
          return 1;
        }
        return 0;
      })
      .sort(([_key1, value1], [_key2, value2]) => {
        if (value1.fontSize === 'mixed' || value2.fontSize === 'mixed') {
          return 0;
        }
        if (value1.fontSizeValue < value2.fontSizeValue) {
          return -1;
        }
        if (value1.fontSizeValue > value2.fontSizeValue) {
          return 1;
        }
        return 0;
      })
      .sort(([_key1, value1], [_key2, value2]) => {
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
