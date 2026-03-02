import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcrypt";
import { adminUsers, siteContent } from "./schema.js";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;

async function seed() {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  // Seed admin user
  const email = process.env.ADMIN_EMAIL || "admin@mikesconey.com";
  const password = process.env.ADMIN_PASSWORD || "changeme";

  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Admin user "${email}" already exists, skipping seed.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await db.insert(adminUsers).values({
      email,
      passwordHash,
      name: "Admin",
    });
    console.log(`Admin user "${email}" created.`);
  }

  // Seed site content
  const contentSeeds: { key: string; value: unknown }[] = [
    {
      key: "site_info",
      value: {
        name: "Mike's Coney Island",
        tagline: "Classic Coneys, Burgers & Breakfast in Holly, Michigan",
        since: "Since 1995",
        address: {
          street: "15203 N Holly Rd",
          city: "Holly",
          state: "MI",
          zip: "48442",
          full: "15203 N Holly Rd, Holly, MI 48442",
        },
        phone: {
          display: "(248) 634-3555",
          tel: "tel:+12486343555",
        },
        social: {
          instagram: "https://www.instagram.com/mikesconeyisland",
          facebook: "https://www.facebook.com/mikesconeyisland",
        },
        maps: {
          embedUrl:
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2934.5!2d-83.6275!3d42.7915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8824a5c7d1e2f3a5%3A0xabcdef1234567890!2s15203+N+Holly+Rd%2C+Holly%2C+MI+48442!5e0!3m2!1sen!2sus!4v1709330000000",
          directionsUrl:
            "https://www.google.com/maps/dir/?api=1&destination=15203+N+Holly+Rd+Holly+MI+48442",
        },
        seo: {
          titleTemplate: "%s | Mike's Coney Island",
          description:
            "Classic coney dogs, burgers, and breakfast in Holly, Michigan. Family-owned since 1995.",
          ogImage: "/og-image.jpg",
        },
      },
    },
    {
      key: "hours",
      value: [
        { day: "Monday", open: "6:00 AM", close: "9:00 PM" },
        { day: "Tuesday", open: "6:00 AM", close: "9:00 PM" },
        { day: "Wednesday", open: "6:00 AM", close: "9:00 PM" },
        { day: "Thursday", open: "6:00 AM", close: "9:00 PM" },
        { day: "Friday", open: "6:00 AM", close: "9:00 PM" },
        { day: "Saturday", open: "7:00 AM", close: "10:00 PM" },
        { day: "Sunday", open: "7:00 AM", close: "8:00 PM" },
      ],
    },
    {
      key: "menu",
      value: {
        categories: [
          {
            name: "Coney Dogs",
            description:
              "Our famous Michigan-style coneys — snappy natural-casing dogs loaded with our homemade chili sauce, diced onions, and yellow mustard.",
            items: [
              { name: "Regular Coney", description: "Snappy natural-casing dog topped with our homemade coney sauce, diced onions, and yellow mustard.", price: "$3.49", tags: [] },
              { name: "Cheese Coney", description: "Our classic coney smothered in melted cheddar cheese.", price: "$3.99", tags: [] },
              { name: "Coney Island Special", description: "Two regular coneys, fries, and a drink — the full Michigan coney island experience.", price: "$8.99", tags: [] },
              { name: "Chili Dog", description: "All-beef dog loaded with our hearty homemade chili and topped with shredded cheddar.", price: "$4.49", tags: [] },
              { name: "Loose Burger", description: "Seasoned ground beef served loose on a steamed bun with onions and mustard — no patty, all flavor.", price: "$3.99", tags: [] },
              { name: "Foot-Long Coney", description: "A foot-long natural-casing dog with double the coney sauce, onions, and mustard.", price: "$5.99", tags: [] },
            ],
          },
          {
            name: "Burgers",
            description:
              "Hand-pressed patties grilled to order on our flat-top. Served with lettuce, tomato, and pickle.",
            items: [
              { name: "Hamburger", description: "Classic hand-pressed beef patty with lettuce, tomato, onion, and pickle.", price: "$5.99", tags: [] },
              { name: "Cheeseburger", description: "Our classic burger topped with melted American cheese.", price: "$6.49", tags: [] },
              { name: "Bacon Cheeseburger", description: "Thick-cut bacon and melted cheddar on a hand-pressed patty.", price: "$7.99", tags: [] },
              { name: "Mushroom Swiss Burger", description: "Sauteed mushrooms and melted Swiss cheese on a juicy patty.", price: "$7.99", tags: [] },
              { name: "Patty Melt", description: "Beef patty with grilled onions and Swiss cheese on toasted rye bread.", price: "$7.49", tags: [] },
              { name: "Double Cheeseburger", description: "Two hand-pressed patties with double American cheese — for serious appetites.", price: "$9.49", tags: [] },
            ],
          },
          {
            name: "Sandwiches",
            description:
              "Diner classics made fresh. All sandwiches served with pickle spear and chips unless upgraded to fries.",
            items: [
              { name: "BLT", description: "Crispy bacon, fresh lettuce, and ripe tomato on toasted white bread with mayo.", price: "$6.49", tags: [] },
              { name: "Grilled Cheese", description: "Melted American cheese on buttery grilled white bread. Simple and perfect.", price: "$4.99", tags: ["V"] },
              { name: "Club Sandwich", description: "Triple-decker with turkey, bacon, lettuce, tomato, and mayo on toasted bread.", price: "$8.49", tags: [] },
              { name: "Tuna Melt", description: "Homemade tuna salad with melted cheddar on grilled rye bread.", price: "$7.49", tags: [] },
              { name: "Philly Cheesesteak", description: "Thinly sliced steak with sauteed peppers, onions, and melted provolone on a hoagie roll.", price: "$8.99", tags: [] },
              { name: "Grilled Chicken Sandwich", description: "Seasoned grilled chicken breast with lettuce, tomato, and honey mustard on a brioche bun.", price: "$7.99", tags: [] },
            ],
          },
          {
            name: "Breakfast",
            description:
              "Served all day — because the best breakfasts don't watch the clock. Eggs cooked to order.",
            items: [
              { name: "Two Eggs Any Style", description: "Two eggs cooked your way with hash browns, toast, and your choice of bacon or sausage.", price: "$6.99", tags: ["GF"] },
              { name: "Western Omelette", description: "Three-egg omelette stuffed with ham, peppers, onions, and cheddar. Served with hash browns and toast.", price: "$8.99", tags: ["GF"] },
              { name: "Cheese Omelette", description: "Three-egg omelette with melted cheddar and American cheese. Served with hash browns and toast.", price: "$7.99", tags: ["V", "GF"] },
              { name: "Veggie Omelette", description: "Three-egg omelette with mushrooms, peppers, onions, tomato, and cheddar. Served with hash browns and toast.", price: "$8.49", tags: ["V", "GF"] },
              { name: "Short Stack Pancakes", description: "Three fluffy buttermilk pancakes with butter and warm maple syrup.", price: "$5.99", tags: ["V"] },
              { name: "French Toast", description: "Thick-cut bread dipped in cinnamon egg batter, griddled golden. Served with butter and syrup.", price: "$6.49", tags: ["V"] },
              { name: "Breakfast Burrito", description: "Scrambled eggs, sausage, cheddar, peppers, and onions wrapped in a warm flour tortilla. Served with salsa.", price: "$7.99", tags: [] },
              { name: "Biscuits & Gravy", description: "Two fluffy buttermilk biscuits smothered in our homemade sausage gravy.", price: "$6.49", tags: [] },
            ],
          },
          {
            name: "Sides",
            description: "The perfect sidekick to any meal.",
            items: [
              { name: "French Fries", description: "Crispy golden fries seasoned with salt.", price: "$2.99", tags: ["V", "GF"] },
              { name: "Onion Rings", description: "Beer-battered onion rings fried until golden and crunchy.", price: "$3.99", tags: ["V"] },
              { name: "Chili Cheese Fries", description: "Crispy fries loaded with our homemade chili and melted cheddar cheese.", price: "$4.99", tags: [] },
              { name: "Cole Slaw", description: "Creamy homemade coleslaw — cool and tangy.", price: "$2.49", tags: ["V", "GF"] },
              { name: "Side Salad", description: "Mixed greens with tomato, cucumber, and croutons. Choice of dressing.", price: "$3.49", tags: ["V"] },
              { name: "Cup of Chili", description: "A hearty cup of our homemade beef chili topped with cheddar and onions.", price: "$3.99", tags: ["GF"] },
            ],
          },
          {
            name: "Beverages",
            description: "Hot, cold, and everything in between.",
            items: [
              { name: "Coffee", description: "Fresh-brewed house coffee. Free refills.", price: "$1.99", tags: ["V", "GF"] },
              { name: "Soft Drinks", description: "Coca-Cola, Diet Coke, Sprite, Dr Pepper, Lemonade. Free refills.", price: "$2.49", tags: ["V", "GF"] },
              { name: "Milkshake", description: "Thick hand-spun milkshake — chocolate, vanilla, or strawberry.", price: "$4.99", tags: ["V"] },
              { name: "Orange Juice", description: "Fresh-squeezed orange juice.", price: "$2.99", tags: ["V", "GF"] },
              { name: "Hot Chocolate", description: "Rich hot cocoa topped with whipped cream.", price: "$2.49", tags: ["V"] },
              { name: "Iced Tea", description: "Freshly brewed iced tea — sweetened or unsweetened.", price: "$2.49", tags: ["V", "GF"] },
            ],
          },
        ],
      },
    },
    {
      key: "faq",
      value: [
        { question: "What are your hours?", answer: "We're open Monday through Friday from 6:00 AM to 9:00 PM, Saturday from 7:00 AM to 10:00 PM, and Sunday from 7:00 AM to 8:00 PM. Hours may vary on holidays, so give us a call at (248) 634-3555 to confirm!" },
        { question: "Do you offer takeout?", answer: "Absolutely! You can call ahead at (248) 634-3555 to place your order and we'll have it ready for pickup when you arrive. It's the quickest way to get your coney fix!" },
        { question: "Where can I park?", answer: "We have a free parking lot right in front of the restaurant on N Holly Rd. There's plenty of space, so finding a spot is never an issue." },
        { question: "Do you have a kids menu?", answer: "You bet! We've got kid-friendly favorites like grilled cheese, chicken tenders, and mini corn dogs — all at kid-friendly prices. The little ones love it here." },
        { question: "Do you have vegetarian options?", answer: "Yes! We offer salads, grilled cheese, veggie wraps, and several breakfast options that don't include meat. Just ask your server and they'll point you in the right direction." },
        { question: "Do you accept credit cards?", answer: "We accept all major credit and debit cards, as well as cash. Whatever's easiest for you!" },
        { question: "Are you open on holidays?", answer: "We're open most holidays, but hours may vary. We recommend calling ahead at (248) 634-3555 to confirm our holiday schedule before heading over." },
        { question: "Where exactly are you in Holly?", answer: "We're located at 15203 N Holly Rd in Holly, Michigan — right on the main road, easy to find. Look for us just north of downtown Holly!" },
        { question: "Is there dine-in seating available?", answer: "Yes! We have plenty of booth and table seating for families, couples, and groups. Come on in and grab a seat — no reservations needed." },
        { question: "Can I call ahead for a large order?", answer: "Definitely! For large orders or group pickups, give us a call at (248) 634-3555 and we'll make sure everything is ready when you need it." },
      ],
    },
    {
      key: "reviews",
      value: {
        overallRating: 4.8,
        reviewCount: 127,
        reviews: [
          { text: "We stop at Mike's every time we drive through Holly. The coney dogs are the real deal — homemade chili, diced onions, perfect mustard line. My kids beg for it every road trip.", author: "Mike T.", rating: 5 },
          { text: "Hands down the best breakfast spot in the area. The omelets are huge, the hash browns are crispy, and the coffee never stops flowing. It's our Saturday morning tradition.", author: "Karen W.", rating: 5 },
          { text: "I've been eating at Mike's since I was a kid growing up in Holly. The prices are honest, the portions are generous, and it still tastes exactly the same after all these years.", author: "Brian S.", rating: 5 },
          { text: "Tried the gyro plate on a friend's recommendation and was blown away. Fresh, flavorful, and the pita was warm. Not what I expected from a coney island — in the best way.", author: "Lisa P.", rating: 4 },
          { text: "Clean, quick, friendly. Grabbed lunch on a work break and was in and out in 20 minutes with a full meal. The BLT and onion rings are seriously underrated.", author: "Tom H.", rating: 4 },
        ],
      },
    },
    {
      key: "gallery",
      value: [
        { id: "food-1", src: "/images/gallery/placeholder-food-1.svg", alt: "Classic coney dogs with homemade chili sauce", caption: "Our famous coneys", category: "food", isPlaceholder: true },
        { id: "food-2", src: "/images/gallery/placeholder-food-2.svg", alt: "Fluffy pancakes with butter and maple syrup", caption: "All-day breakfast", category: "food", isPlaceholder: true },
        { id: "food-3", src: "/images/gallery/placeholder-food-3.svg", alt: "Juicy double cheeseburger with fries", caption: "Burgers done right", category: "food", isPlaceholder: true },
        { id: "food-4", src: "/images/gallery/placeholder-food-4.svg", alt: "Greek salad with gyro meat and pita", caption: "Fresh gyro plate", category: "food", isPlaceholder: true },
        { id: "atmosphere-1", src: "/images/gallery/placeholder-atmosphere-1.svg", alt: "Cozy diner counter with red stools", category: "atmosphere", isPlaceholder: true },
        { id: "atmosphere-2", src: "/images/gallery/placeholder-atmosphere-2.svg", alt: "Warm dining room with booth seating", category: "atmosphere", isPlaceholder: true },
        { id: "atmosphere-3", src: "/images/gallery/placeholder-atmosphere-3.svg", alt: "Mike's Coney Island storefront on Holly Road", category: "atmosphere", isPlaceholder: true },
        { id: "people-1", src: "/images/gallery/placeholder-people-1.svg", alt: "Friendly staff behind the counter", category: "people", isPlaceholder: true },
        { id: "people-2", src: "/images/gallery/placeholder-people-2.svg", alt: "Family enjoying breakfast together", category: "people", isPlaceholder: true },
      ],
    },
    {
      key: "specials",
      value: [
        { day: "Monday", title: "Burger Monday", description: "All burgers $1 off — including our bacon cheeseburger and patty melt!", price: "$1 off", active: true },
        { day: "Tuesday", title: "Coney Tuesday", description: "All coneys just $2.49 all day! Grab 'em while they're hot.", price: "$2.49", active: true },
        { day: "Wednesday", title: "Breakfast for Less", description: "Any breakfast plate $1 off — eggs, omelets, pancakes, you name it.", price: "$1 off", active: true },
        { day: "Thursday", title: "Throwback Thursday", description: "Kids eat free with any adult entree purchase. One kid's meal per adult.", active: true },
        { day: "Friday", title: "Fish Fry Friday", description: "Golden fried fish basket with fries and coleslaw — a Michigan tradition.", price: "$7.99", active: true },
        { day: "Saturday", title: "Family Combo Deal", description: "4 coneys, 2 fries, and 4 drinks for just $19.99. Feed the whole crew!", price: "$19.99", active: true },
        { day: "Sunday", title: "Sunday Brunch Special", description: "Two eggs, hash browns, bacon, toast, and unlimited coffee for one low price.", price: "$6.99", active: true },
      ],
    },
  ];

  for (const { key, value } of contentSeeds) {
    const existingContent = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.key, key))
      .limit(1);

    if (existingContent.length > 0) {
      console.log(`Content "${key}" already exists, skipping.`);
    } else {
      await db.insert(siteContent).values({ key, value });
      console.log(`Content "${key}" seeded.`);
    }
  }

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
