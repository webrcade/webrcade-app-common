import { APP_TYPES } from './applist.js';
import { AppProps } from '../app/props.js';
import {
  UrlUtil,
  isEmptyString,
  isValidString
} from '../util';
import { resolveImagePath } from '../images'

class AppRegistry {
  static instance = AppRegistry.instance || new AppRegistry();

  constructor() {
    APP_TYPES.forEach((appType) => {
      this.APP_TYPES[appType.key] = appType;
      appType.type = appType.absoluteKey === undefined ?
        appType.key : appType.absoluteKey;
    });
  }

  APP_TYPES = {}

  validate(app) {
    const APP_TYPES = this.APP_TYPES;
    if (isEmptyString(app.title)) {
      throw new Error("Missing 'title' property");
    }
    if (isEmptyString(app.type)) {
      throw new Error("Missing 'type' property");
    }
    if (APP_TYPES[app.type] === undefined) {
      throw new Error("'type' is invalid.");
    }
    APP_TYPES[app.type].validate(app);
  }

  getDefaultBackground(app) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[app.type].background;
  }

  getDefaultThumbnail(app) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[app.type].thumbnail;
  }

  getBackground(app) {
    return isValidString(app.background) ?
      app.background : this.getDefaultBackground(app);
  }

  getThumbnail(app) {
    return isValidString(app.thumbnail) ?
      app.thumbnail : this.getDefaultThumbnail(app);
  }

  getDescription(app) {
    const APP_TYPES = this.APP_TYPES;
    return isValidString(app.description) ?
      app.description : APP_TYPES[app.type].description;
  }

  getName(app) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[app.type].name;
  }

  getLocation(app) {
    const { RP_DEBUG, RP_PROPS } = AppProps;
    const { props } = app;
    const { APP_TYPES } = this;

    const appType = APP_TYPES[app.type];
    const outProps = {
      type: appType.type,
      title: this.getLongTitle(app),
      app: this.getName(app)
    };

    if (props !== undefined) {
      Object.assign(outProps, props);
    }

    let loc = UrlUtil.addParam(
      appType.location, RP_PROPS, AppProps.encode(outProps));

    const debug = UrlUtil.getBoolParam(
      window.location.search, RP_DEBUG);
    if (debug) {
      loc = UrlUtil.addParam(loc, RP_DEBUG, 'true');
    }
    return loc;
  }

  getTitle(app) {
    return app.title;
  }

  getLongTitle(app) {
    return isValidString(app.longTitle) ?
      app.longTitle : this.getTitle(app);
  }

  getNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];

    return (t.absoluteKey ?
      this.getGeneralNameForType(type) :
      this.getCoreNameForType(type));
  }

  getShortNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];

    return (t.absoluteKey ?
      this.getGeneralShortNameForType(type) :
      this.getShortCoreNameForType(type));
  }

  getGeneralNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[type].name;
  }

  getGeneralShortNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];
    return t.shortName ? t.shortName : t.name;
  }

  getCoreNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];
    return `${this.getNameForType(type)} (${t.coreName})`;
  }

  getShortCoreNameForType(type) {
    const APP_TYPES = this.APP_TYPES;
    const t = APP_TYPES[type];
    return `${this.getGeneralShortNameForType(type)} (${t.coreName})`;
  }

  getThumbnailForType(type, imgSrc) {
    return isValidString(imgSrc) ?
      imgSrc : this.getDefaultThumbnailForType(type);
  }

  getDefaultThumbnailForType(type) {
    const APP_TYPES = this.APP_TYPES;
    return resolveImagePath(APP_TYPES[type].thumbnail);
  }

  getBackgroundForType(type, imgSrc) {
    return isValidString(imgSrc) ?
      imgSrc : this.getDefaultBackgroundForType(type);
  }

  getDefaultBackgroundForType(type) {
    const APP_TYPES = this.APP_TYPES;
    return resolveImagePath(APP_TYPES[type].background);
  }

  getDefaultsForType(type) {
    const APP_TYPES = this.APP_TYPES;
    return APP_TYPES[type].defaults;
  }

  getAppTypes() {
    return this.APP_TYPES;
  }
};

export { AppRegistry };
