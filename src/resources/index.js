const TEXT_IDS = {
  CATEGORIES: "Categories",
  ERROR_LOADING_GAME: "An error occurred attempting to load the selected game.",
  ERROR_RETRIEVING_GAME: "An error has occurred attempting to retrieve the selected game.",
  ERROR_UNKNOWN: "An unknown error has occurred.",
  LOADING: "Loading",
  OK: "OK",
  PLAY_UC: "PLAY",
  RESUME: "Resume",
  RETURN_TO_BROWSE: "Return to Browse",
  SEE_CONSOLE_LOG: "See console log for details.",
  SELECT_UC: "SELECT",
  SHOW_CATEGORIES: "Show Categories",
  SOMETHING_WENT_WRONG: "Whoops, something went wrong..."
};

class Resources {
  static getText(id) {
    return id; // For now the id is the message, in the future it may not be
  }
};

export {TEXT_IDS, Resources}
