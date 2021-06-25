export class AppProps {
  static RP_PROPS = "props";
  static RP_DEBUG = "debug";
  static RP_TYPE = "type";
  static RP_ROM = "rom";

  static encode(props) {
    return btoa(encodeURIComponent(JSON.stringify(props)));
  }

  static decode(encodedProps) {
    return JSON.parse(decodeURIComponent(atob(encodedProps)));
  }
};
