import * as LOG from "../log";

const TEXT_VALUES = {
  ADD: "Add",
  ADD_UC: "ADD",
  ADVANCED_SETTINGS: "Advanced Settings",
  BILINEAR_FILTER: "Bilinear filter",
  CANCEL: "Cancel",
  CATEGORIES: "Categories",
  CLICK_TO_UNMUTE: "Click Screen to Unmute",
  CLOUD_STORAGE: "Cloud Storage",
  CONFIRM_DELETE_FEED: "Are you sure you want to delete the selected feed?",
  CONNECT: "Connect",
  DELETE_UC: "DELETE",
  DISPLAY_SETTINGS: "Display Settings",
  DROPBOX: "Dropbox",
  DROPBOX_SERVER_UNAUTHORIZED: "This webЯcade server is not authorized to access Dropbox.",
  ENABLED: "Enabled",
  ERROR_DELETING_FEED: "An error has occurred attempting to delete the selected feed.",
  ERROR_LOADING_GAME: "An error occurred attempting to load the selected game.",
  ERROR_LOADING_FEED: "An error occurred attempting to load the selected feed.",
  ERROR_RETRIEVING_GAME: "An error has occurred attempting to retrieve the selected game.",
  ERROR_UNKNOWN: "An unknown error has occurred.",
  EXPERIMENTAL_APPS: "Experimental apps",
  FEEDS: "Feeds",
  FILE_UC: "FILE",
  GAMEPAD_CONTROLS: "Gamepad Controls",
  GAMEPAD_CONTROLS_DETAIL: "Gamepad Controls (%s)",
  KEYBOARD_CONTROLS: "Keyboard Controls",
  KEYBOARD_CONTROLS_DETAIL: "Keyboard Controls (%s)",
  LINK: "Link",
  LINKED: "Linked",
  LOAD_UC: "LOAD",
  LOADING: "Loading",
  LOADING_DOTS: "Loading...",
  LOADING_FEED: "Loading feed...",
  LOCAL_PARENS: "(Local)",
  NO: "No",
  OK: "OK",
  PLAY_UC: "PLAY",
  RELOAD_EXP_APPS: "Changing the experimental apps setting requires webЯcade to be reloaded.",
  RESUME: "Resume",
  RETURN_TO_BROWSE: "Return to Browse",
  RETURN_TO_EDITOR: "Return to Editor",
  ROTATED: "Rotated",
  SEE_CONSOLE_LOG: "See console log for details.",
  SELECT_UC: "SELECT",
  SHOW_CATEGORIES: "Show Categories",
  SHOW_FEEDS: "Show Feeds",
  SIX_BUTTON: "6-button",
  SOMETHING_WENT_WRONG: "Whoops, something went wrong...",
  SPECIFY_LOCATION_OF_FEED: "Specify the location of the feed to add (URL)",
  STATUS: "Status",
  TAP_TO_UNMUTE: "Tap Screen to Unmute",
  TWO_BUTTON: "2-button",
  UNLINK: "Unlink",
  UNLINKED: "Unlinked",
  URL: "URL",
  VERTICAL_SYNC: "Vertical sync",
  VIEW_CONTROLS: "View Controls",
  YES: "Yes"
}

const TEXT_IDS = {
  ADD: "ADD",
  ADD_UC: "ADD_UC",
  ADVANCED_SETTINGS: "ADVANCED_SETTINGS",
  BILINEAR_FILTER: "BILINEAR_FILTER",
  CANCEL: "CANCEL",
  CATEGORIES: "CATEGORIES",
  CLICK_TO_UNMUTE: "CLICK_TO_UNMUTE",
  CLOUD_STORAGE: "CLOUD_STORAGE",
  CONFIRM_DELETE_FEED: "CONFIRM_DELETE_FEED",
  CONNECT: "CONNECT",
  DELETE_UC: "DELETE_UC",
  DISPLAY_SETTINGS: "DISPLAY_SETTINGS",
  DROPBOX: "DROPBOX",
  DROPBOX_SERVER_UNAUTHORIZED: "DROPBOX_SERVER_UNAUTHORIZED",
  ENABLED: "ENABLED",
  ERROR_DELETING_FEED: "ERROR_DELETING_FEED",
  ERROR_LOADING_GAME: "ERROR_LOADING_GAME",
  ERROR_LOADING_FEED: "ERROR_LOADING_FEED",
  ERROR_RETRIEVING_GAME: "ERROR_RETRIEVING_GAME",
  ERROR_UNKNOWN: "ERROR_UNKNOWN",
  EXPERIMENTAL_APPS: "EXPERIMENTAL_APPS",
  FEEDS: "FEEDS",
  FILE_UC: "FILE_UC",
  GAMEPAD_CONTROLS: "GAMEPAD_CONTROLS",
  GAMEPAD_CONTROLS_DETAIL: "GAMEPAD_CONTROLS_DETAIL",
  KEYBOARD_CONTROLS: "KEYBOARD_CONTROLS",
  KEYBOARD_CONTROLS_DETAIL: "KEYBOARD_CONTROLS_DETAIL",
  LINK: "LINK",
  LINKED: "LINKED",
  LOAD_UC: "LOAD_UC",
  LOADING: "LOADING",
  LOADING_DOTS: "LOADING_DOTS",
  LOADING_FEED: "LOADING_FEED",
  LOCAL_PARENS: "LOCAL_PARENS",
  NO: "NO",
  OK: "OK",
  PLAY_UC: "PLAY_UC",
  RELOAD_EXP_APPS: "RELOAD_EXP_APPS",
  RESUME: "RESUME",
  RETURN_TO_BROWSE: "RETURN_TO_BROWSE",
  RETURN_TO_EDITOR: "RETURN_TO_EDITOR",
  ROTATED: "ROTATED",
  SEE_CONSOLE_LOG: "SEE_CONSOLE_LOG",
  SELECT_UC: "SELECT_UC",
  SHOW_CATEGORIES: "SHOW_CATEGORIES",
  SHOW_FEEDS: "SHOW_FEEDS",
  SIX_BUTTON: "SIX_BUTTON",
  SOMETHING_WENT_WRONG: "SOMETHING_WENT_WRONG",
  SPECIFY_LOCATION_OF_FEED: "SPECIFY_LOCATION_OF_FEED",
  STATUS: "STATUS",
  TAP_TO_UNMUTE: "TAP_TO_UNMUTE",
  TWO_BUTTON: "TWO_BUTTON",
  UNLINK: "UNLINK",
  UNLINKED: "UNLINKED",
  URL: "URL",
  VERTICAL_SYNC: "VERTICAL_SYNC",
  VIEW_CONTROLS: "VIEW_CONTROLS",
  YES: "YES",
};

class Resources {
  static getText() {
    const id = arguments[0];
    let message = TEXT_VALUES[id];
    if (message === undefined) {
      LOG.error(`Unable to find resource for key: '${id}'`)
    }
    for (let i = 1; i < arguments.length; i++) {
      message = message.replace(/%s/, arguments[i]);
    }
    return message;
  }

  static check() {
    for (let key in TEXT_IDS) {
      if (TEXT_VALUES[key] === undefined) {
        LOG.error(`Unable to find resource for key: '${key}'`)
      }
    }
  }
};

export {TEXT_IDS, Resources}
