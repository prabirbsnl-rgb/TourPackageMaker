



const field = (
  name,
  label,
  type = "text",
  options = [],
  extra = {}
) => ({
  name,
  label,
  type,
  options,
  required: false,
  ...extra,
});

// ==========================================
// COMMON FIELDS — ALL ACCOMMODATION CATEGORIES
// ==========================================

export const HOTEL_COMMON_FIELDS = {
  identification: [
    field("propertyName", "Property Name", "text", [], {
      required: true,
    }),
    field("displayName", "Display Name"),
    field("propertyDescription", "Property Description", "textarea"),
  ],

  location: [
    field("country", "Country", "country", [], {
      required: true,
    }),
    field("stateProvince", "State / Province / Region", "region", [], {
      required: true,
    }),
    field("city", "City", "city", [], {
      required: true,
    }),
    field("area", "Area / Locality"),
    field("postalCode", "Postal Code"),
    field("fullAddress", "Full Address", "textarea"),
    field("googleMapsLocation", "Google Maps Location", "url"),
  ],

  contact: [
    field("contactPerson", "Reservation Contact Person"),
    field("contactPhone", "Contact Phone", "tel"),
    field("whatsappNumber", "WhatsApp Number", "tel"),
    field("email", "Email Address", "email"),
    field("website", "Website", "url"),
  ],

  operations: [
    field("checkInTime", "Check-in Time", "time"),
    field("checkOutTime", "Check-out Time", "time"),
    field("languages", "Languages Spoken", "multiselect", [], {
      allowCustom: true,
    }),
    field("amenities", "Amenities / Facilities", "multiselect", [], {
      allowCustom: true,
    }),
    field("photos", "Property Photos", "images"),
    field("status", "Property Status", "select", [
      "Active",
      "Inactive",
    ]),
  ],
};



const COMMON_PROPERTY_AMENITIES = [
  "Free Wi-Fi",
  "Parking",
  "Restaurant",
  "Bar",
  "Swimming Pool",
  "Spa & Wellness",
  "Gym / Fitness Centre",
  "Garden",
  "Children's Play Area",
  "24-Hour Front Desk",
  "Room Service",
  "Laundry Service",
  "Airport Transfers",
  "Travel Desk",
  "Wheelchair Accessibility",
  "Elevator / Lift",
  "Pet Friendly",
];

const CATEGORY_PROPERTY_AMENITIES = {
  HOTEL: [
    "Concierge Service",
    "Business Centre",
    "Conference / Banquet Facilities",
    "Valet Parking",
    "Luggage Storage",
    "Executive Lounge",
  ],

  RESORT: [
    "Private Beach Access",
    "Infinity Pool",
    "Water Sports",
    "Adventure Zone",
    "Nature Trails",
    "Outdoor Recreation Area",
    "Bonfire Area",
    "Live Entertainment",
    "Boating",
    "Golf Course",
  ],

  HOMESTAY: [
    "Shared Kitchen",
    "Family Dining Area",
    "Host Interaction",
    "Farm Experience",
    "Cultural Experiences",
    "Bonfire Area",
    "Outdoor Seating",
  ],

  VILLA: [
    "Private Swimming Pool",
    "Private Garden",
    "BBQ Area",
    "Outdoor Dining Area",
    "Private Terrace",
    "Jacuzzi",
    "Private Parking",
  ],

  SAFARI_CAMP: [
    "Campfire Area",
    "Bush Dining",
    "Wildlife Viewing Area",
    "Outdoor Lounge",
    "Solar Power",
    "Charging Facilities",
    "Stargazing Area",
  ],

  SAFARI_LODGE: [
    "Viewing Deck",
    "Waterhole Viewing",
    "Wildlife Viewing Area",
    "Outdoor Lounge",
    "Campfire Area",
    "Sundowner Area",
    "Photography Hide",
    "Solar Power",
  ],

  GUEST_HOUSE: [
    "Common Lounge",
    "Shared Kitchen",
    "Common Dining Area",
    "Outdoor Seating",
    "Luggage Storage",
    "Self Check-in",
  ],

  SERVICED_APARTMENT: [
    "Fully Equipped Kitchen",
    "Housekeeping",
    "Washing Machine",
    "Ironing Facilities",
    "Dining Area",
    "Living Room",
    "Self Check-in",
  ],

  BOUTIQUE_STAY: [
    "Heritage Common Area",
    "Curated Guest Experiences",
    "Private Dining",
    "Art & Cultural Space",
    "Outdoor Lounge",
    "Personalised Guest Services",
  ],

  HOSTEL: [
    "Common Room",
    "Shared Kitchen",
    "Lockers",
    "Social Lounge",
    "Games Room",
    "Co-working Space",
    "Self Check-in",
  ],

  OTHER: [
    "Common Lounge",
    "Dining Area",
    "Outdoor Seating",
    "Luggage Storage",
  ],
};

export const getPropertyAmenityOptions = (categoryId) => [
  ...new Set([
    ...COMMON_PROPERTY_AMENITIES,
    ...(CATEGORY_PROPERTY_AMENITIES[categoryId] || []),
    "Other",
  ]),
];





