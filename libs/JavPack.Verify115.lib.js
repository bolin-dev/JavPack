class Verify115 {
  static HOST = "captchaapi.115.com";

  static STATUS_KEY = "VERIFY";

  static STATUS_VAL = {
    PENDING: "PENDING",
    VERIFIED: "VERIFIED",
    FAILED: "FAILED",
  };

  static get url() {
    return `https://${this.HOST}/?ac=security_code&type=web&cb=Close911_${new Date().getTime()}`;
  }

  static start() {
    GM_setValue(this.STATUS_KEY, this.STATUS_VAL.PENDING);
    const tab = GM_openInTab(this.url, { active: true, setParent: true });
    tab.onclose = () => this.finally();
  }

  static verify() {
    document.querySelector("#js_ver_code_box button[rel=verify]").addEventListener("click", () => {
      setTimeout(() => {
        if (document.querySelector(".vcode-hint").getAttribute("style").indexOf("none") === -1) return;
        GM_setValue(this.STATUS_KEY, this.STATUS_VAL.VERIFIED);
        window.close();
      }, 300);
    });
  }

  static finally() {
    if (GM_getValue(this.STATUS_KEY) === this.STATUS_VAL.VERIFIED) return;
    GM_setValue(this.STATUS_KEY, this.STATUS_VAL.FAILED);
  }
}
