import { r as reactExports, j as jsxRuntimeExports, b as createRoot } from "./client-sPD6oxeY.js";
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
var defaultAttributes = {
  outline: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  },
  filled: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    stroke: "none"
  }
};
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const createReactComponent = (type, iconName, iconNamePascal, iconNode) => {
  const Component = reactExports.forwardRef(
    ({ color = "currentColor", size = 24, stroke = 2, title, className, children, ...rest }, ref) => reactExports.createElement(
      "svg",
      {
        ref,
        ...defaultAttributes[type],
        width: size,
        height: size,
        className: [`tabler-icon`, `tabler-icon-${iconName}`, className].join(" "),
        ...{
          strokeWidth: stroke,
          stroke: color
        },
        ...rest
      },
      [
        title && reactExports.createElement("title", { key: "svg-title" }, title),
        ...iconNode.map(([tag, attrs]) => reactExports.createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    )
  );
  Component.displayName = `${iconNamePascal}`;
  return Component;
};
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$7 = [["path", { "d": "M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10", "key": "svg-0" }], ["path", { "d": "M7 20h10", "key": "svg-1" }], ["path", { "d": "M9 16v4", "key": "svg-2" }], ["path", { "d": "M15 16v4", "key": "svg-3" }]];
const IconDeviceDesktop = createReactComponent("outline", "device-desktop", "DeviceDesktop", __iconNode$7);
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [["path", { "d": "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2", "key": "svg-0" }], ["path", { "d": "M9 12h12l-3 -3", "key": "svg-1" }], ["path", { "d": "M18 15l3 -3", "key": "svg-2" }]];
const IconLogout = createReactComponent("outline", "logout", "Logout", __iconNode$6);
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [["path", { "d": "M8 9h8", "key": "svg-0" }], ["path", { "d": "M8 13h6", "key": "svg-1" }], ["path", { "d": "M12.01 18.594l-4.01 2.406v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5.5", "key": "svg-2" }], ["path", { "d": "M16 19h6", "key": "svg-3" }], ["path", { "d": "M19 16v6", "key": "svg-4" }]];
const IconMessagePlus = createReactComponent("outline", "message-plus", "MessagePlus", __iconNode$5);
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [["path", { "d": "M8 9h8", "key": "svg-0" }], ["path", { "d": "M8 13h6", "key": "svg-1" }], ["path", { "d": "M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12", "key": "svg-2" }]];
const IconMessage = createReactComponent("outline", "message", "Message", __iconNode$4);
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [["path", { "d": "M5 7a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -10", "key": "svg-0" }]];
const IconPlayerStop = createReactComponent("outline", "player-stop", "PlayerStop", __iconNode$3);
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [["path", { "d": "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4", "key": "svg-0" }], ["path", { "d": "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4", "key": "svg-1" }]];
const IconRefresh = createReactComponent("outline", "refresh", "Refresh", __iconNode$2);
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { "d": "M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0", "key": "svg-0" }], ["path", { "d": "M21 21l-6 -6", "key": "svg-1" }]];
const IconSearch = createReactComponent("outline", "search", "Search", __iconNode$1);
/**
 * @license @tabler/icons-react v3.36.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { "d": "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065", "key": "svg-0" }], ["path", { "d": "M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0", "key": "svg-1" }]];
const IconSettings = createReactComponent("outline", "settings", "Settings", __iconNode);
function TrayMenu() {
  const [state, setState] = reactExports.useState({
    status: "idle",
    windowName: "",
    elapsed: "0s",
    lastDuration: "",
    version: "0.1.0"
  });
  const rootRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    window.trayApi.onMenuState((newState) => {
      setState(newState);
    });
    const handleKey = (e) => {
      if (e.key === "Escape") window.trayApi.sendAction("close");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  reactExports.useEffect(() => {
    if (rootRef.current) {
      window.trayApi.setHeight(rootRef.current.scrollHeight);
    }
  });
  const act = (action) => () => window.trayApi.sendAction(action);
  const statusLabel = state.status === "watching" ? "Observando" : state.status === "alert" ? "Janela fechada" : "Descansando";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tray-menu", ref: rootRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "menu-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `status-dot ${state.status}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "status-label", children: statusLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "app-version", children: [
          "v",
          state.version
        ] })
      ] }),
      state.status === "watching" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-details", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "window-name", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconDeviceDesktop, { size: 12, stroke: 1.5 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: state.windowName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "elapsed", children: state.elapsed })
      ] }),
      state.status === "alert" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "status-details", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "window-name closed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconDeviceDesktop, { size: 12, stroke: 1.5 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            state.windowName,
            " (encerrado)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "elapsed faded", children: [
          "Monitorou por ",
          state.lastDuration
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sep" }),
    state.status === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IconSearch, { size: 16, stroke: 1.5 }), label: "Escolher janela para observar", onClick: act("select-window") }),
    state.status === "watching" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IconRefresh, { size: 16, stroke: 1.5 }), label: "Trocar janela", onClick: act("select-window") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IconPlayerStop, { size: 16, stroke: 1.5 }), label: "Parar monitoramento", onClick: act("stop-watching") })
    ] }),
    state.status === "alert" && /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IconSearch, { size: 16, stroke: 1.5 }), label: "Escolher nova janela", onClick: act("select-window") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sep" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IconMessagePlus, { size: 16, stroke: 1.5 }), label: "Nova conversa", onClick: act("new-conversation") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IconMessage, { size: 16, stroke: 1.5 }), label: "Continuar última conversa", onClick: act("continue-conversation") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sep" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IconSettings, { size: 16, stroke: 1.5 }), label: "Configurações", onClick: act("open-settings") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IconLogout, { size: 16, stroke: 1.5 }), label: "Sair do Teki", onClick: act("quit"), danger: true })
  ] });
}
function MenuItem({ icon, label, onClick, danger }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `menu-item${danger ? " danger" : ""}`, onClick, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "menu-item-icon", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "menu-item-label", children: label })
  ] });
}
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrayMenu, {}) })
);
