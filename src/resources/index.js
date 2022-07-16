const TEXT_IDS = {
  ADD: "Add",
  ADD_UC: "ADD",
  ADVANCED_SETTINGS: "Advanced Settings",
  BILINEAR_FILTER: "Bilinear filter",
  CANCEL: "Cancel",
  CATEGORIES: "Categories",
  CLICK_TO_UNMUTE: "Click Screen to Unmute",
  CONFIRM_DELETE_FEED: "Are you sure you want to delete the selected feed?",
  DELETE_UC: "DELETE",
  DISPLAY_SETTINGS: "Display Settings",
  ERROR_DELETING_FEED: "An error has occurred attempting to delete the selected feed.",
  ERROR_LOADING_GAME: "An error occurred attempting to load the selected game.",
  ERROR_LOADING_FEED: "An error occurred attempting to load the selected feed.",
  ERROR_RETRIEVING_GAME: "An error has occurred attempting to retrieve the selected game.",
  ERROR_UNKNOWN: "An unknown error has occurred.",
  EXPERIMENTAL_APPS: "Experimental apps",
  FEEDS: "Feeds",
  FILE_UC: "FILE",
  GAMEPAD_CONTROLS: "Gamepad Controls",
  KEYBOARD_CONTROLS: "Keyboard Controls",
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
  SEE_CONSOLE_LOG: "See console log for details.",
  SELECT_UC: "SELECT",
  SHOW_CATEGORIES: "Show Categories",
  SHOW_FEEDS: "Show Feeds",
  SOMETHING_WENT_WRONG: "Whoops, something went wrong...",
  SPECIFY_LOCATION_OF_FEED: "Specify the location of the feed to add (URL)",
  TAP_TO_UNMUTE: "Tap Screen to Unmute",
  URL: "URL",
  VERTICAL_SYNC: "Vertical sync",
  VIEW_CONTROLS: "View Controls",
  YES: "Yes"
};

class Resources {
  static getText(id) {
    return id; // For now the id is the message, in the future it may not be
  }
};

export {TEXT_IDS, Resources}
