/**
 * @require JavPack.Req.lib.js
 */
class ReqDB extends Req {
  static md5(str) {
    const b = new TextEncoder().encode(str);
    const l = b.length;
    const n = ((l + 8) >> 6) + 1;
    const m = new Uint32Array(n * 16);
    const k = [];
    const s = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];

    for (let i = 0; i < 64; i++) k[i] = Math.floor(2 ** 32 * Math.abs(Math.sin(i + 1)));
    for (let i = 0; i < l; i++) m[i >> 2] |= b[i] << ((i % 4) << 3);

    m[l >> 2] |= 0x80 << ((l % 4) << 3);
    m[n * 16 - 2] = l * 8;

    let [a0, b0, c0, d0] = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];

    for (let i = 0; i < n; i++) {
      const g = m.slice(i * 16, (i + 1) * 16);
      let [a, b, c, d] = [a0, b0, c0, d0];

      for (let j = 0; j < 64; j++) {
        const q = Math.floor(j / 16);
        const f = [(b & c) | (~b & d), (d & b) | (~d & c), b ^ c ^ d, c ^ (b | ~d)][q];
        const p = [j, (5 * j + 1) % 16, (3 * j + 5) % 16, (7 * j) % 16][q];

        const sum = (a + f + k[j] + g[p]) | 0;
        const shift = s[(q << 2) | (j % 4)];
        const nextA = d;

        d = c;
        c = b;
        b = (b + ((sum << shift) | (sum >>> (32 - shift)))) | 0;
        a = nextA;
      }
      a0 = (a0 + a) | 0;
      b0 = (b0 + b) | 0;
      c0 = (c0 + c) | 0;
      d0 = (d0 + d) | 0;
    }

    return [a0, b0, c0, d0]
      .map(v => new Uint32Array([v]))
      .map(v => new Uint8Array(v.buffer))
      .map(v => Array.from(v, b => b.toString(16).padStart(2, "0")).join(""))
      .join("");
  }

  static signature() {
    const TS_KEY = "TS";
    const SIGN_KEY = "SIGN";

    const curr = Math.floor(Date.now() / 1000);
    const ts = localStorage.getItem(TS_KEY) || 0;
    if (curr - ts <= 20) return localStorage.getItem(SIGN_KEY);

    const secret = this.md5(
      `${curr}71cf27bb3c0bcdf207b64abecddc970098c7421ee7203b9cdae54478478a199e7d5a6e1a57691123c1a931c057842fb73ba3b3c83bcd69c17ccf174081e3d8aa`,
    );
    const sign = `${curr}.lpw6vgqzsp.${secret}`;

    localStorage.setItem(TS_KEY, curr);
    localStorage.setItem(SIGN_KEY, sign);
    return sign;
  }

  /**
   * @connect jdforrepam.com
   */
  static related(movie_id) {
    return this.request({
      url: "https://jdforrepam.com/api/v1/lists/related",
      params: { movie_id, page: 1, limit: 24 },
      headers: { jdSignature: this.signature() },
      responseType: "json",
    });
  }
}
