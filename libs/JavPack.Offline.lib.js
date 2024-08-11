class Offline {
  static defaultRename = "${zh}${crack} ${code} ${title}";

  static defaultOptions = {
    tags: ["genres", "actors"],
    clean: true,
    cleanPwd: "",
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
    filter: ({ s }) => s > 52428800,
    clean: true,
    max: 10,
  };

  static defaultRenameTxt = {
    no: ".${no}",
    zh: "[中字]",
    crack: "[破解]",
  };

  static parseVar(txt, params, rep = "") {
    const reg = /\$\{([a-z]+)\}/g;
    return txt.replace(reg, (_, key) => (params.hasOwnProperty(key) ? params[key].toString() : rep)).trim();
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
      .flatMap(({ type = "plain", match = [], exclude = [], ...item }, index) => {
        let { name, dir = "云下载", rename = this.defaultRename } = item;
        if (!name) return null;

        rename = rename.toString().trim() || this.defaultRename;
        rename = rename.replaceAll("${zh}", "$zh");
        rename = rename.replaceAll("${crack}", "$crack");
        if (!rename.includes("${code}")) rename = "${code} " + rename;

        if (type === "plain") return { ...item, dir: this.parseDir(dir, params), rename, idx: 0, index };

        let classes = params[type];
        if (!Array.isArray(classes) || !classes.length) return null;

        if (match.length) classes = classes.filter((item) => match.some((key) => item.includes(key)));
        if (!classes.length) return null;

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
      .filter((item) => Boolean(item) && item.dir.every(Boolean))
      .map(({ color = "is-info", inMagnets = true, desc, ...options }) => {
        return { ...options, color, inMagnets, desc: desc ? desc.toString() : options.dir.join("/") };
      });
  }

  static getOptions(
    { magnetOptions = {}, verifyOptions = {}, renameTxt = {}, ...options },
    { codes, regex, ...details },
  ) {
    options = { ...this.defaultOptions, ...options };
    magnetOptions = { ...this.defaultMagnetOptions, ...magnetOptions };
    verifyOptions = { ...this.defaultVerifyOptions, ...verifyOptions };
    renameTxt = { ...this.defaultRenameTxt, ...renameTxt };
    const { cover, rename, tags } = options;

    return {
      ...options,
      magnetOptions,
      verifyOptions,
      renameTxt,
      codes,
      regex,
      code: details.code,
      cover: cover ? details.cover : cover,
      rename: this.parseVar(rename, details),
      tags: tags.flatMap((key) => details[key]).filter(Boolean),
    };
  }

  static getMagnets(magnets, { filter, sort, max }) {
    if (!magnets?.length) return [];
    if (filter) magnets = magnets.filter(filter);
    if (sort) magnets = magnets.toSorted(sort);
    if (max) magnets = magnets.slice(0, max);
    return magnets;
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
