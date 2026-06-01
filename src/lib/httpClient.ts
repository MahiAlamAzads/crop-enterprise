export class HttpClient {
  constructor(private defaultHeaders: Record<string, string> = {}) {}

  async postJson(url: string, body: any, headers: Record<string, string> = {}) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.defaultHeaders,
        ...headers,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    return { ok: res.ok, status: res.status, body: json, raw: text };
  }

  async getJson(url: string, headers: Record<string, string> = {}) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    return { ok: res.ok, status: res.status, body: json, raw: text };
  }
}
