function fetchJavspyl(code) {
  return request({
    method: "POST",
    data: { ID: code },
    url: "https://v2.javspyl.tk/api/",
    headers: { origin: "https://javspyl.tk" },
  }).then(res => res?.info?.url);
}

async function fetchStudio(code, studio) {
  const arr = studio
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  const studioList = [
    {
      studio: "東京熱",
      samples: [`https://my.cdn.tokyo-hot.com/media/samples/%s.mp4`],
    },
    {
      studio: "カリビアンコム",
      samples: [
        `https://smovie.caribbeancom.com/sample/movies/%s/720p.mp4`,
        `https://smovie.caribbeancom.com/sample/movies/%s/1080p.mp4`,
        `https://smovie.caribbeancom.com/sample/movies/%s/480p.mp4`,
        `https://smovie.caribbeancom.com/sample/movies/%s/360p.mp4`,
        `https://smovie.caribbeancom.com/sample/movies/%s/240p.mp4`,
      ],
    },
    {
      studio: "一本道",
      samples: [
        `http://smovie.1pondo.tv/sample/movies/%s/720p.mp4`,
        `http://smovie.1pondo.tv/sample/movies/%s/1080p.mp4`,
        `http://smovie.1pondo.tv/sample/movies/%s/480p.mp4`,
        `http://smovie.1pondo.tv/sample/movies/%s/360p.mp4`,
        `http://smovie.1pondo.tv/sample/movies/%s/240p.mp4`,
      ],
    },
    {
      studio: "HEYZO",
      parse: code => code.replaceAll("HEYZO-", ""),
      samples: [`https://sample.heyzo.com/contents/3000/%s/heyzo_hd_%s_sample.mp4`],
    },
    {
      studio: "天然むすめ",
      samples: [
        `https://smovie.10musume.com/sample/movies/%s/720p.mp4`,
        `https://smovie.10musume.com/sample/movies/%s/1080p.mp4`,
        `https://smovie.10musume.com/sample/movies/%s/480p.mp4`,
        `https://smovie.10musume.com/sample/movies/%s/360p.mp4`,
        `https://smovie.10musume.com/sample/movies/%s/240p.mp4`,
      ],
    },
    {
      studio: "パコパコママ",
      samples: [
        `https://fms.pacopacomama.com/hls/sample/pacopacomama.com/%s/720p.mp4`,
        `https://fms.pacopacomama.com/hls/sample/pacopacomama.com/%s/1080p.mp4`,
        `https://fms.pacopacomama.com/hls/sample/pacopacomama.com/%s/480p.mp4`,
        `https://fms.pacopacomama.com/hls/sample/pacopacomama.com/%s/360p.mp4`,
        `https://fms.pacopacomama.com/hls/sample/pacopacomama.com/%s/240p.mp4`,
      ],
    },
  ];

  let list = [];
  for (const { samples, ...item } of studioList) {
    if (arr.every(it => it !== item.studio)) continue;

    const word = item?.parse ? item.parse(code) : code;
    list = samples.map(url => url.replaceAll("%s", word));
    break;
  }
  if (!list.length) return;

  let trailer = "";
  const res = await Promise.allSettled(list.map(url => request({ url, method: "HEAD" })));
  for (let index = 0, { length } = res; index < length; index++) {
    const { status, value } = res[index];
    if (status !== "fulfilled" || !value) continue;

    trailer = list[index];
    break;
  }
  return trailer;
}
