/**
 * @require JavPack.Req.lib.js
 */
class ReqTrailer extends Req {
  /**
   * @connect dmm.co.jp
   */
  static useDMM() {
    const rules = [
      {
        urlSep: "service/digitalapi/-/html5_player",
        selector: "#dmmplayer + script",
        parse: (text) => {
          const match = text.match(/const args = (.*);/);
          if (!match) throw new Error("Not found match");

          const { src, bitrates } = JSON.parse(match[1]);
          if (!src && !bitrates?.length) throw new Error("Not found res");

          const samples = [src, ...bitrates.map((it) => it.src)].filter((item) => item.endsWith(".mp4"));
          if (!samples.length) throw new Error("Not found mp4");

          return [...new Set(samples)];
        },
      },
      {
        urlSep: "digital/-/vr-sample-player",
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

    const getResult = async (keyword) => {
      const res = await this.request({
        url: "https://api.dmm.com/affiliate/v3/ItemList",
        params: {
          api_id: "UrwskPfkqQ0DuVry2gYL",
          affiliate_id: "10278-996",
          output: "json",
          site: "FANZA",
          sort: "match",
          keyword,
        },
        responseType: "json",
      });

      if (!res?.result?.result_count) throw new Error("Not found result");
      return res.result.items.map((item) => ({
        service: item.service_code,
        floor: item.floor_code,
        cid: item.content_id,
      }));
    };

    const getSamples = async ({ cid, service, floor }, { urlSep, selector, parse }) => {
      const res = await this.request({
        url: `https://www.dmm.co.jp/${urlSep}/=/cid=${cid}/mtype=AhRVShI_/service=${service}/floor=${floor}/mode=/`,
        headers: { "accept-language": "ja-JP,ja;q=0.9" },
        cookie: "age_check_done=1",
      });

      const target = res?.querySelector(selector)?.textContent;
      if (!target) throw new Error("Not found target");

      return parse(target);
    };

    return async (title, isVR) => {
      const result = await getResult(title);
      const rule = isVR ? rules[1] : rules[0];
      return Promise.any(result.map((res) => getSamples(res, rule)));
    };
  }

  /**
   * @connect caribbeancom.com
   * @connect pacopacomama.com
   * @connect tokyo-hot.com
   * @connect heydouga.com
   * @connect 10musume.com
   * @connect muramura.tv
   * @connect heyzo.com
   * @connect 1pondo.tv
   */
  static useStudio() {
    const sampleUrl = "https://smovie.$host/sample/movies/$code/%s.mp4";
    const resolutions = ["1080p", "720p", "480p", "360p", "240p"];

    const getSamples = (code, host) => {
      const sample = sampleUrl.replace("$host", host).replace("$code", code);
      return resolutions.map((r) => sample.replace("%s", r));
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
        samples: (code) => getSamples(code, "1pondo.tv"),
      },
      {
        studios: ["pacopacomama,パコパコママ"],
        samples: (code) => getSamples(code, "pacopacomama.com"),
      },
      {
        studios: ["muramura"],
        samples: (code) => getSamples(code, "muramura.tv"),
      },
      {
        studios: ["10musume", "天然むすめ"],
        samples: (code) => getSamples(code, "10musume.com"),
      },
      {
        studios: ["Caribbeancom", "加勒比", "カリビアンコム"],
        samples: (code) => getSamples(code, "caribbeancom.com"),
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

  static getTrailer({ isVR, isFC2, isWestern, isUncensored, code, title, studio }) {
    if (isFC2) {
      throw new Error("Not Supported FC2");
    } else if (isWestern) {
      throw new Error("Not Supported Western");
    } else if (isUncensored) {
      const guessStudio = this.useStudio();
      return guessStudio(code, studio);
    } else {
      const getDMM = this.useDMM();
      return getDMM(title, isVR);
    }
  }
}
