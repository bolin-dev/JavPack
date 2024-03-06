class Offline {
  static defaultOptions = {
    clean: true,
    cover: true,
    tags: ["genres", "actors"],
  };

  static defaultMagnetOptions = {
    filter: ({ size }) => parseFloat(size) > 300000000,
    max: 10,
  };

  static defaultVerifyOptions = {
    requireVdi: true,
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
        if (!rename.includes("${code}")) rename = "${code} " + rename;

        if (type === "plain") return { ...item, dir: this.parseDir(dir, params), rename, idx: 0, index };

        let classes = params[type];
        if (!Array.isArray(classes) || !classes.length) return null;

        if (match.length) classes = classes.filter((item) => match.some((key) => item.includes(key)));
        if (exclude.length) classes = classes.filter((item) => !exclude.some((key) => item.includes(key)));
        if (!classes.length) return null;

        const typeItemKey = type.replace(/s$/, "");
        const typeItemTxt = "${" + typeItemKey + "}";

        return classes.map((cls, idx) => {
          const _details = { ...params, [typeItemKey]: cls };

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
      regex: details.regex,
      cover: cover ? details.cover : cover,
      rename: this.parseVar(rename, details),
      tags: tags
        .map((key) => details[key])
        .filter(Boolean)
        .flat(),
    };
  }

  static getMagnets(magnets, magnetOptions, currIdx) {
    const { filter, max, sort } = magnetOptions;
    if (filter) magnets = magnets.filter(filter);
    if (max) magnets = magnets.slice(0, max);
    if (sort) magnets = magnets.toSorted(sort);
    magnets = magnets.slice(currIdx);
    return magnets;
  }
}
