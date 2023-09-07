const codeParse = code => {
  code = code.split("-").map((item, index) => (index ? item.replace(/^0/, "") : item));

  return {
    prefix: code[0],
    regex: new RegExp(`(?<![a-z])${code.join(`(0|-){0,4}`)}(?!\\d)`, "i"),
  };
};

function files(cid = 0, params = {}) {
  return request("https://webapi.115.com/files", {
    params: {
      aid: 1,
      cid,
      o: "user_ptime",
      asc: 0,
      offset: 0,
      show_dir: 1,
      limit: 115,
      code: "",
      scid: "",
      snap: 0,
      natsort: 1,
      record_open_time: 1,
      count_folders: 1,
      source: "",
      format: "json",
      type: 4,
      star: "",
      suffix: "",
      ...params,
    },
    responseType: "json",
  });
}

function filesSearch(search_value, params = {}) {
  if (!search_value) return;

  return request("https://webapi.115.com/files/search", {
    params: {
      offset: 0,
      limit: 10000,
      search_value,
      date: "",
      aid: 1,
      cid: 0,
      pick_code: "",
      type: 4,
      count_folders: 1,
      source: "",
      format: "json",
      o: "user_ptime",
      asc: 0,
      star: "",
      suffix: "",
      ...params,
    },
    responseType: "json",
  });
}

function filesVideo(pickcode) {
  if (!pickcode) return;

  return request("https://v.anxia.com/webapi/files/video", {
    params: {
      pickcode,
      local: 1,
    },
    responseType: "json",
  });
}

function rbDelete(fids = [], pid) {
  if (!fids.length || !pid) return;

  const data = { pid, ignore_warn: 1 };
  fids.forEach((fid, index) => {
    data[`fid[${index}]`] = fid;
  });

  return request("https://webapi.115.com/rb/delete", { method: "POST", data });
}
