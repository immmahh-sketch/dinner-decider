// Single source of truth for composed home-recipe wording.
// Imported by BOTH scripts/generate-catalog.mjs (Node) and src/engine/hydrate.ts
// (Metro), so a hosted "card" can carry just { tech, sauce, protein, carb, veg }
// and the app rebuilds blurb + ingredients + method on demand.
//
// Plain ESM, no types, no RN/Node-only deps.

export const CARB_LINE = {
  rice: '300g basmati or long-grain rice, to serve',
  noodles: '3 nests egg or rice noodles',
  potato: '900g potatoes (roasting, new or for mash)',
  grains: '250g couscous, bulgur or mixed grains',
  bread: '4 flatbreads, wraps or warmed pittas',
  pasta: '400g pasta',
  none: 'a big green salad, to serve',
  salad: '150g mixed salad leaves',
};
export const CARB_SHORT = {
  rice: 'rice', noodles: 'noodles', potato: 'potatoes', grains: 'couscous or grains',
  bread: 'warm flatbreads', pasta: 'pasta', none: 'a green salad', salad: 'a leafy salad',
};

export const VEG = [
  'red peppers', 'red onion', 'courgette', 'baby spinach', 'tenderstem broccoli', 'green beans',
  'cherry tomatoes', 'peas', 'kale', 'pak choi', 'mangetout', 'butternut squash', 'chestnut mushrooms',
  'sugar snap peas', 'chard', 'leeks', 'fennel', 'sweetcorn', 'aubergine', 'carrots',
];

