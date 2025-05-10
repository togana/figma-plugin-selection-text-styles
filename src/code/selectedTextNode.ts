import { SelectedTextNodeTable, Table } from "../typed-events";

const recursionNodes = (node: SceneNode): SceneNode[] => {
  return (
    "children" in node ? node.children.map((n) => recursionNodes(n)) : [node]
  ).flat();
};

const roundDecimal = (value: number, n: number) =>
  Math.round(value * Math.pow(10, n)) / Math.pow(10, n);

export const selectedTextNodeTable =
  async (): Promise<SelectedTextNodeTable> => {
    const selectedNodes = figma.currentPage.selection;

    const selectedTextNodes = selectedNodes
      .flatMap(recursionNodes)
      .filter((node): node is TextNode => node.type === "TEXT");

    const tableEntries = await Promise.all(
      selectedTextNodes.map(async (text) => {
        if (
          text.textStyleId === figma.mixed ||
          text.fontName === figma.mixed ||
          text.fontSize === figma.mixed ||
          text.lineHeight === figma.mixed ||
          text.letterSpacing === figma.mixed
        ) {
          const key = "mixed";
          const table: Table = {
            textStyleId: "mixed",
            textStyleName: "mixed",
            fontFamily: "mixed",
            fontStyle: "mixed",
            fontSizeValue: 0,
            fontSize: "mixed",
            lineHeightValue: 0,
            lineHeight: "mixed",
            letterSpacingValue: 0,
            letterSpacing: "mixed",
            nodes: [text.id],
          };
          return [key, table] as const;
        }

        const fontSize = String(text.fontSize);
        const fontSizeValue = text.fontSize;
        const lh = text.lineHeight as LineHeight;
        const lineHeightValue: "Auto" | number =
          lh.unit === "AUTO" ? "Auto" : roundDecimal(lh.value, 2);
        const lineHeightUnit =
          lh.unit === "AUTO" ? "" : lh.unit === "PERCENT" ? "%" : "px";
        const lineHeight = `${lineHeightValue}${lineHeightUnit}`;

        let textStyleName = "";
        if (text.textStyleId) {
          const style = await figma.getStyleByIdAsync(String(text.textStyleId));
          textStyleName = style?.name ?? "";
        }

        const fontFamily = text.fontName.family;
        const fontStyle = text.fontName.style;
        const ls = text.letterSpacing as LetterSpacing;
        const letterSpacingValue = roundDecimal(ls.value, 2);
        const letterSpacingUnit = ls.unit === "PERCENT" ? "%" : "px";
        const letterSpacing = `${letterSpacingValue}${letterSpacingUnit}`;

        const key = text.textStyleId
          ? String(text.textStyleId)
          : `${fontFamily}:${fontStyle}:${fontSize}:${lineHeight}:${letterSpacing}`;

        const table: Table = {
          textStyleId: String(text.textStyleId),
          textStyleName,
          fontFamily,
          fontStyle,
          fontSizeValue,
          fontSize,
          lineHeightValue,
          lineHeight,
          letterSpacingValue,
          letterSpacing,
          nodes: [text.id],
        };

        return [key, table] as const;
      })
    );

    // ノードをまとめる（同じ key に属するノードを結合）
    const grouped: SelectedTextNodeTable = {};
    for (const [key, table] of tableEntries) {
      if (grouped[key]) {
        grouped[key].nodes?.push(...(table?.nodes ?? []));
      } else {
        grouped[key] = table;
      }
    }

    const sorted = Object.entries(grouped)
      .sort(([_k1, a], [_k2, b]) => {
        if (a.textStyleName === "mixed") return -1;
        if (b.textStyleName === "mixed") return 1;
        if (a.lineHeightValue === "Auto") return -1;
        if (b.lineHeightValue === "Auto") return 1;
        return 0;
      })
      .sort(([_k1, a], [_k2, b]) => {
        if (a.letterSpacing === "mixed" || b.letterSpacing === "mixed")
          return 0;
        return a.letterSpacingValue - b.letterSpacingValue;
      })
      .sort(([_k1, a], [_k2, b]) => {
        if (
          a.lineHeight === "mixed" ||
          b.lineHeight === "mixed" ||
          a.lineHeightValue === "Auto" ||
          b.lineHeightValue === "Auto"
        )
          return 0;
        return a.lineHeightValue < b.lineHeightValue
          ? -1
          : a.lineHeightValue > b.lineHeightValue
          ? 1
          : 0;
      })
      .sort(([_k1, a], [_k2, b]) => {
        if (a.fontSize === "mixed" || b.fontSize === "mixed") return 0;
        return a.fontSizeValue - b.fontSizeValue;
      })
      .sort(([_k1, a], [_k2, b]) => {
        if (a.textStyleName === "mixed" || b.textStyleName === "mixed")
          return 0;
        return a.textStyleName.localeCompare(b.textStyleName);
      });

    return Object.fromEntries(sorted);
  };
