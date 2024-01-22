class Util {
  static sepReg = /-|_/;
  static numReg = /\d+\.\d+|\d+/;
  static varReg = /\$\{([a-z]+)\}/g;
  static crackReg = /破解|-u(ncensored|c)?(?![a-z])/i;
  static zhReg = /中文|中字|字幕|-u?c(?![a-z])|.+(?<![a-z])ch(?![a-z])/i;

  static zhTxt = "[中字]";
  static crackTxt = "[破解]";
  static minMagnetSize = "300MB";
  static maxMagnetSize = "15GB";
  static hdMagnetSize = "2GB";

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

  static setWindow(key, val, pre) {
    pre = pre ? pre.toString() : GM_info.script.name.split(".").at(-1);
    unsafeWindow[pre] ??= {};
    unsafeWindow[pre][key] = val;
  }

  static getWindow(key, pre) {
    return unsafeWindow[pre]?.[key];
  }

  static codeParse(code) {
    const codes = code.split(this.sepReg);
    return {
      codes,
      prefix: codes[0],
      regex: new RegExp(`(?<![a-z])${codes.join("\\s?(0|-|_){0,2}\\s?")}(?!\\d)`, "i"),
    };
  }

  static useTransByte() {
    const rules = [
      { unit: /byte/i, trans: (size) => size },

      { unit: /kb/i, trans: (size) => size * 1000 },
      { unit: /mb/i, trans: (size) => size * 1000 ** 2 },
      { unit: /gb/i, trans: (size) => size * 1000 ** 3 },
      { unit: /tb/i, trans: (size) => size * 1000 ** 4 },
      { unit: /pb/i, trans: (size) => size * 1000 ** 5 },
      { unit: /eb/i, trans: (size) => size * 1000 ** 6 },
      { unit: /zb/i, trans: (size) => size * 1000 ** 7 },
      { unit: /yb/i, trans: (size) => size * 1000 ** 8 },

      { unit: /kib/i, trans: (size) => size * 1024 },
      { unit: /mib/i, trans: (size) => size * 1024 ** 2 },
      { unit: /gib/i, trans: (size) => size * 1024 ** 3 },
      { unit: /tib/i, trans: (size) => size * 1024 ** 4 },
      { unit: /pib/i, trans: (size) => size * 1024 ** 5 },
      { unit: /eib/i, trans: (size) => size * 1024 ** 6 },
      { unit: /zib/i, trans: (size) => size * 1024 ** 7 },
      { unit: /yib/i, trans: (size) => size * 1024 ** 8 },
    ];

    return (str) => {
      const num = str.match(this.numReg)?.[0] ?? 0;
      if (num <= 0) return 0;

      const rule = rules.find(({ unit }) => unit.test(str));
      return rule ? rule.trans(num).toFixed(2) : 0;
    };
  }

  static getIcon = (txt) => {
    return txt.includes("//") ? txt : GM_getResourceURL(txt);
  };

  static notify(details) {
    if (typeof details === "string") details = { text: details };
    const { tag, icon } = details;
    const { name: defaultTitle, namespace: defaultTag, icon: defaultIcon } = GM_info.script;

    details.tag = tag ? `${defaultTag}:${tag}` : defaultTag;
    details.image = icon ? this.getIcon(icon) : defaultIcon;

    GM_notification({
      silent: true,
      timeout: 3000,
      highlight: false,
      title: defaultTitle,
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
