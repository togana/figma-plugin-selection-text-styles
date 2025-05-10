import { showUI } from "@create-figma-plugin/utilities";
import { selectedTextNodeTable } from "./code/selectedTextNode";
import { emitTyped, onTyped } from "./typed-events";

export default async function () {
  // ウィンドウサイズ復元
  const storedSize = await figma.clientStorage.getAsync("size");
  const width = parseInt(storedSize?.width ?? 400);
  const height = parseInt(storedSize?.height ?? 400);

  // 初期表示用の table データを取得して showUI で渡す
  const table = await selectedTextNodeTable();
  showUI({ width, height }, { table });

  // データ取得してリフレッシュする
  onTyped("SELECTED_TEXT_NODE", async () => {
    const table = await selectedTextNodeTable();
    emitTyped("REFRESH_TABLE", table);
  });

  // TABLE 内で選択した TEXT を下に TEXT NODE を選択する
  onTyped("SELECT_TEXT_NODE", async (table, key) => {
    const nodes = (
      await Promise.all(
        table[key]?.nodes?.map(
          async (node) => await figma.getNodeByIdAsync(node)
        ) ?? []
      )
    )?.filter((node) => node !== null) as TextNode[] | undefined;

    if (nodes) {
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }
  });

  // 画面幅のリサイズが行われた際にリサイズする
  onTyped("RESIZE", async (payload) => {
    const { width, height } = payload;
    figma.ui.resize(width, height);
    await figma.clientStorage.setAsync("size", { width, height });
  });
}
