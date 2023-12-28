class Req115 extends Req {
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

  // Edit file
  static filesEdit(data) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/edit",
      data,
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

  // Get offline space information
  static offlineSpace() {
    return this.request({
      url: "https://115.com/",
      params: { ct: "offline", ac: "space" },
      responseType: "json",
    });
  }

  // Get offline quota
  static lixianGetQuotaPackageInfo() {
    return this.request({
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "get_quota_package_info" },
      responseType: "json",
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
