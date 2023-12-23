class UtilMagnet extends Req {
  static async sehuatang(code) {
    const host = "https://sehuatang.org";
    const search = `${host}/search.php`;

    const reqList = await this.tasks(search, [
      (dom) => {
        const form = dom.querySelector(".searchform");
        if (!form) return;

        return {
          method: "POST",
          url: search,
          params: { mod: "forum" },
          data: {
            formhash: form.querySelector('input[name="formhash"]').value,
            searchsubmit: "yes",
            srchtxt: code,
          },
          responseType: "document",
        };
      },
      (dom) => {
        return [...dom.querySelectorAll("#threadlist .pbw .xs3 a")].filter(({ textContent }) => {
          return textContent.toUpperCase().includes(code);
        });
      },
    ]);

    if (!reqList?.length) return;

    const resList = await Promise.allSettled(
      reqList.map((item) => this.request(`${host}/${item.getAttribute("href")}`)),
    );

    const magnetReg = /(magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40})/i;
    const sizeReg = /(\d+(\.\d+)?\s?[TGMK]+i?B?)/i;
    const nameReg = /名称】：/;

    return resList
      .filter(({ status }) => status === "fulfilled")
      .map(({ value }) => {
        const params = value
          .querySelector("#postlist > div[id] .t_f")
          .textContent.split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const magnet = params.find((item) => magnetReg.test(item))?.match(magnetReg)[1];
        if (!magnet) return null;

        return {
          magnet,
          size: params.find((item) => sizeReg.test(item))?.match(sizeReg)[1],
          name: params
            .find((item) => nameReg.test(item))
            ?.split(nameReg)[1]
            .trim(),
        };
      })
      .filter(Boolean);
  }
}
