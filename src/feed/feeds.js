import { storage } from '../storage'
import { FeedBase } from './feedbase.js'
import { uuidv4 } from '../util/uuid';
import { isEmptyString } from '../util/stringutil';
import * as LOG from '../log'
import { config } from '../conf';

const FEEDS_PROP = "feeds";
const LOCAL_FEEDS_PREFIX = "localFeeds.";

class Feeds extends FeedBase {
  constructor(feeds, minLength) {
    super(minLength);
    this.parsedFeeds = [];
    this.feeds = [];
    feeds.forEach(f => this._addFeed(f));
    this._expand();
  }

  static DEFAULT_ID = -1;
  static ADD_ID = -2;
  static NONE_URL = "none";

  static isDeleteEnabled(feed) {
    return feed.feedId !== Feeds.DEFAULT_ID &&
      feed.feedId !== Feeds.ADD_ID;
  }

  static getUrl(feed) {
    return feed.url ?
      feed.url === Feeds.NONE_URL ? null : feed.url :
      null;
  }

  isExistingLocalFeed(title) {
    return this._getFeedIndexForTitle(title, true) !== -1;
  }

  async addLocalFeed(feed) {
    if (!feed.title) {
      return;
    }

    const index = this._getFeedIndexForTitle(feed.title);
    let oldFeedId = null;
    let oldLocalId = null;
    if (index >= 0) {
      const oldFeed = this.feeds[index];
      oldFeedId = oldFeed.feedId;
      oldLocalId = oldFeed.localId;
      await this.removeFeed(oldFeedId);
    }

    const newFeed = {
      feedId: oldFeedId ? oldFeedId : uuidv4(),
      localId: oldLocalId ? oldLocalId : uuidv4(),
      title: feed.title,
    }
    if (feed.longTitle) newFeed.longTitle = feed.longTitle;
    if (feed.description) newFeed.description = feed.description;
    if (feed.thumbnail) newFeed.thumbnail = feed.thumbnail;
    if (feed.background) newFeed.background = feed.background;

    const addedFeed = this._addFeed(newFeed);
    if (addedFeed) {
      // Store the feed contents
      await storage.put(
        LOCAL_FEEDS_PREFIX + addedFeed.localId, feed);
      // Store the feeds
      await this._storeFeeds();
      this._expand();
      return addedFeed;
    }

    return null;
  }

  async getLocalFeed(localId) {
    return await storage.get(LOCAL_FEEDS_PREFIX + localId);
  }

  async addRemoteFeed(url, inFeed) {
    const index = this._getFeedIndexForUrl(url);
    const exists = index >= 0;
    const feed = exists ? this.feeds[index] :
      this._addFeed({title: "New feed", url: url});
    if (feed) {
      const updated = this._updateFeed(url, inFeed);
      if (!exists || updated) {
        await this._storeFeeds();
      }
      this._expand();
      return feed;
    }
    return null;
  }

  async removeFeed(feedId) {
    const index = this.feeds.findIndex(f => {
      return f.feedId === feedId;
    });
    if (index >= 0) {
      const feed = this.feeds[index];
      if (feed.localId) {
        await storage.remove(LOCAL_FEEDS_PREFIX + feed.localId);
      }
      this.feeds.splice(index, 1);
      await this._storeFeeds();

      this._expand();
    }
  }

  getFeedForUrl(url) {
    const index = this._getFeedIndexForUrl(url);
    return index !== -1 ? this.feeds[index] : null;
  }

  getFeedWithId(id) {
    for(let i = 0; i < this.feeds.length; i++) {
      const feed = this.feeds[i];
      if (feed.feedId === id) {
        return feed;
      }
    }
    return null;
  }

  getDistinctFeeds() {
    return this.feeds;
  }

  getFeeds() {
    return this.expandedFeeds;
  }

  _validate(f) {
    if (isEmptyString(f.title)) {
      this._logInvalidObject('Feed missing title', f);
      return false;
    } else if (isEmptyString(f.url) && isEmptyString(f.localId)) {
      this._logInvalidObject('Feed missing url or local identifier', f);
      return false;
    }
    return true;
  }

  _updateFeed(url, feed) {
    const index = this._getFeedIndexForUrl(url);
    let changed = false;
    if (index >= 0) {
      const f = this.feeds[index];
      const props = [
        'title', 'longTitle', 'description', 'thumbnail', 'background'
      ]
      props.forEach(p => {
        if (f[p] !== feed[p]) {
          changed = true;
          if (feed[p]) {
            f[p] = feed[p];
          } else {
            delete f[p];
          }
        }
      });
    }
    if (changed) {
      this._expand();
    }
    return changed;
  }

  _addFeed(f) {
    let feed = {...f};
    if (this._validate(feed)) {
      if (!feed.feedId) {
        feed.feedId = uuidv4();
      }
      this.feeds.push(feed);
      return feed;
    }
    return null;
  }

  _getFeedIndexForUrl(url) {
    const index = this.feeds.findIndex(
      feed => feed.url && (feed.url.toUpperCase() === url.toUpperCase()));
    return index;
  }

  _getFeedIndexForTitle(title, isLocal = true) {
    const index = this.feeds.findIndex(
      feed => (feed.title === title) && (!isLocal || feed.localId));
    return index;
  }

  _expand() {
    let expandedFeeds = [...this.feeds];

    // Sort
    expandedFeeds.sort(this.TITLE_SORT);

    // Default
    if (!config.isEmptyDefaultFeed()) {
      expandedFeeds.unshift({
        feedId: Feeds.DEFAULT_ID,
        title: "Default",
        longTitle: "Default Feed",
        description: "The default feed contains a collection of high-quality publicly available games and demos across the various applications (emulators, engines, etc.) that are supported by webЯcade.",
        url: Feeds.NONE_URL,
        thumbnail: "default-feed/images/default-thumb.png",
        background: "default-feed/images/default-background.png"
      })
    }

    // Add
    expandedFeeds.unshift({
      feedId: Feeds.ADD_ID,
      title: "Add Feed",
      longTitle: "Add Feed",
      description: "Register a new feed with webЯcade by selecting one of the buttons below. Use the \"URL\" button to register a cloud-based feed or the \"FILE\" button for a locally stored feed file.",
      url: Feeds.NONE_URL,
      thumbnail: "images/add-thumb.png",
      background: "images/add-background.png"
    })

    expandedFeeds = this._expandItems(expandedFeeds);
    this.expandedFeeds = expandedFeeds;
  }

  _storeFeeds = async () => {
    const outFeeds = [];
    this.getDistinctFeeds().forEach(e => {
      const f = {...e};
      outFeeds.push(f);
    });
    try {
      await storage.put(FEEDS_PROP, outFeeds);
    } catch (e) {
      LOG.error("Error storing feeds: " + e);
    }
  }
}

const loadFeeds = async (minSlidesLength) => {
  try {
    const feedsProp = await storage.get(FEEDS_PROP);
    return new Feeds(feedsProp ? feedsProp : [], minSlidesLength);
  } catch(e) {
    LOG.error("Error reading feeds: " + e);
    return new Feeds([], minSlidesLength);
  }
}

export { Feeds, loadFeeds }
