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

export async function getItem(id: string) {
  const response = await fetch(`/api/get?poi=${id}`);
  const data = await response.json();

  return {
    name: data.data["Allgemeine Infos"]["Name"],
    address: data.data["Allgemeine Infos"]["Adresse"],
    description: data.data["Weitere Infos"]["Beschreibung"],
    latitude: data.data["Weitere Infos"]["Latitude"],
    longitude: data.data["Weitere Infos"]["Longitude"],
    type: data.data["Weitere Infos"]["Typ"],
  };
}