// ---- proteins: keyed, with enum + diet + shopping-list line -----------
export const PROTEINS = {
  'chicken-thigh': { word: 'Chicken Thigh', key: 'chicken', diet: [], qty: '700g boneless, skinless chicken thighs' },
  'chicken-breast': { word: 'Chicken Breast', key: 'chicken', diet: [], qty: '4 chicken breasts' },
  chicken: { word: 'Chicken', key: 'chicken', diet: [], qty: '700g chicken, diced' },
  beef: { word: 'Beef', key: 'beef', diet: [], qty: '700g braising beef, in chunks' },
  'beef-mince': { word: 'Beef Mince', key: 'beef', diet: [], qty: '500g beef mince (12% fat)' },
  steak: { word: 'Steak', key: 'beef', diet: [], qty: '2 large sirloin or ribeye steaks' },
  pork: { word: 'Pork', key: 'pork', diet: [], qty: '700g pork shoulder, in chunks' },
  'pork-loin': { word: 'Pork Loin', key: 'pork', diet: [], qty: '4 pork loin steaks' },
  sausage: { word: 'Sausage', key: 'pork', diet: [], qty: '8 good pork sausages' },
  lamb: { word: 'Lamb', key: 'lamb', diet: [], qty: '700g lamb shoulder, in chunks' },
  'lamb-mince': { word: 'Lamb Mince', key: 'lamb', diet: [], qty: '500g lamb mince' },
  salmon: { word: 'Salmon', key: 'fish', diet: ['pescatarian'], qty: '4 salmon fillets, skin on' },
  cod: { word: 'Cod', key: 'fish', diet: ['pescatarian'], qty: '4 chunky cod fillets' },
  haddock: { word: 'Haddock', key: 'fish', diet: ['pescatarian'], qty: '4 haddock fillets' },
  'sea-bass': { word: 'Sea Bass', key: 'fish', diet: ['pescatarian'], qty: '4 sea bass fillets' },
  prawn: { word: 'King Prawn', key: 'seafood', diet: ['pescatarian'], qty: '400g raw king prawns, peeled' },
  halloumi: { word: 'Halloumi', key: 'veggie', diet: ['vegetarian'], qty: '450g halloumi, sliced 1cm thick' },
  paneer: { word: 'Paneer', key: 'veggie', diet: ['vegetarian'], qty: '450g paneer, in 2cm cubes' },
  tofu: { word: 'Tofu', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free'], qty: '560g firm tofu, pressed and cubed' },
  chickpea: { word: 'Chickpea', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '2 x 400g tins chickpeas, drained' },
  butterbean: { word: 'Butter Bean', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '2 x 400g tins butter beans, drained' },
  lentil: { word: 'Lentil', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '250g dried green or Puy lentils' },
  mushroom: { word: 'Mushroom', key: 'veggie', diet: ['vegetarian', 'vegan', 'dairy-free'], qty: '600g mixed mushrooms, torn' },
  cauliflower: { word: 'Cauliflower', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '1 large cauliflower, in florets' },
  aubergine: { word: 'Aubergine', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '3 aubergines, in 3cm chunks' },
  'sweet-potato': { word: 'Sweet Potato', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '4 large sweet potatoes, in 3cm chunks' },
  turkey: { word: 'Turkey Mince', key: 'chicken', diet: [], qty: '500g turkey mince' },
  duck: { word: 'Duck', key: 'mixed', diet: [], qty: '4 duck legs' },
  gammon: { word: 'Gammon', key: 'pork', diet: [], qty: '4 gammon steaks' },
  mackerel: { word: 'Mackerel', key: 'fish', diet: ['pescatarian'], qty: '4 mackerel fillets' },
  trout: { word: 'Trout', key: 'fish', diet: ['pescatarian'], qty: '4 trout fillets' },
  hake: { word: 'Hake', key: 'fish', diet: ['pescatarian'], qty: '4 hake fillets' },
  squid: { word: 'Squid', key: 'seafood', diet: ['pescatarian'], qty: '500g squid, cleaned and scored' },
  scallop: { word: 'Scallop', key: 'seafood', diet: ['pescatarian'], qty: '20 large king scallops' },
  tempeh: { word: 'Tempeh', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free'], qty: '400g tempeh, sliced' },
  jackfruit: { word: 'Jackfruit', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '2 x 400g tins young jackfruit, drained and shredded' },
  'black-bean': { word: 'Black Bean', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '2 x 400g tins black beans, drained' },
  egg: { word: 'Egg', key: 'egg', diet: ['vegetarian'], qty: '8 large eggs' },
  squash: { word: 'Butternut Squash', key: 'vegan', diet: ['vegetarian', 'vegan', 'dairy-free', 'gluten-free'], qty: '1 large butternut squash, peeled and in 2cm cubes' },
};

// ---- sauces: keyed, with cuisine + spice + tags + ingredient lines ----
const S = (word, cuisine, spicy, ing, tags = []) => ({ word, cuisine, spicy, ing, tags });
export const SAUCES = {
  harissa: S('Harissa', 'middle-eastern', 2, ['2 tbsp rose harissa', '1 lemon, juiced', '1 tsp honey', '1 tbsp tomato purée'], ['smoky']),
  zaatar: S("Za'atar", 'middle-eastern', 0, ["2 tbsp za'atar", '4 tbsp olive oil', '1 lemon'], ['herby', 'fresh']),
  'sumac-lemon': S('Sumac & Lemon', 'middle-eastern', 0, ['1 tbsp sumac', '2 lemons, juiced', '4 tbsp olive oil', 'small bunch parsley, chopped'], ['zesty', 'fresh']),
  'ras-el-hanout': S('Ras el Hanout', 'middle-eastern', 1, ['2 tbsp ras el hanout', '1 tbsp tomato purée', '250ml stock', '1 tsp honey']),
  'pomegranate-walnut': S('Pomegranate & Walnut', 'middle-eastern', 0, ['3 tbsp pomegranate molasses', '60g walnuts, toasted and ground', '1 onion, grated', '1 tsp cinnamon'], ['zesty']),
  baharat: S('Baharat', 'middle-eastern', 1, ['2 tbsp baharat', '1 tbsp tomato purée', '250ml stock', '1 lemon']),
  'preserved-lemon-olive': S('Preserved Lemon & Olive', 'middle-eastern', 0, ['1 preserved lemon, skin only, chopped', '80g green olives, torn', '1 tsp ground ginger', '250ml stock'], ['zesty']),
  'tikka-masala': S('Tikka Masala', 'indian', 2, ['3 tbsp tikka curry paste', '200g passata', '4 tbsp double cream or coconut yoghurt', '1 tsp garam masala']),
  korma: S('Korma', 'indian', 1, ['3 tbsp korma paste', '150ml coconut milk', '3 tbsp ground almonds', '1 tsp sugar']),
  jalfrezi: S('Jalfrezi', 'indian', 3, ['3 tbsp jalfrezi paste', '2 peppers, sliced', '3 green chillies, sliced', '200g chopped tomatoes']),
  madras: S('Madras', 'indian', 3, ['3 tbsp madras paste', '400g chopped tomatoes', '1 tsp mustard seeds', '10 curry leaves']),
  'rogan-josh': S('Rogan Josh', 'indian', 2, ['3 tbsp rogan josh paste', '150g yoghurt', '4 cardamom pods', '200g chopped tomatoes']),
  bhuna: S('Bhuna', 'indian', 2, ['3 tbsp bhuna paste', '3 tomatoes, chopped', '2 tbsp ginger-garlic paste', '1 tsp toasted cumin']),
  balti: S('Balti', 'indian', 2, ['3 tbsp balti paste', '2 peppers, sliced', '200g chopped tomatoes', 'small bunch coriander']),
  saag: S('Saag', 'indian', 2, ['400g spinach, wilted and chopped', '2 tbsp medium curry powder', '2 tbsp ginger-garlic paste', '1 tsp garam masala']),
  'coconut-dhansak': S('Coconut Dhansak', 'indian', 2, ['3 tbsp curry paste', '100g red lentils', '200ml coconut milk', '1 tbsp tamarind paste']),
  'butter-masala': S('Butter Masala', 'indian', 1, ['200g passata', '50g butter', '100ml double cream', '1 tsp garam masala', '1 tsp dried fenugreek'], ['indulgent']),
  tandoori: S('Tandoori', 'indian', 2, ['3 tbsp tandoori paste', '150g yoghurt', '1 lemon', '1 tbsp ginger-garlic paste'], ['smoky']),
  katsu: S('Katsu Curry', 'east-asian', 1, ['1 tbsp mild curry powder', '1 tbsp plain flour', '400ml chicken or veg stock', '1 tsp honey', '1 tsp soy sauce']),
  teriyaki: S('Teriyaki', 'east-asian', 0, ['4 tbsp soy sauce', '2 tbsp mirin', '1 tbsp honey', '1 tsp grated ginger', '1 tsp cornflour']),
  miso: S('Miso', 'east-asian', 0, ['2 tbsp white miso', '1 tbsp mirin', '1 tbsp rice vinegar', '20g butter'], ['savoury']),
  gochujang: S('Gochujang', 'east-asian', 2, ['2 tbsp gochujang', '1 tbsp soy sauce', '1 tbsp maple syrup', '1 tbsp rice vinegar', '1 tsp sesame oil']),
  'black-bean': S('Black Bean', 'east-asian', 1, ['2 tbsp fermented black beans, rinsed and mashed', '3 garlic cloves', '1 tbsp soy sauce', '1 tsp sugar'], ['savoury']),
  'sweet-sour': S('Sweet & Sour', 'east-asian', 0, ['3 tbsp rice vinegar', '2 tbsp ketchup', '2 tbsp sugar', '100g pineapple chunks', '1 tsp cornflour']),
  'kung-pao': S('Kung Pao', 'east-asian', 3, ['4 dried chillies', '1 tbsp Sichuan peppercorns', '40g roasted peanuts', '2 tbsp soy sauce', '1 tbsp black vinegar']),
  'sichuan-chilli': S('Sichuan Chilli', 'east-asian', 3, ['1 tbsp chilli bean paste (doubanjiang)', '1 tsp ground Sichuan pepper', '2 tbsp soy sauce', '1 tsp sugar']),
  'sticky-soy-ginger': S('Sticky Soy & Ginger', 'east-asian', 0, ['4 tbsp soy sauce', '1 thumb ginger, grated', '2 tbsp honey', '2 garlic cloves', '1 tsp cornflour']),
  'sesame-ginger': S('Sesame & Ginger', 'east-asian', 0, ['2 tbsp sesame oil', '1 thumb ginger, grated', '2 tbsp soy sauce', '1 tbsp sesame seeds', '1 tsp rice vinegar'], ['fresh']),
  hoisin: S('Hoisin', 'east-asian', 0, ['4 tbsp hoisin sauce', '1 tbsp rice vinegar', '1 tbsp soy sauce', '2 spring onions']),
  oyster: S('Oyster Sauce', 'east-asian', 0, ['3 tbsp oyster sauce', '1 tbsp soy sauce', '1 tsp sugar', '1 tsp cornflour'], ['savoury']),
  satay: S('Satay', 'east-asian', 1, ['4 tbsp crunchy peanut butter', '200ml coconut milk', '1 tbsp soy sauce', '1 lime', '1 tsp brown sugar']),
  'thai-green': S('Thai Green', 'east-asian', 2, ['3 tbsp green curry paste', '400ml coconut milk', 'handful Thai basil', '1 lime', '1 tbsp fish sauce']),
  'thai-red': S('Thai Red', 'east-asian', 2, ['3 tbsp red curry paste', '400ml coconut milk', '3 lime leaves', '1 tbsp fish sauce', '1 tsp palm sugar']),
  panang: S('Panang', 'east-asian', 2, ['3 tbsp panang paste', '300ml coconut milk', '2 tbsp peanut butter', '3 lime leaves', '1 tbsp fish sauce']),
  massaman: S('Massaman', 'east-asian', 1, ['3 tbsp massaman paste', '400ml coconut milk', '40g roasted peanuts', '1 cinnamon stick', '1 tbsp tamarind']),
  'lemongrass-lime': S('Lemongrass & Lime', 'east-asian', 1, ['2 lemongrass stalks, bashed and minced', '2 limes', '1 tbsp fish sauce', '1 red chilli', '1 tsp sugar'], ['zesty', 'fresh']),
  'coconut-lime': S('Coconut & Lime', 'east-asian', 1, ['200ml coconut milk', '2 limes', '1 tbsp grated ginger', 'small bunch coriander', '1 tbsp fish sauce'], ['fresh']),
  'sweet-chilli': S('Sweet Chilli', 'east-asian', 1, ['4 tbsp sweet chilli sauce', '1 tbsp soy sauce', '1 lime', '1 tsp grated ginger']),
  'char-siu': S('Char Siu', 'east-asian', 0, ['3 tbsp hoisin', '1 tbsp honey', '1 tbsp soy sauce', '1 tsp five-spice', '1 tbsp shaoxing or dry sherry']),
  'peri-peri': S('Peri Peri', 'other', 2, ['3 tbsp peri peri sauce', '1 lemon', '3 garlic cloves', '1 tsp smoked paprika', '1 tbsp red wine vinegar'], ['smoky']),
  jerk: S('Jerk', 'caribbean', 3, ['3 tbsp jerk marinade', '1 tsp thyme', '2 spring onions', '1 lime', '1 tsp allspice'], ['smoky']),
  'caribbean-curry': S('Caribbean Curry', 'caribbean', 2, ['2 tbsp Caribbean curry powder', '1 scotch bonnet, whole', 'few sprigs thyme', '2 tbsp ginger-garlic paste', '200ml coconut milk']),
  chimichurri: S('Chimichurri', 'other', 1, ['large bunch flat-leaf parsley, finely chopped', '3 tbsp red wine vinegar', '2 garlic cloves, crushed', '1/2 tsp chilli flakes', '6 tbsp olive oil'], ['herby', 'zesty', 'fresh']),
  'salsa-verde': S('Salsa Verde', 'italian', 0, ['large bunch parsley and mint, chopped', '1 tbsp capers', '3 anchovies', '1 tbsp red wine vinegar', '5 tbsp olive oil'], ['herby', 'fresh']),
  romesco: S('Romesco', 'med', 1, ['2 roasted red peppers', '40g toasted almonds', '1 tsp smoked paprika', '1 tbsp sherry vinegar', '3 tbsp olive oil'], ['smoky']),
  salmoriglio: S('Salmoriglio', 'med', 0, ['large bunch oregano and parsley', '2 lemons, juiced', '3 garlic cloves', '6 tbsp olive oil'], ['herby', 'zesty', 'fresh']),
  'lemon-garlic': S('Lemon & Garlic', 'med', 0, ['2 lemons', '4 garlic cloves, sliced', '4 tbsp olive oil', 'small bunch parsley'], ['zesty', 'fresh']),
  'saffron-tomato': S('Saffron & Tomato', 'med', 0, ['pinch of saffron, soaked', '400g chopped tomatoes', '1 onion', '125ml white wine', '1 tsp smoked paprika']),
  puttanesca: S('Puttanesca', 'italian', 1, ['400g chopped tomatoes', '80g black olives, torn', '2 tbsp capers', '5 anchovies', '1 tsp chilli flakes']),
  arrabbiata: S('Arrabbiata', 'italian', 2, ['400g chopped tomatoes', '4 garlic cloves, sliced', '1 tsp chilli flakes', 'handful basil', '2 tbsp olive oil']),
  'tomato-basil': S('Tomato & Basil', 'italian', 0, ['400g chopped tomatoes (or 500g fresh, blitzed)', '3 garlic cloves', 'big handful basil', '1 tsp sugar', '3 tbsp olive oil']),
  nduja: S('Nduja', 'italian', 2, ['60g nduja', '250g passata', '2 garlic cloves', '1 tsp fennel seeds'], ['smoky', 'indulgent']),
  pesto: S('Pesto', 'italian', 0, ['5 tbsp basil pesto', '30g Parmesan, grated', '30g pine nuts, toasted', '1 lemon'], ['herby', 'fresh']),
  'lemon-caper-butter': S('Lemon & Caper Butter', 'italian', 0, ['70g butter', '2 tbsp capers', '2 lemons', 'small bunch parsley'], ['zesty']),
  'creamy-garlic-mushroom': S('Creamy Garlic Mushroom', 'french', 0, ['300g mushrooms, sliced', '200ml double cream', '3 garlic cloves', 'few sprigs thyme', '50ml white wine'], ['savoury', 'indulgent']),
  'mustard-cream': S('Mustard Cream', 'french', 0, ['2 tbsp wholegrain mustard', '150ml crème fraîche', '100ml white wine', '1 shallot'], ['indulgent']),
  peppercorn: S('Peppercorn', 'french', 0, ['1 tbsp black peppercorns, crushed', '150ml double cream', '50ml brandy', '1 shallot', '150ml beef stock'], ['indulgent']),
  diane: S('Diane', 'french', 0, ['150g mushrooms', '1 tbsp Worcestershire sauce', '50ml brandy', '150ml double cream', '1 tsp Dijon'], ['indulgent']),
  'garlic-butter': S('Garlic Butter', 'french', 0, ['70g butter', '5 garlic cloves, crushed', 'small bunch parsley', '1/2 lemon'], ['indulgent']),
  'white-wine-herb': S('White Wine & Herb', 'french', 0, ['175ml white wine', 'large bunch tarragon and parsley', '30g butter', '1 shallot'], ['herby', 'fresh']),
  'tarragon-cream': S('Tarragon Cream', 'french', 0, ['large bunch tarragon', '150ml crème fraîche', '100ml white wine', '1 shallot', '1 tsp Dijon'], ['herby', 'indulgent']),
  cajun: S('Cajun', 'american', 2, ['2 tbsp Cajun seasoning', '1 tsp smoked paprika', '1 lemon', '1 tbsp oil'], ['smoky']),
  blackened: S('Blackened', 'american', 2, ['2 tbsp blackening spice', '30g melted butter', '1 lime', '1 tsp dried oregano'], ['smoky']),
  bbq: S('BBQ', 'american', 1, ['150ml barbecue sauce', '1 tbsp smoked paprika', '1 tbsp cider vinegar', '1 tsp Worcestershire sauce'], ['smoky']),
  buffalo: S('Buffalo', 'american', 2, ['5 tbsp hot sauce (Frank\'s or similar)', '40g melted butter', '1 tsp garlic granules', '1 tsp honey']),
  'honey-mustard': S('Honey Mustard', 'american', 0, ['3 tbsp honey', '2 tbsp Dijon mustard', '1 tbsp wholegrain mustard', '1 tbsp cider vinegar']),
  'maple-bacon': S('Maple & Bacon', 'american', 0, ['3 tbsp maple syrup', '100g bacon lardons', '1 tsp Dijon', '1 tbsp cider vinegar'], ['smoky', 'indulgent']),
  chipotle: S('Chipotle', 'mexican', 2, ['2 tbsp chipotle paste', '400g chopped tomatoes', '1 tsp ground cumin', '1 tsp oregano', '1 lime']),
  'chilli-lime': S('Chilli-Lime', 'mexican', 2, ['2 limes', '1 tsp chilli powder', '1 tsp ground cumin', 'small bunch coriander', '2 tbsp oil'], ['zesty', 'fresh']),
  'fajita-spiced': S('Fajita-Spiced', 'mexican', 1, ['2 tbsp fajita seasoning', '2 peppers, sliced', '1 onion, sliced', '1 lime']),
  mole: S('Mole', 'mexican', 2, ['3 tbsp mole paste', '20g dark chocolate', '400g chopped tomatoes', '1 tsp cinnamon', '1 tbsp raisins']),
  'salsa-roja': S('Salsa Roja', 'mexican', 2, ['4 tomatoes, charred', '2 chipotles in adobo', '1 onion', '1 tsp oregano', '2 garlic cloves'], ['smoky']),
  'green-goddess': S('Green Goddess', 'american', 0, ['large bunch basil, parsley and chives', '3 tbsp yoghurt', '2 tbsp mayo', '1 tbsp lemon juice', '1 anchovy'], ['herby', 'fresh']),
  tzatziki: S('Tzatziki', 'med', 0, ['250g Greek yoghurt', '1/2 cucumber, grated and squeezed', '1 garlic clove', 'small bunch dill and mint', '1 tbsp olive oil'], ['fresh']),
  chermoula: S('Chermoula', 'middle-eastern', 1, ['large bunch coriander and parsley', '1 tsp ground cumin', '1 tsp paprika', '2 lemons', '4 tbsp olive oil'], ['herby', 'zesty']),
  tahini: S('Lemon Tahini', 'middle-eastern', 0, ['4 tbsp tahini', '2 lemons, juiced', '1 garlic clove, crushed', '4-6 tbsp warm water'], ['fresh']),
  'harissa-yoghurt': S('Harissa Yoghurt', 'middle-eastern', 2, ['2 tbsp rose harissa', '200g yoghurt', '1 lemon', '1 garlic clove'], ['smoky']),
  bulgogi: S('Bulgogi', 'east-asian', 1, ['4 tbsp soy sauce', '2 tbsp brown sugar', '1 pear, grated', '1 tbsp sesame oil', '3 garlic cloves']),
  ponzu: S('Ponzu', 'east-asian', 0, ['4 tbsp ponzu', '1 tbsp mirin', '1 tsp grated ginger', '2 spring onions', '1 tsp sesame oil'], ['zesty', 'fresh']),
  'nam-jim': S('Nam Jim', 'east-asian', 3, ['2 tbsp fish sauce', '2 limes', "2 bird's eye chillies", '1 tbsp palm sugar', 'small bunch coriander'], ['zesty', 'fresh']),
  tonkatsu: S('Tonkatsu', 'east-asian', 0, ['5 tbsp tonkatsu sauce', '1 tsp Worcestershire sauce', '80g panko', '1 tbsp Dijon']),
  xo: S('XO', 'east-asian', 2, ['3 tbsp XO sauce', '1 tbsp soy sauce', '3 spring onions', '1 tsp sugar'], ['savoury', 'smoky']),
  doubanjiang: S('Doubanjiang', 'east-asian', 3, ['2 tbsp chilli bean paste', '1 tbsp fermented black beans', '3 garlic cloves', '1 tbsp soy sauce'], ['savoury']),
  'salsa-macha': S('Salsa Macha', 'mexican', 3, ['4 tbsp salsa macha', '40g peanuts', '1 tbsp sesame seeds', '2 tbsp oil'], ['smoky']),
  'aji-verde': S('Aji Verde', 'other', 2, ['large bunch coriander', '2 jalapeños', '3 tbsp mayo', '2 tbsp yoghurt', '1 lime'], ['herby', 'zesty']),
  mojo: S('Mojo', 'caribbean', 1, ['6 garlic cloves, crushed', '1 tsp ground cumin', 'juice of 2 oranges and 2 limes', '1 tsp dried oregano', '4 tbsp olive oil'], ['zesty', 'herby']),
  sofrito: S('Sofrito', 'caribbean', 1, ['1 onion, 1 pepper and 4 garlic cloves, blitzed', '2 tbsp tomato purée', '1 tsp dried oregano', '1 tsp cumin', 'small bunch coriander']),
  marsala: S('Marsala', 'italian', 0, ['150ml dry Marsala', '200g mushrooms, sliced', '200ml chicken stock', '25g butter', '1 tsp thyme'], ['savoury', 'indulgent']),
  madeira: S('Madeira', 'french', 0, ['125ml Madeira', '250ml beef stock', '1 shallot', '25g butter', '1 tsp thyme'], ['savoury', 'indulgent']),
  'red-wine-shallot': S('Red Wine & Shallot', 'french', 0, ['250ml red wine', '3 shallots, sliced', '250ml beef stock', '25g butter', '1 tsp sugar'], ['savoury', 'indulgent']),
  chasseur: S('Chasseur', 'french', 0, ['200g mushrooms', '3 tomatoes, chopped', '125ml white wine', 'small bunch tarragon', '250ml chicken stock'], ['savoury']),
  provencal: S('Provençal', 'french', 0, ['400g chopped tomatoes', '80g olives', '3 garlic cloves', '1 tbsp herbes de Provence', '75ml white wine'], ['herby']),
  'blue-cheese': S('Blue Cheese', 'french', 0, ['100g blue cheese, crumbled', '150ml double cream', '1 shallot', '50ml white wine'], ['indulgent']),
  'cheddar-mustard': S('Cheddar & Mustard', 'british', 0, ['120g mature cheddar, grated', '1 tbsp English mustard', '250ml milk', '25g butter and 25g flour'], ['indulgent', 'comforting']),
  'cider-cream': S('Cider Cream', 'french', 0, ['250ml dry cider', '150ml crème fraîche', '1 tsp Dijon', '1 apple, sliced', '1 shallot'], ['indulgent']),
  'brown-butter-sage': S('Brown Butter & Sage', 'italian', 0, ['90g butter', 'large handful sage leaves', '1/2 lemon', '40g Parmesan'], ['indulgent']),
  gremolata: S('Gremolata', 'italian', 0, ['large bunch parsley, finely chopped', 'finely grated zest of 2 lemons', '3 garlic cloves, minced', '4 tbsp olive oil'], ['herby', 'zesty', 'fresh']),
  carbonara: S('Carbonara', 'italian', 0, ['120g pancetta or guanciale, diced', '3 egg yolks plus 1 whole egg', '60g pecorino, grated', 'lots of black pepper'], ['indulgent']),
  'lemon-herb-butter': S('Lemon & Herb Butter', 'french', 0, ['70g butter', '2 lemons', 'large bunch parsley, dill and chives'], ['zesty', 'herby', 'fresh']),
  'piri-lemon': S('Piri Lemon', 'other', 2, ['3 tbsp piri piri sauce', '2 lemons', '4 garlic cloves', '1 tsp smoked paprika'], ['smoky', 'zesty']),
  'ginger-scallion': S('Ginger & Scallion', 'east-asian', 0, ['1 large thumb ginger, finely shredded', '8 spring onions, sliced', '5 tbsp neutral oil, heated until shimmering', '1 tbsp soy sauce', '1 tsp sugar'], ['fresh']),
  'black-pepper': S('Black Pepper', 'east-asian', 1, ['1 tbsp coarsely cracked black pepper', '3 tbsp oyster sauce', '1 tbsp soy sauce', '25g butter', '1 tsp sugar'], ['savoury']),
  vindaloo: S('Vindaloo', 'indian', 3, ['3 tbsp vindaloo paste', '3 tbsp cider vinegar', '1 tsp sugar', '5 garlic cloves', '200g chopped tomatoes']),
  dopiaza: S('Dopiaza', 'indian', 2, ['3 tbsp curry paste', '4 onions (2 blended, 2 in wedges)', '3 tomatoes', '1 tsp garam masala']),
  methi: S('Methi', 'indian', 2, ['3 tbsp curry paste', '3 tbsp dried fenugreek leaves', '150g yoghurt', '2 tomatoes', '1 tbsp ginger-garlic paste']),
  achari: S('Achari', 'indian', 2, ['3 tbsp achari paste', '1 tsp nigella seeds', '1 tsp mustard seeds', '150g yoghurt', '1 tbsp lemon juice'], ['zesty']),
};

// ---- techniques: keyed, with blurb hints + method builder ------------
// verb:  past-tense phrase for the blurb
// join:  how the sauce reads in the blurb — 'in' → "in a X sauce", 'with' → "with X"
// method(p, s, c, v, ctx): p = protein word, s = sauce phrase (no leading article),
//   c = carb (short), v = veg list string, ctx = { cuisine, spicy, aromatics, finish }
const M = (o) => o;
export const TECHNIQUES = {
  traybake: M({
    word: 'Traybake', mins: 40, effort: 'quick', onePan: true, richness: 'hearty', format: 'plate', mood: ['comfort'],
    verb: 'roasted together on one tray', join: 'in',
    method: (p, s, c, v, x) => [
      `Heat the oven to 200C fan. Cut the ${lc(p)} into even pieces and tip into your largest roasting tin with the ${v}, ${x.aromatics}, 2 tbsp oil and a good pinch of salt.`,
      `Add the ${s} and toss everything so it is well coated. Spread out in a single layer — use two tins rather than crowd one.`,
      `Roast for 30–35 minutes, turning once halfway, until the ${lc(p)} is cooked through and the edges of everything are deep golden and a little sticky.`,
      `Squeeze over any lemon from the sauce, scatter with ${x.finish} and serve straight from the tin with ${c}.`,
    ],
  }),
  skillet: M({
    word: 'Skillet', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    verb: 'seared, then simmered', join: 'in',
    method: (p, s, c, v, x) => [
      `Season the ${lc(p)} well. Heat 1 tbsp oil in a large skillet over medium-high and brown it hard for 4–5 minutes, then lift out.`,
      `Lower the heat, add the ${x.aromatics} and the ${v} and cook for 6–8 minutes until softened and starting to colour.`,
      `Stir in the ${s} with a splash of water, return the ${lc(p)} and any resting juices, and simmer for 8–10 minutes until the sauce thickens and clings.`,
      `Check the seasoning, finish with ${x.finish} and serve from the pan with ${c}.`,
    ],
  }),
  stirfry: M({
    word: 'Stir-Fry', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    verb: 'stir-fried fast over a high flame', join: 'with',
    method: (p, s, c, v, x) => [
      `Mix the ${s} in a small bowl and have everything chopped and to hand — a stir-fry moves quickly. Get a wok or large frying pan properly hot with 1 tbsp oil.`,
      `Stir-fry the ${lc(p)} for 3–4 minutes until seared and nearly cooked, then tip onto a plate.`,
      `Add the ${v} with the ${x.aromatics} and stir-fry for 2–3 minutes so they keep some bite.`,
      `Return the ${lc(p)}, pour in the sauce and toss for 1 minute until glossy and just thickened. Serve at once over ${c} with ${x.finish}.`,
    ],
  }),
  curry: M({
    word: 'Curry', mins: 40, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    verb: 'simmered low and slow', join: 'in',
    method: (p, s, c, v, x) => [
      `Fry the ${x.aromatics} in 2 tbsp oil over medium heat until soft — 8–10 minutes if there's onion in there, just 2 if not.`,
      `Add the ${s} and cook it out for 2–3 minutes, stirring, until it darkens and smells fragrant and the oil starts to split.`,
      `Stir in the ${lc(p)} to coat, add the ${v} and enough water or stock to loosen, then simmer gently for 20–25 minutes (longer for tougher cuts) until thick and tender.`,
      `Season, add a squeeze of lemon or lime, scatter with ${x.finish} and serve with ${c}.`,
    ],
  }),
  stew: M({
    word: 'Stew', mins: 110, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    verb: 'stewed slowly until tender', join: 'in',
    method: (p, s, c, v, x) => [
      `Toss the ${lc(p)} in seasoned flour and brown in batches in a heavy casserole with a little oil; set aside. Don't rush this — the colour is the flavour.`,
      `Soften a diced onion, 2 carrots and 2 celery sticks in the same pot for 10 minutes, then stir in the ${x.aromatics}.`,
      `Return the ${lc(p)} with the ${s} and enough stock to almost cover. Bring to a bare simmer, cover and cook low for 1½–2 hours until fork-tender.`,
      `Stir in the ${v} for the last 15 minutes, adjust the seasoning and serve with ${c} and ${x.finish}.`,
    ],
  }),
  soup: M({
    word: 'Soup', mins: 40, effort: 'quick', onePan: true, richness: 'medium', format: 'soup', mood: ['comfort', 'healthy'],
    verb: 'simmered into a broth', join: 'with',
    method: (p, s, c, v, x) => [
      `Soften the ${x.aromatics} in 1 tbsp oil in a large pot for 6–8 minutes without colouring.`,
      `Stir in the ${s} and cook for 1 minute, then add the ${lc(p)}, the ${v} and 1.2 litres of stock.`,
      `Simmer for 20–25 minutes until everything is tender and the flavours have come together.`,
      `Blend until smooth, or leave it chunky and just crush a little against the side. Season well and serve with ${c} and ${x.finish}.`,
    ],
  }),
  grill: M({
    word: 'Skewers', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort', 'healthy'],
    verb: 'marinated, skewered and charred', join: 'with',
    method: (p, s, c, v, x) => [
      `Cut the ${lc(p)} into 3cm pieces, toss with the ${s} and leave to marinate for at least 30 minutes (or up to a day in the fridge).`,
      `Thread onto skewers, alternating with the ${v} cut to a similar size. Soak wooden skewers first.`,
      `Grill, griddle or barbecue over a high heat for 10–12 minutes, turning every few minutes, until nicely charred and cooked through.`,
      `Rest for a couple of minutes, then serve with ${c} and ${x.finish}.`,
    ],
  }),
  roast: M({
    word: 'Roast', mins: 75, effort: 'medium', onePan: false, richness: 'hearty', format: 'plate', mood: ['comfort'],
    verb: 'rubbed and slow-roasted', join: 'with',
    method: (p, s, c, v, x) => [
      `Heat the oven to 190C fan. Pat the ${lc(p)} dry, then rub all over with the ${s}, 1 tbsp oil and plenty of seasoning.`,
      `Sit it in a roasting tin and roast for 45–60 minutes (allow longer for large joints), basting once with the pan juices.`,
      `Toss the ${v} with oil and salt and roast alongside for the last 30 minutes until tender and caramelised.`,
      `Rest the ${lc(p)} for 10 minutes under foil before carving. Serve with ${c}, the roast veg and ${x.finish}.`,
    ],
  }),
  panfry: M({
    word: 'Pan-Fried', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort'],
    verb: 'pan-fried with a quick pan sauce', join: 'with',
    method: (p, s, c, v, x) => [
      `Season the ${lc(p)} generously. Heat a splash of oil in a heavy frying pan over medium-high and cook for 3–4 minutes each side until golden and just done.`,
      `Rest the ${lc(p)} on a warm plate. Pour off excess fat, add the ${x.aromatics} to the pan and cook for 1 minute.`,
      `Add the ${s}, scraping up the sticky bits, and let it bubble for 2–3 minutes until glossy and slightly reduced. Return the ${lc(p)} to coat.`,
      `Serve with the ${v}, ${c} and ${x.finish}, spooning the pan sauce over.`,
    ],
  }),
  salad: M({
    word: 'Salad', mins: 20, effort: 'quick', onePan: false, richness: 'light', format: 'salad', mood: ['fresh', 'light', 'healthy'],
    verb: 'griddled and piled over dressed leaves', join: 'with',
    method: (p, s, c, v, x) => [
      `Cook or griddle the ${lc(p)} until just done and lightly charred, then set aside to cool a little while you build the salad.`,
      `Whisk the ${s} with a little extra oil and a pinch of salt to make a loose dressing.`,
      `Toss the ${v}, ${c} and a big handful of leaves with most of the dressing in a wide bowl.`,
      `Slice or flake the ${lc(p)} over the top, spoon on the rest of the dressing and finish with ${x.finish}.`,
    ],
  }),
  bowl: M({
    word: 'Bowl', mins: 25, effort: 'quick', onePan: false, richness: 'medium', format: 'bowl', mood: ['healthy', 'comfort'],
    verb: 'built into a bowl', join: 'with',
    method: (p, s, c, v, x) => [
      `Cook the ${c} and divide between bowls. Mix the ${s} in a small jug.`,
      `Cook the ${lc(p)} in a hot pan with a little oil until browned and just cooked, adding half the sauce for the last minute to glaze.`,
      `Quickly char or wilt the ${v} in the same pan with the ${x.aromatics}.`,
      `Pile the ${lc(p)} and veg over the ${c}, spoon on the remaining sauce and top with ${x.finish}.`,
    ],
  }),
  pasta: M({
    word: 'Pasta', mins: 25, effort: 'quick', onePan: false, richness: 'medium', format: 'bowl', mood: ['comfort'],
    verb: 'tossed through pasta', join: 'with',
    method: (p, s, c, v, x) => [
      `Put a large pan of well-salted water on to boil and cook the pasta until just al dente, saving a mugful of the water before draining.`,
      `Meanwhile, cook the ${lc(p)} with the ${x.aromatics} in a wide pan until browned, then add the ${v} for a few minutes.`,
      `Stir in the ${s} and let it come together into a sauce, loosening with a little pasta water.`,
      `Add the drained pasta and toss hard over the heat for a minute, adding more water until it is silky and coats every strand. Finish with ${x.finish}.`,
    ],
  }),
  bake: M({
    word: 'Bake', mins: 50, effort: 'medium', onePan: false, richness: 'hearty', format: 'plate', mood: ['comfort', 'indulgent'],
    verb: 'layered up and baked until bubbling', join: 'in',
    method: (p, s, c, v, x) => [
      `Heat the oven to 190C fan. Cook the ${lc(p)} with the ${x.aromatics} until browned, then stir through the ${v}.`,
      `Mix in the ${s} and season, then tip into a baking dish and level the top.`,
      `Cover with cheese, breadcrumbs or sliced potato and bake for 30–35 minutes until deeply golden and bubbling at the edges.`,
      `Rest for 5–10 minutes so it sets, then serve with ${c} and ${x.finish}.`,
    ],
  }),
  noodles: M({
    word: 'Noodles', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'bowl', mood: ['comfort'],
    verb: 'wok-tossed with noodles', join: 'with',
    method: (p, s, c, v, x) => [
      `Cook the noodles to packet instructions, drain, rinse briefly and toss with a drop of oil so they don't clump. Mix the ${s} in a bowl.`,
      `Get a wok smoking hot with 1 tbsp oil and stir-fry the ${lc(p)} for 3–4 minutes until seared.`,
      `Add the ${v} and ${x.aromatics} and stir-fry for 2 minutes, then add the noodles and sauce.`,
      `Toss over high heat for 1–2 minutes until everything is coated and glossy. Serve with ${x.finish}.`,
    ],
  }),
  wrap: M({
    word: 'Wraps', mins: 15, effort: 'quick', onePan: true, richness: 'medium', format: 'handheld', mood: ['comfort', 'fresh'],
    verb: 'cooked down and rolled into wraps', join: 'with',
    method: (p, s, c, v, x) => [
      `Cook the ${lc(p)} in a hot pan with a little oil and the ${x.aromatics} until browned and cooked through.`,
      `Stir in the ${s} and the ${v} and cook for 2–3 minutes more until glazed and just tender.`,
      `Warm the ${c} and spread with yoghurt or mayo.`,
      `Fill with the ${lc(p)}, veg and a handful of crisp salad, add ${x.finish}, roll up tightly and cut in half.`,
    ],
  }),
  slow: M({
    word: 'Slow-Cooked', mins: 240, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort', 'indulgent'],
    verb: 'slow-cooked until it falls apart', join: 'in',
    method: (p, s, c, v, x) => [
      `Brown the ${lc(p)} all over in a heavy pot or the base of a slow cooker pan; this step is worth it.`,
      `Add the ${x.aromatics}, the ${s} and enough stock to come halfway up the meat.`,
      `Cover and cook very low — 3–4 hours in a 140C oven, or 7–8 hours in a slow cooker on low — until it pulls apart with a fork.`,
      `Add the ${v} for the last 30 minutes. Shred or leave in chunks, skim any fat, and serve over ${c} with ${x.finish}.`,
    ],
  }),
  griddle: M({
    word: 'Griddle', mins: 20, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort', 'healthy'],
    verb: 'griddled hard for char and smoke', join: 'with',
    method: (p, s, c, v, x) => [
      `Get a griddle pan searing hot. Rub the ${lc(p)} with oil, salt and pepper.`,
      `Griddle for 3–5 minutes each side, pressing down for good bar marks, until cooked with a proper char. Rest briefly.`,
      `Griddle the ${v}, cut into flat pieces, alongside or after until softened and striped.`,
      `Spoon the ${s} over the ${lc(p)} and veg and serve with ${c} and ${x.finish}.`,
    ],
  }),
  airfryer: M({
    word: 'Air-Fryer', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort'],
    verb: 'air-fried until crisp', join: 'with',
    method: (p, s, c, v, x) => [
      `Toss the ${lc(p)} and the ${v} with 1 tbsp oil, seasoning and half the ${s}.`,
      `Air-fry at 190C for 15–20 minutes, shaking the basket once or twice, until crisp at the edges and cooked through. Cook in batches rather than overfill.`,
      `Warm the remaining sauce with a splash of water.`,
      `Toss the crisp ${lc(p)} and veg through the warm sauce and serve with ${c} and ${x.finish}.`,
    ],
  }),
  onepot: M({
    word: 'One-Pot', mins: 35, effort: 'quick', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    verb: 'simmered right down', join: 'in',
    method: (p, s, c, v, x) => [
      `Brown the ${lc(p)} in a wide, deep pan with a lid, then lift out. Soften the ${x.aromatics} and the ${v} in the same pan for 8 minutes.`,
      `Stir in the ${s} and the ${c === 'rice' ? 'rice' : c === 'grains' ? 'grains' : 'starch'}, coating everything, then return the ${lc(p)}.`,
      `Pour in enough stock to cover by 1cm, bring to a simmer, cover and cook for 18–20 minutes until the ${c === 'rice' ? 'rice' : 'grains'} are tender and the liquid absorbed.`,
      `Rest off the heat for 5 minutes with the lid on, then fluff, fork through ${x.finish} and serve.`,
    ],
  }),
  glazed: M({
    word: 'Glazed', mins: 25, effort: 'quick', onePan: true, richness: 'medium', format: 'plate', mood: ['comfort', 'indulgent'],
    verb: 'seared then glazed sticky', join: 'with',
    method: (p, s, c, v, x) => [
      `Pat the ${lc(p)} dry, season, and sear in a hot pan with a little oil until well browned on all sides.`,
      `Pour in the ${s} and let it bubble, spooning it over the ${lc(p)} constantly, until it reduces to a thick, glossy glaze that coats it.`,
      `Steam or wilt the ${v} with the ${x.aromatics} alongside.`,
      `Serve the ${lc(p)} with ${c}, the veg and every last bit of glaze from the pan, scattered with ${x.finish}.`,
    ],
  }),
  crispy: M({
    word: 'Crispy', mins: 30, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort', 'indulgent'],
    verb: 'coated, crisp-fried and tossed', join: 'with',
    method: (p, s, c, v, x) => [
      `Toss the ${lc(p)} in cornflour seasoned with salt and pepper, shaking off the excess.`,
      `Shallow-fry in 1cm of hot oil, in batches, for 3–4 minutes until deep golden and crisp. Drain on kitchen paper.`,
      `Pour off all but 1 tbsp oil, stir-fry the ${v} and ${x.aromatics} for 2 minutes, then add the ${s} and bubble to a syrup.`,
      `Return the ${lc(p)}, toss fast to coat while it stays crisp, and serve straight away over ${c} with ${x.finish}.`,
    ],
  }),
  braised: M({
    word: 'Braised', mins: 130, effort: 'medium', onePan: true, richness: 'hearty', format: 'bowl', mood: ['comfort'],
    verb: 'braised gently until spoonable', join: 'in',
    method: (p, s, c, v, x) => [
      `Season and brown the ${lc(p)} well in a casserole with a little oil, then set aside.`,
      `Soften a diced onion, carrot and celery for 10 minutes, stir in the ${x.aromatics}, then add the ${s} and stock to come halfway up.`,
      `Return the ${lc(p)}, bring to a bare simmer, cover and braise in a 150C oven for 1½–2 hours, turning once, until meltingly tender.`,
      `Stir the ${v} in near the end, reduce the sauce on the hob if needed, and serve over ${c} with ${x.finish}.`,
    ],
  }),
  poached: M({
    word: 'Poached', mins: 25, effort: 'quick', onePan: true, richness: 'light', format: 'bowl', mood: ['light', 'healthy', 'fresh'],
    verb: 'gently poached', join: 'in',
    method: (p, s, c, v, x) => [
      `Bring the ${s}, loosened with 400ml stock, to a very gentle simmer in a wide pan with the ${x.aromatics}.`,
      `Add the ${v} and cook for 3–4 minutes, then slide in the ${lc(p)}.`,
      `Poach very gently — barely a bubble — for 6–12 minutes depending on thickness, until just cooked and opaque.`,
      `Lift everything out, reduce the poaching liquor by half if you'd like it richer, then spoon over ${c} and finish with ${x.finish}.`,
    ],
  }),
  stuffed: M({
    word: 'Stuffed', mins: 55, effort: 'medium', onePan: false, richness: 'medium', format: 'plate', mood: ['comfort'],
    verb: 'stuffed and baked', join: 'with',
    method: (p, s, c, v, x) => [
      `Heat the oven to 190C fan. Cook the ${lc(p)} with the ${x.aromatics}, the chopped ${v} and the ${s} into a thick, well-seasoned filling.`,
      `Halve and hollow out peppers, courgettes, large tomatoes or squash and season the cavities.`,
      `Pack in the filling, top with cheese or breadcrumbs, and sit snugly in a baking dish with a splash of water.`,
      `Bake for 30–35 minutes until the shells are tender and the tops browned. Serve with ${c} and ${x.finish}.`,
    ],
  }),
  loaded: M({
    word: 'Loaded', mins: 45, effort: 'quick', onePan: false, richness: 'hearty', format: 'sharing', mood: ['comfort', 'indulgent'],
    verb: 'piled onto a crisp base and loaded up', join: 'with',
    method: (p, s, c, v, x) => [
      `Roast potato wedges, fries or a tray of tortilla chips until crisp and golden.`,
      `Cook the ${lc(p)} with the ${x.aromatics} until browned, then stir in the ${s} and the ${v} and simmer until thick and saucy.`,
      `Pile the ${lc(p)} mixture over the hot base and scatter with grated cheese; flash under the grill if you like it molten.`,
      `Finish with soured cream, pickled chillies and ${x.finish}, and serve with ${c} to share.`,
    ],
  }),
};

// ---------------------------------------------------------------------------
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// full lowercase — proteins are stored Title Case ("Chicken Thigh", "King Prawn")
// but read mid-sentence in the method and after the first word of the blurb.
const lc = (s) => (s ? String(s).toLowerCase() : s);

function listJoin(arr) {
  if (arr.length <= 1) return arr[0] || '';
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`;
}

// Which grammatical form a sauce takes in prose.
const DRESSING_RE =
  /Pesto|Salsa Verde|Salsa Roja|Salsa Macha|Chimichurri|Gremolata|Chermoula|Green Goddess|Tzatziki|Romesco|Mojo|Nam Jim|Ponzu|Aji Verde|Salmoriglio|Lemon Tahini|Ginger & Scallion|Sofrito|Sumac & Lemon|Lemon & Garlic|Harissa Yoghurt|Lemongrass & Lime/i;
const RUB_RE =
  /Za'atar|Ras el Hanout|Baharat|Cajun|Blackened|Tandoori|Jerk|Fajita-Spiced|Peri Peri|Piri Lemon|Harissa\b/i;

function saucePhrase(word) {
  const w = word.toLowerCase();
  const article = /^[aeiou]/.test(w) ? 'an' : 'a';
  if (DRESSING_RE.test(word)) return { kind: 'dressing', blurb: w, method: w };
  if (RUB_RE.test(word)) {
    // "blackened", "fajita-spiced" already read as spice descriptors
    const phrase = /(ed|spiced)$/.test(w) ? w : `${w} spicing`;
    return { kind: 'rub', blurb: phrase, method: phrase };
  }
  return { kind: 'sauce', blurb: `${article} ${w} sauce`, method: `${w} sauce` };
}

// Aromatics + finishing herbs tuned to the sauce's cuisine.
//   list  — ingredient-line form, with quantities
//   arom  — how it reads mid-method ("the onion, garlic and ginger")
//   finish — the scatter at the end
function cuisineExtras(cuisine) {
  switch (cuisine) {
    case 'indian':
      return { list: '1 onion, 3 garlic cloves and 1 thumb ginger, all finely chopped', arom: 'onion, garlic and ginger', finish: 'fresh coriander and a spoonful of yoghurt' };
    case 'east-asian':
      return { list: '4 garlic cloves, 1 thumb ginger and 4 spring onions', arom: 'garlic and ginger', finish: 'sliced spring onion, toasted sesame and lime wedges' };
    case 'mexican':
      return { list: '1 onion, 3 garlic cloves and 1 tsp ground cumin', arom: 'onion, garlic and cumin', finish: 'coriander, soured cream and lime wedges' };
    case 'caribbean':
      return { list: '1 onion, 4 garlic cloves and a few thyme sprigs', arom: 'onion, garlic and thyme', finish: 'lime wedges and extra hot sauce' };
    case 'italian':
      return { list: '1 onion and 3 garlic cloves, finely chopped', arom: 'onion and garlic', finish: 'torn basil and grated Parmesan' };
    case 'french':
      return { list: '2 shallots and 2 garlic cloves, finely chopped', arom: 'shallot and garlic', finish: 'chopped parsley and a squeeze of lemon' };
    case 'med':
      return { list: '1 onion and 3 garlic cloves, plus 1 tsp dried oregano', arom: 'onion, garlic and oregano', finish: 'chopped parsley, lemon and a drizzle of olive oil' };
    case 'middle-eastern':
      return { list: '1 onion, 3 garlic cloves and 1 tsp ground cumin', arom: 'onion, garlic and cumin', finish: 'chopped parsley, pomegranate seeds and olive oil' };
    case 'american':
      return { list: '1 onion and 3 garlic cloves', arom: 'onion and garlic', finish: 'sliced spring onion and a wedge of lemon' };
    default:
      return { list: '1 onion and 2 garlic cloves', arom: 'onion and garlic', finish: 'a squeeze of lemon and chopped herbs' };
  }
}

// A short sentence of character for the blurb, from spice + tags + technique.
function characterLine(s, t) {
  const tags = s.tags || [];
  if (s.spicy >= 3) return 'Full-on chilli heat — have something cold within reach.';
  if (tags.includes('indulgent')) return 'Rich, glossy and squarely comfort-food.';
  if (tags.includes('smoky')) return 'Deep and smoky, with a bit of char.';
  if (tags.includes('herby')) return 'Green and herby, kept lively with plenty of acid.';
  if (tags.includes('fresh') || tags.includes('zesty')) return 'Clean, bright and citrus-sharp.';
  if (tags.includes('savoury')) return 'Deeply savoury and moreish.';
  if (s.spicy === 2) return 'A proper warm kick without going overboard.';
  if (t.richness === 'light') return 'Light on its feet but still a full plate.';
  if (t.richness === 'hearty') return 'Generous, filling and low on fuss.';
  return 'Straightforward midweek cooking with a bit of personality.';
}

function scaleQty(str, servings) {
  if (!str || servings === 4) return str;
  const f = servings / 4;
  // leave spoon measures and lengths alone; scale a leading amount otherwise
  if (/^\d+(?:\.\d+)?\s*(tbsp|tsp|cm)\b/i.test(str)) return str;
  return str.replace(/^(\d+(?:\.\d+)?)/, (num) => {
    const n = parseFloat(num) * f;
    const val = n < 1 ? Math.max(0.5, Math.round(n * 20) / 20) : Math.round(n * 2) / 2;
    return val === 0.5 ? '½' : String(val);
  });
}

/** Rebuild blurb + ingredients + method for a composed home dish. */
export function buildRecipe({ tech, sauce, protein, carb, veg, servings = 4 }) {
  const t = TECHNIQUES[tech];
  const p = PROTEINS[protein];
  const s = SAUCES[sauce];
  if (!t || !p || !s) return null;

  const vegNames = (veg && veg.length ? veg : [1]).map((k) =>
    typeof k === 'number' ? VEG[k] || VEG[1] : k,
  );
  const cShort = CARB_SHORT[carb] || 'a side';
  const sp = saucePhrase(s.word);
  const x = cuisineExtras(s.cuisine);

  // ---- blurb ----
  const pl = lc(p.word);
  let mid;
  if (sp.kind === 'dressing') mid = `${t.verb} and finished with ${sp.blurb}`;
  else if (sp.kind === 'rub') mid = `${t.verb} with ${sp.blurb}`;
  else if (t.join === 'with') mid = `${t.verb} with ${s.word.toLowerCase()}`;
  else mid = `${t.verb} in ${sp.blurb}`;
  const vegConn = / with /.test(mid) ? 'plus' : 'with';
  const vegBit = vegNames.length ? `, ${vegConn} ${listJoin(vegNames)}` : '';
  const carbIntrinsic =
    tech === 'pasta' ||
    tech === 'noodles' ||
    tech === 'wrap' ||
    tech === 'loaded' ||
    (tech === 'bowl' && (carb === 'rice' || carb === 'grains'));
  const carbBit = carbIntrinsic
    ? ''
    : carb === 'none' || carb === 'salad'
      ? ` and ${cShort}`
      : `, served with ${cShort}`;
  const blurb = `${cap(pl)} ${mid}${vegBit}${carbBit}. ${characterLine(s, t)}`;

  // ---- ingredients ----
  const vegWeight = Math.max(200, servings * 100 + 100);
  const ingredients = [
    scaleQty(p.qty, servings),
    ...s.ing,
    `${cap(listJoin(vegNames))} — about ${vegWeight}g, trimmed and cut for cooking`,
    x.list,
    scaleQty(CARB_LINE[carb] || 'a side salad, to serve', servings),
    s.cuisine === 'east-asian'
      ? '1 tbsp neutral oil, plus 1 tsp sesame oil'
      : '2 tbsp olive oil',
    'Sea salt and freshly ground black pepper',
    `To finish: ${x.finish}`,
  ];

  // ---- method ----
  const method = t.method(p.word, sp.method, cShort, listJoin(vegNames), {
    cuisine: s.cuisine,
    spicy: s.spicy,
    aromatics: x.arom,
    finish: x.finish,
  });

  return { blurb, ingredients, method, servings };
}
