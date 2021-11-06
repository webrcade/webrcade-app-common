export * from "./props.js";
export * from "./fetch.js"
export * from "./wrapper.js"

export function isApp() {
  return (window.location.href.toLowerCase().indexOf('/app/') != -1) ||
    (window.self !== window.top);
}
