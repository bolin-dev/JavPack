class Drive115 extends Req {
  static limit = 1150;

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
        type: 0,
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

  static filesAdd(cname, pid) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/add",
      data: { cname, pid },
    });
  }

  static lixianAddTaskUrl(url, wp_path_id) {
    return this.request({
      method: "POST",
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "add_task_url" },
      data: { url, wp_path_id },
    });
  }

  static lixianTaskLists() {
    return this.request({
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "task_lists" },
      responseType: "json",
    });
  }

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
        type: "",
        source: "",
        format: "json",
        star: "",
        is_share: "",
        suffix: "",
        custom_order: "",
        fc_mix: "",
        is_q: "",
        ...params,
      },
      responseType: "json",
    });
  }

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
        type: "",
        source: "",
        format: "json",
        star: "",
        is_share: "",
        suffix: "",
        custom_order: "",
        fc_mix: 0,
        is_q: "",
        ...params,
      },
      responseType: "json",
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

  static rbClean(password) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/rb/clean",
      data: { password },
    });
  }

  /**
   * Bulk delete files
   * @param {string[]} fid Array of file IDs
   * @param {string} pid Parent folder ID
   */
  static rbDelete(fid, pid = "") {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/rb/delete",
      data: { fid, pid, ignore_warn: 1 },
    });
  }

  static labelList(params = {}) {
    return this.request({
      url: "https://webapi.115.com/label/list",
      params: { keyword: "", limit: this.limit, ...params },
      responseType: "json",
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

  static sampleInitUpload({ filename, filesize, cid }) {
    return this.request({
      method: "POST",
      url: "https://uplb.115.com/3.0/sampleinitupload.php",
      data: { filename, filesize, target: `U_1_${cid}` },
    });
  }

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

  static filesEdit(fid, fid_cover) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/edit",
      data: { fid, fid_cover },
    });
  }

  static filesVideo(pickcode) {
    return this.request({
      url: "https://v.anxia.com/webapi/files/video",
      params: { pickcode, local: 1 },
      responseType: "json",
    });
  }
}

class Req115 extends Drive115 {
  static async filesSearchAllVideos(search_value) {
    const params = { type: 4 };
    const res = await this.filesSearch(search_value, params);

    const { count, page_size, data } = res;
    return count > page_size && data.length ? this.filesSearch(search_value, { ...params, limit: count }) : res;
  }

  static filesSearchFolders(search_value, cid) {
    return this.filesSearch(search_value, {
      cid,
      max_size: "",
      limit: 50,
      show_dir: 1,
      o: "",
      nf: 1,
      qid: 0,
      natsort: 1,
      type: "",
      fc: 1,
    });
  }

  static async generateCid(routes) {
    if (routes.length === 1 && /^\d+$/.test(routes[0])) return routes[0];
    let cid = "0";

    for (const route of routes) {
      const { data } = await this.filesSearchFolders(route, cid);
      let item = data.find(({ n }) => n === route);
      if (!item) item = await this.filesAdd(route, cid);
      cid = item?.cid;
      if (!cid) break;
    }

    return cid;
  }

  static sleep(s = 1) {
    return new Promise((r) => {
      setTimeout(r, s * 1000);
    });
  }

  static async natsortFilesAll(cid, params = {}) {
    const res = await this.natsortFiles(cid, params);
    const { count, page_size, data } = res;
    return count > page_size && data.length ? this.natsortFiles(cid, { ...params, limit: count }) : res;
  }

  static async filesAll(cid, params = {}) {
    const res = await this.files(cid, params);
    if (res.errNo === 20130827) return this.natsortFilesAll(cid, params);

    const { count, page_size, data } = res;
    return count > page_size && data.length ? this.files(cid, { ...params, limit: count }) : res;
  }

  static videosAll(cid) {
    return this.filesAll(cid, { type: 4 });
  }

