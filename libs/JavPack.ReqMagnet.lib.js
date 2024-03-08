class ReqMagnet extends Req {
  static btdig(code) {
    const spaceReg = /\s/g;
    const host = "https://btdig.com";

    return this.tasks(
      {
        url: `${host}/search`,
        params: { q: code },
        headers: {
          "Referer": `${host}/index.htm`,
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
      },
      [
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
            .filter(({ name }) => name.toUpperCase().includes(code));
        },
      ],
    );
  }
}
