class Offline {
  static noTxt = ".${no}";
  static zhTxt = "[中字]";
  static crackTxt = "[破解]";

  static varReg = /\$\{([a-z]+)\}/g;

  static defaultConfig = [
    {
      name: "云下载",
      color: "is-primary",
    },
    {
      name: "番号",
      dir: "番号/${prefix}",
      color: "is-link",
    },
    {
      name: "片商",
      dir: "片商/${maker}",
    },
    {
      name: "系列",
      dir: "系列/${series}",
      color: "is-success",
    },
    {
      type: "genres",
      name: "${genre}",
      dir: "类别/${genre}",
      match: ["屁股", "連褲襪", "巨乳", "亂倫"],
      color: "is-warning",
    },
    {
      type: "actors",
      name: "${actor}",
      dir: "演员/${actor}",
      exclude: ["♂"],
      color: "is-danger",
    },
  ];

  static defaultOptions = {
    setHash: true,
    tags: ["genres", "actors"],
    clean: true,
    upload: ["cover"],
    setCover: true,
  };

  static defaultMagnetOptions = {
    filter: ({ size }) => {
      const magnetSize = parseFloat(size);
      return magnetSize > 300000000 && magnetSize < 20000000000;
    },
    max: 10,
  };

  static defaultVerifyOptions = {
    requireVdi: true,
    clean: true,
    max: 10,
  };

  static parseVar = (txt, params, rep = "") => {
    return txt.replace(this.varReg, (_, key) => (params.hasOwnProperty(key) ? params[key].toString() : rep)).trim();
  };

  static parseDir = (dir, params) => {
    const rep = "$0";
    return (typeof dir === "string" ? dir.split("/") : dir).map((item) => {
      const txt = this.parseVar(item, params, rep);
      return txt.includes(rep) ? null : txt;
    });
  };

  static parseMagnets = (magnets, { filter, sort }) => {
    if (filter) magnets = magnets.filter(filter);
    if (sort) magnets = magnets.toSorted(sort);
    return magnets;
  };

  static getActionsByDetails(config, details) {
    return config
      .map(({ type = "plain", match = [], exclude = [], ...item }, index) => {
        let { name, dir = "云下载", rename = "${zh}${crack} ${code} ${title}" } = item;

        if (!name) return null;
        if (!rename.includes("${code}")) rename = "${code} " + rename;
        if (type === "plain") return { ...item, dir: this.parseDir(dir, details), rename, idx: 0, index };

        let classes = details[type];
        if (!classes?.length) return null;

        if (match.length) classes = classes.filter((item) => match.some((key) => item.includes(key)));
        if (exclude.length) classes = classes.filter((item) => !exclude.some((key) => item.includes(key)));
        if (!classes.length) return null;

        const typeItemKey = type.replace(/s$/, "");
        const typeItemTxt = "${" + typeItemKey + "}";

        return classes.map((cls, idx) => {
          cls = cls.replace(/♀|♂/, "").trim();
          const _details = { ...details, [typeItemKey]: cls };

          return {
            ...item,
            rename: rename.replaceAll(typeItemTxt, cls),
            name: name.replaceAll(typeItemTxt, cls),
            dir: this.parseDir(dir, _details),
            index,
            idx,
          };
        });
      })
      .flat()
      .filter((item) => Boolean(item) && item.dir.every(Boolean))
      .map(({ color = "is-info", desc, ...item }) => {
        return { ...item, color, desc: desc ?? item.dir.join(" / ") };
      });
  }

  static getActionsByMagnets(config, magnets) {
    return config.map(({ magnetOptions = {}, ...item }) => {
      magnetOptions = { ...this.defaultMagnetOptions, ...magnetOptions };

      return {
        ...item,
        magnetMax: magnetOptions.max,
        magnets: this.parseMagnets(magnets, magnetOptions),
      };
    });
  }

  static verifyAccount(dom = document) {
    dom.querySelector("#js_ver_code_box button[rel=verify]").addEventListener("click", () => {
      setTimeout(() => {
        if (dom.querySelector(".vcode-hint").getAttribute("style").indexOf("none") === -1) return;
        GM_setValue("VERIFY_STATUS", "verified");
        window.close();
      }, 300);
    });
  }
}
