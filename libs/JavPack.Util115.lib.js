class Util115 extends Req115 {
  static zhTxt = "[中文]";
  static crackTxt = "[破解]";
  static minMagnetSize = "300MB";
  static maxMagnetSize = "15GB";

  static videosSearch(search_value) {
    return this.filesSearch(search_value, { type: 4, o: "user_ptime", asc: 0, star: "", suffix: "" });
  }

  static async filesByOrder(cid, params = {}) {
    const res = await this.files(cid, params);
    const { errNo, order: o, is_asc: asc, fc_mix } = res;
    return errNo === 20130827 && o === "file_name" ? this.natsortFiles(cid, { ...params, o, asc, fc_mix }) : res;
  }

  static videos(cid) {
    return this.filesByOrder(cid, { type: 4 });
  }

  static folders(cid) {
    return this.filesByOrder(cid).then((res) => {
      if (res?.data.length) res.data = res.data.filter(({ pid }) => Boolean(pid));
      return res;
    });
  }

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

  static async verifyTask(info_hash, verifyFn, retry = 10) {
    const statusCodes = [0, 1, 2];
    let file_id = "";
    let videos = [];

    for (let index = 0; index < retry; index++) {
      if (index) await this.sleep();
      const { tasks } = await this.lixianTaskLists();

      const task = tasks.find((task) => task.info_hash === info_hash);
      if (!task || !statusCodes.includes(task.status)) break;

      file_id = task.file_id;
      if (file_id) break;
    }
    if (!file_id) return { file_id, videos };

    for (let index = 0; index < retry; index++) {
      if (index) await this.sleep();
      const { data } = await this.videos(file_id);

      videos = data.filter(verifyFn);
      if (videos.length) break;
    }
    return { file_id, videos };
  }

  static async handleUpload({ url, cid, filename }) {
    const file = await this.request({ url, responseType: "blob" });
    if (!file) return file;

    const res = await this.sampleInitUpload({ cid, filename, filesize: file.size });
    if (!res?.host) return res;

    return this.upload({ ...res, filename, file });
  }

  static filesEditDesc(files, desc) {
    const formData = new FormData();
    files.forEach((file) => formData.append("fid[]", file.fid ?? file.cid));
    formData.append("file_desc", desc);
    return this.filesEdit(formData);
  }

  static async filesBatchLabelName(files, labelNames) {
    const labelList = (await this.labelList())?.data.list;
    if (!labelList?.length) return;

    const file_label = [];
    labelNames.forEach((labelName) => {
      const label = labelList.find(({ name }) => name === labelName);
      if (label) file_label.push(label.id);
    });
    if (!file_label.length) return;

    return this.filesBatchLabel(files.map((file) => file.fid ?? file.cid).toString(), file_label.toString());
  }

  static delDirByPc(pc) {
    return this.filesVideo(pc).then(({ parent_id }) => this.rbDelete([parent_id]));
  }

  static sleep(s = 1) {
    return new Promise((resolve) => {
      setTimeout(resolve, s * 1000);
    });
  }

  static captcha(dom = document) {
    const hint = dom.querySelector(".vcode-hint");

    dom.querySelector("#js_ver_code_box button[rel=verify]").addEventListener("click", () => {
      setTimeout(() => {
        if (hint.getAttribute("style").indexOf("none") !== -1) {
          GM_setValue("VERIFY_STATUS", "verified");
          window.close();
        }
      }, 300);
    });
  }
}
