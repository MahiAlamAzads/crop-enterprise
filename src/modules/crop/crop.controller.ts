import type { Request, Response } from "express";
import { IdentifyValidator } from "./crop.validation.js";
import { CropService } from "./crop.service.js";
import { HttpClient } from "../../lib/httpClient.js";
import { config } from "../../config.js";

export class CropController {
  private validator = new IdentifyValidator();
  private service = new CropService(new HttpClient(), config);

  uploadPage = async (_req: Request, res: Response) => {
    return res.status(200).type("html").send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Crop Diagnose</title>
          <style>
            :root {
              color-scheme: light;
              --bg: #08111a;
              --panel: rgba(12, 20, 31, 0.82);
              --panel-border: rgba(255, 255, 255, 0.08);
              --text: #eaf2ff;
              --muted: #9fb3c8;
              --accent: #6ee7b7;
              --accent-2: #60a5fa;
              --danger: #fb7185;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              min-height: 100vh;
              font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              color: var(--text);
              background:
                radial-gradient(circle at top left, rgba(96, 165, 250, 0.22), transparent 30%),
                radial-gradient(circle at top right, rgba(110, 231, 183, 0.18), transparent 28%),
                linear-gradient(180deg, #09111b 0%, #05080d 100%);
            }
            .shell {
              width: min(1120px, calc(100vw - 32px));
              margin: 0 auto;
              padding: 32px 0 40px;
            }
            .hero {
              display: grid;
              gap: 14px;
              margin-bottom: 24px;
            }
            .eyebrow {
              display: inline-flex;
              width: fit-content;
              padding: 8px 12px;
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 999px;
              background: rgba(255,255,255,0.04);
              color: var(--muted);
              font-size: 12px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            h1 {
              margin: 0;
              font-size: clamp(34px, 5vw, 58px);
              line-height: 0.96;
              max-width: 12ch;
            }
            .subtitle {
              margin: 0;
              max-width: 68ch;
              color: var(--muted);
              font-size: 16px;
              line-height: 1.7;
            }
            .grid {
              display: grid;
              grid-template-columns: 1.05fr 0.95fr;
              gap: 20px;
            }
            @media (max-width: 900px) {
              .grid { grid-template-columns: 1fr; }
            }
            .card {
              border: 1px solid var(--panel-border);
              background: var(--panel);
              backdrop-filter: blur(20px);
              border-radius: 24px;
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
              overflow: hidden;
            }
            .card-head {
              padding: 18px 20px;
              border-bottom: 1px solid var(--panel-border);
            }
            .card-head h2 {
              margin: 0;
              font-size: 18px;
            }
            .card-head p {
              margin: 6px 0 0;
              color: var(--muted);
              font-size: 14px;
            }
            .card-body { padding: 20px; }
            .form {
              display: grid;
              gap: 16px;
            }
            label {
              display: grid;
              gap: 8px;
              color: var(--text);
              font-size: 14px;
              font-weight: 600;
            }
            input, textarea, button {
              font: inherit;
            }
            input, textarea {
              width: 100%;
              border-radius: 14px;
              border: 1px solid rgba(255,255,255,0.12);
              background: rgba(255,255,255,0.04);
              color: var(--text);
              padding: 13px 14px;
              outline: none;
            }
            input::placeholder, textarea::placeholder { color: #789; }
            input:focus, textarea:focus {
              border-color: rgba(110, 231, 183, 0.65);
              box-shadow: 0 0 0 4px rgba(110, 231, 183, 0.12);
            }
            textarea {
              min-height: 220px;
              resize: vertical;
              white-space: pre-wrap;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 13px;
            }
            .row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            @media (max-width: 640px) {
              .row { grid-template-columns: 1fr; }
            }
            .actions {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              align-items: center;
            }
            .primary {
              border: 0;
              border-radius: 14px;
              padding: 13px 18px;
              color: #07131a;
              background: linear-gradient(135deg, var(--accent), #9ef3ce);
              font-weight: 800;
              cursor: pointer;
            }
            .secondary {
              border: 1px solid rgba(255,255,255,0.12);
              border-radius: 14px;
              padding: 13px 18px;
              background: rgba(255,255,255,0.04);
              color: var(--text);
              font-weight: 700;
              cursor: pointer;
            }
            .hint {
              color: var(--muted);
              font-size: 13px;
              line-height: 1.6;
            }
            .preview {
              display: grid;
              gap: 12px;
            }
            .preview-box {
              min-height: 220px;
              border-radius: 18px;
              border: 1px dashed rgba(255,255,255,0.16);
              background: rgba(255,255,255,0.03);
              display: grid;
              place-items: center;
              overflow: hidden;
            }
            .preview-box img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: none;
            }
            .preview-empty {
              color: var(--muted);
              padding: 20px;
              text-align: center;
            }
            .badge-row {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
            }
            .badge {
              padding: 8px 10px;
              border-radius: 999px;
              background: rgba(96, 165, 250, 0.12);
              border: 1px solid rgba(96, 165, 250, 0.22);
              color: #d8ecff;
              font-size: 12px;
            }
            .error {
              color: var(--danger);
              font-size: 13px;
              min-height: 18px;
            }
          </style>
        </head>
        <body>
          <main class="shell">
            <section class="hero">
              <div class="eyebrow">Crop diagnosis workspace</div>
              <h1>Upload a leaf image and location.</h1>
              <p class="subtitle">This page converts your uploaded image into base64, sends it to <code>/api/crop/identify</code>, and shows the diagnosis, recovery guidance, and nearby agro result in one response.</p>
            </section>

            <section class="grid">
              <article class="card">
                <div class="card-head">
                  <h2>Request Builder</h2>
                  <p>Choose an image, set coordinates, and submit to the crop API.</p>
                </div>
                <div class="card-body">
                  <div class="form">
                    <label>
                      API Token
                      <input id="token" type="password" placeholder="Bearer token for /api/crop/identify" autocomplete="off" />
                    </label>

                    <label>
                      Image Upload
                      <input id="image" type="file" accept="image/*" />
                    </label>

                    <div class="row">
                      <label>
                        Latitude
                        <input id="latitude" type="number" step="any" placeholder="23.8103" />
                      </label>
                      <label>
                        Longitude
                        <input id="longitude" type="number" step="any" placeholder="90.4125" />
                      </label>
                    </div>

                    <div class="actions">
                      <button class="primary" id="submit" type="button">Run identification</button>
                      <button class="secondary" id="demo" type="button">Load demo coordinates</button>
                    </div>

                    <div class="error" id="error"></div>
                    <div class="hint">The page sends one image as base64 in the <code>images</code> array, exactly like the backend expects.</div>
                  </div>
                </div>
              </article>

              <article class="card">
                <div class="card-head">
                  <h2>Preview and Response</h2>
                  <p>See the image preview and the final JSON response here.</p>
                </div>
                <div class="card-body preview">
                  <div class="badge-row">
                    <span class="badge">Kindwise</span>
                    <span class="badge">Gemini / DeepSeek</span>
                    <span class="badge">Google Places</span>
                  </div>
                  <div class="preview-box">
                    <img id="preview" alt="Selected crop preview" />
                    <div class="preview-empty" id="previewEmpty">No image selected yet.</div>
                  </div>
                  <label>
                    API Response
                    <textarea id="response" readonly placeholder="Response JSON will appear here..."></textarea>
                  </label>
                </div>
              </article>
            </section>
          </main>

          <script>
            const imageInput = document.getElementById('image');
            const preview = document.getElementById('preview');
            const previewEmpty = document.getElementById('previewEmpty');
            const responseBox = document.getElementById('response');
            const errorBox = document.getElementById('error');
            const submitButton = document.getElementById('submit');
            const demoButton = document.getElementById('demo');
            const latitudeInput = document.getElementById('latitude');
            const longitudeInput = document.getElementById('longitude');
            const tokenInput = document.getElementById('token');

            let imageBase64 = '';

            imageInput.addEventListener('change', async () => {
              const file = imageInput.files && imageInput.files[0];
              if (!file) {
                imageBase64 = '';
                preview.removeAttribute('src');
                preview.style.display = 'none';
                previewEmpty.style.display = 'block';
                return;
              }

              const reader = new FileReader();
              reader.onload = () => {
                const result = String(reader.result || '');
                imageBase64 = result.includes(',') ? result.split(',')[1] : result;
                preview.src = result;
                preview.style.display = 'block';
                previewEmpty.style.display = 'none';
              };
              reader.readAsDataURL(file);
            });

            demoButton.addEventListener('click', () => {
              latitudeInput.value = '23.8103';
              longitudeInput.value = '90.4125';
            });

            submitButton.addEventListener('click', async () => {
              errorBox.textContent = '';
              responseBox.value = '';

              if (!imageBase64) {
                errorBox.textContent = 'Please upload an image first.';
                return;
              }

              const latitude = Number(latitudeInput.value);
              const longitude = Number(longitudeInput.value);
              if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
                errorBox.textContent = 'Please enter valid latitude and longitude.';
                return;
              }

              const payload = {
                images: [imageBase64],
                latitude,
                longitude,
              };

              const headers = {
                'Content-Type': 'application/json',
              };

              const token = tokenInput.value.trim();
              if (token) {
                headers['Authorization'] = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
              }

              try {
                const response = await fetch('/api/crop/identify', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(payload),
                });

                const data = await response.json();
                responseBox.value = JSON.stringify(data, null, 2);

                if (!response.ok) {
                  errorBox.textContent = data.error || 'Request failed.';
                }
              } catch (err) {
                errorBox.textContent = String(err);
              }
            });
          </script>
        </body>
      </html>
    `);
  };

  async identify(req: Request, res: Response) {
    const validation = this.validator.validate(req.body);
    if (!validation.valid)
      return res.status(400).json({ errors: validation.errors });

    try {
      const result = await this.service.identify(validation.payload!);
      return res.json(result);
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: String(err) });
    }
  }
}

const controller = new CropController();
export const uploadPage = controller.uploadPage.bind(controller);
export const identify = controller.identify.bind(controller);
