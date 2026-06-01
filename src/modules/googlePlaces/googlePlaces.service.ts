import type { NearestAgroInput } from "./googlePlaces.validation.js";

export class GooglePlacesService {
  async findNearestAgro(input: NearestAgroInput) {
    // const apiKey =
    //   process.env["GOOGLE_MAPS_API_KEY"] ?? process.env["GOOGLE_API_KEY"];
    const apiKey = "AIzaSyCsq5uuSox8lsiZ3n-TPqXukKE3CjpPNBU"
    if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API_KEY");

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": [
            "places.displayName",
            "places.formattedAddress",
            "places.nationalPhoneNumber",
            "places.websiteUri",
            "places.regularOpeningHours",
            "places.rating",
            "places.id",
            "places.location",
          ].join(","),
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: {
                latitude: input.latitude,
                longitude: input.longitude,
              },
              radius: 40000,
            },
          },
          textQuery: "agro farm supply agriculture",
        }),
      },
    );

    const json = await response.json();
    if (!response.ok) {
      throw new Error(
        `Google Places API error: ${response.status} ${JSON.stringify(json)}`,
      );
    }

    const first = json?.places?.[0];
    if (!first) return null;

    return {
      name: first.displayName?.text ?? first.displayName ?? null,
      address: first.formattedAddress ?? null,
      phone: first.nationalPhoneNumber ?? null,
      website: first.websiteUri ?? null,
      hours: first.regularOpeningHours ?? null,
      rating: first.rating ?? null,
      place_id: first.id ?? null,
      location: first.location ?? null,
      raw: first,
    };
  }
}
