// Ingredient normalization and synonym mapping
const SYNONYMS: Record<string, string> = {
  // Allium
  'onions': 'onion',
  'yellow onion': 'onion',
  'red onion': 'onion',
  'white onion': 'onion',
  'shallots': 'shallot',
  'scallions': 'green onion',
  'spring onions': 'green onion',
  'garlic clove': 'garlic',
  'garlic cloves': 'garlic',
  'minced garlic': 'garlic',
  
  // Dairy / Eggs
  'large eggs': 'egg',
  'large egg': 'egg',
  'eggs': 'egg',
  'egg whites': 'egg',
  'unsalted butter': 'butter',
  'salted butter': 'butter',
  'whole milk': 'milk',
  'skim milk': 'milk',
  'heavy whipping cream': 'heavy cream',
  'sour cream': 'sour cream',
  'parmesan cheese': 'parmesan',
  'shredded cheddar': 'cheddar cheese',
  'cheddar': 'cheddar cheese',
  'mozzarella cheese': 'mozzarella',

  // Pantry / Oils
  'extra virgin olive oil': 'olive oil',
  'virgin olive oil': 'olive oil',
  'vegetable oil': 'cooking oil',
  'canola oil': 'cooking oil',
  'sea salt': 'salt',
  'kosher salt': 'salt',
  'table salt': 'salt',
  'black pepper': 'pepper',
  'ground black pepper': 'pepper',
  'granulated sugar': 'sugar',
  'white sugar': 'sugar',
  'brown sugar': 'sugar',
  'all-purpose flour': 'flour',
  'plain flour': 'flour',
  'bread flour': 'flour',
  'baking soda': 'baking soda',
  'baking powder': 'baking powder',
  'pure vanilla extract': 'vanilla extract',
  'vanilla': 'vanilla extract',
  'soy sauce': 'soy sauce',
  'tamari': 'soy sauce',

  // Produce
  'roma tomatoes': 'tomato',
  'roma tomato': 'tomato',
  'cherry tomatoes': 'tomato',
  'tomatoes': 'tomato',
  'russet potatoes': 'potato',
  'russet potato': 'potato',
  'baby potatoes': 'potato',
  'potatoes': 'potato',
  'sweet potatoes': 'sweet potato',
  'carrots': 'carrot',
  'baby carrots': 'carrot',
  'bell peppers': 'bell pepper',
  'red bell pepper': 'bell pepper',
  'green bell pepper': 'bell pepper',
  'yellow bell pepper': 'bell pepper',
  'baby spinach': 'spinach',
  'fresh spinach': 'spinach',
  'avocados': 'avocado',
  'ripe avocado': 'avocado',
  'lemons': 'lemon',
  'fresh lemon juice': 'lemon',
  'limes': 'lime',
  'fresh lime juice': 'lime',
  'bananas': 'banana',
  'ripe bananas': 'banana',
  'apples': 'apple',
  'fresh cilantro': 'cilantro',
  'fresh basil': 'basil',
  'fresh parsley': 'parsley',

  // Proteins
  'boneless skinless chicken breasts': 'chicken breast',
  'boneless chicken breast': 'chicken breast',
  'chicken breasts': 'chicken breast',
  'chicken thighs': 'chicken thigh',
  'ground chuck': 'ground beef',
  'lean ground beef': 'ground beef',
  'ground turkey': 'ground turkey',
  'canned tuna': 'tuna',
  'tuna fish': 'tuna',
  'firm tofu': 'tofu',
  'extra firm tofu': 'tofu',
  'bacon strips': 'bacon',

  // Grains / Legumes / Pasta
  'spaghetti pasta': 'pasta',
  'fettuccine': 'pasta',
  'penne pasta': 'pasta',
  'penne': 'pasta',
  'macaroni': 'pasta',
  'jasmine rice': 'rice',
  'basmati rice': 'rice',
  'white rice': 'rice',
  'brown rice': 'rice',
  'rolled oats': 'oats',
  'old fashioned oats': 'oats',
  'rolled oat': 'oats',
  'canned black beans': 'black beans',
  'black bean': 'black beans',
  'canned chickpeas': 'chickpeas',
  'garbanzo beans': 'chickpeas',
  'chick pea': 'chickpeas',
  'sliced bread': 'bread',
  'sandwich bread': 'bread',
  'sourdough bread': 'bread',
};

