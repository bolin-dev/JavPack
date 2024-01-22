class UtilDB extends Util {
  static isUncensored(dom = document) {
    return dom.querySelector(".title.is-4 strong").textContent.includes("無碼");
  }

  static getDetails(dom = document) {
    const infoNode = dom.querySelector(".movie-panel-info");
    const code = infoNode.querySelector(".first-block .value").textContent;

    const titleNode = dom.querySelector(".title.is-4");
    let title = titleNode.querySelector("strong").textContent;
    title += (titleNode.querySelector(".origin-title") ?? titleNode.querySelector(".current-title")).textContent;
    title = title.replaceAll(code, "").trim();

    const details = {};
    infoNode.querySelectorAll(".movie-panel-info > .panel-block").forEach((item) => {
      const label = item.querySelector("strong")?.textContent;
      const value = item.querySelector(".value")?.textContent;
      if (!label || !value || value.includes("N/A")) return;

      if (label === "日期:") details.date = value;
      if (label === "導演:") details.director = value;
      if (label === "片商:") details.maker = value;
      if (label === "發行:") details.publisher = value;
      if (label === "系列:") details.series = value;
      if (label === "類別:") details.genres = value.split(",").map((item) => item.trim());
      if (label !== "演員:") return;
      details.actors = value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    });

    const { regex, prefix } = this.codeParse(code);
    return { infoNode, regex, prefix, code, title, create: new Date().toISOString().slice(0, 10), ...details };
  }

  static getMagnets(dom = document) {
    const transToByte = this.useTransByte();
    const isUncensored = this.isUncensored(dom);

    return [...dom.querySelectorAll("#magnets-content > .item")]
      .map((item) => {
        const name = item.querySelector(".name")?.textContent.trim() ?? "";
        const meta = item.querySelector(".meta")?.textContent.trim() ?? "";
        return {
          url: item.querySelector(".magnet-name a").href.split("&")[0].toLowerCase(),
          zh: !!item.querySelector(".tag.is-warning") || this.zhReg.test(name),
          size: transToByte(meta.split(",")[0]),
          crack: !isUncensored && this.crackReg.test(name),
          meta,
          name,
        };
      })
      .toSorted(this.magnetSort);
  }
}
