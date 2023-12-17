class Util {
  static sepReg = /-|_/;
  static crackReg = /破解/i;
  static numReg = /\d+\.\d+|\d+/;
  static varReg = /^\$\{(.*?)\}$/;
  static varRep = /\${([^}]+)}/g;
  static zhReg = /中字|字幕|中文字幕|-c|(?<![a-z])ch/i;

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
    const codes = code.split(this.sepReg);
    return {
      codes,
      prefix: codes[0],
      regex: new RegExp(`(?<![a-z])${codes.join("(0|-|_){0,2}")}(?!\\d)`, "i"),
    };
  }

  static useTransByte() {
    const rules = [
      { unit: /byte/i, trans: (size) => size },

      { unit: /kb/i, trans: (size) => size * 1000 },
      { unit: /mb/i, trans: (size) => size * 1000 ** 2 },
      { unit: /gb/i, trans: (size) => size * 1000 ** 3 },
      { unit: /tb/i, trans: (size) => size * 1000 ** 4 },

      { unit: /kib/i, trans: (size) => size * 1024 },
      { unit: /mib/i, trans: (size) => size * 1024 ** 2 },
      { unit: /gib/i, trans: (size) => size * 1024 ** 3 },
      { unit: /tib/i, trans: (size) => size * 1024 ** 4 },
    ];

    return (str) => {
      const num = str.match(this.numReg)?.[0] ?? 0;
      if (num <= 0) return 0;

      const rule = rules.find(({ unit }) => unit.test(str));
      return rule ? rule.trans(num).toFixed(2) : 0;
    };
  }

  static getIcon = (txt) => (txt.includes("//") ? txt : GM_getResourceURL(txt));

  static notify(details) {
    if (typeof details === "string") details = { text: details };
    details = { icon: GM_info.script.icon, ...details };

    GM_notification({
      silent: true,
      timeout: 3000,
      highlight: false,
      title: GM_info.script.name,
      tag: GM_info.script.namespace,
      image: this.getIcon(details.icon),
      ...details,
    });
  }

  static setTabBar(details) {
    if (typeof details === "string") details = { text: details };
    details = { icon: GM_info.script.icon, ...details };

    document.title = details.text;
    const href = this.getIcon(details.icon);

    const icons = document.querySelectorAll("link[rel*='icon']");
    if (icons.length) return icons.forEach((item) => item.setAttribute("href", href));
    GM_addElement(document.head, "link", { rel: "icon", href });
  }

  static openTab = (url, active = true) => GM_openInTab(url, { active, setParent: true });

  static magnetSort = (a, b) => {
    if (a.zh !== b.zh) return a.zh ? -1 : 1;
    if (a.crack !== b.crack) return a.crack ? -1 : 1;
    return parseFloat(b.size) - parseFloat(a.size);
  };
}