// ==========================================
// CATEGORY-SPECIFIC FIELDS
// PART 1 — FIRST FIVE CATEGORIES
// ==========================================

export const HOTEL_CATEGORY_FORM_CONFIG = {
 HOTEL: {
  classification: field(
    "hotelStarRating",
    "Hotel Star Rating",
    "select",
    ["1 Star", "2 Star", "3 Star", "4 Star", "5 Star", "Unrated"],
    { allowCustom: true }
  ),
    fields: [
      field("hotelType", "Hotel Type", "select", [
        "Business Hotel",
        "Leisure Hotel",
        "Luxury Hotel",
        "Budget Hotel",
        "Heritage Hotel",
        "Airport Hotel",
        "Other",
      ], { allowCustom: true }),
      field("hotelChain", "Hotel Chain"),
      field("totalRooms", "Total Rooms", "number"),
      field("conferenceFacilities", "Conference Facilities", "multiselect", [
  "Conference Hall",
  "Banquet Hall",
  "Meeting Room",
  "Boardroom",
  "Business Centre",
  "Audio-Visual Equipment",
  "Projector & Screen",
  "Video Conferencing",
  "Outdoor Event Space",
  "Wedding Venue",
  "Exhibition Space",
], {
  allowCustom: true,
}),
    ],
  },

  RESORT: {
    classification: field(
      "resortType",
      "Resort Type",
      "select",
      [
        "Beach Resort",
        "Hill Resort",
        "Mountain Resort",
        "Jungle Resort",
        "Wildlife Resort",
        "Spa & Wellness Resort",
        "Luxury Resort",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("resortSetting", "Resort Setting", "select", [
        "Beachfront",
        "Hillside",
        "Mountain",
        "Forest",
        "Riverside",
        "Lakeside",
        "Other",
      ], { allowCustom: true }),
      field("accommodationUnits", "Accommodation Units", "number"),
      field("recreationalFacilities", "Recreational Facilities", "multiselect", [
  "Swimming Pool",
  "Infinity Pool",
  "Water Sports",
  "Adventure Activities",
  "Nature Trails",
  "Trekking",
  "Cycling",
  "Indoor Games",
  "Outdoor Games",
  "Children's Play Area",
  "Spa & Wellness",
  "Yoga & Meditation",
  "Gym / Fitness Centre",
  "Bonfire",
  "Live Entertainment",
  "Private Beach Access",
  "Boating",
  "Fishing",
  "Golf Course",
  "Horse Riding",
], {
  allowCustom: true,
}),
    ],
  },

  HOMESTAY: {
    classification: field(
      "homestayType",
      "Homestay Type",
      "select",
      [
        "Family Homestay",
        "Traditional Homestay",
        "Rural Homestay",
        "Farmstay",
        "Eco Homestay",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("hostAvailability", "Host Availability", "select", [
        "Host Resides On Property",
        "Host Available On Call",
        "Self-managed",
        "Other",
      ], { allowCustom: true }),
      field("guestCapacity", "Guest Capacity", "number"),
      field("familyFacilities", "Family Facilities", "multiselect", [
  "Family Rooms",
  "Interconnected Rooms",
  "Children's Play Area",
  "Baby Cot / Crib",
  "High Chair",
  "Children's Meals",
  "Kitchen Access",
  "Dining Area",
  "Garden / Outdoor Space",
  "Indoor Games",
  "Outdoor Games",
  "Bonfire Area",
  "Pet Friendly",
  "Laundry Facilities",
  "Parking",
], {
  allowCustom: true,
}),
    ],
  },

  VILLA: {
    classification: field(
      "villaType",
      "Villa Type",
      "select",
      [
        "Private Villa",
        "Luxury Villa",
        "Beach Villa",
        "Pool Villa",
        "Hill Villa",
        "Holiday Villa",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("bedrooms", "Bedrooms", "number"),
      field("bathrooms", "Bathrooms", "number"),
      field("privatePool", "Private Pool", "select", ["Yes", "No"]),
      field("maximumOccupancy", "Maximum Occupancy", "number"),
    ],
  },

  SAFARI_CAMP: {
    classification: field(
      "tentType",
      "Tent Type",
      "select",
      [
        "Luxury Tent",
        "Standard Tent",
        "Mobile Tent",
        "Permanent Tent",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("campSetting", "Camp Setting", "select", [
        "Wildlife Reserve",
        "National Park",
        "Forest",
        "Desert",
        "Other",
      ], { allowCustom: true }),
      field("numberOfTents", "Number of Tents", "number"),
      field("safariActivities", "Safari Activities", "multiselect", [
  "Game Drives",
  "Walking Safaris",
  "Night Safaris",
  "Bird Watching",
  "Wildlife Photography",
  "Nature Walks",
  "Guided Bush Walks",
  "Cultural Village Visits",
  "Bush Dining",
  "Sundowner Experiences",
  "Hot Air Balloon Safari",
  "Horseback Safari",
  "Boat Safari",
  "Fishing",
  "Stargazing",
  "Conservation Experiences",
], {
  allowCustom: true,
}),
    ],
  },


  SAFARI_LODGE: {
    classification: field(
      "lodgeType",
      "Lodge Type",
      "select",
      [
        "Luxury Safari Lodge",
        "Standard Safari Lodge",
        "Eco Lodge",
        "Tented Lodge",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("lodgeSetting", "Location Setting", "select", [
        "National Park",
        "Wildlife Reserve",
        "Forest",
        "Mountain",
        "Other",
      ], { allowCustom: true }),
      field("accommodationUnits", "Accommodation Units", "number"),
      field("safariFacilities", "Safari Facilities", "multiselect", [
  "Restaurant / Dining",
  "Bush Dining",
  "Swimming Pool",
  "Spa & Wellness",
  "Lounge / Bar",
  "Viewing Deck",
  "Waterhole Viewing",
  "Campfire Area",
  "Wildlife Viewing Area",
  "Game Drive Facilities",
  "Walking Safari Facilities",
  "Bird Watching Area",
  "Photography Hide",
  "Gift Shop",
  "Laundry Service",
  "Wi-Fi",
  "Solar Power",
  "Airport / Airstrip Transfers",
  "Guided Nature Walks",
], {
  allowCustom: true,
}),
    ],
  },

  GUEST_HOUSE: {
    classification: field(
      "guestHouseType",
      "Guest House Type",
      "select",
      [
        "Budget Guest House",
        "Family Guest House",
        "Business Guest House",
        "Heritage Guest House",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("numberOfRooms", "Number of Rooms", "number"),
      field("mealArrangements", "Meal Arrangements", "multiselect", [
  "Room Only (EP)",
  "Breakfast (CP)",
  "Breakfast + Lunch (MAP)",
  "Breakfast + Dinner (MAP)",
  "Breakfast + Lunch + Dinner (AP)",
  "À la Carte Dining",
  "Packed Meals",
  "Local Cuisine",
  "Vegetarian Meals",
  "Non-Vegetarian Meals",
  "Special Dietary Meals",
], {
  allowCustom: true,
}),
    ],
  },

  SERVICED_APARTMENT: {
    classification: field(
      "apartmentType",
      "Apartment Type",
      "select",
      [
        "Studio Apartment",
        "One Bedroom",
        "Two Bedroom",
        "Three Bedroom",
        "Luxury Apartment",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("bedrooms", "Bedrooms", "number"),
      field("kitchenFacilities", "Kitchen Facilities", "multiselect", [
  "Fully Equipped Kitchen",
  "Kitchenette",
  "Refrigerator",
  "Microwave",
  "Induction Cooktop",
  "Gas Stove",
  "Electric Kettle",
  "Cookware & Utensils",
  "Dining Table",
  "Dishwasher",
  "Washing Machine",
  "Water Purifier",
  "Toaster",
  "Coffee Maker",
  "Basic Cooking Essentials",
], {
  allowCustom: true,
}),
      field("leaseOptions", "Lease Options", "multiselect", [
        "Daily",
        "Weekly",
        "Monthly",
        "Long Term",
      ]),
    ],
  },

  BOUTIQUE_STAY: {
    classification: field(
      "designStyle",
      "Design Style",
      "select",
      [
        "Contemporary",
        "Traditional",
        "Heritage",
        "Artistic",
        "Eco-conscious",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("propertyCharacter", "Property Character", "multiselect", [
  "Heritage Architecture",
  "Colonial Style",
  "Traditional Architecture",
  "Contemporary Design",
  "Minimalist Design",
  "Artistic Interiors",
  "Themed Accommodation",
  "Eco-friendly Design",
  "Nature-inspired Setting",
  "Rustic Character",
  "Luxury Boutique Experience",
  "Local Cultural Experience",
  "Personalised Guest Experience",
  "Historic Building",
  "Unique / Distinctive Design",
], {
  allowCustom: true,
}),
      field("accommodationUnits", "Accommodation Units", "number"),
    ],
  },

  HOSTEL: {
    classification: field(
      "hostelType",
      "Hostel Type",
      "select",
      [
        "Backpacker Hostel",
        "Youth Hostel",
        "Student Hostel",
        "Traveller Hostel",
        "Other",
      ],
      { allowCustom: true }
    ),
    fields: [
      field("roomArrangement", "Room Arrangement", "multiselect", [
  "Mixed Dormitory",
  "Male Dormitory",
  "Female Dormitory",
  "Private Single Room",
  "Private Double Room",
  "Private Twin Room",
  "Private Triple Room",
  "Family Room",
  "Capsule Bed",
  "Bunk Bed Accommodation",
], {
  allowCustom: true,
}),
      field("bedCount", "Total Bed Count", "number"),
      field("genderPolicy", "Gender Policy", "select", [
        "Mixed",
        "Male Only",
        "Female Only",
        "Separate Male / Female Dormitories",
      ]),
    ],
  },

  OTHER: {
    classification: field(
      "customClassification",
      "Accommodation Classification",
      "text"
    ),
    fields: [
      field("accommodationType", "Accommodation Type", "text"),
      field("numberOfUnits", "Number of Units", "number"),
    ],
  },
};
