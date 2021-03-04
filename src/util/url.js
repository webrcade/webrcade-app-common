class UrlUtil {
  static addParam(url, name, value) {
    const sep = url.indexOf('?') >= 0 ? '&' : '?';
    return `${url}${sep}${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  }

  static getParam(url, name) {
    const reg = new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)');
    const val = reg.exec(url);
    return val ? decodeURIComponent(val[1]) : null;
  }
}

export { UrlUtil };
