export interface Review {
  text: string;
  author: string;
  rating: number;
}

export const aboutReviews: Review[] = [
  {
    text: "We stop at Mike's every time we drive through Holly. The coney dogs are the real deal — homemade chili, diced onions, perfect mustard line. My kids beg for it every road trip.",
    author: "Mike T.",
    rating: 5,
  },
  {
    text: "Hands down the best breakfast spot in the area. The omelets are huge, the hash browns are crispy, and the coffee never stops flowing. It's our Saturday morning tradition.",
    author: "Karen W.",
    rating: 5,
  },
  {
    text: "I've been eating at Mike's since I was a kid growing up in Holly. The prices are honest, the portions are generous, and it still tastes exactly the same after all these years.",
    author: "Brian S.",
    rating: 5,
  },
  {
    text: "Tried the gyro plate on a friend's recommendation and was blown away. Fresh, flavorful, and the pita was warm. Not what I expected from a coney island — in the best way.",
    author: "Lisa P.",
    rating: 4,
  },
  {
    text: "Clean, quick, friendly. Grabbed lunch on a work break and was in and out in 20 minutes with a full meal. The BLT and onion rings are seriously underrated.",
    author: "Tom H.",
    rating: 4,
  },
];

export const aboutOverallRating = 4.8;
export const aboutReviewCount = 127;
