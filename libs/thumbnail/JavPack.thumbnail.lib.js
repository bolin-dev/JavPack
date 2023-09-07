function fetchBlogJav(code) {
  return taskQueue(`https://blogjav.net/?s=${code}`, [
    dom => {
      const list = dom.querySelectorAll("#main .entry-title a");
      const res = [...list].find(item => item.textContent.toUpperCase().includes(code));
      return res?.href;
    },
    async dom => {
      let img = dom.querySelector("#main .entry-content p > a img");
      if (!img) return;

      img = img.dataset.src ?? img.dataset.lazySrc;
      if (!img) return;

      img = img.replace("//t", "//img").replace("/thumbs/", "/images/");
      const status = await request(img, { method: "HEAD" });
      if (status === 200) return img;
    },
  ]);
}

function fetchJavStore(code) {
  const word = code.replace("HEYZO-", "HEYZO ").toUpperCase();

  return taskQueue(`https://javstore.net/search/${code}.html`, [
    dom => {
      const list = dom.querySelectorAll("#content_news li > a");
      const res = [...list].find(item => item.title.toUpperCase().includes(word));
      return res?.href;
    },
    dom => {
      const node = dom.querySelector(".news > a");
      const regex = /\.(jpg|png)$/i;

      let res = node?.href;
      if (!res || res.includes(".mp4")) return;
      if (regex.test(res)) return res.replace("//pixhost.to/show/", "//img89.pixhost.to/images/");

      res = node.querySelector("img")?.src;
      if (!res || res.includes(".mp4")) return;
      if (regex.test(res)) return res.replace(".th.", ".");
    },
  ]);
}
