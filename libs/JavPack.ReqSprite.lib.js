class ReqSprite extends Req {
  static blogjav(code) {
    return this.tasks({ url: "https://blogjav.net/", params: { s: code } }, [
      (dom) => {
        const word = code.replace("HEYZO-", "HEYZO ");
        const list = dom.querySelectorAll("#main .entry-title > a");
        const item = [...list].find((item) => item.textContent.toUpperCase().includes(word));
        return item?.href;
      },
      (dom) => {
        let img = dom.querySelector("#main .entry-content p > a img");
        if (!img) return;

        img = img.dataset.src ?? img.dataset.lazySrc;
        if (!img) return;

        img = img.replace("//t", "//img").replace("/thumbs/", "/images/");
        return { method: "HEAD", url: img };
      },
      (url) => url,
    ]);
  }

  static javstore(code) {
    return this.tasks(`https://javstore.net/search/${code}.html`, [
      (dom) => {
        const word = code.replace("HEYZO-", "HEYZO ");
        const list = dom.querySelectorAll("#content_news li > a");
        const item = [...list].find((item) => item.title.toUpperCase().includes(word));
        return item?.href;
      },
      (dom) => {
        const link = dom.querySelector(".news > a");
        const regex = /\.(jpg|png)$/i;

        let img = link.href;
        if (!img || img.includes(".mp4")) return;

        if (regex.test(img)) {
          img = img.replace("//pixhost.to/show/", "//img89.pixhost.to/images/");
          return { method: "HEAD", url: img };
        }

        img = link.querySelector("img")?.src;
        if (!img || img.includes(".mp4")) return;

        if (regex.test(img)) {
          img = img.replace(".th.", ".");
          return { method: "HEAD", url: img };
        }
      },
      (url) => url,
    ]);
  }
}
