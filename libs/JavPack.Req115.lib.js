class Drive115 extends Req {
  static limit = 11500;

  // Get file list
  static files(cid = "0", params = {}) {
    return this.request({
      url: "https://webapi.115.com/files",
      params: {
        aid: 1,
        cid,
        o: "user_ptime",
        asc: 0,
        offset: 0,
        show_dir: 1,
        limit: this.limit,
        code: "",
        scid: "",
        snap: 0,
        natsort: 1,
        record_open_time: 1,
        count_folders: 1,
        source: "",
        format: "json",
        type: "",
        star: "",
        is_q: "",
        is_share: "",
        suffix: "",
        custom_order: "",
        fc_mix: "",
        ...params,
      },
      responseType: "json",
    });
  }

  // Get file list by file name
  static natsortFiles(cid = "0", params = {}) {
    return this.request({
      url: "https://aps.115.com/natsort/files.php",
      params: {
        aid: 1,
        cid,
        o: "file_name",
        asc: 0,
        offset: 0,
        show_dir: 1,
        limit: this.limit,
        code: "",
        scid: "",
        snap: 0,
        natsort: 1,
        record_open_time: 1,
        count_folders: 1,
        source: "",
        format: "json",
        fc_mix: 0,
        ...params,
      },
      responseType: "json",
    });
  }

  // Search for files
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

  // Create a new folder
  static filesAdd(cname, pid) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/add",
      data: { cname, pid },
    });
  }

  /**
   * Bulk delete files
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

  /**
   * Bulk rename files
   * @param {object} files_new_name { [fid]: rename }
   */
  static filesBatchRename(files_new_name) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/batch_rename",
      data: { files_new_name },
    });
  }

  /**
   * Bulk label files
   * @param {string} file_ids fid1,fid2,fid3...
   * @param {string} file_label label_id1,label_id2,label_id3...
   * @returns
   */
  static filesBatchLabel(file_ids, file_label, action = "add") {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/batch_label",
      data: { file_ids, file_label, action },
    });
  }

  /**
   * Batch move files
   * @param {string[]} fid Array of file IDs
   * @param {string} pid Destination folder ID
   */
  static filesMove(fid, pid) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/move",
      data: { fid, pid, move_proid: "" },
    });
  }

  // Get offline task list
  static lixianTaskLists() {
    return this.request({
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "task_lists" },
      responseType: "json",
    });
  }

  // Add offline task
  static lixianAddTaskUrl(url, wp_path_id) {
    return this.request({
      method: "POST",
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "add_task_url" },
      data: { url, wp_path_id },
    });
  }

  /**
   * Bulk delete offline tasks and source files
   * @param {string[]} hash Array of info_hashes
   */
  static lixianTaskDel(hash) {
    return this.request({
      method: "POST",
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "task_del" },
      data: { hash, flag: 1 },
    });
  }

  // Get tag list
  static labelList() {
    return this.request({
      url: "https://webapi.115.com/label/list",
      params: { keyword: "", limit: this.limit },
      responseType: "json",
    });
  }

  // Get upload signature
  static sampleInitUpload({ filename, filesize, cid }) {
    return this.request({
      method: "POST",
      url: "https://uplb.115.com/3.0/sampleinitupload.php",
      data: { filename, filesize, target: `U_1_${cid}` },
    });
  }

  // Upload file
  static upload({
    host: url,
    filename: name,
    object: key,
    policy,
    accessid: OSSAccessKeyId,
    callback,
    signature,
    file,
  }) {
    return this.request({
      method: "POST",
      url,
      data: {
        name,
        key,
        policy,
        OSSAccessKeyId,
        success_action_status: "200",
        callback,
        signature,
        file,
      },
    });
  }

  // Get video file information
  static filesVideo(pickcode) {
    return this.request({
      url: "https://v.anxia.com/webapi/files/video",
      params: { pickcode, local: 1 },
      responseType: "json",
    });
  }
}

class Req115 extends Drive115 {
  // Search for videos
  static videosSearch(search_value) {
    return this.filesSearch(search_value, { type: 4, o: "user_ptime", asc: 0, star: "", suffix: "" });
  }

  // Get file list by order
  static async filesByOrder(cid, params = {}) {
    const res = await this.files(cid, params);
    const { errNo, order: o, is_asc: asc, fc_mix } = res;
    return errNo === 20130827 && o === "file_name" ? this.natsortFiles(cid, { ...params, o, asc, fc_mix }) : res;
  }

