class ReqTrailer extends Req {
  static DMM_OPTIONS = [
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

  static async getCid(code) {
    const res = await this.request(`https://jav.land/en/id_search.php?keys=${code}`);

    const target = res.querySelector(".videotextlist");
    if (!target) throw new Error("Not found target");

    const cid = target.querySelector("tr td:nth-child(2)")?.textContent;
    if (!cid) throw new Error("Not found cid");

    return cid;
  }

  static async getDmm(cid, { path, selector, reg }) {
    const res = await this.request({
      url: `https://www.dmm.co.jp/${path}/=/cid=${cid}`,
      cookie: "age_check_done=1",
    });

    const target = res.querySelector(selector)?.textContent;
    if (!target) throw new Error("Not found target");

    const match = reg.exec(target);
    if (!match) throw new Error("Not found match");

    const trailer = match[1];
    if (!trailer) throw new Error("Not found trailer");

    return trailer.replace(/\\\//g, "/");
  }

  static async dmm(code) {
    const cid = await this.getCid(code);
    return Promise.any(this.DMM_OPTIONS.map((item) => this.getDmm(cid, item)));
  }

  static async heydouga(code) {
    const codes = code.split("-");
    if (codes[0] !== "heydouga") return;

    codes.shift();
    return `https://sample.heydouga.com/contents/${codes.join("/")}/sample.mp4`;
  }

  static useStudio() {
    const resolutions = ["720p", "1080p", "480p", "360p"];
    const transSample = (sample) => resolutions.map((res) => `${sample}${res}.mp4`);
    const studioList = [
      {
        studio: "東京熱",
        samples: [`https://my.cdn.tokyo-hot.com/media/samples/%s.mp4`],
      },
      {
        studio: "Tokyo-Hot",
        samples: [`https://my.cdn.tokyo-hot.com/media/samples/%s.mp4`],
      },
      {
        studio: "カリビアンコム",
        samples: transSample("https://smovie.caribbeancom.com/sample/movies/%s/"),
      },
      {
        studio: "一本道",
        samples: transSample("http://smovie.1pondo.tv/sample/movies/%s/"),
      },
      {
        studio: "HEYZO",
        parse: (code) => code.replaceAll("HEYZO-", ""),
        samples: [`https://sample.heyzo.com/contents/3000/%s/heyzo_hd_%s_sample.mp4`],
      },
      {
        studio: "天然むすめ",
        samples: transSample("https://smovie.10musume.com/sample/movies/%s/"),
      },
      {
        studio: "10musume",
        samples: transSample("https://smovie.10musume.com/sample/movies/%s/"),
      },
      {
        studio: "muramura",
        samples: transSample("https://smovie.muramura.tv/sample/movies/%s/"),
      },
      {
        studio: "パコパコママ",
        samples: transSample("https://fms.pacopacomama.com/hls/sample/pacopacomama.com/%s/"),
      },
    ];

    return async (code, studio) => {
      studio = studio
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      let list = [];
      for (const { samples, ...item } of studioList) {
        if (studio.every((it) => it !== item.studio)) continue;

        const word = item?.parse ? item.parse(code) : code;
        list = samples.map((url) => url.replaceAll("%s", word));
        break;
      }
      if (!list.length) return;

      let trailer = "";
      const res = await Promise.allSettled(list.map((url) => this.request({ method: "HEAD", url })));
      for (let index = 0, { length } = res; index < length; index++) {
        const { status, value } = res[index];
        if (status !== "fulfilled" || !value) continue;

        trailer = list[index];
        break;
      }
      return trailer;
    };
  }
}
