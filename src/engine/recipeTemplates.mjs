// Single source of truth for composed home-recipe wording.
// Imported by BOTH scripts/generate-catalog.mjs (Node) and src/engine/hydrate.ts
// (Metro), so a hosted "card" can carry just { tech, sauce, protein, carb, veg }
// and the app rebuilds blurb + ingredients + method on demand.
//
// Plain ESM, no types, no RN/Node-only deps.

export const CARB_LINE = {
  rice: 'rice, to serve',
  noodles: '2 nests noodles',
  potato: '800g potatoes',
  grains: '250g couscous or mixed grains',
  bread: '4 flatbreads or wraps',
  pasta: '350g pasta',
  none: 'a green salad, to serve',
  salad: 'mixed salad leaves',
};
export const CARB_SHORT = {
  rice: 'rice', noodles: 'noodles', potato: 'potatoes', grains: 'couscous or grains',
  bread: 'flatbreads', pasta: 'pasta', none: 'a green salad', salad: 'a leafy salad',
};

export const VEG = [
  'red peppers', 'red onion', 'courgette', 'baby spinach', 'tenderstem broccoli', 'green beans',
  'cherry tomatoes', 'peas', 'kale', 'pak choi', 'mangetout', 'butternut squash', 'chestnut mushrooms',
  'sugar snap peas', 'chard', 'leeks', 'fennel', 'sweetcorn', 'aubergine', 'carrots',
];

