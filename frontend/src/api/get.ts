export type Item = {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  name: string
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
    name: item["Name"],
  }));
}

export type ItemDetail = {
  name: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
  previewImage: string | null;
  images: string[] | null;
  alwaysOpen: boolean;
  openingHours: string | null;
  items: { name: string; description: string }[];
};

export async function getItem(id: string): Promise<ItemDetail> {
  const response = await fetch(`/api/get?poi=${id}`);
  const { data } = await response.json();

  const items = data["Aktuelles Sortiment"]
    ?.flat()
    .filter((item: string) => item.length > 4)
    .map((item: string) => {
      const [tag, description] = item.split("||");

      return {
        name: tag.trim(),
        description: description.trim(),
      };
    });

  return {
    name: data["Allgemeine Infos"]["Name"],
    address: data["Allgemeine Infos"]["Adresse"],
    description: data["Weitere Infos"]["Beschreibung"],
    latitude: data["Weitere Infos"]["Latitude"],
    longitude: data["Weitere Infos"]["Longitude"],
    type: data["Weitere Infos"]["Typ"],
    previewImage: data["Vorschaubild"][0] ?? null,
    images: data["Weitere Fotos"] ?? null,
    alwaysOpen: data["Weitere Infos"]["\u00d6ffnungszeiten"] === "immer",
    openingHours: data["Weitere Infos"]["\u00d6ffnungszeiten"] ?? null,
    items: items,
  };
}

export async function uploadImage(
  image: File,
  locationId: string
): Promise<string> {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("locationId", locationId);

  const response = await fetch(`/api/set_items`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  alert(data.data);
  return data.data;
}
