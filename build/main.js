var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@create-figma-plugin/utilities/lib/events.js
function on(name, handler) {
  const id = `${currentId}`;
  currentId += 1;
  eventHandlers[id] = { handler, name };
  return function() {
    delete eventHandlers[id];
  };
}
function invokeEventHandler(name, args) {
  let invoked = false;
  for (const id in eventHandlers) {
    if (eventHandlers[id].name === name) {
      eventHandlers[id].handler.apply(null, args);
      invoked = true;
    }
  }
  if (invoked === false) {
    throw new Error(`No event handler with name \`${name}\``);
  }
}
var eventHandlers, currentId, emit;
var init_events = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/events.js"() {
    eventHandlers = {};
    currentId = 0;
    emit = typeof window === "undefined" ? function(name, ...args) {
      figma.ui.postMessage([name, ...args]);
    } : function(name, ...args) {
      window.parent.postMessage({
        pluginMessage: [name, ...args]
      }, "*");
    };
    if (typeof window === "undefined") {
      figma.ui.onmessage = function(args) {
        if (!Array.isArray(args)) {
          return;
        }
        const [name, ...rest] = args;
        if (typeof name !== "string") {
          return;
        }
        invokeEventHandler(name, rest);
      };
    } else {
      window.onmessage = function(event) {
        if (typeof event.data.pluginMessage === "undefined") {
          return;
        }
        const args = event.data.pluginMessage;
        if (!Array.isArray(args)) {
          return;
        }
        const [name, ...rest] = event.data.pluginMessage;
        if (typeof name !== "string") {
          return;
        }
        invokeEventHandler(name, rest);
      };
    }
  }
});

// node_modules/@create-figma-plugin/utilities/lib/ui.js
function showUI(options, data) {
  if (typeof __html__ === "undefined") {
    throw new Error("No UI defined");
  }
  const html = `<div id="create-figma-plugin"></div><script>document.body.classList.add('theme-${figma.editorType}');const __FIGMA_COMMAND__='${typeof figma.command === "undefined" ? "" : figma.command}';const __SHOW_UI_DATA__=${JSON.stringify(typeof data === "undefined" ? {} : data)};${__html__}</script>`;
  figma.showUI(html, __spreadProps(__spreadValues({}, options), {
    themeColors: typeof options.themeColors === "undefined" ? true : options.themeColors
  }));
}
var init_ui = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/ui.js"() {
  }
});

// node_modules/@create-figma-plugin/utilities/lib/index.js
var init_lib = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/index.js"() {
    init_events();
    init_ui();
  }
});

