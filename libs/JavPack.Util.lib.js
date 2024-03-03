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

  static sleep(s = 1) {
    return new Promise((resolve) => {
      setTimeout(resolve, s * 1000);
    });
  }
}