/**
 * Normalizes an ingredient name into its base singular form and resolves synonyms.
 */
export function normalizeIngredient(input: string): string {
  if (!input) return '';
  let str = input.toLowerCase().trim();
  
  // Remove common quantity or preparation notes in parentheses
  str = str.replace(/\([^)]*\)/g, '').trim();
  // Remove punctuation
  str = str.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();

  // Check direct synonym match
  if (SYNONYMS[str]) {
    return SYNONYMS[str];
  }

  // Check prefix or partial phrase synonym
  for (const [key, replacement] of Object.entries(SYNONYMS)) {
    if (str === key || str.startsWith(key + ' ') || str.endsWith(' ' + key)) {
      return replacement;
    }
  }

  // Basic plural stripping
  if (str.endsWith('ies')) {
    const candidate = str.slice(0, -3) + 'y';
    return candidate;
  }
  if (str.endsWith('es') && !str.endsWith('ches') && !str.endsWith('shes')) {
    // e.g. tomatoes -> tomato
    if (str === 'tomatoes') return 'tomato';
    if (str === 'potatoes') return 'potato';
  }
  if (str.endsWith('s') && !str.endsWith('ss') && !str.endsWith('us') && !str.endsWith('is')) {
    const candidate = str.slice(0, -1);
    if (SYNONYMS[candidate]) return SYNONYMS[candidate];
    return candidate;
  }

  return str;
}

/**
 * Check if a recipe ingredient is matched by any user pantry item
 */
export function isIngredientMatched(recipeIngNormalized: string, userIngNormalizedList: string[]): boolean {
  if (userIngNormalizedList.includes(recipeIngNormalized)) {
    return true;
  }
  
  // Partial substring match in either direction
  for (const userIng of userIngNormalizedList) {
    if (
      userIng === recipeIngNormalized ||
      (userIng.length >= 3 && recipeIngNormalized.includes(userIng)) ||
      (recipeIngNormalized.length >= 3 && userIng.includes(recipeIngNormalized))
    ) {
      return true;
    }
  }
  return false;
}

export const COMMON_SUGGESTIONS: { name: string; category: string }[] = [
  { name: 'Eggs', category: 'Dairy & Eggs' },
  { name: 'Butter', category: 'Dairy & Eggs' },
  { name: 'Milk', category: 'Dairy & Eggs' },
  { name: 'Cheddar Cheese', category: 'Dairy & Eggs' },
  { name: 'Parmesan', category: 'Dairy & Eggs' },
  { name: 'Garlic', category: 'Produce' },
  { name: 'Onion', category: 'Produce' },
  { name: 'Tomato', category: 'Produce' },
  { name: 'Potato', category: 'Produce' },
  { name: 'Spinach', category: 'Produce' },
  { name: 'Lemon', category: 'Produce' },
  { name: 'Bell Pepper', category: 'Produce' },
  { name: 'Rice', category: 'Grains & Pasta' },
  { name: 'Pasta', category: 'Grains & Pasta' },
  { name: 'Bread', category: 'Grains & Pasta' },
  { name: 'Oats', category: 'Grains & Pasta' },
  { name: 'Flour', category: 'Baking & Pantry' },
  { name: 'Olive Oil', category: 'Baking & Pantry' },
  { name: 'Soy Sauce', category: 'Baking & Pantry' },
  { name: 'Sugar', category: 'Baking & Pantry' },
  { name: 'Chicken Breast', category: 'Meat & Seafood' },
  { name: 'Ground Beef', category: 'Meat & Seafood' },
  { name: 'Canned Tuna', category: 'Meat & Seafood' },
  { name: 'Bacon', category: 'Meat & Seafood' },
  { name: 'Black Beans', category: 'Canned & Legumes' },
  { name: 'Chickpeas', category: 'Canned & Legumes' },
];
