class JavDB {
  static isUncensored(dom = document) {
    return dom.querySelector(".title.is-4 strong").textContent.includes("無碼");
  }

  static getCode(dom = document) {
    return dom.querySelector(".first-block .value").textContent;
  }

  static getTrailer(dom = document) {
    return dom.querySelector("#preview-video source")?.getAttribute("src");
  }
}
