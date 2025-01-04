class ReqTrailer extends Req {
  static useDmm() {
    const host = "https://www.dmm.co.jp";

    const options = {
      cookie: "age_check_done=1",
      headers: { "accept-language": "ja-JP,ja;q=0.9" },
    };

    const rules = [
      {
        path: "service/digitalapi/-/html5_player",
        selector: "#dmmplayer + script",
        parse: (text) => {
          const match = text.match(/const args = (.*);/);
          if (!match) throw new Error("Not found match");

          const { src, bitrates } = JSON.parse(match[1]);
          if (!src && !bitrates?.length) throw new Error("Not found res");

          const samples = [src, ...bitrates.map(({ src }) => src)].filter((item) => item.endsWith(".mp4"));
          if (!samples.length) throw new Error("Not found mp4");

          return [...new Set(samples)];
        },
      },
      {
        path: "digital/-/vr-sample-player",
        selector: "#player + script + script",
        parse: (text) => {
          const match = text.match(/var sampleUrl = "(.*)";/);
          if (!match) throw new Error("Not found match");

          const sample = match[1];
          if (!sample) throw new Error("Not found sample");
          if (!sample.endsWith(".mp4")) throw new Error("Not found mp4");

          return [sample];
        },
      },
    ];

    const parseCid = (url) => {
      const { hostname, pathname, searchParams } = new URL(url);
      let cid = "";

      switch (hostname) {
        case "tv.dmm.co.jp":
          cid = searchParams.get("content");
          break;
        case "www.dmm.co.jp":
          cid = pathname
            .split("/")
            .find((item) => item.startsWith("cid="))
            ?.replace("cid=", "");
          break;
        default:
          break;
      }

      return cid;
    };

    const getCid = async (searchstr) => {
      const res = await this.request({
        ...options,
        url: `${host}/search/?redirect=1&enc=UTF-8&category=&searchstr=${searchstr}`,
      });

      const target = res?.querySelector("#list .tmb a")?.href;
      if (!target) throw new Error("Not found target");

      const cid = parseCid(target);
      if (!cid) throw new Error("Not found cid");

      return cid;
    };

    const getDmm = async (cid, { path, selector, parse }) => {
      const res = await this.request({ ...options, url: `${host}/${path}/=/cid=${cid}` });

      const target = res?.querySelector(selector)?.textContent;
      if (!target) throw new Error("Not found target");

      return parse(target);
    };

    return async (searchstr, isVR) => {
      const cid = await getCid(searchstr);
      return isVR ? Promise.any(rules.map((item) => getDmm(cid, item))) : getDmm(cid, rules[0]);
    };
  }

  static useStudio() {
    const parse = (code, domain) => {
      const bitrates = ["1080p", "720p", "480p", "360p", "240p"];
      const sample = `https://smovie.${domain}/sample/movies/${code}/%s.mp4`;
      return bitrates.map((item) => sample.replace("%s", item));
    };

    const rules = [
      {
        studios: ["Tokyo-Hot", "東京熱"],
        samples: (code) => [`https://my.cdn.tokyo-hot.com/media/samples/${code}.mp4`],
      },
      {
        studios: ["Heydouga"],
        samples: (code) => {
          code = code.toLowerCase().replace("heydouga-", "").replaceAll("-", "/");
          const url = "https://sample.heydouga.com/contents";

          return [`${url}/${code}/sample.mp4`, `${url}/${code}/sample_thumb.mp4`];
        },
      },
      {
        studios: ["HEYZO"],
        samples: (code) => {
          code = code.toUpperCase().replace("HEYZO-", "");
          const url = "https://sample.heyzo.com/contents/3000";

          return [
            `${url}/${code}/heyzo_hd_${code}_sample.mp4`,
            `${url}/${code}/sample.mp4`,
            `${url}/${code}/sample_low.mp4`,
          ];
        },
      },
      {
        studios: ["一本道"],
        samples: (code) => parse(code, "1pondo.tv"),
      },
      {
        studios: ["pacopacomama,パコパコママ"],
        samples: (code) => parse(code, "pacopacomama.com"),
      },
      {
        studios: ["muramura"],
        samples: (code) => parse(code, "muramura.tv"),
      },
      {
        studios: ["10musume", "天然むすめ"],
        samples: (code) => parse(code, "10musume.com"),
      },
      {
        studios: ["Caribbeancom", "加勒比", "カリビアンコム"],
        samples: (code) => parse(code, "caribbeancom.com"),
      },
    ];

    return async (code, studio) => {
      if (!studio) throw new Error("Studio is required");
      studio = studio.toUpperCase();

      const samples = rules.find(({ studios }) => studios.some((st) => st.toUpperCase() === studio))?.samples(code);
      if (!samples?.length) throw new Error("Not found samples");

      const results = await Promise.allSettled(samples.map((url) => this.request({ method: "HEAD", url })));
      const sources = results.filter(({ status }) => status === "fulfilled").map(({ value }) => value);
      if (!sources.length) throw new Error("Not found sources");

      return sources;
    };
  }

  static async getTrailer({ isVR, isFC2, isWestern, isUncensored, code, title, studio }) {
    if (isFC2) {
      throw new Error("Not Supported FC2");
    } else if (isWestern) {
      throw new Error("Not Supported Western");
    } else if (isUncensored) {
      const guessStudio = this.useStudio();
      return guessStudio(code, studio);
    } else {
      const getDmm = this.useDmm();
      return isVR ? getDmm(title, isVR) : getDmm(code, isVR).catch(() => getDmm(title, isVR));
    }
  }
}
