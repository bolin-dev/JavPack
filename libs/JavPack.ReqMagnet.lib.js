class ReqMagnet extends Req {
  static btdig(code) {
    return this.tasks(`https://btdig.com/search?order=0&q=${code}`, [
      (dom) => {
        return [...dom.querySelectorAll(".one_result")]
          .map((node) => {
            return {
              url: node.querySelector(".torrent_magnet a")?.href,
              name: node.querySelector(".torrent_name")?.textContent.trim() ?? "",
              files: node.querySelector(".torrent_files")?.textContent.trim() ?? "",
              size: node.querySelector(".torrent_size")?.textContent.replace(/\s/g, "") ?? "",
              date: node.querySelector(".torrent_age")?.textContent.trim() ?? "",
            };
          })
          .filter(({ url, name }) => url && name.toUpperCase().includes(code));
      },
    ]);
  }

  static nyaa(code) {
    return this.tasks(`https://sukebei.nyaa.si/?f=0&c=2_2&q=${code}`, [
      (dom) => {
        return [...dom.querySelectorAll(".torrent-list tbody > tr")]
          .map((node) => {
            const tds = node.querySelectorAll("td");
            const nameList = tds[1].querySelectorAll("a");
            return {
              url: tds[2].querySelectorAll("a")?.[1]?.href,
              name: nameList[nameList.length - 1]?.textContent?.trim() ?? "",
              size: tds[3].textContent?.replace(/\s/g, "") ?? "",
              date: tds[4].textContent?.trim() ?? "",
            };
          })
          .filter(({ url, name }) => url && name.toUpperCase().includes(code));
      },
    ]);
  }
}
