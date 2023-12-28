class UtilMagnet extends Req {
  static btdig(code) {
    const spaceReg = /\s/g;
    return this.tasks(`https://btdig.com/search?q=${code}`, [
      (dom) => {
        return [...dom.querySelectorAll(".one_result")]
          .map((item) => {
            return {
              name: item.querySelector(".torrent_name").textContent,
              url: item.querySelector(".torrent_magnet a").href,
              size: item.querySelector(".torrent_size").textContent.replace(spaceReg, ""),
              files: item.querySelector(".torrent_files")?.textContent ?? "1",
              date: item.querySelector(".torrent_age").textContent,
            };
          })
          .filter(({ name }) => name.toUpperCase().includes(code.toUpperCase()));
      },
    ]);
  }
}
