import { RP_DEBUG } from '../util'

export class AppProps {
  static RP_CONTEXT = "ctx";
  static RP_DEBUG = RP_DEBUG;
  static RP_PROPS = "props";
  static RP_ROM = "rom";
  static RP_TYPE = "type";
  static RP_EDITOR_TEST = "editTest"

  static RV_CONTEXT_EDITOR = "editor";
  static RV_EDITOR_TEST_ENABLED = "1";

  static encode(props) {
    return btoa(encodeURIComponent(JSON.stringify(props)));
  }

  static decode(encodedProps) {
    return JSON.parse(decodeURIComponent(atob(encodedProps)));
  }
};
