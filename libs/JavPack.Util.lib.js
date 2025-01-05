class Util {
  static upStore() {
    const KEY = "CD";
    const DATE = new Date().getDate();
    if (GM_getValue(KEY) === DATE) return;

    GM_deleteValues(GM_listValues());
    GM_setValue(KEY, DATE);
  }

  static codeParse(code) {
    const codes = code.split(/-|_/);
    const sep = "\\s?(0|-|_){0,2}\\s?";

    let pattern = codes.join(sep);
    if (/^fc2/i.test(code)) pattern = `${codes[0]}${sep}(ppv)?${sep}${codes.at(-1)}`;

    return {
      code,
      codes,
      prefix: codes[0],
      regex: new RegExp(`(?<![a-z])${pattern}(?!\\d)`, "i"),
    };
  }

  static setFavicon(icon) {
    const favicon = GM_getResourceURL(icon?.status ? icon.status : icon);
    if (favicon) document.querySelectorAll("link[rel*='icon']").forEach((item) => item.setAttribute("href", favicon));
  }
}
