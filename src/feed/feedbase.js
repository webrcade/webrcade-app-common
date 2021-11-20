import * as LOG from '../log';
import { uuidv4 } from '../util/uuid';

class FeedBase {
  constructor(minLength) {
    this.minLength = minLength;
  }

  TITLE_SORT = (a, b) => a.title.localeCompare(b.title);

  _logInvalidObject(msg, object) {
    LOG.info(msg + " : " + JSON.stringify(object));
  }

  _expandItems(items) {
    const { minLength } = this;

    if (items.length === 0 || minLength === 0) return items;

    let itemsOut = [];
    while (itemsOut.length < minLength) {
      items.forEach(i => {
        const {...item} = i;
        item.id = uuidv4();
        itemsOut.push(item);
        if (itemsOut.length > items.length) {
          item.duplicate = true;
        }
      });
    }
    return itemsOut;
  }
}

export { FeedBase }
