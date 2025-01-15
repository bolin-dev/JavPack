/**
 * @require JavPack.Req.lib.js
 */
class ReqSprite extends Req {
  /**
   * @connect javbee.me
   * @connect *
   */
  static async javbee(code, regex) {
    const res = await this.request(`https://javbee.me/search?keyword=${code}`);

    const list = res?.querySelectorAll(".content-main .card-content:has(.images-description a)");
    if (!list?.length) throw new Error("Not found list");

    const match = [...list].filter((node) => regex.test(node.querySelector(".title a")?.textContent ?? ""));
    if (!match.length) throw new Error("Not found match");

    const urls = match.map((node) => node.querySelector(".images-description a").textContent?.trim()).filter(Boolean);
    if (!urls.length) throw new Error("Not found target");

    const target = await this.request(urls[0]);
    const sprite = target?.querySelector(".fileviewer-file img")?.src;
    if (!sprite) throw new Error("Not found sprite");

    return sprite;
  }

  /**
   * @connect javfree.me
   */
  static async javfree(code, regex) {
    const res = await this.request(`https://javfree.me/?s=${code}`);

    const list = res?.querySelectorAll("#main .content-loop.post-loop .entry-title a");
    if (!list?.length) throw new Error("Not found list");

    const url = [...list].find((node) => regex.test(node.textContent || ""))?.href;
    if (!url) throw new Error("Not found target");

    const target = await this.request(url);
    const images = target?.querySelectorAll("#main > article > .entry-content > p img");
    if (!images?.length) throw new Error("Not found images");

    const sprites = [...images].map((img) => img.src).filter((src) => /[a-z]+\.(jpe?g|png)$/i.test(src));
    if (!sprites.length) throw new Error("Not found sprite");

    return sprites.at(-1);
  }

  /**
   * @connect javstore.net
   * @connect pixhost.to
   */
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
    if (!/\.(jpe?g|png)$/i.test(source)) throw new Error("Not found source");

    const sprite = source.replace("//pixhost.to/show/", "//img89.pixhost.to/images/").replace(".th.", ".");
    const finalUrl = await this.request({ url: sprite, method: "HEAD" });
    if (!finalUrl || finalUrl.includes("removed")) throw new Error("Sprite removed");

    return finalUrl;
  }

  static getSprite({ code, regex }) {
    return Promise.any([this.javbee(code, regex), this.javfree(code, regex), this.javstore(code, regex)]);
  }
}
