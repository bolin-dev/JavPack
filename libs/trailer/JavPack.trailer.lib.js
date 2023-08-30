function fetchJavspyl(code) {
  return request({
    method: "POST",
    data: { ID: code },
    url: "https://v2.javspyl.tk/api/",
    headers: { origin: "https://javspyl.tk" },
  }).then(res => res?.info?.url);
}

const resolutions = ["720p", "1080p", "480p", "360p"];
const sampleTransform = sample => resolutions.map(res => `${sample}${res}.mp4`);

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
      samples: sampleTransform("https://smovie.caribbeancom.com/sample/movies/%s/"),
    },
    {
      studio: "一本道",
      samples: sampleTransform("http://smovie.1pondo.tv/sample/movies/%s/"),
    },
    {
      studio: "HEYZO",
      parse: code => code.replaceAll("HEYZO-", ""),
      samples: [`https://sample.heyzo.com/contents/3000/%s/heyzo_hd_%s_sample.mp4`],
    },
    {
      studio: "天然むすめ",
      samples: sampleTransform("https://smovie.10musume.com/sample/movies/%s/"),
    },
    {
      studio: "10musume",
      samples: sampleTransform("https://smovie.10musume.com/sample/movies/%s/"),
    },
    {
      studio: "muramura",
      samples: sampleTransform("https://smovie.muramura.tv/sample/movies/%s/"),
    },
    {
      studio: "パコパコママ",
      samples: sampleTransform("https://fms.pacopacomama.com/hls/sample/pacopacomama.com/%s/"),
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
