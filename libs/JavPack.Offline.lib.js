class Offline {
  static defaultOptions = {
    noTxt: ".${no}",
    zhTxt: "[中字]",
    crackTxt: "[破解]",
    tags: ["genres", "actors"],
    clean: true,
    cover: true,
  };

  static defaultMagnetOptions = {
    filter: ({ size }) => {
      const magnetSize = parseFloat(size);
      return magnetSize > 300000000 || magnetSize < 1;
    },
    max: 10,
  };

  static defaultVerifyOptions = {
    filter: ({ s }) => s > 314572800,
    clean: true,
    max: 10,
  };

  static parseVar(txt, params, rep = "") {
    return txt
      .replace(/\$\{([a-z]+)\}/g, (_, key) => (params.hasOwnProperty(key) ? params[key].toString() : rep))
      .trim();
  }

  static parseDir(dir, params) {
    const rep = "$0";
    return (typeof dir === "string" ? dir.split("/") : dir).map((item) => {
      const txt = this.parseVar(item, params, rep);
      return txt.includes(rep) ? null : txt;
    });
  }

  static getActions(config, params) {
    return config
      .map(({ type = "plain", match = [], exclude = [], ...item }, index) => {
        let { name, dir = "云下载", rename = "${zh}${crack} ${code} ${title}" } = item;
        if (!name) return null;

        rename = rename.replaceAll("${zh}", "$zh");
        rename = rename.replaceAll("${crack}", "$crack");
        if (rename && !rename.includes("${code}")) rename = "${code} " + rename;
        if (type === "plain") return { ...item, dir: this.parseDir(dir, params), rename, idx: 0, index };

        let classes = params[type];
        if (!Array.isArray(classes) || !classes.length) return null;

        if (match.length) classes = classes.filter((item) => match.some((key) => item.includes(key)));
        if (exclude.length) classes = classes.filter((item) => !exclude.some((key) => item.includes(key)));
        if (!classes.length) return null;

        const typeItemKey = type.replace(/s$/, "");
        const typeItemTxt = "${" + typeItemKey + "}";

        return classes.map((cls, idx) => {
          return {
            ...item,
            dir: this.parseDir(dir, { ...params, [typeItemKey]: cls }),
            rename: rename.replaceAll(typeItemTxt, cls),
            name: name.replaceAll(typeItemTxt, cls),
            index,
            idx,
          };
        });
      })
      .flat()
      .filter((item) => Boolean(item) && item.dir.every(Boolean))
      .map(({ color = "is-info", desc, ...options }) => {
        return { ...options, color, desc: desc ?? options.dir.join(" / ") };
      });
  }

  static parseAction({ magnetOptions = {}, verifyOptions = {}, ...options }, details) {
    options = { ...this.defaultOptions, ...options };
    magnetOptions = { ...this.defaultMagnetOptions, ...magnetOptions };
    verifyOptions = { ...this.defaultVerifyOptions, ...verifyOptions };
    const { cover, rename, tags } = options;

    return {
      ...options,
      magnetOptions,
      verifyOptions,
      code: details.code,
      regex: details.regex,
      cover: cover ? details.cover : cover,
      rename: this.parseVar(rename, details),
      tags: tags
        .map((key) => details[key])
        .flat()
        .filter(Boolean),
    };
  }

  static parseMagnets(magnets, { filter, sort, max }, currIdx) {
    if (filter) magnets = magnets.filter(filter);
    if (sort) magnets = magnets.toSorted(sort);
    if (max) magnets = magnets.slice(0, max);
    return magnets.slice(currIdx);
  }

  static verifyAccount(key, val) {
    document.querySelector("#js_ver_code_box button[rel=verify]").addEventListener("click", () => {
      setTimeout(() => {
        if (document.querySelector(".vcode-hint").getAttribute("style").indexOf("none") === -1) return;
        GM_setValue(key, val);
        window.close();
      }, 300);
    });
  }
}