  static async verifyTask(info_hash, { regex, codes }, { max, filter }) {
    let file_id = "";
    let videos = [];

    for (let index = 0; index < max; index++) {
      if (index) await this.sleep();
      const { tasks } = await this.lixianTaskLists();

      const task = tasks.find((task) => task.info_hash === info_hash);
      if (!task || task.status === -1) break;

      file_id = task.file_id;
      if (file_id) break;
    }
    if (!file_id) return { file_id, videos };

    for (let index = 0; index < max; index++) {
      if (index) await this.sleep();
      const { data } = await this.videosAll(file_id);

      videos = data.filter((item) => regex.test(item.n));
      if (videos.length) break;
    }

    if (!videos.length) {
      const { tasks } = await this.lixianTaskLists();
      const task = tasks.find((task) => task.info_hash === info_hash);

      if (task.status === 2) {
        const { data } = await this.videosAll(file_id);
        videos = data.filter((item) => codes.some((it) => item.n.includes(it)));
      }
    }

    return { videos: videos.filter(filter), file_id };
  }

  static async handleTags(files, tags) {
    const list = (await this.labelList())?.data.list;
    if (!list?.length) return;

    const labels = [];
    tags.forEach((tag) => {
      const item = list.find(({ name }) => name === tag);
      if (item) labels.push(item.id);
    });
    if (!labels.length) return;

    return this.filesBatchLabel(files.map(({ fid }) => fid).toString(), labels.toString());
  }

  static subripsAll(cid) {
    return this.filesAll(cid, { suffix: "srt" });
  }

  static handleRename(files, cid, { rename, renameTxt, zh, crack }) {
    rename = rename.replaceAll("$zh", zh ? renameTxt.zh : "");
    rename = rename.replaceAll("$crack", crack ? renameTxt.crack : "");
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

    const noTxt = renameTxt.no;
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

  static async handleClean(files, cid) {
    await this.filesMove(
      files.map((file) => file.fid),
      cid,
    );

    const { data } = await this.filesAll(cid);

    const rm_fids = data
      .filter((item) => !files.some(({ fid }) => fid === item.fid))
      .map((item) => item.fid ?? item.cid);

    if (rm_fids.length) return this.rbDelete(rm_fids, cid);
  }

  static async handleCover(url, cid, filename) {
    const file = await this.request({ url, responseType: "blob" });
    if (!file) return file;

    const res = await this.sampleInitUpload({ cid, filename, filesize: file.size });
    if (!res?.host) return res;

    const { data } = await this.upload({ ...res, filename, file });
    if (data?.file_id) return this.filesEdit(cid, data.file_id);
  }

  static async handleOffline(
    { dir, regex, codes, verifyOptions, cleanPwd, code, rename, renameTxt, tags, clean, cover },
    magnets,
  ) {
    const res = { status: "error", msg: `获取目录失败: ${dir.join("/")}` };
    const cid = await this.generateCid(dir);
    if (!cid) return res;

    for (let index = 0, { length } = magnets; index < length; index++) {
      const { url, zh, crack } = magnets[index];

      const { state, error_msg, errcode, info_hash } = await this.lixianAddTaskUrl(url, cid);
      if (!state) {
        res.msg = error_msg;
        res.status = "error";
        res.currIdx = index;
        if (errcode === 10008) continue;
        if (errcode === 911) res.status = "warn";
        break;
      }

      const { videos, file_id } = await this.verifyTask(info_hash, { regex, codes }, verifyOptions);
      if (!videos.length) {
        if (verifyOptions.clean) {
          this.lixianTaskDel([info_hash]).then(() => cleanPwd && this.rbClean(cleanPwd));
          if (file_id) this.rbDelete([file_id], cid);
        }
        res.msg = `${code} 离线验证失败`;
        res.status = "error";
        continue;
      }

      if (tags.length) this.handleTags(videos, tags);
      const { data: subs } = await this.subripsAll(file_id);
      const files = [...videos, ...subs];

      if (rename) this.handleRename(files, file_id, { rename, renameTxt, zh: zh || subs.length, crack });
      if (clean) {
        await this.handleClean(files, file_id);
        if (cleanPwd) this.rbClean(cleanPwd);
      }
      if (cover) await this.handleCover(cover, file_id, `${code}.cover.jpg`);

      res.msg = `${code} 离线任务成功`;
      res.status = "success";
      break;
    }

    return res;
  }
}
