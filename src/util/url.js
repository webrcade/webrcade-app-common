class UrlUtil {
  static addParam(url, name, value) {
    const sep = url.indexOf('?') >= 0 ? '&' : '?';
    return `${url}${sep}${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  }

  static getParam(url, name) {
    const reg = new RegExp('[?&]' + encodeURIComponent(name) + '=([^&#]*)');
    const val = reg.exec(url);
    return val ? decodeURIComponent(val[1]) : null;
  }

  static getBoolParam(url, name) {
    const val = this.getParam(url, name);
    return (!!val && (val.toLowerCase() === 'true' || val === '1'));
  }

  static getFileName(url) {
    url = decodeURIComponent(url);
    const slash = url.lastIndexOf("/");
    if (slash >= 0 && (url.length > (slash + 1))) {
      url = url.substring(slash + 1);
    }
    const ques = url.lastIndexOf("?");
    if (ques >= 0) {
      url = url.substring(0, ques);
    }
    return decodeURIComponent(url);
  }
}

export { UrlUtil };
