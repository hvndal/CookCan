export const photos = {
  salmon: require('../../assets/food/hero-salmon.jpg') as number,
  garden: require('../../assets/food/hero-garden.jpg') as number,
  tomato: require('../../assets/food/still-tomato.jpg') as number,
  fridge: require('../../assets/food/fridge-open.jpg') as number,
  list: require('../../assets/food/list-note.jpg') as number,
  mediterranean: require('../../assets/food/cuisine-med.jpg') as number,
  asian: require('../../assets/food/cuisine-asian.jpg') as number,
  indian: require('../../assets/food/cuisine-indian.jpg') as number,
  italian: require('../../assets/food/cuisine-italian.jpg') as number,
  mexican: require('../../assets/food/cuisine-mexican.jpg') as number,
} as const;

const CUISINE_PHOTOS: Record<string, number> = {
  mediterranean: photos.mediterranean,
  asian: photos.asian,
  indian: photos.indian,
  italian: photos.italian,
  mexican: photos.mexican,
  japanese: photos.asian,
  chinese: photos.asian,
  thai: photos.asian,
  korean: photos.asian,
  french: photos.mediterranean,
  american: photos.salmon,
};

const SEQUENCE = [
  photos.salmon,
  photos.garden,
  photos.italian,
  photos.indian,
  photos.asian,
  photos.mexican,
  photos.mediterranean,
  photos.tomato,
];

export function photoForCuisine(name?: string): number {
  if (!name) return photos.salmon;
  return CUISINE_PHOTOS[name.toLowerCase()] ?? photos.salmon;
}

export function photoForIndex(index: number): number {
  return SEQUENCE[Math.abs(index) % SEQUENCE.length];
}

export function photoForCategory(category?: string): number {
  switch (category) {
    case 'Produce':
      return photos.tomato;
    case 'Meat':
      return photos.salmon;
    case 'Pantry':
      return photos.italian;
    case 'Spices':
      return photos.indian;
    default:
      return photos.garden;
  }
}
