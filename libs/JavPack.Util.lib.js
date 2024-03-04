class Util {
  static upLocal() {
    const date = new Date().getDate();
    if (localStorage.getItem("CD") === date.toString()) return;
    localStorage.clear();
    localStorage.setItem("CD", date);
  }

  static upStore() {
    const date = new Date().getDate();
    if (GM_getValue("CD") === date) return;
    GM_listValues().forEach((key) => GM_deleteValue(key));
    GM_setValue("CD", date);
  }

  static codeParse(code) {
    const codes = code.split(/-|_/);
    return {
      codes,
      prefix: codes[0],
      regex: new RegExp(`(?<![a-z])${codes.join("\\s?(0|-|_){0,2}\\s?")}(?!\\d)`, "i"),
    };
  }

  static setTabBar({ text, icon }) {
    document.title = text;
    if (!icon) return;

    const href = GM_getResourceURL(icon);
    document.querySelectorAll("link[rel*='icon']").forEach((item) => item.setAttribute("href", href));
  }
}
