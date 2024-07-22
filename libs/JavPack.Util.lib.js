class Util {
  static CD_KEY = "CD";

  static upLocal() {
    const date = new Date().getDate();
    if (localStorage.getItem(this.CD_KEY) === date.toString()) return;
    localStorage.clear();
    localStorage.setItem(this.CD_KEY, date);
  }

  static upStore() {
    const date = new Date().getDate();
    if (GM_getValue(this.CD_KEY) === date) return;
    GM_listValues().forEach((key) => GM_deleteValue(key));
    GM_setValue(this.CD_KEY, date);
  }

  static codeParse(code) {
    const codes = code.split(/-|_/);
    const sep = "\\s?(0|-|_){0,2}\\s?";

    let pattern = codes.join(sep);
    if (/^fc2/i.test(code)) pattern = `${codes[0]}${sep}(ppv)?${sep}${codes.at(-1)}`;
    if (/^heyzo/i.test(code)) pattern = `${codes[0]}${sep}(\\w){0,2}${sep}${codes.at(-1)}`;

    return {
      codes,
      prefix: codes[0],
      regex: new RegExp(`(?<![a-z])${pattern}(?!\\d)`, "i"),
    };
  }

  static setFavicon(icon) {
    const favicon = GM_getResourceURL(icon);
    if (!favicon) return;

    document.querySelectorAll("link[rel*='icon']").forEach((item) => item.setAttribute("href", favicon));
  }
}
