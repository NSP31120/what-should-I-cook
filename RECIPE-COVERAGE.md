# Recipe coverage snapshot

This report describes the application's curated recipe dataset after the representative additions in this change. It is a coverage snapshot, not a claim to include every dish or cuisine.

## Dataset summary

| Measure | Result |
|---|---:|
| Total recipes | 35 |
| Meal types | Breakfast 9; lunch 6; dinner 13; snack 5; dessert 2 |
| Difficulty | Easy 30; medium 5; hard 0 |
| Total cooking-time range | 5–50 minutes |
| Recipes without an image mapping | 0 |
| Duplicate IDs / exact duplicate titles | 0 / 0 |

Dietary labels are non-exclusive. Current counts are vegetarian 27, vegan 9, gluten-free 21, and dairy-free 19. They are informational dataset classifications, not medical guarantees; ingredient brands and cross-contact still need checking.

## Cuisine labels and regional representation

| Cuisine/region label | Recipes |
|---|---:|
| American | 17 |
| Mediterranean | 5 |
| Italian | 3 |
| Mexican | 3 |
| Asian (not country-specific) | 2 |
| French | 1 |
| Korean-inspired | 1 |
| South Asian-inspired | 1 |
| West African-inspired | 1 |
| Modern | 1 |

The broad labels do not map cleanly to continents, and a label is not a statement of culinary authenticity. In particular, “Mediterranean” cannot reliably be counted as Middle Eastern, and the two generic “Asian” entries do not identify a specific country.

| Region requested | Current coverage assessment |
|---|---|
| North America | Strongly represented by the 17 broadly American-labelled recipes; the collection is not a survey of North American cuisines. |
| Latin America and the Caribbean | Three Mexican-labelled recipes; Caribbean and other Latin American cuisines are missing. |
| Europe | Four labelled Italian or French recipes; other European cuisines are underrepresented. |
| Middle East | Some Mediterranean-labelled dishes, but no reliable region-specific count. |
| Africa | One West African-inspired jollof-style rice and fish recipe added. |
| South Asia | One South Asian-inspired chickpea curry added. |
| East Asia | One Korean-inspired rice bowl added, plus two broadly “Asian” entries; China, Japan, and other cuisines are not specifically covered. |
| Southeast Asia | No specifically labelled recipe. |
| Oceania | No representative recipe. |

The three additions use “inspired” labels for adaptations and are not presented as definitive or authentic versions. Additional regional recipes should be added only with reviewed ingredient quantities, instructions, dietary/allergen metadata, and a fitting image.

## Duplicate and overlap review

There are no repeated recipe IDs or exact titles. A screening comparison of normalized, non-optional ingredient sets at Jaccard similarity **≥ 0.45** flagged 34 pairs for possible overlap. This intentionally broad heuristic overcounts shared pantry ingredients and does not consider cooking method or meal role, so a flagged pair is not a confirmed near-duplicate. Examples include:

- *Garlicky Chickpea & Spinach Bowl* and *Crunchy Stovetop Garlic Chickpeas* — related ingredients, but a bowl meal versus a crisp snack.
- *Custardy Golden French Toast* and *Classic Buttered Cinnamon Sugar Toast* — bread-based, but different preparations.
- *Crispy Buttered Grilled Cheese* and *Melted Cheddar Egg Brioche Toast* — overlapping bread and cheese ingredients, with different recipes.

These are review candidates, not confirmed duplicates.

## Image and scope limitations

Every recipe ID currently has a URL mapping to an image hosted by Unsplash. This verifies mapping coverage, not uninterrupted image availability or rights metadata beyond the provider's published usage terms. Images are loaded remotely and may fail offline or be changed by the provider.

The catalog is a small, manually curated starter collection with uneven regional, meal-type, and difficulty coverage. It cannot represent all dishes in the world; the cuisine and region labels are intentionally modest and should continue to expand through reviewed additions.
