/**
 * @match https://captchaapi.115.com/*
 *
 * @grant unsafeWindow
 * @grant GM_openInTab
 * @grant window.close
 * @grant GM_getValue
 * @grant GM_setValue
 * @grant GM_info
 */
class Verify115 {
  static TAG = GM_info.script.name;

  static HOST = "captchaapi.115.com";

  static STATUS_KEY = "VERIFY";

  static STATUS_VAL = {
    PENDING: "PENDING",
    VERIFIED: "VERIFIED",
    FAILED: "FAILED",
  };

  static get url() {
    return `https://${this.HOST}/?ac=security_code&type=web&cb=Close911_${new Date().getTime()}&tag=${this.TAG}`;
  }

  static start() {
    GM_setValue(this.STATUS_KEY, this.STATUS_VAL.PENDING);
    const tab = GM_openInTab(this.url, { active: true, setParent: true });
    tab.onclose = () => this.finally();
  }

  static verify() {
    const params = new URLSearchParams(location.search);
    const cb = params.get("cb");
    const tag = params.get("tag");
    if (!cb || tag !== this.TAG) return;

    const key = "setting_win";
    unsafeWindow[key] ??= {};
    unsafeWindow[key][cb] = () => GM_setValue(this.STATUS_KEY, this.STATUS_VAL.VERIFIED) || window.close();
  }

  static finally() {
    if (GM_getValue(this.STATUS_KEY) === this.STATUS_VAL.VERIFIED) return;
    GM_setValue(this.STATUS_KEY, this.STATUS_VAL.FAILED);
  }
}
