export async function findNearestAgro(latitude: number, longitude: number) {
  const apiKey = process.env["GOOGLE_API_KEY"];
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

  const location = `${latitude},${longitude}`;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${encodeURIComponent(
    location,
  )}&radius=5000&keyword=agro&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  const json = await res.json();
  const first = json.results && json.results[0];
  if (!first) return null;

  return {
    name: first.name,
    address: first.vicinity || first.formatted_address,
    location: first.geometry?.location,
    place_id: first.place_id,
  };
}
