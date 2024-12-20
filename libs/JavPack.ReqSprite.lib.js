class ReqSprite extends Req {
  static async javbee(code, regex) {
    const res = await this.request(`https://javbee.me/search?keyword=${code}`);

    const list = res?.querySelectorAll(".content-main .card-content:has(.images-description a)");
    if (!list?.length) throw new Error("Not found list");

    const match = [...list].find((node) => regex.test(node.querySelector(".title a")?.textContent ?? ""));
    if (!match) throw new Error("Not found match");

    const url = match.querySelector(".images-description a").href;
    if (!url) throw new Error("Not found target");

    const target = await this.request(url);
    const sprite = target?.querySelector(".fileviewer-file img")?.src;
    if (!sprite) throw new Error("Not found sprite");

    return sprite;
  }

  static async javstore(code, regex) {
    const res = await this.request(`https://javstore.net/search/${code}.html`);

    const list = res?.querySelectorAll("#content_news li > a");
    if (!list?.length) throw new Error("Not found list");

    const url = [...list].find((node) => regex.test(node.title ?? ""))?.href;
    if (!url) throw new Error("Not found target");

    const target = await this.request(url);
    const link = target?.querySelector(".news > a");
    if (!link) throw new Error("Not found link");

    const source = link.querySelector("img")?.src ?? link.href ?? "";
    if (!/\.(jpg|png)$/i.test(source)) throw new Error("Not found source");

    const sprite = source.replace("//pixhost.to/show/", "//img89.pixhost.to/images/").replace(".th.", ".");
    const finalUrl = await this.request({ url: sprite, method: "HEAD" });
    if (!finalUrl || finalUrl.includes("removed")) throw new Error("Sprite removed");

    return finalUrl;
  }

  static getSprite({ code, regex }) {
    return Promise.any([this.javbee(code, regex), this.javstore(code, regex)]);
  }
}
