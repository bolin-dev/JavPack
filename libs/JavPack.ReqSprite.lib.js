class ReqSprite extends Req {
  static async javbee(code) {
    const res = await this.request(`https://javbee.me/search?keyword=${code}`);
    const url = res.querySelector(".content-main .card .images-description a")?.href;
    if (!url) throw new Error("Not found target");

    const target = await this.request(url);
    const sprite = target.querySelector(".fileviewer-file img")?.src;
    if (!sprite) throw new Error("Not found sprite");

    return sprite;
  }

  static async javstore(code) {
    const res = await this.request(`https://javstore.net/search/${code}.html`);
    const url = res.querySelector("#content_news li a")?.href;
    if (!url) throw new Error("Not found target");

    const target = await this.request(url);
    const link = target.querySelector(".news > a");
    if (!link) throw new Error("Not found link");

    const source = link.querySelector("img")?.src ?? link.href;
    if (!source || !/\.(jpg|png)$/i.test(source)) throw new Error("Not found source");

    const sprite = source.replace("//pixhost.to/show/", "//img89.pixhost.to/images/").replace(".th.", ".");
    const finalUrl = await this.request({ url: sprite, method: "HEAD" });
    if (finalUrl.includes("removed")) throw new Error("Sprite removed");

    return finalUrl;
  }

  static getSprite(code) {
    return Promise.any([this.javbee(code), this.javstore(code)]);
  }
}
