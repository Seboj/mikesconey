// PLACEHOLDER: Replace with actual restaurant details

export interface SiteConfig {
  name: string;
  tagline: string;
  since: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    full: string;
  };
  phone: {
    display: string;
    tel: string;
  };
  hours: Array<{
    day: string;
    open: string;
    close: string;
    closed?: boolean;
  }>;
  social: {
    instagram: string;
    facebook: string;
  };
  maps: {
    embedUrl: string;
    directionsUrl: string;
  };
  seo: {
    titleTemplate: string;
    description: string;
    ogImage: string;
  };
}

export const site: SiteConfig = {
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

  hours: [
    { day: "Monday", open: "6:00 AM", close: "9:00 PM" },
    { day: "Tuesday", open: "6:00 AM", close: "9:00 PM" },
    { day: "Wednesday", open: "6:00 AM", close: "9:00 PM" },
    { day: "Thursday", open: "6:00 AM", close: "9:00 PM" },
    { day: "Friday", open: "6:00 AM", close: "9:00 PM" },
    { day: "Saturday", open: "7:00 AM", close: "10:00 PM" },
    { day: "Sunday", open: "7:00 AM", close: "8:00 PM" },
  ],

  social: {
    // PLACEHOLDER: Replace with actual social media URLs
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
};
