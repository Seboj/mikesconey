export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category: "food" | "atmosphere" | "people";
  isPlaceholder: boolean;
}

export const galleryImages: GalleryImage[] = [
  {
    id: "food-1",
    src: "/images/gallery/placeholder-food-1.svg",
    alt: "Classic coney dogs with homemade chili sauce",
    caption: "Our famous coneys",
    category: "food",
    isPlaceholder: true,
  },
  {
    id: "food-2",
    src: "/images/gallery/placeholder-food-2.svg",
    alt: "Fluffy pancakes with butter and maple syrup",
    caption: "All-day breakfast",
    category: "food",
    isPlaceholder: true,
  },
  {
    id: "food-3",
    src: "/images/gallery/placeholder-food-3.svg",
    alt: "Juicy double cheeseburger with fries",
    caption: "Burgers done right",
    category: "food",
    isPlaceholder: true,
  },
  {
    id: "food-4",
    src: "/images/gallery/placeholder-food-4.svg",
    alt: "Greek salad with gyro meat and pita",
    caption: "Fresh gyro plate",
    category: "food",
    isPlaceholder: true,
  },
  {
    id: "atmosphere-1",
    src: "/images/gallery/placeholder-atmosphere-1.svg",
    alt: "Cozy diner counter with red stools",
    category: "atmosphere",
    isPlaceholder: true,
  },
  {
    id: "atmosphere-2",
    src: "/images/gallery/placeholder-atmosphere-2.svg",
    alt: "Warm dining room with booth seating",
    category: "atmosphere",
    isPlaceholder: true,
  },
  {
    id: "atmosphere-3",
    src: "/images/gallery/placeholder-atmosphere-3.svg",
    alt: "Mike's Coney Island storefront on Holly Road",
    category: "atmosphere",
    isPlaceholder: true,
  },
  {
    id: "people-1",
    src: "/images/gallery/placeholder-people-1.svg",
    alt: "Friendly staff behind the counter",
    category: "people",
    isPlaceholder: true,
  },
  {
    id: "people-2",
    src: "/images/gallery/placeholder-people-2.svg",
    alt: "Family enjoying breakfast together",
    category: "people",
    isPlaceholder: true,
  },
];
