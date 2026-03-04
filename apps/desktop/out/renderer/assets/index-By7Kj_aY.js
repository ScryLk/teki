import { R as React, j as jsxRuntimeExports, r as reactExports, c as commonjsGlobal, g as getDefaultExportFromCjs, a as client } from "./client-sPD6oxeY.js";
const createStoreImpl = (createState2) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState2(setState, getState, api);
  return api;
};
const createStore = (createState2) => createState2 ? createStoreImpl(createState2) : createStoreImpl;
const identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = React.useSyncExternalStore(
    api.subscribe,
    React.useCallback(() => selector(api.getState()), [api, selector]),
    React.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  React.useDebugValue(slice);
  return slice;
}
const createImpl = (createState2) => {
  const api = createStore(createState2);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create$1 = (createState2) => createState2 ? createImpl(createState2) : createImpl;
function getStoredModel() {
  try {
    return localStorage.getItem("teki-selected-model") ?? "gemini-flash";
  } catch {
    return "gemini-flash";
  }
}
const useAppStore = create$1((set) => ({
  // Layout
  layout: "split",
  // Command palette
  commandPaletteOpen: false,
  // Settings panel
  settingsOpen: false,
  // Window watching state
  isWatching: false,
  watchedWindowName: null,
  currentFrame: null,
  watchStartTime: null,
  // Cat state
  catState: "idle",
  // Active window
  activeWindow: null,
  // Connection
  connectionStatus: "online",
  // Window selector trigger
  requestWindowSelector: false,
  // AI model
  selectedModel: getStoredModel(),
  // Auth
  isAuthenticated: false,
  userEmail: null,
  userName: null,
  // Actions
  setLayout: (layout) => set({ layout }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setWatching: (isWatching, windowName) => set((state) => ({
    isWatching,
    watchedWindowName: windowName ?? state.watchedWindowName,
    currentFrame: isWatching ? state.currentFrame : null,
    watchStartTime: isWatching ? state.isWatching ? state.watchStartTime : Date.now() : null
  })),
  setCatState: (catState) => set({ catState }),
  setActiveWindow: (activeWindow) => set({ activeWindow }),
  setCurrentFrame: (currentFrame) => set({ currentFrame }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setSelectedModel: (model) => {
    try {
      localStorage.setItem("teki-selected-model", model);
    } catch {
    }
    set({ selectedModel: model });
  },
  triggerWindowSelector: () => set({ requestWindowSelector: true }),
  clearWindowSelector: () => set({ requestWindowSelector: false }),
  // Auth actions
  setAuth: (isAuthenticated, email, name2) => set({ isAuthenticated, userEmail: email, userName: name2 }),
  clearAuth: () => set({ isAuthenticated: false, userEmail: null, userName: null })
}));
const TitleBar = () => {
  const isCapturing = useAppStore((s) => s.isWatching);
  const setWatching = useAppStore((s) => s.setWatching);
  const setCatState = useAppStore((s) => s.setCatState);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);
  const triggerWindowSelector = useAppStore((s) => s.triggerWindowSelector);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const handlePlayPauseClick = React.useCallback(async () => {
    if (isCapturing) {
      await window.tekiAPI.stopWatching();
      setWatching(false);
      setCatState("idle");
    } else {
      triggerWindowSelector();
    }
  }, [isCapturing, setWatching, setCatState, triggerWindowSelector]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "drag-region flex items-center bg-surface border-b border-border select-none",
      style: { height: 40, minHeight: 40 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 80, minWidth: 80 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: toggleCommandPalette,
            className: "no-drag flex items-center gap-2 px-3 py-1 rounded-md bg-bg border border-border\n                     text-text-muted text-xs hover:border-accent hover:text-text-secondary\n                     transition-colors cursor-pointer",
            style: { minWidth: 220 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted", children: "⌘K" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Buscar comandos..." })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 pr-2 no-drag", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handlePlayPauseClick,
              className: "no-drag flex items-center justify-center w-8 h-8 rounded hover:bg-surface-hover transition-colors",
              title: isCapturing ? "Parar observação" : "Selecionar janela",
              children: isCapturing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-success", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "4", width: "4", height: "16" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "14", y: "4", width: "4", height: "16" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-text-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "5,3 19,12 5,21" }) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSettingsOpen(true),
              className: "no-drag flex items-center justify-center w-8 h-8 rounded hover:bg-surface-hover transition-colors text-text-muted hover:text-text-secondary",
              title: "Configurações",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex items-center justify-center w-8 h-8",
              title: connectionStatus === "online" ? "Conectado" : "Desconectado",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `inline-block w-2 h-2 rounded-full ${connectionStatus === "online" ? "bg-success" : "bg-error"}`
                }
              )
            }
          )
        ] })
      ]
    }
  );
};
function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1e3);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}
const StatusBar = () => {
  const isWatching = useAppStore((s) => s.isWatching);
  const watchStartTime = useAppStore((s) => s.watchStartTime);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const [elapsed, setElapsed] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!isWatching || watchStartTime === null) {
      setElapsed(0);
      return;
    }
    setElapsed(Date.now() - watchStartTime);
    const id = setInterval(() => {
      setElapsed(Date.now() - watchStartTime);
    }, 1e3);
    return () => clearInterval(id);
  }, [isWatching, watchStartTime]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center justify-between bg-surface border-t border-border px-3 font-mono select-none",
      style: { height: 32, minHeight: 32, fontSize: 12 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 text-text-muted min-w-0", children: isWatching ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Inspecionando há ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-secondary", children: formatElapsed(elapsed) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Inativo" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-text-muted flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `inline-block w-1.5 h-1.5 rounded-full ${connectionStatus === "online" ? "bg-success" : "bg-error"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: connectionStatus === "online" ? "Conectado" : "Desconectado" })
        ] })
      ]
    }
  );
};
const MIN_PANEL_WIDTH = 300;
const DEFAULT_SPLIT_RATIO = 0.6;
const SplitLayout = ({ leftPanel, rightPanel }) => {
  const containerRef = reactExports.useRef(null);
  const [splitRatio, setSplitRatio] = reactExports.useState(DEFAULT_SPLIT_RATIO);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const handleMouseDown = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(true);
      const container = containerRef.current;
      if (!container) return;
      const onMouseMove = (moveEvent) => {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = moveEvent.clientX - containerRect.left;
        const minRatio = MIN_PANEL_WIDTH / containerWidth;
        const maxRatio = 1 - MIN_PANEL_WIDTH / containerWidth;
        const newRatio = Math.min(maxRatio, Math.max(minRatio, mouseX / containerWidth));
        setSplitRatio(newRatio);
      };
      const onMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    []
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "flex h-full w-full overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-full overflow-hidden",
        style: { width: `${splitRatio * 100}%` },
        children: leftPanel
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onMouseDown: handleMouseDown,
        className: `relative flex-shrink-0 cursor-col-resize group ${isDragging ? "z-10" : ""}`,
        style: { width: 4 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `absolute inset-0 transition-colors ${isDragging ? "bg-accent" : "bg-border group-hover:bg-accent"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 -left-1 -right-1" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-full overflow-hidden",
        style: { width: `${(1 - splitRatio) * 100}%` },
        children: rightPanel
      }
    )
  ] });
};
function ok$1() {
}
function unreachable() {
}
function stringify$1(values, options) {
  const settings = {};
  const input = values[values.length - 1] === "" ? [...values, ""] : values;
  return input.join(
    (settings.padRight ? " " : "") + "," + (settings.padLeft === false ? "" : " ")
  ).trim();
}
const nameRe = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
const nameReJsx = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
const emptyOptions$2 = {};
function name(name2, options) {
  const settings = emptyOptions$2;
  const re2 = settings.jsx ? nameReJsx : nameRe;
  return re2.test(name2);
}
const re = /[ \t\n\f\r]/g;
function whitespace(thing) {
  return typeof thing === "object" ? thing.type === "text" ? empty$1(thing.value) : false : empty$1(thing);
}
function empty$1(value) {
  return value.replace(re, "") === "";
}
class Schema {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(property, normal, space2) {
    this.normal = normal;
    this.property = property;
    if (space2) {
      this.space = space2;
    }
  }
}
Schema.prototype.normal = {};
Schema.prototype.property = {};
Schema.prototype.space = void 0;
function merge(definitions, space2) {
  const property = {};
  const normal = {};
  for (const definition2 of definitions) {
    Object.assign(property, definition2.property);
    Object.assign(normal, definition2.normal);
  }
  return new Schema(property, normal, space2);
}
function normalize$1(value) {
  return value.toLowerCase();
}
class Info {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(property, attribute) {
    this.attribute = attribute;
    this.property = property;
  }
}
Info.prototype.attribute = "";
Info.prototype.booleanish = false;
Info.prototype.boolean = false;
Info.prototype.commaOrSpaceSeparated = false;
Info.prototype.commaSeparated = false;
Info.prototype.defined = false;
Info.prototype.mustUseProperty = false;
Info.prototype.number = false;
Info.prototype.overloadedBoolean = false;
Info.prototype.property = "";
Info.prototype.spaceSeparated = false;
Info.prototype.space = void 0;
let powers = 0;
const boolean = increment();
const booleanish = increment();
const overloadedBoolean = increment();
const number = increment();
const spaceSeparated = increment();
const commaSeparated = increment();
const commaOrSpaceSeparated = increment();
function increment() {
  return 2 ** ++powers;
}
const types = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean,
  booleanish,
  commaOrSpaceSeparated,
  commaSeparated,
  number,
  overloadedBoolean,
  spaceSeparated
}, Symbol.toStringTag, { value: "Module" }));
const checks = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(types)
);
class DefinedInfo extends Info {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(property, attribute, mask, space2) {
    let index2 = -1;
    super(property, attribute);
    mark(this, "space", space2);
    if (typeof mask === "number") {
      while (++index2 < checks.length) {
        const check = checks[index2];
        mark(this, checks[index2], (mask & types[check]) === types[check]);
      }
    }
  }
}
DefinedInfo.prototype.defined = true;
function mark(values, key, value) {
  if (value) {
    values[key] = value;
  }
}
function create(definition2) {
  const properties = {};
  const normals = {};
  for (const [property, value] of Object.entries(definition2.properties)) {
    const info = new DefinedInfo(
      property,
      definition2.transform(definition2.attributes || {}, property),
      value,
      definition2.space
    );
    if (definition2.mustUseProperty && definition2.mustUseProperty.includes(property)) {
      info.mustUseProperty = true;
    }
    properties[property] = info;
    normals[normalize$1(property)] = property;
    normals[normalize$1(info.attribute)] = property;
  }
  return new Schema(properties, normals, definition2.space);
}
const aria = create({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: booleanish,
    ariaAutoComplete: null,
    ariaBusy: booleanish,
    ariaChecked: booleanish,
    ariaColCount: number,
    ariaColIndex: number,
    ariaColSpan: number,
    ariaControls: spaceSeparated,
    ariaCurrent: null,
    ariaDescribedBy: spaceSeparated,
    ariaDetails: null,
    ariaDisabled: booleanish,
    ariaDropEffect: spaceSeparated,
    ariaErrorMessage: null,
    ariaExpanded: booleanish,
    ariaFlowTo: spaceSeparated,
    ariaGrabbed: booleanish,
    ariaHasPopup: null,
    ariaHidden: booleanish,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: spaceSeparated,
    ariaLevel: number,
    ariaLive: null,
    ariaModal: booleanish,
    ariaMultiLine: booleanish,
    ariaMultiSelectable: booleanish,
    ariaOrientation: null,
    ariaOwns: spaceSeparated,
    ariaPlaceholder: null,
    ariaPosInSet: number,
    ariaPressed: booleanish,
    ariaReadOnly: booleanish,
    ariaRelevant: null,
    ariaRequired: booleanish,
    ariaRoleDescription: spaceSeparated,
    ariaRowCount: number,
    ariaRowIndex: number,
    ariaRowSpan: number,
    ariaSelected: booleanish,
    ariaSetSize: number,
    ariaSort: null,
    ariaValueMax: number,
    ariaValueMin: number,
    ariaValueNow: number,
    ariaValueText: null,
    role: null
  },
  transform(_, property) {
    return property === "role" ? property : "aria-" + property.slice(4).toLowerCase();
  }
});
function caseSensitiveTransform(attributes, attribute) {
  return attribute in attributes ? attributes[attribute] : attribute;
}
function caseInsensitiveTransform(attributes, property) {
  return caseSensitiveTransform(attributes, property.toLowerCase());
}
const html$2 = create({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: commaSeparated,
    acceptCharset: spaceSeparated,
    accessKey: spaceSeparated,
    action: null,
    allow: null,
    allowFullScreen: boolean,
    allowPaymentRequest: boolean,
    allowUserMedia: boolean,
    alt: null,
    as: null,
    async: boolean,
    autoCapitalize: null,
    autoComplete: spaceSeparated,
    autoFocus: boolean,
    autoPlay: boolean,
    blocking: spaceSeparated,
    capture: null,
    charSet: null,
    checked: boolean,
    cite: null,
    className: spaceSeparated,
    cols: number,
    colSpan: null,
    content: null,
    contentEditable: booleanish,
    controls: boolean,
    controlsList: spaceSeparated,
    coords: number | commaSeparated,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: boolean,
    defer: boolean,
    dir: null,
    dirName: null,
    disabled: boolean,
    download: overloadedBoolean,
    draggable: booleanish,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: boolean,
    formTarget: null,
    headers: spaceSeparated,
    height: number,
    hidden: overloadedBoolean,
    high: number,
    href: null,
    hrefLang: null,
    htmlFor: spaceSeparated,
    httpEquiv: spaceSeparated,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: boolean,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: boolean,
    itemId: null,
    itemProp: spaceSeparated,
    itemRef: spaceSeparated,
    itemScope: boolean,
    itemType: spaceSeparated,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: boolean,
    low: number,
    manifest: null,
    max: null,
    maxLength: number,
    media: null,
    method: null,
    min: null,
    minLength: number,
    multiple: boolean,
    muted: boolean,
    name: null,
    nonce: null,
    noModule: boolean,
    noValidate: boolean,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: boolean,
    optimum: number,
    pattern: null,
    ping: spaceSeparated,
    placeholder: null,
    playsInline: boolean,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: boolean,
    referrerPolicy: null,
    rel: spaceSeparated,
    required: boolean,
    reversed: boolean,
    rows: number,
    rowSpan: number,
    sandbox: spaceSeparated,
    scope: null,
    scoped: boolean,
    seamless: boolean,
    selected: boolean,
    shadowRootClonable: boolean,
    shadowRootDelegatesFocus: boolean,
    shadowRootMode: null,
    shape: null,
    size: number,
    sizes: null,
    slot: null,
    span: number,
    spellCheck: booleanish,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: number,
    step: null,
    style: null,
    tabIndex: number,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: boolean,
    useMap: null,
    value: booleanish,
    width: number,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: spaceSeparated,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: number,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: number,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: boolean,
    // Lists. Use CSS to reduce space between items instead
    declare: boolean,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: number,
    // `<img>` and `<object>`
    leftMargin: number,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: number,
    // `<body>`
    marginWidth: number,
    // `<body>`
    noResize: boolean,
    // `<frame>`
    noHref: boolean,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: boolean,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: boolean,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: number,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: booleanish,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: number,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: number,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: boolean,
    disableRemotePlayback: boolean,
    prefix: null,
    property: null,
    results: number,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: caseInsensitiveTransform
});
const svg$1 = create({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: commaOrSpaceSeparated,
    accentHeight: number,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: number,
    amplitude: number,
    arabicForm: null,
    ascent: number,
    attributeName: null,
    attributeType: null,
    azimuth: number,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: number,
    by: null,
    calcMode: null,
    capHeight: number,
    className: spaceSeparated,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: number,
    diffuseConstant: number,
    direction: null,
    display: null,
    dur: null,
    divisor: number,
    dominantBaseline: null,
    download: boolean,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: number,
    enableBackground: null,
    end: null,
    event: null,
    exponent: number,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: number,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: commaSeparated,
    g2: commaSeparated,
    glyphName: commaSeparated,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: number,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: number,
    horizOriginX: number,
    horizOriginY: number,
    id: null,
    ideographic: number,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: number,
    k: number,
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    kernelMatrix: commaOrSpaceSeparated,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: number,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: number,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: number,
    overlineThickness: number,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: number,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: spaceSeparated,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: number,
    pointsAtY: number,
    pointsAtZ: number,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: commaOrSpaceSeparated,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: commaOrSpaceSeparated,
    rev: commaOrSpaceSeparated,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: commaOrSpaceSeparated,
    requiredFeatures: commaOrSpaceSeparated,
    requiredFonts: commaOrSpaceSeparated,
    requiredFormats: commaOrSpaceSeparated,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: number,
    specularExponent: number,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: number,
    strikethroughThickness: number,
    string: null,
    stroke: null,
    strokeDashArray: commaOrSpaceSeparated,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: number,
    strokeOpacity: number,
    strokeWidth: null,
    style: null,
    surfaceScale: number,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: commaOrSpaceSeparated,
    tabIndex: number,
    tableValues: null,
    target: null,
    targetX: number,
    targetY: number,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: commaOrSpaceSeparated,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: number,
    underlineThickness: number,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: number,
    values: null,
    vAlphabetic: number,
    vMathematical: number,
    vectorEffect: null,
    vHanging: number,
    vIdeographic: number,
    version: null,
    vertAdvY: number,
    vertOriginX: number,
    vertOriginY: number,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: number,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: caseSensitiveTransform
});
const xlink = create({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(_, property) {
    return "xlink:" + property.slice(5).toLowerCase();
  }
});
const xmlns = create({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: caseInsensitiveTransform
});
const xml = create({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(_, property) {
    return "xml:" + property.slice(3).toLowerCase();
  }
});
const hastToReact = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
};
const cap$1 = /[A-Z]/g;
const dash = /-[a-z]/g;
const valid = /^data[-\w.:]+$/i;
function find(schema, value) {
  const normal = normalize$1(value);
  let property = value;
  let Type = Info;
  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]];
  }
  if (normal.length > 4 && normal.slice(0, 4) === "data" && valid.test(value)) {
    if (value.charAt(4) === "-") {
      const rest = value.slice(5).replace(dash, camelcase);
      property = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
    } else {
      const rest = value.slice(4);
      if (!dash.test(rest)) {
        let dashes = rest.replace(cap$1, kebab);
        if (dashes.charAt(0) !== "-") {
          dashes = "-" + dashes;
        }
        value = "data" + dashes;
      }
    }
    Type = DefinedInfo;
  }
  return new Type(property, value);
}
function kebab($0) {
  return "-" + $0.toLowerCase();
}
function camelcase($0) {
  return $0.charAt(1).toUpperCase();
}
const html$1 = merge([aria, html$2, xlink, xmlns, xml], "html");
const svg = merge([aria, svg$1, xlink, xmlns, xml], "svg");
function stringify(values) {
  return values.join(" ").trim();
}
var cjs$2 = {};
var COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
var NEWLINE_REGEX = /\n/g;
var WHITESPACE_REGEX = /^\s*/;
var PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
var COLON_REGEX = /^:\s*/;
var VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
var SEMICOLON_REGEX = /^[;\s]*/;
var TRIM_REGEX = /^\s+|\s+$/g;
var NEWLINE = "\n";
var FORWARD_SLASH = "/";
var ASTERISK = "*";
var EMPTY_STRING = "";
var TYPE_COMMENT = "comment";
var TYPE_DECLARATION = "declaration";
function index$1(style, options) {
  if (typeof style !== "string") {
    throw new TypeError("First argument must be a string");
  }
  if (!style) return [];
  options = options || {};
  var lineno = 1;
  var column = 1;
  function updatePosition(str) {
    var lines = str.match(NEWLINE_REGEX);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf(NEWLINE);
    column = ~i ? str.length - i : column + str.length;
  }
  function position2() {
    var start = { line: lineno, column };
    return function(node2) {
      node2.position = new Position(start);
      whitespace2();
      return node2;
    };
  }
  function Position(start) {
    this.start = start;
    this.end = { line: lineno, column };
    this.source = options.source;
  }
  Position.prototype.content = style;
  function error(msg) {
    var err = new Error(
      options.source + ":" + lineno + ":" + column + ": " + msg
    );
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = style;
    if (options.silent) ;
    else {
      throw err;
    }
  }
  function match(re2) {
    var m = re2.exec(style);
    if (!m) return;
    var str = m[0];
    updatePosition(str);
    style = style.slice(str.length);
    return m;
  }
  function whitespace2() {
    match(WHITESPACE_REGEX);
  }
  function comments(rules) {
    var c;
    rules = rules || [];
    while (c = comment()) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }
  function comment() {
    var pos = position2();
    if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;
    var i = 2;
    while (EMPTY_STRING != style.charAt(i) && (ASTERISK != style.charAt(i) || FORWARD_SLASH != style.charAt(i + 1))) {
      ++i;
    }
    i += 2;
    if (EMPTY_STRING === style.charAt(i - 1)) {
      return error("End of comment missing");
    }
    var str = style.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    style = style.slice(i);
    column += 2;
    return pos({
      type: TYPE_COMMENT,
      comment: str
    });
  }
  function declaration() {
    var pos = position2();
    var prop = match(PROPERTY_REGEX);
    if (!prop) return;
    comment();
    if (!match(COLON_REGEX)) return error("property missing ':'");
    var val = match(VALUE_REGEX);
    var ret = pos({
      type: TYPE_DECLARATION,
      property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
      value: val ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING)) : EMPTY_STRING
    });
    match(SEMICOLON_REGEX);
    return ret;
  }
  function declarations() {
    var decls = [];
    comments(decls);
    var decl;
    while (decl = declaration()) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
    }
    return decls;
  }
  whitespace2();
  return declarations();
}
function trim(str) {
  return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
}
var cjs$1 = index$1;
var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(cjs$2, "__esModule", { value: true });
cjs$2.default = StyleToObject;
const inline_style_parser_1 = __importDefault$1(cjs$1);
function StyleToObject(style, iterator) {
  let styleObject = null;
  if (!style || typeof style !== "string") {
    return styleObject;
  }
  const declarations = (0, inline_style_parser_1.default)(style);
  const hasIterator = typeof iterator === "function";
  declarations.forEach((declaration) => {
    if (declaration.type !== "declaration") {
      return;
    }
    const { property, value } = declaration;
    if (hasIterator) {
      iterator(property, value, declaration);
    } else if (value) {
      styleObject = styleObject || {};
      styleObject[property] = value;
    }
  });
  return styleObject;
}
var utilities = {};
Object.defineProperty(utilities, "__esModule", { value: true });
utilities.camelCase = void 0;
var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
var HYPHEN_REGEX = /-([a-z])/g;
var NO_HYPHEN_REGEX = /^[^-]+$/;
var VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
var MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;
var skipCamelCase = function(property) {
  return !property || NO_HYPHEN_REGEX.test(property) || CUSTOM_PROPERTY_REGEX.test(property);
};
var capitalize = function(match, character) {
  return character.toUpperCase();
};
var trimHyphen = function(match, prefix) {
  return "".concat(prefix, "-");
};
var camelCase = function(property, options) {
  if (options === void 0) {
    options = {};
  }
  if (skipCamelCase(property)) {
    return property;
  }
  property = property.toLowerCase();
  if (options.reactCompat) {
    property = property.replace(MS_VENDOR_PREFIX_REGEX, trimHyphen);
  } else {
    property = property.replace(VENDOR_PREFIX_REGEX, trimHyphen);
  }
  return property.replace(HYPHEN_REGEX, capitalize);
};
utilities.camelCase = camelCase;
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
var style_to_object_1 = __importDefault(cjs$2);
var utilities_1 = utilities;
function StyleToJS(style, options) {
  var output = {};
  if (!style || typeof style !== "string") {
    return output;
  }
  (0, style_to_object_1.default)(style, function(property, value) {
    if (property && value) {
      output[(0, utilities_1.camelCase)(property, options)] = value;
    }
  });
  return output;
}
StyleToJS.default = StyleToJS;
var cjs = StyleToJS;
const styleToJs = /* @__PURE__ */ getDefaultExportFromCjs(cjs);
const pointEnd = point$2("end");
const pointStart = point$2("start");
function point$2(type) {
  return point2;
  function point2(node2) {
    const point3 = node2 && node2.position && node2.position[type] || {};
    if (typeof point3.line === "number" && point3.line > 0 && typeof point3.column === "number" && point3.column > 0) {
      return {
        line: point3.line,
        column: point3.column,
        offset: typeof point3.offset === "number" && point3.offset > -1 ? point3.offset : void 0
      };
    }
  }
}
function position$1(node2) {
  const start = pointStart(node2);
  const end = pointEnd(node2);
  if (start && end) {
    return { start, end };
  }
}
function stringifyPosition(value) {
  if (!value || typeof value !== "object") {
    return "";
  }
  if ("position" in value || "type" in value) {
    return position(value.position);
  }
  if ("start" in value || "end" in value) {
    return position(value);
  }
  if ("line" in value || "column" in value) {
    return point$1(value);
  }
  return "";
}
function point$1(point2) {
  return index(point2 && point2.line) + ":" + index(point2 && point2.column);
}
function position(pos) {
  return point$1(pos && pos.start) + "-" + point$1(pos && pos.end);
}
function index(value) {
  return value && typeof value === "number" ? value : 1;
}
class VFileMessage extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(causeOrReason, optionsOrParentOrPlace, origin) {
    super();
    if (typeof optionsOrParentOrPlace === "string") {
      origin = optionsOrParentOrPlace;
      optionsOrParentOrPlace = void 0;
    }
    let reason = "";
    let options = {};
    let legacyCause = false;
    if (optionsOrParentOrPlace) {
      if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) {
        options = { place: optionsOrParentOrPlace };
      } else if ("type" in optionsOrParentOrPlace) {
        options = {
          ancestors: [optionsOrParentOrPlace],
          place: optionsOrParentOrPlace.position
        };
      } else {
        options = { ...optionsOrParentOrPlace };
      }
    }
    if (typeof causeOrReason === "string") {
      reason = causeOrReason;
    } else if (!options.cause && causeOrReason) {
      legacyCause = true;
      reason = causeOrReason.message;
      options.cause = causeOrReason;
    }
    if (!options.ruleId && !options.source && typeof origin === "string") {
      const index2 = origin.indexOf(":");
      if (index2 === -1) {
        options.ruleId = origin;
      } else {
        options.source = origin.slice(0, index2);
        options.ruleId = origin.slice(index2 + 1);
      }
    }
    if (!options.place && options.ancestors && options.ancestors) {
      const parent = options.ancestors[options.ancestors.length - 1];
      if (parent) {
        options.place = parent.position;
      }
    }
    const start = options.place && "start" in options.place ? options.place.start : options.place;
    this.ancestors = options.ancestors || void 0;
    this.cause = options.cause || void 0;
    this.column = start ? start.column : void 0;
    this.fatal = void 0;
    this.file = "";
    this.message = reason;
    this.line = start ? start.line : void 0;
    this.name = stringifyPosition(options.place) || "1:1";
    this.place = options.place || void 0;
    this.reason = this.message;
    this.ruleId = options.ruleId || void 0;
    this.source = options.source || void 0;
    this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
    this.actual = void 0;
    this.expected = void 0;
    this.note = void 0;
    this.url = void 0;
  }
}
VFileMessage.prototype.file = "";
VFileMessage.prototype.name = "";
VFileMessage.prototype.reason = "";
VFileMessage.prototype.message = "";
VFileMessage.prototype.stack = "";
VFileMessage.prototype.column = void 0;
VFileMessage.prototype.line = void 0;
VFileMessage.prototype.ancestors = void 0;
VFileMessage.prototype.cause = void 0;
VFileMessage.prototype.fatal = void 0;
VFileMessage.prototype.place = void 0;
VFileMessage.prototype.ruleId = void 0;
VFileMessage.prototype.source = void 0;
const own$3 = {}.hasOwnProperty;
const emptyMap = /* @__PURE__ */ new Map();
const cap = /[A-Z]/g;
const tableElements = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]);
const tableCellElement = /* @__PURE__ */ new Set(["td", "th"]);
const docs = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function toJsxRuntime(tree, options) {
  if (!options || options.Fragment === void 0) {
    throw new TypeError("Expected `Fragment` in options");
  }
  const filePath = options.filePath || void 0;
  let create2;
  if (options.development) {
    if (typeof options.jsxDEV !== "function") {
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    }
    create2 = developmentCreate(filePath, options.jsxDEV);
  } else {
    if (typeof options.jsx !== "function") {
      throw new TypeError("Expected `jsx` in production options");
    }
    if (typeof options.jsxs !== "function") {
      throw new TypeError("Expected `jsxs` in production options");
    }
    create2 = productionCreate(filePath, options.jsx, options.jsxs);
  }
  const state = {
    Fragment: options.Fragment,
    ancestors: [],
    components: options.components || {},
    create: create2,
    elementAttributeNameCase: options.elementAttributeNameCase || "react",
    evaluater: options.createEvaluater ? options.createEvaluater() : void 0,
    filePath,
    ignoreInvalidStyle: options.ignoreInvalidStyle || false,
    passKeys: options.passKeys !== false,
    passNode: options.passNode || false,
    schema: options.space === "svg" ? svg : html$1,
    stylePropertyNameCase: options.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: options.tableCellAlignToStyle !== false
  };
  const result = one$1(state, tree, void 0);
  if (result && typeof result !== "string") {
    return result;
  }
  return state.create(
    tree,
    state.Fragment,
    { children: result || void 0 },
    void 0
  );
}
function one$1(state, node2, key) {
  if (node2.type === "element") {
    return element$1(state, node2, key);
  }
  if (node2.type === "mdxFlowExpression" || node2.type === "mdxTextExpression") {
    return mdxExpression(state, node2);
  }
  if (node2.type === "mdxJsxFlowElement" || node2.type === "mdxJsxTextElement") {
    return mdxJsxElement(state, node2, key);
  }
  if (node2.type === "mdxjsEsm") {
    return mdxEsm(state, node2);
  }
  if (node2.type === "root") {
    return root$1(state, node2, key);
  }
  if (node2.type === "text") {
    return text$3(state, node2);
  }
}
function element$1(state, node2, key) {
  const parentSchema = state.schema;
  let schema = parentSchema;
  if (node2.tagName.toLowerCase() === "svg" && parentSchema.space === "html") {
    schema = svg;
    state.schema = schema;
  }
  state.ancestors.push(node2);
  const type = findComponentFromName(state, node2.tagName, false);
  const props = createElementProps(state, node2);
  let children = createChildren(state, node2);
  if (tableElements.has(node2.tagName)) {
    children = children.filter(function(child) {
      return typeof child === "string" ? !whitespace(child) : true;
    });
  }
  addNode(state, props, type, node2);
  addChildren(props, children);
  state.ancestors.pop();
  state.schema = parentSchema;
  return state.create(node2, type, props, key);
}
function mdxExpression(state, node2) {
  if (node2.data && node2.data.estree && state.evaluater) {
    const program = node2.data.estree;
    const expression = program.body[0];
    ok$1(expression.type === "ExpressionStatement");
    return (
      /** @type {Child | undefined} */
      state.evaluater.evaluateExpression(expression.expression)
    );
  }
  crashEstree(state, node2.position);
}
function mdxEsm(state, node2) {
  if (node2.data && node2.data.estree && state.evaluater) {
    return (
      /** @type {Child | undefined} */
      state.evaluater.evaluateProgram(node2.data.estree)
    );
  }
  crashEstree(state, node2.position);
}
function mdxJsxElement(state, node2, key) {
  const parentSchema = state.schema;
  let schema = parentSchema;
  if (node2.name === "svg" && parentSchema.space === "html") {
    schema = svg;
    state.schema = schema;
  }
  state.ancestors.push(node2);
  const type = node2.name === null ? state.Fragment : findComponentFromName(state, node2.name, true);
  const props = createJsxElementProps(state, node2);
  const children = createChildren(state, node2);
  addNode(state, props, type, node2);
  addChildren(props, children);
  state.ancestors.pop();
  state.schema = parentSchema;
  return state.create(node2, type, props, key);
}
function root$1(state, node2, key) {
  const props = {};
  addChildren(props, createChildren(state, node2));
  return state.create(node2, state.Fragment, props, key);
}
function text$3(_, node2) {
  return node2.value;
}
function addNode(state, props, type, node2) {
  if (typeof type !== "string" && type !== state.Fragment && state.passNode) {
    props.node = node2;
  }
}
function addChildren(props, children) {
  if (children.length > 0) {
    const value = children.length > 1 ? children : children[0];
    if (value) {
      props.children = value;
    }
  }
}
function productionCreate(_, jsx, jsxs) {
  return create2;
  function create2(_2, type, props, key) {
    const isStaticChildren = Array.isArray(props.children);
    const fn = isStaticChildren ? jsxs : jsx;
    return key ? fn(type, props, key) : fn(type, props);
  }
}
function developmentCreate(filePath, jsxDEV) {
  return create2;
  function create2(node2, type, props, key) {
    const isStaticChildren = Array.isArray(props.children);
    const point2 = pointStart(node2);
    return jsxDEV(
      type,
      props,
      key,
      isStaticChildren,
      {
        columnNumber: point2 ? point2.column - 1 : void 0,
        fileName: filePath,
        lineNumber: point2 ? point2.line : void 0
      },
      void 0
    );
  }
}
function createElementProps(state, node2) {
  const props = {};
  let alignValue;
  let prop;
  for (prop in node2.properties) {
    if (prop !== "children" && own$3.call(node2.properties, prop)) {
      const result = createProperty(state, prop, node2.properties[prop]);
      if (result) {
        const [key, value] = result;
        if (state.tableCellAlignToStyle && key === "align" && typeof value === "string" && tableCellElement.has(node2.tagName)) {
          alignValue = value;
        } else {
          props[key] = value;
        }
      }
    }
  }
  if (alignValue) {
    const style = (
      /** @type {Style} */
      props.style || (props.style = {})
    );
    style[state.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = alignValue;
  }
  return props;
}
function createJsxElementProps(state, node2) {
  const props = {};
  for (const attribute of node2.attributes) {
    if (attribute.type === "mdxJsxExpressionAttribute") {
      if (attribute.data && attribute.data.estree && state.evaluater) {
        const program = attribute.data.estree;
        const expression = program.body[0];
        ok$1(expression.type === "ExpressionStatement");
        const objectExpression = expression.expression;
        ok$1(objectExpression.type === "ObjectExpression");
        const property = objectExpression.properties[0];
        ok$1(property.type === "SpreadElement");
        Object.assign(
          props,
          state.evaluater.evaluateExpression(property.argument)
        );
      } else {
        crashEstree(state, node2.position);
      }
    } else {
      const name2 = attribute.name;
      let value;
      if (attribute.value && typeof attribute.value === "object") {
        if (attribute.value.data && attribute.value.data.estree && state.evaluater) {
          const program = attribute.value.data.estree;
          const expression = program.body[0];
          ok$1(expression.type === "ExpressionStatement");
          value = state.evaluater.evaluateExpression(expression.expression);
        } else {
          crashEstree(state, node2.position);
        }
      } else {
        value = attribute.value === null ? true : attribute.value;
      }
      props[name2] = /** @type {Props[keyof Props]} */
      value;
    }
  }
  return props;
}
function createChildren(state, node2) {
  const children = [];
  let index2 = -1;
  const countsByName = state.passKeys ? /* @__PURE__ */ new Map() : emptyMap;
  while (++index2 < node2.children.length) {
    const child = node2.children[index2];
    let key;
    if (state.passKeys) {
      const name2 = child.type === "element" ? child.tagName : child.type === "mdxJsxFlowElement" || child.type === "mdxJsxTextElement" ? child.name : void 0;
      if (name2) {
        const count = countsByName.get(name2) || 0;
        key = name2 + "-" + count;
        countsByName.set(name2, count + 1);
      }
    }
    const result = one$1(state, child, key);
    if (result !== void 0) children.push(result);
  }
  return children;
}
function createProperty(state, prop, value) {
  const info = find(state.schema, prop);
  if (value === null || value === void 0 || typeof value === "number" && Number.isNaN(value)) {
    return;
  }
  if (Array.isArray(value)) {
    value = info.commaSeparated ? stringify$1(value) : stringify(value);
  }
  if (info.property === "style") {
    let styleObject = typeof value === "object" ? value : parseStyle(state, String(value));
    if (state.stylePropertyNameCase === "css") {
      styleObject = transformStylesToCssCasing(styleObject);
    }
    return ["style", styleObject];
  }
  return [
    state.elementAttributeNameCase === "react" && info.space ? hastToReact[info.property] || info.property : info.attribute,
    value
  ];
}
function parseStyle(state, value) {
  try {
    return styleToJs(value, { reactCompat: true });
  } catch (error) {
    if (state.ignoreInvalidStyle) {
      return {};
    }
    const cause = (
      /** @type {Error} */
      error
    );
    const message = new VFileMessage("Cannot parse `style` attribute", {
      ancestors: state.ancestors,
      cause,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    message.file = state.filePath || void 0;
    message.url = docs + "#cannot-parse-style-attribute";
    throw message;
  }
}
function findComponentFromName(state, name$1, allowExpression) {
  let result;
  if (!allowExpression) {
    result = { type: "Literal", value: name$1 };
  } else if (name$1.includes(".")) {
    const identifiers = name$1.split(".");
    let index2 = -1;
    let node2;
    while (++index2 < identifiers.length) {
      const prop = name(identifiers[index2]) ? { type: "Identifier", name: identifiers[index2] } : { type: "Literal", value: identifiers[index2] };
      node2 = node2 ? {
        type: "MemberExpression",
        object: node2,
        property: prop,
        computed: Boolean(index2 && prop.type === "Literal"),
        optional: false
      } : prop;
    }
    result = node2;
  } else {
    result = name(name$1) && !/^[a-z]/.test(name$1) ? { type: "Identifier", name: name$1 } : { type: "Literal", value: name$1 };
  }
  if (result.type === "Literal") {
    const name2 = (
      /** @type {string | number} */
      result.value
    );
    return own$3.call(state.components, name2) ? state.components[name2] : name2;
  }
  if (state.evaluater) {
    return state.evaluater.evaluateExpression(result);
  }
  crashEstree(state);
}
function crashEstree(state, place) {
  const message = new VFileMessage(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: state.ancestors,
      place,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  message.file = state.filePath || void 0;
  message.url = docs + "#cannot-handle-mdx-estrees-without-createevaluater";
  throw message;
}
function transformStylesToCssCasing(domCasing) {
  const cssCasing = {};
  let from;
  for (from in domCasing) {
    if (own$3.call(domCasing, from)) {
      cssCasing[transformStyleToCssCasing(from)] = domCasing[from];
    }
  }
  return cssCasing;
}
function transformStyleToCssCasing(from) {
  let to = from.replace(cap, toDash);
  if (to.slice(0, 3) === "ms-") to = "-" + to;
  return to;
}
function toDash($0) {
  return "-" + $0.toLowerCase();
}
const urlAttributes = {
  action: ["form"],
  cite: ["blockquote", "del", "ins", "q"],
  data: ["object"],
  formAction: ["button", "input"],
  href: ["a", "area", "base", "link"],
  icon: ["menuitem"],
  itemId: null,
  manifest: ["html"],
  ping: ["a", "area"],
  poster: ["video"],
  src: [
    "audio",
    "embed",
    "iframe",
    "img",
    "input",
    "script",
    "source",
    "track",
    "video"
  ]
};
const emptyOptions$1 = {};
function toString$1(value, options) {
  const settings = emptyOptions$1;
  const includeImageAlt = typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true;
  const includeHtml = typeof settings.includeHtml === "boolean" ? settings.includeHtml : true;
  return one(value, includeImageAlt, includeHtml);
}
function one(value, includeImageAlt, includeHtml) {
  if (node(value)) {
    if ("value" in value) {
      return value.type === "html" && !includeHtml ? "" : value.value;
    }
    if (includeImageAlt && "alt" in value && value.alt) {
      return value.alt;
    }
    if ("children" in value) {
      return all(value.children, includeImageAlt, includeHtml);
    }
  }
  if (Array.isArray(value)) {
    return all(value, includeImageAlt, includeHtml);
  }
  return "";
}
function all(values, includeImageAlt, includeHtml) {
  const result = [];
  let index2 = -1;
  while (++index2 < values.length) {
    result[index2] = one(values[index2], includeImageAlt, includeHtml);
  }
  return result.join("");
}
function node(value) {
  return Boolean(value && typeof value === "object");
}
const element = document.createElement("i");
function decodeNamedCharacterReference(value) {
  const characterReference2 = "&" + value + ";";
  element.innerHTML = characterReference2;
  const character = element.textContent;
  if (character.charCodeAt(character.length - 1) === 59 && value !== "semi") {
    return false;
  }
  return character === characterReference2 ? false : character;
}
function splice(list2, start, remove, items) {
  const end = list2.length;
  let chunkStart = 0;
  let parameters;
  if (start < 0) {
    start = -start > end ? 0 : end + start;
  } else {
    start = start > end ? end : start;
  }
  remove = remove > 0 ? remove : 0;
  if (items.length < 1e4) {
    parameters = Array.from(items);
    parameters.unshift(start, remove);
    list2.splice(...parameters);
  } else {
    if (remove) list2.splice(start, remove);
    while (chunkStart < items.length) {
      parameters = items.slice(chunkStart, chunkStart + 1e4);
      parameters.unshift(start, 0);
      list2.splice(...parameters);
      chunkStart += 1e4;
      start += 1e4;
    }
  }
}
function push(list2, items) {
  if (list2.length > 0) {
    splice(list2, list2.length, 0, items);
    return list2;
  }
  return items;
}
const hasOwnProperty = {}.hasOwnProperty;
function combineExtensions(extensions) {
  const all2 = {};
  let index2 = -1;
  while (++index2 < extensions.length) {
    syntaxExtension(all2, extensions[index2]);
  }
  return all2;
}
function syntaxExtension(all2, extension2) {
  let hook;
  for (hook in extension2) {
    const maybe = hasOwnProperty.call(all2, hook) ? all2[hook] : void 0;
    const left = maybe || (all2[hook] = {});
    const right = extension2[hook];
    let code2;
    if (right) {
      for (code2 in right) {
        if (!hasOwnProperty.call(left, code2)) left[code2] = [];
        const value = right[code2];
        constructs(
          // @ts-expect-error Looks like a list.
          left[code2],
          Array.isArray(value) ? value : value ? [value] : []
        );
      }
    }
  }
}
function constructs(existing, list2) {
  let index2 = -1;
  const before = [];
  while (++index2 < list2.length) {
    (list2[index2].add === "after" ? existing : before).push(list2[index2]);
  }
  splice(existing, 0, 0, before);
}
function decodeNumericCharacterReference(value, base) {
  const code2 = Number.parseInt(value, base);
  if (
    // C0 except for HT, LF, FF, CR, space.
    code2 < 9 || code2 === 11 || code2 > 13 && code2 < 32 || // Control character (DEL) of C0, and C1 controls.
    code2 > 126 && code2 < 160 || // Lone high surrogates and low surrogates.
    code2 > 55295 && code2 < 57344 || // Noncharacters.
    code2 > 64975 && code2 < 65008 || /* eslint-disable no-bitwise */
    (code2 & 65535) === 65535 || (code2 & 65535) === 65534 || /* eslint-enable no-bitwise */
    // Out of range
    code2 > 1114111
  ) {
    return "�";
  }
  return String.fromCodePoint(code2);
}
function normalizeIdentifier(value) {
  return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const asciiAlpha = regexCheck(/[A-Za-z]/);
const asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
const asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
function asciiControl(code2) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    code2 !== null && (code2 < 32 || code2 === 127)
  );
}
const asciiDigit = regexCheck(/\d/);
const asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
const asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
function markdownLineEnding(code2) {
  return code2 !== null && code2 < -2;
}
function markdownLineEndingOrSpace(code2) {
  return code2 !== null && (code2 < 0 || code2 === 32);
}
function markdownSpace(code2) {
  return code2 === -2 || code2 === -1 || code2 === 32;
}
const unicodePunctuation = regexCheck(new RegExp("\\p{P}|\\p{S}", "u"));
const unicodeWhitespace = regexCheck(/\s/);
function regexCheck(regex) {
  return check;
  function check(code2) {
    return code2 !== null && code2 > -1 && regex.test(String.fromCharCode(code2));
  }
}
function normalizeUri(value) {
  const result = [];
  let index2 = -1;
  let start = 0;
  let skip = 0;
  while (++index2 < value.length) {
    const code2 = value.charCodeAt(index2);
    let replace = "";
    if (code2 === 37 && asciiAlphanumeric(value.charCodeAt(index2 + 1)) && asciiAlphanumeric(value.charCodeAt(index2 + 2))) {
      skip = 2;
    } else if (code2 < 128) {
      if (!/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(code2))) {
        replace = String.fromCharCode(code2);
      }
    } else if (code2 > 55295 && code2 < 57344) {
      const next = value.charCodeAt(index2 + 1);
      if (code2 < 56320 && next > 56319 && next < 57344) {
        replace = String.fromCharCode(code2, next);
        skip = 1;
      } else {
        replace = "�";
      }
    } else {
      replace = String.fromCharCode(code2);
    }
    if (replace) {
      result.push(value.slice(start, index2), encodeURIComponent(replace));
      start = index2 + skip + 1;
      replace = "";
    }
    if (skip) {
      index2 += skip;
      skip = 0;
    }
  }
  return result.join("") + value.slice(start);
}
function factorySpace(effects, ok2, type, max) {
  const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
  let size = 0;
  return start;
  function start(code2) {
    if (markdownSpace(code2)) {
      effects.enter(type);
      return prefix(code2);
    }
    return ok2(code2);
  }
  function prefix(code2) {
    if (markdownSpace(code2) && size++ < limit) {
      effects.consume(code2);
      return prefix;
    }
    effects.exit(type);
    return ok2(code2);
  }
}
const content$1 = {
  tokenize: initializeContent
};
function initializeContent(effects) {
  const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
  let previous2;
  return contentStart;
  function afterContentStartConstruct(code2) {
    if (code2 === null) {
      effects.consume(code2);
      return;
    }
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return factorySpace(effects, contentStart, "linePrefix");
  }
  function paragraphInitial(code2) {
    effects.enter("paragraph");
    return lineStart(code2);
  }
  function lineStart(code2) {
    const token = effects.enter("chunkText", {
      contentType: "text",
      previous: previous2
    });
    if (previous2) {
      previous2.next = token;
    }
    previous2 = token;
    return data(code2);
  }
  function data(code2) {
    if (code2 === null) {
      effects.exit("chunkText");
      effects.exit("paragraph");
      effects.consume(code2);
      return;
    }
    if (markdownLineEnding(code2)) {
      effects.consume(code2);
      effects.exit("chunkText");
      return lineStart;
    }
    effects.consume(code2);
    return data;
  }
}
const document$2 = {
  tokenize: initializeDocument
};
const containerConstruct = {
  tokenize: tokenizeContainer
};
function initializeDocument(effects) {
  const self2 = this;
  const stack = [];
  let continued = 0;
  let childFlow;
  let childToken;
  let lineStartOffset;
  return start;
  function start(code2) {
    if (continued < stack.length) {
      const item = stack[continued];
      self2.containerState = item[1];
      return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code2);
    }
    return checkNewContainers(code2);
  }
  function documentContinue(code2) {
    continued++;
    if (self2.containerState._closeFlow) {
      self2.containerState._closeFlow = void 0;
      if (childFlow) {
        closeFlow();
      }
      const indexBeforeExits = self2.events.length;
      let indexBeforeFlow = indexBeforeExits;
      let point2;
      while (indexBeforeFlow--) {
        if (self2.events[indexBeforeFlow][0] === "exit" && self2.events[indexBeforeFlow][1].type === "chunkFlow") {
          point2 = self2.events[indexBeforeFlow][1].end;
          break;
        }
      }
      exitContainers(continued);
      let index2 = indexBeforeExits;
      while (index2 < self2.events.length) {
        self2.events[index2][1].end = {
          ...point2
        };
        index2++;
      }
      splice(self2.events, indexBeforeFlow + 1, 0, self2.events.slice(indexBeforeExits));
      self2.events.length = index2;
      return checkNewContainers(code2);
    }
    return start(code2);
  }
  function checkNewContainers(code2) {
    if (continued === stack.length) {
      if (!childFlow) {
        return documentContinued(code2);
      }
      if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) {
        return flowStart(code2);
      }
      self2.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
    }
    self2.containerState = {};
    return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code2);
  }
  function thereIsANewContainer(code2) {
    if (childFlow) closeFlow();
    exitContainers(continued);
    return documentContinued(code2);
  }
  function thereIsNoNewContainer(code2) {
    self2.parser.lazy[self2.now().line] = continued !== stack.length;
    lineStartOffset = self2.now().offset;
    return flowStart(code2);
  }
  function documentContinued(code2) {
    self2.containerState = {};
    return effects.attempt(containerConstruct, containerContinue, flowStart)(code2);
  }
  function containerContinue(code2) {
    continued++;
    stack.push([self2.currentConstruct, self2.containerState]);
    return documentContinued(code2);
  }
  function flowStart(code2) {
    if (code2 === null) {
      if (childFlow) closeFlow();
      exitContainers(0);
      effects.consume(code2);
      return;
    }
    childFlow = childFlow || self2.parser.flow(self2.now());
    effects.enter("chunkFlow", {
      _tokenizer: childFlow,
      contentType: "flow",
      previous: childToken
    });
    return flowContinue(code2);
  }
  function flowContinue(code2) {
    if (code2 === null) {
      writeToChild(effects.exit("chunkFlow"), true);
      exitContainers(0);
      effects.consume(code2);
      return;
    }
    if (markdownLineEnding(code2)) {
      effects.consume(code2);
      writeToChild(effects.exit("chunkFlow"));
      continued = 0;
      self2.interrupt = void 0;
      return start;
    }
    effects.consume(code2);
    return flowContinue;
  }
  function writeToChild(token, endOfFile) {
    const stream = self2.sliceStream(token);
    if (endOfFile) stream.push(null);
    token.previous = childToken;
    if (childToken) childToken.next = token;
    childToken = token;
    childFlow.defineSkip(token.start);
    childFlow.write(stream);
    if (self2.parser.lazy[token.start.line]) {
      let index2 = childFlow.events.length;
      while (index2--) {
        if (
          // The token starts before the line ending…
          childFlow.events[index2][1].start.offset < lineStartOffset && // …and either is not ended yet…
          (!childFlow.events[index2][1].end || // …or ends after it.
          childFlow.events[index2][1].end.offset > lineStartOffset)
        ) {
          return;
        }
      }
      const indexBeforeExits = self2.events.length;
      let indexBeforeFlow = indexBeforeExits;
      let seen;
      let point2;
      while (indexBeforeFlow--) {
        if (self2.events[indexBeforeFlow][0] === "exit" && self2.events[indexBeforeFlow][1].type === "chunkFlow") {
          if (seen) {
            point2 = self2.events[indexBeforeFlow][1].end;
            break;
          }
          seen = true;
        }
      }
      exitContainers(continued);
      index2 = indexBeforeExits;
      while (index2 < self2.events.length) {
        self2.events[index2][1].end = {
          ...point2
        };
        index2++;
      }
      splice(self2.events, indexBeforeFlow + 1, 0, self2.events.slice(indexBeforeExits));
      self2.events.length = index2;
    }
  }
  function exitContainers(size) {
    let index2 = stack.length;
    while (index2-- > size) {
      const entry = stack[index2];
      self2.containerState = entry[1];
      entry[0].exit.call(self2, effects);
    }
    stack.length = size;
  }
  function closeFlow() {
    childFlow.write([null]);
    childToken = void 0;
    childFlow = void 0;
    self2.containerState._closeFlow = void 0;
  }
}
function tokenizeContainer(effects, ok2, nok) {
  return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok2, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function classifyCharacter(code2) {
  if (code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)) {
    return 1;
  }
  if (unicodePunctuation(code2)) {
    return 2;
  }
}
function resolveAll(constructs2, events, context) {
  const called = [];
  let index2 = -1;
  while (++index2 < constructs2.length) {
    const resolve = constructs2[index2].resolveAll;
    if (resolve && !called.includes(resolve)) {
      events = resolve(events, context);
      called.push(resolve);
    }
  }
  return events;
}
const attention = {
  name: "attention",
  resolveAll: resolveAllAttention,
  tokenize: tokenizeAttention
};
function resolveAllAttention(events, context) {
  let index2 = -1;
  let open;
  let group;
  let text2;
  let openingSequence;
  let closingSequence;
  let use;
  let nextEvents;
  let offset;
  while (++index2 < events.length) {
    if (events[index2][0] === "enter" && events[index2][1].type === "attentionSequence" && events[index2][1]._close) {
      open = index2;
      while (open--) {
        if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && // If the markers are the same:
        context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index2][1]).charCodeAt(0)) {
          if ((events[open][1]._close || events[index2][1]._open) && (events[index2][1].end.offset - events[index2][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index2][1].end.offset - events[index2][1].start.offset) % 3)) {
            continue;
          }
          use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index2][1].end.offset - events[index2][1].start.offset > 1 ? 2 : 1;
          const start = {
            ...events[open][1].end
          };
          const end = {
            ...events[index2][1].start
          };
          movePoint(start, -use);
          movePoint(end, use);
          openingSequence = {
            type: use > 1 ? "strongSequence" : "emphasisSequence",
            start,
            end: {
              ...events[open][1].end
            }
          };
          closingSequence = {
            type: use > 1 ? "strongSequence" : "emphasisSequence",
            start: {
              ...events[index2][1].start
            },
            end
          };
          text2 = {
            type: use > 1 ? "strongText" : "emphasisText",
            start: {
              ...events[open][1].end
            },
            end: {
              ...events[index2][1].start
            }
          };
          group = {
            type: use > 1 ? "strong" : "emphasis",
            start: {
              ...openingSequence.start
            },
            end: {
              ...closingSequence.end
            }
          };
          events[open][1].end = {
            ...openingSequence.start
          };
          events[index2][1].start = {
            ...closingSequence.end
          };
          nextEvents = [];
          if (events[open][1].end.offset - events[open][1].start.offset) {
            nextEvents = push(nextEvents, [["enter", events[open][1], context], ["exit", events[open][1], context]]);
          }
          nextEvents = push(nextEvents, [["enter", group, context], ["enter", openingSequence, context], ["exit", openingSequence, context], ["enter", text2, context]]);
          nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index2), context));
          nextEvents = push(nextEvents, [["exit", text2, context], ["enter", closingSequence, context], ["exit", closingSequence, context], ["exit", group, context]]);
          if (events[index2][1].end.offset - events[index2][1].start.offset) {
            offset = 2;
            nextEvents = push(nextEvents, [["enter", events[index2][1], context], ["exit", events[index2][1], context]]);
          } else {
            offset = 0;
          }
          splice(events, open - 1, index2 - open + 3, nextEvents);
          index2 = open + nextEvents.length - offset - 2;
          break;
        }
      }
    }
  }
  index2 = -1;
  while (++index2 < events.length) {
    if (events[index2][1].type === "attentionSequence") {
      events[index2][1].type = "data";
    }
  }
  return events;
}
function tokenizeAttention(effects, ok2) {
  const attentionMarkers2 = this.parser.constructs.attentionMarkers.null;
  const previous2 = this.previous;
  const before = classifyCharacter(previous2);
  let marker;
  return start;
  function start(code2) {
    marker = code2;
    effects.enter("attentionSequence");
    return inside(code2);
  }
  function inside(code2) {
    if (code2 === marker) {
      effects.consume(code2);
      return inside;
    }
    const token = effects.exit("attentionSequence");
    const after = classifyCharacter(code2);
    const open = !after || after === 2 && before || attentionMarkers2.includes(code2);
    const close = !before || before === 2 && after || attentionMarkers2.includes(previous2);
    token._open = Boolean(marker === 42 ? open : open && (before || !close));
    token._close = Boolean(marker === 42 ? close : close && (after || !open));
    return ok2(code2);
  }
}
function movePoint(point2, offset) {
  point2.column += offset;
  point2.offset += offset;
  point2._bufferIndex += offset;
}
const autolink = {
  name: "autolink",
  tokenize: tokenizeAutolink
};
function tokenizeAutolink(effects, ok2, nok) {
  let size = 0;
  return start;
  function start(code2) {
    effects.enter("autolink");
    effects.enter("autolinkMarker");
    effects.consume(code2);
    effects.exit("autolinkMarker");
    effects.enter("autolinkProtocol");
    return open;
  }
  function open(code2) {
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return schemeOrEmailAtext;
    }
    if (code2 === 64) {
      return nok(code2);
    }
    return emailAtext(code2);
  }
  function schemeOrEmailAtext(code2) {
    if (code2 === 43 || code2 === 45 || code2 === 46 || asciiAlphanumeric(code2)) {
      size = 1;
      return schemeInsideOrEmailAtext(code2);
    }
    return emailAtext(code2);
  }
  function schemeInsideOrEmailAtext(code2) {
    if (code2 === 58) {
      effects.consume(code2);
      size = 0;
      return urlInside;
    }
    if ((code2 === 43 || code2 === 45 || code2 === 46 || asciiAlphanumeric(code2)) && size++ < 32) {
      effects.consume(code2);
      return schemeInsideOrEmailAtext;
    }
    size = 0;
    return emailAtext(code2);
  }
  function urlInside(code2) {
    if (code2 === 62) {
      effects.exit("autolinkProtocol");
      effects.enter("autolinkMarker");
      effects.consume(code2);
      effects.exit("autolinkMarker");
      effects.exit("autolink");
      return ok2;
    }
    if (code2 === null || code2 === 32 || code2 === 60 || asciiControl(code2)) {
      return nok(code2);
    }
    effects.consume(code2);
    return urlInside;
  }
  function emailAtext(code2) {
    if (code2 === 64) {
      effects.consume(code2);
      return emailAtSignOrDot;
    }
    if (asciiAtext(code2)) {
      effects.consume(code2);
      return emailAtext;
    }
    return nok(code2);
  }
  function emailAtSignOrDot(code2) {
    return asciiAlphanumeric(code2) ? emailLabel(code2) : nok(code2);
  }
  function emailLabel(code2) {
    if (code2 === 46) {
      effects.consume(code2);
      size = 0;
      return emailAtSignOrDot;
    }
    if (code2 === 62) {
      effects.exit("autolinkProtocol").type = "autolinkEmail";
      effects.enter("autolinkMarker");
      effects.consume(code2);
      effects.exit("autolinkMarker");
      effects.exit("autolink");
      return ok2;
    }
    return emailValue(code2);
  }
  function emailValue(code2) {
    if ((code2 === 45 || asciiAlphanumeric(code2)) && size++ < 63) {
      const next = code2 === 45 ? emailValue : emailLabel;
      effects.consume(code2);
      return next;
    }
    return nok(code2);
  }
}
const blankLine = {
  partial: true,
  tokenize: tokenizeBlankLine
};
function tokenizeBlankLine(effects, ok2, nok) {
  return start;
  function start(code2) {
    return markdownSpace(code2) ? factorySpace(effects, after, "linePrefix")(code2) : after(code2);
  }
  function after(code2) {
    return code2 === null || markdownLineEnding(code2) ? ok2(code2) : nok(code2);
  }
}
const blockQuote = {
  continuation: {
    tokenize: tokenizeBlockQuoteContinuation
  },
  exit,
  name: "blockQuote",
  tokenize: tokenizeBlockQuoteStart
};
function tokenizeBlockQuoteStart(effects, ok2, nok) {
  const self2 = this;
  return start;
  function start(code2) {
    if (code2 === 62) {
      const state = self2.containerState;
      if (!state.open) {
        effects.enter("blockQuote", {
          _container: true
        });
        state.open = true;
      }
      effects.enter("blockQuotePrefix");
      effects.enter("blockQuoteMarker");
      effects.consume(code2);
      effects.exit("blockQuoteMarker");
      return after;
    }
    return nok(code2);
  }
  function after(code2) {
    if (markdownSpace(code2)) {
      effects.enter("blockQuotePrefixWhitespace");
      effects.consume(code2);
      effects.exit("blockQuotePrefixWhitespace");
      effects.exit("blockQuotePrefix");
      return ok2;
    }
    effects.exit("blockQuotePrefix");
    return ok2(code2);
  }
}
function tokenizeBlockQuoteContinuation(effects, ok2, nok) {
  const self2 = this;
  return contStart;
  function contStart(code2) {
    if (markdownSpace(code2)) {
      return factorySpace(effects, contBefore, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2);
    }
    return contBefore(code2);
  }
  function contBefore(code2) {
    return effects.attempt(blockQuote, ok2, nok)(code2);
  }
}
function exit(effects) {
  effects.exit("blockQuote");
}
const characterEscape = {
  name: "characterEscape",
  tokenize: tokenizeCharacterEscape
};
function tokenizeCharacterEscape(effects, ok2, nok) {
  return start;
  function start(code2) {
    effects.enter("characterEscape");
    effects.enter("escapeMarker");
    effects.consume(code2);
    effects.exit("escapeMarker");
    return inside;
  }
  function inside(code2) {
    if (asciiPunctuation(code2)) {
      effects.enter("characterEscapeValue");
      effects.consume(code2);
      effects.exit("characterEscapeValue");
      effects.exit("characterEscape");
      return ok2;
    }
    return nok(code2);
  }
}
const characterReference = {
  name: "characterReference",
  tokenize: tokenizeCharacterReference
};
function tokenizeCharacterReference(effects, ok2, nok) {
  const self2 = this;
  let size = 0;
  let max;
  let test;
  return start;
  function start(code2) {
    effects.enter("characterReference");
    effects.enter("characterReferenceMarker");
    effects.consume(code2);
    effects.exit("characterReferenceMarker");
    return open;
  }
  function open(code2) {
    if (code2 === 35) {
      effects.enter("characterReferenceMarkerNumeric");
      effects.consume(code2);
      effects.exit("characterReferenceMarkerNumeric");
      return numeric;
    }
    effects.enter("characterReferenceValue");
    max = 31;
    test = asciiAlphanumeric;
    return value(code2);
  }
  function numeric(code2) {
    if (code2 === 88 || code2 === 120) {
      effects.enter("characterReferenceMarkerHexadecimal");
      effects.consume(code2);
      effects.exit("characterReferenceMarkerHexadecimal");
      effects.enter("characterReferenceValue");
      max = 6;
      test = asciiHexDigit;
      return value;
    }
    effects.enter("characterReferenceValue");
    max = 7;
    test = asciiDigit;
    return value(code2);
  }
  function value(code2) {
    if (code2 === 59 && size) {
      const token = effects.exit("characterReferenceValue");
      if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self2.sliceSerialize(token))) {
        return nok(code2);
      }
      effects.enter("characterReferenceMarker");
      effects.consume(code2);
      effects.exit("characterReferenceMarker");
      effects.exit("characterReference");
      return ok2;
    }
    if (test(code2) && size++ < max) {
      effects.consume(code2);
      return value;
    }
    return nok(code2);
  }
}
const nonLazyContinuation = {
  partial: true,
  tokenize: tokenizeNonLazyContinuation
};
const codeFenced = {
  concrete: true,
  name: "codeFenced",
  tokenize: tokenizeCodeFenced
};
function tokenizeCodeFenced(effects, ok2, nok) {
  const self2 = this;
  const closeStart = {
    partial: true,
    tokenize: tokenizeCloseStart
  };
  let initialPrefix = 0;
  let sizeOpen = 0;
  let marker;
  return start;
  function start(code2) {
    return beforeSequenceOpen(code2);
  }
  function beforeSequenceOpen(code2) {
    const tail = self2.events[self2.events.length - 1];
    initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
    marker = code2;
    effects.enter("codeFenced");
    effects.enter("codeFencedFence");
    effects.enter("codeFencedFenceSequence");
    return sequenceOpen(code2);
  }
  function sequenceOpen(code2) {
    if (code2 === marker) {
      sizeOpen++;
      effects.consume(code2);
      return sequenceOpen;
    }
    if (sizeOpen < 3) {
      return nok(code2);
    }
    effects.exit("codeFencedFenceSequence");
    return markdownSpace(code2) ? factorySpace(effects, infoBefore, "whitespace")(code2) : infoBefore(code2);
  }
  function infoBefore(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("codeFencedFence");
      return self2.interrupt ? ok2(code2) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code2);
    }
    effects.enter("codeFencedFenceInfo");
    effects.enter("chunkString", {
      contentType: "string"
    });
    return info(code2);
  }
  function info(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceInfo");
      return infoBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceInfo");
      return factorySpace(effects, metaBefore, "whitespace")(code2);
    }
    if (code2 === 96 && code2 === marker) {
      return nok(code2);
    }
    effects.consume(code2);
    return info;
  }
  function metaBefore(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return infoBefore(code2);
    }
    effects.enter("codeFencedFenceMeta");
    effects.enter("chunkString", {
      contentType: "string"
    });
    return meta(code2);
  }
  function meta(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("chunkString");
      effects.exit("codeFencedFenceMeta");
      return infoBefore(code2);
    }
    if (code2 === 96 && code2 === marker) {
      return nok(code2);
    }
    effects.consume(code2);
    return meta;
  }
  function atNonLazyBreak(code2) {
    return effects.attempt(closeStart, after, contentBefore)(code2);
  }
  function contentBefore(code2) {
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return contentStart;
  }
  function contentStart(code2) {
    return initialPrefix > 0 && markdownSpace(code2) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code2) : beforeContentChunk(code2);
  }
  function beforeContentChunk(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code2);
    }
    effects.enter("codeFlowValue");
    return contentChunk(code2);
  }
  function contentChunk(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("codeFlowValue");
      return beforeContentChunk(code2);
    }
    effects.consume(code2);
    return contentChunk;
  }
  function after(code2) {
    effects.exit("codeFenced");
    return ok2(code2);
  }
  function tokenizeCloseStart(effects2, ok3, nok2) {
    let size = 0;
    return startBefore;
    function startBefore(code2) {
      effects2.enter("lineEnding");
      effects2.consume(code2);
      effects2.exit("lineEnding");
      return start2;
    }
    function start2(code2) {
      effects2.enter("codeFencedFence");
      return markdownSpace(code2) ? factorySpace(effects2, beforeSequenceClose, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2) : beforeSequenceClose(code2);
    }
    function beforeSequenceClose(code2) {
      if (code2 === marker) {
        effects2.enter("codeFencedFenceSequence");
        return sequenceClose(code2);
      }
      return nok2(code2);
    }
    function sequenceClose(code2) {
      if (code2 === marker) {
        size++;
        effects2.consume(code2);
        return sequenceClose;
      }
      if (size >= sizeOpen) {
        effects2.exit("codeFencedFenceSequence");
        return markdownSpace(code2) ? factorySpace(effects2, sequenceCloseAfter, "whitespace")(code2) : sequenceCloseAfter(code2);
      }
      return nok2(code2);
    }
    function sequenceCloseAfter(code2) {
      if (code2 === null || markdownLineEnding(code2)) {
        effects2.exit("codeFencedFence");
        return ok3(code2);
      }
      return nok2(code2);
    }
  }
}
function tokenizeNonLazyContinuation(effects, ok2, nok) {
  const self2 = this;
  return start;
  function start(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return lineStart;
  }
  function lineStart(code2) {
    return self2.parser.lazy[self2.now().line] ? nok(code2) : ok2(code2);
  }
}
const codeIndented = {
  name: "codeIndented",
  tokenize: tokenizeCodeIndented
};
const furtherStart = {
  partial: true,
  tokenize: tokenizeFurtherStart
};
function tokenizeCodeIndented(effects, ok2, nok) {
  const self2 = this;
  return start;
  function start(code2) {
    effects.enter("codeIndented");
    return factorySpace(effects, afterPrefix, "linePrefix", 4 + 1)(code2);
  }
  function afterPrefix(code2) {
    const tail = self2.events[self2.events.length - 1];
    return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? atBreak(code2) : nok(code2);
  }
  function atBreak(code2) {
    if (code2 === null) {
      return after(code2);
    }
    if (markdownLineEnding(code2)) {
      return effects.attempt(furtherStart, atBreak, after)(code2);
    }
    effects.enter("codeFlowValue");
    return inside(code2);
  }
  function inside(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("codeFlowValue");
      return atBreak(code2);
    }
    effects.consume(code2);
    return inside;
  }
  function after(code2) {
    effects.exit("codeIndented");
    return ok2(code2);
  }
}
function tokenizeFurtherStart(effects, ok2, nok) {
  const self2 = this;
  return furtherStart2;
  function furtherStart2(code2) {
    if (self2.parser.lazy[self2.now().line]) {
      return nok(code2);
    }
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return furtherStart2;
    }
    return factorySpace(effects, afterPrefix, "linePrefix", 4 + 1)(code2);
  }
  function afterPrefix(code2) {
    const tail = self2.events[self2.events.length - 1];
    return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? ok2(code2) : markdownLineEnding(code2) ? furtherStart2(code2) : nok(code2);
  }
}
const codeText = {
  name: "codeText",
  previous,
  resolve: resolveCodeText,
  tokenize: tokenizeCodeText
};
function resolveCodeText(events) {
  let tailExitIndex = events.length - 4;
  let headEnterIndex = 3;
  let index2;
  let enter;
  if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
    index2 = headEnterIndex;
    while (++index2 < tailExitIndex) {
      if (events[index2][1].type === "codeTextData") {
        events[headEnterIndex][1].type = "codeTextPadding";
        events[tailExitIndex][1].type = "codeTextPadding";
        headEnterIndex += 2;
        tailExitIndex -= 2;
        break;
      }
    }
  }
  index2 = headEnterIndex - 1;
  tailExitIndex++;
  while (++index2 <= tailExitIndex) {
    if (enter === void 0) {
      if (index2 !== tailExitIndex && events[index2][1].type !== "lineEnding") {
        enter = index2;
      }
    } else if (index2 === tailExitIndex || events[index2][1].type === "lineEnding") {
      events[enter][1].type = "codeTextData";
      if (index2 !== enter + 2) {
        events[enter][1].end = events[index2 - 1][1].end;
        events.splice(enter + 2, index2 - enter - 2);
        tailExitIndex -= index2 - enter - 2;
        index2 = enter + 2;
      }
      enter = void 0;
    }
  }
  return events;
}
function previous(code2) {
  return code2 !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function tokenizeCodeText(effects, ok2, nok) {
  let sizeOpen = 0;
  let size;
  let token;
  return start;
  function start(code2) {
    effects.enter("codeText");
    effects.enter("codeTextSequence");
    return sequenceOpen(code2);
  }
  function sequenceOpen(code2) {
    if (code2 === 96) {
      effects.consume(code2);
      sizeOpen++;
      return sequenceOpen;
    }
    effects.exit("codeTextSequence");
    return between(code2);
  }
  function between(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (code2 === 32) {
      effects.enter("space");
      effects.consume(code2);
      effects.exit("space");
      return between;
    }
    if (code2 === 96) {
      token = effects.enter("codeTextSequence");
      size = 0;
      return sequenceClose(code2);
    }
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return between;
    }
    effects.enter("codeTextData");
    return data(code2);
  }
  function data(code2) {
    if (code2 === null || code2 === 32 || code2 === 96 || markdownLineEnding(code2)) {
      effects.exit("codeTextData");
      return between(code2);
    }
    effects.consume(code2);
    return data;
  }
  function sequenceClose(code2) {
    if (code2 === 96) {
      effects.consume(code2);
      size++;
      return sequenceClose;
    }
    if (size === sizeOpen) {
      effects.exit("codeTextSequence");
      effects.exit("codeText");
      return ok2(code2);
    }
    token.type = "codeTextData";
    return data(code2);
  }
}
class SpliceBuffer {
  /**
   * @param {ReadonlyArray<T> | null | undefined} [initial]
   *   Initial items (optional).
   * @returns
   *   Splice buffer.
   */
  constructor(initial) {
    this.left = initial ? [...initial] : [];
    this.right = [];
  }
  /**
   * Array access;
   * does not move the cursor.
   *
   * @param {number} index
   *   Index.
   * @return {T}
   *   Item.
   */
  get(index2) {
    if (index2 < 0 || index2 >= this.left.length + this.right.length) {
      throw new RangeError("Cannot access index `" + index2 + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
    }
    if (index2 < this.left.length) return this.left[index2];
    return this.right[this.right.length - index2 + this.left.length - 1];
  }
  /**
   * The length of the splice buffer, one greater than the largest index in the
   * array.
   */
  get length() {
    return this.left.length + this.right.length;
  }
  /**
   * Remove and return `list[0]`;
   * moves the cursor to `0`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  shift() {
    this.setCursor(0);
    return this.right.pop();
  }
  /**
   * Slice the buffer to get an array;
   * does not move the cursor.
   *
   * @param {number} start
   *   Start.
   * @param {number | null | undefined} [end]
   *   End (optional).
   * @returns {Array<T>}
   *   Array of items.
   */
  slice(start, end) {
    const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
    if (stop < this.left.length) {
      return this.left.slice(start, stop);
    }
    if (start > this.left.length) {
      return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
    }
    return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
  }
  /**
   * Mimics the behavior of Array.prototype.splice() except for the change of
   * interface necessary to avoid segfaults when patching in very large arrays.
   *
   * This operation moves cursor is moved to `start` and results in the cursor
   * placed after any inserted items.
   *
   * @param {number} start
   *   Start;
   *   zero-based index at which to start changing the array;
   *   negative numbers count backwards from the end of the array and values
   *   that are out-of bounds are clamped to the appropriate end of the array.
   * @param {number | null | undefined} [deleteCount=0]
   *   Delete count (default: `0`);
   *   maximum number of elements to delete, starting from start.
   * @param {Array<T> | null | undefined} [items=[]]
   *   Items to include in place of the deleted items (default: `[]`).
   * @return {Array<T>}
   *   Any removed items.
   */
  splice(start, deleteCount, items) {
    const count = deleteCount || 0;
    this.setCursor(Math.trunc(start));
    const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
    if (items) chunkedPush(this.left, items);
    return removed.reverse();
  }
  /**
   * Remove and return the highest-numbered item in the array, so
   * `list[list.length - 1]`;
   * Moves the cursor to `length`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  pop() {
    this.setCursor(Number.POSITIVE_INFINITY);
    return this.left.pop();
  }
  /**
   * Inserts a single item to the high-numbered side of the array;
   * moves the cursor to `length`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  push(item) {
    this.setCursor(Number.POSITIVE_INFINITY);
    this.left.push(item);
  }
  /**
   * Inserts many items to the high-numbered side of the array.
   * Moves the cursor to `length`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  pushMany(items) {
    this.setCursor(Number.POSITIVE_INFINITY);
    chunkedPush(this.left, items);
  }
  /**
   * Inserts a single item to the low-numbered side of the array;
   * Moves the cursor to `0`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  unshift(item) {
    this.setCursor(0);
    this.right.push(item);
  }
  /**
   * Inserts many items to the low-numbered side of the array;
   * moves the cursor to `0`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  unshiftMany(items) {
    this.setCursor(0);
    chunkedPush(this.right, items.reverse());
  }
  /**
   * Move the cursor to a specific position in the array. Requires
   * time proportional to the distance moved.
   *
   * If `n < 0`, the cursor will end up at the beginning.
   * If `n > length`, the cursor will end up at the end.
   *
   * @param {number} n
   *   Position.
   * @return {undefined}
   *   Nothing.
   */
  setCursor(n) {
    if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
    if (n < this.left.length) {
      const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
      chunkedPush(this.right, removed.reverse());
    } else {
      const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
      chunkedPush(this.left, removed.reverse());
    }
  }
}
function chunkedPush(list2, right) {
  let chunkStart = 0;
  if (right.length < 1e4) {
    list2.push(...right);
  } else {
    while (chunkStart < right.length) {
      list2.push(...right.slice(chunkStart, chunkStart + 1e4));
      chunkStart += 1e4;
    }
  }
}
function subtokenize(eventsArray) {
  const jumps = {};
  let index2 = -1;
  let event;
  let lineIndex;
  let otherIndex;
  let otherEvent;
  let parameters;
  let subevents;
  let more;
  const events = new SpliceBuffer(eventsArray);
  while (++index2 < events.length) {
    while (index2 in jumps) {
      index2 = jumps[index2];
    }
    event = events.get(index2);
    if (index2 && event[1].type === "chunkFlow" && events.get(index2 - 1)[1].type === "listItemPrefix") {
      subevents = event[1]._tokenizer.events;
      otherIndex = 0;
      if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") {
        otherIndex += 2;
      }
      if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") {
        while (++otherIndex < subevents.length) {
          if (subevents[otherIndex][1].type === "content") {
            break;
          }
          if (subevents[otherIndex][1].type === "chunkText") {
            subevents[otherIndex][1]._isInFirstContentOfListItem = true;
            otherIndex++;
          }
        }
      }
    }
    if (event[0] === "enter") {
      if (event[1].contentType) {
        Object.assign(jumps, subcontent(events, index2));
        index2 = jumps[index2];
        more = true;
      }
    } else if (event[1]._container) {
      otherIndex = index2;
      lineIndex = void 0;
      while (otherIndex--) {
        otherEvent = events.get(otherIndex);
        if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
          if (otherEvent[0] === "enter") {
            if (lineIndex) {
              events.get(lineIndex)[1].type = "lineEndingBlank";
            }
            otherEvent[1].type = "lineEnding";
            lineIndex = otherIndex;
          }
        } else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") ;
        else {
          break;
        }
      }
      if (lineIndex) {
        event[1].end = {
          ...events.get(lineIndex)[1].start
        };
        parameters = events.slice(lineIndex, index2);
        parameters.unshift(event);
        events.splice(lineIndex, index2 - lineIndex + 1, parameters);
      }
    }
  }
  splice(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
  return !more;
}
function subcontent(events, eventIndex) {
  const token = events.get(eventIndex)[1];
  const context = events.get(eventIndex)[2];
  let startPosition = eventIndex - 1;
  const startPositions = [];
  let tokenizer = token._tokenizer;
  if (!tokenizer) {
    tokenizer = context.parser[token.contentType](token.start);
    if (token._contentTypeTextTrailing) {
      tokenizer._contentTypeTextTrailing = true;
    }
  }
  const childEvents = tokenizer.events;
  const jumps = [];
  const gaps = {};
  let stream;
  let previous2;
  let index2 = -1;
  let current = token;
  let adjust = 0;
  let start = 0;
  const breaks = [start];
  while (current) {
    while (events.get(++startPosition)[1] !== current) {
    }
    startPositions.push(startPosition);
    if (!current._tokenizer) {
      stream = context.sliceStream(current);
      if (!current.next) {
        stream.push(null);
      }
      if (previous2) {
        tokenizer.defineSkip(current.start);
      }
      if (current._isInFirstContentOfListItem) {
        tokenizer._gfmTasklistFirstContentOfListItem = true;
      }
      tokenizer.write(stream);
      if (current._isInFirstContentOfListItem) {
        tokenizer._gfmTasklistFirstContentOfListItem = void 0;
      }
    }
    previous2 = current;
    current = current.next;
  }
  current = token;
  while (++index2 < childEvents.length) {
    if (
      // Find a void token that includes a break.
      childEvents[index2][0] === "exit" && childEvents[index2 - 1][0] === "enter" && childEvents[index2][1].type === childEvents[index2 - 1][1].type && childEvents[index2][1].start.line !== childEvents[index2][1].end.line
    ) {
      start = index2 + 1;
      breaks.push(start);
      current._tokenizer = void 0;
      current.previous = void 0;
      current = current.next;
    }
  }
  tokenizer.events = [];
  if (current) {
    current._tokenizer = void 0;
    current.previous = void 0;
  } else {
    breaks.pop();
  }
  index2 = breaks.length;
  while (index2--) {
    const slice = childEvents.slice(breaks[index2], breaks[index2 + 1]);
    const start2 = startPositions.pop();
    jumps.push([start2, start2 + slice.length - 1]);
    events.splice(start2, 2, slice);
  }
  jumps.reverse();
  index2 = -1;
  while (++index2 < jumps.length) {
    gaps[adjust + jumps[index2][0]] = adjust + jumps[index2][1];
    adjust += jumps[index2][1] - jumps[index2][0] - 1;
  }
  return gaps;
}
const content = {
  resolve: resolveContent,
  tokenize: tokenizeContent
};
const continuationConstruct = {
  partial: true,
  tokenize: tokenizeContinuation
};
function resolveContent(events) {
  subtokenize(events);
  return events;
}
function tokenizeContent(effects, ok2) {
  let previous2;
  return chunkStart;
  function chunkStart(code2) {
    effects.enter("content");
    previous2 = effects.enter("chunkContent", {
      contentType: "content"
    });
    return chunkInside(code2);
  }
  function chunkInside(code2) {
    if (code2 === null) {
      return contentEnd(code2);
    }
    if (markdownLineEnding(code2)) {
      return effects.check(continuationConstruct, contentContinue, contentEnd)(code2);
    }
    effects.consume(code2);
    return chunkInside;
  }
  function contentEnd(code2) {
    effects.exit("chunkContent");
    effects.exit("content");
    return ok2(code2);
  }
  function contentContinue(code2) {
    effects.consume(code2);
    effects.exit("chunkContent");
    previous2.next = effects.enter("chunkContent", {
      contentType: "content",
      previous: previous2
    });
    previous2 = previous2.next;
    return chunkInside;
  }
}
function tokenizeContinuation(effects, ok2, nok) {
  const self2 = this;
  return startLookahead;
  function startLookahead(code2) {
    effects.exit("chunkContent");
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return factorySpace(effects, prefixed, "linePrefix");
  }
  function prefixed(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return nok(code2);
    }
    const tail = self2.events[self2.events.length - 1];
    if (!self2.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) {
      return ok2(code2);
    }
    return effects.interrupt(self2.parser.constructs.flow, nok, ok2)(code2);
  }
}
function factoryDestination(effects, ok2, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
  const limit = max || Number.POSITIVE_INFINITY;
  let balance = 0;
  return start;
  function start(code2) {
    if (code2 === 60) {
      effects.enter(type);
      effects.enter(literalType);
      effects.enter(literalMarkerType);
      effects.consume(code2);
      effects.exit(literalMarkerType);
      return enclosedBefore;
    }
    if (code2 === null || code2 === 32 || code2 === 41 || asciiControl(code2)) {
      return nok(code2);
    }
    effects.enter(type);
    effects.enter(rawType);
    effects.enter(stringType);
    effects.enter("chunkString", {
      contentType: "string"
    });
    return raw(code2);
  }
  function enclosedBefore(code2) {
    if (code2 === 62) {
      effects.enter(literalMarkerType);
      effects.consume(code2);
      effects.exit(literalMarkerType);
      effects.exit(literalType);
      effects.exit(type);
      return ok2;
    }
    effects.enter(stringType);
    effects.enter("chunkString", {
      contentType: "string"
    });
    return enclosed(code2);
  }
  function enclosed(code2) {
    if (code2 === 62) {
      effects.exit("chunkString");
      effects.exit(stringType);
      return enclosedBefore(code2);
    }
    if (code2 === null || code2 === 60 || markdownLineEnding(code2)) {
      return nok(code2);
    }
    effects.consume(code2);
    return code2 === 92 ? enclosedEscape : enclosed;
  }
  function enclosedEscape(code2) {
    if (code2 === 60 || code2 === 62 || code2 === 92) {
      effects.consume(code2);
      return enclosed;
    }
    return enclosed(code2);
  }
  function raw(code2) {
    if (!balance && (code2 === null || code2 === 41 || markdownLineEndingOrSpace(code2))) {
      effects.exit("chunkString");
      effects.exit(stringType);
      effects.exit(rawType);
      effects.exit(type);
      return ok2(code2);
    }
    if (balance < limit && code2 === 40) {
      effects.consume(code2);
      balance++;
      return raw;
    }
    if (code2 === 41) {
      effects.consume(code2);
      balance--;
      return raw;
    }
    if (code2 === null || code2 === 32 || code2 === 40 || asciiControl(code2)) {
      return nok(code2);
    }
    effects.consume(code2);
    return code2 === 92 ? rawEscape : raw;
  }
  function rawEscape(code2) {
    if (code2 === 40 || code2 === 41 || code2 === 92) {
      effects.consume(code2);
      return raw;
    }
    return raw(code2);
  }
}
function factoryLabel(effects, ok2, nok, type, markerType, stringType) {
  const self2 = this;
  let size = 0;
  let seen;
  return start;
  function start(code2) {
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code2);
    effects.exit(markerType);
    effects.enter(stringType);
    return atBreak;
  }
  function atBreak(code2) {
    if (size > 999 || code2 === null || code2 === 91 || code2 === 93 && !seen || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    code2 === 94 && !size && "_hiddenFootnoteSupport" in self2.parser.constructs) {
      return nok(code2);
    }
    if (code2 === 93) {
      effects.exit(stringType);
      effects.enter(markerType);
      effects.consume(code2);
      effects.exit(markerType);
      effects.exit(type);
      return ok2;
    }
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return atBreak;
    }
    effects.enter("chunkString", {
      contentType: "string"
    });
    return labelInside(code2);
  }
  function labelInside(code2) {
    if (code2 === null || code2 === 91 || code2 === 93 || markdownLineEnding(code2) || size++ > 999) {
      effects.exit("chunkString");
      return atBreak(code2);
    }
    effects.consume(code2);
    if (!seen) seen = !markdownSpace(code2);
    return code2 === 92 ? labelEscape : labelInside;
  }
  function labelEscape(code2) {
    if (code2 === 91 || code2 === 92 || code2 === 93) {
      effects.consume(code2);
      size++;
      return labelInside;
    }
    return labelInside(code2);
  }
}
function factoryTitle(effects, ok2, nok, type, markerType, stringType) {
  let marker;
  return start;
  function start(code2) {
    if (code2 === 34 || code2 === 39 || code2 === 40) {
      effects.enter(type);
      effects.enter(markerType);
      effects.consume(code2);
      effects.exit(markerType);
      marker = code2 === 40 ? 41 : code2;
      return begin;
    }
    return nok(code2);
  }
  function begin(code2) {
    if (code2 === marker) {
      effects.enter(markerType);
      effects.consume(code2);
      effects.exit(markerType);
      effects.exit(type);
      return ok2;
    }
    effects.enter(stringType);
    return atBreak(code2);
  }
  function atBreak(code2) {
    if (code2 === marker) {
      effects.exit(stringType);
      return begin(marker);
    }
    if (code2 === null) {
      return nok(code2);
    }
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return factorySpace(effects, atBreak, "linePrefix");
    }
    effects.enter("chunkString", {
      contentType: "string"
    });
    return inside(code2);
  }
  function inside(code2) {
    if (code2 === marker || code2 === null || markdownLineEnding(code2)) {
      effects.exit("chunkString");
      return atBreak(code2);
    }
    effects.consume(code2);
    return code2 === 92 ? escape : inside;
  }
  function escape(code2) {
    if (code2 === marker || code2 === 92) {
      effects.consume(code2);
      return inside;
    }
    return inside(code2);
  }
}
function factoryWhitespace(effects, ok2) {
  let seen;
  return start;
  function start(code2) {
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      seen = true;
      return start;
    }
    if (markdownSpace(code2)) {
      return factorySpace(effects, start, seen ? "linePrefix" : "lineSuffix")(code2);
    }
    return ok2(code2);
  }
}
const definition = {
  name: "definition",
  tokenize: tokenizeDefinition
};
const titleBefore = {
  partial: true,
  tokenize: tokenizeTitleBefore
};
function tokenizeDefinition(effects, ok2, nok) {
  const self2 = this;
  let identifier;
  return start;
  function start(code2) {
    effects.enter("definition");
    return before(code2);
  }
  function before(code2) {
    return factoryLabel.call(
      self2,
      effects,
      labelAfter,
      // Note: we don’t need to reset the way `markdown-rs` does.
      nok,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(code2);
  }
  function labelAfter(code2) {
    identifier = normalizeIdentifier(self2.sliceSerialize(self2.events[self2.events.length - 1][1]).slice(1, -1));
    if (code2 === 58) {
      effects.enter("definitionMarker");
      effects.consume(code2);
      effects.exit("definitionMarker");
      return markerAfter;
    }
    return nok(code2);
  }
  function markerAfter(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, destinationBefore)(code2) : destinationBefore(code2);
  }
  function destinationBefore(code2) {
    return factoryDestination(
      effects,
      destinationAfter,
      // Note: we don’t need to reset the way `markdown-rs` does.
      nok,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString"
    )(code2);
  }
  function destinationAfter(code2) {
    return effects.attempt(titleBefore, after, after)(code2);
  }
  function after(code2) {
    return markdownSpace(code2) ? factorySpace(effects, afterWhitespace, "whitespace")(code2) : afterWhitespace(code2);
  }
  function afterWhitespace(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("definition");
      self2.parser.defined.push(identifier);
      return ok2(code2);
    }
    return nok(code2);
  }
}
function tokenizeTitleBefore(effects, ok2, nok) {
  return titleBefore2;
  function titleBefore2(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, beforeMarker)(code2) : nok(code2);
  }
  function beforeMarker(code2) {
    return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code2);
  }
  function titleAfter(code2) {
    return markdownSpace(code2) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code2) : titleAfterOptionalWhitespace(code2);
  }
  function titleAfterOptionalWhitespace(code2) {
    return code2 === null || markdownLineEnding(code2) ? ok2(code2) : nok(code2);
  }
}
const hardBreakEscape = {
  name: "hardBreakEscape",
  tokenize: tokenizeHardBreakEscape
};
function tokenizeHardBreakEscape(effects, ok2, nok) {
  return start;
  function start(code2) {
    effects.enter("hardBreakEscape");
    effects.consume(code2);
    return after;
  }
  function after(code2) {
    if (markdownLineEnding(code2)) {
      effects.exit("hardBreakEscape");
      return ok2(code2);
    }
    return nok(code2);
  }
}
const headingAtx = {
  name: "headingAtx",
  resolve: resolveHeadingAtx,
  tokenize: tokenizeHeadingAtx
};
function resolveHeadingAtx(events, context) {
  let contentEnd = events.length - 2;
  let contentStart = 3;
  let content2;
  let text2;
  if (events[contentStart][1].type === "whitespace") {
    contentStart += 2;
  }
  if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") {
    contentEnd -= 2;
  }
  if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) {
    contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
  }
  if (contentEnd > contentStart) {
    content2 = {
      type: "atxHeadingText",
      start: events[contentStart][1].start,
      end: events[contentEnd][1].end
    };
    text2 = {
      type: "chunkText",
      start: events[contentStart][1].start,
      end: events[contentEnd][1].end,
      contentType: "text"
    };
    splice(events, contentStart, contentEnd - contentStart + 1, [["enter", content2, context], ["enter", text2, context], ["exit", text2, context], ["exit", content2, context]]);
  }
  return events;
}
function tokenizeHeadingAtx(effects, ok2, nok) {
  let size = 0;
  return start;
  function start(code2) {
    effects.enter("atxHeading");
    return before(code2);
  }
  function before(code2) {
    effects.enter("atxHeadingSequence");
    return sequenceOpen(code2);
  }
  function sequenceOpen(code2) {
    if (code2 === 35 && size++ < 6) {
      effects.consume(code2);
      return sequenceOpen;
    }
    if (code2 === null || markdownLineEndingOrSpace(code2)) {
      effects.exit("atxHeadingSequence");
      return atBreak(code2);
    }
    return nok(code2);
  }
  function atBreak(code2) {
    if (code2 === 35) {
      effects.enter("atxHeadingSequence");
      return sequenceFurther(code2);
    }
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("atxHeading");
      return ok2(code2);
    }
    if (markdownSpace(code2)) {
      return factorySpace(effects, atBreak, "whitespace")(code2);
    }
    effects.enter("atxHeadingText");
    return data(code2);
  }
  function sequenceFurther(code2) {
    if (code2 === 35) {
      effects.consume(code2);
      return sequenceFurther;
    }
    effects.exit("atxHeadingSequence");
    return atBreak(code2);
  }
  function data(code2) {
    if (code2 === null || code2 === 35 || markdownLineEndingOrSpace(code2)) {
      effects.exit("atxHeadingText");
      return atBreak(code2);
    }
    effects.consume(code2);
    return data;
  }
}
const htmlBlockNames = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
];
const htmlRawNames = ["pre", "script", "style", "textarea"];
const htmlFlow = {
  concrete: true,
  name: "htmlFlow",
  resolveTo: resolveToHtmlFlow,
  tokenize: tokenizeHtmlFlow
};
const blankLineBefore = {
  partial: true,
  tokenize: tokenizeBlankLineBefore
};
const nonLazyContinuationStart = {
  partial: true,
  tokenize: tokenizeNonLazyContinuationStart
};
function resolveToHtmlFlow(events) {
  let index2 = events.length;
  while (index2--) {
    if (events[index2][0] === "enter" && events[index2][1].type === "htmlFlow") {
      break;
    }
  }
  if (index2 > 1 && events[index2 - 2][1].type === "linePrefix") {
    events[index2][1].start = events[index2 - 2][1].start;
    events[index2 + 1][1].start = events[index2 - 2][1].start;
    events.splice(index2 - 2, 2);
  }
  return events;
}
function tokenizeHtmlFlow(effects, ok2, nok) {
  const self2 = this;
  let marker;
  let closingTag;
  let buffer;
  let index2;
  let markerB;
  return start;
  function start(code2) {
    return before(code2);
  }
  function before(code2) {
    effects.enter("htmlFlow");
    effects.enter("htmlFlowData");
    effects.consume(code2);
    return open;
  }
  function open(code2) {
    if (code2 === 33) {
      effects.consume(code2);
      return declarationOpen;
    }
    if (code2 === 47) {
      effects.consume(code2);
      closingTag = true;
      return tagCloseStart;
    }
    if (code2 === 63) {
      effects.consume(code2);
      marker = 3;
      return self2.interrupt ? ok2 : continuationDeclarationInside;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      buffer = String.fromCharCode(code2);
      return tagName;
    }
    return nok(code2);
  }
  function declarationOpen(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      marker = 2;
      return commentOpenInside;
    }
    if (code2 === 91) {
      effects.consume(code2);
      marker = 5;
      index2 = 0;
      return cdataOpenInside;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      marker = 4;
      return self2.interrupt ? ok2 : continuationDeclarationInside;
    }
    return nok(code2);
  }
  function commentOpenInside(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return self2.interrupt ? ok2 : continuationDeclarationInside;
    }
    return nok(code2);
  }
  function cdataOpenInside(code2) {
    const value = "CDATA[";
    if (code2 === value.charCodeAt(index2++)) {
      effects.consume(code2);
      if (index2 === value.length) {
        return self2.interrupt ? ok2 : continuation;
      }
      return cdataOpenInside;
    }
    return nok(code2);
  }
  function tagCloseStart(code2) {
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      buffer = String.fromCharCode(code2);
      return tagName;
    }
    return nok(code2);
  }
  function tagName(code2) {
    if (code2 === null || code2 === 47 || code2 === 62 || markdownLineEndingOrSpace(code2)) {
      const slash = code2 === 47;
      const name2 = buffer.toLowerCase();
      if (!slash && !closingTag && htmlRawNames.includes(name2)) {
        marker = 1;
        return self2.interrupt ? ok2(code2) : continuation(code2);
      }
      if (htmlBlockNames.includes(buffer.toLowerCase())) {
        marker = 6;
        if (slash) {
          effects.consume(code2);
          return basicSelfClosing;
        }
        return self2.interrupt ? ok2(code2) : continuation(code2);
      }
      marker = 7;
      return self2.interrupt && !self2.parser.lazy[self2.now().line] ? nok(code2) : closingTag ? completeClosingTagAfter(code2) : completeAttributeNameBefore(code2);
    }
    if (code2 === 45 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      buffer += String.fromCharCode(code2);
      return tagName;
    }
    return nok(code2);
  }
  function basicSelfClosing(code2) {
    if (code2 === 62) {
      effects.consume(code2);
      return self2.interrupt ? ok2 : continuation;
    }
    return nok(code2);
  }
  function completeClosingTagAfter(code2) {
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeClosingTagAfter;
    }
    return completeEnd(code2);
  }
  function completeAttributeNameBefore(code2) {
    if (code2 === 47) {
      effects.consume(code2);
      return completeEnd;
    }
    if (code2 === 58 || code2 === 95 || asciiAlpha(code2)) {
      effects.consume(code2);
      return completeAttributeName;
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeAttributeNameBefore;
    }
    return completeEnd(code2);
  }
  function completeAttributeName(code2) {
    if (code2 === 45 || code2 === 46 || code2 === 58 || code2 === 95 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      return completeAttributeName;
    }
    return completeAttributeNameAfter(code2);
  }
  function completeAttributeNameAfter(code2) {
    if (code2 === 61) {
      effects.consume(code2);
      return completeAttributeValueBefore;
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeAttributeNameAfter;
    }
    return completeAttributeNameBefore(code2);
  }
  function completeAttributeValueBefore(code2) {
    if (code2 === null || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96) {
      return nok(code2);
    }
    if (code2 === 34 || code2 === 39) {
      effects.consume(code2);
      markerB = code2;
      return completeAttributeValueQuoted;
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeAttributeValueBefore;
    }
    return completeAttributeValueUnquoted(code2);
  }
  function completeAttributeValueQuoted(code2) {
    if (code2 === markerB) {
      effects.consume(code2);
      markerB = null;
      return completeAttributeValueQuotedAfter;
    }
    if (code2 === null || markdownLineEnding(code2)) {
      return nok(code2);
    }
    effects.consume(code2);
    return completeAttributeValueQuoted;
  }
  function completeAttributeValueUnquoted(code2) {
    if (code2 === null || code2 === 34 || code2 === 39 || code2 === 47 || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96 || markdownLineEndingOrSpace(code2)) {
      return completeAttributeNameAfter(code2);
    }
    effects.consume(code2);
    return completeAttributeValueUnquoted;
  }
  function completeAttributeValueQuotedAfter(code2) {
    if (code2 === 47 || code2 === 62 || markdownSpace(code2)) {
      return completeAttributeNameBefore(code2);
    }
    return nok(code2);
  }
  function completeEnd(code2) {
    if (code2 === 62) {
      effects.consume(code2);
      return completeAfter;
    }
    return nok(code2);
  }
  function completeAfter(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return continuation(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return completeAfter;
    }
    return nok(code2);
  }
  function continuation(code2) {
    if (code2 === 45 && marker === 2) {
      effects.consume(code2);
      return continuationCommentInside;
    }
    if (code2 === 60 && marker === 1) {
      effects.consume(code2);
      return continuationRawTagOpen;
    }
    if (code2 === 62 && marker === 4) {
      effects.consume(code2);
      return continuationClose;
    }
    if (code2 === 63 && marker === 3) {
      effects.consume(code2);
      return continuationDeclarationInside;
    }
    if (code2 === 93 && marker === 5) {
      effects.consume(code2);
      return continuationCdataInside;
    }
    if (markdownLineEnding(code2) && (marker === 6 || marker === 7)) {
      effects.exit("htmlFlowData");
      return effects.check(blankLineBefore, continuationAfter, continuationStart)(code2);
    }
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("htmlFlowData");
      return continuationStart(code2);
    }
    effects.consume(code2);
    return continuation;
  }
  function continuationStart(code2) {
    return effects.check(nonLazyContinuationStart, continuationStartNonLazy, continuationAfter)(code2);
  }
  function continuationStartNonLazy(code2) {
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return continuationBefore;
  }
  function continuationBefore(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      return continuationStart(code2);
    }
    effects.enter("htmlFlowData");
    return continuation(code2);
  }
  function continuationCommentInside(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return continuationDeclarationInside;
    }
    return continuation(code2);
  }
  function continuationRawTagOpen(code2) {
    if (code2 === 47) {
      effects.consume(code2);
      buffer = "";
      return continuationRawEndTag;
    }
    return continuation(code2);
  }
  function continuationRawEndTag(code2) {
    if (code2 === 62) {
      const name2 = buffer.toLowerCase();
      if (htmlRawNames.includes(name2)) {
        effects.consume(code2);
        return continuationClose;
      }
      return continuation(code2);
    }
    if (asciiAlpha(code2) && buffer.length < 8) {
      effects.consume(code2);
      buffer += String.fromCharCode(code2);
      return continuationRawEndTag;
    }
    return continuation(code2);
  }
  function continuationCdataInside(code2) {
    if (code2 === 93) {
      effects.consume(code2);
      return continuationDeclarationInside;
    }
    return continuation(code2);
  }
  function continuationDeclarationInside(code2) {
    if (code2 === 62) {
      effects.consume(code2);
      return continuationClose;
    }
    if (code2 === 45 && marker === 2) {
      effects.consume(code2);
      return continuationDeclarationInside;
    }
    return continuation(code2);
  }
  function continuationClose(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("htmlFlowData");
      return continuationAfter(code2);
    }
    effects.consume(code2);
    return continuationClose;
  }
  function continuationAfter(code2) {
    effects.exit("htmlFlow");
    return ok2(code2);
  }
}
function tokenizeNonLazyContinuationStart(effects, ok2, nok) {
  const self2 = this;
  return start;
  function start(code2) {
    if (markdownLineEnding(code2)) {
      effects.enter("lineEnding");
      effects.consume(code2);
      effects.exit("lineEnding");
      return after;
    }
    return nok(code2);
  }
  function after(code2) {
    return self2.parser.lazy[self2.now().line] ? nok(code2) : ok2(code2);
  }
}
function tokenizeBlankLineBefore(effects, ok2, nok) {
  return start;
  function start(code2) {
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return effects.attempt(blankLine, ok2, nok);
  }
}
const htmlText = {
  name: "htmlText",
  tokenize: tokenizeHtmlText
};
function tokenizeHtmlText(effects, ok2, nok) {
  const self2 = this;
  let marker;
  let index2;
  let returnState;
  return start;
  function start(code2) {
    effects.enter("htmlText");
    effects.enter("htmlTextData");
    effects.consume(code2);
    return open;
  }
  function open(code2) {
    if (code2 === 33) {
      effects.consume(code2);
      return declarationOpen;
    }
    if (code2 === 47) {
      effects.consume(code2);
      return tagCloseStart;
    }
    if (code2 === 63) {
      effects.consume(code2);
      return instruction;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return tagOpen;
    }
    return nok(code2);
  }
  function declarationOpen(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return commentOpenInside;
    }
    if (code2 === 91) {
      effects.consume(code2);
      index2 = 0;
      return cdataOpenInside;
    }
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return declaration;
    }
    return nok(code2);
  }
  function commentOpenInside(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return commentEnd;
    }
    return nok(code2);
  }
  function comment(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (code2 === 45) {
      effects.consume(code2);
      return commentClose;
    }
    if (markdownLineEnding(code2)) {
      returnState = comment;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return comment;
  }
  function commentClose(code2) {
    if (code2 === 45) {
      effects.consume(code2);
      return commentEnd;
    }
    return comment(code2);
  }
  function commentEnd(code2) {
    return code2 === 62 ? end(code2) : code2 === 45 ? commentClose(code2) : comment(code2);
  }
  function cdataOpenInside(code2) {
    const value = "CDATA[";
    if (code2 === value.charCodeAt(index2++)) {
      effects.consume(code2);
      return index2 === value.length ? cdata : cdataOpenInside;
    }
    return nok(code2);
  }
  function cdata(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (code2 === 93) {
      effects.consume(code2);
      return cdataClose;
    }
    if (markdownLineEnding(code2)) {
      returnState = cdata;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return cdata;
  }
  function cdataClose(code2) {
    if (code2 === 93) {
      effects.consume(code2);
      return cdataEnd;
    }
    return cdata(code2);
  }
  function cdataEnd(code2) {
    if (code2 === 62) {
      return end(code2);
    }
    if (code2 === 93) {
      effects.consume(code2);
      return cdataEnd;
    }
    return cdata(code2);
  }
  function declaration(code2) {
    if (code2 === null || code2 === 62) {
      return end(code2);
    }
    if (markdownLineEnding(code2)) {
      returnState = declaration;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return declaration;
  }
  function instruction(code2) {
    if (code2 === null) {
      return nok(code2);
    }
    if (code2 === 63) {
      effects.consume(code2);
      return instructionClose;
    }
    if (markdownLineEnding(code2)) {
      returnState = instruction;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return instruction;
  }
  function instructionClose(code2) {
    return code2 === 62 ? end(code2) : instruction(code2);
  }
  function tagCloseStart(code2) {
    if (asciiAlpha(code2)) {
      effects.consume(code2);
      return tagClose;
    }
    return nok(code2);
  }
  function tagClose(code2) {
    if (code2 === 45 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      return tagClose;
    }
    return tagCloseBetween(code2);
  }
  function tagCloseBetween(code2) {
    if (markdownLineEnding(code2)) {
      returnState = tagCloseBetween;
      return lineEndingBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return tagCloseBetween;
    }
    return end(code2);
  }
  function tagOpen(code2) {
    if (code2 === 45 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      return tagOpen;
    }
    if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace(code2)) {
      return tagOpenBetween(code2);
    }
    return nok(code2);
  }
  function tagOpenBetween(code2) {
    if (code2 === 47) {
      effects.consume(code2);
      return end;
    }
    if (code2 === 58 || code2 === 95 || asciiAlpha(code2)) {
      effects.consume(code2);
      return tagOpenAttributeName;
    }
    if (markdownLineEnding(code2)) {
      returnState = tagOpenBetween;
      return lineEndingBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return tagOpenBetween;
    }
    return end(code2);
  }
  function tagOpenAttributeName(code2) {
    if (code2 === 45 || code2 === 46 || code2 === 58 || code2 === 95 || asciiAlphanumeric(code2)) {
      effects.consume(code2);
      return tagOpenAttributeName;
    }
    return tagOpenAttributeNameAfter(code2);
  }
  function tagOpenAttributeNameAfter(code2) {
    if (code2 === 61) {
      effects.consume(code2);
      return tagOpenAttributeValueBefore;
    }
    if (markdownLineEnding(code2)) {
      returnState = tagOpenAttributeNameAfter;
      return lineEndingBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return tagOpenAttributeNameAfter;
    }
    return tagOpenBetween(code2);
  }
  function tagOpenAttributeValueBefore(code2) {
    if (code2 === null || code2 === 60 || code2 === 61 || code2 === 62 || code2 === 96) {
      return nok(code2);
    }
    if (code2 === 34 || code2 === 39) {
      effects.consume(code2);
      marker = code2;
      return tagOpenAttributeValueQuoted;
    }
    if (markdownLineEnding(code2)) {
      returnState = tagOpenAttributeValueBefore;
      return lineEndingBefore(code2);
    }
    if (markdownSpace(code2)) {
      effects.consume(code2);
      return tagOpenAttributeValueBefore;
    }
    effects.consume(code2);
    return tagOpenAttributeValueUnquoted;
  }
  function tagOpenAttributeValueQuoted(code2) {
    if (code2 === marker) {
      effects.consume(code2);
      marker = void 0;
      return tagOpenAttributeValueQuotedAfter;
    }
    if (code2 === null) {
      return nok(code2);
    }
    if (markdownLineEnding(code2)) {
      returnState = tagOpenAttributeValueQuoted;
      return lineEndingBefore(code2);
    }
    effects.consume(code2);
    return tagOpenAttributeValueQuoted;
  }
  function tagOpenAttributeValueUnquoted(code2) {
    if (code2 === null || code2 === 34 || code2 === 39 || code2 === 60 || code2 === 61 || code2 === 96) {
      return nok(code2);
    }
    if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace(code2)) {
      return tagOpenBetween(code2);
    }
    effects.consume(code2);
    return tagOpenAttributeValueUnquoted;
  }
  function tagOpenAttributeValueQuotedAfter(code2) {
    if (code2 === 47 || code2 === 62 || markdownLineEndingOrSpace(code2)) {
      return tagOpenBetween(code2);
    }
    return nok(code2);
  }
  function end(code2) {
    if (code2 === 62) {
      effects.consume(code2);
      effects.exit("htmlTextData");
      effects.exit("htmlText");
      return ok2;
    }
    return nok(code2);
  }
  function lineEndingBefore(code2) {
    effects.exit("htmlTextData");
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return lineEndingAfter;
  }
  function lineEndingAfter(code2) {
    return markdownSpace(code2) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2) : lineEndingAfterPrefix(code2);
  }
  function lineEndingAfterPrefix(code2) {
    effects.enter("htmlTextData");
    return returnState(code2);
  }
}
const labelEnd = {
  name: "labelEnd",
  resolveAll: resolveAllLabelEnd,
  resolveTo: resolveToLabelEnd,
  tokenize: tokenizeLabelEnd
};
const resourceConstruct = {
  tokenize: tokenizeResource
};
const referenceFullConstruct = {
  tokenize: tokenizeReferenceFull
};
const referenceCollapsedConstruct = {
  tokenize: tokenizeReferenceCollapsed
};
function resolveAllLabelEnd(events) {
  let index2 = -1;
  const newEvents = [];
  while (++index2 < events.length) {
    const token = events[index2][1];
    newEvents.push(events[index2]);
    if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
      const offset = token.type === "labelImage" ? 4 : 2;
      token.type = "data";
      index2 += offset;
    }
  }
  if (events.length !== newEvents.length) {
    splice(events, 0, events.length, newEvents);
  }
  return events;
}
function resolveToLabelEnd(events, context) {
  let index2 = events.length;
  let offset = 0;
  let token;
  let open;
  let close;
  let media;
  while (index2--) {
    token = events[index2][1];
    if (open) {
      if (token.type === "link" || token.type === "labelLink" && token._inactive) {
        break;
      }
      if (events[index2][0] === "enter" && token.type === "labelLink") {
        token._inactive = true;
      }
    } else if (close) {
      if (events[index2][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
        open = index2;
        if (token.type !== "labelLink") {
          offset = 2;
          break;
        }
      }
    } else if (token.type === "labelEnd") {
      close = index2;
    }
  }
  const group = {
    type: events[open][1].type === "labelLink" ? "link" : "image",
    start: {
      ...events[open][1].start
    },
    end: {
      ...events[events.length - 1][1].end
    }
  };
  const label = {
    type: "label",
    start: {
      ...events[open][1].start
    },
    end: {
      ...events[close][1].end
    }
  };
  const text2 = {
    type: "labelText",
    start: {
      ...events[open + offset + 2][1].end
    },
    end: {
      ...events[close - 2][1].start
    }
  };
  media = [["enter", group, context], ["enter", label, context]];
  media = push(media, events.slice(open + 1, open + offset + 3));
  media = push(media, [["enter", text2, context]]);
  media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
  media = push(media, [["exit", text2, context], events[close - 2], events[close - 1], ["exit", label, context]]);
  media = push(media, events.slice(close + 1));
  media = push(media, [["exit", group, context]]);
  splice(events, open, events.length, media);
  return events;
}
function tokenizeLabelEnd(effects, ok2, nok) {
  const self2 = this;
  let index2 = self2.events.length;
  let labelStart;
  let defined;
  while (index2--) {
    if ((self2.events[index2][1].type === "labelImage" || self2.events[index2][1].type === "labelLink") && !self2.events[index2][1]._balanced) {
      labelStart = self2.events[index2][1];
      break;
    }
  }
  return start;
  function start(code2) {
    if (!labelStart) {
      return nok(code2);
    }
    if (labelStart._inactive) {
      return labelEndNok(code2);
    }
    defined = self2.parser.defined.includes(normalizeIdentifier(self2.sliceSerialize({
      start: labelStart.end,
      end: self2.now()
    })));
    effects.enter("labelEnd");
    effects.enter("labelMarker");
    effects.consume(code2);
    effects.exit("labelMarker");
    effects.exit("labelEnd");
    return after;
  }
  function after(code2) {
    if (code2 === 40) {
      return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code2);
    }
    if (code2 === 91) {
      return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code2);
    }
    return defined ? labelEndOk(code2) : labelEndNok(code2);
  }
  function referenceNotFull(code2) {
    return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code2);
  }
  function labelEndOk(code2) {
    return ok2(code2);
  }
  function labelEndNok(code2) {
    labelStart._balanced = true;
    return nok(code2);
  }
}
function tokenizeResource(effects, ok2, nok) {
  return resourceStart;
  function resourceStart(code2) {
    effects.enter("resource");
    effects.enter("resourceMarker");
    effects.consume(code2);
    effects.exit("resourceMarker");
    return resourceBefore;
  }
  function resourceBefore(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, resourceOpen)(code2) : resourceOpen(code2);
  }
  function resourceOpen(code2) {
    if (code2 === 41) {
      return resourceEnd(code2);
    }
    return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code2);
  }
  function resourceDestinationAfter(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, resourceBetween)(code2) : resourceEnd(code2);
  }
  function resourceDestinationMissing(code2) {
    return nok(code2);
  }
  function resourceBetween(code2) {
    if (code2 === 34 || code2 === 39 || code2 === 40) {
      return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code2);
    }
    return resourceEnd(code2);
  }
  function resourceTitleAfter(code2) {
    return markdownLineEndingOrSpace(code2) ? factoryWhitespace(effects, resourceEnd)(code2) : resourceEnd(code2);
  }
  function resourceEnd(code2) {
    if (code2 === 41) {
      effects.enter("resourceMarker");
      effects.consume(code2);
      effects.exit("resourceMarker");
      effects.exit("resource");
      return ok2;
    }
    return nok(code2);
  }
}
function tokenizeReferenceFull(effects, ok2, nok) {
  const self2 = this;
  return referenceFull;
  function referenceFull(code2) {
    return factoryLabel.call(self2, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code2);
  }
  function referenceFullAfter(code2) {
    return self2.parser.defined.includes(normalizeIdentifier(self2.sliceSerialize(self2.events[self2.events.length - 1][1]).slice(1, -1))) ? ok2(code2) : nok(code2);
  }
  function referenceFullMissing(code2) {
    return nok(code2);
  }
}
function tokenizeReferenceCollapsed(effects, ok2, nok) {
  return referenceCollapsedStart;
  function referenceCollapsedStart(code2) {
    effects.enter("reference");
    effects.enter("referenceMarker");
    effects.consume(code2);
    effects.exit("referenceMarker");
    return referenceCollapsedOpen;
  }
  function referenceCollapsedOpen(code2) {
    if (code2 === 93) {
      effects.enter("referenceMarker");
      effects.consume(code2);
      effects.exit("referenceMarker");
      effects.exit("reference");
      return ok2;
    }
    return nok(code2);
  }
}
const labelStartImage = {
  name: "labelStartImage",
  resolveAll: labelEnd.resolveAll,
  tokenize: tokenizeLabelStartImage
};
function tokenizeLabelStartImage(effects, ok2, nok) {
  const self2 = this;
  return start;
  function start(code2) {
    effects.enter("labelImage");
    effects.enter("labelImageMarker");
    effects.consume(code2);
    effects.exit("labelImageMarker");
    return open;
  }
  function open(code2) {
    if (code2 === 91) {
      effects.enter("labelMarker");
      effects.consume(code2);
      effects.exit("labelMarker");
      effects.exit("labelImage");
      return after;
    }
    return nok(code2);
  }
  function after(code2) {
    return code2 === 94 && "_hiddenFootnoteSupport" in self2.parser.constructs ? nok(code2) : ok2(code2);
  }
}
const labelStartLink = {
  name: "labelStartLink",
  resolveAll: labelEnd.resolveAll,
  tokenize: tokenizeLabelStartLink
};
function tokenizeLabelStartLink(effects, ok2, nok) {
  const self2 = this;
  return start;
  function start(code2) {
    effects.enter("labelLink");
    effects.enter("labelMarker");
    effects.consume(code2);
    effects.exit("labelMarker");
    effects.exit("labelLink");
    return after;
  }
  function after(code2) {
    return code2 === 94 && "_hiddenFootnoteSupport" in self2.parser.constructs ? nok(code2) : ok2(code2);
  }
}
const lineEnding = {
  name: "lineEnding",
  tokenize: tokenizeLineEnding
};
function tokenizeLineEnding(effects, ok2) {
  return start;
  function start(code2) {
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    return factorySpace(effects, ok2, "linePrefix");
  }
}
const thematicBreak$1 = {
  name: "thematicBreak",
  tokenize: tokenizeThematicBreak
};
function tokenizeThematicBreak(effects, ok2, nok) {
  let size = 0;
  let marker;
  return start;
  function start(code2) {
    effects.enter("thematicBreak");
    return before(code2);
  }
  function before(code2) {
    marker = code2;
    return atBreak(code2);
  }
  function atBreak(code2) {
    if (code2 === marker) {
      effects.enter("thematicBreakSequence");
      return sequence(code2);
    }
    if (size >= 3 && (code2 === null || markdownLineEnding(code2))) {
      effects.exit("thematicBreak");
      return ok2(code2);
    }
    return nok(code2);
  }
  function sequence(code2) {
    if (code2 === marker) {
      effects.consume(code2);
      size++;
      return sequence;
    }
    effects.exit("thematicBreakSequence");
    return markdownSpace(code2) ? factorySpace(effects, atBreak, "whitespace")(code2) : atBreak(code2);
  }
}
const list$1 = {
  continuation: {
    tokenize: tokenizeListContinuation
  },
  exit: tokenizeListEnd,
  name: "list",
  tokenize: tokenizeListStart
};
const listItemPrefixWhitespaceConstruct = {
  partial: true,
  tokenize: tokenizeListItemPrefixWhitespace
};
const indentConstruct = {
  partial: true,
  tokenize: tokenizeIndent
};
function tokenizeListStart(effects, ok2, nok) {
  const self2 = this;
  const tail = self2.events[self2.events.length - 1];
  let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
  let size = 0;
  return start;
  function start(code2) {
    const kind = self2.containerState.type || (code2 === 42 || code2 === 43 || code2 === 45 ? "listUnordered" : "listOrdered");
    if (kind === "listUnordered" ? !self2.containerState.marker || code2 === self2.containerState.marker : asciiDigit(code2)) {
      if (!self2.containerState.type) {
        self2.containerState.type = kind;
        effects.enter(kind, {
          _container: true
        });
      }
      if (kind === "listUnordered") {
        effects.enter("listItemPrefix");
        return code2 === 42 || code2 === 45 ? effects.check(thematicBreak$1, nok, atMarker)(code2) : atMarker(code2);
      }
      if (!self2.interrupt || code2 === 49) {
        effects.enter("listItemPrefix");
        effects.enter("listItemValue");
        return inside(code2);
      }
    }
    return nok(code2);
  }
  function inside(code2) {
    if (asciiDigit(code2) && ++size < 10) {
      effects.consume(code2);
      return inside;
    }
    if ((!self2.interrupt || size < 2) && (self2.containerState.marker ? code2 === self2.containerState.marker : code2 === 41 || code2 === 46)) {
      effects.exit("listItemValue");
      return atMarker(code2);
    }
    return nok(code2);
  }
  function atMarker(code2) {
    effects.enter("listItemMarker");
    effects.consume(code2);
    effects.exit("listItemMarker");
    self2.containerState.marker = self2.containerState.marker || code2;
    return effects.check(
      blankLine,
      // Can’t be empty when interrupting.
      self2.interrupt ? nok : onBlank,
      effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix)
    );
  }
  function onBlank(code2) {
    self2.containerState.initialBlankLine = true;
    initialSize++;
    return endOfPrefix(code2);
  }
  function otherPrefix(code2) {
    if (markdownSpace(code2)) {
      effects.enter("listItemPrefixWhitespace");
      effects.consume(code2);
      effects.exit("listItemPrefixWhitespace");
      return endOfPrefix;
    }
    return nok(code2);
  }
  function endOfPrefix(code2) {
    self2.containerState.size = initialSize + self2.sliceSerialize(effects.exit("listItemPrefix"), true).length;
    return ok2(code2);
  }
}
function tokenizeListContinuation(effects, ok2, nok) {
  const self2 = this;
  self2.containerState._closeFlow = void 0;
  return effects.check(blankLine, onBlank, notBlank);
  function onBlank(code2) {
    self2.containerState.furtherBlankLines = self2.containerState.furtherBlankLines || self2.containerState.initialBlankLine;
    return factorySpace(effects, ok2, "listItemIndent", self2.containerState.size + 1)(code2);
  }
  function notBlank(code2) {
    if (self2.containerState.furtherBlankLines || !markdownSpace(code2)) {
      self2.containerState.furtherBlankLines = void 0;
      self2.containerState.initialBlankLine = void 0;
      return notInCurrentItem(code2);
    }
    self2.containerState.furtherBlankLines = void 0;
    self2.containerState.initialBlankLine = void 0;
    return effects.attempt(indentConstruct, ok2, notInCurrentItem)(code2);
  }
  function notInCurrentItem(code2) {
    self2.containerState._closeFlow = true;
    self2.interrupt = void 0;
    return factorySpace(effects, effects.attempt(list$1, ok2, nok), "linePrefix", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code2);
  }
}
function tokenizeIndent(effects, ok2, nok) {
  const self2 = this;
  return factorySpace(effects, afterPrefix, "listItemIndent", self2.containerState.size + 1);
  function afterPrefix(code2) {
    const tail = self2.events[self2.events.length - 1];
    return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self2.containerState.size ? ok2(code2) : nok(code2);
  }
}
function tokenizeListEnd(effects) {
  effects.exit(this.containerState.type);
}
function tokenizeListItemPrefixWhitespace(effects, ok2, nok) {
  const self2 = this;
  return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self2.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4 + 1);
  function afterPrefix(code2) {
    const tail = self2.events[self2.events.length - 1];
    return !markdownSpace(code2) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok2(code2) : nok(code2);
  }
}
const setextUnderline = {
  name: "setextUnderline",
  resolveTo: resolveToSetextUnderline,
  tokenize: tokenizeSetextUnderline
};
function resolveToSetextUnderline(events, context) {
  let index2 = events.length;
  let content2;
  let text2;
  let definition2;
  while (index2--) {
    if (events[index2][0] === "enter") {
      if (events[index2][1].type === "content") {
        content2 = index2;
        break;
      }
      if (events[index2][1].type === "paragraph") {
        text2 = index2;
      }
    } else {
      if (events[index2][1].type === "content") {
        events.splice(index2, 1);
      }
      if (!definition2 && events[index2][1].type === "definition") {
        definition2 = index2;
      }
    }
  }
  const heading2 = {
    type: "setextHeading",
    start: {
      ...events[content2][1].start
    },
    end: {
      ...events[events.length - 1][1].end
    }
  };
  events[text2][1].type = "setextHeadingText";
  if (definition2) {
    events.splice(text2, 0, ["enter", heading2, context]);
    events.splice(definition2 + 1, 0, ["exit", events[content2][1], context]);
    events[content2][1].end = {
      ...events[definition2][1].end
    };
  } else {
    events[content2][1] = heading2;
  }
  events.push(["exit", heading2, context]);
  return events;
}
function tokenizeSetextUnderline(effects, ok2, nok) {
  const self2 = this;
  let marker;
  return start;
  function start(code2) {
    let index2 = self2.events.length;
    let paragraph2;
    while (index2--) {
      if (self2.events[index2][1].type !== "lineEnding" && self2.events[index2][1].type !== "linePrefix" && self2.events[index2][1].type !== "content") {
        paragraph2 = self2.events[index2][1].type === "paragraph";
        break;
      }
    }
    if (!self2.parser.lazy[self2.now().line] && (self2.interrupt || paragraph2)) {
      effects.enter("setextHeadingLine");
      marker = code2;
      return before(code2);
    }
    return nok(code2);
  }
  function before(code2) {
    effects.enter("setextHeadingLineSequence");
    return inside(code2);
  }
  function inside(code2) {
    if (code2 === marker) {
      effects.consume(code2);
      return inside;
    }
    effects.exit("setextHeadingLineSequence");
    return markdownSpace(code2) ? factorySpace(effects, after, "lineSuffix")(code2) : after(code2);
  }
  function after(code2) {
    if (code2 === null || markdownLineEnding(code2)) {
      effects.exit("setextHeadingLine");
      return ok2(code2);
    }
    return nok(code2);
  }
}
const flow$1 = {
  tokenize: initializeFlow
};
function initializeFlow(effects) {
  const self2 = this;
  const initial = effects.attempt(
    // Try to parse a blank line.
    blankLine,
    atBlankEnding,
    // Try to parse initial flow (essentially, only code).
    effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content, afterConstruct)), "linePrefix"))
  );
  return initial;
  function atBlankEnding(code2) {
    if (code2 === null) {
      effects.consume(code2);
      return;
    }
    effects.enter("lineEndingBlank");
    effects.consume(code2);
    effects.exit("lineEndingBlank");
    self2.currentConstruct = void 0;
    return initial;
  }
  function afterConstruct(code2) {
    if (code2 === null) {
      effects.consume(code2);
      return;
    }
    effects.enter("lineEnding");
    effects.consume(code2);
    effects.exit("lineEnding");
    self2.currentConstruct = void 0;
    return initial;
  }
}
const resolver = {
  resolveAll: createResolver()
};
const string$1 = initializeFactory("string");
const text$2 = initializeFactory("text");
function initializeFactory(field) {
  return {
    resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
    tokenize: initializeText
  };
  function initializeText(effects) {
    const self2 = this;
    const constructs2 = this.parser.constructs[field];
    const text2 = effects.attempt(constructs2, start, notText);
    return start;
    function start(code2) {
      return atBreak(code2) ? text2(code2) : notText(code2);
    }
    function notText(code2) {
      if (code2 === null) {
        effects.consume(code2);
        return;
      }
      effects.enter("data");
      effects.consume(code2);
      return data;
    }
    function data(code2) {
      if (atBreak(code2)) {
        effects.exit("data");
        return text2(code2);
      }
      effects.consume(code2);
      return data;
    }
    function atBreak(code2) {
      if (code2 === null) {
        return true;
      }
      const list2 = constructs2[code2];
      let index2 = -1;
      if (list2) {
        while (++index2 < list2.length) {
          const item = list2[index2];
          if (!item.previous || item.previous.call(self2, self2.previous)) {
            return true;
          }
        }
      }
      return false;
    }
  }
}
function createResolver(extraResolver) {
  return resolveAllText;
  function resolveAllText(events, context) {
    let index2 = -1;
    let enter;
    while (++index2 <= events.length) {
      if (enter === void 0) {
        if (events[index2] && events[index2][1].type === "data") {
          enter = index2;
          index2++;
        }
      } else if (!events[index2] || events[index2][1].type !== "data") {
        if (index2 !== enter + 2) {
          events[enter][1].end = events[index2 - 1][1].end;
          events.splice(enter + 2, index2 - enter - 2);
          index2 = enter + 2;
        }
        enter = void 0;
      }
    }
    return extraResolver ? extraResolver(events, context) : events;
  }
}
function resolveAllLineSuffixes(events, context) {
  let eventIndex = 0;
  while (++eventIndex <= events.length) {
    if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
      const data = events[eventIndex - 1][1];
      const chunks = context.sliceStream(data);
      let index2 = chunks.length;
      let bufferIndex = -1;
      let size = 0;
      let tabs;
      while (index2--) {
        const chunk = chunks[index2];
        if (typeof chunk === "string") {
          bufferIndex = chunk.length;
          while (chunk.charCodeAt(bufferIndex - 1) === 32) {
            size++;
            bufferIndex--;
          }
          if (bufferIndex) break;
          bufferIndex = -1;
        } else if (chunk === -2) {
          tabs = true;
          size++;
        } else if (chunk === -1) ;
        else {
          index2++;
          break;
        }
      }
      if (context._contentTypeTextTrailing && eventIndex === events.length) {
        size = 0;
      }
      if (size) {
        const token = {
          type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: index2 ? bufferIndex : data.start._bufferIndex + bufferIndex,
            _index: data.start._index + index2,
            line: data.end.line,
            column: data.end.column - size,
            offset: data.end.offset - size
          },
          end: {
            ...data.end
          }
        };
        data.end = {
          ...token.start
        };
        if (data.start.offset === data.end.offset) {
          Object.assign(data, token);
        } else {
          events.splice(eventIndex, 0, ["enter", token, context], ["exit", token, context]);
          eventIndex += 2;
        }
      }
      eventIndex++;
    }
  }
  return events;
}
const document$1 = {
  [42]: list$1,
  [43]: list$1,
  [45]: list$1,
  [48]: list$1,
  [49]: list$1,
  [50]: list$1,
  [51]: list$1,
  [52]: list$1,
  [53]: list$1,
  [54]: list$1,
  [55]: list$1,
  [56]: list$1,
  [57]: list$1,
  [62]: blockQuote
};
const contentInitial = {
  [91]: definition
};
const flowInitial = {
  [-2]: codeIndented,
  [-1]: codeIndented,
  [32]: codeIndented
};
const flow = {
  [35]: headingAtx,
  [42]: thematicBreak$1,
  [45]: [setextUnderline, thematicBreak$1],
  [60]: htmlFlow,
  [61]: setextUnderline,
  [95]: thematicBreak$1,
  [96]: codeFenced,
  [126]: codeFenced
};
const string = {
  [38]: characterReference,
  [92]: characterEscape
};
const text$1 = {
  [-5]: lineEnding,
  [-4]: lineEnding,
  [-3]: lineEnding,
  [33]: labelStartImage,
  [38]: characterReference,
  [42]: attention,
  [60]: [autolink, htmlText],
  [91]: labelStartLink,
  [92]: [hardBreakEscape, characterEscape],
  [93]: labelEnd,
  [95]: attention,
  [96]: codeText
};
const insideSpan = {
  null: [attention, resolver]
};
const attentionMarkers = {
  null: [42, 95]
};
const disable = {
  null: []
};
const defaultConstructs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers,
  contentInitial,
  disable,
  document: document$1,
  flow,
  flowInitial,
  insideSpan,
  string,
  text: text$1
}, Symbol.toStringTag, { value: "Module" }));
function createTokenizer(parser, initialize, from) {
  let point2 = {
    _bufferIndex: -1,
    _index: 0,
    line: from && from.line || 1,
    column: from && from.column || 1,
    offset: from && from.offset || 0
  };
  const columnStart = {};
  const resolveAllConstructs = [];
  let chunks = [];
  let stack = [];
  const effects = {
    attempt: constructFactory(onsuccessfulconstruct),
    check: constructFactory(onsuccessfulcheck),
    consume,
    enter,
    exit: exit2,
    interrupt: constructFactory(onsuccessfulcheck, {
      interrupt: true
    })
  };
  const context = {
    code: null,
    containerState: {},
    defineSkip,
    events: [],
    now,
    parser,
    previous: null,
    sliceSerialize,
    sliceStream,
    write
  };
  let state = initialize.tokenize.call(context, effects);
  if (initialize.resolveAll) {
    resolveAllConstructs.push(initialize);
  }
  return context;
  function write(slice) {
    chunks = push(chunks, slice);
    main();
    if (chunks[chunks.length - 1] !== null) {
      return [];
    }
    addResult(initialize, 0);
    context.events = resolveAll(resolveAllConstructs, context.events, context);
    return context.events;
  }
  function sliceSerialize(token, expandTabs) {
    return serializeChunks(sliceStream(token), expandTabs);
  }
  function sliceStream(token) {
    return sliceChunks(chunks, token);
  }
  function now() {
    const {
      _bufferIndex,
      _index,
      line,
      column,
      offset
    } = point2;
    return {
      _bufferIndex,
      _index,
      line,
      column,
      offset
    };
  }
  function defineSkip(value) {
    columnStart[value.line] = value.column;
    accountForPotentialSkip();
  }
  function main() {
    let chunkIndex;
    while (point2._index < chunks.length) {
      const chunk = chunks[point2._index];
      if (typeof chunk === "string") {
        chunkIndex = point2._index;
        if (point2._bufferIndex < 0) {
          point2._bufferIndex = 0;
        }
        while (point2._index === chunkIndex && point2._bufferIndex < chunk.length) {
          go(chunk.charCodeAt(point2._bufferIndex));
        }
      } else {
        go(chunk);
      }
    }
  }
  function go(code2) {
    state = state(code2);
  }
  function consume(code2) {
    if (markdownLineEnding(code2)) {
      point2.line++;
      point2.column = 1;
      point2.offset += code2 === -3 ? 2 : 1;
      accountForPotentialSkip();
    } else if (code2 !== -1) {
      point2.column++;
      point2.offset++;
    }
    if (point2._bufferIndex < 0) {
      point2._index++;
    } else {
      point2._bufferIndex++;
      if (point2._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
      // strings.
      /** @type {string} */
      chunks[point2._index].length) {
        point2._bufferIndex = -1;
        point2._index++;
      }
    }
    context.previous = code2;
  }
  function enter(type, fields) {
    const token = fields || {};
    token.type = type;
    token.start = now();
    context.events.push(["enter", token, context]);
    stack.push(token);
    return token;
  }
  function exit2(type) {
    const token = stack.pop();
    token.end = now();
    context.events.push(["exit", token, context]);
    return token;
  }
  function onsuccessfulconstruct(construct, info) {
    addResult(construct, info.from);
  }
  function onsuccessfulcheck(_, info) {
    info.restore();
  }
  function constructFactory(onreturn, fields) {
    return hook;
    function hook(constructs2, returnState, bogusState) {
      let listOfConstructs;
      let constructIndex;
      let currentConstruct;
      let info;
      return Array.isArray(constructs2) ? (
        /* c8 ignore next 1 */
        handleListOfConstructs(constructs2)
      ) : "tokenize" in constructs2 ? (
        // Looks like a construct.
        handleListOfConstructs([
          /** @type {Construct} */
          constructs2
        ])
      ) : handleMapOfConstructs(constructs2);
      function handleMapOfConstructs(map) {
        return start;
        function start(code2) {
          const left = code2 !== null && map[code2];
          const all2 = code2 !== null && map.null;
          const list2 = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(left) ? left : left ? [left] : [],
            ...Array.isArray(all2) ? all2 : all2 ? [all2] : []
          ];
          return handleListOfConstructs(list2)(code2);
        }
      }
      function handleListOfConstructs(list2) {
        listOfConstructs = list2;
        constructIndex = 0;
        if (list2.length === 0) {
          return bogusState;
        }
        return handleConstruct(list2[constructIndex]);
      }
      function handleConstruct(construct) {
        return start;
        function start(code2) {
          info = store();
          currentConstruct = construct;
          if (!construct.partial) {
            context.currentConstruct = construct;
          }
          if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) {
            return nok();
          }
          return construct.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            fields ? Object.assign(Object.create(context), fields) : context,
            effects,
            ok2,
            nok
          )(code2);
        }
      }
      function ok2(code2) {
        onreturn(currentConstruct, info);
        return returnState;
      }
      function nok(code2) {
        info.restore();
        if (++constructIndex < listOfConstructs.length) {
          return handleConstruct(listOfConstructs[constructIndex]);
        }
        return bogusState;
      }
    }
  }
  function addResult(construct, from2) {
    if (construct.resolveAll && !resolveAllConstructs.includes(construct)) {
      resolveAllConstructs.push(construct);
    }
    if (construct.resolve) {
      splice(context.events, from2, context.events.length - from2, construct.resolve(context.events.slice(from2), context));
    }
    if (construct.resolveTo) {
      context.events = construct.resolveTo(context.events, context);
    }
  }
  function store() {
    const startPoint = now();
    const startPrevious = context.previous;
    const startCurrentConstruct = context.currentConstruct;
    const startEventsIndex = context.events.length;
    const startStack = Array.from(stack);
    return {
      from: startEventsIndex,
      restore
    };
    function restore() {
      point2 = startPoint;
      context.previous = startPrevious;
      context.currentConstruct = startCurrentConstruct;
      context.events.length = startEventsIndex;
      stack = startStack;
      accountForPotentialSkip();
    }
  }
  function accountForPotentialSkip() {
    if (point2.line in columnStart && point2.column < 2) {
      point2.column = columnStart[point2.line];
      point2.offset += columnStart[point2.line] - 1;
    }
  }
}
function sliceChunks(chunks, token) {
  const startIndex = token.start._index;
  const startBufferIndex = token.start._bufferIndex;
  const endIndex = token.end._index;
  const endBufferIndex = token.end._bufferIndex;
  let view;
  if (startIndex === endIndex) {
    view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
  } else {
    view = chunks.slice(startIndex, endIndex);
    if (startBufferIndex > -1) {
      const head = view[0];
      if (typeof head === "string") {
        view[0] = head.slice(startBufferIndex);
      } else {
        view.shift();
      }
    }
    if (endBufferIndex > 0) {
      view.push(chunks[endIndex].slice(0, endBufferIndex));
    }
  }
  return view;
}
function serializeChunks(chunks, expandTabs) {
  let index2 = -1;
  const result = [];
  let atTab;
  while (++index2 < chunks.length) {
    const chunk = chunks[index2];
    let value;
    if (typeof chunk === "string") {
      value = chunk;
    } else switch (chunk) {
      case -5: {
        value = "\r";
        break;
      }
      case -4: {
        value = "\n";
        break;
      }
      case -3: {
        value = "\r\n";
        break;
      }
      case -2: {
        value = expandTabs ? " " : "	";
        break;
      }
      case -1: {
        if (!expandTabs && atTab) continue;
        value = " ";
        break;
      }
      default: {
        value = String.fromCharCode(chunk);
      }
    }
    atTab = chunk === -2;
    result.push(value);
  }
  return result.join("");
}
function parse(options) {
  const settings = options || {};
  const constructs2 = (
    /** @type {FullNormalizedExtension} */
    combineExtensions([defaultConstructs, ...settings.extensions || []])
  );
  const parser = {
    constructs: constructs2,
    content: create2(content$1),
    defined: [],
    document: create2(document$2),
    flow: create2(flow$1),
    lazy: {},
    string: create2(string$1),
    text: create2(text$2)
  };
  return parser;
  function create2(initial) {
    return creator;
    function creator(from) {
      return createTokenizer(parser, initial, from);
    }
  }
}
function postprocess(events) {
  while (!subtokenize(events)) {
  }
  return events;
}
const search = /[\0\t\n\r]/g;
function preprocess() {
  let column = 1;
  let buffer = "";
  let start = true;
  let atCarriageReturn;
  return preprocessor;
  function preprocessor(value, encoding, end) {
    const chunks = [];
    let match;
    let next;
    let startPosition;
    let endPosition;
    let code2;
    value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
    startPosition = 0;
    buffer = "";
    if (start) {
      if (value.charCodeAt(0) === 65279) {
        startPosition++;
      }
      start = void 0;
    }
    while (startPosition < value.length) {
      search.lastIndex = startPosition;
      match = search.exec(value);
      endPosition = match && match.index !== void 0 ? match.index : value.length;
      code2 = value.charCodeAt(endPosition);
      if (!match) {
        buffer = value.slice(startPosition);
        break;
      }
      if (code2 === 10 && startPosition === endPosition && atCarriageReturn) {
        chunks.push(-3);
        atCarriageReturn = void 0;
      } else {
        if (atCarriageReturn) {
          chunks.push(-5);
          atCarriageReturn = void 0;
        }
        if (startPosition < endPosition) {
          chunks.push(value.slice(startPosition, endPosition));
          column += endPosition - startPosition;
        }
        switch (code2) {
          case 0: {
            chunks.push(65533);
            column++;
            break;
          }
          case 9: {
            next = Math.ceil(column / 4) * 4;
            chunks.push(-2);
            while (column++ < next) chunks.push(-1);
            break;
          }
          case 10: {
            chunks.push(-4);
            column = 1;
            break;
          }
          default: {
            atCarriageReturn = true;
            column = 1;
          }
        }
      }
      startPosition = endPosition + 1;
    }
    if (end) {
      if (atCarriageReturn) chunks.push(-5);
      if (buffer) chunks.push(buffer);
      chunks.push(null);
    }
    return chunks;
  }
}
const characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function decodeString(value) {
  return value.replace(characterEscapeOrReference, decode);
}
function decode($0, $1, $2) {
  if ($1) {
    return $1;
  }
  const head = $2.charCodeAt(0);
  if (head === 35) {
    const head2 = $2.charCodeAt(1);
    const hex = head2 === 120 || head2 === 88;
    return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
  }
  return decodeNamedCharacterReference($2) || $0;
}
const own$2 = {}.hasOwnProperty;
function fromMarkdown(value, encoding, options) {
  if (typeof encoding !== "string") {
    options = encoding;
    encoding = void 0;
  }
  return compiler(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
}
function compiler(options) {
  const config = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: opener(link2),
      autolinkProtocol: onenterdata,
      autolinkEmail: onenterdata,
      atxHeading: opener(heading2),
      blockQuote: opener(blockQuote2),
      characterEscape: onenterdata,
      characterReference: onenterdata,
      codeFenced: opener(codeFlow),
      codeFencedFenceInfo: buffer,
      codeFencedFenceMeta: buffer,
      codeIndented: opener(codeFlow, buffer),
      codeText: opener(codeText2, buffer),
      codeTextData: onenterdata,
      data: onenterdata,
      codeFlowValue: onenterdata,
      definition: opener(definition2),
      definitionDestinationString: buffer,
      definitionLabelString: buffer,
      definitionTitleString: buffer,
      emphasis: opener(emphasis2),
      hardBreakEscape: opener(hardBreak2),
      hardBreakTrailing: opener(hardBreak2),
      htmlFlow: opener(html2, buffer),
      htmlFlowData: onenterdata,
      htmlText: opener(html2, buffer),
      htmlTextData: onenterdata,
      image: opener(image2),
      label: buffer,
      link: opener(link2),
      listItem: opener(listItem2),
      listItemValue: onenterlistitemvalue,
      listOrdered: opener(list2, onenterlistordered),
      listUnordered: opener(list2),
      paragraph: opener(paragraph2),
      reference: onenterreference,
      referenceString: buffer,
      resourceDestinationString: buffer,
      resourceTitleString: buffer,
      setextHeading: opener(heading2),
      strong: opener(strong2),
      thematicBreak: opener(thematicBreak2)
    },
    exit: {
      atxHeading: closer(),
      atxHeadingSequence: onexitatxheadingsequence,
      autolink: closer(),
      autolinkEmail: onexitautolinkemail,
      autolinkProtocol: onexitautolinkprotocol,
      blockQuote: closer(),
      characterEscapeValue: onexitdata,
      characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
      characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
      characterReferenceValue: onexitcharacterreferencevalue,
      characterReference: onexitcharacterreference,
      codeFenced: closer(onexitcodefenced),
      codeFencedFence: onexitcodefencedfence,
      codeFencedFenceInfo: onexitcodefencedfenceinfo,
      codeFencedFenceMeta: onexitcodefencedfencemeta,
      codeFlowValue: onexitdata,
      codeIndented: closer(onexitcodeindented),
      codeText: closer(onexitcodetext),
      codeTextData: onexitdata,
      data: onexitdata,
      definition: closer(),
      definitionDestinationString: onexitdefinitiondestinationstring,
      definitionLabelString: onexitdefinitionlabelstring,
      definitionTitleString: onexitdefinitiontitlestring,
      emphasis: closer(),
      hardBreakEscape: closer(onexithardbreak),
      hardBreakTrailing: closer(onexithardbreak),
      htmlFlow: closer(onexithtmlflow),
      htmlFlowData: onexitdata,
      htmlText: closer(onexithtmltext),
      htmlTextData: onexitdata,
      image: closer(onexitimage),
      label: onexitlabel,
      labelText: onexitlabeltext,
      lineEnding: onexitlineending,
      link: closer(onexitlink),
      listItem: closer(),
      listOrdered: closer(),
      listUnordered: closer(),
      paragraph: closer(),
      referenceString: onexitreferencestring,
      resourceDestinationString: onexitresourcedestinationstring,
      resourceTitleString: onexitresourcetitlestring,
      resource: onexitresource,
      setextHeading: closer(onexitsetextheading),
      setextHeadingLineSequence: onexitsetextheadinglinesequence,
      setextHeadingText: onexitsetextheadingtext,
      strong: closer(),
      thematicBreak: closer()
    }
  };
  configure(config, (options || {}).mdastExtensions || []);
  const data = {};
  return compile;
  function compile(events) {
    let tree = {
      type: "root",
      children: []
    };
    const context = {
      stack: [tree],
      tokenStack: [],
      config,
      enter,
      exit: exit2,
      buffer,
      resume,
      data
    };
    const listStack = [];
    let index2 = -1;
    while (++index2 < events.length) {
      if (events[index2][1].type === "listOrdered" || events[index2][1].type === "listUnordered") {
        if (events[index2][0] === "enter") {
          listStack.push(index2);
        } else {
          const tail = listStack.pop();
          index2 = prepareList(events, tail, index2);
        }
      }
    }
    index2 = -1;
    while (++index2 < events.length) {
      const handler = config[events[index2][0]];
      if (own$2.call(handler, events[index2][1].type)) {
        handler[events[index2][1].type].call(Object.assign({
          sliceSerialize: events[index2][2].sliceSerialize
        }, context), events[index2][1]);
      }
    }
    if (context.tokenStack.length > 0) {
      const tail = context.tokenStack[context.tokenStack.length - 1];
      const handler = tail[1] || defaultOnError;
      handler.call(context, void 0, tail[0]);
    }
    tree.position = {
      start: point(events.length > 0 ? events[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: point(events.length > 0 ? events[events.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    };
    index2 = -1;
    while (++index2 < config.transforms.length) {
      tree = config.transforms[index2](tree) || tree;
    }
    return tree;
  }
  function prepareList(events, start, length) {
    let index2 = start - 1;
    let containerBalance = -1;
    let listSpread = false;
    let listItem3;
    let lineIndex;
    let firstBlankLineIndex;
    let atMarker;
    while (++index2 <= length) {
      const event = events[index2];
      switch (event[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          if (event[0] === "enter") {
            containerBalance++;
          } else {
            containerBalance--;
          }
          atMarker = void 0;
          break;
        }
        case "lineEndingBlank": {
          if (event[0] === "enter") {
            if (listItem3 && !atMarker && !containerBalance && !firstBlankLineIndex) {
              firstBlankLineIndex = index2;
            }
            atMarker = void 0;
          }
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace": {
          break;
        }
        default: {
          atMarker = void 0;
        }
      }
      if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
        if (listItem3) {
          let tailIndex = index2;
          lineIndex = void 0;
          while (tailIndex--) {
            const tailEvent = events[tailIndex];
            if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
              if (tailEvent[0] === "exit") continue;
              if (lineIndex) {
                events[lineIndex][1].type = "lineEndingBlank";
                listSpread = true;
              }
              tailEvent[1].type = "lineEnding";
              lineIndex = tailIndex;
            } else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") ;
            else {
              break;
            }
          }
          if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) {
            listItem3._spread = true;
          }
          listItem3.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
          events.splice(lineIndex || index2, 0, ["exit", listItem3, event[2]]);
          index2++;
          length++;
        }
        if (event[1].type === "listItemPrefix") {
          const item = {
            type: "listItem",
            _spread: false,
            start: Object.assign({}, event[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          listItem3 = item;
          events.splice(index2, 0, ["enter", item, event[2]]);
          index2++;
          length++;
          firstBlankLineIndex = void 0;
          atMarker = true;
        }
      }
    }
    events[start][1]._spread = listSpread;
    return length;
  }
  function opener(create2, and) {
    return open;
    function open(token) {
      enter.call(this, create2(token), token);
      if (and) and.call(this, token);
    }
  }
  function buffer() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function enter(node2, token, errorHandler) {
    const parent = this.stack[this.stack.length - 1];
    const siblings = parent.children;
    siblings.push(node2);
    this.stack.push(node2);
    this.tokenStack.push([token, errorHandler || void 0]);
    node2.position = {
      start: point(token.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function closer(and) {
    return close;
    function close(token) {
      if (and) and.call(this, token);
      exit2.call(this, token);
    }
  }
  function exit2(token, onExitError) {
    const node2 = this.stack.pop();
    const open = this.tokenStack.pop();
    if (!open) {
      throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
        start: token.start,
        end: token.end
      }) + "): it’s not open");
    } else if (open[0].type !== token.type) {
      if (onExitError) {
        onExitError.call(this, token, open[0]);
      } else {
        const handler = open[1] || defaultOnError;
        handler.call(this, token, open[0]);
      }
    }
    node2.position.end = point(token.end);
  }
  function resume() {
    return toString$1(this.stack.pop());
  }
  function onenterlistordered() {
    this.data.expectingFirstListItemValue = true;
  }
  function onenterlistitemvalue(token) {
    if (this.data.expectingFirstListItemValue) {
      const ancestor = this.stack[this.stack.length - 2];
      ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
      this.data.expectingFirstListItemValue = void 0;
    }
  }
  function onexitcodefencedfenceinfo() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.lang = data2;
  }
  function onexitcodefencedfencemeta() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.meta = data2;
  }
  function onexitcodefencedfence() {
    if (this.data.flowCodeInside) return;
    this.buffer();
    this.data.flowCodeInside = true;
  }
  function onexitcodefenced() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
    this.data.flowCodeInside = void 0;
  }
  function onexitcodeindented() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2.replace(/(\r?\n|\r)$/g, "");
  }
  function onexitdefinitionlabelstring(token) {
    const label = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.label = label;
    node2.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
  }
  function onexitdefinitiontitlestring() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.title = data2;
  }
  function onexitdefinitiondestinationstring() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.url = data2;
  }
  function onexitatxheadingsequence(token) {
    const node2 = this.stack[this.stack.length - 1];
    if (!node2.depth) {
      const depth = this.sliceSerialize(token).length;
      node2.depth = depth;
    }
  }
  function onexitsetextheadingtext() {
    this.data.setextHeadingSlurpLineEnding = true;
  }
  function onexitsetextheadinglinesequence(token) {
    const node2 = this.stack[this.stack.length - 1];
    node2.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
  }
  function onexitsetextheading() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function onenterdata(token) {
    const node2 = this.stack[this.stack.length - 1];
    const siblings = node2.children;
    let tail = siblings[siblings.length - 1];
    if (!tail || tail.type !== "text") {
      tail = text2();
      tail.position = {
        start: point(token.start),
        // @ts-expect-error: we’ll add `end` later.
        end: void 0
      };
      siblings.push(tail);
    }
    this.stack.push(tail);
  }
  function onexitdata(token) {
    const tail = this.stack.pop();
    tail.value += this.sliceSerialize(token);
    tail.position.end = point(token.end);
  }
  function onexitlineending(token) {
    const context = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const tail = context.children[context.children.length - 1];
      tail.position.end = point(token.end);
      this.data.atHardBreak = void 0;
      return;
    }
    if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
      onenterdata.call(this, token);
      onexitdata.call(this, token);
    }
  }
  function onexithardbreak() {
    this.data.atHardBreak = true;
  }
  function onexithtmlflow() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2;
  }
  function onexithtmltext() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2;
  }
  function onexitcodetext() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.value = data2;
  }
  function onexitlink() {
    const node2 = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const referenceType = this.data.referenceType || "shortcut";
      node2.type += "Reference";
      node2.referenceType = referenceType;
      delete node2.url;
      delete node2.title;
    } else {
      delete node2.identifier;
      delete node2.label;
    }
    this.data.referenceType = void 0;
  }
  function onexitimage() {
    const node2 = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const referenceType = this.data.referenceType || "shortcut";
      node2.type += "Reference";
      node2.referenceType = referenceType;
      delete node2.url;
      delete node2.title;
    } else {
      delete node2.identifier;
      delete node2.label;
    }
    this.data.referenceType = void 0;
  }
  function onexitlabeltext(token) {
    const string2 = this.sliceSerialize(token);
    const ancestor = this.stack[this.stack.length - 2];
    ancestor.label = decodeString(string2);
    ancestor.identifier = normalizeIdentifier(string2).toLowerCase();
  }
  function onexitlabel() {
    const fragment = this.stack[this.stack.length - 1];
    const value = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    this.data.inReference = true;
    if (node2.type === "link") {
      const children = fragment.children;
      node2.children = children;
    } else {
      node2.alt = value;
    }
  }
  function onexitresourcedestinationstring() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.url = data2;
  }
  function onexitresourcetitlestring() {
    const data2 = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.title = data2;
  }
  function onexitresource() {
    this.data.inReference = void 0;
  }
  function onenterreference() {
    this.data.referenceType = "collapsed";
  }
  function onexitreferencestring(token) {
    const label = this.resume();
    const node2 = this.stack[this.stack.length - 1];
    node2.label = label;
    node2.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
    this.data.referenceType = "full";
  }
  function onexitcharacterreferencemarker(token) {
    this.data.characterReferenceType = token.type;
  }
  function onexitcharacterreferencevalue(token) {
    const data2 = this.sliceSerialize(token);
    const type = this.data.characterReferenceType;
    let value;
    if (type) {
      value = decodeNumericCharacterReference(data2, type === "characterReferenceMarkerNumeric" ? 10 : 16);
      this.data.characterReferenceType = void 0;
    } else {
      const result = decodeNamedCharacterReference(data2);
      value = result;
    }
    const tail = this.stack[this.stack.length - 1];
    tail.value += value;
  }
  function onexitcharacterreference(token) {
    const tail = this.stack.pop();
    tail.position.end = point(token.end);
  }
  function onexitautolinkprotocol(token) {
    onexitdata.call(this, token);
    const node2 = this.stack[this.stack.length - 1];
    node2.url = this.sliceSerialize(token);
  }
  function onexitautolinkemail(token) {
    onexitdata.call(this, token);
    const node2 = this.stack[this.stack.length - 1];
    node2.url = "mailto:" + this.sliceSerialize(token);
  }
  function blockQuote2() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function codeFlow() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function codeText2() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function definition2() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function emphasis2() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function heading2() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function hardBreak2() {
    return {
      type: "break"
    };
  }
  function html2() {
    return {
      type: "html",
      value: ""
    };
  }
  function image2() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function link2() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function list2(token) {
    return {
      type: "list",
      ordered: token.type === "listOrdered",
      start: null,
      spread: token._spread,
      children: []
    };
  }
  function listItem2(token) {
    return {
      type: "listItem",
      spread: token._spread,
      checked: null,
      children: []
    };
  }
  function paragraph2() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function strong2() {
    return {
      type: "strong",
      children: []
    };
  }
  function text2() {
    return {
      type: "text",
      value: ""
    };
  }
  function thematicBreak2() {
    return {
      type: "thematicBreak"
    };
  }
}
function point(d) {
  return {
    line: d.line,
    column: d.column,
    offset: d.offset
  };
}
function configure(combined, extensions) {
  let index2 = -1;
  while (++index2 < extensions.length) {
    const value = extensions[index2];
    if (Array.isArray(value)) {
      configure(combined, value);
    } else {
      extension(combined, value);
    }
  }
}
function extension(combined, extension2) {
  let key;
  for (key in extension2) {
    if (own$2.call(extension2, key)) {
      switch (key) {
        case "canContainEols": {
          const right = extension2[key];
          if (right) {
            combined[key].push(...right);
          }
          break;
        }
        case "transforms": {
          const right = extension2[key];
          if (right) {
            combined[key].push(...right);
          }
          break;
        }
        case "enter":
        case "exit": {
          const right = extension2[key];
          if (right) {
            Object.assign(combined[key], right);
          }
          break;
        }
      }
    }
  }
}
function defaultOnError(left, right) {
  if (left) {
    throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
      start: left.start,
      end: left.end
    }) + "): a different token (`" + right.type + "`, " + stringifyPosition({
      start: right.start,
      end: right.end
    }) + ") is open");
  } else {
    throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
      start: right.start,
      end: right.end
    }) + ") is still open");
  }
}
function remarkParse(options) {
  const self2 = this;
  self2.parser = parser;
  function parser(doc) {
    return fromMarkdown(doc, {
      ...self2.data("settings"),
      ...options,
      // Note: these options are not in the readme.
      // The goal is for them to be set by plugins on `data` instead of being
      // passed by users.
      extensions: self2.data("micromarkExtensions") || [],
      mdastExtensions: self2.data("fromMarkdownExtensions") || []
    });
  }
}
function blockquote(state, node2) {
  const result = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: state.wrap(state.all(node2), true)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function hardBreak(state, node2) {
  const result = { type: "element", tagName: "br", properties: {}, children: [] };
  state.patch(node2, result);
  return [state.applyData(node2, result), { type: "text", value: "\n" }];
}
function code(state, node2) {
  const value = node2.value ? node2.value + "\n" : "";
  const properties = {};
  const language = node2.lang ? node2.lang.split(/\s+/) : [];
  if (language.length > 0) {
    properties.className = ["language-" + language[0]];
  }
  let result = {
    type: "element",
    tagName: "code",
    properties,
    children: [{ type: "text", value }]
  };
  if (node2.meta) {
    result.data = { meta: node2.meta };
  }
  state.patch(node2, result);
  result = state.applyData(node2, result);
  result = { type: "element", tagName: "pre", properties: {}, children: [result] };
  state.patch(node2, result);
  return result;
}
function strikethrough(state, node2) {
  const result = {
    type: "element",
    tagName: "del",
    properties: {},
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function emphasis(state, node2) {
  const result = {
    type: "element",
    tagName: "em",
    properties: {},
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function footnoteReference(state, node2) {
  const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
  const id = String(node2.identifier).toUpperCase();
  const safeId = normalizeUri(id.toLowerCase());
  const index2 = state.footnoteOrder.indexOf(id);
  let counter;
  let reuseCounter = state.footnoteCounts.get(id);
  if (reuseCounter === void 0) {
    reuseCounter = 0;
    state.footnoteOrder.push(id);
    counter = state.footnoteOrder.length;
  } else {
    counter = index2 + 1;
  }
  reuseCounter += 1;
  state.footnoteCounts.set(id, reuseCounter);
  const link2 = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + clobberPrefix + "fn-" + safeId,
      id: clobberPrefix + "fnref-" + safeId + (reuseCounter > 1 ? "-" + reuseCounter : ""),
      dataFootnoteRef: true,
      ariaDescribedBy: ["footnote-label"]
    },
    children: [{ type: "text", value: String(counter) }]
  };
  state.patch(node2, link2);
  const sup = {
    type: "element",
    tagName: "sup",
    properties: {},
    children: [link2]
  };
  state.patch(node2, sup);
  return state.applyData(node2, sup);
}
function heading(state, node2) {
  const result = {
    type: "element",
    tagName: "h" + node2.depth,
    properties: {},
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function html(state, node2) {
  if (state.options.allowDangerousHtml) {
    const result = { type: "raw", value: node2.value };
    state.patch(node2, result);
    return state.applyData(node2, result);
  }
  return void 0;
}
function revert(state, node2) {
  const subtype = node2.referenceType;
  let suffix = "]";
  if (subtype === "collapsed") {
    suffix += "[]";
  } else if (subtype === "full") {
    suffix += "[" + (node2.label || node2.identifier) + "]";
  }
  if (node2.type === "imageReference") {
    return [{ type: "text", value: "![" + node2.alt + suffix }];
  }
  const contents = state.all(node2);
  const head = contents[0];
  if (head && head.type === "text") {
    head.value = "[" + head.value;
  } else {
    contents.unshift({ type: "text", value: "[" });
  }
  const tail = contents[contents.length - 1];
  if (tail && tail.type === "text") {
    tail.value += suffix;
  } else {
    contents.push({ type: "text", value: suffix });
  }
  return contents;
}
function imageReference(state, node2) {
  const id = String(node2.identifier).toUpperCase();
  const definition2 = state.definitionById.get(id);
  if (!definition2) {
    return revert(state, node2);
  }
  const properties = { src: normalizeUri(definition2.url || ""), alt: node2.alt };
  if (definition2.title !== null && definition2.title !== void 0) {
    properties.title = definition2.title;
  }
  const result = { type: "element", tagName: "img", properties, children: [] };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function image(state, node2) {
  const properties = { src: normalizeUri(node2.url) };
  if (node2.alt !== null && node2.alt !== void 0) {
    properties.alt = node2.alt;
  }
  if (node2.title !== null && node2.title !== void 0) {
    properties.title = node2.title;
  }
  const result = { type: "element", tagName: "img", properties, children: [] };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function inlineCode(state, node2) {
  const text2 = { type: "text", value: node2.value.replace(/\r?\n|\r/g, " ") };
  state.patch(node2, text2);
  const result = {
    type: "element",
    tagName: "code",
    properties: {},
    children: [text2]
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function linkReference(state, node2) {
  const id = String(node2.identifier).toUpperCase();
  const definition2 = state.definitionById.get(id);
  if (!definition2) {
    return revert(state, node2);
  }
  const properties = { href: normalizeUri(definition2.url || "") };
  if (definition2.title !== null && definition2.title !== void 0) {
    properties.title = definition2.title;
  }
  const result = {
    type: "element",
    tagName: "a",
    properties,
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function link(state, node2) {
  const properties = { href: normalizeUri(node2.url) };
  if (node2.title !== null && node2.title !== void 0) {
    properties.title = node2.title;
  }
  const result = {
    type: "element",
    tagName: "a",
    properties,
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function listItem(state, node2, parent) {
  const results = state.all(node2);
  const loose = parent ? listLoose(parent) : listItemLoose(node2);
  const properties = {};
  const children = [];
  if (typeof node2.checked === "boolean") {
    const head = results[0];
    let paragraph2;
    if (head && head.type === "element" && head.tagName === "p") {
      paragraph2 = head;
    } else {
      paragraph2 = { type: "element", tagName: "p", properties: {}, children: [] };
      results.unshift(paragraph2);
    }
    if (paragraph2.children.length > 0) {
      paragraph2.children.unshift({ type: "text", value: " " });
    }
    paragraph2.children.unshift({
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", checked: node2.checked, disabled: true },
      children: []
    });
    properties.className = ["task-list-item"];
  }
  let index2 = -1;
  while (++index2 < results.length) {
    const child = results[index2];
    if (loose || index2 !== 0 || child.type !== "element" || child.tagName !== "p") {
      children.push({ type: "text", value: "\n" });
    }
    if (child.type === "element" && child.tagName === "p" && !loose) {
      children.push(...child.children);
    } else {
      children.push(child);
    }
  }
  const tail = results[results.length - 1];
  if (tail && (loose || tail.type !== "element" || tail.tagName !== "p")) {
    children.push({ type: "text", value: "\n" });
  }
  const result = { type: "element", tagName: "li", properties, children };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function listLoose(node2) {
  let loose = false;
  if (node2.type === "list") {
    loose = node2.spread || false;
    const children = node2.children;
    let index2 = -1;
    while (!loose && ++index2 < children.length) {
      loose = listItemLoose(children[index2]);
    }
  }
  return loose;
}
function listItemLoose(node2) {
  const spread = node2.spread;
  return spread === null || spread === void 0 ? node2.children.length > 1 : spread;
}
function list(state, node2) {
  const properties = {};
  const results = state.all(node2);
  let index2 = -1;
  if (typeof node2.start === "number" && node2.start !== 1) {
    properties.start = node2.start;
  }
  while (++index2 < results.length) {
    const child = results[index2];
    if (child.type === "element" && child.tagName === "li" && child.properties && Array.isArray(child.properties.className) && child.properties.className.includes("task-list-item")) {
      properties.className = ["contains-task-list"];
      break;
    }
  }
  const result = {
    type: "element",
    tagName: node2.ordered ? "ol" : "ul",
    properties,
    children: state.wrap(results, true)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function paragraph(state, node2) {
  const result = {
    type: "element",
    tagName: "p",
    properties: {},
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function root(state, node2) {
  const result = { type: "root", children: state.wrap(state.all(node2)) };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function strong(state, node2) {
  const result = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function table(state, node2) {
  const rows = state.all(node2);
  const firstRow = rows.shift();
  const tableContent = [];
  if (firstRow) {
    const head = {
      type: "element",
      tagName: "thead",
      properties: {},
      children: state.wrap([firstRow], true)
    };
    state.patch(node2.children[0], head);
    tableContent.push(head);
  }
  if (rows.length > 0) {
    const body = {
      type: "element",
      tagName: "tbody",
      properties: {},
      children: state.wrap(rows, true)
    };
    const start = pointStart(node2.children[1]);
    const end = pointEnd(node2.children[node2.children.length - 1]);
    if (start && end) body.position = { start, end };
    tableContent.push(body);
  }
  const result = {
    type: "element",
    tagName: "table",
    properties: {},
    children: state.wrap(tableContent, true)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function tableRow(state, node2, parent) {
  const siblings = parent ? parent.children : void 0;
  const rowIndex = siblings ? siblings.indexOf(node2) : 1;
  const tagName = rowIndex === 0 ? "th" : "td";
  const align = parent && parent.type === "table" ? parent.align : void 0;
  const length = align ? align.length : node2.children.length;
  let cellIndex = -1;
  const cells = [];
  while (++cellIndex < length) {
    const cell = node2.children[cellIndex];
    const properties = {};
    const alignValue = align ? align[cellIndex] : void 0;
    if (alignValue) {
      properties.align = alignValue;
    }
    let result2 = { type: "element", tagName, properties, children: [] };
    if (cell) {
      result2.children = state.all(cell);
      state.patch(cell, result2);
      result2 = state.applyData(cell, result2);
    }
    cells.push(result2);
  }
  const result = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: state.wrap(cells, true)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function tableCell(state, node2) {
  const result = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
const tab = 9;
const space = 32;
function trimLines(value) {
  const source = String(value);
  const search2 = /\r?\n|\r/g;
  let match = search2.exec(source);
  let last = 0;
  const lines = [];
  while (match) {
    lines.push(
      trimLine(source.slice(last, match.index), last > 0, true),
      match[0]
    );
    last = match.index + match[0].length;
    match = search2.exec(source);
  }
  lines.push(trimLine(source.slice(last), last > 0, false));
  return lines.join("");
}
function trimLine(value, start, end) {
  let startIndex = 0;
  let endIndex = value.length;
  if (start) {
    let code2 = value.codePointAt(startIndex);
    while (code2 === tab || code2 === space) {
      startIndex++;
      code2 = value.codePointAt(startIndex);
    }
  }
  if (end) {
    let code2 = value.codePointAt(endIndex - 1);
    while (code2 === tab || code2 === space) {
      endIndex--;
      code2 = value.codePointAt(endIndex - 1);
    }
  }
  return endIndex > startIndex ? value.slice(startIndex, endIndex) : "";
}
function text(state, node2) {
  const result = { type: "text", value: trimLines(String(node2.value)) };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function thematicBreak(state, node2) {
  const result = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
const handlers = {
  blockquote,
  break: hardBreak,
  code,
  delete: strikethrough,
  emphasis,
  footnoteReference,
  heading,
  html,
  imageReference,
  image,
  inlineCode,
  linkReference,
  link,
  listItem,
  list,
  paragraph,
  // @ts-expect-error: root is different, but hard to type.
  root,
  strong,
  table,
  tableCell,
  tableRow,
  text,
  thematicBreak,
  toml: ignore,
  yaml: ignore,
  definition: ignore,
  footnoteDefinition: ignore
};
function ignore() {
  return void 0;
}
const VOID = -1;
const PRIMITIVE = 0;
const ARRAY = 1;
const OBJECT = 2;
const DATE = 3;
const REGEXP = 4;
const MAP = 5;
const SET = 6;
const ERROR = 7;
const BIGINT = 8;
const env = typeof self === "object" ? self : globalThis;
const deserializer = ($, _) => {
  const as = (out, index2) => {
    $.set(index2, out);
    return out;
  };
  const unpair = (index2) => {
    if ($.has(index2))
      return $.get(index2);
    const [type, value] = _[index2];
    switch (type) {
      case PRIMITIVE:
      case VOID:
        return as(value, index2);
      case ARRAY: {
        const arr = as([], index2);
        for (const index3 of value)
          arr.push(unpair(index3));
        return arr;
      }
      case OBJECT: {
        const object = as({}, index2);
        for (const [key, index3] of value)
          object[unpair(key)] = unpair(index3);
        return object;
      }
      case DATE:
        return as(new Date(value), index2);
      case REGEXP: {
        const { source, flags } = value;
        return as(new RegExp(source, flags), index2);
      }
      case MAP: {
        const map = as(/* @__PURE__ */ new Map(), index2);
        for (const [key, index3] of value)
          map.set(unpair(key), unpair(index3));
        return map;
      }
      case SET: {
        const set = as(/* @__PURE__ */ new Set(), index2);
        for (const index3 of value)
          set.add(unpair(index3));
        return set;
      }
      case ERROR: {
        const { name: name2, message } = value;
        return as(new env[name2](message), index2);
      }
      case BIGINT:
        return as(BigInt(value), index2);
      case "BigInt":
        return as(Object(BigInt(value)), index2);
      case "ArrayBuffer":
        return as(new Uint8Array(value).buffer, value);
      case "DataView": {
        const { buffer } = new Uint8Array(value);
        return as(new DataView(buffer), value);
      }
    }
    return as(new env[type](value), index2);
  };
  return unpair;
};
const deserialize = (serialized) => deserializer(/* @__PURE__ */ new Map(), serialized)(0);
const EMPTY = "";
const { toString } = {};
const { keys } = Object;
const typeOf = (value) => {
  const type = typeof value;
  if (type !== "object" || !value)
    return [PRIMITIVE, type];
  const asString = toString.call(value).slice(8, -1);
  switch (asString) {
    case "Array":
      return [ARRAY, EMPTY];
    case "Object":
      return [OBJECT, EMPTY];
    case "Date":
      return [DATE, EMPTY];
    case "RegExp":
      return [REGEXP, EMPTY];
    case "Map":
      return [MAP, EMPTY];
    case "Set":
      return [SET, EMPTY];
    case "DataView":
      return [ARRAY, asString];
  }
  if (asString.includes("Array"))
    return [ARRAY, asString];
  if (asString.includes("Error"))
    return [ERROR, asString];
  return [OBJECT, asString];
};
const shouldSkip = ([TYPE, type]) => TYPE === PRIMITIVE && (type === "function" || type === "symbol");
const serializer = (strict, json, $, _) => {
  const as = (out, value) => {
    const index2 = _.push(out) - 1;
    $.set(value, index2);
    return index2;
  };
  const pair = (value) => {
    if ($.has(value))
      return $.get(value);
    let [TYPE, type] = typeOf(value);
    switch (TYPE) {
      case PRIMITIVE: {
        let entry = value;
        switch (type) {
          case "bigint":
            TYPE = BIGINT;
            entry = value.toString();
            break;
          case "function":
          case "symbol":
            if (strict)
              throw new TypeError("unable to serialize " + type);
            entry = null;
            break;
          case "undefined":
            return as([VOID], value);
        }
        return as([TYPE, entry], value);
      }
      case ARRAY: {
        if (type) {
          let spread = value;
          if (type === "DataView") {
            spread = new Uint8Array(value.buffer);
          } else if (type === "ArrayBuffer") {
            spread = new Uint8Array(value);
          }
          return as([type, [...spread]], value);
        }
        const arr = [];
        const index2 = as([TYPE, arr], value);
        for (const entry of value)
          arr.push(pair(entry));
        return index2;
      }
      case OBJECT: {
        if (type) {
          switch (type) {
            case "BigInt":
              return as([type, value.toString()], value);
            case "Boolean":
            case "Number":
            case "String":
              return as([type, value.valueOf()], value);
          }
        }
        if (json && "toJSON" in value)
          return pair(value.toJSON());
        const entries = [];
        const index2 = as([TYPE, entries], value);
        for (const key of keys(value)) {
          if (strict || !shouldSkip(typeOf(value[key])))
            entries.push([pair(key), pair(value[key])]);
        }
        return index2;
      }
      case DATE:
        return as([TYPE, value.toISOString()], value);
      case REGEXP: {
        const { source, flags } = value;
        return as([TYPE, { source, flags }], value);
      }
      case MAP: {
        const entries = [];
        const index2 = as([TYPE, entries], value);
        for (const [key, entry] of value) {
          if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry))))
            entries.push([pair(key), pair(entry)]);
        }
        return index2;
      }
      case SET: {
        const entries = [];
        const index2 = as([TYPE, entries], value);
        for (const entry of value) {
          if (strict || !shouldSkip(typeOf(entry)))
            entries.push(pair(entry));
        }
        return index2;
      }
    }
    const { message } = value;
    return as([TYPE, { name: type, message }], value);
  };
  return pair;
};
const serialize = (value, { json, lossy } = {}) => {
  const _ = [];
  return serializer(!(json || lossy), !!json, /* @__PURE__ */ new Map(), _)(value), _;
};
const structuredClone$1 = typeof structuredClone === "function" ? (
  /* c8 ignore start */
  (any, options) => options && ("json" in options || "lossy" in options) ? deserialize(serialize(any, options)) : structuredClone(any)
) : (any, options) => deserialize(serialize(any, options));
function defaultFootnoteBackContent(_, rereferenceIndex) {
  const result = [{ type: "text", value: "↩" }];
  if (rereferenceIndex > 1) {
    result.push({
      type: "element",
      tagName: "sup",
      properties: {},
      children: [{ type: "text", value: String(rereferenceIndex) }]
    });
  }
  return result;
}
function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
  return "Back to reference " + (referenceIndex + 1) + (rereferenceIndex > 1 ? "-" + rereferenceIndex : "");
}
function footer(state) {
  const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
  const footnoteBackContent = state.options.footnoteBackContent || defaultFootnoteBackContent;
  const footnoteBackLabel = state.options.footnoteBackLabel || defaultFootnoteBackLabel;
  const footnoteLabel = state.options.footnoteLabel || "Footnotes";
  const footnoteLabelTagName = state.options.footnoteLabelTagName || "h2";
  const footnoteLabelProperties = state.options.footnoteLabelProperties || {
    className: ["sr-only"]
  };
  const listItems = [];
  let referenceIndex = -1;
  while (++referenceIndex < state.footnoteOrder.length) {
    const definition2 = state.footnoteById.get(
      state.footnoteOrder[referenceIndex]
    );
    if (!definition2) {
      continue;
    }
    const content2 = state.all(definition2);
    const id = String(definition2.identifier).toUpperCase();
    const safeId = normalizeUri(id.toLowerCase());
    let rereferenceIndex = 0;
    const backReferences = [];
    const counts = state.footnoteCounts.get(id);
    while (counts !== void 0 && ++rereferenceIndex <= counts) {
      if (backReferences.length > 0) {
        backReferences.push({ type: "text", value: " " });
      }
      let children = typeof footnoteBackContent === "string" ? footnoteBackContent : footnoteBackContent(referenceIndex, rereferenceIndex);
      if (typeof children === "string") {
        children = { type: "text", value: children };
      }
      backReferences.push({
        type: "element",
        tagName: "a",
        properties: {
          href: "#" + clobberPrefix + "fnref-" + safeId + (rereferenceIndex > 1 ? "-" + rereferenceIndex : ""),
          dataFootnoteBackref: "",
          ariaLabel: typeof footnoteBackLabel === "string" ? footnoteBackLabel : footnoteBackLabel(referenceIndex, rereferenceIndex),
          className: ["data-footnote-backref"]
        },
        children: Array.isArray(children) ? children : [children]
      });
    }
    const tail = content2[content2.length - 1];
    if (tail && tail.type === "element" && tail.tagName === "p") {
      const tailTail = tail.children[tail.children.length - 1];
      if (tailTail && tailTail.type === "text") {
        tailTail.value += " ";
      } else {
        tail.children.push({ type: "text", value: " " });
      }
      tail.children.push(...backReferences);
    } else {
      content2.push(...backReferences);
    }
    const listItem2 = {
      type: "element",
      tagName: "li",
      properties: { id: clobberPrefix + "fn-" + safeId },
      children: state.wrap(content2, true)
    };
    state.patch(definition2, listItem2);
    listItems.push(listItem2);
  }
  if (listItems.length === 0) {
    return;
  }
  return {
    type: "element",
    tagName: "section",
    properties: { dataFootnotes: true, className: ["footnotes"] },
    children: [
      {
        type: "element",
        tagName: footnoteLabelTagName,
        properties: {
          ...structuredClone$1(footnoteLabelProperties),
          id: "footnote-label"
        },
        children: [{ type: "text", value: footnoteLabel }]
      },
      { type: "text", value: "\n" },
      {
        type: "element",
        tagName: "ol",
        properties: {},
        children: state.wrap(listItems, true)
      },
      { type: "text", value: "\n" }
    ]
  };
}
const convert = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  function(test) {
    if (test === null || test === void 0) {
      return ok;
    }
    if (typeof test === "function") {
      return castFactory(test);
    }
    if (typeof test === "object") {
      return Array.isArray(test) ? anyFactory(test) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        propertiesFactory(
          /** @type {Props} */
          test
        )
      );
    }
    if (typeof test === "string") {
      return typeFactory(test);
    }
    throw new Error("Expected function, string, or object as test");
  }
);
function anyFactory(tests) {
  const checks2 = [];
  let index2 = -1;
  while (++index2 < tests.length) {
    checks2[index2] = convert(tests[index2]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index3 = -1;
    while (++index3 < checks2.length) {
      if (checks2[index3].apply(this, parameters)) return true;
    }
    return false;
  }
}
function propertiesFactory(check) {
  const checkAsRecord = (
    /** @type {Record<string, unknown>} */
    check
  );
  return castFactory(all2);
  function all2(node2) {
    const nodeAsRecord = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      node2
    );
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node2) {
    return node2 && node2.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index2, parent) {
    return Boolean(
      looksLikeANode(value) && testFunction.call(
        this,
        value,
        typeof index2 === "number" ? index2 : void 0,
        parent || void 0
      )
    );
  }
}
function ok() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}
function color(d) {
  return d;
}
const empty = [];
const CONTINUE = true;
const EXIT = false;
const SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, void 0, [])();
  function factory(node2, index2, parents) {
    const value = (
      /** @type {Record<string, unknown>} */
      node2 && typeof node2 === "object" ? node2 : {}
    );
    if (typeof value.type === "string") {
      const name2 = (
        // `hast`
        typeof value.tagName === "string" ? value.tagName : (
          // `xast`
          typeof value.name === "string" ? value.name : void 0
        )
      );
      Object.defineProperty(visit2, "name", {
        value: "node (" + color(node2.type + (name2 ? "<" + name2 + ">" : "")) + ")"
      });
    }
    return visit2;
    function visit2() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is(node2, index2, parents[parents.length - 1] || void 0)) {
        result = toResult(visitor(node2, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node2 && node2.children) {
        const nodeAsParent = (
          /** @type {UnistParent} */
          node2
        );
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === void 0 ? empty : [value];
}
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
    test = void 0;
    visitor = testOrVisitor;
    reverse = visitorOrReverse;
  } else {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node2, parents) {
    const parent = parents[parents.length - 1];
    const index2 = parent ? parent.children.indexOf(node2) : void 0;
    return visitor(node2, index2, parent);
  }
}
const own$1 = {}.hasOwnProperty;
const emptyOptions = {};
function createState(tree, options) {
  const settings = options || emptyOptions;
  const definitionById = /* @__PURE__ */ new Map();
  const footnoteById = /* @__PURE__ */ new Map();
  const footnoteCounts = /* @__PURE__ */ new Map();
  const handlers$1 = { ...handlers, ...settings.handlers };
  const state = {
    all: all2,
    applyData,
    definitionById,
    footnoteById,
    footnoteCounts,
    footnoteOrder: [],
    handlers: handlers$1,
    one: one2,
    options: settings,
    patch,
    wrap: wrap$1
  };
  visit(tree, function(node2) {
    if (node2.type === "definition" || node2.type === "footnoteDefinition") {
      const map = node2.type === "definition" ? definitionById : footnoteById;
      const id = String(node2.identifier).toUpperCase();
      if (!map.has(id)) {
        map.set(id, node2);
      }
    }
  });
  return state;
  function one2(node2, parent) {
    const type = node2.type;
    const handle = state.handlers[type];
    if (own$1.call(state.handlers, type) && handle) {
      return handle(state, node2, parent);
    }
    if (state.options.passThrough && state.options.passThrough.includes(type)) {
      if ("children" in node2) {
        const { children, ...shallow } = node2;
        const result = structuredClone$1(shallow);
        result.children = state.all(node2);
        return result;
      }
      return structuredClone$1(node2);
    }
    const unknown = state.options.unknownHandler || defaultUnknownHandler;
    return unknown(state, node2, parent);
  }
  function all2(parent) {
    const values = [];
    if ("children" in parent) {
      const nodes = parent.children;
      let index2 = -1;
      while (++index2 < nodes.length) {
        const result = state.one(nodes[index2], parent);
        if (result) {
          if (index2 && nodes[index2 - 1].type === "break") {
            if (!Array.isArray(result) && result.type === "text") {
              result.value = trimMarkdownSpaceStart(result.value);
            }
            if (!Array.isArray(result) && result.type === "element") {
              const head = result.children[0];
              if (head && head.type === "text") {
                head.value = trimMarkdownSpaceStart(head.value);
              }
            }
          }
          if (Array.isArray(result)) {
            values.push(...result);
          } else {
            values.push(result);
          }
        }
      }
    }
    return values;
  }
}
function patch(from, to) {
  if (from.position) to.position = position$1(from);
}
function applyData(from, to) {
  let result = to;
  if (from && from.data) {
    const hName = from.data.hName;
    const hChildren = from.data.hChildren;
    const hProperties = from.data.hProperties;
    if (typeof hName === "string") {
      if (result.type === "element") {
        result.tagName = hName;
      } else {
        const children = "children" in result ? result.children : [result];
        result = { type: "element", tagName: hName, properties: {}, children };
      }
    }
    if (result.type === "element" && hProperties) {
      Object.assign(result.properties, structuredClone$1(hProperties));
    }
    if ("children" in result && result.children && hChildren !== null && hChildren !== void 0) {
      result.children = hChildren;
    }
  }
  return result;
}
function defaultUnknownHandler(state, node2) {
  const data = node2.data || {};
  const result = "value" in node2 && !(own$1.call(data, "hProperties") || own$1.call(data, "hChildren")) ? { type: "text", value: node2.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: state.all(node2)
  };
  state.patch(node2, result);
  return state.applyData(node2, result);
}
function wrap$1(nodes, loose) {
  const result = [];
  let index2 = -1;
  if (loose) {
    result.push({ type: "text", value: "\n" });
  }
  while (++index2 < nodes.length) {
    if (index2) result.push({ type: "text", value: "\n" });
    result.push(nodes[index2]);
  }
  if (loose && nodes.length > 0) {
    result.push({ type: "text", value: "\n" });
  }
  return result;
}
function trimMarkdownSpaceStart(value) {
  let index2 = 0;
  let code2 = value.charCodeAt(index2);
  while (code2 === 9 || code2 === 32) {
    index2++;
    code2 = value.charCodeAt(index2);
  }
  return value.slice(index2);
}
function toHast(tree, options) {
  const state = createState(tree, options);
  const node2 = state.one(tree, void 0);
  const foot = footer(state);
  const result = Array.isArray(node2) ? { type: "root", children: node2 } : node2 || { type: "root", children: [] };
  if (foot) {
    result.children.push({ type: "text", value: "\n" }, foot);
  }
  return result;
}
function remarkRehype(destination, options) {
  if (destination && "run" in destination) {
    return async function(tree, file) {
      const hastTree = (
        /** @type {HastRoot} */
        toHast(tree, { file, ...options })
      );
      await destination.run(hastTree, file);
    };
  }
  return function(tree, file) {
    return (
      /** @type {HastRoot} */
      toHast(tree, { file, ...destination || options })
    );
  };
}
function bail(error) {
  if (error) {
    throw error;
  }
}
var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;
var isArray = function isArray2(arr) {
  if (typeof Array.isArray === "function") {
    return Array.isArray(arr);
  }
  return toStr.call(arr) === "[object Array]";
};
var isPlainObject$1 = function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== "[object Object]") {
    return false;
  }
  var hasOwnConstructor = hasOwn.call(obj, "constructor");
  var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }
  var key;
  for (key in obj) {
  }
  return typeof key === "undefined" || hasOwn.call(obj, key);
};
var setProperty = function setProperty2(target, options) {
  if (defineProperty && options.name === "__proto__") {
    defineProperty(target, options.name, {
      enumerable: true,
      configurable: true,
      value: options.newValue,
      writable: true
    });
  } else {
    target[options.name] = options.newValue;
  }
};
var getProperty = function getProperty2(obj, name2) {
  if (name2 === "__proto__") {
    if (!hasOwn.call(obj, name2)) {
      return void 0;
    } else if (gOPD) {
      return gOPD(obj, name2).value;
    }
  }
  return obj[name2];
};
var extend = function extend2() {
  var options, name2, src, copy, copyIsArray, clone;
  var target = arguments[0];
  var i = 1;
  var length = arguments.length;
  var deep = false;
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};
    i = 2;
  }
  if (target == null || typeof target !== "object" && typeof target !== "function") {
    target = {};
  }
  for (; i < length; ++i) {
    options = arguments[i];
    if (options != null) {
      for (name2 in options) {
        src = getProperty(target, name2);
        copy = getProperty(options, name2);
        if (target !== copy) {
          if (deep && copy && (isPlainObject$1(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject$1(src) ? src : {};
            }
            setProperty(target, { name: name2, newValue: extend2(deep, clone, copy) });
          } else if (typeof copy !== "undefined") {
            setProperty(target, { name: name2, newValue: copy });
          }
        }
      }
    }
  }
  return target;
};
const extend$1 = /* @__PURE__ */ getDefaultExportFromCjs(extend);
function isPlainObject2(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
function trough() {
  const fns = [];
  const pipeline = { run, use };
  return pipeline;
  function run(...values) {
    let middlewareIndex = -1;
    const callback = values.pop();
    if (typeof callback !== "function") {
      throw new TypeError("Expected function as last argument, not " + callback);
    }
    next(null, ...values);
    function next(error, ...output) {
      const fn = fns[++middlewareIndex];
      let index2 = -1;
      if (error) {
        callback(error);
        return;
      }
      while (++index2 < values.length) {
        if (output[index2] === null || output[index2] === void 0) {
          output[index2] = values[index2];
        }
      }
      values = output;
      if (fn) {
        wrap(fn, next)(...output);
      } else {
        callback(null, ...output);
      }
    }
  }
  function use(middelware) {
    if (typeof middelware !== "function") {
      throw new TypeError(
        "Expected `middelware` to be a function, not " + middelware
      );
    }
    fns.push(middelware);
    return pipeline;
  }
}
function wrap(middleware, callback) {
  let called;
  return wrapped;
  function wrapped(...parameters) {
    const fnExpectsCallback = middleware.length > parameters.length;
    let result;
    if (fnExpectsCallback) {
      parameters.push(done);
    }
    try {
      result = middleware.apply(this, parameters);
    } catch (error) {
      const exception = (
        /** @type {Error} */
        error
      );
      if (fnExpectsCallback && called) {
        throw exception;
      }
      return done(exception);
    }
    if (!fnExpectsCallback) {
      if (result && result.then && typeof result.then === "function") {
        result.then(then, done);
      } else if (result instanceof Error) {
        done(result);
      } else {
        then(result);
      }
    }
  }
  function done(error, ...output) {
    if (!called) {
      called = true;
      callback(error, ...output);
    }
  }
  function then(value) {
    done(null, value);
  }
}
const minpath = { basename, dirname, extname, join, sep: "/" };
function basename(path, extname2) {
  if (extname2 !== void 0 && typeof extname2 !== "string") {
    throw new TypeError('"ext" argument must be a string');
  }
  assertPath$1(path);
  let start = 0;
  let end = -1;
  let index2 = path.length;
  let seenNonSlash;
  if (extname2 === void 0 || extname2.length === 0 || extname2.length > path.length) {
    while (index2--) {
      if (path.codePointAt(index2) === 47) {
        if (seenNonSlash) {
          start = index2 + 1;
          break;
        }
      } else if (end < 0) {
        seenNonSlash = true;
        end = index2 + 1;
      }
    }
    return end < 0 ? "" : path.slice(start, end);
  }
  if (extname2 === path) {
    return "";
  }
  let firstNonSlashEnd = -1;
  let extnameIndex = extname2.length - 1;
  while (index2--) {
    if (path.codePointAt(index2) === 47) {
      if (seenNonSlash) {
        start = index2 + 1;
        break;
      }
    } else {
      if (firstNonSlashEnd < 0) {
        seenNonSlash = true;
        firstNonSlashEnd = index2 + 1;
      }
      if (extnameIndex > -1) {
        if (path.codePointAt(index2) === extname2.codePointAt(extnameIndex--)) {
          if (extnameIndex < 0) {
            end = index2;
          }
        } else {
          extnameIndex = -1;
          end = firstNonSlashEnd;
        }
      }
    }
  }
  if (start === end) {
    end = firstNonSlashEnd;
  } else if (end < 0) {
    end = path.length;
  }
  return path.slice(start, end);
}
function dirname(path) {
  assertPath$1(path);
  if (path.length === 0) {
    return ".";
  }
  let end = -1;
  let index2 = path.length;
  let unmatchedSlash;
  while (--index2) {
    if (path.codePointAt(index2) === 47) {
      if (unmatchedSlash) {
        end = index2;
        break;
      }
    } else if (!unmatchedSlash) {
      unmatchedSlash = true;
    }
  }
  return end < 0 ? path.codePointAt(0) === 47 ? "/" : "." : end === 1 && path.codePointAt(0) === 47 ? "//" : path.slice(0, end);
}
function extname(path) {
  assertPath$1(path);
  let index2 = path.length;
  let end = -1;
  let startPart = 0;
  let startDot = -1;
  let preDotState = 0;
  let unmatchedSlash;
  while (index2--) {
    const code2 = path.codePointAt(index2);
    if (code2 === 47) {
      if (unmatchedSlash) {
        startPart = index2 + 1;
        break;
      }
      continue;
    }
    if (end < 0) {
      unmatchedSlash = true;
      end = index2 + 1;
    }
    if (code2 === 46) {
      if (startDot < 0) {
        startDot = index2;
      } else if (preDotState !== 1) {
        preDotState = 1;
      }
    } else if (startDot > -1) {
      preDotState = -1;
    }
  }
  if (startDot < 0 || end < 0 || // We saw a non-dot character immediately before the dot.
  preDotState === 0 || // The (right-most) trimmed path component is exactly `..`.
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return "";
  }
  return path.slice(startDot, end);
}
function join(...segments) {
  let index2 = -1;
  let joined;
  while (++index2 < segments.length) {
    assertPath$1(segments[index2]);
    if (segments[index2]) {
      joined = joined === void 0 ? segments[index2] : joined + "/" + segments[index2];
    }
  }
  return joined === void 0 ? "." : normalize(joined);
}
function normalize(path) {
  assertPath$1(path);
  const absolute = path.codePointAt(0) === 47;
  let value = normalizeString(path, !absolute);
  if (value.length === 0 && !absolute) {
    value = ".";
  }
  if (value.length > 0 && path.codePointAt(path.length - 1) === 47) {
    value += "/";
  }
  return absolute ? "/" + value : value;
}
function normalizeString(path, allowAboveRoot) {
  let result = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let index2 = -1;
  let code2;
  let lastSlashIndex;
  while (++index2 <= path.length) {
    if (index2 < path.length) {
      code2 = path.codePointAt(index2);
    } else if (code2 === 47) {
      break;
    } else {
      code2 = 47;
    }
    if (code2 === 47) {
      if (lastSlash === index2 - 1 || dots === 1) ;
      else if (lastSlash !== index2 - 1 && dots === 2) {
        if (result.length < 2 || lastSegmentLength !== 2 || result.codePointAt(result.length - 1) !== 46 || result.codePointAt(result.length - 2) !== 46) {
          if (result.length > 2) {
            lastSlashIndex = result.lastIndexOf("/");
            if (lastSlashIndex !== result.length - 1) {
              if (lastSlashIndex < 0) {
                result = "";
                lastSegmentLength = 0;
              } else {
                result = result.slice(0, lastSlashIndex);
                lastSegmentLength = result.length - 1 - result.lastIndexOf("/");
              }
              lastSlash = index2;
              dots = 0;
              continue;
            }
          } else if (result.length > 0) {
            result = "";
            lastSegmentLength = 0;
            lastSlash = index2;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          result = result.length > 0 ? result + "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (result.length > 0) {
          result += "/" + path.slice(lastSlash + 1, index2);
        } else {
          result = path.slice(lastSlash + 1, index2);
        }
        lastSegmentLength = index2 - lastSlash - 1;
      }
      lastSlash = index2;
      dots = 0;
    } else if (code2 === 46 && dots > -1) {
      dots++;
    } else {
      dots = -1;
    }
  }
  return result;
}
function assertPath$1(path) {
  if (typeof path !== "string") {
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(path)
    );
  }
}
const minproc = { cwd };
function cwd() {
  return "/";
}
function isUrl(fileUrlOrPath) {
  return Boolean(
    fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && // @ts-expect-error: indexing is fine.
    fileUrlOrPath.auth === void 0
  );
}
function urlToPath(path) {
  if (typeof path === "string") {
    path = new URL(path);
  } else if (!isUrl(path)) {
    const error = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + path + "`"
    );
    error.code = "ERR_INVALID_ARG_TYPE";
    throw error;
  }
  if (path.protocol !== "file:") {
    const error = new TypeError("The URL must be of scheme file");
    error.code = "ERR_INVALID_URL_SCHEME";
    throw error;
  }
  return getPathFromURLPosix(path);
}
function getPathFromURLPosix(url) {
  if (url.hostname !== "") {
    const error = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    );
    error.code = "ERR_INVALID_FILE_URL_HOST";
    throw error;
  }
  const pathname = url.pathname;
  let index2 = -1;
  while (++index2 < pathname.length) {
    if (pathname.codePointAt(index2) === 37 && pathname.codePointAt(index2 + 1) === 50) {
      const third = pathname.codePointAt(index2 + 2);
      if (third === 70 || third === 102) {
        const error = new TypeError(
          "File URL path must not include encoded / characters"
        );
        error.code = "ERR_INVALID_FILE_URL_PATH";
        throw error;
      }
    }
  }
  return decodeURIComponent(pathname);
}
const order = (
  /** @type {const} */
  [
    "history",
    "path",
    "basename",
    "stem",
    "extname",
    "dirname"
  ]
);
class VFile {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Uint8Array` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(value) {
    let options;
    if (!value) {
      options = {};
    } else if (isUrl(value)) {
      options = { path: value };
    } else if (typeof value === "string" || isUint8Array$1(value)) {
      options = { value };
    } else {
      options = value;
    }
    this.cwd = "cwd" in options ? "" : minproc.cwd();
    this.data = {};
    this.history = [];
    this.messages = [];
    this.value;
    this.map;
    this.result;
    this.stored;
    let index2 = -1;
    while (++index2 < order.length) {
      const field2 = order[index2];
      if (field2 in options && options[field2] !== void 0 && options[field2] !== null) {
        this[field2] = field2 === "history" ? [...options[field2]] : options[field2];
      }
    }
    let field;
    for (field in options) {
      if (!order.includes(field)) {
        this[field] = options[field];
      }
    }
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path === "string" ? minpath.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} basename
   *   Basename.
   * @returns {undefined}
   *   Nothing.
   */
  set basename(basename2) {
    assertNonEmpty(basename2, "basename");
    assertPart(basename2, "basename");
    this.path = minpath.join(this.dirname || "", basename2);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path === "string" ? minpath.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} dirname
   *   Dirname.
   * @returns {undefined}
   *   Nothing.
   */
  set dirname(dirname2) {
    assertPath(this.basename, "dirname");
    this.path = minpath.join(dirname2 || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path === "string" ? minpath.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} extname
   *   Extname.
   * @returns {undefined}
   *   Nothing.
   */
  set extname(extname2) {
    assertPart(extname2, "extname");
    assertPath(this.dirname, "extname");
    if (extname2) {
      if (extname2.codePointAt(0) !== 46) {
        throw new Error("`extname` must start with `.`");
      }
      if (extname2.includes(".", 1)) {
        throw new Error("`extname` cannot contain multiple dots");
      }
    }
    this.path = minpath.join(this.dirname, this.stem + (extname2 || ""));
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   *   Path.
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {URL | string} path
   *   Path.
   * @returns {undefined}
   *   Nothing.
   */
  set path(path) {
    if (isUrl(path)) {
      path = urlToPath(path);
    }
    assertNonEmpty(path, "path");
    if (this.path !== path) {
      this.history.push(path);
    }
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path === "string" ? minpath.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} stem
   *   Stem.
   * @returns {undefined}
   *   Nothing.
   */
  set stem(stem) {
    assertNonEmpty(stem, "stem");
    assertPart(stem, "stem");
    this.path = minpath.join(this.dirname || "", stem + (this.extname || ""));
  }
  // Normal prototypal methods.
  /**
   * Create a fatal message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `true` (error; file not usable)
   * and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Never.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(causeOrReason, optionsOrParentOrPlace, origin) {
    const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
    message.fatal = true;
    throw message;
  }
  /**
   * Create an info message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `undefined` (info; change
   * likely not needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(causeOrReason, optionsOrParentOrPlace, origin) {
    const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
    message.fatal = void 0;
    return message;
  }
  /**
   * Create a message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `false` (warning; change may be
   * needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(causeOrReason, optionsOrParentOrPlace, origin) {
    const message = new VFileMessage(
      // @ts-expect-error: the overloads are fine.
      causeOrReason,
      optionsOrParentOrPlace,
      origin
    );
    if (this.path) {
      message.name = this.path + ":" + message.name;
      message.file = this.path;
    }
    message.fatal = false;
    this.messages.push(message);
    return message;
  }
  /**
   * Serialize the file.
   *
   * > **Note**: which encodings are supported depends on the engine.
   * > For info on Node.js, see:
   * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
   *
   * @param {string | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Uint8Array`
   *   (default: `'utf-8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(encoding) {
    if (this.value === void 0) {
      return "";
    }
    if (typeof this.value === "string") {
      return this.value;
    }
    const decoder = new TextDecoder(encoding || void 0);
    return decoder.decode(this.value);
  }
}
function assertPart(part, name2) {
  if (part && part.includes(minpath.sep)) {
    throw new Error(
      "`" + name2 + "` cannot be a path: did not expect `" + minpath.sep + "`"
    );
  }
}
function assertNonEmpty(part, name2) {
  if (!part) {
    throw new Error("`" + name2 + "` cannot be empty");
  }
}
function assertPath(path, name2) {
  if (!path) {
    throw new Error("Setting `" + name2 + "` requires `path` to be set too");
  }
}
function isUint8Array$1(value) {
  return Boolean(
    value && typeof value === "object" && "byteLength" in value && "byteOffset" in value
  );
}
const CallableInstance = (
  /**
   * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
   */
  /** @type {unknown} */
  /**
   * @this {Function}
   * @param {string | symbol} property
   * @returns {(...parameters: Array<unknown>) => unknown}
   */
  function(property) {
    const self2 = this;
    const constr = self2.constructor;
    const proto = (
      /** @type {Record<string | symbol, Function>} */
      // Prototypes do exist.
      // type-coverage:ignore-next-line
      constr.prototype
    );
    const value = proto[property];
    const apply = function() {
      return value.apply(apply, arguments);
    };
    Object.setPrototypeOf(apply, proto);
    return apply;
  }
);
const own = {}.hasOwnProperty;
class Processor extends CallableInstance {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy");
    this.Compiler = void 0;
    this.Parser = void 0;
    this.attachers = [];
    this.compiler = void 0;
    this.freezeIndex = -1;
    this.frozen = void 0;
    this.namespace = {};
    this.parser = void 0;
    this.transformers = trough();
  }
  /**
   * Copy a processor.
   *
   * @deprecated
   *   This is a private internal method and should not be used.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   New *unfrozen* processor ({@linkcode Processor}) that is
   *   configured to work the same as its ancestor.
   *   When the descendant processor is configured in the future it does not
   *   affect the ancestral processor.
   */
  copy() {
    const destination = (
      /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */
      new Processor()
    );
    let index2 = -1;
    while (++index2 < this.attachers.length) {
      const attacher = this.attachers[index2];
      destination.use(...attacher);
    }
    destination.data(extend$1(true, {}, this.namespace));
    return destination;
  }
  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * > **Note**: setting information cannot occur on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * > **Note**: to register custom data in TypeScript, augment the
   * > {@linkcode Data} interface.
   *
   * @example
   *   This example show how to get and set info:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   const processor = unified().data('alpha', 'bravo')
   *
   *   processor.data('alpha') // => 'bravo'
   *
   *   processor.data() // => {alpha: 'bravo'}
   *
   *   processor.data({charlie: 'delta'})
   *
   *   processor.data() // => {charlie: 'delta'}
   *   ```
   *
   * @template {keyof Data} Key
   *
   * @overload
   * @returns {Data}
   *
   * @overload
   * @param {Data} dataset
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Key} key
   * @returns {Data[Key]}
   *
   * @overload
   * @param {Key} key
   * @param {Data[Key]} value
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @param {Data | Key} [key]
   *   Key to get or set, or entire dataset to set, or nothing to get the
   *   entire dataset (optional).
   * @param {Data[Key]} [value]
   *   Value to set (optional).
   * @returns {unknown}
   *   The current processor when setting, the value at `key` when getting, or
   *   the entire dataset when getting without key.
   */
  data(key, value) {
    if (typeof key === "string") {
      if (arguments.length === 2) {
        assertUnfrozen("data", this.frozen);
        this.namespace[key] = value;
        return this;
      }
      return own.call(this.namespace, key) && this.namespace[key] || void 0;
    }
    if (key) {
      assertUnfrozen("data", this.frozen);
      this.namespace = key;
      return this;
    }
    return this.namespace;
  }
  /**
   * Freeze a processor.
   *
   * Frozen processors are meant to be extended and not to be configured
   * directly.
   *
   * When a processor is frozen it cannot be unfrozen.
   * New processors working the same way can be created by calling the
   * processor.
   *
   * It’s possible to freeze processors explicitly by calling `.freeze()`.
   * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
   * `.stringify()`, `.process()`, or `.processSync()` are called.
   *
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   The current processor.
   */
  freeze() {
    if (this.frozen) {
      return this;
    }
    const self2 = (
      /** @type {Processor} */
      /** @type {unknown} */
      this
    );
    while (++this.freezeIndex < this.attachers.length) {
      const [attacher, ...options] = this.attachers[this.freezeIndex];
      if (options[0] === false) {
        continue;
      }
      if (options[0] === true) {
        options[0] = void 0;
      }
      const transformer = attacher.call(self2, ...options);
      if (typeof transformer === "function") {
        this.transformers.use(transformer);
      }
    }
    this.frozen = true;
    this.freezeIndex = Number.POSITIVE_INFINITY;
    return this;
  }
  /**
   * Parse text to a syntax tree.
   *
   * > **Note**: `parse` freezes the processor if not already *frozen*.
   *
   * > **Note**: `parse` performs the parse phase, not the run phase or other
   * > phases.
   *
   * @param {Compatible | undefined} [file]
   *   file to parse (optional); typically `string` or `VFile`; any value
   *   accepted as `x` in `new VFile(x)`.
   * @returns {ParseTree extends undefined ? Node : ParseTree}
   *   Syntax tree representing `file`.
   */
  parse(file) {
    this.freeze();
    const realFile = vfile(file);
    const parser = this.parser || this.Parser;
    assertParser("parse", parser);
    return parser(String(realFile), realFile);
  }
  /**
   * Process the given file as configured on the processor.
   *
   * > **Note**: `process` freezes the processor if not already *frozen*.
   *
   * > **Note**: `process` performs the parse, run, and stringify phases.
   *
   * @overload
   * @param {Compatible | undefined} file
   * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
   * @returns {undefined}
   *
   * @overload
   * @param {Compatible | undefined} [file]
   * @returns {Promise<VFileWithOutput<CompileResult>>}
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`]; any value accepted as
   *   `x` in `new VFile(x)`.
   * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
   *   Callback (optional).
   * @returns {Promise<VFile> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise a promise, rejected with a fatal error or resolved with the
   *   processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  process(file, done) {
    const self2 = this;
    this.freeze();
    assertParser("process", this.parser || this.Parser);
    assertCompiler("process", this.compiler || this.Compiler);
    return done ? executor(void 0, done) : new Promise(executor);
    function executor(resolve, reject) {
      const realFile = vfile(file);
      const parseTree = (
        /** @type {HeadTree extends undefined ? Node : HeadTree} */
        /** @type {unknown} */
        self2.parse(realFile)
      );
      self2.run(parseTree, realFile, function(error, tree, file2) {
        if (error || !tree || !file2) {
          return realDone(error);
        }
        const compileTree = (
          /** @type {CompileTree extends undefined ? Node : CompileTree} */
          /** @type {unknown} */
          tree
        );
        const compileResult = self2.stringify(compileTree, file2);
        if (looksLikeAValue(compileResult)) {
          file2.value = compileResult;
        } else {
          file2.result = compileResult;
        }
        realDone(
          error,
          /** @type {VFileWithOutput<CompileResult>} */
          file2
        );
      });
      function realDone(error, file2) {
        if (error || !file2) {
          reject(error);
        } else if (resolve) {
          resolve(file2);
        } else {
          done(void 0, file2);
        }
      }
    }
  }
  /**
   * Process the given file as configured on the processor.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `processSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `processSync` performs the parse, run, and stringify phases.
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`; any value accepted as
   *   `x` in `new VFile(x)`.
   * @returns {VFileWithOutput<CompileResult>}
   *   The processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  processSync(file) {
    let complete = false;
    let result;
    this.freeze();
    assertParser("processSync", this.parser || this.Parser);
    assertCompiler("processSync", this.compiler || this.Compiler);
    this.process(file, realDone);
    assertDone("processSync", "process", complete);
    return result;
    function realDone(error, file2) {
      complete = true;
      bail(error);
      result = file2;
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * > **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > **Note**: `run` performs the run phase, not other phases.
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} file
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} [file]
   * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {(
   *   RunCallback<TailTree extends undefined ? Node : TailTree> |
   *   Compatible
   * )} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
   *   Callback (optional).
   * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise, a promise rejected with a fatal error or resolved with the
   *   transformed tree.
   */
  run(tree, file, done) {
    assertNode(tree);
    this.freeze();
    const transformers = this.transformers;
    if (!done && typeof file === "function") {
      done = file;
      file = void 0;
    }
    return done ? executor(void 0, done) : new Promise(executor);
    function executor(resolve, reject) {
      const realFile = vfile(file);
      transformers.run(tree, realFile, realDone);
      function realDone(error, outputTree, file2) {
        const resultingTree = (
          /** @type {TailTree extends undefined ? Node : TailTree} */
          outputTree || tree
        );
        if (error) {
          reject(error);
        } else if (resolve) {
          resolve(resultingTree);
        } else {
          done(void 0, resultingTree, file2);
        }
      }
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `runSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `runSync` performs the run phase, not other phases.
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {TailTree extends undefined ? Node : TailTree}
   *   Transformed tree.
   */
  runSync(tree, file) {
    let complete = false;
    let result;
    this.run(tree, file, realDone);
    assertDone("runSync", "run", complete);
    return result;
    function realDone(error, tree2) {
      bail(error);
      result = tree2;
      complete = true;
    }
  }
  /**
   * Compile a syntax tree.
   *
   * > **Note**: `stringify` freezes the processor if not already *frozen*.
   *
   * > **Note**: `stringify` performs the stringify phase, not the run phase
   * > or other phases.
   *
   * @param {CompileTree extends undefined ? Node : CompileTree} tree
   *   Tree to compile.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {CompileResult extends undefined ? Value : CompileResult}
   *   Textual representation of the tree (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most compilers
   *   > return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  stringify(tree, file) {
    this.freeze();
    const realFile = vfile(file);
    const compiler2 = this.compiler || this.Compiler;
    assertCompiler("stringify", compiler2);
    assertNode(tree);
    return compiler2(tree, realFile);
  }
  /**
   * Configure the processor to use a plugin, a list of usable values, or a
   * preset.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * > **Note**: `use` cannot be called on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * @example
   *   There are many ways to pass plugins to `.use()`.
   *   This example gives an overview:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugin with options:
   *     .use(pluginA, {x: true, y: true})
   *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
   *     .use(pluginA, {y: false, z: true})
   *     // Plugins:
   *     .use([pluginB, pluginC])
   *     // Two plugins, the second with options:
   *     .use([pluginD, [pluginE, {}]])
   *     // Preset with plugins and settings:
   *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
   *     // Settings only:
   *     .use({settings: {position: false}})
   *   ```
   *
   * @template {Array<unknown>} [Parameters=[]]
   * @template {Node | string | undefined} [Input=undefined]
   * @template [Output=Input]
   *
   * @overload
   * @param {Preset | null | undefined} [preset]
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {PluggableList} list
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Plugin<Parameters, Input, Output>} plugin
   * @param {...(Parameters | [boolean])} parameters
   * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
   *
   * @param {PluggableList | Plugin | Preset | null | undefined} value
   *   Usable value.
   * @param {...unknown} parameters
   *   Parameters, when a plugin is given as a usable value.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   Current processor.
   */
  use(value, ...parameters) {
    const attachers = this.attachers;
    const namespace = this.namespace;
    assertUnfrozen("use", this.frozen);
    if (value === null || value === void 0) ;
    else if (typeof value === "function") {
      addPlugin(value, parameters);
    } else if (typeof value === "object") {
      if (Array.isArray(value)) {
        addList(value);
      } else {
        addPreset(value);
      }
    } else {
      throw new TypeError("Expected usable value, not `" + value + "`");
    }
    return this;
    function add(value2) {
      if (typeof value2 === "function") {
        addPlugin(value2, []);
      } else if (typeof value2 === "object") {
        if (Array.isArray(value2)) {
          const [plugin, ...parameters2] = (
            /** @type {PluginTuple<Array<unknown>>} */
            value2
          );
          addPlugin(plugin, parameters2);
        } else {
          addPreset(value2);
        }
      } else {
        throw new TypeError("Expected usable value, not `" + value2 + "`");
      }
    }
    function addPreset(result) {
      if (!("plugins" in result) && !("settings" in result)) {
        throw new Error(
          "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither"
        );
      }
      addList(result.plugins);
      if (result.settings) {
        namespace.settings = extend$1(true, namespace.settings, result.settings);
      }
    }
    function addList(plugins) {
      let index2 = -1;
      if (plugins === null || plugins === void 0) ;
      else if (Array.isArray(plugins)) {
        while (++index2 < plugins.length) {
          const thing = plugins[index2];
          add(thing);
        }
      } else {
        throw new TypeError("Expected a list of plugins, not `" + plugins + "`");
      }
    }
    function addPlugin(plugin, parameters2) {
      let index2 = -1;
      let entryIndex = -1;
      while (++index2 < attachers.length) {
        if (attachers[index2][0] === plugin) {
          entryIndex = index2;
          break;
        }
      }
      if (entryIndex === -1) {
        attachers.push([plugin, ...parameters2]);
      } else if (parameters2.length > 0) {
        let [primary, ...rest] = parameters2;
        const currentPrimary = attachers[entryIndex][1];
        if (isPlainObject2(currentPrimary) && isPlainObject2(primary)) {
          primary = extend$1(true, currentPrimary, primary);
        }
        attachers[entryIndex] = [plugin, primary, ...rest];
      }
    }
  }
}
const unified = new Processor().freeze();
function assertParser(name2, value) {
  if (typeof value !== "function") {
    throw new TypeError("Cannot `" + name2 + "` without `parser`");
  }
}
function assertCompiler(name2, value) {
  if (typeof value !== "function") {
    throw new TypeError("Cannot `" + name2 + "` without `compiler`");
  }
}
function assertUnfrozen(name2, frozen) {
  if (frozen) {
    throw new Error(
      "Cannot call `" + name2 + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
  }
}
function assertNode(node2) {
  if (!isPlainObject2(node2) || typeof node2.type !== "string") {
    throw new TypeError("Expected node, got `" + node2 + "`");
  }
}
function assertDone(name2, asyncName, complete) {
  if (!complete) {
    throw new Error(
      "`" + name2 + "` finished async. Use `" + asyncName + "` instead"
    );
  }
}
function vfile(value) {
  return looksLikeAVFile(value) ? value : new VFile(value);
}
function looksLikeAVFile(value) {
  return Boolean(
    value && typeof value === "object" && "message" in value && "messages" in value
  );
}
function looksLikeAValue(value) {
  return typeof value === "string" || isUint8Array(value);
}
function isUint8Array(value) {
  return Boolean(
    value && typeof value === "object" && "byteLength" in value && "byteOffset" in value
  );
}
const changelog = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md";
const emptyPlugins = [];
const emptyRemarkRehypeOptions = { allowDangerousHtml: true };
const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;
const deprecations = [
  { from: "astPlugins", id: "remove-buggy-html-in-markdown-parser" },
  { from: "allowDangerousHtml", id: "remove-buggy-html-in-markdown-parser" },
  {
    from: "allowNode",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "allowElement"
  },
  {
    from: "allowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "allowedElements"
  },
  {
    from: "disallowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "disallowedElements"
  },
  { from: "escapeHtml", id: "remove-buggy-html-in-markdown-parser" },
  { from: "includeElementIndex", id: "#remove-includeelementindex" },
  {
    from: "includeNodeIndex",
    id: "change-includenodeindex-to-includeelementindex"
  },
  { from: "linkTarget", id: "remove-linktarget" },
  { from: "plugins", id: "change-plugins-to-remarkplugins", to: "remarkPlugins" },
  { from: "rawSourcePos", id: "#remove-rawsourcepos" },
  { from: "renderers", id: "change-renderers-to-components", to: "components" },
  { from: "source", id: "change-source-to-children", to: "children" },
  { from: "sourcePos", id: "#remove-sourcepos" },
  { from: "transformImageUri", id: "#add-urltransform", to: "urlTransform" },
  { from: "transformLinkUri", id: "#add-urltransform", to: "urlTransform" }
];
function Markdown(options) {
  const processor = createProcessor(options);
  const file = createFile(options);
  return post(processor.runSync(processor.parse(file), file), options);
}
function createProcessor(options) {
  const rehypePlugins = options.rehypePlugins || emptyPlugins;
  const remarkPlugins = options.remarkPlugins || emptyPlugins;
  const remarkRehypeOptions = options.remarkRehypeOptions ? { ...options.remarkRehypeOptions, ...emptyRemarkRehypeOptions } : emptyRemarkRehypeOptions;
  const processor = unified().use(remarkParse).use(remarkPlugins).use(remarkRehype, remarkRehypeOptions).use(rehypePlugins);
  return processor;
}
function createFile(options) {
  const children = options.children || "";
  const file = new VFile();
  if (typeof children === "string") {
    file.value = children;
  }
  return file;
}
function post(tree, options) {
  const allowedElements = options.allowedElements;
  const allowElement = options.allowElement;
  const components = options.components;
  const disallowedElements = options.disallowedElements;
  const skipHtml = options.skipHtml;
  const unwrapDisallowed = options.unwrapDisallowed;
  const urlTransform = options.urlTransform || defaultUrlTransform;
  for (const deprecation of deprecations) {
    if (Object.hasOwn(options, deprecation.from)) {
      unreachable(
        "Unexpected `" + deprecation.from + "` prop, " + (deprecation.to ? "use `" + deprecation.to + "` instead" : "remove it") + " (see <" + changelog + "#" + deprecation.id + "> for more info)"
      );
    }
  }
  if (options.className) {
    tree = {
      type: "element",
      tagName: "div",
      properties: { className: options.className },
      // Assume no doctypes.
      children: (
        /** @type {Array<ElementContent>} */
        tree.type === "root" ? tree.children : [tree]
      )
    };
  }
  visit(tree, transform);
  return toJsxRuntime(tree, {
    Fragment: jsxRuntimeExports.Fragment,
    // @ts-expect-error
    // React components are allowed to return numbers,
    // but not according to the types in hast-util-to-jsx-runtime
    components,
    ignoreInvalidStyle: true,
    jsx: jsxRuntimeExports.jsx,
    jsxs: jsxRuntimeExports.jsxs,
    passKeys: true,
    passNode: true
  });
  function transform(node2, index2, parent) {
    if (node2.type === "raw" && parent && typeof index2 === "number") {
      if (skipHtml) {
        parent.children.splice(index2, 1);
      } else {
        parent.children[index2] = { type: "text", value: node2.value };
      }
      return index2;
    }
    if (node2.type === "element") {
      let key;
      for (key in urlAttributes) {
        if (Object.hasOwn(urlAttributes, key) && Object.hasOwn(node2.properties, key)) {
          const value = node2.properties[key];
          const test = urlAttributes[key];
          if (test === null || test.includes(node2.tagName)) {
            node2.properties[key] = urlTransform(String(value || ""), key, node2);
          }
        }
      }
    }
    if (node2.type === "element") {
      let remove = allowedElements ? !allowedElements.includes(node2.tagName) : disallowedElements ? disallowedElements.includes(node2.tagName) : false;
      if (!remove && allowElement && typeof index2 === "number") {
        remove = !allowElement(node2, index2, parent);
      }
      if (remove && parent && typeof index2 === "number") {
        if (unwrapDisallowed && node2.children) {
          parent.children.splice(index2, 1, ...node2.children);
        } else {
          parent.children.splice(index2, 1);
        }
        return index2;
      }
    }
  }
}
function defaultUrlTransform(value) {
  const colon = value.indexOf(":");
  const questionMark = value.indexOf("?");
  const numberSign = value.indexOf("#");
  const slash = value.indexOf("/");
  if (
    // If there is no protocol, it’s relative.
    colon === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    slash !== -1 && colon > slash || questionMark !== -1 && colon > questionMark || numberSign !== -1 && colon > numberSign || // It is a protocol, it should be allowed.
    safeProtocol.test(value.slice(0, colon))
  ) {
    return value;
  }
  return "";
}
const INDEX_STYLES = {
  documentacoes: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "14 2 14 8 20 8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" })
    ] })
  },
  tickets: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 5v2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 11v2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 17v2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 5a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1 1 1 0 0 1 0 2 1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a1 1 0 0 0-1-1 1 1 0 0 1 0-2 1 1 0 0 0 1-1V7a2 2 0 0 0-2-2H5z" })
    ] })
  },
  sistemas: {
    bg: "bg-green-500/15",
    text: "text-green-400",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })
    ] })
  },
  solucoes: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "2", x2: "12", y2: "6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "18", x2: "12", y2: "22" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 8l2-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 18l2-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 8L6 6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 18l-2-2" })
    ] })
  }
};
const DEFAULT_STYLE = {
  bg: "bg-zinc-500/15",
  text: "text-zinc-400",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })
  ] })
};
const SourceBadge = ({ index: index2, title }) => {
  const style = INDEX_STYLES[index2] || DEFAULT_STYLE;
  const displayLabel = index2.charAt(0).toUpperCase() + index2.slice(1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
        ${style.bg} ${style.text} cursor-default transition-opacity hover:opacity-80`,
      title,
      children: [
        style.icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[120px] truncate", children: displayLabel })
      ]
    }
  );
};
function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
const TekiAvatar = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 rounded-full bg-accent-light flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-accent",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 22c4.97 0 9-2.69 9-6v-2c0-3.31-4.03-6-9-6s-9 2.69-9 6v2c0 3.31 4.03 6 9 6z" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 14V6l4 4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 14V6l-4 4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "14", r: "1", fill: "currentColor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "15", cy: "14", r: "1", fill: "currentColor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 17v-1" })
    ]
  }
) });
const UserAvatar = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-text-secondary",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "7", r: "4" })
    ]
  }
) });
const ThinkingIndicator = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 py-1", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: "text-text-muted animate-pulse",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
      ]
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-text-muted", children: "Analisando..." })
] });
const MessageBubble = ({ message, sources }) => {
  const isUser = message.role === "user";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex gap-3 ${isUser ? "justify-end" : "justify-start"}`, children: [
    !isUser && /* @__PURE__ */ jsxRuntimeExports.jsx(TekiAvatar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col max-w-[85%] min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `rounded-2xl px-4 py-3 ${isUser ? "bg-accent text-text-primary rounded-br-md" : "bg-surface border border-border text-text-primary rounded-bl-md"}`,
          children: isUser ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: message.content }) : message.content ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: message.content }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ThinkingIndicator, {})
        }
      ),
      !isUser && sources && sources.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-2 px-1", children: sources.map((source, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SourceBadge, { index: source.index, title: source.title }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `text-[10px] text-text-muted mt-1 ${isUser ? "text-right pr-1" : "pl-1"}`,
          children: formatTimestamp(message.timestamp)
        }
      )
    ] }),
    isUser && /* @__PURE__ */ jsxRuntimeExports.jsx(UserAvatar, {})
  ] });
};
const ChatInput = ({
  value,
  onChange,
  onSend,
  onScreenshot,
  disabled = false
}) => {
  const textareaRef = reactExports.useRef(null);
  const handleKeyDown = reactExports.useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && value.trim()) {
          onSend();
        }
      }
    },
    [disabled, value, onSend]
  );
  const handleChange = reactExports.useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange]
  );
  const handleSendClick = reactExports.useCallback(() => {
    if (!disabled && value.trim()) {
      onSend();
      textareaRef.current?.focus();
    }
  }, [disabled, value, onSend]);
  const handleScreenshotClick = reactExports.useCallback(() => {
    if (onScreenshot && !disabled) {
      onScreenshot();
    }
  }, [onScreenshot, disabled]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 border-t border-border bg-bg", children: [
    onScreenshot && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleScreenshotClick,
        disabled,
        className: "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg\n                     border border-border bg-surface text-text-muted\n                     hover:bg-surface-hover hover:text-text-secondary\n                     disabled:opacity-40 disabled:cursor-not-allowed\n                     transition-colors",
        title: "Capturar tela",
        type: "button",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "13", r: "4" })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        ref: textareaRef,
        value,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        disabled,
        placeholder: "Descreva o problema tecnico...",
        rows: 1,
        className: "flex-1 resize-none rounded-lg border border-border bg-surface\n                   text-sm text-text-primary placeholder-text-muted\n                   px-4\n                   focus:outline-none focus:border-accent\n                   disabled:opacity-50 disabled:cursor-not-allowed\n                   transition-colors\n                   [overflow-y:scroll] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        style: { height: 40, lineHeight: "20px", paddingTop: 10, paddingBottom: 10 }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleSendClick,
        disabled: disabled || !value.trim(),
        className: "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg\n                   bg-accent text-text-primary\n                   hover:bg-accent-hover\n                   disabled:opacity-40 disabled:cursor-not-allowed\n                   transition-colors",
        title: "Enviar mensagem",
        type: "button",
        children: disabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            className: "animate-spin",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            width: "18",
            height: "18",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })
            ]
          }
        )
      }
    )
  ] });
};
const TEKI_API_URL = "http://localhost:3000";
async function sendMessage(messages, context, model) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const screenshot = context?.screenshot;
  const body = {
    messages,
    stream: true
  };
  if (model) body.model = model;
  if (context) {
    const { screenshot: _s, ...rest } = context;
    if (Object.values(rest).some(Boolean)) body.context = rest;
  }
  if (screenshot && lastUser) {
    body.screenshot = screenshot;
    body.screenshotMimeType = "image/png";
  }
  const response = await fetch(`${TEKI_API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Teki API error (${response.status}): ${err}`);
  }
  return response;
}
async function* parseSSEStream(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is not readable");
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) yield parsed.text;
        } catch {
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
function useChat(model) {
  const [messages, setMessages] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const setCatState = useAppStore((s) => s.setCatState);
  const activeWindow = useAppStore((s) => s.activeWindow);
  const buildContext = reactExports.useCallback(async () => {
    const context = {};
    const { watchedWindowName, currentFrame } = useAppStore.getState();
    if (watchedWindowName) {
      context.activeWindow = watchedWindowName;
    } else if (activeWindow) {
      context.activeWindow = activeWindow.title;
    }
    if (currentFrame) {
      context.screenshot = currentFrame;
    }
    try {
      const [sistema, versao, ambiente] = await Promise.all([
        window.tekiAPI.getSetting("defaultSistema"),
        window.tekiAPI.getSetting("defaultVersao"),
        window.tekiAPI.getSetting("defaultAmbiente")
      ]);
      if (sistema) context.sistema = sistema;
      if (versao) context.versao = versao;
      if (ambiente) context.ambiente = ambiente;
    } catch {
    }
    return context;
  }, [activeWindow]);
  const sendChatMessage = reactExports.useCallback(
    async (text2) => {
      const trimmed = text2.trim();
      if (!trimmed || isLoading) return;
      setError(null);
      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setCatState("thinking");
      const assistantId = crypto.randomUUID();
      try {
        const context = await buildContext();
        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content
        }));
        const response = await sendMessage(allMessages, context, model);
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "", timestamp: Date.now() }
        ]);
        let fullContent = "";
        for await (const chunk of parseSSEStream(response)) {
          fullContent += chunk;
          const current = fullContent;
          setMessages(
            (prev) => prev.map((m) => m.id === assistantId ? { ...m, content: current } : m)
          );
        }
        setCatState("happy");
        setTimeout(() => setCatState("idle"), 3e3);
      } catch (err) {
        console.error("Chat error:", err);
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        setCatState("alert");
        const errorContent = "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
        setMessages((prev) => {
          const hasAssistant = prev.some((m) => m.id === assistantId);
          if (hasAssistant) {
            return prev.map((m) => m.id === assistantId ? { ...m, content: errorContent } : m);
          }
          return [...prev, { id: assistantId, role: "assistant", content: errorContent, timestamp: Date.now() }];
        });
        setTimeout(() => setCatState("idle"), 5e3);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, setCatState, buildContext, model]
  );
  const clearChat = reactExports.useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setCatState("idle");
  }, [setCatState]);
  return { messages, isLoading, error, sendMessage: sendChatMessage, clearChat };
}
const QUICK_SUGGESTIONS = [
  "Excel nao abre apos atualizacao do Windows",
  "VPN desconecta frequentemente",
  "Usuario esqueceu a senha do dominio",
  "Impressora de rede nao aparece no computador"
];
const ChatPanel = () => {
  const selectedModel = useAppStore((s) => s.selectedModel);
  const { messages, isLoading, error, sendMessage: sendMessage2, clearChat } = useChat(selectedModel);
  const [input, setInput] = reactExports.useState("");
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);
  const handleSend = reactExports.useCallback(() => {
    const text2 = input.trim();
    if (!text2) return;
    setInput("");
    sendMessage2(text2);
  }, [input, sendMessage2]);
  const handleQuickSuggestion = reactExports.useCallback(
    (text2) => {
      sendMessage2(text2);
    },
    [sendMessage2]
  );
  const handleScreenshot = reactExports.useCallback(() => {
    const { currentFrame } = useAppStore.getState();
    if (currentFrame) {
      setInput(
        (prev) => prev + (prev ? "\n" : "") + "[Screenshot da tela será incluído]"
      );
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-bg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border bg-surface flex-shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            className: "text-accent",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 22c4.97 0 9-2.69 9-6v-2c0-3.31-4.03-6-9-6s-9 2.69-9 6v2c0 3.31 4.03 6 9 6z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 14V6l4 4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 14V6l-4 4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "14", r: "1", fill: "currentColor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "15", cy: "14", r: "1", fill: "currentColor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 17v-1" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-text-primary", children: "Chat Teki" })
      ] }),
      messages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: clearChat,
          className: "flex items-center gap-1.5 px-2.5 py-1 rounded-md\n                       text-xs text-text-muted\n                       hover:bg-surface-hover hover:text-text-secondary\n                       transition-colors",
          title: "Limpar conversa",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                width: "14",
                height: "14",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "3 6 5 6 21 6" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Limpar" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: scrollRef,
        className: "flex-1 overflow-y-auto px-4 py-4 space-y-4",
        children: messages.length === 0 ? (
          /* Empty state with quick suggestions */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                width: "32",
                height: "32",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                className: "text-accent",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 22c4.97 0 9-2.69 9-6v-2c0-3.31-4.03-6-9-6s-9 2.69-9 6v2c0 3.31 4.03 6 9 6z" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 14V6l4 4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 14V6l-4 4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "14", r: "1", fill: "currentColor" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "15", cy: "14", r: "1", fill: "currentColor" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 17v-1" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-text-primary mb-1", children: "Ola! Sou o Teki" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted mb-6 max-w-xs", children: "Seu assistente de suporte tecnico com IA. Como posso ajudar?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 w-full max-w-sm", children: QUICK_SUGGESTIONS.map((text2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleQuickSuggestion(text2),
                className: "text-left px-4 py-3 rounded-xl border border-border\n                             bg-surface text-sm text-text-secondary\n                             hover:bg-surface-hover hover:text-text-primary hover:border-accent/30\n                             transition-colors",
                children: text2
              },
              text2
            )) })
          ] })
        ) : (
          /* Chat messages */
          messages.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsx(MessageBubble, { message }, message.id))
        )
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-error/10 border-t border-error/20 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-error", children: error }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ChatInput,
      {
        value: input,
        onChange: setInput,
        onSend: handleSend,
        onScreenshot: handleScreenshot,
        disabled: isLoading
      }
    )
  ] });
};
const CAT_STATES = {
  idle: {
    label: "Relaxando",
    eyeStyle: "semiclosed",
    eyeColor: "#17c964",
    tailAnimation: "none",
    bodyAnimation: "sitting"
  },
  watching: {
    label: "Observando",
    eyeStyle: "open",
    eyeColor: "#17c964",
    tailAnimation: "slow",
    bodyAnimation: "attentive"
  },
  thinking: {
    label: "Pensando",
    eyeStyle: "blinking",
    eyeColor: "#17c964",
    tailAnimation: "none",
    bodyAnimation: "paw-chin",
    bubble: "..."
  },
  happy: {
    label: "Feliz",
    eyeStyle: "closed-happy",
    eyeColor: "#17c964",
    tailAnimation: "fast",
    bodyAnimation: "smiling"
  },
  alert: {
    label: "Alerta",
    eyeStyle: "wide",
    eyeColor: "#f5a524",
    tailAnimation: "none",
    bodyAnimation: "ears-up",
    bubble: "!"
  },
  sleeping: {
    label: "Dormindo",
    eyeStyle: "closed",
    eyeColor: "#17c964",
    tailAnimation: "none",
    bodyAnimation: "lying",
    bubble: "zzz"
  }
};
const SIZE_MAP = {
  sm: 80,
  md: 120,
  lg: 160
};
const styles = `
  /* ---- Eye blink animation ---- */
  @keyframes blink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.05); }
  }

  /* ---- Tail gentle sway ---- */
  @keyframes tailSlow {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(6deg); }
    75% { transform: rotate(-6deg); }
  }

  /* ---- Tail happy wag ---- */
  @keyframes tailFast {
    0%, 100% { transform: rotate(0deg); }
    15% { transform: rotate(12deg); }
    35% { transform: rotate(-12deg); }
    55% { transform: rotate(10deg); }
    75% { transform: rotate(-10deg); }
  }

  /* ---- Sleeping float ---- */
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  /* ---- Speech bubble float ---- */
  @keyframes bubbleFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
    50% { transform: translateY(-4px) scale(1.05); opacity: 0.85; }
  }

  /* ---- Alert ears perk up ---- */
  @keyframes earsUp {
    0% { transform: translateY(0) scaleY(1); }
    40% { transform: translateY(-3px) scaleY(1.15); }
    100% { transform: translateY(-2px) scaleY(1.1); }
  }

  /* ---- Thinking dots ---- */
  @keyframes thinkingDots {
    0%, 20% { opacity: 0.3; }
    50% { opacity: 1; }
    80%, 100% { opacity: 0.3; }
  }

  .cat-mascot-root {
    position: absolute;
    bottom: 8px;
    right: 8px;
    pointer-events: none;
    z-index: 10;
  }

  .cat-mascot-root.!pointer-events-auto {
    pointer-events: auto;
  }

  /* When wrapped by DevCatWrapper (which handles absolute positioning),
     CatMascot should not apply its own absolute positioning. */
  .cat-mascot-root.cat-no-position {
    position: relative;
    bottom: auto;
    right: auto;
  }

  .cat-svg {
    transition: filter 0.5s ease;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .cat-svg:hover {
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  }

  /* ---- Body animations ---- */
  .cat-body-sitting { }
  .cat-body-attentive { transform-origin: 55px 104px; }
  .cat-body-paw-chin { }
  .cat-body-smiling { }
  .cat-body-ears-up { }
  .cat-body-lying {
    animation: float 3s ease-in-out infinite;
  }

  /* ---- Eye styles ---- */
  .cat-eye {
    transition: opacity 0.3s ease;
  }

  .cat-eye-semiclosed .cat-eye {
    /* Olhos semicerrados são relaxados — sem animação de blink */
  }

  .cat-eye-open .cat-eye { }

  .cat-eye-blinking .cat-eye {
    animation: blink 2s ease-in-out infinite;
    transform-origin: 55px 52px;
  }

  .cat-eye-wide .cat-eye {
    /* Olhos wide já são desenhados maiores no SVG (r=7) — sem scale CSS */
  }

  /* ---- Tail styles ---- */
  /* The tail <g> is wrapped in a translate(76,86) group, so rotating
     around (0,0) pivots exactly at the tail base — no viewport ambiguity. */
  .cat-tail {
    transform-origin: 0px 0px;
    /* Sem transition — as animations tailSlow/tailFast já fazem transições suaves */
  }
  .cat-tail-slow {
    animation: tailSlow 3s ease-in-out infinite;
  }
  .cat-tail-fast {
    animation: tailFast 0.6s ease-in-out infinite;
  }

  /* ---- Ears ---- */
  .cat-ears {
    transition: transform 0.3s ease;
    transform-origin: 55px 35px;
  }
  .cat-ears-alert {
    animation: earsUp 0.4s ease-out forwards;
  }

  /* ---- Speech bubble ---- */
  .cat-bubble {
    animation: bubbleFloat 2s ease-in-out infinite;
    pointer-events: none;
  }

  /* ---- Paw ---- */
  .cat-paw {
    transition: opacity 0.3s ease;
  }

  /* ---- Whiskers ---- */
  .cat-whiskers {
    transition: transform 0.3s ease;
    transform-origin: 55px 60px;
  }
  .cat-whiskers-alert {
    transform: scaleX(1.1);
  }
`;
const CatMascot = ({
  state,
  size = "md",
  className = ""
}) => {
  const config = CAT_STATES[state];
  const px = SIZE_MAP[size];
  const viewBox = "0 0 120 120";
  const eyeClasses = `cat-eye-${config.eyeStyle}`;
  const tailClasses = `cat-tail${config.tailAnimation !== "none" ? ` cat-tail-${config.tailAnimation}` : ""}`;
  const earClasses = `cat-ears${config.bodyAnimation === "ears-up" ? " cat-ears-alert" : ""}`;
  const bodyClasses = `cat-body-${config.bodyAnimation}`;
  const whiskerClasses = `cat-whiskers${config.bodyAnimation === "ears-up" ? " cat-whiskers-alert" : ""}`;
  const showPaw = config.bodyAnimation === "paw-chin";
  const renderEyes = reactExports.useMemo(() => {
    const leftEyeX = 42;
    const rightEyeX = 68;
    const eyeY = 52;
    switch (config.eyeStyle) {
      case "closed-happy":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "cat-eye", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              d: `M${leftEyeX - 5},${eyeY} Q${leftEyeX},${eyeY - 6} ${leftEyeX + 5},${eyeY}`,
              fill: "none",
              stroke: config.eyeColor,
              strokeWidth: "2.5",
              strokeLinecap: "round"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              d: `M${rightEyeX - 5},${eyeY} Q${rightEyeX},${eyeY - 6} ${rightEyeX + 5},${eyeY}`,
              fill: "none",
              stroke: config.eyeColor,
              strokeWidth: "2.5",
              strokeLinecap: "round"
            }
          )
        ] });
      case "closed":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "cat-eye", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "line",
            {
              x1: leftEyeX - 5,
              y1: eyeY,
              x2: leftEyeX + 5,
              y2: eyeY,
              stroke: config.eyeColor,
              strokeWidth: "2",
              strokeLinecap: "round"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "line",
            {
              x1: rightEyeX - 5,
              y1: eyeY,
              x2: rightEyeX + 5,
              y2: eyeY,
              stroke: config.eyeColor,
              strokeWidth: "2",
              strokeLinecap: "round"
            }
          )
        ] });
      case "semiclosed": {
        const eyeHeight = 5;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "cat-eye", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "ellipse",
            {
              cx: leftEyeX,
              cy: eyeY,
              rx: "5.5",
              ry: eyeHeight,
              fill: config.eyeColor,
              opacity: "0.9"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: leftEyeX + 1, cy: eyeY, r: "2.5", fill: "#0a0a0b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: leftEyeX + 2, cy: eyeY - 1.5, r: "1", fill: "#ffffff", opacity: "0.7" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "ellipse",
            {
              cx: rightEyeX,
              cy: eyeY,
              rx: "5.5",
              ry: eyeHeight,
              fill: config.eyeColor,
              opacity: "0.9"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: rightEyeX + 1, cy: eyeY, r: "2.5", fill: "#0a0a0b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: rightEyeX + 2, cy: eyeY - 1.5, r: "1", fill: "#ffffff", opacity: "0.7" })
        ] });
      }
      case "wide": {
        const wideR = 7;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "cat-eye", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: leftEyeX, cy: eyeY, r: wideR, fill: config.eyeColor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: leftEyeX + 1, cy: eyeY - 1, r: "3.5", fill: "#0a0a0b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: leftEyeX + 2, cy: eyeY - 2.5, r: "1.5", fill: "#ffffff", opacity: "0.8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: rightEyeX, cy: eyeY, r: wideR, fill: config.eyeColor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: rightEyeX + 1, cy: eyeY - 1, r: "3.5", fill: "#0a0a0b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: rightEyeX + 2, cy: eyeY - 2.5, r: "1.5", fill: "#ffffff", opacity: "0.8" })
        ] });
      }
      case "open":
      case "blinking":
      default: {
        const normalR = 6;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "cat-eye", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: leftEyeX, cy: eyeY, r: normalR, fill: config.eyeColor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: leftEyeX + 1, cy: eyeY, r: "3", fill: "#0a0a0b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: leftEyeX + 2, cy: eyeY - 1.5, r: "1.2", fill: "#ffffff", opacity: "0.7" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: rightEyeX, cy: eyeY, r: normalR, fill: config.eyeColor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: rightEyeX + 1, cy: eyeY, r: "3", fill: "#0a0a0b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: rightEyeX + 2, cy: eyeY - 1.5, r: "1.2", fill: "#ffffff", opacity: "0.7" })
        ] });
      }
    }
  }, [config.eyeStyle, config.eyeColor]);
  const renderMouth = reactExports.useMemo(() => {
    const mouthY = 62;
    if (config.bodyAnimation === "smiling") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M48,62 Q55,70 62,62",
          fill: "none",
          stroke: "#1a6b75",
          strokeWidth: "2",
          strokeLinecap: "round"
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d: `M50,${mouthY} Q55,${mouthY + 4} 60,${mouthY}`,
        fill: "none",
        stroke: "#1a6b75",
        strokeWidth: "1.5",
        strokeLinecap: "round"
      }
    );
  }, [config.bodyAnimation]);
  const renderBubble = reactExports.useMemo(() => {
    if (!config.bubble) return null;
    const bubbleX = 18;
    const bubbleY = 16;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "cat-bubble", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "rect",
        {
          x: bubbleX - 2,
          y: bubbleY - 10,
          width: config.bubble.length > 2 ? 30 : 22,
          height: "18",
          rx: "9",
          ry: "9",
          fill: "#27272a",
          stroke: "#3f3f46",
          strokeWidth: "1"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "polygon",
        {
          points: `${bubbleX + 8},${bubbleY + 8} ${bubbleX + 14},${bubbleY + 14} ${bubbleX + 16},${bubbleY + 8}`,
          fill: "#27272a"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "text",
        {
          x: config.bubble.length > 2 ? bubbleX + 13 : bubbleX + 9,
          y: bubbleY + 2,
          textAnchor: "middle",
          fontSize: config.bubble === "!" ? "14" : "11",
          fontWeight: "bold",
          fill: config.bubble === "!" ? "#f5a524" : "#a1a1aa",
          fontFamily: "monospace",
          children: config.bubble
        }
      )
    ] });
  }, [config.bubble]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `cat-mascot-root ${className}`,
      role: "img",
      "aria-label": `Teki cat - ${config.label}`,
      title: config.label,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: styles }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            className: `cat-svg ${bodyClasses}`,
            width: px,
            height: px,
            viewBox,
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              renderBubble,
              /* @__PURE__ */ jsxRuntimeExports.jsx("g", { transform: "translate(76,86)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: tailClasses, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "path",
                  {
                    d: "M0,0 Q18,-14 14,-30 Q11,-42 17,-50",
                    fill: "none",
                    stroke: "#2A8F9D",
                    strokeWidth: "5",
                    strokeLinecap: "round"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "17", cy: "-51", r: "3.5", fill: "#237a86" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "ellipse",
                {
                  cx: "55",
                  cy: "80",
                  rx: "30",
                  ry: "24",
                  fill: "#2A8F9D"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "ellipse",
                {
                  cx: "55",
                  cy: "83",
                  rx: "18",
                  ry: "16",
                  fill: "#34a3b2",
                  opacity: "0.6"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "55", cy: "48", r: "22", fill: "#2A8F9D" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "55", cy: "50", r: "15", fill: "#34a3b2", opacity: "0.35" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: earClasses, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "polygon",
                  {
                    points: "35,35 28,14 45,28",
                    fill: "#2A8F9D"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "polygon",
                  {
                    points: "36,32 31,18 43,29",
                    fill: "#237a86",
                    opacity: "0.6"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "polygon",
                  {
                    points: "75,35 82,14 65,28",
                    fill: "#2A8F9D"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "polygon",
                  {
                    points: "74,32 79,18 67,29",
                    fill: "#237a86",
                    opacity: "0.6"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("g", { className: eyeClasses, children: renderEyes }),
              config.eyeStyle === "semiclosed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "42", cy: "49", rx: "6.5", ry: "4", fill: "#2A8F9D" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "68", cy: "49", rx: "6.5", ry: "4", fill: "#2A8F9D" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "polygon",
                {
                  points: "53,57 57,57 55,60",
                  fill: "#1a6b75"
                }
              ),
              renderMouth,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: whiskerClasses, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "44", y1: "58", x2: "20", y2: "54", stroke: "#237a86", strokeWidth: "1", strokeLinecap: "round" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "44", y1: "60", x2: "18", y2: "60", stroke: "#237a86", strokeWidth: "1", strokeLinecap: "round" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "44", y1: "62", x2: "20", y2: "66", stroke: "#237a86", strokeWidth: "1", strokeLinecap: "round" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "66", y1: "58", x2: "90", y2: "54", stroke: "#237a86", strokeWidth: "1", strokeLinecap: "round" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "66", y1: "60", x2: "92", y2: "60", stroke: "#237a86", strokeWidth: "1", strokeLinecap: "round" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "66", y1: "62", x2: "90", y2: "66", stroke: "#237a86", strokeWidth: "1", strokeLinecap: "round" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "38", cy: "98", rx: "8", ry: "5", fill: "#2A8F9D" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "38", cy: "98", rx: "5", ry: "3", fill: "#34a3b2", opacity: "0.4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "72", cy: "98", rx: "8", ry: "5", fill: "#2A8F9D" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "72", cy: "98", rx: "5", ry: "3", fill: "#34a3b2", opacity: "0.4" }),
              showPaw && /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "cat-paw", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "path",
                  {
                    d: "M38,95 Q30,80 38,65",
                    fill: "none",
                    stroke: "#2A8F9D",
                    strokeWidth: "8",
                    strokeLinecap: "round"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "38", cy: "63", rx: "6", ry: "5", fill: "#2A8F9D" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "38", cy: "63", rx: "4", ry: "3", fill: "#34a3b2", opacity: "0.4" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "ellipse",
                {
                  cx: "55",
                  cy: "104",
                  rx: "32",
                  ry: "4",
                  fill: "#000000",
                  opacity: "0.15"
                }
              )
            ]
          }
        )
      ]
    }
  );
};
const ONE_SHOT_DURATIONS = {
  alert: 5e3,
  happy: 3e3
};
const DevCatWrapper = ({
  state: realState,
  size = "md",
  className = ""
}) => {
  const isDev = false;
  const [showPreview, setShowPreview] = reactExports.useState(false);
  const [devOverrideState, setDevOverrideState] = reactExports.useState(null);
  const [devLoop, setDevLoop] = reactExports.useState(false);
  const oneShotTimerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    return () => {
      if (oneShotTimerRef.current) {
        clearTimeout(oneShotTimerRef.current);
      }
    };
  }, []);
  reactExports.useCallback(
    (e) => {
      return;
    },
    [isDev, devLoop, devOverrideState]
  );
  reactExports.useCallback(
    (state, loop) => {
      if (oneShotTimerRef.current) {
        clearTimeout(oneShotTimerRef.current);
        oneShotTimerRef.current = null;
      }
      setDevOverrideState(state);
      setDevLoop(loop);
      if (!loop) {
        const duration = ONE_SHOT_DURATIONS[state];
        if (duration) {
          oneShotTimerRef.current = setTimeout(() => {
            oneShotTimerRef.current = null;
            setDevOverrideState(null);
            setDevLoop(false);
          }, duration);
        }
      }
    },
    []
  );
  {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CatMascot, { state: realState, size, className });
  }
};
const ScreenViewer = () => {
  const catState = useAppStore((s) => s.catState);
  const isWatching = useAppStore((s) => s.isWatching);
  const setWatching = useAppStore((s) => s.setWatching);
  const setCurrentFrame = useAppStore((s) => s.setCurrentFrame);
  const setCatState = useAppStore((s) => s.setCatState);
  const requestWindowSelector = useAppStore((s) => s.requestWindowSelector);
  const clearWindowSelector = useAppStore((s) => s.clearWindowSelector);
  const [viewerState, setViewerState] = reactExports.useState("idle");
  const [availableWindows, setAvailableWindows] = reactExports.useState([]);
  const [currentFrame, setLocalFrame] = reactExports.useState(null);
  const [windowName, setWindowName] = reactExports.useState("");
  const [isLoadingSources, setIsLoadingSources] = reactExports.useState(false);
  const fetchWindows = reactExports.useCallback(async () => {
    setIsLoadingSources(true);
    try {
      const windows = await window.tekiAPI.getAvailableWindows();
      setAvailableWindows(windows);
    } finally {
      setIsLoadingSources(false);
    }
  }, []);
  const openSelector = reactExports.useCallback(async () => {
    setViewerState("selecting");
    await fetchWindows();
  }, [fetchWindows]);
  const selectWindow = reactExports.useCallback(
    async (source) => {
      setWindowName(source.name);
      setViewerState("watching");
      setWatching(true, source.name);
      setCatState("watching");
      await window.tekiAPI.startWatching(source.id);
    },
    [setWatching, setCatState]
  );
  const stopWatching = reactExports.useCallback(async () => {
    await window.tekiAPI.stopWatching();
    setWatching(false);
    setLocalFrame(null);
    setCurrentFrame(null);
    setCatState("idle");
    setViewerState("idle");
  }, [setWatching, setCurrentFrame, setCatState]);
  reactExports.useEffect(() => {
    const unsubFrame = window.tekiAPI.onWindowFrame((frame) => {
      setLocalFrame(frame.image);
      setCurrentFrame(frame.image);
      if (frame.windowName !== windowName) {
        setWindowName(frame.windowName);
      }
    });
    const unsubClosed = window.tekiAPI.onWindowClosed(() => {
      setWatching(false);
      setLocalFrame(null);
      setCurrentFrame(null);
      setCatState("alert");
      setViewerState("closed");
    });
    return () => {
      unsubFrame();
      unsubClosed();
    };
  }, [windowName, setWatching, setCurrentFrame, setCatState]);
  reactExports.useEffect(() => {
    if (!isWatching && viewerState === "watching") {
      setLocalFrame(null);
      setCurrentFrame(null);
      setViewerState("idle");
    }
  }, [isWatching, viewerState, setCurrentFrame]);
  reactExports.useEffect(() => {
    if (requestWindowSelector) {
      clearWindowSelector();
      openSelector();
    }
  }, [requestWindowSelector, clearWindowSelector, openSelector]);
  reactExports.useEffect(() => {
    const unsubSelect = window.tekiAPI.onTraySelectWindow(() => openSelector());
    const unsubStop = window.tekiAPI.onTrayStopWatching(() => stopWatching());
    return () => {
      unsubSelect();
      unsubStop();
    };
  }, [openSelector, stopWatching]);
  reactExports.useEffect(() => {
    return () => {
      window.tekiAPI.stopWatching();
    };
  }, []);
  if (viewerState === "idle") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full bg-bg overflow-hidden flex flex-col items-center justify-center gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-20 h-20 rounded-2xl bg-surface border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "40", height: "40", viewBox: "0 0 40 40", fill: "none", className: "text-text-muted", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "8", width: "32", height: "22", rx: "3", stroke: "currentColor", strokeWidth: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 34h12", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 30v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 19h16M12 23h10", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", opacity: "0.4" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-text-secondary", children: "Nenhuma janela selecionada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted max-w-[220px]", children: "Selecione uma janela para o Teki começar a observar." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: openSelector,
          className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 21l-4.35-4.35" })
            ] }),
            "Selecionar janela"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DevCatWrapper, { state: catState, size: "md" })
    ] });
  }
  if (viewerState === "selecting") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full bg-bg overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border bg-surface flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-text-primary", children: "Selecione a janela para observar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setViewerState("idle"),
            className: "text-xs text-text-muted hover:text-text-secondary transition-colors",
            children: "Cancelar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-3 space-y-2", children: isLoadingSources ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-32 text-text-muted text-sm", children: "Carregando janelas..." }) : availableWindows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-32 text-text-muted text-sm", children: "Nenhuma janela encontrada" }) : availableWindows.map((win) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => selectWindow(win),
          className: "w-full flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-accent/40 hover:bg-surface-hover transition-all text-left",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: win.thumbnail,
                alt: win.name,
                className: "w-24 h-14 object-cover rounded border border-border shrink-0 bg-bg"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              win.appIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: win.appIcon, alt: "", className: "w-4 h-4 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-text-secondary truncate", children: win.name })
            ] })
          ]
        },
        win.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex justify-center py-2 border-t border-border bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: fetchWindows,
          className: "flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23 4v6h-6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
            ] }),
            "Atualizar lista"
          ]
        }
      ) })
    ] });
  }
  if (viewerState === "watching") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full bg-bg overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b border-border bg-surface flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-success animate-pulse shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-muted shrink-0", children: "Observando:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-primary font-medium truncate", children: windowName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: openSelector,
              className: "text-xs text-text-muted hover:text-accent transition-colors",
              children: "Trocar"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: stopWatching,
              className: "text-xs text-text-muted hover:text-error transition-colors",
              children: "✕ Parar"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center p-3 bg-bg", children: currentFrame ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: currentFrame,
          alt: `Preview: ${windowName}`,
          className: "max-w-full max-h-full object-contain rounded-lg",
          draggable: false
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-muted", children: "Aguardando captura..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DevCatWrapper, { state: catState, size: "md" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full bg-bg overflow-hidden flex flex-col items-center justify-center gap-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-warning", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-text-secondary text-center", children: [
      "A janela ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-text-primary", children: [
        '"',
        windowName,
        '"'
      ] }),
      " foi fechada."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: openSelector,
        className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 21l-4.35-4.35" })
          ] }),
          "Selecionar outra janela"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DevCatWrapper, { state: catState, size: "md" })
  ] });
};
const SearchIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
    ]
  }
);
const CameraIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "13", r: "4" })
    ]
  }
);
const PauseIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "4", width: "4", height: "16" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "14", y: "4", width: "4", height: "16" })
    ]
  }
);
const PlayIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "5 3 19 12 5 21 5 3" })
  }
);
const MonitorIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })
    ]
  }
);
const ClockIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "12 6 12 12 16 14" })
    ]
  }
);
const LayersIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "12 2 2 7 12 12 22 7 12 2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "2 17 12 22 22 17" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "2 12 12 17 22 12" })
    ]
  }
);
const GlobeIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
    ]
  }
);
const LayoutIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "9", x2: "21", y2: "9" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "9", y1: "21", x2: "9", y2: "9" })
    ]
  }
);
const MessageIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
  }
);
const HistoryIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 3v5h5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3.05 13A9 9 0 1 0 6 5.3L3 8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 7v5l4 2" })
    ]
  }
);
const SettingsIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })
    ]
  }
);
const LogOutIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "16 17 21 12 16 7" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", y1: "12", x2: "9", y2: "12" })
    ]
  }
);
const ScreenIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })
    ]
  }
);
const CompactIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "9", y1: "3", x2: "9", y2: "21" })
    ]
  }
);
const CommandPalette = () => {
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);
  const setLayout = useAppStore((s) => s.setLayout);
  const setCaptureState = useAppStore((s) => s.setCaptureState);
  const isCapturing = useAppStore((s) => s.isCapturing);
  const [query, setQuery] = reactExports.useState("");
  const [selectedIndex, setSelectedIndex] = reactExports.useState(0);
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const inputRef = reactExports.useRef(null);
  const listRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);
  reactExports.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const close = reactExports.useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      toggleCommandPalette();
    }, 150);
  }, [toggleCommandPalette]);
  const commands = reactExports.useMemo(() => {
    const iconClass = "text-text-secondary";
    return [
      // ── Captura ──
      {
        id: "capture-now",
        label: "Capturar tela agora",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CameraIcon, { className: iconClass }),
        group: "Captura",
        action: () => {
          window.tekiAPI.captureNow();
          close();
        }
      },
      {
        id: "toggle-capture",
        label: isCapturing ? "Pausar observação" : "Retomar observação",
        icon: isCapturing ? /* @__PURE__ */ jsxRuntimeExports.jsx(PauseIcon, { className: iconClass }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PlayIcon, { className: iconClass }),
        group: "Captura",
        action: () => {
          setCaptureState(!isCapturing);
          close();
        }
      },
      {
        id: "switch-monitor",
        label: "Trocar monitor",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MonitorIcon, { className: iconClass }),
        group: "Captura",
        action: () => {
          close();
        }
      },
      {
        id: "change-interval",
        label: "Alterar intervalo",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClockIcon, { className: iconClass }),
        group: "Captura",
        action: () => {
          close();
        }
      },
      // ── Contexto ──
      {
        id: "switch-system",
        label: "Trocar sistema",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LayersIcon, { className: iconClass }),
        group: "Contexto",
        action: () => {
          close();
        }
      },
      {
        id: "switch-environment",
        label: "Trocar ambiente",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GlobeIcon, { className: iconClass }),
        group: "Contexto",
        action: () => {
          close();
        }
      },
      // ── Navegação ──
      {
        id: "layout-split",
        label: "Layout: Split",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutIcon, { className: iconClass }),
        group: "Navegação",
        action: () => {
          setLayout("split");
          close();
        }
      },
      {
        id: "layout-chat-only",
        label: "Layout: Chat Only",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageIcon, { className: iconClass }),
        group: "Navegação",
        action: () => {
          setLayout("chat-only");
          close();
        }
      },
      {
        id: "layout-screen-only",
        label: "Layout: Screen Only",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScreenIcon, { className: iconClass }),
        group: "Navegação",
        action: () => {
          setLayout("screen-only");
          close();
        }
      },
      {
        id: "layout-compact",
        label: "Layout: Compact",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CompactIcon, { className: iconClass }),
        group: "Navegação",
        action: () => {
          setLayout("compact");
          close();
        }
      },
      // ── App ──
      {
        id: "chat-history",
        label: "Histórico de chats",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryIcon, { className: iconClass }),
        group: "App",
        action: () => {
          close();
        }
      },
      {
        id: "settings",
        label: "Configurações",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, { className: iconClass }),
        group: "App",
        action: () => {
          close();
        }
      },
      {
        id: "quit",
        label: "Sair",
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOutIcon, { className: iconClass }),
        group: "App",
        action: () => {
          window.tekiAPI.close();
        }
      }
    ];
  }, [isCapturing, close, setCaptureState, setLayout]);
  const filteredCommands = reactExports.useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(lower));
  }, [commands, query]);
  reactExports.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length, query]);
  reactExports.useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-command-item]");
    const selectedItem = items[selectedIndex];
    selectedItem?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);
  const groupedCommands = reactExports.useMemo(() => {
    const groups = [];
    let flatIndex = 0;
    for (const cmd of filteredCommands) {
      let group = groups.find((g) => g.name === cmd.group);
      if (!group) {
        group = { name: cmd.group, commands: [] };
        groups.push(group);
      }
      group.commands.push({ ...cmd, flatIndex });
      flatIndex++;
    }
    return groups;
  }, [filteredCommands]);
  const handleKeyDown = reactExports.useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setSelectedIndex(
            (prev) => prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setSelectedIndex(
            (prev) => prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        }
        case "Enter": {
          e.preventDefault();
          const cmd = filteredCommands[selectedIndex];
          if (cmd) cmd.action();
          break;
        }
        case "Escape": {
          e.preventDefault();
          close();
          break;
        }
      }
    },
    [filteredCommands, selectedIndex, close]
  );
  const handleOverlayClick = reactExports.useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${isVisible ? "opacity-100" : "opacity-0"}`,
      onClick: handleOverlayClick,
      onKeyDown: handleKeyDown,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden transition-all duration-150 ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, { className: "text-text-muted flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: inputRef,
                  type: "text",
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                  placeholder: "Buscar comandos...",
                  className: "flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted outline-none",
                  spellCheck: false,
                  autoComplete: "off"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-bg border border-border rounded", children: "ESC" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                ref: listRef,
                className: "max-h-[360px] overflow-y-auto py-2",
                children: [
                  groupedCommands.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-8 text-center text-text-muted text-sm", children: "Nenhum comando encontrado" }),
                  groupedCommands.map((group, groupIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    groupIndex > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-3 my-1 border-t border-border" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-1.5 text-[11px] font-medium text-text-muted uppercase tracking-wider", children: group.name }),
                    group.commands.map((cmd) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        "data-command-item": true,
                        onClick: () => cmd.action(),
                        onMouseEnter: () => setSelectedIndex(cmd.flatIndex),
                        className: `w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors duration-75 ${cmd.flatIndex === selectedIndex ? "bg-surface-hover text-text-primary" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 w-5 h-5 flex items-center justify-center", children: cmd.icon }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: cmd.label }),
                          cmd.flatIndex === selectedIndex && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 text-text-muted text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReturnIcon, { className: "text-text-muted" }) })
                        ]
                      },
                      cmd.id
                    ))
                  ] }, group.name))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 px-4 py-2 border-t border-border text-[11px] text-text-muted", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-1 py-0.5 font-mono bg-bg border border-border rounded text-[10px]", children: "↑↓" }),
                "navegar"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-1 py-0.5 font-mono bg-bg border border-border rounded text-[10px]", children: "↵" }),
                "selecionar"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "px-1 py-0.5 font-mono bg-bg border border-border rounded text-[10px]", children: "esc" }),
                "fechar"
              ] })
            ] })
          ]
        }
      )
    }
  );
};
const ReturnIcon = ({ className }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "svg",
  {
    className,
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "9 10 4 15 9 20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 4v7a4 4 0 0 1-4 4H4" })
    ]
  }
);
const ALL_MODELS = [
  // GEMINI
  {
    id: "gemini-flash",
    providerId: "gemini",
    apiModelId: "gemini-2.0-flash",
    name: "Gemini Flash",
    description: "Rápido e econômico. Ideal para suporte básico.",
    tier: "free",
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 1048576, maxOutputTokens: 8192 },
    costTier: "low",
    isDefault: true
  },
  {
    id: "gemini-pro",
    providerId: "gemini",
    apiModelId: "gemini-2.5-pro-preview-06-05",
    name: "Gemini Pro",
    description: "Mais inteligente. Para problemas complexos.",
    tier: "pro",
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 1048576, maxOutputTokens: 65536 },
    costTier: "high",
    isDefault: false
  },
  // OPENAI
  {
    id: "gpt-4o-mini",
    providerId: "openai",
    apiModelId: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Bom equilíbrio qualidade e velocidade.",
    tier: "starter",
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 128e3, maxOutputTokens: 16384 },
    costTier: "low",
    isDefault: false
  },
  {
    id: "gpt-4o",
    providerId: "openai",
    apiModelId: "gpt-4o",
    name: "GPT-4o",
    description: "O melhor da OpenAI. Textos e explicações.",
    tier: "pro",
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 128e3, maxOutputTokens: 16384 },
    costTier: "high",
    isDefault: false
  },
  // ANTHROPIC
  {
    id: "claude-haiku",
    providerId: "anthropic",
    apiModelId: "claude-haiku-4-5-20251001",
    name: "Claude Haiku",
    description: "Rápido e preciso. Respostas diretas.",
    tier: "starter",
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 2e5, maxOutputTokens: 8192 },
    costTier: "low",
    isDefault: false
  },
  {
    id: "claude-sonnet",
    providerId: "anthropic",
    apiModelId: "claude-sonnet-4-6",
    name: "Claude Sonnet",
    description: "O melhor pra código e análise técnica.",
    tier: "pro",
    capabilities: { vision: true, streaming: true, functionCalling: true, maxContextTokens: 2e5, maxOutputTokens: 16384 },
    costTier: "high",
    isDefault: false
  },
  // OLLAMA
  {
    id: "ollama-custom",
    providerId: "ollama",
    apiModelId: "dynamic",
    name: "Modelo Local (Ollama)",
    description: "IA na sua máquina. Privacidade total.",
    tier: "pro",
    capabilities: { vision: false, streaming: true, functionCalling: false, maxContextTokens: 32e3, maxOutputTokens: 4096 },
    costTier: "low",
    isDefault: false
  }
];
const SETTINGS_KEY = {
  gemini: "geminiApiKey",
  openai: "openaiApiKey",
  anthropic: "anthropicApiKey",
  ollama: "ollamaBaseUrl"
};
const STATUS_KEY = {
  gemini: "geminiKeyStatus",
  openai: "openaiKeyStatus",
  anthropic: "anthropicKeyStatus",
  ollama: "ollamaKeyStatus"
};
function useApiKeyValidation(provider, initialStatus = "unconfigured") {
  const [status, setStatus] = reactExports.useState(initialStatus);
  const [result, setResult] = reactExports.useState(null);
  const [isValidating, setIsValidating] = reactExports.useState(false);
  const validate = reactExports.useCallback(async (key) => {
    if (!key.trim()) {
      const empty2 = {
        valid: false,
        provider,
        error: "Chave não pode ser vazia.",
        latencyMs: 0,
        checkedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStatus("invalid");
      setResult(empty2);
      return empty2;
    }
    setIsValidating(true);
    setStatus("validating");
    try {
      const res = await window.tekiAPI.validateApiKey(provider, key);
      if (res.valid) {
        await window.tekiAPI.setSetting(SETTINGS_KEY[provider], key);
        await window.tekiAPI.setSetting(STATUS_KEY[provider], "valid");
        setStatus("valid");
      } else {
        await window.tekiAPI.setSetting(STATUS_KEY[provider], "invalid");
        setStatus("invalid");
      }
      setResult(res);
      return res;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro na validação.";
      const errRes = {
        valid: false,
        provider,
        error: msg,
        latencyMs: 0,
        checkedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setStatus("invalid");
      setResult(errRes);
      return errRes;
    } finally {
      setIsValidating(false);
    }
  }, [provider]);
  const clear = reactExports.useCallback(async () => {
    await window.tekiAPI.setSetting(SETTINGS_KEY[provider], "");
    await window.tekiAPI.setSetting(STATUS_KEY[provider], "unconfigured");
    setStatus("unconfigured");
    setResult(null);
  }, [provider]);
  return { status, result, isValidating, validate, clear };
}
const PROVIDER_CONFIG = {
  gemini: {
    name: "Google Gemini",
    color: "#4285F4",
    placeholder: "AIza...",
    helpText: "Obtenha em aistudio.google.com → API Keys",
    keyPrefix: "AIza",
    settingsKey: "geminiApiKey",
    statusKey: "geminiKeyStatus"
  },
  openai: {
    name: "OpenAI",
    color: "#10A37F",
    placeholder: "sk-...",
    helpText: "Obtenha em platform.openai.com → API Keys",
    keyPrefix: "sk-",
    settingsKey: "openaiApiKey",
    statusKey: "openaiKeyStatus"
  },
  anthropic: {
    name: "Anthropic Claude",
    color: "#D4A574",
    placeholder: "sk-ant-...",
    helpText: "Obtenha em console.anthropic.com → API Keys",
    keyPrefix: "sk-ant-",
    settingsKey: "anthropicApiKey",
    statusKey: "anthropicKeyStatus"
  },
  ollama: {
    name: "Ollama (Local)",
    color: "#e5e5e5",
    placeholder: "http://localhost:11434",
    helpText: "URL do servidor Ollama rodando na sua máquina",
    keyPrefix: "http",
    settingsKey: "ollamaBaseUrl",
    statusKey: "ollamaKeyStatus"
  }
};
const StatusBadge = ({ status }) => {
  if (status === "valid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "20 6 9 17 4 12" }) }),
    "Válida"
  ] });
  if (status === "invalid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
    ] }),
    "Inválida"
  ] });
  if (status === "validating") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-accent bg-accent/10 border border-accent/30 rounded-full px-2 py-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "animate-spin", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }) }),
    "Validando..."
  ] });
  return null;
};
const ApiKeyInput = ({ provider }) => {
  const cfg = PROVIDER_CONFIG[provider];
  const [initialStatus, setInitialStatus] = reactExports.useState("unconfigured");
  const { status, result, isValidating, validate, clear } = useApiKeyValidation(provider, initialStatus);
  const [inputValue, setInputValue] = reactExports.useState("");
  const [savedKey, setSavedKey] = reactExports.useState("");
  const [showKey, setShowKey] = reactExports.useState(false);
  reactExports.useEffect(() => {
    window.tekiAPI.getSetting(cfg.settingsKey).then((key) => {
      if (key) {
        setSavedKey(key);
        setInputValue(key);
      }
    });
    window.tekiAPI.getSetting(cfg.statusKey).then((s) => {
      if (s && s !== "validating") setInitialStatus(s);
    });
  }, [cfg.settingsKey, cfg.statusKey]);
  const hasChanges = inputValue !== savedKey;
  const isConfigured = status === "valid" && savedKey;
  const maskedKey = savedKey ? `${savedKey.slice(0, cfg.keyPrefix.length)}${"•".repeat(20)}` : "";
  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const res = await validate(trimmed);
    if (res.valid) setSavedKey(trimmed);
  };
  const handleClear = async () => {
    await clear();
    setInputValue("");
    setSavedKey("");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };
  const displayValue = isConfigured && !hasChanges && !showKey ? maskedKey : inputValue;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full flex-shrink-0", style: { backgroundColor: cfg.color } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-semibold text-[#fafafa]", children: cfg.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: showKey ? "text" : "password",
            value: displayValue,
            onChange: (e) => setInputValue(e.target.value),
            onFocus: () => {
              if (isConfigured && !hasChanges) setInputValue(savedKey);
            },
            onKeyDown: handleKeyDown,
            placeholder: cfg.placeholder,
            disabled: isValidating,
            className: `w-full h-10 px-3 pr-10 text-[13px] font-mono rounded-lg bg-[#18181b] border transition-colors outline-none
              placeholder:text-[#52525b] disabled:opacity-50 disabled:cursor-not-allowed
              focus:border-accent
              ${status === "valid" ? "border-emerald-500/30" : ""}
              ${status === "invalid" ? "border-red-500/30" : ""}
              ${status === "unconfigured" || status === "validating" ? "border-[#3f3f46]/50" : ""}
            `
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowKey((v) => !v),
            className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors",
            title: showKey ? "Ocultar" : "Mostrar",
            children: showKey ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" })
            ] })
          }
        )
      ] }),
      hasChanges || !isConfigured ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleSave,
          disabled: isValidating || !inputValue.trim(),
          className: "h-10 px-4 text-[13px] font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-accent text-white hover:bg-[#238490]",
          children: isValidating ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "animate-spin", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }) }) : "Salvar"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleClear,
          className: "h-10 px-3 text-[#52525b] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all",
          title: "Remover chave",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "3 6 5 6 21 6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[16px]", children: [
      status === "invalid" && result?.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-red-400/80", children: result.error }),
      status === "valid" && result && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-[#52525b]", children: [
        "Verificada em ",
        result.latencyMs,
        "ms",
        result.models && result.models.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " · ",
          result.models.length,
          " modelo",
          result.models.length !== 1 ? "s" : "",
          " disponíve",
          result.models.length !== 1 ? "is" : "l"
        ] })
      ] }),
      (status === "unconfigured" || !result && status !== "validating") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#52525b]", children: cfg.helpText })
    ] })
  ] });
};
const ALL_PROVIDERS = ["gemini", "openai", "anthropic", "ollama"];
const AllApiKeys = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-7", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[11px] font-bold text-[#71717a] uppercase tracking-wider mb-1", children: "Chaves de API dos Provedores" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] text-[#52525b]", children: "Configure suas chaves para usar modelos de diferentes provedores. Armazenadas localmente no dispositivo." })
  ] }),
  ALL_PROVIDERS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ApiKeyInput, { provider: p }, p)),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#3f3f46] border-t border-[#3f3f46]/30 pt-4", children: "Suas chaves nunca são enviadas ao servidor do Teki — ficam apenas neste dispositivo." })
] });
const PROVIDER_META = {
  gemini: { label: "Google", color: "#4285F4" },
  openai: { label: "OpenAI", color: "#10A37F" },
  anthropic: { label: "Anthropic", color: "#D97706" },
  ollama: { label: "Local (Ollama)", color: "#7C3AED" }
};
const CHANNEL_META = {
  whatsapp: { name: "WhatsApp", color: "#25D366" },
  telegram: { name: "Telegram", color: "#2AABEE" },
  discord: { name: "Discord", color: "#5865F2" },
  slack: { name: "Slack", color: "#E01E5A" }
};
const DEMO_CHANNELS = [
  { id: "1", platform: "whatsapp", detail: "+55 51 9999-8888", agent: "Suporte Geral" },
  { id: "2", platform: "discord", detail: "Servidor: TechCorp IT", agent: "Suporte Rede" }
];
const MAX_CHANNELS = 3;
const PlatformIcon = ({ platform, size = 22 }) => {
  const s = size;
  if (platform === "whatsapp") return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" }) });
  if (platform === "telegram") return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" }) });
  if (platform === "discord") return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" }) });
};
const TierBadge = ({ tier }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 text-[10px] font-medium rounded leading-none ${tier === "free" ? "bg-emerald-500/15 text-emerald-400" : tier === "starter" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"}`, children: tier === "free" ? "Free" : tier === "starter" ? "Starter" : "Pro" });
const ModelSelect = ({ value, onChange }) => {
  const [open, setOpen] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  const selected = ALL_MODELS.find((m) => m.id === value) ?? ALL_MODELS[0];
  const selProvider = PROVIDER_META[selected.providerId] ?? { label: selected.providerId, color: "#888" };
  const groups = [];
  for (const model of ALL_MODELS) {
    let g = groups.find((x) => x.providerId === model.providerId);
    if (!g) {
      g = { providerId: model.providerId, models: [] };
      groups.push(g);
    }
    g.models.push(model);
  }
  reactExports.useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  reactExports.useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((o) => !o),
        className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors ${open ? "border-accent bg-surface ring-1 ring-accent/30" : "border-border bg-surface hover:border-accent/50"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full flex-shrink-0", style: { backgroundColor: selProvider.color } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-left text-text-primary font-medium", children: selected.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            selected.capabilities.vision && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded leading-none bg-accent/15 text-accent", children: "Visão" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TierBadge, { tier: selected.tier })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              width: "14",
              height: "14",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              className: `text-text-muted flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "6 9 12 15 18 9" })
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 right-0 top-full mt-1.5 z-10 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-64 overflow-y-auto py-1.5", children: groups.map(({ providerId, models }, gi) => {
      const p = PROVIDER_META[providerId] ?? { label: providerId, color: "#888" };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        gi > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-3 my-1 border-t border-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full flex-shrink-0", style: { backgroundColor: p.color } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-text-muted uppercase tracking-wider", children: p.label })
        ] }),
        models.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              onChange(m.id);
              setOpen(false);
            },
            className: `w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${m.id === value ? "bg-accent/10 text-text-primary" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3.5 flex-shrink-0 flex justify-center", children: m.id === value && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "text-accent", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "20 6 9 17 4 12" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-left font-medium", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
                m.capabilities.vision && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded leading-none bg-accent/15 text-accent", children: "Visão" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TierBadge, { tier: m.tier })
              ] })
            ]
          },
          m.id
        ))
      ] }, providerId);
    }) }) })
  ] });
};
const ChannelListView = ({ onAdd, onSettings }) => {
  const used = DEMO_CHANNELS.length;
  const empty2 = MAX_CHANNELS - used;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-text-primary", children: "Canais conectados" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] mt-1 max-w-xs leading-relaxed", children: "Conecte o Teki ao WhatsApp, Telegram, Discord ou Slack. Seus técnicos podem enviar fotos de erros e receber diagnósticos direto no celular." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-shrink-0 ml-3 px-2.5 py-1 rounded-full text-xs font-semibold text-accent bg-accent/10", children: [
        used,
        " / ",
        MAX_CHANNELS
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5", children: [
      DEMO_CHANNELS.map((ch) => {
        const meta = CHANNEL_META[ch.platform];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 px-4 py-3 rounded-xl bg-[#18181b] border border-[#3f3f46]/50 hover:border-[#3f3f46] transition-colors",
            style: { minHeight: 72 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-10 h-10 rounded-full flex items-center justify-center",
                    style: { backgroundColor: meta.color + "1a", border: `1px solid ${meta.color}4d` },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: meta.color }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformIcon, { platform: ch.platform, size: 20 }) })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#18181b]",
                    style: { boxShadow: "0 0 0 2px #34d39933" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-[#fafafa]", children: meta.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 leading-none", children: "Conectado" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] mt-0.5", children: ch.detail }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[#71717a]", children: [
                    "Agente: ",
                    ch.agent
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => onSettings(ch.id),
                    className: "w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors",
                    title: "Configurar",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-red-400 hover:bg-red-500/5 transition-colors", title: "Desconectar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "2", y1: "2", x2: "22", y2: "22" })
                ] }) })
              ] })
            ]
          },
          ch.id
        );
      }),
      Array.from({ length: empty2 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onAdd,
          className: "w-full flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-dashed border-[#3f3f46]/40 text-[#71717a] hover:border-accent/40 hover:text-accent transition-colors group",
          style: { minHeight: 72 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "16" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "12", x2: "16", y2: "12" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Adicionar canal" })
          ]
        },
        i
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 px-4 py-3 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-accent flex-shrink-0 mt-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] leading-relaxed", children: "Mensagens recebidas pelo OpenClaw consomem o limite do seu plano (2.000/mês). Cada canal usa o modelo configurado no agente vinculado." })
    ] })
  ] });
};
const AddStep1View = ({ onBack, onSelect }) => {
  const platforms = ["whatsapp", "telegram", "discord", "slack"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "15 18 9 12 15 6" }) }),
      "Voltar"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-[#fafafa] mb-1", children: "Adicionar canal" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] mb-5", children: "Escolha a plataforma para conectar ao Teki." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: platforms.map((p) => {
      const meta = CHANNEL_META[p];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onSelect(p),
          className: "flex flex-col items-center justify-center gap-2.5 py-5 px-4 rounded-xl border transition-all group",
          style: {
            backgroundColor: meta.color + "0d",
            borderColor: meta.color + "33"
          },
          onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = meta.color + "1a";
            e.currentTarget.style.borderColor = meta.color + "80";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = meta.color + "0d";
            e.currentTarget.style.borderColor = meta.color + "33";
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: meta.color }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformIcon, { platform: p, size: 28 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-[#fafafa]", children: meta.name })
          ]
        },
        p
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] mt-4 text-center", children: "Cada canal precisa de uma conta ativa na plataforma escolhida." })
  ] });
};
const QRCodePlaceholder = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "160", height: "160", viewBox: "0 0 160 160", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "160", height: "160", fill: "white" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "10", width: "40", height: "40", fill: "#111", rx: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "16", y: "16", width: "28", height: "28", fill: "white", rx: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "20", y: "20", width: "20", height: "20", fill: "#111", rx: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "110", y: "10", width: "40", height: "40", fill: "#111", rx: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "116", y: "16", width: "28", height: "28", fill: "white", rx: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "120", y: "20", width: "20", height: "20", fill: "#111", rx: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "110", width: "40", height: "40", fill: "#111", rx: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "16", y: "116", width: "28", height: "28", fill: "white", rx: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "20", y: "120", width: "20", height: "20", fill: "#111", rx: "1" }),
  [60, 70, 80, 90, 100].map((x) => [60, 70, 80, 90, 100].map(
    (y) => (x + y) % 20 === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y, width: "8", height: "8", fill: "#111", rx: "1" }, `${x}-${y}`) : null
  )),
  [60, 75, 90, 105].map((x) => [10, 25, 40].map(
    (y) => /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y, width: "8", height: "8", fill: "#111", rx: "1" }, `d-${x}-${y}`)
  )),
  [10, 25, 40].map((x) => [60, 75, 90, 105].map(
    (y) => /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y, width: "8", height: "8", fill: "#111", rx: "1" }, `d2-${x}-${y}`)
  )),
  [60, 80, 100, 120, 140].map((x) => [130, 145].map(
    (y) => y < 160 && x < 160 ? /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y, width: "8", height: "8", fill: "#111", rx: "1" }, `d3-${x}-${y}`) : null
  ))
] });
const AddStep2View = ({ platform, onBack }) => {
  const meta = CHANNEL_META[platform];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "15 18 9 12 15 6" }) }),
      "Voltar"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: meta.color }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformIcon, { platform, size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-[#fafafa]", children: [
        "Conectar ",
        meta.name
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-44 h-44 rounded-xl overflow-hidden flex items-center justify-center bg-white p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodePlaceholder, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#71717a]", children: [
            "Escaneie com o ",
            meta.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-[#71717a] hover:text-accent transition-colors", title: "Gerar novo código", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "23 4 23 10 17 10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: ["Abra o WhatsApp no celular", "Toque em Configurações → Aparelhos conectados", "Escaneie o QR code ao lado"].map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 rounded-full bg-[#3f3f46] text-[#fafafa] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5", children: i + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a]", children: step })
        ] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] text-[#71717a] mb-1.5", children: "Agente vinculado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] cursor-pointer hover:border-[#3f3f46] transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Suporte Geral" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[#71717a]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "6 9 12 15 18 9" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-accent animate-spin flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#71717a]", children: "Aguardando conexão..." })
        ] })
      ] })
    ] })
  ] });
};
const ChannelSettingsView = ({ channelId, onBack }) => {
  const channel = DEMO_CHANNELS.find((c) => c.id === channelId) ?? DEMO_CHANNELS[0];
  const meta = CHANNEL_META[channel.platform];
  const [welcome, setWelcome] = reactExports.useState("Olá! Sou o Teki, assistente de TI. Me envie uma foto do erro ou descreva o problema.");
  const [allDay, setAllDay] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors mb-4 flex-shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "15 18 9 12 15 6" }) }),
      "Voltar"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5 flex-shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: meta.color }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlatformIcon, { platform: channel.platform, size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-[#fafafa]", children: meta.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 leading-none", children: "Conectado" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto space-y-5 pr-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Agente vinculado", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SimpleSelect, { value: "Suporte Geral" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Modelo de IA", hint: "Substitui o modelo do agente quando configurado", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SimpleSelect, { value: "Padrão do agente (Gemini Flash)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { label: "Mensagem de boas-vindas", hint: "Enviada automaticamente na primeira mensagem de cada conversa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: welcome,
          onChange: (e) => setWelcome(e.target.value),
          rows: 3,
          className: "w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#71717a] resize-none focus:outline-none focus:border-accent transition-colors"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(FormField, { label: "Horário de atendimento", hint: "Fora deste horário, o Teki envia mensagem de ausência", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "time",
              defaultValue: "08:00",
              className: "px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] focus:outline-none focus:border-accent transition-colors"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#71717a]", children: "até" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "time",
              defaultValue: "18:00",
              className: "px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] focus:outline-none focus:border-accent transition-colors"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2.5 px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#71717a]", children: "Responder 24h (ignorar horário)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setAllDay((v) => !v),
              className: `relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${allDay ? "bg-accent" : "bg-[#3f3f46]"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${allDay ? "left-4" : "left-0.5"}` })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-[#3f3f46]/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-1.5 text-xs text-red-400 hover:underline transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "2", y1: "2", x2: "22", y2: "22" })
          ] }),
          "Desconectar ",
          meta.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#71717a] mt-1 ml-5", children: "O canal será removido e o slot ficará disponível." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-4 border-t border-[#3f3f46]/30 flex-shrink-0 mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors", children: "Salvar" }) })
  ] });
};
const FormField = ({ label, hint, children }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] text-[#71717a] mb-1", children: label }),
  hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#71717a]/70 mb-1.5", children: hint }),
  children
] });
const SimpleSelect = ({ value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] cursor-pointer hover:border-[#3f3f46] transition-colors", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[#71717a]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "6 9 12 15 18 9" }) })
] });
function usageColor(pct) {
  if (pct >= 85) return "#EF4444";
  if (pct >= 60) return "#F59E0B";
  return "#2A8F9D";
}
const UsageBar = ({ label, current, total, unit = "" }) => {
  const pct = Math.min(100, Math.round(current / total * 100));
  const color2 = usageColor(pct);
  const fmt = (v) => unit ? `${v} ${unit}` : String(v);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[#71717a]", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-[#71717a]", children: [
        fmt(current),
        " / ",
        fmt(total)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1.5 rounded-full bg-[#27272a] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: { width: `${pct}%`, backgroundColor: color2 } }) })
  ] });
};
const DEMO_API_KEYS = [
  { id: "1", name: "Produção", key: "tk_live_7k2m", dot: "#34D399" },
  { id: "2", name: "Teste", key: "tk_test_9m4x", dot: "#FCD34D" }
];
const AccountTab = ({ onOpenPlan }) => {
  const [editingProfile, setEditingProfile] = reactExports.useState(false);
  const [name2, setName] = reactExports.useState("Lucas Klein");
  const [email, setEmail] = reactExports.useState("lucas@merito.dev");
  const initials = name2.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pb-5", children: !editingProfile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0 group cursor-pointer", onClick: () => setEditingProfile(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white select-none",
            style: { background: "linear-gradient(135deg, #2A8F9D, #1E6B75)" },
            children: initials
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "13", r: "4" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-[#fafafa] leading-tight", children: name2 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[#71717a] mt-0.5", children: email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#52525b] font-mono mt-0.5", children: "ID: usr_7k2m9x" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setEditingProfile(true),
          className: "flex-shrink-0 px-4 py-1.5 rounded-lg border border-[#3f3f46]/50 text-[13px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors",
          children: "Editar perfil"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex flex-col items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white",
            style: { background: "linear-gradient(135deg, #2A8F9D, #1E6B75)" },
            children: initials
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-[10px] text-[#71717a] hover:text-[#2A8F9D] flex items-center gap-1 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "13", r: "4" })
          ] }),
          "Alterar foto"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] text-[#71717a] mb-1", children: "Nome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: name2,
              onChange: (e) => setName(e.target.value),
              className: "w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-[13px] text-[#fafafa] focus:outline-none focus:border-[#2A8F9D] transition-colors"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] text-[#71717a] mb-1", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "w-full px-3 py-2 pr-8 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-[13px] text-[#fafafa] focus:outline-none focus:border-[#2A8F9D] transition-colors"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525b]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setEditingProfile(false),
              className: "px-4 py-1.5 rounded-lg border border-[#3f3f46]/50 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors",
              children: "Cancelar"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setEditingProfile(false),
              className: "px-4 py-1.5 rounded-lg bg-[#2A8F9D] text-[12px] text-white hover:bg-[#238490] transition-colors",
              children: "Salvar"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-[#3f3f46]/30 my-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] font-bold text-[#fafafa]", children: "Plano atual" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onOpenPlan, className: "text-[13px] text-[#2A8F9D] hover:underline transition-colors", children: "Alterar plano →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-[#18181b] border border-[#3f3f46]/50 p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/30", children: "Starter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] font-bold text-[#fafafa]", children: "R$ 29/mês" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#71717a]", children: "Renova em 15 mar" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UsageBar, { label: "Mensagens este mês", current: 347, total: 500 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(UsageBar, { label: "Armazenamento KB", current: 8.2, total: 25, unit: "MB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UsageBar, { label: "Agentes ativos", current: 1, total: 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-amber-400 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-amber-400", children: "Limite de agentes atingido." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onOpenPlan, className: "text-[11px] text-[#2A8F9D] hover:underline", children: "Upgrade para Pro →" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-[#3f3f46]/30 my-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] font-bold text-[#fafafa]", children: "Chaves de API" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-4 py-1.5 rounded-lg bg-[#2A8F9D] text-[13px] text-white hover:bg-[#238490] transition-colors", children: "+ Nova chave" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] text-[#71717a] mb-3", children: "Use chaves de API para integrar o Teki nos seus sistemas." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: DEMO_API_KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 hover:border-[#3f3f46] transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[#71717a] flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-semibold text-[#fafafa]", children: k.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full flex-shrink-0", style: { backgroundColor: k.dot } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[12px] text-[#71717a] font-mono", children: [
            k.key,
            "••••••••••••"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors", title: "Copiar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-red-400 hover:bg-red-500/5 transition-colors", title: "Revogar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "3 6 5 6 21 6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
          ] }) })
        ] })
      ] }, k.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#52525b] mt-2", children: "Chaves de teste não consomem mensagens do plano. Limite: 5 chaves ativas." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-[#3f3f46]/30 my-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-5 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] font-bold text-[#fafafa] mb-3", children: "Segurança" }),
      [
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
          ] }),
          label: "Alterar senha",
          detail: "Última alteração: 12 jan 2026",
          btn: "Alterar"
        },
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })
          ] }),
          label: "Sessões ativas",
          detail: "3 dispositivos",
          btn: "Gerenciar"
        }
      ].map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#71717a] flex-shrink-0", children: row.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] text-[#fafafa]", children: row.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[#71717a] mx-2", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[#71717a]", children: row.detail })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-shrink-0 px-3 py-1 rounded-lg border border-[#3f3f46]/50 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors", children: row.btn })
      ] }, row.label))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-[#3f3f46]/30 my-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-5 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] font-bold mb-3", style: { color: "rgba(239,68,68,0.8)" }, children: "Zona de perigo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[#71717a] flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "7 10 12 15 17 10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] text-[#fafafa]", children: "Exportar dados" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[#71717a] mx-2", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[#71717a]", children: "Conversas, agentes e configurações em JSON" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-shrink-0 px-3 py-1 rounded-lg border border-[#3f3f46]/50 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors", children: "Exportar" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "flex-shrink-0", style: { color: "rgba(239,68,68,0.6)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "3 6 5 6 21 6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] text-red-400", children: "Excluir conta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] mx-2", style: { color: "rgba(239,68,68,0.5)" }, children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px]", style: { color: "rgba(239,68,68,0.5)" }, children: "Todos os dados serão removidos permanentemente" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "flex-shrink-0 px-3 py-1 rounded-lg border text-[12px] transition-colors",
            style: { borderColor: "rgba(239,68,68,0.3)", color: "rgba(239,68,68,0.7)" },
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#EF4444";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(239,68,68,0.7)";
            },
            children: "Excluir"
          }
        )
      ] })
    ] })
  ] });
};
const PLANS = [
  {
    id: "free",
    label: "FREE",
    price: "R$ 0",
    period: "/mês",
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    borderClass: "border-[#3f3f46]/50",
    features: [
      { star: false, text: "1 agente" },
      { star: false, text: "50 mensagens/mês" },
      { star: false, text: "2 docs na KB (5 MB)" },
      { star: false, text: "1 modelo (Gemini Flash)" },
      { star: false, text: "Web + Desktop" },
      { star: false, text: "Visão de tela" },
      { star: false, text: "7 dias de histórico" }
    ],
    btn: { label: "Downgrade", disabled: false, className: "border border-[#3f3f46]/50 text-[#71717a] hover:text-[#fafafa] hover:border-[#3f3f46]" },
    current: false,
    recommended: false
  },
  {
    id: "starter",
    label: "STARTER",
    price: "R$ 29",
    period: "/mês",
    badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    borderClass: "border-blue-500/40",
    features: [
      { star: false, text: "1 agente" },
      { star: false, text: "500 mensagens/mês" },
      { star: false, text: "5 docs na KB (25 MB)" },
      { star: false, text: "3 modelos de IA" },
      { star: false, text: "Web + Desktop" },
      { star: false, text: "Visão de tela" },
      { star: false, text: "30 dias de histórico" },
      { star: false, text: "Suporte por email" }
    ],
    btn: { label: "Plano atual", disabled: true, className: "bg-[#27272a] text-[#52525b] cursor-not-allowed" },
    current: true,
    recommended: false
  },
  {
    id: "pro",
    label: "PRO",
    price: "R$ 79",
    period: "/mês",
    badgeClass: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    borderClass: "border-[#2A8F9D]/50",
    features: [
      { star: false, text: "5 agentes" },
      { star: false, text: "2.000 mensagens/mês" },
      { star: false, text: "50 docs na KB (100 MB)" },
      { star: false, text: "7 modelos de IA + Ollama" },
      { star: false, text: "Web + Desktop" },
      { star: false, text: "Visão de tela" },
      { star: false, text: "Histórico ilimitado" },
      { star: true, text: "WhatsApp, Telegram, Discord, Slack" },
      { star: true, text: "BYOK (use sua própria API key)" },
      { star: false, text: "Onboarding 1:1" },
      { star: false, text: "Suporte prioritário" }
    ],
    btn: { label: "Assinar Pro", disabled: false, className: "bg-[#2A8F9D] text-white hover:bg-[#238490]" },
    current: false,
    recommended: true
  }
];
const PlanModal = ({ onClose }) => {
  reactExports.useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm",
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-[#111113] border border-[#3f3f46]/50 rounded-2xl shadow-2xl overflow-hidden",
          style: { width: 780, maxHeight: "90vh" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center relative px-6 py-5 border-b border-[#3f3f46]/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-[#fafafa]", children: "Escolha seu plano" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:bg-white/5 hover:text-[#fafafa] transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 p-6", children: PLANS.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `flex-1 flex flex-col rounded-xl bg-[#18181b] border ${plan.borderClass} p-5 transition-all`,
                style: plan.recommended ? { boxShadow: "0 0 20px rgba(42,143,157,0.12)" } : plan.current ? { boxShadow: "0 0 20px rgba(59,130,246,0.08)" } : {},
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${plan.badgeClass}`, children: plan.label }),
                    plan.current && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[#71717a]", children: "ATUAL" }),
                    plan.recommended && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#2A8F9D]/10 text-[#2A8F9D] border border-[#2A8F9D]/30", children: "POPULAR" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-[#fafafa]", children: plan.price }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] text-[#71717a]", children: plan.period })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex-1 space-y-2 mb-5", children: plan.features.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "flex items-start gap-2", children: f.star ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "currentColor", className: "text-[#2A8F9D] flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[#2A8F9D]", children: f.text })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[#2A8F9D] flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "20 6 9 17 4 12" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[#71717a]", children: f.text })
                  ] }) }, i)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      disabled: plan.btn.disabled,
                      className: `w-full py-2 rounded-lg text-[13px] font-medium transition-colors ${plan.btn.className}`,
                      children: plan.btn.label
                    }
                  )
                ]
              },
              plan.id
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center pb-5 text-[11px] text-[#52525b]", children: [
              "🏢 Enterprise?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-[#2A8F9D] hover:underline", children: "Fale conosco →" }),
              " · ",
              "Pagamento via Mercado Pago. Cancele quando quiser."
            ] })
          ]
        }
      )
    }
  );
};
const DEMO_DOCS = [
  { id: "1", name: "Guia de Suporte Nivel 1.pdf", type: "pdf", size: "2.4 MB", status: "indexed", indexedAt: "15 jan 2026", chunks: 42, words: 8300 },
  { id: "2", name: "Procedimentos de Rede.md", type: "md", size: "48 KB", status: "indexed", indexedAt: "18 jan 2026", chunks: 11, words: 2100 },
  { id: "3", name: "FAQ Impressoras.txt", type: "txt", size: "120 KB", status: "indexing", progress: 65 }
];
const MAX_DOCS = 5;
const KB_TOTAL_MB = 25;
function DocTypeIcon({ type }) {
  const cfg = {
    pdf: { color: "#EF4444", label: "PDF" },
    md: { color: "#3B82F6", label: "MD" },
    txt: { color: "#F59E0B", label: "TXT" },
    docx: { color: "#6366F1", label: "DOC" }
  }[type];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
      style: { backgroundColor: cfg.color + "1a", color: cfg.color, border: `1px solid ${cfg.color}33` },
      children: cfg.label
    }
  );
}
function DocStatusBadge({ status }) {
  if (status === "indexed") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded leading-none border border-emerald-500/30 bg-emerald-500/10 text-emerald-400", children: "Indexado" });
  if (status === "indexing") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded leading-none border border-amber-500/30 bg-amber-500/10 text-amber-400", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" }),
    "Indexando"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 text-[10px] font-medium rounded leading-none border border-red-500/30 bg-red-500/10 text-red-400", children: "Erro" });
}
const KnowledgeBaseTab = () => {
  const [docs2, setDocs] = reactExports.useState(DEMO_DOCS);
  const [isDragOver, setIsDragOver] = reactExports.useState(false);
  const [uploading, setUploading] = reactExports.useState(false);
  const [uploadProgress, setUploadProgress] = reactExports.useState(0);
  const [uploadName, setUploadName] = reactExports.useState("");
  const [detailDoc, setDetailDoc] = reactExports.useState(null);
  const [menuOpen, setMenuOpen] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const usedMB = 8.2;
  const usedPct = Math.round(usedMB / KB_TOTAL_MB * 100);
  const slots = MAX_DOCS - docs2.length;
  const simulateUpload = (name2) => {
    setUploadName(name2);
    setUploading(true);
    setUploadProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        clearInterval(iv);
        setUploadProgress(100);
        setTimeout(() => {
          setUploading(false);
          const ext = name2.split(".").pop()?.toLowerCase() ?? "txt";
          setDocs((prev) => [...prev, { id: String(Date.now()), name: name2, type: ext, size: "~", status: "indexing", progress: 0 }]);
        }, 400);
      } else {
        setUploadProgress(p);
      }
    }, 200);
  };
  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    simulateUpload(files[0].name);
  };
  const removeDoc = (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setMenuOpen(null);
    if (detailDoc?.id === id) setDetailDoc(null);
  };
  reactExports.useEffect(() => {
    if (!menuOpen) return;
    const h = () => setMenuOpen(null);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);
  if (docs2.length === 0 && !uploading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", className: "text-accent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-[#fafafa] mb-1", children: "Base de conhecimento vazia" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] mb-5 max-w-xs leading-relaxed", children: "Envie documentos (PDF, MD, TXT, DOCX) para que o Teki possa usá-los como referência nas respostas." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => fileInputRef.current?.click(),
          className: "px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-[#238490] transition-colors",
          children: "Enviar primeiro documento"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          className: "hidden",
          accept: ".pdf,.md,.txt,.docx",
          onChange: (e) => handleFiles(e.target.files)
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 min-h-0 gap-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col min-w-0 transition-all duration-200 ${detailDoc ? "w-[54%] pr-5" : "w-full"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-[#fafafa]", children: "Base de Conhecimento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] mt-0.5", children: "Documentos indexados para uso nas respostas" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0 ml-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181b] border border-[#3f3f46]/50 text-xs text-[#71717a]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "12", cy: "5", rx: "9", ry: "3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              usedMB,
              " / ",
              KB_TOTAL_MB,
              " MB"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-1 rounded-full bg-[#3f3f46] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-accent", style: { width: `${usedPct}%` } }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => fileInputRef.current?.click(),
              className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-[#238490] transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
                ] }),
                "Enviar"
              ]
            }
          )
        ] })
      ] }),
      uploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2.5 px-4 py-3 rounded-xl bg-[#18181b] border border-accent/30 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-accent animate-spin flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#fafafa] font-medium truncate", children: uploadName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-accent font-semibold ml-2", children: [
            Math.round(uploadProgress),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1.5 rounded-full bg-[#3f3f46] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-accent transition-all", style: { width: `${uploadProgress}%` } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#71717a] mt-1", children: "Processando e indexando documento..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `mb-2.5 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 py-3 transition-colors cursor-pointer flex-shrink-0 ${isDragOver ? "border-accent bg-accent/5 text-accent" : "border-[#3f3f46]/40 text-[#71717a] hover:border-accent/40 hover:text-accent"}`,
          onDragOver: (e) => {
            e.preventDefault();
            setIsDragOver(true);
          },
          onDragLeave: () => setIsDragOver(false),
          onDrop: (e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          },
          onClick: () => fileInputRef.current?.click(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "16 16 12 12 8 16" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "12", x2: "12", y2: "21" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: isDragOver ? "Solte o arquivo aqui" : "Arraste ou clique · PDF, MD, TXT, DOCX" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          className: "hidden",
          accept: ".pdf,.md,.txt,.docx",
          onChange: (e) => handleFiles(e.target.files)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto space-y-1.5", children: [
        docs2.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#18181b] border transition-colors cursor-pointer ${detailDoc?.id === doc.id ? "border-accent/40 bg-accent/5" : "border-[#3f3f46]/50 hover:border-[#3f3f46]"}`,
            onClick: () => setDetailDoc(detailDoc?.id === doc.id ? null : doc),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DocTypeIcon, { type: doc.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-medium text-[#fafafa] truncate block", children: doc.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[#71717a]", children: doc.size }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[#52525b]", children: "·" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DocStatusBadge, { status: doc.status })
                ] }),
                doc.status === "indexing" && typeof doc.progress === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 w-full h-1 rounded-full bg-[#3f3f46] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-amber-400 transition-all", style: { width: `${doc.progress}%` } }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0", onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setMenuOpen(menuOpen === doc.id ? null : doc.id),
                    className: "w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "currentColor", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "5", r: "1.5" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "1.5" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "19", r: "1.5" })
                    ] })
                  }
                ),
                menuOpen === doc.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-full mt-1 z-20 bg-[#1c1c1e] border border-[#3f3f46]/60 rounded-lg shadow-xl py-1 w-36", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => {
                        setDetailDoc(doc);
                        setMenuOpen(null);
                      },
                      className: "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 transition-colors text-left",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "8" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
                        ] }),
                        "Ver detalhes"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => removeDoc(doc.id),
                      className: "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors text-left",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "3 6 5 6 21 6" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
                        ] }),
                        "Remover"
                      ]
                    }
                  )
                ] })
              ] })
            ]
          },
          doc.id
        )),
        slots > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-[#52525b] text-center py-1", children: [
          slots,
          " slot",
          slots !== 1 ? "s" : "",
          " restante",
          slots !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 px-3 py-2 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30 mt-2.5 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-accent flex-shrink-0 mt-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-[#71717a] leading-relaxed", children: [
          "Documentos ficam disponíveis para todos os agentes. Máx. ",
          MAX_DOCS,
          " docs / ",
          KB_TOTAL_MB,
          " MB no plano Starter."
        ] })
      ] })
    ] }),
    detailDoc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[46%] border-l border-[#3f3f46]/50 pl-5 flex flex-col flex-shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[11px] font-semibold text-[#fafafa] uppercase tracking-wider", children: "Detalhes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setDetailDoc(null),
            className: "w-6 h-6 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4 pb-3 border-b border-[#3f3f46]/30 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocTypeIcon, { type: detailDoc.type }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] font-semibold text-[#fafafa] truncate", children: detailDoc.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocStatusBadge, { status: detailDoc.status }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto space-y-0", children: [
        { label: "Tamanho", value: detailDoc.size },
        { label: "Status", value: detailDoc.status === "indexed" ? "Indexado" : detailDoc.status === "indexing" ? "Indexando..." : "Erro" },
        { label: "Indexado em", value: detailDoc.indexedAt ?? "—" },
        { label: "Chunks", value: detailDoc.chunks != null ? String(detailDoc.chunks) : "—" },
        { label: "Palavras", value: detailDoc.words != null ? detailDoc.words.toLocaleString("pt-BR") : "—" }
      ].map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 border-b border-[#3f3f46]/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[#71717a]", children: row.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[#fafafa] font-medium", children: row.value })
      ] }, row.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => removeDoc(detailDoc.id),
          className: "w-full py-2 rounded-lg border text-xs font-medium transition-colors",
          style: { borderColor: "rgba(239,68,68,0.3)", color: "rgba(239,68,68,0.7)" },
          onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
            e.currentTarget.style.color = "#EF4444";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(239,68,68,0.7)";
          },
          children: "Remover documento"
        }
      ) })
    ] })
  ] });
};
const SettingsModal = () => {
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const selectedModel = useAppStore((s) => s.selectedModel);
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);
  const [activeTab, setActiveTab] = reactExports.useState("ia");
  const [ocView, setOcView] = reactExports.useState({ type: "list" });
  const [planModalOpen, setPlanModalOpen] = reactExports.useState(false);
  const [visible, setVisible] = reactExports.useState(false);
  const currentModel = ALL_MODELS.find((m) => m.id === selectedModel) ?? ALL_MODELS[0];
  const activeProvider = currentModel.providerId;
  reactExports.useEffect(() => {
    if (settingsOpen) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [settingsOpen]);
  const close = reactExports.useCallback(() => {
    setVisible(false);
    setTimeout(() => setSettingsOpen(false), 150);
  }, [setSettingsOpen]);
  reactExports.useEffect(() => {
    if (!settingsOpen) return;
    const h = (e) => {
      if (e.key === "Escape" && !planModalOpen) close();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [settingsOpen, close, planModalOpen]);
  const handleTabChange = (tab2) => {
    setActiveTab(tab2);
    if (tab2 === "openclaw") setOcView({ type: "list" });
  };
  if (!settingsOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`,
      onClick: (e) => {
        if (e.target === e.currentTarget) close();
      },
      children: [
        planModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(PlanModal, { onClose: () => setPlanModalOpen(false) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `bg-[#111113] border border-[#3f3f46]/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"}`,
            style: { width: 780, height: 520 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-[#3f3f46]/50 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-[#fafafa]", children: "Configurações" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: close,
                    className: "flex items-center justify-center w-7 h-7 rounded-md text-[#71717a] hover:bg-white/5 hover:text-[#fafafa] transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
                    ] })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "w-48 flex-shrink-0 border-r border-[#3f3f46]/50 py-3 px-2 space-y-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SidebarTab,
                    {
                      active: activeTab === "ia",
                      onClick: () => handleTabChange("ia"),
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" })
                      ] }),
                      label: "Modelo"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SidebarTab,
                    {
                      active: activeTab === "openclaw",
                      onClick: () => handleTabChange("openclaw"),
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
                      ] }),
                      label: "OpenClaw"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SidebarTab,
                    {
                      active: activeTab === "kb",
                      onClick: () => handleTabChange("kb"),
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" })
                      ] }),
                      label: "Conhecimento"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SidebarTab,
                    {
                      active: activeTab === "conta",
                      onClick: () => handleTabChange("conta"),
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "7", r: "4" })
                      ] }),
                      label: "Conta"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SidebarTab,
                    {
                      active: activeTab === "geral",
                      onClick: () => handleTabChange("geral"),
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })
                      ] }),
                      label: "Geral"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex-1 p-7 ${activeTab === "kb" ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`, children: [
                  activeTab === "ia" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-md", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2", children: "Modelo de IA" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] mb-3", children: "Modelo usado em todas as conversas. Modelos com visão analisam screenshots." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ModelSelect, { value: selectedModel, onChange: setSelectedModel }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#71717a] mt-2", children: currentModel.description })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-[#3f3f46]/30 pt-5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-3", children: "Chave de API" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ApiKeyInput, { provider: activeProvider })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-[#3f3f46] border-t border-[#3f3f46]/20 pt-4", children: "Suas chaves são armazenadas localmente e nunca enviadas ao servidor do Teki." })
                  ] }),
                  activeTab === "openclaw" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    ocView.type === "list" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ChannelListView,
                      {
                        onAdd: () => setOcView({ type: "add-step1" }),
                        onSettings: (id) => setOcView({ type: "channel-settings", channelId: id })
                      }
                    ),
                    ocView.type === "add-step1" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AddStep1View,
                      {
                        onBack: () => setOcView({ type: "list" }),
                        onSelect: (p) => setOcView({ type: "add-step2", platform: p })
                      }
                    ),
                    ocView.type === "add-step2" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AddStep2View,
                      {
                        platform: ocView.platform,
                        onBack: () => setOcView({ type: "add-step1" })
                      }
                    ),
                    ocView.type === "channel-settings" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ChannelSettingsView,
                      {
                        channelId: ocView.channelId,
                        onBack: () => setOcView({ type: "list" })
                      }
                    )
                  ] }),
                  activeTab === "kb" && /* @__PURE__ */ jsxRuntimeExports.jsx(KnowledgeBaseTab, {}),
                  activeTab === "conta" && /* @__PURE__ */ jsxRuntimeExports.jsx(AccountTab, { onOpenPlan: () => setPlanModalOpen(true) }),
                  activeTab === "geral" && /* @__PURE__ */ jsxRuntimeExports.jsx(AllApiKeys, {})
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
};
const SidebarTab = ({ active, onClick, icon, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "button",
  {
    onClick,
    className: `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left relative ${active ? "bg-accent/5 text-accent font-medium border-l-2 border-accent pl-[10px]" : "text-[#a1a1aa] hover:bg-white/5 hover:text-[#fafafa]"}`,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0", children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
    ]
  }
);
const DesktopLogin = () => {
  const [authState, setAuthState] = reactExports.useState("idle");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [userCode, setUserCode] = reactExports.useState("");
  const [apiKeyInput, setApiKeyInput] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [countdown, setCountdown] = reactExports.useState(600);
  const [showAdvanced, setShowAdvanced] = reactExports.useState(false);
  const setAuth = useAppStore((s) => s.setAuth);
  reactExports.useEffect(() => {
    if (!window.tekiAPI) return;
    const cleanup = window.tekiAPI.onAuthStatus?.((data) => {
      if (data.status === "authorized") {
        setAuth(true, data.email || null, data.name || null);
      } else if (data.status === "expired") {
        setError("Codigo expirado. Tente novamente.");
        setAuthState("idle");
      } else if (data.status === "denied") {
        setError("Acesso negado.");
        setAuthState("idle");
      }
    });
    return cleanup;
  }, [setAuth]);
  reactExports.useEffect(() => {
    if (authState !== "device_flow") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(timer);
  }, [authState]);
  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      const result = await window.tekiAPI.loginWithCredentials(email, password);
      if (result.success) {
        const status = await window.tekiAPI.getAuthStatus();
        setAuth(true, status.email, status.name);
      } else {
        setError(result.error || "Email ou senha incorretos.");
      }
    } catch {
      setError("Erro de conexao. Verifique se o servidor esta rodando.");
    } finally {
      setLoading(false);
    }
  };
  const handleDeviceFlow = async () => {
    setError(null);
    setAuthState("device_flow");
    setCountdown(600);
    try {
      const result = await window.tekiAPI.startDeviceAuth();
      setUserCode(result.userCode);
    } catch {
      setError("Erro ao iniciar autenticacao. Verifique sua conexao.");
      setAuthState("idle");
    }
  };
  const handleApiKey = async () => {
    setError(null);
    if (!apiKeyInput.trim()) return;
    try {
      const success = await window.tekiAPI.setApiKey(apiKeyInput.trim());
      if (success) {
        const status = await window.tekiAPI.getAuthStatus();
        setAuth(true, status.email, status.name);
      } else {
        setError("API key invalida. Verifique e tente novamente.");
      }
    } catch {
      setError("Erro ao validar API key.");
    }
  };
  const handleCancel = () => {
    window.tekiAPI.cancelDeviceAuth?.();
    setAuthState("idle");
    setUserCode("");
    setError(null);
  };
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center justify-center h-full bg-bg p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm w-full space-y-6 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-text-primary", children: "Teki" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary", children: "Assistente IA para Suporte Tecnico" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-500/10 text-red-400 rounded-lg p-3 text-sm", children: error }),
    authState === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCredentialsLogin, className: "space-y-3 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-text-secondary mb-1", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "seu@email.com",
              className: "w-full h-10 px-3 text-sm bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none",
              autoFocus: true,
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-text-secondary mb-1", children: "Senha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "Sua senha",
              className: "w-full h-10 px-3 text-sm bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading || !email || !password,
            className: "w-full h-11 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50",
            children: loading ? "Entrando..." : "Entrar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-border" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-bg px-2 text-text-secondary", children: "ou" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleDeviceFlow,
          className: "w-full h-10 bg-surface border border-border text-text-primary rounded-lg text-sm font-medium hover:border-accent transition-colors",
          children: "Entrar via navegador"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowAdvanced(!showAdvanced),
            className: "text-xs text-text-muted hover:text-text-secondary transition-colors",
            children: showAdvanced ? "Ocultar API key" : "Usar API key"
          }
        ),
        showAdvanced && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: apiKeyInput,
              onChange: (e) => setApiKeyInput(e.target.value),
              placeholder: "tk_live_...",
              className: "flex-1 h-9 px-3 text-sm bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none font-mono"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleApiKey,
              disabled: !apiKeyInput.trim(),
              className: "h-9 px-4 text-sm bg-surface border border-border rounded-md text-text-primary hover:border-accent disabled:opacity-50 transition-colors",
              children: "Salvar"
            }
          )
        ] })
      ] })
    ] }),
    authState === "device_flow" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-text-secondary", children: "Codigo de acesso:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-1 text-3xl font-mono font-bold text-text-primary tracking-widest", children: userCode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        userCode.split("-")[0]?.split("").map((char, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "w-10 h-12 flex items-center justify-center bg-surface border border-border rounded-lg",
            children: char
          },
          `a${i}`
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-muted mx-1", children: "-" }),
        userCode.split("-")[1]?.split("").map((char, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "w-10 h-12 flex items-center justify-center bg-surface border border-border rounded-lg",
            children: char
          },
          `b${i}`
        ))
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base text-text-muted", children: "Gerando codigo..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary", children: [
          "Abra",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent font-medium", children: "teki.com.br/auth/device" }),
          " ",
          "no navegador e digite este codigo."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted animate-pulse", children: "Aguardando autorizacao..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-muted", children: [
          "Expira em ",
          formatTime(countdown)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleCancel,
          className: "text-sm text-text-secondary hover:text-text-primary transition-colors",
          children: "Cancelar"
        }
      )
    ] })
  ] }) });
};
const App = () => {
  const layout = useAppStore((s) => s.layout);
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setAuth = useAppStore((s) => s.setAuth);
  const setLayout = useAppStore((s) => s.setLayout);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);
  reactExports.useEffect(() => {
    if (window.tekiAPI?.getAuthStatus) {
      window.tekiAPI.getAuthStatus().then((status) => {
        setAuth(status.isAuthenticated, status.email, status.name);
      });
    }
  }, [setAuth]);
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && e.key === "1") {
        e.preventDefault();
        setLayout("chat-only");
      } else if (isCtrl && e.key === "2") {
        e.preventDefault();
        setLayout("screen-only");
      } else if (isCtrl && e.key === "3") {
        e.preventDefault();
        setLayout("compact");
      } else if (isCtrl && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setLayout, toggleCommandPalette]);
  const renderContent = () => {
    switch (layout) {
      case "split":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          SplitLayout,
          {
            leftPanel: /* @__PURE__ */ jsxRuntimeExports.jsx(ScreenViewer, {}),
            rightPanel: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, {})
          }
        );
      case "chat-only":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, {});
      case "screen-only":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ScreenViewer, {});
      case "compact":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[400px] border-r border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, {}) }) });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          SplitLayout,
          {
            leftPanel: /* @__PURE__ */ jsxRuntimeExports.jsx(ScreenViewer, {}),
            rightPanel: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, {})
          }
        );
    }
  };
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen flex flex-col bg-bg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TitleBar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopLogin, {}) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen flex flex-col bg-bg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TitleBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-hidden", children: renderContent() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBar, {}),
    commandPaletteOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(CommandPalette, {}),
    settingsOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsModal, {})
  ] });
};
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