  // Get video list
  static videos(cid) {
    return this.filesByOrder(cid, { type: 4 });
  }

  // Get folder list
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

  static sleep(s = 1) {
    return new Promise((resolve) => {
      setTimeout(resolve, s * 1000);
    });
  }

  static async verifyTask(info_hash, regex, max_retry) {
    let file_id = "";
    let videos = [];

    for (let index = 0; index < max_retry; index++) {
      if (index) await this.sleep();
      const { tasks } = await this.lixianTaskLists();

      const task = tasks.find((task) => task.info_hash === info_hash);
      if (!task || task.status === -1) break;

      file_id = task.file_id;
      if (file_id) break;
    }
    if (!file_id) return { file_id, videos };

    for (let index = 0; index < max_retry; index++) {
      if (index) await this.sleep();
      const { data } = await this.videos(file_id);

      videos = data.filter((item) => regex.test(item.n));
      if (videos.length) break;
    }
    return { file_id, videos };
  }

  static handleRename(cid, files, { rename, noTxt, zhTxt, crackTxt, zh, crack }) {
    rename = rename.replaceAll("$zh", zh ? zhTxt : "");
    rename = rename.replaceAll("$crack", crack ? crackTxt : "");
    rename = rename.trim();

    const renameObj = { [cid]: rename };
    if (files.length === 1) {
      const { fid, ico } = files[0];
      renameObj[fid] = `${rename}.${ico}`;
      return this.filesBatchRename(renameObj);
    }

    const icoMap = files.reduce((acc, { ico, ...item }) => {
      acc[ico] ??= [];
      acc[ico].push(item);
      return acc;
    }, {});

    for (const [ico, items] of Object.entries(icoMap)) {
      if (items.length === 1) {
        renameObj[items[0].fid] = `${rename}.${ico}`;
        continue;
      }

      items
        .toSorted((a, b) => a.n.localeCompare(b.n))
        .forEach(({ fid }, idx) => {
          const no = noTxt.replaceAll("${no}", `${idx + 1}`.padStart(2, "0"));
          renameObj[fid] = `${rename}${no}.${ico}`;
        });
    }

    return this.filesBatchRename(renameObj);
  }

  static async handleTags(files, labelNames) {
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

  static async handleClean(files, cid) {
    await this.filesMove(
      files.map((file) => file.fid),
      cid,
    );

    const { data } = await this.filesByOrder(cid);

    const rm_fids = data
      .filter((item) => !files.some(({ fid }) => fid === item.fid))
      .map((item) => item.fid ?? item.cid);

    if (rm_fids.length) return this.rbDelete(rm_fids, cid);
  }

  static async handleUpload(url, cid, filename) {
    const file = await this.request({ url, responseType: "blob" });
    if (!file) return file;

    const res = await this.sampleInitUpload({ cid, filename, filesize: file.size });
    if (!res?.host) return res;

    return this.upload({ ...res, filename, file });
  }

  static async handleSmartOffline(
    { code, dir, regex, verifyOptions, rename, noTxt, zhTxt, crackTxt, tags, clean, cover },
    magnets,
  ) {
    const cid = await this.generateCid(dir);
    if (!cid) return { state: "error", msg: `${code} 获取目录失败` };

    const res = { state: "", msg: "" };

    for (let index = 0, { length } = magnets; index < length; index++) {
      const { url, zh, crack } = magnets[index];

      const { state, errcode, error_msg, info_hash } = await this.lixianAddTaskUrl(url, cid);
      if (!state) {
        res.state = "error";
        res.msg = `${code} ${error_msg}`;
        if (errcode === 10008) continue;
        if (errcode === 911) {
          res.state = "warn";
          res.msg = error_msg;
          res.currIdx = index;
        }
        break;
      }

      const { file_id, videos } = await this.verifyTask(info_hash, regex, verifyOptions.max);
      if (!videos.length) {
        if (verifyOptions.clean) {
          this.lixianTaskDel([info_hash]);
          if (file_id) this.rbDelete([file_id], cid);
        }
        res.state = "error";
        res.msg = `${code} 离线失败`;
        continue;
      } else {
        res.state = "success";
        res.msg = `${code} 离线成功`;
      }

      if (rename) this.handleRename(file_id, videos, { rename, noTxt, zhTxt, crackTxt, zh, crack });
      if (tags.length) this.handleTags(videos, tags);
      if (clean) await this.handleClean(videos, file_id);
      if (cover) await this.handleUpload(cover, file_id, `${code}.cover.jpg`);

      break;
    }

    return res;
  }
}
