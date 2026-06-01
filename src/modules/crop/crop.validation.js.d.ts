export type IdentifyPayload = {
  images?: string[];
  latitude?: number;
  longitude?: number;
  similar_images?: boolean;
};

export class IdentifyValidator {
  validate(body: any): {
    valid: boolean;
    errors?: string[];
    payload?: IdentifyPayload;
  };
}

export { IdentifyPayload as default };