// ---- proteins: keyed, with enum + diet + shopping-list line -----------
export const PROTEINS = {
  'chicken-thigh': { word: 'Chicken Thigh', key: 'chicken', diet: [], qty: '600g boneless chicken thighs' },
  'chicken-breast': { word: 'Chicken Breast', key: 'chicken', diet: [], qty: '4 chicken breasts' },
  chicken: { word: 'Chicken', key: 'chicken', diet: [], qty: '600g diced chicken' },
  beef: { word: 'Beef', key: 'beef', diet: [], qty: '600g diced braising beef' },
  'beef-mince': { word: 'Beef Mince', key: 'beef', diet: [], qty: '500g beef mince' },
  steak: { word: 'Steak', key: 'beef', diet: [], qty: '2 sirloin steaks' },
  pork: { word: 'Pork', key: 'pork', diet: [], qty: '600g diced pork shoulder' },
  'pork-loin': { word: 'Pork Loin', key: 'pork', diet: [], qty: '4 pork loin steaks' },
  sausage: { word: 'Sausage', key: 'pork', diet: [], qty: '8 good sausages' },
  lamb: { word: 'Lamb', key: 'lamb', diet: [], qty: '600g diced lamb shoulder' },
  'lamb-mince': { word: 'Lamb Mince', key: 'lamb', diet: [], qty: '500g lamb mince' },
  salmon: { word: 'Salmon', key: 'fish', diet: ['pescatarian'], qty: '4 salmon fillets' },
  cod: { word: 'Cod', key: 'fish', diet: ['pescatarian'], qty: '4 cod fillets' },
  haddock: { word: 'Haddock', key: 'fish', diet: ['pescatarian'], qty: '4 haddock fillets' },
  'sea-bass': { word: 'Sea Bass', key: 'fish', diet: ['pescatarian'], qty: '4 sea bass fillets' },
  prawn: { word: 'King Prawn', key: 'seafood', diet: ['pescatarian'], qty: '400g raw king prawns' },
  halloumi: { word: 'Halloumi', key: 'veggie', diet: ['vegetarian'], qty: '450g halloumi, sliced' },
  paneer: { word: 'Paneer', key: 'veggie', diet: ['vegetarian'], qty: '450g paneer, cubed' },
  tofu: { word: 'Tofu', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free'], qty: '560g firm tofu, cubed' },
  chickpea: { word: 'Chickpea', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '2 tins chickpeas, drained' },
  butterbean: { word: 'Butter Bean', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '2 tins butter beans, drained' },
  lentil: { word: 'Lentil', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '250g green lentils' },
  mushroom: { word: 'Mushroom', key: 'veggie', diet: ['vegetarian', 'vegan', 'dairy-free'], qty: '600g mixed mushrooms, torn' },
  cauliflower: { word: 'Cauliflower', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '1 large cauliflower, in florets' },
  aubergine: { word: 'Aubergine', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '3 aubergines, cubed' },
  'sweet-potato': { word: 'Sweet Potato', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '4 large sweet potatoes, cubed' },
  turkey: { word: 'Turkey Mince', key: 'chicken', diet: [], qty: '500g turkey mince' },
  duck: { word: 'Duck', key: 'mixed', diet: [], qty: '4 duck legs' },
  gammon: { word: 'Gammon', key: 'pork', diet: [], qty: '4 gammon steaks' },
  mackerel: { word: 'Mackerel', key: 'fish', diet: ['pescatarian'], qty: '4 mackerel fillets' },
  trout: { word: 'Trout', key: 'fish', diet: ['pescatarian'], qty: '4 trout fillets' },
  hake: { word: 'Hake', key: 'fish', diet: ['pescatarian'], qty: '4 hake fillets' },
  squid: { word: 'Squid', key: 'seafood', diet: ['pescatarian'], qty: '500g squid, cleaned and sliced' },
  scallop: { word: 'Scallop', key: 'seafood', diet: ['pescatarian'], qty: '20 king scallops' },
  tempeh: { word: 'Tempeh', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free'], qty: '400g tempeh, sliced' },
  jackfruit: { word: 'Jackfruit', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '2 tins young jackfruit, drained' },
  'black-bean': { word: 'Black Bean', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '2 tins black beans, drained' },
  egg: { word: 'Egg', key: 'egg', diet: ['vegetarian'], qty: '8 eggs' },
  squash: { word: 'Butternut Squash', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '1 large butternut squash, cubed' },
};

// ---- sauces: keyed, with cuisine + spice + tags + ingredient lines ----
const S = (word, cuisine, spicy, ing, tags = []) => ({ word, cuisine, spicy, ing, tags });
export const SAUCES = {
  harissa: S('Harissa', 'middle-eastern', 2, ['2 tbsp rose harissa', '1 lemon', 'a drizzle of honey'], ['smoky']),
  zaatar: S("Za'atar", 'middle-eastern', 0, ["2 tbsp za'atar", 'olive oil', '1 lemon'], ['herby', 'fresh']),
  'sumac-lemon': S('Sumac & Lemon', 'middle-eastern', 0, ['1 tbsp sumac', '2 lemons', 'olive oil', 'parsley'], ['zesty', 'fresh']),
  'ras-el-hanout': S('Ras el Hanout', 'middle-eastern', 1, ['2 tbsp ras el hanout', '1 tbsp tomato purée', 'a little stock']),
  'pomegranate-walnut': S('Pomegranate & Walnut', 'middle-eastern', 0, ['3 tbsp pomegranate molasses', '60g walnuts', '1 onion'], ['zesty']),
  baharat: S('Baharat', 'middle-eastern', 1, ['2 tbsp baharat', '1 tbsp tomato purée', 'a squeeze of lemon']),
  'preserved-lemon-olive': S('Preserved Lemon & Olive', 'middle-eastern', 0, ['1 preserved lemon, chopped', '80g green olives', '1 tsp ground ginger'], ['zesty']),
  'tikka-masala': S('Tikka Masala', 'indian', 2, ['3 tbsp tikka curry paste', '200g passata', '4 tbsp cream or yoghurt']),
  korma: S('Korma', 'indian', 1, ['3 tbsp korma paste', '100ml coconut milk', '2 tbsp ground almonds']),
  jalfrezi: S('Jalfrezi', 'indian', 3, ['3 tbsp jalfrezi paste', '2 peppers', '3 green chillies']),
  madras: S('Madras', 'indian', 3, ['3 tbsp madras paste', '400g chopped tomatoes', '1 tsp mustard seeds']),
  'rogan-josh': S('Rogan Josh', 'indian', 2, ['3 tbsp rogan josh paste', '150g yoghurt', '4 cardamom pods']),
  bhuna: S('Bhuna', 'indian', 2, ['3 tbsp bhuna paste', '3 tomatoes', '2 tbsp ginger-garlic paste']),
  balti: S('Balti', 'indian', 2, ['3 tbsp balti paste', '2 peppers', 'fresh coriander']),
  saag: S('Saag', 'indian', 2, ['300g spinach, blitzed', '2 tbsp curry powder', '2 tbsp ginger-garlic paste']),
  'coconut-dhansak': S('Coconut Dhansak', 'indian', 2, ['3 tbsp curry paste', '100g red lentils', '200ml coconut milk']),
  'butter-masala': S('Butter Masala', 'indian', 1, ['200g passata', '50g butter', '100ml double cream', '1 tsp garam masala'], ['indulgent']),
  tandoori: S('Tandoori', 'indian', 2, ['3 tbsp tandoori paste', '150g yoghurt', '1 lemon'], ['smoky']),
  katsu: S('Katsu Curry', 'east-asian', 1, ['1 tbsp mild curry powder', '1 tbsp flour', '400ml stock', '1 tsp honey']),
  teriyaki: S('Teriyaki', 'east-asian', 0, ['3 tbsp soy sauce', '2 tbsp mirin', '1 tbsp honey', '1 tsp grated ginger']),
  miso: S('Miso', 'east-asian', 0, ['2 tbsp white miso', '1 tbsp mirin', '20g butter'], ['savoury']),
  gochujang: S('Gochujang', 'east-asian', 2, ['2 tbsp gochujang', '1 tbsp soy sauce', '1 tbsp maple syrup']),
  'black-bean': S('Black Bean', 'east-asian', 1, ['2 tbsp fermented black beans', '2 garlic cloves', '1 tbsp soy sauce'], ['savoury']),
  'sweet-sour': S('Sweet & Sour', 'east-asian', 0, ['3 tbsp rice vinegar', '2 tbsp ketchup', '2 tbsp sugar', '100g pineapple']),
  'kung-pao': S('Kung Pao', 'east-asian', 3, ['2 dried chillies', '1 tbsp Sichuan pepper', '40g peanuts', '2 tbsp soy sauce']),
  'sichuan-chilli': S('Sichuan Chilli', 'east-asian', 3, ['1 tbsp chilli bean paste', '1 tsp Sichuan pepper', '2 tbsp soy sauce']),
  'sticky-soy-ginger': S('Sticky Soy & Ginger', 'east-asian', 0, ['4 tbsp soy sauce', '1 thumb ginger', '2 tbsp honey', '2 garlic cloves']),
  'sesame-ginger': S('Sesame & Ginger', 'east-asian', 0, ['2 tbsp sesame oil', '1 thumb ginger', '2 tbsp soy sauce', '1 tbsp sesame seeds'], ['fresh']),
  hoisin: S('Hoisin', 'east-asian', 0, ['4 tbsp hoisin sauce', '1 tbsp rice vinegar', '2 spring onions']),
  oyster: S('Oyster Sauce', 'east-asian', 0, ['3 tbsp oyster sauce', '1 tbsp soy sauce', '1 tsp sugar'], ['savoury']),
  satay: S('Satay', 'east-asian', 1, ['4 tbsp peanut butter', '200ml coconut milk', '1 tbsp soy sauce', '1 lime']),
  'thai-green': S('Thai Green', 'east-asian', 2, ['3 tbsp green curry paste', '400ml coconut milk', 'Thai basil', '1 lime']),
  'thai-red': S('Thai Red', 'east-asian', 2, ['3 tbsp red curry paste', '400ml coconut milk', '2 lime leaves', '1 tbsp fish sauce']),
  panang: S('Panang', 'east-asian', 2, ['3 tbsp panang paste', '300ml coconut milk', '2 tbsp peanut butter', '2 lime leaves']),
  massaman: S('Massaman', 'east-asian', 1, ['3 tbsp massaman paste', '400ml coconut milk', '40g peanuts', '1 cinnamon stick']),
  'lemongrass-lime': S('Lemongrass & Lime', 'east-asian', 1, ['2 lemongrass stalks', '2 limes', '1 tbsp fish sauce', '1 red chilli'], ['zesty', 'fresh']),
  'coconut-lime': S('Coconut & Lime', 'east-asian', 1, ['200ml coconut milk', '2 limes', '1 tbsp grated ginger', 'coriander'], ['fresh']),
  'sweet-chilli': S('Sweet Chilli', 'east-asian', 1, ['4 tbsp sweet chilli sauce', '1 tbsp soy sauce', '1 lime']),
  'char-siu': S('Char Siu', 'east-asian', 0, ['3 tbsp hoisin', '1 tbsp honey', '1 tbsp soy sauce', '1 tsp five-spice']),
  'peri-peri': S('Peri Peri', 'other', 2, ['3 tbsp peri peri sauce', '1 lemon', '3 garlic cloves', '1 tsp smoked paprika'], ['smoky']),
  jerk: S('Jerk', 'caribbean', 3, ['3 tbsp jerk marinade', '1 tsp thyme', '2 spring onions', '1 lime'], ['smoky']),
  'caribbean-curry': S('Caribbean Curry', 'caribbean', 2, ['2 tbsp Caribbean curry powder', '1 scotch bonnet', 'thyme', '2 tbsp ginger-garlic']),
  chimichurri: S('Chimichurri', 'other', 1, ['big bunch parsley', '2 tbsp red wine vinegar', '2 garlic cloves', '1/2 tsp chilli flakes'], ['herby', 'zesty', 'fresh']),
  'salsa-verde': S('Salsa Verde', 'italian', 0, ['big bunch parsley and mint', '1 tbsp capers', '2 anchovies', '1 tbsp red wine vinegar'], ['herby', 'fresh']),
  romesco: S('Romesco', 'med', 1, ['2 roasted red peppers', '40g almonds', '1 tsp smoked paprika', '1 tbsp sherry vinegar'], ['smoky']),
  salmoriglio: S('Salmoriglio', 'med', 0, ['big bunch oregano', '2 lemons', '3 garlic cloves', 'olive oil'], ['herby', 'zesty', 'fresh']),
  'lemon-garlic': S('Lemon & Garlic', 'med', 0, ['2 lemons', '4 garlic cloves', 'olive oil', 'parsley'], ['zesty', 'fresh']),
  'saffron-tomato': S('Saffron & Tomato', 'med', 0, ['pinch of saffron', '400g chopped tomatoes', '1 onion', '125ml white wine']),
  puttanesca: S('Puttanesca', 'italian', 1, ['400g chopped tomatoes', '80g black olives', '2 tbsp capers', '4 anchovies']),
  arrabbiata: S('Arrabbiata', 'italian', 2, ['400g chopped tomatoes', '4 garlic cloves', '1 tsp chilli flakes', 'basil']),
  'tomato-basil': S('Tomato & Basil', 'italian', 0, ['400g chopped tomatoes', '3 garlic cloves', 'big handful basil', '1 tsp sugar']),
  nduja: S('Nduja', 'italian', 2, ['60g nduja', '200g passata', '2 garlic cloves'], ['smoky', 'indulgent']),
  pesto: S('Pesto', 'italian', 0, ['4 tbsp basil pesto', '30g Parmesan', '30g pine nuts'], ['herby', 'fresh']),
  'lemon-caper-butter': S('Lemon & Caper Butter', 'italian', 0, ['60g butter', '2 tbsp capers', '2 lemons', 'parsley'], ['zesty']),
  'creamy-garlic-mushroom': S('Creamy Garlic Mushroom', 'french', 0, ['250g mushrooms', '150ml double cream', '3 garlic cloves', 'thyme'], ['savoury', 'indulgent']),
  'mustard-cream': S('Mustard Cream', 'french', 0, ['2 tbsp wholegrain mustard', '150ml crème fraîche', '100ml white wine'], ['indulgent']),
  peppercorn: S('Peppercorn', 'french', 0, ['1 tbsp crushed peppercorns', '150ml double cream', '50ml brandy', '1 shallot'], ['indulgent']),
  diane: S('Diane', 'french', 0, ['150g mushrooms', '1 tbsp Worcestershire sauce', '50ml brandy', '150ml cream', '1 tsp Dijon'], ['indulgent']),
  'garlic-butter': S('Garlic Butter', 'french', 0, ['60g butter', '4 garlic cloves', 'parsley', '1/2 lemon'], ['indulgent']),
  'white-wine-herb': S('White Wine & Herb', 'french', 0, ['150ml white wine', 'big bunch tarragon and parsley', '20g butter', '1 shallot'], ['herby', 'fresh']),
  'tarragon-cream': S('Tarragon Cream', 'french', 0, ['big bunch tarragon', '150ml crème fraîche', '100ml white wine', '1 shallot'], ['herby', 'indulgent']),
  cajun: S('Cajun', 'american', 2, ['2 tbsp Cajun seasoning', '1 tsp smoked paprika', '1 lemon'], ['smoky']),
  blackened: S('Blackened', 'american', 2, ['2 tbsp blackening spice', '30g melted butter', '1 lime'], ['smoky']),
  bbq: S('BBQ', 'american', 1, ['150ml barbecue sauce', '1 tbsp smoked paprika', '1 tbsp cider vinegar'], ['smoky']),
  buffalo: S('Buffalo', 'american', 2, ['4 tbsp hot sauce', '30g melted butter', '1 tsp garlic granules']),
  'honey-mustard': S('Honey Mustard', 'american', 0, ['3 tbsp honey', '2 tbsp Dijon mustard', '1 tbsp cider vinegar']),
  'maple-bacon': S('Maple & Bacon', 'american', 0, ['3 tbsp maple syrup', '100g bacon lardons', '1 tsp Dijon'], ['smoky', 'indulgent']),
  chipotle: S('Chipotle', 'mexican', 2, ['2 tbsp chipotle paste', '400g chopped tomatoes', '1 tsp cumin', '1 lime'], ['smoky']),
  'chilli-lime': S('Chilli-Lime', 'mexican', 2, ['2 limes', '1 tsp chilli powder', '1 tsp cumin', 'coriander'], ['zesty', 'fresh']),
  'fajita-spiced': S('Fajita-Spiced', 'mexican', 1, ['2 tbsp fajita seasoning', '2 peppers', '1 onion', '1 lime']),
  mole: S('Mole', 'mexican', 2, ['3 tbsp mole paste', '20g dark chocolate', '400g chopped tomatoes', '1 tsp cinnamon']),
  'salsa-roja': S('Salsa Roja', 'mexican', 2, ['3 tomatoes', '2 chipotles', '1 onion', '1 tsp oregano'], ['smoky']),
  'green-goddess': S('Green Goddess', 'american', 0, ['big bunch basil, parsley and chives', '3 tbsp yoghurt', '1 tbsp lemon juice', '1 anchovy'], ['herby', 'fresh']),
  tzatziki: S('Tzatziki', 'med', 0, ['200g Greek yoghurt', '1/2 cucumber, grated', '1 garlic clove', 'dill and mint'], ['fresh']),
  chermoula: S('Chermoula', 'middle-eastern', 1, ['big bunch coriander and parsley', '1 tsp cumin', '1 tsp paprika', '2 lemons'], ['herby', 'zesty']),
  tahini: S('Lemon Tahini', 'middle-eastern', 0, ['4 tbsp tahini', '2 lemons', '1 garlic clove', 'warm water to loosen'], ['fresh']),
  'harissa-yoghurt': S('Harissa Yoghurt', 'middle-eastern', 2, ['2 tbsp rose harissa', '150g yoghurt', '1 lemon'], ['smoky']),
  bulgogi: S('Bulgogi', 'east-asian', 1, ['4 tbsp soy sauce', '2 tbsp brown sugar', '1 pear, grated', '1 tbsp sesame oil']),
  ponzu: S('Ponzu', 'east-asian', 0, ['4 tbsp ponzu', '1 tbsp mirin', '1 tsp grated ginger', 'spring onion'], ['zesty', 'fresh']),
  'nam-jim': S('Nam Jim', 'east-asian', 3, ['2 tbsp fish sauce', '2 limes', '2 bird\'s eye chillies', '1 tbsp palm sugar', 'coriander'], ['zesty', 'fresh']),
  tonkatsu: S('Tonkatsu', 'east-asian', 0, ['5 tbsp tonkatsu sauce', '1 tsp Worcestershire sauce', 'panko to crumb']),
  'xo': S('XO', 'east-asian', 2, ['3 tbsp XO sauce', '1 tbsp soy sauce', '2 spring onions'], ['savoury', 'smoky']),
  doubanjiang: S('Doubanjiang', 'east-asian', 3, ['2 tbsp chilli bean paste', '1 tbsp fermented black beans', '2 garlic cloves'], ['savoury']),
  'salsa-macha': S('Salsa Macha', 'mexican', 3, ['4 tbsp salsa macha', '40g peanuts', '1 tbsp sesame seeds'], ['smoky']),
  'aji-verde': S('Aji Verde', 'other', 2, ['big bunch coriander', '2 jalapeños', '3 tbsp mayo', '1 lime'], ['herby', 'zesty']),
  mojo: S('Mojo', 'caribbean', 1, ['6 garlic cloves', '1 tsp cumin', '3 sour oranges (or lime + orange)', 'oregano'], ['zesty', 'herby']),
  sofrito: S('Sofrito', 'caribbean', 1, ['1 onion, 1 pepper, 4 garlic cloves, blitzed', '2 tbsp tomato purée', '1 tsp oregano']),
  marsala: S('Marsala', 'italian', 0, ['150ml Marsala', '150g mushrooms', '150ml chicken stock', '20g butter'], ['savoury', 'indulgent']),
  madeira: S('Madeira', 'french', 0, ['100ml Madeira', '200ml beef stock', '1 shallot', '20g butter'], ['savoury', 'indulgent']),
  'red-wine-shallot': S('Red Wine & Shallot', 'french', 0, ['200ml red wine', '3 shallots', '200ml beef stock', '20g butter'], ['savoury', 'indulgent']),
  chasseur: S('Chasseur', 'french', 0, ['150g mushrooms', '2 tomatoes', '100ml white wine', 'tarragon'], ['savoury']),
  provencal: S('Provençal', 'french', 0, ['400g chopped tomatoes', '80g olives', '3 garlic cloves', 'herbes de Provence'], ['herby']),
  'blue-cheese': S('Blue Cheese', 'french', 0, ['80g blue cheese', '150ml double cream', '1 shallot'], ['indulgent']),
  'cheddar-mustard': S('Cheddar & Mustard', 'british', 0, ['100g mature cheddar', '1 tbsp English mustard', '200ml milk', '20g butter, 20g flour'], ['indulgent', 'comforting']),
  'cider-cream': S('Cider Cream', 'french', 0, ['200ml dry cider', '150ml crème fraîche', '1 tsp Dijon', '1 apple'], ['indulgent']),
  'brown-butter-sage': S('Brown Butter & Sage', 'italian', 0, ['80g butter', 'big handful sage', '1/2 lemon', '30g Parmesan'], ['indulgent']),
  gremolata: S('Gremolata', 'italian', 0, ['big bunch parsley', 'zest of 2 lemons', '3 garlic cloves', 'olive oil'], ['herby', 'zesty', 'fresh']),
  carbonara: S('Carbonara', 'italian', 0, ['100g pancetta', '3 egg yolks', '50g pecorino', 'lots of black pepper'], ['indulgent']),
  'lemon-herb-butter': S('Lemon & Herb Butter', 'french', 0, ['60g butter', '2 lemons', 'big bunch parsley, dill and chives'], ['zesty', 'herby', 'fresh']),
  'piri-lemon': S('Piri Lemon', 'other', 2, ['3 tbsp piri piri sauce', '2 lemons', '4 garlic cloves'], ['smoky', 'zesty']),
  'ginger-scallion': S('Ginger & Scallion', 'east-asian', 0, ['1 thumb ginger', '6 spring onions', '4 tbsp neutral oil, heated', '1 tbsp soy sauce'], ['fresh']),
  'black-pepper': S('Black Pepper', 'east-asian', 1, ['1 tbsp coarse black pepper', '3 tbsp oyster sauce', '1 tbsp soy sauce', '20g butter'], ['savoury']),
  vindaloo: S('Vindaloo', 'indian', 3, ['3 tbsp vindaloo paste', '2 tbsp cider vinegar', '1 tsp sugar', '4 garlic cloves']),
  dopiaza: S('Dopiaza', 'indian', 2, ['3 tbsp curry paste', '4 onions', '3 tomatoes', '1 tsp garam masala']),
  methi: S('Methi', 'indian', 2, ['3 tbsp curry paste', '3 tbsp dried fenugreek leaves', '150g yoghurt', '2 tomatoes']),
  achari: S('Achari', 'indian', 2, ['3 tbsp achari paste', '1 tsp nigella seeds', '1 tsp mustard seeds', '150g yoghurt'], ['zesty']),
};

// ---- techniques: keyed, with method builder --------------------------
const M = (o) => o;
export const TECHNIQUES = {
  traybake: M({
    word: 'Traybake', mins: 40, effort: 'quick', onePan: true, richness: 'hearty', format: 'plate', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Heat the oven to 200C fan. Tip the ${p}, ${v} and ${s} into a large roasting tin with oil and seasoning and toss.`,
      `Roast for 30-35 minutes, turning once, until the ${p.toLowerCase()} is cooked through and everything is golden at the edges.`,
      `Serve straight from the tin with ${c}.`] }),
  skillet: M({
    word: 'Skillet', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Fry the ${p.toLowerCase()} in a large skillet over medium-high heat until browned all over.`,
      `Add the ${v}, then stir in the ${s} with a splash of water and simmer for 8-10 minutes until the sauce clings.`,
      `Check the seasoning and serve with ${c}.`] }),
  stirfry: M({
    word: 'Stir-Fry', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Get a wok smoking hot. Stir-fry the ${p.toLowerCase()} for 3-4 minutes until seared, then lift out.`,
      `Stir-fry the ${v} for 2 minutes, return the ${p.toLowerCase()}, pour in the ${s} and toss for 1 minute until glossy.`,
      `Pile onto ${c}.`] }),
  curry: M({
    word: 'Curry', mins: 40, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Fry a chopped onion until soft, then add the ${s} and cook out for 2 minutes.`,
      `Add the ${p.toLowerCase()} and ${v}, loosen with stock or coconut milk, and simmer for 20-25 minutes.`,
      `Season, scatter with fresh herbs and serve with ${c}.`] }),
  stew: M({
    word: 'Stew', mins: 100, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Brown the ${p.toLowerCase()} in a heavy pot, then soften a diced onion, carrot and celery.`,
      `Return the ${p.toLowerCase()} with the ${s} and enough stock to cover, then cover and simmer gently for 1.5 hours.`,
      `Stir in the ${v} for the last 15 minutes and serve with ${c}.`] }),
  soup: M({
    word: 'Soup', mins: 40, effort: 'quick', onePan: true, richness: 'medium', format: 'soup', mood: ['comfort', 'healthy'],
    method: (p, s, c, v) => [
      `Soften a chopped onion, then add the ${s} and cook for a minute.`,
      `Add the ${p.toLowerCase()}, ${v} and 1.2 litres of stock and simmer for 20-25 minutes.`,
      `Blend to your liking or leave it chunky, then serve with ${c}.`] }),
  grill: M({
    word: 'Skewers', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort', 'healthy'],
    method: (p, s, c, v) => [
      `Toss the ${p.toLowerCase()} in the ${s} and leave to marinate for at least 20 minutes.`,
      `Thread onto skewers with the ${v} and grill or griddle for 10-12 minutes, turning, until charred and cooked.`,
      `Rest briefly and serve with ${c}.`] }),
  roast: M({
    word: 'Roast', mins: 75, effort: 'medium', onePan: false, richness: 'hearty', format: 'plate', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Heat the oven to 190C fan. Rub the ${p.toLowerCase()} all over with the ${s}, oil and seasoning.`,
      `Roast for 45-60 minutes, basting once, until deep golden and cooked through; roast the ${v} alongside.`,
      `Rest, then carve and serve with ${c}.`] }),
  panfry: M({
    word: 'with Pan Sauce', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Season the ${p.toLowerCase()} well and fry in a hot pan with a little oil for 3-4 minutes each side.`,
      `Lift out to rest, add the ${s} to the pan and let it bubble into a sauce, then return the ${p.toLowerCase()} to coat.`,
      `Serve with the ${v} and ${c}.`] }),
  salad: M({
    word: 'Salad', mins: 20, effort: 'quick', onePan: false, richness: 'light', format: 'salad', mood: ['fresh', 'light', 'healthy'],
    method: (p, s, c, v) => [
      `Cook or griddle the ${p.toLowerCase()} and let it cool a little.`,
      `Whisk the ${s} into a dressing and toss through the ${v} and leaves.`,
      `Top with the ${p.toLowerCase()} and serve with ${c}.`] }),
  bowl: M({
    word: 'Bowl', mins: 25, effort: 'quick', onePan: false, richness: 'medium', format: 'bowl', mood: ['healthy', 'comfort'],
    method: (p, s, c, v) => [
      `Cook the ${c} and divide between bowls.`,
      `Cook the ${p.toLowerCase()} with the ${s} until glazed and just done, adding the ${v} to wilt or char.`,
      `Spoon over the bowls with any extra dressing and a scatter of seeds or herbs.`] }),
  pasta: M({
    word: 'Pasta', mins: 25, effort: 'quick', onePan: false, richness: 'medium', format: 'bowl', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Cook the pasta in well-salted water until al dente, saving a mug of the cooking water.`,
      `Make the ${s} sauce in a wide pan with the ${p.toLowerCase()} and ${v}.`,
      `Toss the drained pasta through with a splash of the water until everything is coated; finish with Parmesan.`] }),
  bake: M({
    word: 'Bake', mins: 50, effort: 'medium', onePan: false, richness: 'hearty', format: 'plate', mood: ['comfort', 'indulgent'],
    method: (p, s, c, v) => [
      `Heat the oven to 190C fan. Layer the ${p.toLowerCase()}, ${v} and ${s} in a baking dish.`,
      `Top with cheese or breadcrumbs and bake for 30-35 minutes until bubbling and golden.`,
      `Rest for 5 minutes, then serve with ${c}.`] }),
  noodles: M({
    word: 'Noodles', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Cook the noodles to packet instructions, then drain and toss with a little oil.`,
      `Stir-fry the ${p.toLowerCase()} and ${v}, add the ${s} and the noodles and toss over high heat for 2 minutes.`,
      `Serve straight away with extra chilli, lime or sesame.`] }),
  wrap: M({
    word: 'Wraps', mins: 15, effort: 'quick', onePan: true, richness: 'medium', format: 'handheld', mood: ['comfort', 'fresh'],
    method: (p, s, c, v) => [
      `Cook the ${p.toLowerCase()} with the ${s} until done and nicely coloured.`,
      `Warm the ${c} and spread with yoghurt or mayo.`,
      `Fill with the ${p.toLowerCase()}, ${v} and salad, roll up tightly and serve.`] }),
  slow: M({
    word: 'Slow-Cooked', mins: 240, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort', 'indulgent'],
    method: (p, s, c, v) => [
      `Brown the ${p.toLowerCase()}, then add the ${s}, ${v} and enough liquid to almost cover.`,
      `Cover and cook low for 3-4 hours (or a slow cooker on low for 7-8) until meltingly tender.`,
      `Shred or leave in chunks and serve over ${c}.`] }),
  griddle: M({
    word: 'Griddle', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort', 'healthy'],
    method: (p, s, c, v) => [
      `Get a griddle pan searing hot. Rub the ${p.toLowerCase()} with oil and seasoning.`,
      `Griddle for 3-5 minutes each side until char-lined and cooked; char the ${v} alongside.`,
      `Spoon over the ${s} and serve with ${c}.`] }),
  airfryer: M({
    word: 'Air-Fryer', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Toss the ${p.toLowerCase()} and ${v} with oil, seasoning and half the ${s}.`,
      `Air-fry at 190C for 15-20 minutes, shaking the basket once, until crisp and cooked.`,
      `Toss with the rest of the ${s} and serve with ${c}.`] }),
  onepot: M({
    word: 'One-Pot', mins: 35, effort: 'quick', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Brown the ${p.toLowerCase()} in a wide pot, then soften an onion and the ${v}.`,
      `Stir in the ${s}, add the ${c === 'rice' ? 'rice' : 'starch'} and enough stock, cover and simmer 20 minutes.`,
      `Rest 5 minutes off the heat, fluff and serve.`] }),
  glazed: M({
    word: 'Glazed', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort', 'indulgent'],
    method: (p, s, c, v) => [
      `Sear the ${p.toLowerCase()} until browned, then pour in the ${s}.`,
      `Let it bubble and reduce, spooning it over until sticky and glossy; steam or wilt the ${v} alongside.`,
      `Serve with ${c} and any glaze from the pan.`] }),
  crispy: M({
    word: 'Crispy', mins: 30, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort', 'indulgent'],
    method: (p, s, c, v) => [
      `Toss the ${p.toLowerCase()} in cornflour and shallow-fry until deep golden and crisp; drain.`,
      `Stir-fry the ${v}, add the ${s} and bubble to a syrup, then toss the ${p.toLowerCase()} back through.`,
      `Serve straight away over ${c} while crisp.`] }),
  braised: M({
    word: 'Braised', mins: 120, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Brown the ${p.toLowerCase()} well, then soften a diced onion, carrot and celery.`,
      `Add the ${s} and stock to come halfway up, cover and braise gently for 1.5-2 hours until tender.`,
      `Stir in the ${v} near the end and serve with ${c}.`] }),
  poached: M({
    word: 'Poached', mins: 25, effort: 'quick', onePan: true, richness: 'light', format: 'bowl', mood: ['light', 'healthy', 'fresh'],
    method: (p, s, c, v) => [
      `Bring the ${s}, loosened with stock, to a bare simmer with the ${v}.`,
      `Slide in the ${p.toLowerCase()} and poach gently for 6-12 minutes until just cooked.`,
      `Lift out, reduce the liquor if you like, and serve over ${c}.`] }),
  stuffed: M({
    word: 'Stuffed', mins: 55, effort: 'medium', onePan: false, richness: 'medium', format: 'plate', mood: ['comfort'],
    method: (p, s, c, v) => [
      `Cook the ${p.toLowerCase()} with the ${s} and chopped ${v} into a well-seasoned filling.`,
      `Stuff into halved peppers, courgettes or large tomatoes and top with cheese or crumbs.`,
      `Bake at 190C for 30-35 minutes until tender and browned; serve with ${c}.`] }),
  loaded: M({
    word: 'Loaded', mins: 45, effort: 'quick', onePan: false, richness: 'hearty', format: 'sharing', mood: ['comfort', 'indulgent'],
    method: (p, s, c, v) => [
      `Roast potatoes, fries or nachos until crisp.`,
      `Cook the ${p.toLowerCase()} with the ${s} and ${v} until saucy.`,
      `Pile over the base with cheese, soured cream and pickled chilli, and serve with ${c}.`] }),
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Rebuild blurb + ingredients + method for a composed home dish. */
export function buildRecipe({ tech, sauce, protein, carb, veg, servings = 4 }) {
  const t = TECHNIQUES[tech];
  const p = PROTEINS[protein];
  const s = SAUCES[sauce];
  if (!t || !p || !s) return null;
  const vegNames = (veg && veg.length ? veg : ['red onion']).map((k) =>
    typeof k === 'number' ? VEG[k] : k,
  );
  const cShort = CARB_SHORT[carb] || 'a side';
  const tw = t.word.toLowerCase().replace(/^with /, '');
  const blurb = cap(
    `${p.word} cooked ${tw}-style in a ${s.word.toLowerCase()} sauce with ${vegNames.join(' and ')}.`,
  );
  const ingredients = [
    p.qty,
    ...s.ing,
    CARB_LINE[carb] || 'a side salad',
    vegNames.join(', '),
    '1 onion, 2 garlic cloves',
    'olive oil, salt and pepper',
  ];
  const method = t.method(p.word, s.word, cShort, vegNames.join(' and '));
  return { blurb, ingredients, method, servings };
}
