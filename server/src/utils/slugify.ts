// slugify
// Turns a name into a web-friendly id, e.g "Home & Living" -> "home-living"

// STEP 9: make a web-friendly names (slugs)

export const slugify = (text: string): string => {
  return text
    .toLocaleLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-") // anything that is not a letter or number becomes "-"
    .replace(/^-+|--$/g, ""); // remove "_" at the start or end
};

// STEP 10 (write the demo data) -> server/src/data/categories.ts
