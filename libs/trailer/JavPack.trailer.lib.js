async function fetchMsin(code) {
  const dom = await request(`https://db.msin.jp/branch/search?sort=jp.movie&str=${code}`);
  if (!dom || dom.querySelector("#center_main .error_string")) return;

  let cid = dom.querySelector(".mv_fileName")?.textContent;
  if (cid) return verifyFanzaCid(cid);

  dom.querySelectorAll("#bottom_content .movie_view_jp .movie_info").forEach(item => {
    const href = item.querySelector("a.playbutton")?.getAttribute("href");
    if (href?.includes("sample.fanza?id=")) {
      cid = href.split("=").at(-1);
      return;
    }
  });
  if (cid) return verifyFanzaCid(cid);
}

async function verifyFanzaCid(cid) {
  const HOST = "https://cc3001.dmm.co.jp";
  const FIRST = cid[0];
  const SECOND = cid.substring(0, 3);

  let trailer = "";
  const list = [
    `${HOST}/litevideo/freepv/${FIRST}/${SECOND}/${cid}/${cid}_mhb_w.mp4`,
    `${HOST}/litevideo/freepv/${FIRST}/${SECOND}/${cid}/${cid}_dmb_w.mp4`,
    `${HOST}/litevideo/freepv/${FIRST}/${SECOND}/${cid}/${cid}_dm_w.mp4`,
    `${HOST}/litevideo/freepv/${FIRST}/${SECOND}/${cid}/${cid}_sm_w.mp4`,
    `${HOST}/vrsample/${FIRST}/${SECOND}/${cid}/${cid}vrlite.mp4`,
  ];

  const res = await Promise.allSettled(list.map(item => request({ url: item, method: "HEAD" })));
  for (let index = 0, { length } = res; index < length; index++) {
    const { status, value } = res[index];
    if (status !== "fulfilled" || !value) continue;

    trailer = list[index];
    break;
  }

  return trailer;
}
