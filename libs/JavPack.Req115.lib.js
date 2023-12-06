class Req115 extends Req {
  // 获取文件列表
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
        limit: 10000,
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

  // 搜索文件
  static filesSearch(search_value, params = {}) {
    return this.request({
      url: "https://webapi.115.com/files/search",
      params: {
        offset: 0,
        limit: 10000,
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

  // 新建文件夹
  static filesAdd(cname, pid) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/add",
      data: { cname, pid },
    });
  }

  /**
   * 批量删除文件
   * @param {string[]} fid 文件 id 数组
   * @param {string} pid 父文件夹 id
   */
  static rbDelete(fid, pid) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/rb/delete",
      data: { fid, pid, ignore_warn: 1 },
    });
  }

  /**
   * 批量重命名文件
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
   * 编辑文件标签
   * @param {string} fid 文件 id
   * @param {string} file_label label_id,label_id
   */
  static filesEdit(fid, file_label) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/edit",
      data: { fid, file_label },
    });
  }

  /**
   * 批量移动文件
   * @param {string[]} fid 文件 id 数组
   * @param {string} pid 目标文件夹 id
   */
  static filesMove(fid, pid) {
    return this.request({
      method: "POST",
      url: "https://webapi.115.com/files/move",
      data: { fid, pid, move_proid: "" },
    });
  }

  // 获取离线空间信息
  static offlineSpace() {
    return this.request({
      url: "https://115.com/",
      params: { ct: "offline", ac: "space" },
      responseType: "json",
    });
  }

  // 获取离线配额
  static lixianGetQuotaPackageInfo() {
    return this.request({
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "get_quota_package_info" },
      responseType: "json",
    });
  }

  // 获取离线任务列表
  static lixianTaskLists() {
    return this.request({
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "task_lists" },
      responseType: "json",
    });
  }

  // 添加离线任务
  static lixianAddTaskUrl(url, wp_path_id) {
    return this.request({
      method: "POST",
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "add_task_url" },
      data: { url, wp_path_id },
    });
  }

  /**
   * 批量删除离线任务 & 源文件
   * @param {string[]} hash info_hash 数组
   */
  static lixianTaskDel(hash) {
    return this.request({
      method: "POST",
      url: "https://115.com/web/lixian/",
      params: { ct: "lixian", ac: "task_del" },
      data: { hash, flag: 1 },
    });
  }

  // 获取标签列表
  static labelList() {
    return this.request({
      url: "https://webapi.115.com/label/list",
      params: { keyword: "", limit: 11150 },
      responseType: "json",
    });
  }

  // 获取上传签名
  static sampleInitUpload({ filename, filesize, cid }) {
    return this.request({
      method: "POST",
      url: "https://uplb.115.com/3.0/sampleinitupload.php",
      data: { filename, filesize, target: `U_1_${cid}` },
    });
  }

  // 上传文件
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
}