// src/code/selectedTextNode.ts
var recursionNodes, roundDecimal, selectedTextNodeTable;
var init_selectedTextNode = __esm({
  "src/code/selectedTextNode.ts"() {
    "use strict";
    recursionNodes = (node) => {
      return ("children" in node ? node.children.map((n) => recursionNodes(n)) : [node]).flat();
    };
    roundDecimal = (value, n) => Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
    selectedTextNodeTable = () => {
      const selectedNodes = figma.currentPage.selection;
      const selectedTextNodes = selectedNodes.reduce((previousValue, node) => {
        const n = recursionNodes(node);
        return [...previousValue, ...n];
      }, []).filter((node) => node.type === "TEXT");
      const table = selectedTextNodes.reduce((previousValue, text) => {
        var _a, _b, _c, _d, _e, _f;
        if (text.textStyleId === figma.mixed || text.fontName === figma.mixed || text.fontSize === figma.mixed || text.lineHeight === figma.mixed || text.letterSpacing === figma.mixed) {
          const table3 = {
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
            nodes: [...(_b = (_a = previousValue["mixed"]) == null ? void 0 : _a.nodes) != null ? _b : [], text.id]
          };
          return __spreadValues(__spreadValues({}, previousValue), {
            mixed: table3
          });
        }
        const fontSize = String(text.fontSize);
        const fontSizeValue = text.fontSize;
        const lh = text.lineHeight;
        const lineHeightValue = lh.unit === "AUTO" ? "Auto" : roundDecimal(lh.value, 2);
        const lineHeightUnit = lh.unit === "AUTO" ? "" : lh.unit === "PERCENT" ? "%" : "px";
        const lineHeight = `${lineHeightValue}${lineHeightUnit}`;
        const textStyleName = text.textStyleId ? (_d = (_c = figma.getStyleById(String(text.textStyleId))) == null ? void 0 : _c.name) != null ? _d : "" : "";
        const fontFamily = text.fontName.family;
        const fontStyle = text.fontName.style;
        const ls = text.letterSpacing;
        const letterSpacingValue = roundDecimal(ls.value, 2);
        const letterSpacingUnit = ls.unit === "PERCENT" ? "%" : "px";
        const letterSpacing = `${letterSpacingValue}${letterSpacingUnit}`;
        const keys = text.textStyleId ? text.textStyleId : `${fontFamily}:${fontStyle}:${fontSize}:${lineHeight}:${letterSpacing}`;
        const table2 = {
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
          nodes: [...(_f = (_e = previousValue[String(keys)]) == null ? void 0 : _e.nodes) != null ? _f : [], text.id]
        };
        return __spreadValues(__spreadValues({}, previousValue), {
          [keys]: table2
        });
      }, {});
      return Object.fromEntries(
        Object.entries(table).sort(([_key1, value1], [_key2, value2]) => {
          if (value1.textStyleName === "mixed") {
            return -1;
          }
          if (value2.textStyleName === "mixed") {
            return 1;
          }
          if (value1.lineHeightValue === "Auto") {
            return -1;
          }
          if (value2.lineHeightValue === "Auto") {
            return 1;
          }
          return 0;
        }).sort(([_key1, value1], [_key2, value2]) => {
          if (value1.letterSpacing === "mixed" || value2.letterSpacing === "mixed") {
            return 0;
          }
          if (value1.letterSpacingValue < value2.letterSpacingValue) {
            return -1;
          }
          if (value1.letterSpacingValue > value2.letterSpacingValue) {
            return 1;
          }
          return 0;
        }).sort(([_key1, value1], [_key2, value2]) => {
          if (value1.lineHeight === "mixed" || value2.lineHeight === "mixed" || value1.lineHeightValue === "Auto" || value2.lineHeightValue === "Auto") {
            return 0;
          }
          if (value1.lineHeightValue < value2.lineHeightValue) {
            return -1;
          }
          if (value1.lineHeightValue > value2.lineHeightValue) {
            return 1;
          }
          return 0;
        }).sort(([_key1, value1], [_key2, value2]) => {
          if (value1.fontSize === "mixed" || value2.fontSize === "mixed") {
            return 0;
          }
          if (value1.fontSizeValue < value2.fontSizeValue) {
            return -1;
          }
          if (value1.fontSizeValue > value2.fontSizeValue) {
            return 1;
          }
          return 0;
        }).sort(([_key1, value1], [_key2, value2]) => {
          if (value1.textStyleName === "mixed" || value2.textStyleName === "mixed") {
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
  }
});

// src/typed-events.ts
var emitTyped, onTyped;
var init_typed_events = __esm({
  "src/typed-events.ts"() {
    "use strict";
    init_lib();
    emitTyped = (name, ...args) => {
      return emit(name, ...args);
    };
    onTyped = (name, handler) => {
      return on(name, handler);
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
async function main_default() {
  var _a, _b;
  const storedSize = await figma.clientStorage.getAsync("size");
  const width = parseInt((_a = storedSize == null ? void 0 : storedSize.width) != null ? _a : 400);
  const height = parseInt((_b = storedSize == null ? void 0 : storedSize.height) != null ? _b : 400);
  const table = selectedTextNodeTable();
  showUI({ width, height }, { table });
  onTyped("SELECTED_TEXT_NODE", () => {
    const table2 = selectedTextNodeTable();
    emitTyped("REFRESH_TABLE", table2);
  });
  onTyped("SELECT_TEXT_NODE", (table2, key) => {
    var _a2, _b2, _c;
    const nodes = (_c = (_b2 = (_a2 = table2[key]) == null ? void 0 : _a2.nodes) == null ? void 0 : _b2.map((node) => figma.getNodeById(node))) == null ? void 0 : _c.filter((node) => node !== null);
    if (nodes) {
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }
  });
  onTyped("RESIZE", async (payload) => {
    const { width: width2, height: height2 } = payload;
    figma.ui.resize(width2, height2);
    await figma.clientStorage.setAsync("size", { width: width2, height: height2 });
  });
}
var init_main = __esm({
  "src/main.ts"() {
    "use strict";
    init_lib();
    init_selectedTextNode();
    init_typed_events();
  }
});

// <stdin>
var modules = { "src/main.ts--default": (init_main(), __toCommonJS(main_exports))["default"] };
var commandId = true ? "src/main.ts--default" : figma.command;
modules[commandId]();
