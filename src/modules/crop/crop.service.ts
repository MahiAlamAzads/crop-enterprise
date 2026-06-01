import { HttpClient } from "../../lib/httpClient.js";
import { logger } from "../../lib/logger.js";
import type { Config } from "../../config.js";

const KINDWISE_URL = "https://crop.kindwise.com/api/v1/identification";

import type { IdentifyPayload } from "./crop.validation.js";
export class CropService {
  constructor(
    private http: HttpClient,
    private cfg: Config,
  ) {}

  async identify(payload: IdentifyPayload) {
    const apiKey = process.env["KINDWISE_API_KEY"];
    if (!apiKey) throw new Error("Missing KINDWISE_API_KEY");

    const body: any = { images: payload.images };
    if (payload.latitude != null) body.latitude = payload.latitude;
    if (payload.longitude != null) body.longitude = payload.longitude;
    if (payload.similar_images != null)
      body.similar_images = payload.similar_images;

    logger.info("Sending identification request to Kindwise");
    const resp = await this.http.postJson(KINDWISE_URL, body, {
      "Api-Key": apiKey,
    });
    if (!resp.ok) {
      throw new Error(
        `Kindwise API error: ${resp.status} ${JSON.stringify(resp.body)}`,
      );
    }

    const json = resp.body;

    const diseaseSuggestion = json?.result?.disease?.suggestions?.[0];
    const diseaseName = diseaseSuggestion?.name ?? "unknown disease";

    const backendUrl = this.cfg.BACKEND_URL.replace(/\/$/, "");

    const recoveryResp = await this.http.postJson(
      `${backendUrl}/api/gemini/recovery-instructions`,
      { diseaseName },
    );
    if (!recoveryResp.ok) {
      throw new Error(
        `Gemini API error: ${recoveryResp.status} ${JSON.stringify(recoveryResp.body)}`,
      );
    }
    const recovery = recoveryResp.body?.recovery ?? recoveryResp.body;

    let nearestAgro = null;
    logger.info("NearestAgro check", {
      latitude: payload.latitude,
      longitude: payload.longitude,
      hasGoogleKey: Boolean(
        this.cfg.GOOGLE_API_KEY ?? this.cfg.GOOGLE_MAPS_API_KEY,
      ),
    });

    if (
      payload.latitude != null &&
      payload.longitude != null &&
      (this.cfg.GOOGLE_API_KEY ?? this.cfg.GOOGLE_MAPS_API_KEY)
    ) {
      try {
        const agroResp = await this.http.getJson(
          `${backendUrl}/api/google-places/agro-nearby?lat=${encodeURIComponent(
            payload.latitude,
          )}&lng=${encodeURIComponent(payload.longitude)}`,
        );
        logger.info("agroResp", { ok: agroResp.ok, status: agroResp.status });
        if (!agroResp.ok) {
          nearestAgro = {
            error: `Google Places API error: ${agroResp.status}`,
          };
        } else {
          nearestAgro = agroResp.body?.nearestAgro ?? agroResp.body;
        }
      } catch (err) {
        nearestAgro = { error: String(err) };
      }
    }

    return {
      kindwise: json,
      disease: diseaseSuggestion,
      recovery,
      nearestAgro,
    };
  }
}
