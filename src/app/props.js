export class AppProps {
  static RP_CONTEXT = "ctx";
  static RP_DEBUG = "debug";
  static RP_PROPS = "props";
  static RP_ROM = "rom";
  static RP_TYPE = "type";

  static RV_CONTEXT_EDITOR = "editor";

  static encode(props) {
    return btoa(encodeURIComponent(JSON.stringify(props)));
  }

  static decode(encodedProps) {
    return JSON.parse(decodeURIComponent(atob(encodedProps)));
  }
};
