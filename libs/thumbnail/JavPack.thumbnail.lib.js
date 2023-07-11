function fetchBlogJav(code) {
  return taskQueue(`https://blogjav.net/?s=${code}`, [
    dom => {
      const list = dom.querySelectorAll("#main .entry-title a");
      const res = [...list].find(item => item.textContent.includes(code));
      return res?.href;
    },
    dom => {
      let img = dom.querySelector("#main .entry-content p > a img");
      if (!img) return;

      img = img.dataset.src ?? img.dataset.lazySrc;
      if (!img) return;

      return img.replace("//t", "//img").replace("thumbs", "images");
    },
  ]);
}

function fetchJavStore(code) {
  let word = code.replace("HEYZO-", "HEYZO ");

  return taskQueue(`https://javstore.net/search/${code}.html`, [
    dom => {
      const list = dom.querySelectorAll("#content_news li > a");
      const res = [...list].find(item => item.title.includes(word));
      return res?.href;
    },
    dom => {
      let img = dom.querySelector(".news > a")?.href;
      if (img && /\.(jpg|png)$/i.test(img)) return img;
    },
  ]);
}
