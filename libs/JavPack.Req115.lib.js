class Req115 extends Req {
  static limit = 11500;

  // 通过pickcode获取视频信息
  static filesVideo(pickcode) {
    return this.request({
      url: "https://v.anxia.com/webapi/files/video",
      params: { pickcode, local: 1 },
      responseType: "json",
    });
  }

  /**
   * 批量删除
   * @param {string[]} fid Array of file IDs
   * @param {string} pid Parent folder ID
   */
  static rbDelete(fid, pid) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/rb/delete",
      data: { fid, pid, ignore_warn: 1 },
    });
  }

  // 搜索文件
  static filesSearch(search_value, params = {}) {
    return this.request({
      url: "https://webapi.115.com/files/search",
      params: {
        offset: 0,
        limit: this.limit,
        search_value,
        date: "",
        aid: 1,
        cid: 0,
        pick_code: "",
        type: "",
        count_folders: 1,
        source: "",
        format: "json",
        ...params,
      },
      responseType: "json",
    });
  }

  // 搜索视频
  static videosSearch(search_value) {
    return this.filesSearch(search_value, { type: 4, o: "user_ptime", asc: 0, star: "", suffix: "" });
  }
}
