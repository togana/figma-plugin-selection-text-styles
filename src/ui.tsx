import {
  render,
  Container,
  Text,
  VerticalSpace,
  useWindowResize,
  Button,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import { emitTyped, onTyped, SelectedTextNodeTable } from "./typed-events";
import { useState } from "preact/hooks";

const onWindowResize = (size: { width: number; height: number }) => {
  emitTyped("RESIZE", size);
};

// テーブルにあるテキスト要素に絞り込む
const onSelectTextNode = (table: SelectedTextNodeTable, key: string) => {
  emitTyped("SELECT_TEXT_NODE", table, key);
};

// 現在選択中のNodeを対象にする
const onSelectedTextNode = () => {
  emitTyped("SELECTED_TEXT_NODE");
};

const Plugin = (props: { table: SelectedTextNodeTable }) => {
  const [table, setTable] = useState(props.table);

  // プラグインの幅変更
  useWindowResize(onWindowResize, {
    minHeight: 400,
    minWidth: 400,
    resizeBehaviorOnDoubleClick: "minimize",
  });

  // TABLE データを書き換える
  onTyped("REFRESH_TABLE", (table) => {
    setTable(table);
  });

  // データがない場合
  if (!Object.keys(table).length) {
    return (
      <Container space="medium">
        <VerticalSpace space="medium" />
        <Text>テキストを含むNODEを選択してください</Text>
        <VerticalSpace space="medium" />
        <Button onClick={onSelectedTextNode}>
          選択中のNODEからテキストスタイル一覧を再取得する
        </Button>
        <VerticalSpace space="medium" />
      </Container>
    );
  }

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />
      <table style={{ borderSpacing: "8px" }}>
        <thead>
          <td></td>
          <td>
            <Text align="left">styleName</Text>
          </td>
          <td>
            <Text align="left">fontFamily/fontStyle</Text>
          </td>
          <td>
            <Text align="left">fontSize/lineHeight/letterSpacing</Text>
          </td>
        </thead>
        <tbody>
          {Object.keys(table).map((key) => {
            const row = table[key];
            return (
              <tr key={key}>
                <td>
                  <Button
                    style={{ width: "max-content" }}
                    secondary
                    onClick={() => onSelectTextNode(table, key)}
                  >
                    対象のみを選択
                  </Button>
                </td>
                <td>
                  <Text align="left">{row.textStyleName}</Text>
                </td>
                <td>
                  <Text align="left">
                    {row.fontFamily}/{row.fontStyle}
                  </Text>
                </td>
                <td>
                  <Text align="left">
                    {row.fontSize}/{row.lineHeight}/{row.letterSpacing}
                  </Text>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <VerticalSpace space="medium" />
      <Button fullWidth onClick={onSelectedTextNode}>
        選択中のNODEからテキストスタイル一覧を再取得する
      </Button>
      <VerticalSpace space="medium" />
    </Container>
  );
};

export default render(Plugin);
