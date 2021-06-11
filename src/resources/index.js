const TEXT_IDS = {
  ADD_UC: "ADD",
  CATEGORIES: "Categories",
  DELETE_UC: "DELETE",
  ERROR_LOADING_GAME: "An error occurred attempting to load the selected game.",
  ERROR_RETRIEVING_GAME: "An error has occurred attempting to retrieve the selected game.",
  ERROR_UNKNOWN: "An unknown error has occurred.",
  FEEDS: "Feeds",
  LOAD_UC: "LOAD",
  LOADING: "Loading",
  LOADING_FEED: "Loading feed...",
  OK: "OK",
  PLAY_UC: "PLAY",
  RESUME: "Resume",
  RETURN_TO_BROWSE: "Return to Browse",
  SEE_CONSOLE_LOG: "See console log for details.",
  SELECT_UC: "SELECT",
  SHOW_CATEGORIES: "Show Categories",
  SHOW_FEEDS: "Show Feeds",
  SOMETHING_WENT_WRONG: "Whoops, something went wrong...",
  TAP_TO_UNMUTE: "Tap Screen to Unmute"
};

class Resources {
  static getText(id) {
    return id; // For now the id is the message, in the future it may not be
  }
};

export {TEXT_IDS, Resources}
