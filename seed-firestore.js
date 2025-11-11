/**
 * seed-firestore.js
 * -----------------
 * Seed Firestore with mock recipes using local image paths (no uploads).
 *
 * Usage:
 * 1) npm install firebase-admin
 * 2) put serviceAccountKey.json in project root
 * 3) node seed-firestore.js
 *
 * Notes:
 * - Images are NOT uploaded. Each recipe's imageUrl will be "/assets/<imageFile>"
 *   so your frontend should be set up to serve assets from that path (or adjust).
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_KEY = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(SERVICE_KEY)) {
  console.error('Missing serviceAccountKey.json in project root. Download from Firebase Console -> Service accounts.');
  process.exit(1);
}

const serviceAccount = require(SERVICE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const LOCAL_ASSETS_DIR = path.join(__dirname, 'src', 'assets'); // used only for file-existence warnings

// --- Full recipe list (from your App.tsx mock data) ---
const initialRecipes = [
  { id: "1", title: "Spaghetti Carbonara", description: "Classic Italian pasta with eggs, cheese, pancetta, and pepper.", category: "Italian", imageFile: "carbonara.jpg", ingredients: ["Spaghetti", "Eggs", "Pancetta", "Parmesan Cheese", "Black Pepper"], steps: "Cook pasta. Fry pancetta. Mix eggs and cheese. Combine all.", author: "Chef Luigi" },
  { id: "2", title: "Butter Chicken", description: "Rich and creamy Indian chicken curry.", category: "Indian", imageFile: "Butter-Chicken.jpg", ingredients: ["Chicken", "Butter", "Tomatoes", "Cream", "Spices"], steps: "Marinate chicken. Cook sauce. Combine and simmer.", author: "Chef Priya" },
  { id: "3", title: "Samp and Braai Meat", description: "South African traditional samp served with grilled braai meat.", category: "South African", imageFile: "foods.jpg", ingredients: ["Samp", "Beef", "Spices", "Onions", "Tomatoes"], steps: "Cook samp until soft. Grill meat. Serve together.", author: "Chef Thabo" },
  { id: "4", title: "Dumplings, Spanish Creamy, Chakalaka, Beef Stew", description: "A full South African meal with various sides and stews.", category: "South African", imageFile: "sam.jpg", ingredients: ["Flour", "Butter", "Cream", "Vegetables", "Beef", "Spices"], steps: "Prepare dumplings. Cook stews and chakalaka. Serve together.", author: "Chef Lerato" },
  { id: "5", title: "Tacos", description: "Traditional Mexican tacos with fresh toppings.", category: "Mexican", imageFile: "ttacos.jpg", ingredients: ["Taco shells", "Beef", "Lettuce", "Tomatoes", "Cheese", "Salsa"], steps: "Cook beef. Assemble tacos with toppings. Serve.", author: "Chef Miguel" },
  { id: "6", title: "Sushi", description: "Japanese sushi rolls with rice and fresh fish.", category: "Other", imageFile: "sushi.jpg", ingredients: ["Sushi rice", "Nori", "Raw fish", "Avocado", "Cucumber", "Soy sauce"], steps: "Prepare rice. Roll sushi with fillings. Slice and serve.", author: "Chef Sato" },
  { id: "7", title: "Bobotie", description: "Traditional South African minced meat dish with egg topping.", category: "South Africa", imageFile: "bobotie.jpeg", ingredients: ["Minced meat", "Bread", "Milk", "Eggs", "Spices"], steps: "Mix meat with spices and soaked bread. Bake with egg topping.", author: "Chef Nomsa" },
  { id: "8", title: "Fatcakes", description: "Deep-fried dough, traditional South African snack.", category: "South Africa", imageFile: "fatcakes.jpeg", ingredients: ["Flour", "Yeast", "Sugar", "Salt", "Water", "Oil for frying"], steps: "Prepare dough. Deep fry until golden brown.", author: "Chef Sipho" },
  { id: "9", title: "Milk Tart", description: "Classic South African sweet milk tart.", category: "Desserts", imageFile: "Milk-tart.jpg", ingredients: ["Milk", "Sugar", "Flour", "Eggs", "Pastry crust", "Cinnamon"], steps: "Prepare crust. Cook milk filling. Bake and sprinkle with cinnamon.", author: "Chef Anna" },
  { id: "10", title: "Malva Pudding", description: "Traditional South African dessert, spongy and sweet.", category: "Desserts", imageFile: "Malva-pudding.jpg", ingredients: ["Flour", "Sugar", "Eggs", "Butter", "Apricot jam", "Cream"], steps: "Mix ingredients. Bake. Serve with cream or custard.", author: "Chef Marco" },
  { id: "14", title: "Chocolate Brownies", description: "Fudgy and rich chocolate brownies.", category: "Desserts", imageFile: "brownies.jpeg", ingredients: ["Butter", "Chocolate", "Sugar", "Eggs", "Flour", "Vanilla extract"], steps: "Melt butter and chocolate. Mix in sugar and eggs. Fold in flour. Bake at 180°C for 25-30 mins.", author: "Chef Anna" },
  { id: "15", title: "Cheesecake", description: "Classic creamy cheesecake with a biscuit base.", category: "Desserts", imageFile: "cheesecake.jpeg", ingredients: ["Cream cheese", "Sugar", "Eggs", "Vanilla", "Biscuit base", "Butter"], steps: "Mix cream cheese, sugar, and eggs. Pour on biscuit base. Bake at 160°C until set. Chill before serving.", author: "Chef Marco" },
  { id: "16", title: "Tiramisu", description: "Italian dessert with mascarpone, coffee, and cocoa.", category: "Desserts", imageFile: "tiramisu.jpeg", ingredients: ["Mascarpone", "Coffee", "Ladyfingers", "Sugar", "Cocoa powder", "Eggs"], steps: "Layer coffee-soaked ladyfingers and mascarpone mixture. Dust with cocoa powder. Chill before serving.", author: "Chef Luigi" },
  { id: "17", title: "Crème Brûlée", description: "French custard topped with caramelized sugar.", category: "Desserts", imageFile: "cremebrulee.jpeg", ingredients: ["Cream", "Egg yolks", "Sugar", "Vanilla"], steps: "Bake custard in ramekins. Cool and sprinkle sugar on top. Caramelize with torch.", author: "Chef Marie" },
  { id: "18", title: "Apple Pie", description: "Classic pie with spiced apple filling.", category: "Desserts", imageFile: "applepie.jpeg", ingredients: ["Apples", "Sugar", "Cinnamon", "Pie crust", "Butter", "Flour"], steps: "Prepare crust. Mix apples with sugar and cinnamon. Fill crust and bake at 180°C for 45 mins.", author: "Chef John" },
  { id: "19", title: "Pavlova", description: "Meringue-based dessert topped with whipped cream and fruit.", category: "Desserts", imageFile: "pavlova.jpeg", ingredients: ["Egg whites", "Sugar", "Cornstarch", "Vinegar", "Whipped cream", "Fruit"], steps: "Whip egg whites and sugar. Bake until crisp. Top with cream and fresh fruit.", author: "Chef Emma" },
  { id: "20", title: "Cupcakes", description: "Mini cakes with frosting.", category: "Desserts", imageFile: "cupcakes.jpeg", ingredients: ["Flour", "Sugar", "Eggs", "Butter", "Milk", "Baking powder", "Frosting"], steps: "Mix batter and bake in cupcake tins at 180°C for 20 mins. Frost when cooled.", author: "Chef Lily" },
  { id: "21", title: "Chocolate Chip Cookies", description: "Classic cookies with chocolate chips.", category: "Desserts", imageFile: "cookies.jpeg", ingredients: ["Flour", "Sugar", "Butter", "Eggs", "Chocolate chips", "Vanilla extract"], steps: "Mix ingredients. Scoop onto tray. Bake at 180°C for 10-12 mins.", author: "Chef Tom" },
  { id: "22", title: "Banana Bread", description: "Moist banana loaf with nuts.", category: "Desserts", imageFile: "bananabread.jpeg", ingredients: ["Bananas", "Flour", "Sugar", "Eggs", "Butter", "Baking soda", "Nuts"], steps: "Mash bananas. Mix with other ingredients. Bake at 175°C for 50-60 mins.", author: "Chef Sara" },
  { id: "23", title: "Panna Cotta", description: "Italian creamy dessert with gelatin.", category: "Desserts", imageFile: "pannacotta.jpeg", ingredients: ["Cream", "Sugar", "Vanilla", "Gelatin", "Berries"], steps: "Heat cream and sugar. Add gelatin and vanilla. Chill until set. Serve with berries.", author: "Chef Alberto" },
  { id: "24", title: "Lemon Tart", description: "Tart with zesty lemon filling.", category: "Desserts", imageFile: "lemonTart.jpeg", ingredients: ["Flour", "Sugar", "Butter", "Eggs", "Lemon juice", "Zest"], steps: "Prepare crust. Mix lemon filling. Bake at 180°C until set. Cool before serving.", author: "Chef Claire" },
  { id: "25", title: "Eclairs", description: "French pastry filled with cream and topped with chocolate.", category: "Desserts", imageFile: "eclairs.jpeg", ingredients: ["Flour", "Butter", "Eggs", "Cream", "Chocolate", "Sugar"], steps: "Bake choux pastry. Fill with cream. Top with chocolate glaze.", author: "Chef Pierre" },
  { id: "26", title: "Churros", description: "Spanish fried dough sticks with sugar and cinnamon.", category: "Desserts", imageFile: "churros.jpeg", ingredients: ["Flour", "Water", "Butter", "Sugar", "Cinnamon", "Oil for frying"], steps: "Prepare dough. Pipe into hot oil. Fry until golden. Roll in sugar and cinnamon.", author: "Chef Miguel" },
  { id: "27", title: "Crepes", description: "Thin French pancakes with sweet fillings.", category: "Desserts", imageFile: "crepes.jpeg", ingredients: ["Flour", "Milk", "Eggs", "Sugar", "Butter", "Filling (chocolate, fruit, cream)"], steps: "Prepare batter. Cook thin pancakes on a skillet. Fill with desired filling and serve.", author: "Chef Sophie" },
  { id: "28", title: "Pecan Pie", description: "Sweet pie with pecan nuts and syrupy filling.", category: "Desserts", imageFile: "pecanpie.jpeg", ingredients: ["Pie crust", "Pecans", "Sugar", "Eggs", "Butter", "Vanilla"], steps: "Prepare crust. Mix filling. Bake at 175°C for 50 mins.", author: "Chef Daniel" },
  { id: "29", title: "Raspberry Cheesecake", description: "Cheesecake topped with fresh raspberries.", category: "Desserts", imageFile: "raspberrycheesecake.jpeg", ingredients: ["Cream cheese", "Sugar", "Eggs", "Biscuit base", "Raspberries"], steps: "Prepare base. Mix cream cheese and sugar. Bake and top with raspberries.", author: "Chef Lisa" },
];

// Helper: slugify author -> userId
function slugify(name) {
  return (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

// Optional: clear collections before seeding (safe for dev)
async function clearCollection(collectionName) {
  console.log(`Clearing collection: ${collectionName}`);
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) {
    console.log(`  (no documents in ${collectionName})`);
    return;
  }
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`  cleared ${snapshot.size} documents from ${collectionName}`);
}

async function seed() {
  console.log('Starting Firestore seeding (no image uploads).');

  try {
    // CLEAR existing (COMMENT OUT if you don't want to delete existing data)
    await clearCollection('recipes');
    await clearCollection('users');

    // Build user docs from unique authors
    const authors = {};
    initialRecipes.forEach((r) => {
      const authorName = r.author || 'unknown';
      const id = slugify(authorName) || `user-${Math.random().toString(36).slice(2,8)}`;
      if (!authors[id]) {
        authors[id] = {
          id,
          name: authorName,
          username: id,
          // default profile pic path (you can change)
          avatarUrl: '/assets/foods.jpg',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
      }
    });

    // Write users
    console.log('Writing users...');
    for (const uid of Object.keys(authors)) {
      const userDoc = authors[uid];
      await db.collection('users').doc(uid).set(userDoc);
      console.log(`  user: ${userDoc.name} -> users/${uid}`);
    }

    // Write recipes (imageUrl set to project relative path)
    console.log('Writing recipes...');
    for (const r of initialRecipes) {
      const imageUrl = r.imageFile ? `/assets/${r.imageFile}` : '';
      // warn if local file missing (helpful)
      const localPath = path.join(LOCAL_ASSETS_DIR, r.imageFile || '');
      if (r.imageFile && !fs.existsSync(localPath)) {
        console.warn(`  (warning) local asset not found: ${localPath} — still writing imageUrl as ${imageUrl}`);
      }

      const doc = {
        title: r.title || '',
        description: r.description || '',
        category: r.category || '',
        imageUrl,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        steps: r.steps || '',
        author: r.author || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docId = String(r.id || r.title || Math.random().toString(36).slice(2,8));
      await db.collection('recipes').doc(docId).set(doc);
      console.log(`  recipe: ${r.title} -> recipes/${docId}`);
    }

    console.log('✅ Seeding complete. Check Firestore for "recipes" and "users" collections.');
    console.log('Note: images are referenced as local paths like "/assets/<filename>" and were not uploaded.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
