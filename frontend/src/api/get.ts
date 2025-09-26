export type Item = {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
};

export async function getItems(): Promise<Item[]> {
  const response = await fetch(`/api/get`);
  const data = await response.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.data.map((item: any) => ({
    id: item["Bezeichnung / ID"],
    address: item["Adresse"],
    latitude: item["Latitude"],
    longitude: item["Longitude"],
    category: item["Kategorie"],
  }));
}
