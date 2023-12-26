class Util115 extends Req115 {
  // Search for videos
  static videosSearch(search_value) {
    return this.filesSearch(search_value, { type: 4, o: "user_ptime", asc: 0, star: "", suffix: "" });
  }

  static async filesByOrder(cid, params = {}) {
    const res = await this.files(cid, params);
    const { errNo, order: o, is_asc: asc, fc_mix } = res;

    if (errNo === 20130827 && o === "file_name") return this.natsortFiles(cid, { ...params, o, asc, fc_mix });
    return res;
  }

  // Get video list
  static videos(cid) {
    return this.files(cid, { type: 4 });
  }

  // Get folder list
  static folders(cid) {
    return this.files(cid).then((res) => {
      if (res?.data?.length) res.data = res.data.filter(({ pid }) => Boolean(pid));
      return res;
    });
  }

  // Generate download directory ID
  static async generateCid(routes) {
    let cid = "0";

    for (const route of routes) {
      const { data } = await this.folders(cid);
      let item = data.find(({ n }) => n === route);
      if (!item) item = await this.filesAdd(route, cid);
      cid = item?.cid;
      if (!cid) break;
    }

    return cid;
  }

  // Verify offline task
  static async verifyTask(info_hash, verifyFn, max_retry = 10) {
    let file_id = "";
    let videos = [];

    for (let index = 0; index < max_retry; index++) {
      await this.sleep();
      const { tasks } = await this.lixianTaskLists();
      file_id = tasks.find((task) => task.info_hash === info_hash).file_id;
      if (file_id) break;
    }
    if (!file_id) return { file_id, videos };

    for (let index = 0; index < max_retry; index++) {
      await this.sleep();
      const { data } = await this.videos(file_id);
      videos = data.filter(verifyFn);
      if (videos.length) break;
    }
    return { file_id, videos };
  }

  // Upload URL
  static async handleUpload({ url, cid, filename }) {
    const file = await this.request({ url, responseType: "blob" });
    if (!file) return file;

    const res = await this.sampleInitUpload({ cid, filename, filesize: file.size });
    if (!res?.host) return res;

    return this.upload({ ...res, filename, file });
  }

  // Match existing tags
  static async matchLabels(tags) {
    const { data } = await this.labelList();
    if (!data?.list?.length) return;

    const labels = [];
    tags.forEach((tag) => {
      const item = data.list.find(({ name }) => name === tag);
      if (item) labels.push(item.id);
    });
    return labels;
  }

  // Delete video folder
  static delDirByPc(pc) {
    return this.filesVideo(pc).then(({ parent_id }) => this.rbDelete([parent_id]));
  }

  static sleep(s = 1) {
    return new Promise((resolve) => {
      setTimeout(resolve, s * 1000);
    });
  }
}
