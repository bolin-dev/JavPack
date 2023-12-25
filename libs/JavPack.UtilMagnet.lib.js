class UtilMagnet extends Req {
  static btdig(code) {
    const spaceReg = /\s/g;
    return this.tasks(`https://btdig.com/search?q=${code}`, [
      (dom) => {
        const resList = dom.querySelectorAll(".one_result");
        if (!resList.length) return;

        return [...resList]
          .map((item) => {
            const name = item.querySelector(".torrent_name").textContent;
            if (!name.toUpperCase().includes(code.toUpperCase())) return null;

            return {
              name,
              url: item.querySelector(".torrent_magnet a").href,
              size: item.querySelector(".torrent_size").textContent.replace(spaceReg, ""),
              files: item.querySelector(".torrent_files")?.textContent ?? "1",
              date: item.querySelector(".torrent_age").textContent,
            };
          })
          .filter(Boolean);
      },
    ]);
  }
}
