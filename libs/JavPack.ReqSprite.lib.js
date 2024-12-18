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

  static getSprite(code) {
    return this.javbee(code);
  }
}
