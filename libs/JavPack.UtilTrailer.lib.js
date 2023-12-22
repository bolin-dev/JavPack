class UtilTrailer extends Req {
  static javspyl(ID) {
    return this.request({
      method: "POST",
      url: "https://v2.javspyl.tk/api/",
      data: { ID },
      headers: { origin: "https://javspyl.tk" },
    }).then((res) => {
      res = res?.info?.url;
      if (res && !/\.m3u8?$/i.test(res)) return res.includes("//") ? res : `https://${res}`;
    });
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

  static javland(code) {
    return this.tasks(`https://jav.land/tw/id_search.php?keys=${code}`, [
      (dom) => {
        const script = dom.body.querySelector("script").textContent;
        const vid = script.match(/videoid\s=\s"(.*)";/)?.[1];
        if (!vid) return;

        return {
          method: "POST",
          url: "https://www.jav.land/ajax/ajax_get_play_sample.php",
          data: { vid, action: "get" },
        };
      },
      ({ videourl }) => {
        const video = new DOMParser().parseFromString(videourl, "text/html");
        return video.querySelector("source").getAttribute("src");
      },
    ]);
  }

  static dmmDVD(code) {
    const href = "https://www.dmm.co.jp/mono/dvd/-";
    const reqDetails = {
      headers: { "accept-language": "ja-JP" },
      cookie: "age_check_done=1",
    };

    return this.tasks(
      {
        url: `${href}/search/=/searchstr=${code}/`,
        ...reqDetails,
      },
      [
        (dom) => {
          let url = dom.querySelector("#list li .tmb a")?.href;
          if (!url) return;

          url = new URL(url).pathname.split("/").filter(Boolean).pop();
          return {
            url: `${href}/detail/ajax-movie/=/${url}/`,
            ...reqDetails,
          };
        },
        (dom) => {
          const url = dom.querySelector("#DMMSample_player_now")?.src;
          return url ? { url, ...reqDetails } : null;
        },
        (dom) => {
          const script = dom.querySelector("#dmmplayer + script")?.textContent;
          if (!script) return;

          let args = script.match(/args\s=\s(.*);/)?.[1];
          if (!args) return;

          args = JSON.parse(args);
          const { bitrates = [], src } = args;

          return bitrates.find((item) => item.bitrate === 1000)?.src ?? src;
        },
      ],
    );
  }
}
