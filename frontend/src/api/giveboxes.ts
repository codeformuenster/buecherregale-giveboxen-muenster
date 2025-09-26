import type { Category } from "../components/FilterChips";

export type Givebox = {
  id: string;
  name: string;
  address: string;
  description: string;
  coordinates: [number, number];
  categories: Category[];
  images: string[];
};

const mockGiveboxes: Givebox[] = [
  {
    id: "givebox-1",
    name: "Givebox Aasee",
    address: "Aaseepark 5, 48151 Münster",
    description: "Bücher, Klamotten, Spielzeug und Haushaltswaren in gutem Zustand.",
    coordinates: [51.9507, 7.6166],
    categories: ["books", "clothes", "toys", "household_goods"],
    images: [
      "https://picsum.photos/seed/givebox-1-a/500/500",
      "https://picsum.photos/seed/givebox-1-b/500/500",
      "https://picsum.photos/seed/givebox-1-c/500/500",
      "https://picsum.photos/seed/givebox-1-d/500/500",
    ],
  },
  {
    id: "givebox-2",
    name: "Givebox Kreuzviertel",
    address: "Nordstraße 12, 48149 Münster",
    description: "Viel Lesestoff, ein paar Spiele und saisonale Dekoration.",
    coordinates: [51.9702, 7.6208],
    categories: ["books", "games", "decorations"],
    images: [
      "https://picsum.photos/seed/givebox-2-a/500/500",
      "https://picsum.photos/seed/givebox-2-b/500/500",
      "https://picsum.photos/seed/givebox-2-c/500/500",
      "https://picsum.photos/seed/givebox-2-d/500/500",
    ],
  },
  {
    id: "givebox-3",
    name: "Givebox Hansaviertel",
    address: "Hafenstraße 64, 48155 Münster",
    description: "Elektrogeräte, Werkzeuge und Küchenutensilien für den Haushalt.",
    coordinates: [51.9588, 7.6392],
    categories: ["electronics", "tools", "kitchen_items"],
    images: [
      "https://picsum.photos/seed/givebox-3-a/500/500",
      "https://picsum.photos/seed/givebox-3-b/500/500",
      "https://picsum.photos/seed/givebox-3-c/500/500",
      "https://picsum.photos/seed/givebox-3-d/500/500",
    ],
  },
];

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const cloneGivebox = (givebox: Givebox): Givebox => ({
  ...givebox,
  categories: [...givebox.categories],
  images: [...givebox.images],
});

export const fetchGiveboxes = async (): Promise<Givebox[]> => {
  await wait(500);
  return mockGiveboxes.map(cloneGivebox);
};

export const fetchGivebox = async (id: string): Promise<Givebox | null> => {
  await wait(500);
  const givebox = mockGiveboxes.find((entry) => entry.id === id);
  return givebox ? cloneGivebox(givebox) : null;
};

export const searchGiveboxes = async (
  query: string,
  category: Category | null
): Promise<Givebox[]> => {
  await wait(500);

  const normalizedQuery = query.trim().toLowerCase();

  return mockGiveboxes
    .filter((entry) =>
      category ? entry.categories.includes(category) : true
    )
    .filter((entry) => {
      if (!normalizedQuery) return true;

      return (
        entry.name.toLowerCase().includes(normalizedQuery) ||
        entry.address.toLowerCase().includes(normalizedQuery) ||
        entry.description.toLowerCase().includes(normalizedQuery)
      );
    })
    .map(cloneGivebox);
};
