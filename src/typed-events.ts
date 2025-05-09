import { emit, on } from "@create-figma-plugin/utilities";

export type Table = {
  textStyleId: string;
  textStyleName: string;
  fontFamily: string;
  fontStyle: string;
  fontSizeValue: number;
  fontSize: string;
  lineHeightValue: "Auto" | number;
  lineHeight: string;
  letterSpacingValue: number;
  letterSpacing: string;
  nodes?: string[];
};

export type SelectedTextNodeTable = Record<string, Table>;

type EventMap = {
  SELECTED_TEXT_NODE: { name: "SELECTED_TEXT_NODE"; handler: () => void };
  REFRESH_TABLE: {
    name: "REFRESH_TABLE";
    handler: (table: SelectedTextNodeTable) => void;
  };
  SELECT_TEXT_NODE: {
    name: "SELECT_TEXT_NODE";
    handler: (table: SelectedTextNodeTable, key: string) => void;
  };
  RESIZE: {
    name: "RESIZE";
    handler: (size: { width: number; height: number }) => void;
  };
};

export const emitTyped = <Name extends keyof EventMap>(
  name: Name,
  ...args: Parameters<EventMap[Name]["handler"]>
) => {
  return emit(name, ...args);
};

export const onTyped = <Name extends keyof EventMap>(
  name: Name,
  handler: EventMap[Name]["handler"]
) => {
  return on(name, handler);
};
