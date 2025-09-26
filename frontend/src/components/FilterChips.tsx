import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChefHat,
  Cpu,
  Footprints,
  Gamepad,
  Hammer,
  Home,
  MoreHorizontal,
  PenLine,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sprout,
  ToyBrick,
  UtensilsCrossed,
} from "lucide-react";

export type Category =
  | "books"
  | "clothes"
  | "toys"
  | "electronics"
  | "kitchen_items"
  | "household_goods"
  | "shoes"
  | "bags"
  | "games"
  | "decorations"
  | "tools"
  | "office_supplies"
  | "plants"
  | "food"
  | "other";

type CategoryChipProps = {
  category: Category;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  onClick: (category: Category | null) => void;
};

const CategoryChip = ({
  category,
  label,
  Icon,
  isActive,
  onClick,
}: CategoryChipProps) => (
  <button
    type="button"
    onClick={() => {
      if (isActive) {
        onClick(null);
      } else {
        onClick(category);
      }
    }}
    className={`flex items-center gap-2 whitespace-nowrap font-medium rounded-full px-4 py-2 text-sm transition-colors shadow ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "bg-white text-gray-500 hover:bg-gray-100"
    }`}
    aria-pressed={isActive}
  >
    <Icon
      className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-400"}`}
      aria-hidden="true"
    />
    {label}
  </button>
);

type FilterChipsProps = {
  activeCategory: Category | null;
  onCategoryClick: (category: Category | null) => void;
};

export const FilterChips = ({
  activeCategory,
  onCategoryClick,
}: FilterChipsProps) => (
  <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 px-4">
    <CategoryChip
      category="books"
      label="Bücher"
      Icon={BookOpen}
      isActive={activeCategory === "books"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="clothes"
      label="Kleidung"
      Icon={Shirt}
      isActive={activeCategory === "clothes"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="toys"
      label="Spielzeug"
      Icon={ToyBrick}
      isActive={activeCategory === "toys"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="electronics"
      label="Elektronik"
      Icon={Cpu}
      isActive={activeCategory === "electronics"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="kitchen_items"
      label="Küchenartikel"
      Icon={ChefHat}
      isActive={activeCategory === "kitchen_items"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="household_goods"
      label="Haushaltswaren"
      Icon={Home}
      isActive={activeCategory === "household_goods"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="shoes"
      label="Schuhe"
      Icon={Footprints}
      isActive={activeCategory === "shoes"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="bags"
      label="Taschen"
      Icon={ShoppingBag}
      isActive={activeCategory === "bags"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="games"
      label="Spiele"
      Icon={Gamepad}
      isActive={activeCategory === "games"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="decorations"
      label="Dekoration"
      Icon={Sparkles}
      isActive={activeCategory === "decorations"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="tools"
      label="Werkzeuge"
      Icon={Hammer}
      isActive={activeCategory === "tools"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="office_supplies"
      label="Bürobedarf"
      Icon={PenLine}
      isActive={activeCategory === "office_supplies"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="plants"
      label="Pflanzen"
      Icon={Sprout}
      isActive={activeCategory === "plants"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="food"
      label="Lebensmittel"
      Icon={UtensilsCrossed}
      isActive={activeCategory === "food"}
      onClick={onCategoryClick}
    />
    <CategoryChip
      category="other"
      label="Sonstiges"
      Icon={MoreHorizontal}
      isActive={activeCategory === "other"}
      onClick={onCategoryClick}
    />
  </div>
);
