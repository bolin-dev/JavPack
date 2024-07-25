class ReqSprite extends Req {
  static blogjav(code) {
    const word = code.replace("HEYZO-", "HEYZO ");

    return this.tasks({ url: "https://blogjav.net/", params: { s: word } }, [
      (dom) => {
        const list = dom.querySelectorAll("#main .entry-title > a");
        const item = [...list].find((item) => {
          const title = item.textContent.toUpperCase();
          return title.includes(word) || title.includes(code);
        });

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
    const word = code.replace("HEYZO-", "HEYZO ");

    return this.tasks(`https://javstore.net/search/${word}.html`, [
      (dom) => {
        const list = dom.querySelectorAll("#content_news li > a");
        const item = [...list].find((item) => {
          const title = item.title.toUpperCase();
          return title.includes(word) || title.includes(code);
        });

        return item?.href;
      },
      (dom) => {
        const link = dom.querySelector(".news > a");
        const regex = /\.(jpg|png)$/i;

        let img = link.href;
        if (!img) return;

        if (regex.test(img)) {
          img = img.replace("//pixhost.to/show/", "//img89.pixhost.to/images/");
          return { method: "HEAD", url: img };
        }

        img = link.querySelector("img")?.src;
        if (!img) return;

        if (regex.test(img)) {
          img = img.replace(".th.", ".");
          return { method: "HEAD", url: img };
        }
      },
      (url) => url,
    ]);
  }
}
