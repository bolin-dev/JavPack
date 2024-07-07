class ReqTrailer extends Req {
  static useDmm() {
    const getCid = async (code) => {
      const res = await this.request(`https://jav.land/en/id_search.php?keys=${code}`);

      const target = res.querySelector(".videotextlist");
      if (!target) throw new Error("Not found target");

      const cid = target.querySelector("tr td:nth-child(2)")?.textContent;
      if (!cid) throw new Error("Not found cid");

      return cid;
    };

    const getDmm = async (cid, { path, selector, reg }) => {
      const res = await this.request({
        url: `https://www.dmm.co.jp/${path}/=/cid=${cid}`,
        cookie: "age_check_done=1",
      });

      const target = res.querySelector(selector)?.textContent;
      if (!target) throw new Error("Not found target");

      const match = target.match(reg);
      if (!match) throw new Error("Not found match");

      const trailer = match[1];
      if (!trailer) throw new Error("Not found trailer");

      return trailer.replace(/\\\//g, "/");
    };

    const MAP = [
      {
        path: "service/digitalapi/-/html5_player",
        selector: "#dmmplayer + script",
        reg: /"src"\s*:\s*"([^"]+)"/,
      },
      {
        path: "digital/-/vr-sample-player",
        selector: "#player + script + script",
        reg: /sampleUrl\s*=\s*"(.*)"/,
      },
    ];

    return async (code) => {
      const cid = await getCid(code);
      return code.includes("VR") ? Promise.any(MAP.map((item) => getDmm(cid, item))) : getDmm(cid, MAP[0]);
    };
  }

  static heydouga(code) {
    const codes = code.split("-");
    if (codes[0] !== "heydouga") return;

    codes.shift();
    return `https://sample.heydouga.com/contents/${codes.join("/")}/sample.mp4`;
  }

  static useStudio() {
    const RES = ["720p", "1080p", "480p", "360p"];
    const trans = (sample) => RES.map((res) => `${sample}${res}.mp4`);

    const MAP = [
      {
        studios: ["東京熱", "Tokyo-Hot"],
        samples: [`https://my.cdn.tokyo-hot.com/media/samples/%s.mp4`],
      },
      {
        studios: ["加勒比", "カリビアンコム"],
        samples: trans("https://smovie.caribbeancom.com/sample/movies/%s/"),
      },
      {
        studios: ["一本道"],
        samples: trans("http://smovie.1pondo.tv/sample/movies/%s/"),
      },
      {
        studios: ["HEYZO"],
        parse: (code) => code.replaceAll("HEYZO-", ""),
        samples: [`https://sample.heyzo.com/contents/3000/%s/heyzo_hd_%s_sample.mp4`],
      },
      {
        studios: ["10musume", "天然むすめ"],
        samples: trans("https://smovie.10musume.com/sample/movies/%s/"),
      },
      {
        studios: ["pacopacomama", "パコパコママ"],
        samples: trans("https://fms.pacopacomama.com/hls/sample/pacopacomama.com/%s/"),
      },
      {
        studios: ["muramura"],
        samples: trans("https://smovie.muramura.tv/sample/movies/%s/"),
      },
    ];

    return async (code, studio) => {
      const studios = studio
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      let list = [];
      for (const { samples, ...item } of MAP) {
        if (!studios.some((it) => item.studios.includes(it))) continue;

        const rep = item?.parse ? item.parse(code) : code;
        list = samples.map((url) => url.replaceAll("%s", rep));
        break;
      }

      if (list.length) return Promise.any(list.map((url) => this.request({ method: "HEAD", url })));
    };
  }
}
