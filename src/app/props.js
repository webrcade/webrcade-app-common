export class AppProps {
  static RP_PROPS = "props";
  static RP_ROM = "rom";

  static encode(props) {
    return btoa(JSON.stringify(props));
  }

  static decode(encodedProps) {
    return JSON.parse(atob(encodedProps));
  }
};
