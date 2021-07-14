export * from "./props.js";
export * from "./fetch.js"
export * from "./wrapper.js"

export function isApp() {
  return window.self !== window.top;
}
