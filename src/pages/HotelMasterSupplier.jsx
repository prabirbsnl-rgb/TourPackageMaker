



import React, { useEffect, useState } from "react";

import { ACCOMMODATION_CATEGORIES } from "../utils/accommodationCategories";


import ResortAccommodationForm from "../components/hotels/ResortAccommodationForm";

import HomestayAccommodationForm from "../components/hotels/HomestayAccommodationForm";

import VillaAccommodationForm from "../components/hotels/VillaAccommodationForm";

import SafariCampAccommodationForm from "../components/hotels/SafariCampAccommodationForm";

import SafariLodgeAccommodationForm from "../components/hotels/SafariLodgeAccommodationForm";

import GuestHouseAccommodationForm from "../components/hotels/GuestHouseAccommodationForm";

import ServicedApartmentAccommodationForm from "../components/hotels/ServicedApartmentAccommodationForm";

import BoutiqueStayAccommodationForm from "../components/hotels/BoutiqueStayAccommodationForm";

import HostelAccommodationForm from "../components/hotels/HostelAccommodationForm";

import OtherAccommodationForm from "../components/hotels/OtherAccommodationForm";


import {
  HOTEL_COMMON_FIELDS,
  HOTEL_CATEGORY_FORM_CONFIG,
  getPropertyAmenityOptions,
} from "../utils/hotelPropertyFormConfig";


import {
  getHotelCountries,
  getHotelStates,
  getHotelCities,
} from "../utils/hotelLocationService";


import { auth } from "../firebase";

import {
  buildHotelPropertyPayload,
  createHotelProperty,
  updateHotelProperty,
  getHotelProperties,
  deleteHotelProperty,
} from "../utils/hotelPropertyStorage";



import {
  uploadHotelPhotos,
  getGoogleDrivePhotoPreviewUrl,
  deleteGoogleDrivePhoto,
} from "../utils/googleDrivePhotoStorage";

import {
  requestGoogleDriveAccessToken,
} from "../utils/googleDriveAuth";




const HotelSearchDropdown = ({
  value = "",
  options = [],
  onChange,
  placeholder = "Select or enter",
  disabled = false,
  loading = false,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredOptions = options.filter((option) =>
    String(option).toLowerCase().includes(searchText.trim().toLowerCase())
  );

  const handleOpen = () => {
    if (disabled) return;

    setSearchText("");
    setIsOpen(true);
  };

 const handleSelect = (option) => {
  setSearchText("");
  onChange(option);
  setIsOpen(false);
};





  return (
    <div
  onClick={(e) => e.stopPropagation()}
  style={{
    position: "relative",
    width: "100%",
  }}
>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "42px",
          minHeight: "42px",
          boxSizing: "border-box",
          border: `1px solid ${theme?.border || "#CBD5E1"}`,
          borderRadius: "7px",
          background: disabled ? "#E8EEF5" : theme?.light || "#FFFFFF",
          overflow: "hidden",
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <input
          type="text"
         value={isOpen ? searchText : searchText || value}
          disabled={disabled}
          readOnly={!isOpen}
          placeholder={placeholder}
          onClick={(e) => {
  e.stopPropagation();

  if (isOpen) {
    setIsOpen(false);
    setSearchText("");
  } else {
    handleOpen();
  }
}}
          onChange={(e) => {
            const nextValue = e.target.value;
            setSearchText(nextValue);
            onChange(nextValue);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "11px",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "13px",
            color: "#1E293B",
          }}
        />

        <button
          type="button"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              setSearchText("");
            } else {
              handleOpen();
            }
          }}
          style={{
            width: "38px",
            height: "40px",
            border: "none",
            borderLeft: `1px solid ${theme?.border || "#CBD5E1"}`,
            background: "transparent",
            color: theme?.primary || "#173B70",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "15px",
          }}
          aria-label="Show all options"
        >
          ▾
        </button>
      </div>

      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: "230px",
            overflowY: "auto",
            background: "#FFFFFF",
            border: `1px solid ${theme?.border || "#CBD5E1"}`,
            borderRadius: "7px",
            boxShadow: "0 5px 16px rgba(15,23,42,0.16)",
          }}
        >
          {loading ? (
            <div style={{ padding: "12px", fontSize: "12px", color: "#64748B" }}>
              Loading options...
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
  key={`${option}-${index}`}
  onMouseDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelect(option);
  }}
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  cursor: "pointer",
                  color: "#334155",
                  background:
                    option === value ? theme?.light || "#EEF3FA" : "#FFFFFF",
                  borderBottom: "1px solid #F1F5F9",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    theme?.light || "#EEF3FA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    option === value ? theme?.light || "#EEF3FA" : "#FFFFFF";
                }}
              >
                {option}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "12px",
                fontSize: "12px",
                color: "#64748B",
              }}
            >
              No matching suggestions. You can enter your own value.
            </div>
          )}
        </div>
      )}
    </div>
  );
};




const HotelMultiSelectDropdown = ({
  values = [],
  options = [],
  onChange,
  placeholder = "Select options",
  theme,
  allowCustom = false,
  customTriggerOption = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchText.trim().toLowerCase())
  );

  const toggleOption = (option) => {
  if (option === customTriggerOption) {
    setShowCustomInput((prev) => !prev);
    setSearchText("");
    return;
  }

  const nextValues = values.includes(option)
    ? values.filter((item) => item !== option)
    : [...values, option];

  onChange(nextValues);
};

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
 style={{
  display: "flex",
  alignItems: "center",
  height: "42px",
  minHeight: "42px",
  boxSizing: "border-box",
  border: `1px solid ${theme?.border || "#CBD5E1"}`,
  borderRadius: "7px",
  background: theme?.light || "#FFFFFF",
  overflow: "hidden",
}}
>
        <div

         title={values.length ? values.join(", ") : placeholder}
         onClick={(e) => {
         
  e.preventDefault();
  e.stopPropagation();

  if (isOpen) {
    setIsOpen(false);
    setSearchText("");
  } else {
    setSearchText("");
    setIsOpen(true);
  }
}}
          style={{
  flex: 1,
  minWidth: 0,
  height: "40px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  padding: "0 11px",
  fontSize: "13px",
  color: values.length ? "#1E293B" : "#94A3B8",
  cursor: "pointer",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}}
        >
          <span
  style={{
    display: "block",
    width: "100%",
    minWidth: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}
>
  {values.length ? values.join(", ") : placeholder}
</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setSearchText("");
          }}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            width: "38px",
            height: "40px",
            boxSizing: "border-box",
            flexShrink: 0,
            border: "none",
            borderLeft: `1px solid ${theme?.border || "#CBD5E1"}`,
            background: "transparent",
            color: theme?.primary || "#173B70",
            cursor: "pointer",
          }}
        >
          ▾
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 1100,
            maxHeight: "240px",
            overflowY: "auto",
            padding: "9px",
            background: "#FFFFFF",
            border: `1px solid ${theme?.border || "#CBD5E1"}`,
            borderRadius: "7px",
            boxShadow: "0 5px 16px rgba(15,23,42,0.16)",
          }}
        >
          <input
            type="text"
            value={searchText}
            placeholder="Search options..."
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "9px",
              marginBottom: "7px",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />

          {filteredOptions.map((option) => (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "8px",
                borderRadius: "5px",
                fontSize: "12px",
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={
  option === customTriggerOption
    ? showCustomInput
    : values.includes(option)
}
                onChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}




{(allowCustom || showCustomInput) && (
  <div
    style={{
      display: "flex",
      gap: "6px",
      padding: "8px 4px",
      borderTop: "1px solid #E2E8F0",
      marginTop: "6px",
    }}
  >
    <input
      type="text"
      value={searchText}
      placeholder="Enter a custom option..."
      onChange={(e) => setSearchText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();

          const customValue = searchText.trim();

          if (
            customValue &&
            !values.some(
              (item) => item.toLowerCase() === customValue.toLowerCase()
            )
          ) {
            onChange([...values, customValue]);
          }

          setSearchText("");
        }
      }}
      style={{
        flex: 1,
        minWidth: 0,
        padding: "8px",
        border: "1px solid #CBD5E1",
        borderRadius: "5px",
        fontSize: "12px",
      }}
    />

    <button
      type="button"
      disabled={!searchText.trim()}
      onClick={() => {
        const customValue = searchText.trim();

        if (
          customValue &&
          !values.some(
            (item) => item.toLowerCase() === customValue.toLowerCase()
          )
        ) {
          onChange([...values, customValue]);
        }

        setSearchText("");
      }}
      style={{
        padding: "0 12px",
        border: "none",
        borderRadius: "5px",
        background: theme?.primary || "#173B70",
        color: "#FFFFFF",
        fontSize: "11px",
        fontWeight: 700,
        cursor: "pointer",
        opacity: searchText.trim() ? 1 : 0.5,
      }}
    >
      + Add
    </button>
  </div>
)}



          {filteredOptions.length === 0 && (
            <div style={{ padding: "10px", color: "#64748B", fontSize: "12px" }}>
              No matching options.
            </div>
          )}
        </div>
      )}
    </div>
  );
};





export default function HotelMasterSupplier({
  onBackToWorkspace,
  isAdmin = false,
}) {
  const [activeSection, setActiveSection] = useState("home");

  const [hotelMasterView, setHotelMasterView] = useState("domestic-hotels");

  

  const [selectedAccommodationCategory, setSelectedAccommodationCategory] =
  useState(null);

  const selectedCategoryTheme =
  selectedAccommodationCategory?.theme || null;


  const selectedCategoryFormConfig =
  selectedAccommodationCategory
    ? HOTEL_CATEGORY_FORM_CONFIG[selectedAccommodationCategory.id]
    : null;

  

  const [hotelMasterPage, setHotelMasterPage] = useState("categories");

  const [hotelFormData, setHotelFormData] = useState({});
  const [propertyListSearch, setPropertyListSearch] = useState("");
  const [propertyListStatus, setPropertyListStatus] = useState("all");

  // Property Directory location filters
const [propertyStateFilter, setPropertyStateFilter] = useState("");
const [propertyDomesticCityFilter, setPropertyDomesticCityFilter] = useState("");
const [propertyCountryFilter, setPropertyCountryFilter] = useState("");
const [propertyInternationalCityFilter, setPropertyInternationalCityFilter] = useState("");

// Store Property Directory filters separately for each accommodation category
const [categoryPropertyFilters, setCategoryPropertyFilters] = useState({});

const [hotelPropertyRecords, setHotelPropertyRecords] = useState([]);
const [isLoadingHotelProperties, setIsLoadingHotelProperties] = useState(false);
const [hotelPropertyLoadError, setHotelPropertyLoadError] = useState("");
const [selectedHotelProperty, setSelectedHotelProperty] = useState(null);

const [hotelPhotoPreviewUrls, setHotelPhotoPreviewUrls] = useState({});

const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);

const [googleDriveAccessToken, setGoogleDriveAccessToken] = useState(null);


const propertyTableCellStyle = {
  padding: "11px 10px",
  color: "#334155",
fontSize: "12px",
fontWeight: 650,
  verticalAlign: "middle",
  borderBottom: "1px solid #E8EEF4",
  whiteSpace: "nowrap",
};




useEffect(() => {
  if (hotelMasterPage !== "listing") return;

  let cancelled = false;

  const loadHotelProperties = async () => {
    setIsLoadingHotelProperties(true);
    setHotelPropertyLoadError("");

    try {
      const records = await getHotelProperties();

      if (!cancelled) {
        setHotelPropertyRecords(Array.isArray(records) ? records : []);
      }
    } catch (error) {
      console.error("Unable to load hotel properties:", error);

      if (!cancelled) {
        setHotelPropertyLoadError(
          error.message || "Unable to load property records."
        );
      }
    } finally {
      if (!cancelled) {
        setIsLoadingHotelProperties(false);
      }
    }
  };

  loadHotelProperties();

  return () => {
    cancelled = true;
  };
}, [hotelMasterPage]);



useEffect(() => {
 if (
  !(
    hotelMasterPage === "details-preview" ||
    (hotelMasterPage === "registration" && isEditingHotelProperty)
  ) ||
  !selectedHotelProperty ||
  !isGoogleDriveConnected
) {
  setHotelPhotoPreviewUrls({});
  return;
}

  let cancelled = false;
  const createdUrls = [];

  const loadPhotoPreviews = async () => {
    const propertyPhotos = Array.isArray(selectedHotelProperty.photos)
      ? selectedHotelProperty.photos
      : [];

    const roomPhotos = Array.isArray(selectedHotelProperty.roomCategories)
      ? selectedHotelProperty.roomCategories.flatMap((room) =>
          Array.isArray(room.photos) ? room.photos : []
        )
      : [];

    const allPhotos = [...propertyPhotos, ...roomPhotos];

    const photosToLoad = [
      ...new Map(
        allPhotos
          .filter((photo) => photo?.driveFileId)
          .map((photo) => [photo.driveFileId, photo])
      ).values(),
    ];

    const previewEntries = await Promise.all(
      photosToLoad.map(async (photo) => {
        try {
          const previewUrl = await getGoogleDrivePhotoPreviewUrl(
  photo.driveFileId,
  googleDriveAccessToken
);

          createdUrls.push(previewUrl);

          return [photo.driveFileId, previewUrl];
        } catch (error) {
          console.error(
            `Unable to load photo: ${photo.name || photo.driveFileId}`,
            error
          );

          return null;
        }
      })
    );

    if (cancelled) {
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
      return;
    }

    setHotelPhotoPreviewUrls(
      Object.fromEntries(previewEntries.filter(Boolean))
    );
  };

  loadPhotoPreviews();

  return () => {
    cancelled = true;
    createdUrls.forEach((url) => URL.revokeObjectURL(url));
  };
}, [
  hotelMasterPage,
  selectedHotelProperty,
  isGoogleDriveConnected,
  googleDriveAccessToken,
]);



const filteredHotelProperties = hotelPropertyRecords.filter((property) => {
  // Match the selected accommodation category
  if (
    selectedAccommodationCategory?.id &&
    property.categoryId !== selectedAccommodationCategory.id
  ) {
    return false;
  }

  // Match Domestic / International / All view
  if (
    hotelMasterView === "domestic-hotels" &&
    property.propertyScope !== "domestic"
  ) {
    return false;
  }

  if (
    hotelMasterView === "international-hotels" &&
    property.propertyScope !== "international"
  ) {
    return false;
  }


    // Match Domestic State / UT filter
  if (propertyStateFilter) {
    if (
      property.propertyScope !== "domestic" ||
      String(property.stateProvince || "").trim().toLowerCase() !==
        propertyStateFilter.trim().toLowerCase()
    ) {
      return false;
    }
  }

  // Match Domestic City filter
  if (propertyDomesticCityFilter) {
    if (
      property.propertyScope !== "domestic" ||
      String(property.city || "").trim().toLowerCase() !==
        propertyDomesticCityFilter.trim().toLowerCase()
    ) {
      return false;
    }
  }

  // Match International Country filter
  if (propertyCountryFilter) {
    if (
      property.propertyScope !== "international" ||
      String(property.country || "").trim().toLowerCase() !==
        propertyCountryFilter.trim().toLowerCase()
    ) {
      return false;
    }
  }

  // Match International City filter
  if (propertyInternationalCityFilter) {
    if (
      property.propertyScope !== "international" ||
      String(property.city || "").trim().toLowerCase() !==
        propertyInternationalCityFilter.trim().toLowerCase()
    ) {
      return false;
    }
  }



  // Match selected status
  if (
    propertyListStatus !== "all" &&
    String(property.status || "Active").toLowerCase() !==
      propertyListStatus.toLowerCase()
  ) {
    return false;
  }

  // Match search text against property name, ID and location
  const searchText = propertyListSearch.trim().toLowerCase();

  if (searchText) {
    const searchableText = [
      property.propertyId,
      property.propertyName,
      property.displayName,
      property.stateProvince,
      property.country,
      property.city,
      property.categoryLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!searchableText.includes(searchText)) {
      return false;
    }
  }

  return true;
});



  // DYNAMIC ROOM CATEGORIES
const [hotelRoomCategories, setHotelRoomCategories] = useState([]);

const [expandedHotelRoomCategoryId, setExpandedHotelRoomCategoryId] =
  useState(null);



const createEmptyRoomCategory = () => {

  if (selectedAccommodationCategory?.id === "HOSTEL") {
  return {
    id: `hostel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    dormitoryType: "",
    customDormitoryType: "",

    roomEntryMode: "NAMES",
    roomNames: [],
    roomCount: "",

    bedsPerDormitory: "",
    bedConfiguration: [],
    customBedConfiguration: "",

    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",

    bathroomType: "",
    customBathroomType: "",

    mealPlans: [],
    customMealPlan: "",

    amenities: [],
    customAmenities: "",

    photos: [],
    description: "",
  };
}


if (selectedAccommodationCategory?.id === "BOUTIQUE_STAY") {
  return {
    id: `boutique-stay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    accommodationType: "",
    customAccommodationType: "",

    roomEntryMode: "NAMES",
    roomNames: [],
    roomCount: "",

    bedrooms: "",
    bedConfiguration: [],
    customBedConfiguration: "",

    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",

    bathroomType: "",
    customBathroomType: "",

    mealPlans: [],
    customMealPlan: "",

    amenities: [],
    customAmenities: "",

    photos: [],
    description: "",
  };
}


if (selectedAccommodationCategory?.id === "SERVICED_APARTMENT") {
  return {
    id: `serviced-apartment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    apartmentType: "",
    customApartmentType: "",

    roomEntryMode: "NAMES",
    roomNames: [],
    roomCount: "",

    bedrooms: "",
    bedConfiguration: [],
    customBedConfiguration: "",

    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",

    bathroomType: "",
    customBathroomType: "",

    kitchenType: "",
    customKitchenType: "",

    mealPlans: [],
    customMealPlan: "",

    amenities: [],
    customAmenities: "",

    photos: [],
    description: "",
  };
}


if (selectedAccommodationCategory?.id === "GUEST_HOUSE") {
  return {
    id: `guest-house-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    roomType: "",
    customRoomType: "",

    roomEntryMode: "NAMES",
    roomNames: [],
    roomCount: "",

    bedrooms: "",
    bedConfiguration: [],
    customBedConfiguration: "",

    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",

    bathroomType: "",
    customBathroomType: "",

    mealPlans: [],
    customMealPlan: "",

    amenities: [],
    customAmenities: "",

    photos: [],
    description: "",
  };
}


if (selectedAccommodationCategory?.id === "SAFARI_LODGE") {
  return {
    id: `safari-lodge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    lodgeUnitType: "",
    customLodgeUnitType: "",

    roomEntryMode: "NAMES",
    roomNames: [],
    roomCount: "",

    bedroomsPerUnit: "",
    bedConfiguration: [],
    customBedConfiguration: "",

    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",

    bathroomType: "",
    customBathroomType: "",

    mealPlans: [],
    customMealPlan: "",

    amenities: [],
    customAmenities: "",

    photos: [],
    description: "",
  };
}


if (selectedAccommodationCategory?.id === "SAFARI_CAMP") {
  return {
    id: `safari-camp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    tentType: "",
    customTentType: "",

    roomEntryMode: "NAMES",
    roomNames: [],
    roomCount: "",

    bedsPerTent: "",
    bedConfiguration: [],
    customBedConfiguration: "",

    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",

    privateBathroom: "",

    mealPlans: [],
    customMealPlan: "",

    amenities: [],
    customAmenities: "",

    photos: [],
    description: "",
  };
}


  if (selectedAccommodationCategory?.id === "VILLA") {
  return {
    id: `villa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    villaType: "",
    customVillaType: "",

    roomEntryMode: "NAMES",
    roomNames: [],
    roomCount: "",

    bedroomsPerVilla: "",
    bedConfiguration: [],
    customBedConfiguration: "",
    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",
    poolType: "",
    mealPlans: [],
    customMealPlan: "",
    amenities: [],
    customAmenities: [],
    photos: [],
    description: "",
  };
}


  if (selectedAccommodationCategory?.id === "HOMESTAY") {
  return {
    id: `homestay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    roomType: "",
    customRoomType: "",

    roomEntryMode: "NAMES",
    roomNames: [],
    roomCount: "",

    bedConfiguration: [],
    customBedConfiguration: "",
    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",
    mealPlans: [],
    customMealPlan: "",
    amenities: [],
    customAmenities: "",
    photos: [],
    roomDescription: "",
  };
}

  if (selectedAccommodationCategory?.id === "RESORT") {
    return {
      id: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      accommodationType: "",
      customAccommodationType: "",
      unitName: "",
      numberOfUnits: "",
      bedConfiguration: [],
      customBedConfiguration: "",
      maximumAdults: "",
      maximumChildren: "",
      extraBedAvailable: "",
      poolAccess: "",
      mealPlans: [],
      customMealPlan: "",
      amenities: [],
      customAmenities: "",
      photos: [],
      description: "",
    };
  }

  return {
    id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    roomCategory: "",
    customRoomCategory: "",
    roomDescription: "",
    numberOfRooms: "",
    bedConfiguration: [],
    maximumAdults: "",
    maximumChildren: "",
    extraBedAvailable: "",
    mealPlans: [],
    customMealPlan: "",
    amenities: [],
    customAmenities: "",
    photos: [],
  };
};



// ADD ROOM CATEGORY

const handleAddRoomCategory = () => {
  const newRoom = createEmptyRoomCategory();

  setHotelRoomCategories((prev) => [
    ...prev,
    newRoom,
  ]);

  setExpandedHotelRoomCategoryId(newRoom.id);
};

// UPDATE ROOM CATEGORY
const handleRoomCategoryChange = (roomId, fieldName, value) => {
  setHotelRoomCategories((prev) =>
    prev.map((room) =>
      room.id === roomId
        ? { ...room, [fieldName]: value }
        : room
    )
  );
};



// REMOVE INDIVIDUAL ACCOMMODATION UNIT PHOTO

const handleRemoveRoomPhoto = (roomId, photoIndex) => {
  const room = hotelRoomCategories.find(
    (item) => item.id === roomId
  );

  const photo = room?.photos?.[photoIndex];

  if (!photo) return;

  // Schedule saved Google Drive photos for deletion after Save.
  if (photo.driveFileId) {
    setPendingHotelPhotoDeletions((prev) => [
      ...prev,
      photo.driveFileId,
    ]);
  }

  // Release only local preview URLs.
  if (photo.previewUrl && photo instanceof File) {
    URL.revokeObjectURL(photo.previewUrl);
  }

  handleRoomCategoryChange(
    roomId,
    "photos",
    room.photos.filter((_, index) => index !== photoIndex)
  );

  setHotelPropertySaveError("");
};




// REMOVE ROOM CATEGORY
const handleRemoveRoomCategory = (roomId) => {
  setHotelRoomCategories((prev) =>
    prev.filter((room) => room.id !== roomId)
  );
};



  const handleHotelFormChange = (fieldName, value) => {
  setHotelFormData((prev) => ({
    ...prev,
    [fieldName]: value,
  }));
};




// REMOVE INDIVIDUAL PROPERTY PHOTO

const handleRemovePropertyPhoto = (photoIndex) => {
  const photo = hotelFormData.photos?.[photoIndex];

  if (!photo) return;

  // Track saved Google Drive photos for deletion after a successful save.
  if (photo.driveFileId) {
    setPendingHotelPhotoDeletions((prev) => [
      ...prev,
      photo.driveFileId,
    ]);
  }

  // Release only local preview URLs.
  if (photo.previewUrl && photo instanceof File) {
    URL.revokeObjectURL(photo.previewUrl);
  }

  handleHotelFormChange(
    "photos",
    hotelFormData.photos.filter((_, index) => index !== photoIndex)
  );

  setHotelPropertySaveError("");
};





// DELETE ONE SAVED PROPERTY PHOTO
const handleDeleteSavedPropertyPhoto = async (photoIndex) => {
  const property = selectedHotelProperty;
  const photo = property?.photos?.[photoIndex];

  if (!property?.id || !photo) return;

  const confirmed = window.confirm(
    `Delete "${photo.name || "this property photo"}"?\n\n` +
    "This will remove the photo from the property gallery and Google Drive. " +
    "This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Please sign in again before deleting the photo.");
    }

    // STEP 1: Remove only the selected photo reference from Firestore.
    const updatedPhotos = property.photos.filter(
      (_, index) => index !== photoIndex
    );

    await updateHotelProperty(
      property.id,
      { photos: updatedPhotos },
      currentUser.uid
    );

    // STEP 2: Update the displayed property and directory state.
    const updatedProperty = {
      ...property,
      photos: updatedPhotos,
    };

    setSelectedHotelProperty(updatedProperty);

    setHotelPropertyRecords((prev) =>
      prev.map((item) =>
        item.id === property.id ? updatedProperty : item
      )
    );

    // STEP 3: Delete the corresponding Drive file, if one exists.
    if (photo.driveFileId) {
      await deleteGoogleDrivePhoto(photo.driveFileId);
    }

    // STEP 4: Release the temporary preview URL.
    if (photo.driveFileId && hotelPhotoPreviewUrls[photo.driveFileId]) {
      URL.revokeObjectURL(hotelPhotoPreviewUrls[photo.driveFileId]);

      setHotelPhotoPreviewUrls((prev) => {
        const updated = { ...prev };
        delete updated[photo.driveFileId];
        return updated;
      });
    }

    setHotelPropertySaveMessage("Property photo deleted successfully.");
    setHotelPropertySaveError("");

  } catch (error) {
    console.error("Saved property photo deletion failed:", error);

    setHotelPropertySaveError(
      error.message || "Unable to delete the property photo."
    );
  }
};



const handleDeleteHotelProperty = async (property) => {
  if (!isAdmin) {
    setHotelPropertySaveError(
      "Only Admin can delete hotel properties."
    );
    return;
  }

  if (!property?.id) {
    setHotelPropertySaveError("Property record not found.");
    return;
  }

  const confirmed = window.confirm(
    `Permanently delete "${property.propertyName || "this property"}"?\n\n` +
    `Property ID: ${property.propertyId}\n\n` +
    "This will delete the property record, its accommodation-unit " +
    "photo references, and associated Google Drive photos.\n\n" +
    "This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Please sign in again before deleting the property.");
    }

    // STEP 1: Collect all associated Google Drive photo IDs.
    const allPhotos = [
      ...(Array.isArray(property.photos) ? property.photos : []),
      ...(Array.isArray(property.roomCategories)
        ? property.roomCategories.flatMap((room) =>
            Array.isArray(room.photos) ? room.photos : []
          )
        : []),
    ];

    const driveFileIds = [
      ...new Set(
        allPhotos
          .map((photo) => photo?.driveFileId)
          .filter(Boolean)
      ),
    ];

    // STEP 2: Delete the Firestore property and create its audit record.
    const result = await deleteHotelProperty(
      property.id,
      currentUser.uid
    );

    // STEP 3: Remove the property from the displayed listing.
    setHotelPropertyRecords((prev) =>
      prev.filter((item) => item.id !== property.id)
    );

    if (selectedHotelProperty?.id === property.id) {
      setSelectedHotelProperty(null);
    }

    // STEP 4: Delete associated Google Drive photos.
    const failedDriveDeletions = [];

    for (const driveFileId of driveFileIds) {
      try {
        await deleteGoogleDrivePhoto(driveFileId);
      } catch (error) {
        console.error(
          "Property photo cleanup failed:",
          driveFileId,
          error
        );

        failedDriveDeletions.push(driveFileId);
      }
    }

    // STEP 5: Release temporary preview URLs.
    for (const driveFileId of driveFileIds) {
      const previewUrl = hotelPhotoPreviewUrls[driveFileId];

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }

    setHotelPhotoPreviewUrls((prev) => {
      const updated = { ...prev };

      driveFileIds.forEach((id) => {
        delete updated[id];
      });

      return updated;
    });

    setHotelPropertySaveMessage(
      `Property ${result.propertyId} deleted successfully.`
    );

    if (failedDriveDeletions.length > 0) {
      setHotelPropertySaveError(
        `Property deleted, but ${failedDriveDeletions.length} Google Drive photo(s) could not be deleted. ` +
        `Please retain these file IDs for manual cleanup: ${failedDriveDeletions.join(", ")}`
      );
    } else {
      setHotelPropertySaveError("");
    }

  } catch (error) {
    console.error("Hotel property deletion failed:", error);

    setHotelPropertySaveError(
      error.message || "Unable to delete the hotel property."
    );
  }
};




// ADD PHOTOS TO AN EXISTING PROPERTY
const handleAddSavedPropertyPhotos = async (selectedFiles) => {
  const property = selectedHotelProperty;

  if (!property?.id || !selectedFiles?.length) return;

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Please sign in again before uploading photos.");
    }

    setHotelPropertySaveMessage("");
    setHotelPropertySaveError("");

    // STEP 1: Upload selected photos to the Property Photos folder.
    const uploadResult = await uploadHotelPhotos(
      selectedFiles,
      import.meta.env.VITE_GOOGLE_PROPERTY_PHOTOS_FOLDER_ID
    );




    if (uploadResult.uploadedPhotos.length === 0) {
      throw new Error(
        uploadResult.failedPhotos[0]?.error ||
        "Unable to upload the selected photos."
      );
    }

    // STEP 2: Prepare the updated property gallery.
    const newPhotos = uploadResult.uploadedPhotos.map(
      (item) => item.metadata
    );

    const updatedPhotos = [
      ...(property.photos || []),
      ...newPhotos,
    ];

    // STEP 3: Save the new photo references in Firestore.
    await updateHotelProperty(
      property.id,
      { photos: updatedPhotos },
      currentUser.uid
    );

    // STEP 4: Update the displayed property and directory.
    const updatedProperty = {
      ...property,
      photos: updatedPhotos,
    };

    setSelectedHotelProperty(updatedProperty);

    setHotelPropertyRecords((prev) =>
      prev.map((item) =>
        item.id === property.id ? updatedProperty : item
      )
    );

    setHotelPropertySaveMessage(
      `${newPhotos.length} property photo(s) added successfully.`
    );

    if (uploadResult.failedPhotos.length > 0) {
      setHotelPropertySaveError(
        `${uploadResult.failedPhotos.length} photo(s) could not be uploaded.`
      );
    }

  } catch (error) {
    console.error("Adding saved property photos failed:", error);

    setHotelPropertySaveError(
      error.message || "Unable to add property photos."
    );
  }
};



// CONNECT GOOGLE DRIVE
const handleConnectGoogleDrive = async () => {
  try {
    setHotelPropertySaveMessage("");
    setHotelPropertySaveError("");

   const accessToken = await requestGoogleDriveAccessToken();
setGoogleDriveAccessToken(accessToken);

    setIsGoogleDriveConnected(true);

    setHotelPropertySaveMessage(
      "Google Drive connected successfully. You can now add photos."
    );
  } catch (error) {
    console.error("Google Drive connection failed:", error);

    setHotelPropertySaveError(
      error.message || "Unable to connect Google Drive."
    );
  }
};




// DELETE ONE SAVED ACCOMMODATION UNIT PHOTO
const handleDeleteSavedRoomPhoto = async (roomId, photoIndex) => {
  const property = selectedHotelProperty;

  const room = property?.roomCategories?.find(
    (item) => item.id === roomId
  );

  const photo = room?.photos?.[photoIndex];

  if (!property?.id || !room || !photo) return;

  const confirmed = window.confirm(
    `Delete "${photo.name || "this unit photo"}"?\n\n` +
    "This will remove the photo from this accommodation unit and Google Drive. " +
    "This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Please sign in again before deleting the photo.");
    }

    // STEP 1: Update only the selected unit's photo array.
    const updatedRoomCategories = property.roomCategories.map((item) =>
      item.id === roomId
        ? {
            ...item,
            photos: item.photos.filter(
              (_, index) => index !== photoIndex
            ),
          }
        : item
    );

    // STEP 2: Save the updated accommodation units in Firestore.
    await updateHotelProperty(
      property.id,
      { roomCategories: updatedRoomCategories },
      currentUser.uid
    );

    // STEP 3: Update displayed property and directory state.
    const updatedProperty = {
      ...property,
      roomCategories: updatedRoomCategories,
    };

    setSelectedHotelProperty(updatedProperty);

    setHotelPropertyRecords((prev) =>
      prev.map((item) =>
        item.id === property.id ? updatedProperty : item
      )
    );

    // STEP 4: Delete the corresponding Google Drive file.
    if (photo.driveFileId) {
      await deleteGoogleDrivePhoto(photo.driveFileId);
    }

    // STEP 5: Release the temporary preview URL.
    if (photo.driveFileId && hotelPhotoPreviewUrls[photo.driveFileId]) {
      URL.revokeObjectURL(hotelPhotoPreviewUrls[photo.driveFileId]);

      setHotelPhotoPreviewUrls((prev) => {
        const updated = { ...prev };
        delete updated[photo.driveFileId];
        return updated;
      });
    }

    setHotelPropertySaveMessage(
      "Accommodation unit photo deleted successfully."
    );
    setHotelPropertySaveError("");

  } catch (error) {
    console.error("Saved unit photo deletion failed:", error);

    setHotelPropertySaveError(
      error.message || "Unable to delete the accommodation unit photo."
    );
  }
};



const handleAddSavedRoomPhotos = async (roomId, selectedFiles) => {
  const property = selectedHotelProperty;

  const room = property?.roomCategories?.find(
    (item) => item.id === roomId
  );

  if (!property?.id || !room || !selectedFiles?.length) return;

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Please sign in again before uploading photos.");
    }

    setHotelPropertySaveMessage("");
    setHotelPropertySaveError("");

    // STEP 1: Upload selected photos to the Unit Photos folder.
    const uploadResult = await uploadHotelPhotos(
      selectedFiles,
      import.meta.env.VITE_GOOGLE_UNIT_PHOTOS_FOLDER_ID
    );

    if (uploadResult.uploadedPhotos.length === 0) {
      throw new Error(
        uploadResult.failedPhotos[0]?.error ||
        "Unable to upload the selected unit photos."
      );
    }

    const newPhotos = uploadResult.uploadedPhotos.map(
      (item) => item.metadata
    );

    // STEP 2: Update only the selected unit's photo array.
    const updatedRoomCategories = property.roomCategories.map((item) =>
      item.id === roomId
        ? {
            ...item,
            photos: [...(item.photos || []), ...newPhotos],
          }
        : item
    );

    // STEP 3: Save updated accommodation units in Firestore.
    await updateHotelProperty(
      property.id,
      { roomCategories: updatedRoomCategories },
      currentUser.uid
    );

    // STEP 4: Update displayed property and directory state.
    const updatedProperty = {
      ...property,
      roomCategories: updatedRoomCategories,
    };

    setSelectedHotelProperty(updatedProperty);

    setHotelPropertyRecords((prev) =>
      prev.map((item) =>
        item.id === property.id ? updatedProperty : item
      )
    );

    setHotelPropertySaveMessage(
      `${newPhotos.length} unit photo(s) added successfully.`
    );

    if (uploadResult.failedPhotos.length > 0) {
      setHotelPropertySaveError(
        `${uploadResult.failedPhotos.length} photo(s) could not be uploaded.`
      );
    }

  } catch (error) {
    console.error("Adding saved unit photos failed:", error);

    setHotelPropertySaveError(
      error.message || "Unable to add accommodation unit photos."
    );
  }
};



const [isSavingHotelProperty, setIsSavingHotelProperty] = useState(false);
const [hotelPropertySaveMessage, setHotelPropertySaveMessage] = useState("");
const [hotelPropertySaveError, setHotelPropertySaveError] = useState("");


// Automatically dismiss success notifications after 5 seconds.
useEffect(() => {
  if (!hotelPropertySaveMessage) return;

  const timer = setTimeout(() => {
    setHotelPropertySaveMessage("");
  }, 5000);

  return () => clearTimeout(timer);
}, [hotelPropertySaveMessage]);



const [savedHotelProperty, setSavedHotelProperty] = useState(null);

const [isEditingHotelProperty, setIsEditingHotelProperty] = useState(false);

const [pendingHotelPhotoDeletions, setPendingHotelPhotoDeletions] = useState([]);

const handleEditHotelProperty = () => {
  const property = selectedHotelProperty;

  if (!property?.id) {
    setHotelPropertySaveError("Property record not found.");
    return;
  }

  const category = ACCOMMODATION_CATEGORIES.find(
    (item) => item.id === property.categoryId
  );

  if (!category) {
    setHotelPropertySaveError(
      "Unable to identify this property's accommodation category."
    );
    return;
  }

  setHotelPropertySaveMessage("");
  setHotelPropertySaveError("");

  setSelectedAccommodationCategory(category);

  setHotelFormData(property);

  setSavedHotelProperty({
    id: property.id,
    propertyId: property.propertyId,
  });

  setIsEditingHotelProperty(true);

  setHotelRoomCategories(
    Array.isArray(property.roomCategories)
      ? property.roomCategories
      : []
  );

  setExpandedHotelRoomCategoryId(null);

  setHotelMasterPage("registration");
};



const handleSaveHotelProperty = async () => {
  if (isSavingHotelProperty) return;

  setHotelPropertySaveMessage("");
  setHotelPropertySaveError("");

  let propertyWasSaved = false;
  let savedProperty = null;

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Please sign in again before saving the property.");
    }

    if (!selectedAccommodationCategory) {
      throw new Error("Please select an accommodation category.");
    }

    const propertyPhotoFiles = (hotelFormData.photos || []).filter(
      (photo) => photo instanceof File
    );

    const roomPhotoFiles = hotelRoomCategories.map((room) => ({
      roomId: room.id,
      files: (room.photos || []).filter(
        (photo) => photo instanceof File
      ),
    }));

    const propertyPayload = buildHotelPropertyPayload({
      formData: hotelFormData,
      accommodationCategory: selectedAccommodationCategory,
      roomCategories: hotelRoomCategories,
    });

    setIsSavingHotelProperty(true);

    
// STEP 1: Save or update the property.
let result;

if (isEditingHotelProperty && savedHotelProperty) {
  result = savedHotelProperty;

  await updateHotelProperty(
    result.id,
    propertyPayload,
    currentUser.uid
  );

} else if (savedHotelProperty) {
  result = savedHotelProperty;

} else {
  result = await createHotelProperty(
    propertyPayload,
    currentUser.uid
  );

  const savedReference = {
    id: result.id,
    propertyId: result.propertyId,
  };

  setSavedHotelProperty(savedReference);
  result = savedReference;
}


propertyWasSaved = true;
savedProperty = result;


    // STEP 2: Upload property photos.
    const propertyUploadResult = propertyPhotoFiles.length
      ? await uploadHotelPhotos(
          propertyPhotoFiles,
          import.meta.env.VITE_GOOGLE_PROPERTY_PHOTOS_FOLDER_ID
        )
      : { uploadedPhotos: [], failedPhotos: [] };

    const uploadedPropertyMap = new Map(
      propertyUploadResult.uploadedPhotos.map((item) => [
        item.file,
        item.metadata,
      ])
    );

    // Preserve existing photos and attach new Drive metadata.
    const updatedPropertyPhotos = (hotelFormData.photos || []).map(
  (photo) => {
    if (!(photo instanceof File)) return photo;

    const uploadedMetadata = uploadedPropertyMap.get(photo);

    if (uploadedMetadata) {
      return {
        ...uploadedMetadata,
        previewUrl: photo.previewUrl,
      };
    }

    // Keep failed original files available for retry.
    return photo;
  }
);


setHotelFormData((prev) => ({
  ...prev,
  photos: updatedPropertyPhotos,
}));



    // STEP 3: Upload photos for each accommodation unit.
   const updatedRoomCategories = [];

let failedRoomPhotoCount = 0;
let totalRoomUploadedPhotos = 0;

    for (const room of hotelRoomCategories) {
      const roomFiles =
        roomPhotoFiles.find((item) => item.roomId === room.id)?.files || [];

      const roomUploadResult = roomFiles.length
        ? await uploadHotelPhotos(
            roomFiles,
            import.meta.env.VITE_GOOGLE_UNIT_PHOTOS_FOLDER_ID
          )
        : { uploadedPhotos: [], failedPhotos: [] };

      failedRoomPhotoCount += roomUploadResult.failedPhotos.length;

      totalRoomUploadedPhotos += roomUploadResult.uploadedPhotos.length;

      const uploadedRoomMap = new Map(
        roomUploadResult.uploadedPhotos.map((item) => [
          item.file,
          item.metadata,
        ])
      );

      const updatedRoomPhotos = (room.photos || []).map((photo) => {
  if (!(photo instanceof File)) return photo;

  const uploadedMetadata = uploadedRoomMap.get(photo);

  if (uploadedMetadata) {
    return {
      ...uploadedMetadata,
      previewUrl: photo.previewUrl,
    };
  }

  // Keep failed original files available for retry.
  return photo;
});

      updatedRoomCategories.push({
        ...room,
        photos: updatedRoomPhotos,
      });
    }


    setHotelRoomCategories(updatedRoomCategories);


    // STEP 4: Update Firestore with Drive photo references.
    const photoUpdateResult = await updateHotelProperty(
      result.id,
      {
        photos: updatedPropertyPhotos,
        roomCategories: updatedRoomCategories,
      },
      currentUser.uid
    );



// STEP 4A: Delete saved photos removed during Edit Property.
const uniquePendingDeletions = [
  ...new Set(pendingHotelPhotoDeletions),
];

const failedPhotoDeletions = [];

for (const driveFileId of uniquePendingDeletions) {
  try {
    await deleteGoogleDrivePhoto(driveFileId);
  } catch (error) {
    console.error(
      "Google Drive photo deletion failed:",
      driveFileId,
      error
    );

    failedPhotoDeletions.push(driveFileId);
  }
}

setPendingHotelPhotoDeletions(failedPhotoDeletions);


// STEP 4B: Refresh the selected property and property listing after Edit.
if (isEditingHotelProperty) {
  const updatedPropertyRecord = {
    ...selectedHotelProperty,
    ...propertyPayload,
    id: result.id,
    propertyId: result.propertyId,
    photos: updatedPropertyPhotos,
    roomCategories: updatedRoomCategories,
  };

  setSelectedHotelProperty(updatedPropertyRecord);

  setHotelPropertyRecords((prev) =>
    prev.map((property) =>
      property.id === result.id
        ? updatedPropertyRecord
        : property
    )
  );
}


    const failedPropertyPhotoCount =
  propertyUploadResult.failedPhotos.length;

const totalFailedPhotos =
  failedPropertyPhotoCount + failedRoomPhotoCount;

const failedDeletionCount = failedPhotoDeletions.length;

const totalUploadedPhotos =
  propertyUploadResult.uploadedPhotos.length +
  totalRoomUploadedPhotos;

// STEP 5: Display the appropriate result.
setHotelPropertySaveMessage(
  `Property saved successfully. Property ID: ${result.propertyId}. ` +
  `${totalUploadedPhotos} new photo(s) uploaded successfully.`
);

const saveWarnings = [];

if (totalFailedPhotos > 0) {
  saveWarnings.push(
    `${totalFailedPhotos} photo(s) could not be uploaded. Please retry the pending photos.`
  );
}

if (failedDeletionCount > 0) {
  saveWarnings.push(
    `${failedDeletionCount} removed photo(s) could not be deleted from Google Drive. Please retry their deletion.`
  );
}

if (saveWarnings.length > 0) {
  setHotelPropertySaveError(saveWarnings.join(" "));
} else {
  setHotelPropertySaveError("");
}

    console.log("Hotel property photo update:", photoUpdateResult);

  } catch (error) {
    console.error("Hotel property save failed:", error);

    if (propertyWasSaved && savedProperty) {
      setHotelPropertySaveMessage(
        `Property saved successfully. Property ID: ${savedProperty.propertyId}.`
      );

      setHotelPropertySaveError(
        `Photo processing or metadata update failed: ${error.message}. ` +
        `The property record is preserved. Please contact Admin before retrying uploads.`
      );
    } else {
      const errorMessages = {
        HOTEL_PROPERTY_ID_COUNTER_NOT_INITIALIZED:
          "The Property ID counter has not been initialized. Please ask an Admin to initialize it first.",
      };

      setHotelPropertySaveError(
        errorMessages[error.message] ||
        error.message ||
        "Unable to save the property. Please try again."
      );
    }
  } finally {
    setIsSavingHotelProperty(false);
  }
};








// SET PROPERTY SCOPE AND DEFAULT COUNTRY
useEffect(() => {
  if (hotelMasterPage !== "registration") return;

  if (hotelMasterView === "domestic-hotels") {
    setHotelFormData((prev) => ({
      ...prev,
      propertyScope: "domestic",
      country: "India",
      stateProvince: "",
      city: "",
    }));
  } else if (hotelMasterView === "international-hotels") {
    setHotelFormData((prev) => ({
      ...prev,
      propertyScope: "international",
      country: "",
      stateProvince: "",
      city: "",
    }));
  } else if (hotelMasterView === "all-hotels") {
    setHotelFormData((prev) => ({
      ...prev,
      propertyScope: "",
      country: "",
      stateProvince: "",
      city: "",
    }));
  }
}, [hotelMasterPage, hotelMasterView]);




// HOTEL LOCATION DATA
const [hotelCountries, setHotelCountries] = useState([]);
const [hotelStates, setHotelStates] = useState([]);
const [hotelCities, setHotelCities] = useState([]);

const [countriesLoading, setCountriesLoading] = useState(false);
const [statesLoading, setStatesLoading] = useState(false);
const [citiesLoading, setCitiesLoading] = useState(false);

const [locationApiError, setLocationApiError] = useState("");

// Load countries
useEffect(() => {
  let cancelled = false;

  const loadCountries = async () => {
    setCountriesLoading(true);

    try {
      const data = await getHotelCountries();

      if (!cancelled) {
        setHotelCountries(data);
      }
    } catch (error) {
      console.error("Unable to load hotel countries:", error);

      if (!cancelled) {
        setLocationApiError("Country list unavailable. You can enter it manually.");
      }
    } finally {
      if (!cancelled) {
        setCountriesLoading(false);
      }
    }
  };

  loadCountries();

  return () => {
    cancelled = true;
  };
}, []);

// Load states when country changes
useEffect(() => {
  let cancelled = false;

  const loadStates = async () => {
    const country = hotelFormData.country;

    setHotelStates([]);
    setHotelCities([]);

    if (!country) return;

    setStatesLoading(true);

    try {
      const data = await getHotelStates(country);

      if (!cancelled) {
        setHotelStates(data);
      }
    } catch (error) {
      console.error("Unable to load hotel states:", error);

      if (!cancelled) {
        setLocationApiError("State list unavailable. You can enter it manually.");
      }
    } finally {
      if (!cancelled) {
        setStatesLoading(false);
      }
    }
  };

  loadStates();

  return () => {
    cancelled = true;
  };
}, [hotelFormData.country]);

// Load cities when country and state change
useEffect(() => {
  let cancelled = false;

  const loadCities = async () => {
    const country = hotelFormData.country;
    const state = hotelFormData.stateProvince;

    setHotelCities([]);

    if (!country || !state) return;

    setCitiesLoading(true);

    try {
      const data = await getHotelCities(country, state);

      if (!cancelled) {
        setHotelCities(data);
      }
    } catch (error) {
      console.error("Unable to load hotel cities:", error);

      if (!cancelled) {
        setLocationApiError("City list unavailable. You can enter it manually.");
      }
    } finally {
      if (!cancelled) {
        setCitiesLoading(false);
      }
    }
  };

  loadCities();

  return () => {
    cancelled = true;
  };
}, [hotelFormData.country, hotelFormData.stateProvince]);




 const sections = [
  {
    id: "hotel-master",
    title: "HOTEL MASTER",
    subtitle: "Hotel Property Database",
    description:
      "Register and manage domestic and international hotels, room categories, facilities and property information.",
    image: "/images/hotel-master/hotel-master.webp",
   gradient: "linear-gradient(120deg, rgba(8,145,178,0.42), rgba(13,148,136,0.38), rgba(22,163,74,0.34))",
  },
  {
    id: "hotel-suppliers",
    title: "HOTEL SUPPLIERS",
    subtitle: "Hotel Supplier Management",
    description:
      "Manage hotel suppliers, commercial relationships, contracts, rates and validity periods.",
    image: "/images/hotel-master/hotel-suppliers.webp",
    gradient: "linear-gradient(110deg, rgba(37,99,235,0.42), rgba(112,69,181,0.38), rgba(229,138,54,0.34))",
  },
];




  const activeItem = sections.find(
    (item) => item.id === activeSection
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "#f4f7fb",
        fontFamily: "inherit",
      }}
    >
      {/* MAIN HEADER */}
      <div
        style={{
          background: "linear-gradient(120deg, #C02675 0%, #9333A8 55%, #4338A8 100%)",
          borderRadius: "14px",
          padding: "25px 28px",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          boxShadow: "0 5px 18px rgba(7,89,133,0.18)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              opacity: 0.85,
              marginBottom: "7px",
            }}
          >
            ORBITZ HOLIDAYS · OPERATIONS
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "25px",
              color: "#FFFFFF",
              fontWeight: 800,
            }}
          >
            HOTEL MASTER & SUPPLIER
          </h2>

          <div style={{ marginTop: "7px", fontSize: "13px",color: "#E5EEFF", opacity: 0.9 }}>
            Hotel Property & Supplier Management
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToWorkspace}
          style={{
            padding: "10px 17px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.55)",
            background: "rgba(255,255,255,0.13)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← BACK TO WORKSPACE
        </button>
      </div>



{/* HOTEL MODULE NAVIGATION */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
    padding: "10px 12px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
  }}
>
  {[
  { id: "home", label: "HOME" },
  { id: "hotel-master", label: "HOTEL MASTER" },
  { id: "hotel-suppliers", label: "HOTEL SUPPLIERS" },
].map((tab) => {

    const selected = activeSection === tab.id;

    const tabColor =
      tab.id === "home"
        ? "#2563EB"
        : tab.id === "hotel-master"
        ? "#0D9488"
        : "#9333A8";

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => setActiveSection(tab.id)}
        style={{
          padding: "9px 16px",
          borderRadius: "7px",
          border: selected
            ? `1px solid ${tabColor}`
            : "1px solid transparent",
          background: selected ? `${tabColor}15` : "transparent",
          color: selected ? tabColor : "#64748B",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.4px",
          cursor: "pointer",
        }}
      >
        {tab.label}
      </button>
    );
  })}
</div>



      {activeSection === "home" ? (
        <>


        {/* HOTEL DASHBOARD STATISTICS */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "24px",
  }}
>
  {[
    {
  label: "TOTAL HOTELS",
  subtitle: "All registered properties",
  image: "/images/hotel-master/hotel-total.webp",
  color: "#2563EB",
},
{
  label: "DOMESTIC HOTELS",
  subtitle: "Properties in India",
  image: "/images/hotel-master/hotel-domestic.webp",
  color: "#0D9488",
},
{
  label: "INTERNATIONAL HOTELS",
  subtitle: "Properties worldwide",
  image: "/images/hotel-master/hotel-international.webp",
  color: "#9333A8",
},
{
  label: "ACTIVE HOTEL SUPPLIERS",
  subtitle: "Active supplier records",
  image: "/images/hotel-master/hotel-suppliers-thumb.webp",
  color: "#C02675",
},

  ].map((stat) => (
    <div
      key={stat.label}
      style={{
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderLeft: `4px solid ${stat.color}`,
  borderRadius: "9px",
  padding: "10px 14px",
  boxShadow: "0 2px 7px rgba(15,23,42,0.035)",
  minHeight: "92px",
}}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            color: "#64748B",
          }}
        >
          {stat.label}
        </span>

       <img
  src={stat.image}
  alt={stat.label}
  style={{
    width: "46px",
    height: "36px",
    objectFit: "cover",
    borderRadius: "7px",
    border: "1px solid #E2E8F0",
    flexShrink: 0,
  }}
/>
      </div>

      <div
        style={{
          fontSize: "21px",
          fontWeight: 800,
          color: "#17324D",
          marginTop: "4px",
        }}
      >
        —
      </div>

      <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "1px" }}>
        {stat.subtitle}
      </div>
    </div>
  ))}
</div>



          <div
  style={{
    margin: "30px 0 20px",
    textAlign: "left",
    borderLeft: "4px solid #0D9488",
    paddingLeft: "14px",
  }}
>
  <h3
    style={{
      margin: 0,
      color: "#17324D",
      fontSize: "21px",
      fontWeight: 800,
      letterSpacing: "0.3px",
    }}
  >
    Hotel Management
  </h3>

  <p
    style={{
      margin: "6px 0 0",
      color: "#64748B",
      fontSize: "13px",
      lineHeight: 1.5,
    }}
  >
    Select a section to manage your hotel operations.
  </p>
</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {sections.map((item) => (
              <div
  key={item.id}
 style={{
  textAlign: "left",
  border: "1px solid #DCE5ED",
  borderRadius: "15px",
  padding: 0,
  overflow: "hidden",
  background: "#FFFFFF",
  boxShadow: "0 5px 18px rgba(15,23,42,0.075)",
  display: "flex",
  flexDirection: "column",
  transition: "box-shadow 0.2s ease",
  minWidth: 0,
}}
              >
                <div
  style={{
    position: "relative",
    minHeight: "180px",
    padding: "22px 23px",
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundImage: `url("${item.image}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    isolation: "isolate",
  }}
>
  <div
  style={{
    fontSize: "20px",
    fontWeight: 900,
    color: "#FFFFFF",
    letterSpacing: "0.3px",
    textShadow: "0 2px 6px rgba(0,0,0,0.85)",
    marginBottom: "12px",
  }}
>
  {item.title}
</div>

<div
  style={{
    display: "inline-flex",
    alignSelf: "flex-start",
    alignItems: "center",
    width: "fit-content",
    background: "rgba(5, 32, 43, 0.78)",
    border: "1px solid rgba(125, 211, 252, 0.85)",
    borderRadius: "7px",
    padding: "6px 11px",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.2px",
    textShadow: "0 1px 3px rgba(0,0,0,0.65)",
    boxShadow: "0 2px 7px rgba(0,0,0,0.22)",
  }}
>
  {item.subtitle}
</div>
</div>


                <div
  style={{
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
    gap: "16px",
  }}
>
  <p
    style={{
      color: "#526579",
      fontSize: "13px",
      lineHeight: 1.65,
      minHeight: "58px",
      margin: 0,
    }}
  >
    {item.description}
  </p>

                  <button
  type="button"
  onClick={() => setActiveSection(item.id)}
  style={{
  border: "1px solid #D5E2ED",
  borderRadius: "7px",
  background: "#F4F8FC",
  color: "#075985",
  fontWeight: 800,
  fontSize: "12px",
  padding: "10px 14px",
  cursor: "pointer",
  textAlign: "left",
  alignSelf: "flex-start",
  transition: "background 0.2s ease",
}}
>
  OPEN SECTION →
</button>

                </div>
              </div>
            ))}
          </div>
        </>

    ) : activeSection === "hotel-master" ? (
  <div
    style={{
      marginTop: "12px",
padding: "10px",
      background: "#FFFFFF",
      border: "1px solid #E1E8F0",
      borderRadius: "12px",
    }}
  >
    
{/* HOTEL MASTER COMPACT HEADER + INTERNAL NAVIGATION */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
    padding: "7px 12px",
    marginBottom: "7px",
    background:
      "linear-gradient(90deg, #D7F3EF 0%, #E8F5F4 35%, #FFFFFF 100%)",
    borderLeft: "4px solid #0D9488",
    borderRadius: "8px",
  }}
>
  {/* LEFT: HOTEL MASTER TITLE */}
  <div style={{ flex: "1 1 320px", textAlign: "left" }}>
    <h2
      style={{
        color: "#17324D",
        fontSize: "18px",
        fontWeight: 800,
        margin: 0,
      }}
    >
      HOTEL MASTER
    </h2>

    <p
      style={{
        color: "#64748B",
        fontSize: "13px",
        margin: "3px 0 0",
        lineHeight: 1.5,
      }}
    >
      Register and manage domestic and international hotels, room
      categories, facilities and property information.
    </p>
  </div>

  {/* VERTICAL DIVIDER */}
  <div
    style={{
      width: "1px",
      height: "30px",
      background: "#B8D9D4",
      flexShrink: 0,
    }}
  />

  {/* RIGHT: INTERNAL NAVIGATION */}
  <div
    style={{
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap",
  flexShrink: 0,
  padding: "7px 9px",
  background:
    "linear-gradient(110deg, #D7F3EF 0%, #E5EDF9 55%, #EDE7FA 100%)",
  border: "1px solid #D5E2EE",
  borderRadius: "9px",
}}
  >
    {[
      { id: "domestic-hotels", label: "DOMESTIC HOTELS" },
      { id: "international-hotels", label: "INTERNATIONAL HOTELS" },
      { id: "all-hotels", label: "ALL HOTELS" },
    ].map((tab) => {
      const selected = hotelMasterView === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => setHotelMasterView(tab.id)}
          style={{
            padding: "7px 11px",
            borderRadius: "7px",
            border: selected
              ? "1px solid #0D9488"
              : "1px solid transparent",
            background: selected ? "#E8F5F3" : "transparent",
            color: selected ? "#0D9488" : "#64748B",
            fontSize: "10px",
            fontWeight: 800,
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
</div>





    {/* SELECTED HOTEL DATABASE */}

    {hotelMasterPage === "categories" && (
  <>

<div
  style={{
    padding: "18px",
    background: "#F4F7FB",
    borderRadius: "10px",
    textAlign: "left",
  }}
>
  <div
    style={{
      marginBottom: "16px",
      color: "#17324D",
      fontSize: "15px",
      fontWeight: 800,
    }}
  >
    {hotelMasterView === "domestic-hotels"
      ? "Domestic Accommodation — India"
      : hotelMasterView === "international-hotels"
      ? "International Accommodation — Worldwide"
      : "All Accommodation — Domestic and International"}
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
      gap: "14px",
    }}
  >
    {ACCOMMODATION_CATEGORIES.map((category) => (
      <div
  key={category.id}
  onClick={() => {
  // Save the current category's filters before switching
  if (selectedAccommodationCategory?.id) {
    setCategoryPropertyFilters((prev) => ({
      ...prev,
      [selectedAccommodationCategory.id]: {
        search: propertyListSearch,
        status: propertyListStatus,
        state: propertyStateFilter,
        domesticCity: propertyDomesticCityFilter,
        country: propertyCountryFilter,
        internationalCity: propertyInternationalCityFilter,
      },
    }));
  }

  // Restore the selected category's previously saved filters
  const savedFilters = categoryPropertyFilters[category.id] || {};

  setPropertyListSearch(savedFilters.search || "");
  setPropertyListStatus(savedFilters.status || "all");
  setPropertyStateFilter(savedFilters.state || "");
  setPropertyDomesticCityFilter(savedFilters.domesticCity || "");
  setPropertyCountryFilter(savedFilters.country || "");
  setPropertyInternationalCityFilter(savedFilters.internationalCity || "");

  setSelectedAccommodationCategory(category);
  setHotelFormData({});
  setSavedHotelProperty(null);
  setHotelRoomCategories([]);
  setExpandedHotelRoomCategoryId(null);
  setHotelMasterPage("listing");
}}
  style={{
    background: "#FFFFFF",
    border:
      selectedAccommodationCategory?.id === category.id
        ? "2px solid #0D9488"
        : "1px solid #DCE5ED",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow:
      selectedAccommodationCategory?.id === category.id
        ? "0 3px 12px rgba(13,148,136,0.18)"
        : "none",
  }}
>
        {category.image ? (
          <img
            src={category.image}
            alt={category.label}
            style={{
              width: "100%",
              height: "112px",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              height: "112px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(120deg, #D7F3EF, #E5EDF9)",
              color: "#0D9488",
              fontSize: "30px",
              fontWeight: 800,
            }}
          >
            +
          </div>
        )}

        <div
          style={{
            padding: "11px 10px",
            color: "#17324D",
            fontSize: "13px",
            fontWeight: 750,
            textAlign: "center",
            minHeight: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {category.label}
        </div>
      </div>
    ))}
  </div>
</div>

  </>
)}

{/* SELECTED CATEGORY PANEL */}

{hotelMasterPage === "listing" && selectedAccommodationCategory && (
  <div
  style={{
    marginTop: "6px",
padding: "7px 11px",
    background: "#FFFFFF",
    border: "1px solid #DCE5ED",
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
    textAlign: "left",
  }}
>


  {hotelPropertySaveMessage && (
  <div
    style={{
      position: "fixed",
      top: "22px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99999,
      width: "min(520px, calc(100% - 32px))",
      boxSizing: "border-box",
      padding: "14px 20px",
      borderRadius: "10px",
      background: "linear-gradient(110deg, #047857, #059669)",
      border: "1px solid #6EE7B7",
      color: "#FFFFFF",
      fontSize: "13px",
      fontWeight: 750,
      boxShadow: "0 8px 28px rgba(0,0,0,0.20)",
      textAlign: "center",
    }}
  >
    <span style={{ marginRight: "8px" }}>✓</span>
    {hotelPropertySaveMessage}
  </div>
)}


{hotelPropertySaveError && (
  <div
    style={{
      marginBottom: "12px",
      padding: "12px 15px",
      borderRadius: "7px",
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      color: "#B91C1C",
      fontSize: "13px",
      fontWeight: 700,
    }}
  >
    {hotelPropertySaveError}
  </div>
)}


    
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
marginBottom: "5px",
  }}
>
  <div>
    <h3
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        maxWidth: "100%",
        margin: 0,
       padding: "4px 24px 4px 9px",
        borderRadius: "6px",
        background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#173B70"} 0%, ${selectedCategoryTheme?.primary || "#173B70"} calc(100% - 28px), ${selectedCategoryTheme?.light || "#EEF4FB"} 100%)`,
        color: "#FFFFFF",
        fontSize: "14px",
        fontWeight: 900,
        letterSpacing: "0.2px",
        lineHeight: 1.15,
      }}
    >
      {selectedAccommodationCategory.label}
    </h3>

    <p
      style={{
       margin: "3px 0 0",
        color: selectedCategoryTheme?.primary || "#173B70",
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "0.15px",
      }}
    >
      {hotelMasterView === "domestic-hotels"
        ? "Domestic properties — India"
        : hotelMasterView === "international-hotels"
        ? "International properties — Worldwide"
        : "All domestic and international properties"}
    </p>
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "9px",
      flexWrap: "wrap",
    }}
  >
    <button
      type="button"
      
onClick={() => {
  setHotelPropertySaveMessage("");
  setHotelPropertySaveError("");

  setHotelFormData({});
  setSavedHotelProperty(null);
  setIsEditingHotelProperty(false);
  setHotelRoomCategories([]);
  setExpandedHotelRoomCategoryId(null);
  setHotelMasterPage("registration");
}}

      style={{
        padding: "6px 11px",
        border: "none",
        borderRadius: "7px",
        background: selectedCategoryTheme?.primary || "#173B70",
        color: "#FFFFFF",
        fontSize: "12px",
        fontWeight: 750,
        cursor: "pointer",
      }}
    >
      + Add New Property
    </button>

    <button
      type="button"
      onClick={() => {
  setSelectedAccommodationCategory(null);
  setHotelMasterPage("categories");
}}
      style={{
        padding: "6px 12px",
        border: `1px solid ${selectedCategoryTheme?.border}`,
        borderRadius: "7px",
        background: selectedCategoryTheme?.light,
        color: selectedCategoryTheme?.primary,
        fontSize: "12px",
        fontWeight: 750,
        cursor: "pointer",
      }}
    >
      ← Back to Categories
    </button>
  </div>
</div>


    {/* PROPERTY LIST TOOLBAR */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
padding: "6px 9px",
marginTop: "5px",
marginBottom: "7px",
        background: selectedCategoryTheme?.light || "#F4F7FB",
        border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
        borderRadius: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            background: selectedCategoryTheme?.primary || "#0D9488",
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: 800,
          }}
        >
          ▤
        </span>
        <div>
          <div style={{ color: "#17324D", fontSize: "12px", fontWeight: 850 }}>
            PROPERTY DIRECTORY
          </div>
          <div
            style={{
              color: selectedCategoryTheme?.primary || "#173B70",
              fontSize: "11px",
              fontWeight: 750,
              marginTop: "4px",
              letterSpacing: "0.1px",
            }}
          >
            {filteredHotelProperties.length} properties registered in this category
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          flex: "1 1 360px",
          justifyContent: "flex-end",
        }}
      >


                {/* DOMESTIC LOCATION FILTERS */}
        {(hotelMasterView === "domestic-hotels" ||
          hotelMasterView === "all-hotels") && (
          <>
            <div style={{
  width: "2px",
  minWidth: "2px",
  height: "30px",
  flexShrink: 0,
  background: "linear-gradient(180deg, #DCE8F3 0%, #9FB7D0 50%, #DCE8F3 100%)",
  borderRadius: "2px",
  margin: "0 4px",
}}
             />

            <select
              value={propertyStateFilter}
              onChange={(e) => setPropertyStateFilter(e.target.value)}
              aria-label="Filter by State or UT"
              style={{
  height: "36px",
  width: "125px",
  padding: "0 9px",
  border: "1px solid #C5D5E6",
  borderRadius: "6px",
  outline: "none",
  background: "#F0F6FC",
  color: "#173B70",
  fontSize: "11px",
  fontWeight: 750,
  cursor: "pointer",
}}
            >
              <option value="">All States / UT</option>
              {[...new Set(
                hotelPropertyRecords
                  .filter((p) => p.propertyScope === "domestic")
                  .map((p) => p.stateProvince)
                  .filter(Boolean)
              )].sort().map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>


            <div
  style={{
    width: "2px",
    minWidth: "2px",
    height: "30px",
    flexShrink: 0,
    background: "linear-gradient(180deg, #DCE8F3 0%, #9FB7D0 50%, #DCE8F3 100%)",
    borderRadius: "2px",
    margin: "0 2px",
  }}
/>


            <select
              value={propertyDomesticCityFilter}
              onChange={(e) => setPropertyDomesticCityFilter(e.target.value)}
              aria-label="Filter by Domestic City"
              style={{
  height: "36px",
  width: "125px",
  padding: "0 9px",
  border: "1px solid #C5D5E6",
  borderRadius: "6px",
  outline: "none",
  background: "#F0F6FC",
  color: "#173B70",
  fontSize: "11px",
  fontWeight: 750,
  cursor: "pointer",
}}
            >
              <option value="">All Cities</option>
              {[...new Set(
                hotelPropertyRecords
                  .filter((p) => p.propertyScope === "domestic")
                  .map((p) => p.city)
                  .filter(Boolean)
              )].sort().map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </>
        )}

        {/* INTERNATIONAL LOCATION FILTERS */}
        {(hotelMasterView === "international-hotels" ||
          hotelMasterView === "all-hotels") && (
          <>
            <div style={{
  width: "2px",
  minWidth: "2px",
  height: "30px",
  flexShrink: 0,
  background: "linear-gradient(180deg, #DCE8F3 0%, #9FB7D0 50%, #DCE8F3 100%)",
  borderRadius: "2px",
  margin: "0 4px",
}}
            />

            <select
              value={propertyCountryFilter}
              onChange={(e) => setPropertyCountryFilter(e.target.value)}
              aria-label="Filter by Country"
              style={{
  height: "36px",
  width: "125px",
  padding: "0 9px",
  border: "1px solid #C5D5E6",
  borderRadius: "6px",
  outline: "none",
  background: "#F0F6FC",
  color: "#173B70",
  fontSize: "11px",
  fontWeight: 750,
  cursor: "pointer",
}}
            >
              <option value="">All Countries</option>
              {[...new Set(
                hotelPropertyRecords
                  .filter((p) => p.propertyScope === "international")
                  .map((p) => p.country)
                  .filter(Boolean)
              )].sort().map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>


            <div
  style={{
    width: "2px",
    minWidth: "2px",
    height: "30px",
    flexShrink: 0,
    background: "linear-gradient(180deg, #DCE8F3 0%, #9FB7D0 50%, #DCE8F3 100%)",
    borderRadius: "2px",
    margin: "0 2px",
  }}
/>



            <select
              value={propertyInternationalCityFilter}
              onChange={(e) => setPropertyInternationalCityFilter(e.target.value)}
              aria-label="Filter by International City"
             style={{
  height: "36px",
  width: "125px",
  padding: "0 9px",
  border: "1px solid #C5D5E6",
  borderRadius: "6px",
  outline: "none",
  background: "#F0F6FC",
  color: "#173B70",
  fontSize: "11px",
  fontWeight: 750,
  cursor: "pointer",
}}
            >
              <option value="">All Cities</option>
              {[...new Set(
                hotelPropertyRecords
                  .filter((p) => p.propertyScope === "international")
                  .map((p) => p.city)
                  .filter(Boolean)
              )].sort().map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </>
        )}

        <div style={{
  width: "2px",
  minWidth: "2px",
  height: "30px",
  flexShrink: 0,
  background: "linear-gradient(180deg, #DCE8F3 0%, #9FB7D0 50%, #DCE8F3 100%)",
  borderRadius: "2px",
  margin: "0 4px",
}}
         />



        <input
          type="search"
          value={propertyListSearch}
          onChange={(e) => setPropertyListSearch(e.target.value)}
          placeholder="Search property name / location / ID..."
          aria-label="Search properties"
          style={{
  width: "min(100%, 285px)",
  height: "36px",
  boxSizing: "border-box",
  padding: "0 12px",
  border: "1px solid #B8CBE0",
  borderRadius: "6px",
  outline: "none",
  background: "#FFFFFF",
  color: "#173B70",
  fontSize: "11px",
  fontWeight: 600,
}}
        />
        <select
          value={propertyListStatus}
          onChange={(e) => setPropertyListStatus(e.target.value)}
          aria-label="Filter properties by status"
          style={{
            height: "36px",
            padding: "0 10px",
            border: `1px solid ${selectedCategoryTheme?.border || "#CBD5E1"}`,
            borderRadius: "6px",
            background: "#FFFFFF",
            color: "#475569",
            fontSize: "11px",
            fontWeight: 650,
          }}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>

    {/* PREMIUM PROPERTY TABLE — DATA CONNECTION WILL BE ADDED WITH FIRESTORE */}
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        border: `1px solid ${selectedCategoryTheme?.border || "#D7E1EA"}`,
        borderRadius: "9px",
        background: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: hotelMasterView === "all-hotels" ? "1320px" : "1050px",
          borderCollapse: "separate",
          borderSpacing: 0,
          textAlign: "left",
        }}
      >
        <thead>
          <tr
            style={{
              background: `linear-gradient(110deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.secondary || selectedCategoryTheme?.primary || "#0D9488"} 100%)`,
            }}
          >
            {[
              "PROPERTY ID",
              "PROPERTY NAME",
              ...(hotelMasterView === "international-hotels"
                ? ["COUNTRY", "CITY"]
                : hotelMasterView === "all-hotels"
                ? ["STATE / UT", "DOMESTIC CITY", "COUNTRY", "INTERNATIONAL CITY"]
                : ["STATE / UT", "CITY"]),
              "CATEGORY",
              "ROOM / UNIT TYPES",
              "STATUS",
              "ACTIONS",
            ].map((heading) => (
              <th
                key={heading}
                style={{
                  padding: "11px 10px",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 850,
                  letterSpacing: "0.45px",
                  whiteSpace: "nowrap",
                  borderRight: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
  {isLoadingHotelProperties ? (
    <tr>
      <td
        colSpan={hotelMasterView === "all-hotels" ? 10 : 8}
        style={{
          padding: "30px 16px",
          textAlign: "center",
          color: "#64748B",
          fontSize: "12px",
        }}
      >
        Loading property records...
      </td>
    </tr>
  ) : hotelPropertyLoadError ? (
    <tr>
      <td
        colSpan={hotelMasterView === "all-hotels" ? 10 : 8}
        style={{
          padding: "30px 16px",
          textAlign: "center",
          color: "#B91C1C",
          fontSize: "12px",
        }}
      >
        {hotelPropertyLoadError}
      </td>
    </tr>
  ) : filteredHotelProperties.length === 0 ? (
    <tr>
      <td
        colSpan={hotelMasterView === "all-hotels" ? 10 : 8}
        style={{
          padding: "34px 16px",
          textAlign: "center",
          background: selectedCategoryTheme?.light || "#F7FAFC",
          borderBottom: "1px solid #E8EEF4",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#FFFFFF",
            border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
            color: selectedCategoryTheme?.primary || "#0D9488",
            fontSize: "20px",
            marginBottom: "9px",
          }}
        >
          ▤
        </div>
        <div style={{ color: "#334155", fontSize: "12px", fontWeight: 800 }}>
          No properties found
        </div>
        <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "5px" }}>
          Add a new {selectedAccommodationCategory.label.toLowerCase()} or adjust your search and filters.
        </div>
      </td>
    </tr>
  ) : (
    filteredHotelProperties.map((property, index) => {
     const roomUnitTypes = [
  ...new Set(
    (property.roomCategories || [])
      .flatMap((room) => {
        const typeFields = [
          ["roomCategory", "customRoomCategory"],
          ["accommodationType", "customAccommodationType"],
          ["unitName", null],
          ["villaType", "customVillaType"],
          ["roomType", "customRoomType"],
          ["tentType", "customTentType"],
          ["lodgeUnitType", "customLodgeUnitType"],
          ["dormitoryType", "customDormitoryType"],
          ["apartmentType", "customApartmentType"],
        ];

        const values = typeFields
          .map(([field, customField]) => {
            const value = room[field];

            if (value === "Other" && customField && room[customField]) {
              return room[customField];
            }

            return value && value !== "Other" ? value : "";
          })
          .filter(Boolean);

       

        return values;
      })
      .map((value) => String(value).trim())
      .filter(Boolean)
  ),
];

      const isDomestic = property.propertyScope === "domestic";

      return (
        <tr
          key={property.id || property.propertyId}
          style={{
            background: index % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
          }}
        >
          <td style={propertyTableCellStyle}>
            {property.propertyId || "—"}
          </td>

          <td style={propertyTableCellStyle}>
            <div style={{ color: "#17324D", fontWeight: 800 }}>
              {property.propertyName || property.displayName || "—"}
            </div>
          </td>

          {hotelMasterView === "international-hotels" ? (
            <>
              <td style={propertyTableCellStyle}>
                {property.country || "—"}
              </td>
              <td style={propertyTableCellStyle}>
                {property.city || "—"}
              </td>
            </>
          ) : hotelMasterView === "all-hotels" ? (
            <>
              <td style={propertyTableCellStyle}>
                {isDomestic ? property.stateProvince || "—" : "—"}
              </td>
              <td style={propertyTableCellStyle}>
                {isDomestic ? property.city || "—" : "—"}
              </td>
              <td style={propertyTableCellStyle}>
                {!isDomestic ? property.country || "—" : "—"}
              </td>
              <td style={propertyTableCellStyle}>
                {!isDomestic ? property.city || "—" : "—"}
              </td>
            </>
          ) : (
            <>
              <td style={propertyTableCellStyle}>
                {property.stateProvince || "—"}
              </td>
              <td style={propertyTableCellStyle}>
                {property.city || "—"}
              </td>
            </>
          )}

          <td style={propertyTableCellStyle}>
  {(() => {
    const classificationField = selectedCategoryFormConfig?.classification;

    if (!classificationField) return "—";

    const classificationValue = property[classificationField.name];

    if (
      classificationValue === "Other" &&
      property[`${classificationField.name}Custom`]
    ) {
      return property[`${classificationField.name}Custom`];
    }

    return classificationValue || "—";
  })()}
</td>

          <td style={propertyTableCellStyle}>
  {roomUnitTypes.length > 0 ? (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px",
        minWidth: "130px",
        maxWidth: "240px",
      }}
    >
      {roomUnitTypes.slice(0, 2).map((type, typeIndex) => (
        <span
          key={`${type}-${typeIndex}`}
          style={{
            padding: "3px 7px",
            borderRadius: "5px",
            background: selectedCategoryTheme?.light || "#EEF4FB",
            border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
            color: "#334155",
            fontSize: "10px",
            fontWeight: 700,
            whiteSpace: "normal",
          }}
        >
          {type}
        </span>
      ))}

      {roomUnitTypes.length > 2 && (
        <span
          style={{
            color: selectedCategoryTheme?.primary || "#173B70",
            fontSize: "10px",
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          + {roomUnitTypes.length - 2} more
        </span>
      )}
    </div>
  ) : (
    "—"
  )}
</td>

          <td style={propertyTableCellStyle}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 8px",
                borderRadius: "20px",
                background:
                  String(property.status || "Active").toLowerCase() === "active"
                    ? "#DCFCE7"
                    : "#F1F5F9",
                color:
                  String(property.status || "Active").toLowerCase() === "active"
                    ? "#166534"
                    : "#64748B",
                fontSize: "10px",
                fontWeight: 800,
              }}
            >
              {property.status || "Active"}
            </span>
          </td>

          <td
            style={{
              ...propertyTableCellStyle,
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => {
  console.log("HOTEL PROPERTY PHOTO DATA:", property.photos);
  console.log("ROOM CATEGORY PHOTO DATA:", property.roomCategories);
  setSelectedHotelProperty(property);
  setHotelMasterPage("details-preview");
}}
              style={{
                padding: "7px 12px",
                border: `1px solid ${selectedCategoryTheme?.border || "#CBD5E1"}`,
                borderRadius: "6px",
                background: selectedCategoryTheme?.light || "#F4F8FB",
                color: selectedCategoryTheme?.primary || "#173B70",
                fontSize: "10px",
                fontWeight: 850,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              View
            </button>

                        {isAdmin && (
              <button
                type="button"
                onClick={() => handleDeleteHotelProperty(property)}
                style={{
                  marginLeft: "6px",
                  padding: "7px 12px",
                  border: "1px solid #FECACA",
                  borderRadius: "6px",
                  background: "#FEF2F2",
                  color: "#B91C1C",
                  fontSize: "10px",
                  fontWeight: 850,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Delete
              </button>
            )}

          </td>
        </tr>
      );
    })
  )}
</tbody>

      </table>
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        padding: "8px 3px 1px",
        color: "#94A3B8",
        fontSize: "10px",
      }}
    >
      <span>
  Showing {filteredHotelProperties.length} properties
</span>
<span>
  {filteredHotelProperties.length > 0
    ? "Select View to see the complete property details."
    : "Property records matching your selected filters will appear here."}
</span>
    </div>

  </div>
)}


{/* PROPERTY DETAILS PAGE — UI PREVIEW ONLY UNTIL DATABASE INTEGRATION */}
{hotelMasterPage === "details-preview" && selectedAccommodationCategory && (
  <div
    style={{
      marginTop: "12px",
      padding: "18px",
      background: "#FFFFFF",
      border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
      borderTop: `5px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
      borderRadius: "11px",
      textAlign: "left",
    }}
  >
   
    {/* INTEGRATED PROPERTY DETAILS BANNER */}
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-between",
        gap: "18px",
        flexWrap: "wrap",
        minHeight: "190px",
        overflow: "hidden",
        padding: "22px 24px",
        marginBottom: "16px",
        borderRadius: "9px",
        background: `linear-gradient(110deg, ${selectedCategoryTheme?.primary || "#173B70"} 0%, ${selectedCategoryTheme?.primary || "#173B70"} 55%, ${selectedCategoryTheme?.light || "#EEF3FA"} 100%)`,
      }}
    >
      {selectedAccommodationCategory.image && (
        <>
          <img
            src={selectedAccommodationCategory.image}
            alt={selectedAccommodationCategory.label}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "72%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
             background: `linear-gradient(90deg,
  ${selectedCategoryTheme?.primary || "#173B70"} 0%,
  ${selectedCategoryTheme?.primary || "#173B70"} 22%,
  ${selectedCategoryTheme?.primary || "#173B70"}CC 38%,
  ${selectedCategoryTheme?.primary || "#173B70"}55 52%,
  transparent 68%
)`,
            }}
          />
        </>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minWidth: "240px",
          flex: "1 1 300px",
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "1.2px",
            marginBottom: "7px",
          }}
        >
          {selectedAccommodationCategory.label.toUpperCase()} · PROPERTY DETAILS
        </div>

        <div
          style={{
            color: "#FFFFFF",
            fontSize: "23px",
            fontWeight: 900,
            lineHeight: 1.25,
            textShadow: "0 1px 5px rgba(0,0,0,0.2)",
          }}
        >
          {selectedHotelProperty?.propertyName || selectedHotelProperty?.displayName || "Property Name"}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: "12px",
            fontWeight: 650,
            marginTop: "7px",
          }}
        >
          {[
            selectedHotelProperty?.stateProvince,
            selectedHotelProperty?.city,
            selectedHotelProperty?.country,
          ].filter(Boolean).join(" · ") || "Property location"}
        </div>

        
<div
  style={{
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
    marginTop: "13px",
  }}
>
  {[
    `ID: ${selectedHotelProperty?.propertyId || "—"}`,
    `CATEGORY: ${selectedAccommodationCategory.label.toUpperCase()}`,
    `STATUS: ${selectedHotelProperty?.status || "Active"}`,
  ].map((item) => {
    const isStatus = item.startsWith("STATUS:");
    const status = (selectedHotelProperty?.status || "Active").toLowerCase();

    const statusColor =
      status === "active" ? "#16A34A" :
      status === "inactive" ? "#DC2626" :
      "#D97706";

    return (
      <span
        key={item.startsWith("STATUS:") ? "property-status" : item}
        style={{
          padding: "6px 9px",
          borderRadius: "6px",
          background: isStatus
            ? statusColor
            : "rgba(255,255,255,0.16)",
          border: "1px solid rgba(255,255,255,0.65)",
          color: "#FFFFFF",
          fontSize: "10px",
          fontWeight: 850,
        }}
      >
        {item}
      </span>
    );
  })}
</div>
    </div>

      
    </div>




    {/* PROPERTY ACTION BAR */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "10px",
        flexWrap: "wrap",
        padding: "9px 12px",
        marginTop: "-7px",
        marginBottom: "15px",
        border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
        borderRadius: "7px",
        background: selectedCategoryTheme?.light || "#F4F8FB",
      }}
    >
      

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setHotelMasterPage("listing")}
          style={{
            padding: "8px 13px",
            border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
            borderRadius: "6px",
            background: "#FFFFFF",
            color: selectedCategoryTheme?.primary || "#173B70",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          ← BACK TO DIRECTORY
        </button>

        <button
  type="button"
  onClick={handleEditHotelProperty}
          style={{
            padding: "8px 13px",
            border: "none",
            borderRadius: "6px",
            background: selectedCategoryTheme?.primary || "#173B70",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
            opacity: 0.65,
          }}
        >
          EDIT PROPERTY
        </button>
      </div>
    </div>




   
{[
  { number: "01", title: "BASIC PROPERTY DETAILS", note: "Property identification and category-specific details." },
  { number: "02", title: "LOCATION DETAILS", note: "Domestic: State / UT and City. International: Country and City. Full address and postal details." },
  { number: "03", title: "CONTACT DETAILS", note: "Reservation contact person, phone, WhatsApp, email and website." },
  { number: "04", title: "ACCOMMODATION UNITS", note: "Category-specific room, villa, tent, apartment, dormitory or other unit details, capacities and room facilities." },
  { number: "05", title: "PROPERTY AMENITIES & FACILITIES", note: "Property amenities and additional facilities." },
  { number: "06", title: "PROPERTY OPERATIONAL DETAILS", note: "Check-in / check-out timings and other operational information." },
  { number: "07", title: "PROPERTY PHOTOS", note: "Property gallery with image preview. Individual room or unit photos will remain with their respective units." },
  { number: "08", title: "PROPERTY STATUS", note: "Active / Inactive status and record information." },
].map((section) => (
  <div
    key={section.number}
    
style={{
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: section.number === "01" ? "12px" : "12px",
  alignItems: section.number === "01" ? "stretch" : "center",
  padding: "12px 14px",
  marginBottom: "9px",
  border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
  borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
  borderRadius: "7px",
  background: selectedCategoryTheme?.light || "#F7FAFC",
}}

  >
    <div
      
style={{
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  maxWidth: "100%",
  padding: "8px 14px 8px 10px",
  borderRadius: "6px",
  background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} 78%, ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
  color: "#FFFFFF",
  fontSize: "11px",
  fontWeight: 900,
}}

    >
      {section.number === "04"
  ? selectedHotelProperty?.categoryId === "RESORT"
    ? "04. RESORT ACCOMMODATION CATEGORIES"
    : selectedHotelProperty?.categoryId === "VILLA"
    ? "04. VILLA ACCOMMODATION CATEGORIES"
    : selectedHotelProperty?.categoryId === "HOMESTAY"
    ? "04. HOMESTAY ROOM CATEGORIES"
    : selectedHotelProperty?.categoryId === "SAFARI_CAMP"
    ? "04. TENT / CAMP ACCOMMODATION CATEGORIES"
    : selectedHotelProperty?.categoryId === "SAFARI_LODGE"
    ? "04. LODGE ACCOMMODATION CATEGORIES"
    : selectedHotelProperty?.categoryId === "GUEST_HOUSE"
    ? "04. GUEST HOUSE ROOM CATEGORIES"
    : selectedHotelProperty?.categoryId === "SERVICED_APARTMENT"
    ? "04. APARTMENT CATEGORIES"
    : selectedHotelProperty?.categoryId === "BOUTIQUE_STAY"
    ? "04. BOUTIQUE ACCOMMODATION CATEGORIES"
    : selectedHotelProperty?.categoryId === "HOSTEL"
    ? "04. DORMITORY / PRIVATE ROOM CATEGORIES"
    : selectedHotelProperty?.categoryId === "OTHER"
    ? "04. ACCOMMODATION CATEGORIES"
    : "04. ROOM CATEGORIES"
  : `${section.number}. ${section.title}`}
    </div>

   


{section.number === "01" ? (
  <div
    
style={{
  display: "flex",
  flexWrap: "wrap",
  alignItems: "stretch",
  gap: "8px",
  width: "100%",
}}

  >
    {[
      {
        name: "propertyName",
        label: "Property Name",
      },
      {
        name: "displayName",
        label: "Display Name",
      },
      ...(selectedCategoryFormConfig?.classification
        ? [selectedCategoryFormConfig.classification]
        : []),
      ...(selectedCategoryFormConfig?.fields || []),
    ]
      .filter((field) => {
        const value = selectedHotelProperty?.[field.name];

        return (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        );
      })
      .map((field) => {
        const value = selectedHotelProperty[field.name];

        return (
          <div
            key={field.name}
            

style={{
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "6px",
  width: "fit-content",
  maxWidth: "100%",
  padding: "9px 12px",
  border: "1px solid #C7D6E9",
  borderRadius: "8px",
  background: "#FFFFFF",
  ...(field.type === "multiselect" ? { flex: "1 1 100%" } : {}),
}}
>
            <span
              style={{
                color: "#173B70",
                fontSize: "12px",
                fontWeight: 850,
              }}
            >
              {field.label}:
            </span>

            <span
              style={{
                color: "#172B43",
                fontSize: "12px",
                fontWeight: 650,
                overflowWrap: "anywhere",
              }}
            >
              {Array.isArray(value)
                ? value.join(", ")
                : String(value)}
            </span>
          </div>
        );
      })}

    {selectedHotelProperty?.propertyDescription && (
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "6px",
          padding: "10px 12px",
          border: "1px solid #C7D6E9",
          borderRadius: "8px",
          background: "#FFFFFF",
        }}
      >
        <span style={{ color: "#173B70", fontSize: "12px", fontWeight: 850 }}>
          Property Description:
        </span>
        <span style={{ color: "#172B43", fontSize: "12px", fontWeight: 650 }}>
          {selectedHotelProperty.propertyDescription}
        </span>
      </div>
    )}

    {!selectedHotelProperty?.propertyName && (
      <div style={{ color: "#64748B", fontSize: "11px" }}>
        No basic property information available.
      </div>
    )}
  </div>

) : section.number === "02" ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "stretch",
      gap: "8px",
      width: "100%",
    }}
  >
    {[
      { name: "country", label: "Country" },
      { name: "stateProvince", label: "State / Province / Region" },
      { name: "city", label: "City" },
      { name: "area", label: "Area / Locality" },
      { name: "postalCode", label: "Postal Code" },
      { name: "fullAddress", label: "Full Address" },
      { name: "googleMapsLocation", label: "Google Maps Location" },
    ]
      .filter((field) => {
        const value = selectedHotelProperty?.[field.name];
        return value !== undefined && value !== null && value !== "";
      })
      .map((field) => (
        <div
          key={field.name}
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
            width: ["fullAddress", "googleMapsLocation"].includes(field.name)
              ? "100%"
              : "fit-content",
            maxWidth: "100%",
            padding: "9px 12px",
            border: "1px solid #C7D6E9",
            borderRadius: "8px",
            background: "#FFFFFF",
          }}
        >
          <span
            style={{
              color: "#173B70",
              fontSize: "12px",
              fontWeight: 850,
            }}
          >
            {field.label}:
          </span>
          <span
            style={{
              color: "#172B43",
              fontSize: "12px",
              fontWeight: 650,
              overflowWrap: "anywhere",
            }}
          >
            {String(selectedHotelProperty[field.name])}
          </span>
        </div>
      ))}

    {![
      "country",
      "stateProvince",
      "city",
      "area",
      "postalCode",
      "fullAddress",
      "googleMapsLocation",
    ].some((name) => {
      const value = selectedHotelProperty?.[name];
      return value !== undefined && value !== null && value !== "";
    }) && (
      <div style={{ color: "#64748B", fontSize: "11px" }}>
        No location information available.
      </div>
    )}
  </div>

) : section.number === "03" ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "stretch",
      gap: "8px",
      width: "100%",
    }}
  >
    {[
      { name: "contactPerson", label: "Reservation Contact Person" },
      { name: "contactPhone", label: "Contact Phone" },
      { name: "whatsappNumber", label: "WhatsApp Number" },
      { name: "email", label: "Email Address" },
      { name: "website", label: "Website" },
    ]
      .filter((field) => {
        const value = selectedHotelProperty?.[field.name];
        return value !== undefined && value !== null && value !== "";
      })
      .map((field) => (
        <div
          key={field.name}
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
            width: "fit-content",
            maxWidth: "100%",
            padding: "9px 12px",
            border: "1px solid #C7D6E9",
            borderRadius: "8px",
            background: "#FFFFFF",
          }}
        >
          <span
            style={{
              color: "#173B70",
              fontSize: "12px",
              fontWeight: 850,
            }}
          >
            {field.label}:
          </span>
          <span
            style={{
              color: "#172B43",
              fontSize: "12px",
              fontWeight: 650,
              overflowWrap: "anywhere",
            }}
          >
            {String(selectedHotelProperty[field.name])}
          </span>
        </div>
      ))}

    {!["contactPerson", "contactPhone", "whatsappNumber", "email", "website"]
      .some((name) => {
        const value = selectedHotelProperty?.[name];
        return value !== undefined && value !== null && value !== "";
      }) && (
        <div style={{ color: "#64748B", fontSize: "11px" }}>
          No contact information available.
        </div>
      )}
  </div>

) : section.number === "04" ? (
  <details
    style={{
      width: "100%",
      border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
      borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#173B70"}`,
      borderRadius: "8px",
      background: "#FFFFFF",
      overflow: "hidden",
    }}
  >
    <summary
      style={{
        padding: "13px 15px",
        background: selectedCategoryTheme?.light || "#EEF3FA",
        color: selectedCategoryTheme?.primary || "#173B70",
        fontSize: "12px",
        fontWeight: 850,
        cursor: "pointer",
      }}
    >
      ACCOMMODATION CATEGORIES
      <span
        style={{
          marginLeft: "10px",
          padding: "3px 8px",
          borderRadius: "12px",
          background: "#FFFFFF",
          border: "1px solid #C7D6E9",
          fontSize: "10px",
        }}
      >
        {(selectedHotelProperty?.roomCategories || []).length} Units
      </span>
    </summary>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
    {(selectedHotelProperty?.roomCategories || []).map((room, index) => {
      const fieldLabels = {
        roomCategory: "Room Category",
        accommodationType: "Accommodation Type",
        villaType: "Villa Type",
        roomType: "Room Type",
        tentType: "Tent Type",
        lodgeUnitType: "Lodge Unit Type",
        dormitoryType: "Dormitory Type",
        apartmentType: "Apartment Type",
        unitName: "Unit Name",
        roomCount: "Room Count",
        numberOfRooms: "Number of Rooms",
        numberOfUnits: "Number of Units",
        roomNames: "Room / Unit Names",
        bedrooms: "Bedrooms",
        bedroomsPerVilla: "Bedrooms per Villa",
        bedroomsPerUnit: "Bedrooms per Unit",
        bedsPerDormitory: "Beds per Dormitory",
        bedsPerTent: "Beds per Tent",
        bedConfiguration: "Bed Configuration",
        customBedConfiguration: "Other Bed Configuration",
        maximumAdults: "Maximum Adults",
        maximumChildren: "Maximum Children",
        extraBedAvailable: "Extra Bed Availability",
        bathroomType: "Bathroom Type",
        privateBathroom: "Private Bathroom",
        kitchenType: "Kitchen Type",
        poolType: "Pool Type",
        poolAccess: "Pool Access",
        mealPlans: "Meal Plans",
        customMealPlan: "Custom Meal Plan",
        amenities: "Unit Amenities / Facilities",
        customAmenities: "Other Amenities",
        description: "Unit Description",
        roomDescription: "Room Description",
      };

      const customFieldMap = {
        roomCategory: "customRoomCategory",
        accommodationType: "customAccommodationType",
        villaType: "customVillaType",
        roomType: "customRoomType",
        tentType: "customTentType",
        lodgeUnitType: "customLodgeUnitType",
        dormitoryType: "customDormitoryType",
        apartmentType: "customApartmentType",
        bedConfiguration: "customBedConfiguration",
        mealPlans: "customMealPlan",
        amenities: "customAmenities",
        bathroomType: "customBathroomType",
        kitchenType: "customKitchenType",
      };

      const unitFields = Object.entries(fieldLabels)
        .map(([name, label]) => {
          let value = room[name];

          if (Array.isArray(value)) {
            value = value
              .filter((item) => item !== "Other" && item !== "Custom")
              .join(", ");
          }

          const customField = customFieldMap[name];
          const customValue = customField ? room[customField] : "";

          if (
            customValue &&
            (
              room[name] === "Other" ||
              room[name] === "Custom" ||
              (Array.isArray(room[name]) &&
                room[name].some((item) => ["Other", "Custom"].includes(item)))
            )
          ) {
            value = value ? `${value}, ${customValue}` : customValue;
          }

          if (
            value === undefined ||
            value === null ||
            value === ""
          ) {
            return null;
          }

          return {
            name,
            label,
            value: String(value),
          };
        })
        .filter(Boolean);

      const unitTitle =
        room.customRoomCategory ||
        room.customAccommodationType ||
        room.customVillaType ||
        room.customRoomType ||
        room.customTentType ||
        room.customLodgeUnitType ||
        room.customDormitoryType ||
        room.customApartmentType ||
        room.roomCategory ||
        room.accommodationType ||
        room.villaType ||
        room.roomType ||
        room.tentType ||
        room.lodgeUnitType ||
        room.dormitoryType ||
        room.apartmentType ||
        room.unitName ||
        `Accommodation Unit ${index + 1}`;

      return (
        <div
          key={room.id || index}
          style={{
            padding: "12px",
            border: `1px solid ${selectedCategoryTheme?.border || "#DCE5ED"}`,
            borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#173B70"}`,
            borderRadius: "8px",
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              marginBottom: "11px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "5px 9px",
                borderRadius: "5px",
                background: selectedCategoryTheme?.light || "#EEF3FA",
                color: selectedCategoryTheme?.primary || "#173B70",
                fontSize: "11px",
                fontWeight: 850,
              }}
            >
              UNIT {String(index + 1).padStart(2, "0")}
            </span>

            <strong
              style={{
                color: "#17324D",
                fontSize: "13px",
                fontWeight: 850,
              }}
            >
              {unitTitle}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "stretch",
              gap: "8px",
            }}
          >
            {unitFields
              .filter((field) =>
                !["description", "roomDescription"].includes(field.name)
              )
              .map((field) => (
                <div
                  key={field.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "6px",
                    width: "fit-content",
                    maxWidth: "100%",
                    padding: "9px 12px",
                    border: "1px solid #C7D6E9",
                    borderRadius: "8px",
                    background: "#FFFFFF",
                  }}
                >
                  <span
                    style={{
                      color: "#173B70",
                      fontSize: "12px",
                      fontWeight: 850,
                    }}
                  >
                    {field.label}:
                  </span>

                  <span
                    style={{
                      color: "#172B43",
                      fontSize: "12px",
                      fontWeight: 650,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {field.value}
                  </span>
                </div>
              ))}
          </div>

          {unitFields
            .filter((field) =>
              ["description", "roomDescription"].includes(field.name)
            )
            .map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  width: "100%",
                  marginTop: "9px",
                  padding: "10px 12px",
                  border: "1px solid #C7D6E9",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                }}
              >
                <span style={{ color: "#173B70", fontSize: "12px", fontWeight: 850 }}>
                  {field.label}:
                </span>
                <span style={{ color: "#172B43", fontSize: "12px", fontWeight: 650 }}>
                  {field.value}
                </span>
              </div>
            ))}

         {(
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              <span
                style={{
                  width: "100%",
                  color: "#173B70",
                  fontSize: "11px",
                  fontWeight: 850,
                }}
              >
                UNIT PHOTOS
              </span>



<label
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 12px",
    border: "1px solid #C7D6E9",
    borderRadius: "5px",
    background: "#EEF3FA",
    color: selectedCategoryTheme?.primary || "#173B70",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 800,
  }}
>
  + ADD PHOTOS

  <input
    type="file"
    accept="image/*"
    multiple
    style={{ display: "none" }}
    onChange={async (event) => {
      const selectedFiles = Array.from(
        event.target.files || []
      );

      if (selectedFiles.length > 0) {
        await handleAddSavedRoomPhotos(
          room.id,
          selectedFiles
        );
      }

      event.target.value = "";
    }}
  />
</label>



              
{(room.photos || []).map((photo, photoIndex) => (
  <div
    key={`${photo.driveFileId || photo.name || "unit-photo"}-${photoIndex}`}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "5px",
      width: "105px",
    }}
  >
    {(
      photo.previewUrl ||
      (photo.driveFileId && hotelPhotoPreviewUrls[photo.driveFileId])
    ) ? (
      <img
        src={
          photo.previewUrl ||
          hotelPhotoPreviewUrls[photo.driveFileId]
        }
        alt={photo.name || "Unit photo"}
        style={{
          width: "105px",
          height: "75px",
          objectFit: "cover",
          borderRadius: "6px",
          cursor: "zoom-in",
          border: "1px solid #DCE5ED",
        }}
        onClick={() => {
          const imageUrl =
            photo.previewUrl ||
            hotelPhotoPreviewUrls[photo.driveFileId];

          if (imageUrl) {
            window.open(imageUrl, "_blank");
          }
        }}
      />
    ) : (
      <span
        style={{
          padding: "7px 10px",
          border: "1px solid #C7D6E9",
          borderRadius: "7px",
          color: "#526579",
          fontSize: "11px",
        }}
      >
        {photo.name || "Saved photo"}
      </span>
    )}

    <button
      type="button"
      onClick={() =>
        handleDeleteSavedRoomPhoto(room.id, photoIndex)
      }
      style={{
        width: "100%",
        border: "none",
        background: "#FEF2F2",
        color: "#B91C1C",
        borderRadius: "5px",
        padding: "6px 4px",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: 750,
      }}
    >
      Delete Photo
    </button>
  </div>
))}

            </div>
          )}
        </div>
      );
    })}

    {(!selectedHotelProperty?.roomCategories ||
      selectedHotelProperty.roomCategories.length === 0) && (
      <div style={{ color: "#64748B", fontSize: "11px" }}>
        No accommodation units registered.
      </div>
    )}
 
      </div>
  </details>


) : section.number === "05" ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "stretch",
      gap: "8px",
      width: "100%",
    }}
  >
    {(() => {
      const categoryId = selectedHotelProperty?.categoryId;

      const facilityFieldNames = {
        HOTEL: ["conferenceFacilities"],
        RESORT: ["recreationalFacilities"],
        HOMESTAY: ["familyFacilities"],
        VILLA: ["privatePool"],
        SAFARI_CAMP: ["safariActivities"],
        SAFARI_LODGE: ["safariFacilities"],
        GUEST_HOUSE: ["mealArrangements"],
        SERVICED_APARTMENT: ["kitchenFacilities"],
      };

      const allowedFields = facilityFieldNames[categoryId] || [];

      const categoryFields =
        HOTEL_CATEGORY_FORM_CONFIG[categoryId]?.fields || [];

      const selectedCategoryFacilities = categoryFields.filter(
        (fieldConfig) => allowedFields.includes(fieldConfig.name)
      );

      const amenities = Array.isArray(selectedHotelProperty?.amenities)
        ? selectedHotelProperty.amenities.filter(Boolean)
        : [];

     const renderCapsule = (label, value, key) => (
  <div
    key={key}
    style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "6px",
      width: "fit-content",
      maxWidth: "100%",
      padding: "9px 12px",
      border: "1px solid #C7D6E9",
      borderRadius: "8px",
      background: "#FFFFFF",
    }}
  >
    <span
      style={{
        color: "#173B70",
        fontSize: "11px",
        fontWeight: 800,
      }}
    >
      {label}:
    </span>
    <span
      style={{
  color: "#1E293B",
  fontSize: "11px",
  fontWeight: 700,
  lineHeight: 1.5,
  overflowWrap: "anywhere",
}}
    >
      {value}
    </span>
  </div>
);

      return (
        <>
          {amenities.length > 0 &&
            renderCapsule(
              "Property Amenities",
              amenities.join(", "),
              "property-amenities",
              
            )}

          {selectedCategoryFacilities.map((fieldConfig) => {
            const fieldValue = selectedHotelProperty?.[fieldConfig.name];
            const customValue =
              selectedHotelProperty?.[`${fieldConfig.name}Custom`];

            let displayValue = "";

            if (Array.isArray(fieldValue)) {
              displayValue = fieldValue
                .filter((item) => item && item !== "Other")
                .join(", ");
            } else if (
              fieldValue !== undefined &&
              fieldValue !== null &&
              fieldValue !== "" &&
              fieldValue !== "Other"
            ) {
              displayValue = String(fieldValue);
            }

            if (
              fieldValue === "Other" &&
              customValue
            ) {
              displayValue = String(customValue);
            }

            if (!displayValue) return null;

            return renderCapsule(
              fieldConfig.label,
              displayValue,
              fieldConfig.name,
              
            );
          })}

          {amenities.length === 0 &&
            !selectedCategoryFacilities.some((fieldConfig) => {
              const value = selectedHotelProperty?.[fieldConfig.name];
              const customValue =
                selectedHotelProperty?.[`${fieldConfig.name}Custom`];

              return (
                (Array.isArray(value) && value.length > 0) ||
                (value !== undefined &&
                  value !== null &&
                  value !== "" &&
                  value !== "Other") ||
                (value === "Other" && Boolean(customValue))
              );
            }) && (
              <div
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                }}
              >
                No property amenities or category-specific facilities recorded.
              </div>
            )}
        </>
      );
    })()}
  </div>
) : section.number === "06" ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "stretch",
      gap: "8px",
      width: "100%",
    }}
  >
    {(() => {
      const operationalFields = [
        ["checkInTime", "Check-in"],
        ["checkOutTime", "Check-out"],
      ];

      const timeFields = operationalFields.filter(
        ([fieldName]) => selectedHotelProperty?.[fieldName]
      );

      const languages = Array.isArray(selectedHotelProperty?.languages)
        ? selectedHotelProperty.languages.filter(Boolean)
        : [];

      const renderCapsule = (label, value, key) => (
        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
            width: "fit-content",
            maxWidth: "100%",
            padding: "9px 12px",
            border: "1px solid #C7D6E9",
            borderRadius: "8px",
            background: "#FFFFFF",
          }}
        >
          <span
            style={{
              color: "#173B70",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            {label}:
          </span>

          <span
            style={{
              color: "#1E293B",
              fontSize: "11px",
              fontWeight: 700,
              lineHeight: 1.5,
              overflowWrap: "anywhere",
            }}
          >
            {value}
          </span>
        </div>
      );

      return (
        <>
          {timeFields.map(([fieldName, label]) =>
            renderCapsule(
              label,
              selectedHotelProperty[fieldName],
              fieldName
            )
          )}

          {languages.length > 0 &&
            renderCapsule(
              "Languages Spoken",
              languages.join(", "),
              "languages"
            )}

          {timeFields.length === 0 && languages.length === 0 && (
            <div style={{ color: "#64748B", fontSize: "11px" }}>
              No operational details recorded.
            </div>
          )}
        </>
      );
    })()}
  </div>

) : section.number === "07" ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      width: "100%",
    }}
  >


{hotelPropertySaveMessage && (
  <div
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 13px",
      borderRadius: "7px",
      background: "#ECFDF5",
      border: "1px solid #A7F3D0",
      color: "#047857",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    {hotelPropertySaveMessage}
  </div>
)}

{hotelPropertySaveError && (
  <div
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 13px",
      borderRadius: "7px",
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      color: "#B91C1C",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    {hotelPropertySaveError}
  </div>
)}


    {(() => {
      const photos = Array.isArray(selectedHotelProperty?.photos)
        ? selectedHotelProperty.photos.filter(Boolean)
        : [];

      return (
        <>


<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "125px",
    minHeight: "145px",
    padding: "10px",
    border: "1px dashed #8BA8C8",
    borderRadius: "8px",
    background: "#F4F8FC",
    color: selectedCategoryTheme?.primary || "#173B70",
  }}
>
  <icon name="plus-circle" size="24px" />


<button
  type="button"
  onClick={handleConnectGoogleDrive}
  style={{
    width: "100%",
    border: "1px solid #C7D6E9",
    background: "#FFFFFF",
    color: selectedCategoryTheme?.primary || "#173B70",
    borderRadius: "5px",
    padding: "6px 3px",
    cursor: "pointer",
    fontSize: "9px",
    fontWeight: 750,
  }}
>
  CONNECT DRIVE
</button>


  <span style={{ fontSize: "10px", fontWeight: 800 }}>
    ADD PHOTOS
  </span>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    onChange={async (e) => {
      const selectedFiles = Array.from(e.target.files || []);
      await handleAddSavedPropertyPhotos(selectedFiles);
      e.target.value = "";
    }}
    style={{
      width: "100%",
      fontSize: "9px",
      cursor: "pointer",
    }}
  />
</div>


          {photos.map((photo, index) => (
           <div
  key={`${photo.name || "property-photo"}-${index}`}
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    width: "125px",
    padding: "7px",
    border: "1px solid #C7D6E9",
    borderRadius: "8px",
    background: "#FFFFFF",
  }}
>
  {(photo.previewUrl ||
    (photo.driveFileId && hotelPhotoPreviewUrls[photo.driveFileId])) ? (
    <img
  src={
    photo.previewUrl ||
    hotelPhotoPreviewUrls[photo.driveFileId]
  }
  alt={photo.name || "Property photo"}
  onClick={() => {
    const imageUrl =
      photo.previewUrl ||
      hotelPhotoPreviewUrls[photo.driveFileId];

    if (imageUrl) {
      window.open(imageUrl, "_blank");
    }
  }}
  style={{
    width: "100%",
    height: "85px",
    objectFit: "cover",
    borderRadius: "5px",
    border: "1px solid #E2E8F0",
    cursor: "zoom-in",
  }}
/>
  ) : (
    <div
      style={{
        height: "85px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F1F5F9",
        borderRadius: "5px",
        color: "#64748B",
      }}
    >
      <icon name="image" size="22px" />
    </div>
  )}

  <span
    title={photo.name || `Property Photo ${index + 1}`}
    style={{
      color: "#1E293B",
      fontSize: "10px",
      fontWeight: 700,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
  >
    {photo.name || `Property Photo ${index + 1}`}
  </span>


<button
  type="button"
  onClick={() => handleDeleteSavedPropertyPhoto(index)}
  style={{
    width: "100%",
    border: "none",
    background: "#FEF2F2",
    color: "#B91C1C",
    borderRadius: "5px",
    padding: "6px 4px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 750,
  }}
>
  Delete Photo
</button>

</div>
          ))}

          {photos.length === 0 && (
            <div style={{ color: "#64748B", fontSize: "11px" }}>
              No property photos recorded.
            </div>
          )}
        </>
      );
    })()}
  </div>
) : section.number === "08" ? (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      width: "100%",
    }}
  >
    {(() => {
      const status = selectedHotelProperty?.status || "Active";
      const isActive = status === "Active";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            width: "fit-content",
            padding: "9px 12px",
            border: `1px solid ${isActive ? "#BBE5CC" : "#F5D6A5"}`,
            borderRadius: "8px",
            background: "#FFFFFF",
          }}
        >
          <span
            style={{
              color: "#173B70",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            Registration Status:
          </span>

          <span
            style={{
              color: isActive ? "#15803D" : "#B45309",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            {status}
          </span>
        </div>
      );
    })()}
  </div>
) : (
  <div style={{ color: "#526579", fontSize: "11px", lineHeight: 1.55 }}>
    {section.note}
  </div>
)}




  </div>
))}

  </div>
)}

{/* HOTEL PROPERTY REGISTRATION FORM */}

{hotelMasterPage === "registration" && selectedAccommodationCategory && (
  <div
    style={{
      marginTop: "20px",
      padding: "22px",
      background: "#FFFFFF",
      border: `1px solid ${selectedCategoryTheme?.border}`,
      borderTop: `5px solid ${selectedCategoryTheme?.primary}`,
      borderRadius: "12px",
      textAlign: "left",
    }}
  >
    
{/* FORM HEADER */}
<div
  style={{
    background: selectedCategoryTheme?.light,
    borderLeft: `5px solid ${selectedCategoryTheme?.primary}`,
    borderRadius: "8px",
    padding: "15px 18px",
    marginBottom: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    flexWrap: "wrap",
  }}
>
  <div>
    <h2
      style={{
        color: selectedCategoryTheme?.primary,
        fontSize: "20px",
        fontWeight: 850,
        margin: 0,
        textAlign: "left",
      }}
    >
      {isEditingHotelProperty
  ? `EDIT ${selectedAccommodationCategory.label.toUpperCase()}`
  : `REGISTER NEW ${selectedAccommodationCategory.label.toUpperCase()}`}
    </h2>

    <p
      style={{
        color: "#64748B",
        fontSize: "12px",
        margin: "5px 0 0",
      }}
    >
     {isEditingHotelProperty
  ? "Update Existing Property Details"
  : "New Property Registration"}
    </p>
  </div>

  <button
    type="button"
    onClick={() => {
      setSelectedAccommodationCategory(null);
      setHotelMasterPage("categories");
      setHotelFormData({});
      setSavedHotelProperty(null);
    }}
    style={{
      padding: "9px 15px",
      border: "none",
      borderRadius: "7px",
      background: selectedCategoryTheme?.primary || "#173B70",
      color: "#FFFFFF",
      fontSize: "12px",
      fontWeight: 750,
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.14)",
      whiteSpace: "nowrap",
    }}
  >
    ← Back to Categories
  </button>
</div>



{/* PROPERTY SCOPE — REQUIRED IN ALL HOTELS VIEW */}
{hotelMasterView === "all-hotels" && (
  <div
    style={{
      padding: "15px",
      marginBottom: "22px",
      background: selectedCategoryTheme?.light,
      border: `1px solid ${selectedCategoryTheme?.border}`,
      borderRadius: "8px",
    }}
  >
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        color: selectedCategoryTheme?.primary,
        fontSize: "13px",
        fontWeight: 800,
        maxWidth: "360px",
      }}
    >
      PROPERTY SCOPE
      <select
        value={hotelFormData.propertyScope || ""}
        onChange={(e) => {
          const scope = e.target.value;

          setHotelFormData((prev) => ({
            ...prev,
            propertyScope: scope,
            country: scope === "domestic" ? "India" : "",
            stateProvince: "",
            city: "",
          }));

          setHotelStates([]);
          setHotelCities([]);
          setLocationApiError("");
        }}
        style={{
          padding: "11px",
          border: `1px solid ${selectedCategoryTheme?.border}`,
          borderRadius: "7px",
          background: "#FFFFFF",
          fontSize: "13px",
        }}
      >
        <option value="">Select Property Scope</option>
        <option value="domestic">Domestic Property — India</option>
        <option value="international">International Property</option>
      </select>
    </label>
  </div>
)}



    
<div
  style={{
    marginTop: "20px",
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
  }}
>
{/* BASIC PROPERTY DETAILS */}
<div
  style={{
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      padding: "6px 42px 6px 10px",
      marginBottom: "14px",
      borderRadius: "6px",
      background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} calc(100% - 44px), ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      lineHeight: 1.3,
    }}
>
  01. BASIC PROPERTY DETAILS
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  }}
>
  {HOTEL_COMMON_FIELDS.identification.map((fieldConfig) => (
    <label
      key={fieldConfig.name}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        color: "#334155",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {fieldConfig.label}
      {fieldConfig.type === "textarea" ? (
        <textarea
          value={hotelFormData[fieldConfig.name] || ""}
          required={fieldConfig.required}
          placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
          onChange={(e) =>
            handleHotelFormChange(fieldConfig.name, e.target.value)
          }
          style={{
            padding: "11px",
            minHeight: "85px",
            border: `1px solid ${selectedCategoryTheme?.border}`,
            borderRadius: "7px",
            background: selectedCategoryTheme?.light,
            fontSize: "13px",
            resize: "vertical",
          }}
        />
      ) : fieldConfig.type === "select" ? (
        <>
          <select
            value={hotelFormData[fieldConfig.name] || ""}
            required={fieldConfig.required}
            onChange={(e) =>
              handleHotelFormChange(fieldConfig.name, e.target.value)
            }
            style={{
              padding: "11px",
              border: `1px solid ${selectedCategoryTheme?.border}`,
              borderRadius: "7px",
              background: selectedCategoryTheme?.light,
              fontSize: "13px",
            }}
          >
            <option value="">Select {fieldConfig.label}</option>

            {fieldConfig.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}

            {fieldConfig.allowCustom &&
              !fieldConfig.options.includes("Other") && (
                <option value="Other">Other / Enter Manually</option>
              )}
          </select>

          {fieldConfig.allowCustom &&
            hotelFormData[fieldConfig.name] === "Other" && (
              <input
                type="text"
                placeholder={`Enter custom ${fieldConfig.label.toLowerCase()}`}
                value={hotelFormData[`${fieldConfig.name}Custom`] || ""}
                onChange={(e) =>
                  handleHotelFormChange(
                    `${fieldConfig.name}Custom`,
                    e.target.value
                  )
                }
                style={{
                  padding: "11px",
                  border: `1px solid ${selectedCategoryTheme?.border}`,
                  borderRadius: "7px",
                  background: "#FFFFFF",
                  fontSize: "13px",
                }}
              />
            )}
        </>
      
) : fieldConfig.type === "multiselect" ? (
  <HotelMultiSelectDropdown
  values={hotelFormData[fieldConfig.name] || []}
  onChange={(value) =>
    handleHotelFormChange(fieldConfig.name, value)
  }
  theme={selectedCategoryTheme}
  placeholder={`Select ${fieldConfig.label.toLowerCase()}`}
  options={fieldConfig.options || []}
  allowCustom={fieldConfig.allowCustom || false}
/>
) : (
  <input
    type={fieldConfig.type === "number" ? "number" : "text"}

  min={fieldConfig.type === "number" ? "0" : undefined}
  value={hotelFormData[fieldConfig.name] || ""}
          required={fieldConfig.required}
          placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
          onChange={(e) =>
            handleHotelFormChange(fieldConfig.name, e.target.value)
          }
          style={{
            padding: "11px",
            border: `1px solid ${selectedCategoryTheme?.border}`,
            borderRadius: "7px",
            background: selectedCategoryTheme?.light,
            outlineColor: selectedCategoryTheme?.primary,
            fontSize: "13px",
          }}
        />
      )}
    </label>
  ))}
</div>




{/* CATEGORY CLASSIFICATION */}

{selectedCategoryFormConfig?.classification && (
  <div
    style={{
      marginTop: "20px",
      paddingTop: "16px",
      borderTop: `1px solid ${selectedCategoryTheme?.border}`,
      display: "grid",
      gridTemplateColumns: "minmax(0, 30%) minmax(0, 70%)",
      gap: "14px",
      alignItems: "start",
    }}
  >
    {/* LEFT COLUMN: CATEGORY CLASSIFICATION */}

    <div>
      <h4
        style={{
          margin: "0 0 14px",
          color: selectedCategoryTheme?.primary,
          fontSize: "13px",
          fontWeight: 800,
          letterSpacing: "0.5px",
        }}
      >
        CATEGORY CLASSIFICATION
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "14px",
        }}
      >
        {(() => {
          const fieldConfig = selectedCategoryFormConfig.classification;

          return (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {fieldConfig.label}

              {fieldConfig.type === "select" ? (
                <>
                  <select
                    value={hotelFormData[fieldConfig.name] || ""}
                    required={fieldConfig.required}
                    onChange={(e) =>
                      handleHotelFormChange(fieldConfig.name, e.target.value)
                    }
                    style={{
                      padding: "11px",
                      border: `1px solid ${selectedCategoryTheme?.border}`,
                      borderRadius: "7px",
                      background: selectedCategoryTheme?.light,
                      fontSize: "13px",
                    }}
                  >
                    <option value="">Select {fieldConfig.label}</option>

                    {(fieldConfig.options || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}

                    {fieldConfig.allowCustom &&
                      !fieldConfig.options?.includes("Other") && (
                        <option value="Other">Other / Enter Manually</option>
                      )}
                  </select>

                  {fieldConfig.allowCustom &&
                    hotelFormData[fieldConfig.name] === "Other" && (
                      <input
                        type="text"
                        placeholder={`Enter custom ${fieldConfig.label.toLowerCase()}`}
                        value={hotelFormData[`${fieldConfig.name}Custom`] || ""}
                        onChange={(e) =>
                          handleHotelFormChange(
                            `${fieldConfig.name}Custom`,
                            e.target.value
                          )
                        }
                        style={{
                          padding: "11px",
                          border: `1px solid ${selectedCategoryTheme?.border}`,
                          borderRadius: "7px",
                          background: "#FFFFFF",
                          fontSize: "13px",
                        }}
                      />
                    )}
                </>
              ) : (
                <input
                  type={fieldConfig.type === "number" ? "number" : "text"}
                  min={fieldConfig.type === "number" ? "0" : undefined}
                  value={hotelFormData[fieldConfig.name] || ""}
                  required={fieldConfig.required}
                  placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                  onChange={(e) =>
                    handleHotelFormChange(fieldConfig.name, e.target.value)
                  }
                  style={{
                    padding: "11px",
                    border: `1px solid ${selectedCategoryTheme?.border}`,
                    borderRadius: "7px",
                    background: selectedCategoryTheme?.light,
                    fontSize: "13px",
                  }}
                />
              )}
            </label>
          );
        })()}
      </div>
    </div>

    {/* RIGHT COLUMN: CATEGORY-SPECIFIC PROPERTY DETAILS */}

    <div>
      {selectedCategoryFormConfig?.fields?.length > 0 && (
        <div>
          <h4
            style={{
              margin: "0 0 14px",
              color: selectedCategoryTheme?.primary,
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.5px",
            }}
          >
            {selectedAccommodationCategory?.label?.toUpperCase()} SPECIFIC DETAILS
          </h4>

          <div
  style={{
    display: "grid",
   gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  }}
>
            {selectedCategoryFormConfig.fields.map((fieldConfig) => (
              <label
                key={fieldConfig.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {fieldConfig.label}

                {fieldConfig.type === "select" ? (
                  <>
                    <select
                      value={hotelFormData[fieldConfig.name] || ""}
                      required={fieldConfig.required}
                      onChange={(e) =>
                        handleHotelFormChange(fieldConfig.name, e.target.value)
                      }
                      style={{
                        padding: "11px",
                        border: `1px solid ${selectedCategoryTheme?.border}`,
                        borderRadius: "7px",
                        background: selectedCategoryTheme?.light,
                        fontSize: "13px",
                      }}
                    >
                      <option value="">Select {fieldConfig.label}</option>

                      {(fieldConfig.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}

                      {fieldConfig.allowCustom &&
                        !fieldConfig.options?.includes("Other") && (
                          <option value="Other">Other / Enter Manually</option>
                        )}
                    </select>

                    {fieldConfig.allowCustom &&
                      hotelFormData[fieldConfig.name] === "Other" && (
                        <input
                          type="text"
                          placeholder={`Enter custom ${fieldConfig.label.toLowerCase()}`}
                          value={hotelFormData[`${fieldConfig.name}Custom`] || ""}
                          onChange={(e) =>
                            handleHotelFormChange(
                              `${fieldConfig.name}Custom`,
                              e.target.value
                            )
                          }
                          style={{
                            padding: "11px",
                            border: `1px solid ${selectedCategoryTheme?.border}`,
                            borderRadius: "7px",
                            background: "#FFFFFF",
                            fontSize: "13px",
                          }}
                        />
                      )}
                  </>
                ) : fieldConfig.type === "multiselect" ? (
                  <HotelMultiSelectDropdown
                    values={hotelFormData[fieldConfig.name] || []}
                    onChange={(value) =>
                      handleHotelFormChange(fieldConfig.name, value)
                    }
                    theme={selectedCategoryTheme}
                    placeholder={`Select ${fieldConfig.label.toLowerCase()}`}
                    options={fieldConfig.options || []}
                    allowCustom={fieldConfig.allowCustom || false}
                  />
                ) : (
                  <input
                    type={fieldConfig.type === "number" ? "number" : "text"}
                    min={fieldConfig.type === "number" ? "0" : undefined}
                    value={hotelFormData[fieldConfig.name] || ""}
                    required={fieldConfig.required}
                    placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                    onChange={(e) =>
                      handleHotelFormChange(fieldConfig.name, e.target.value)
                    }
                    style={{
                      padding: "11px",
                      border: `1px solid ${selectedCategoryTheme?.border}`,
                      borderRadius: "7px",
                      background: selectedCategoryTheme?.light,
                      fontSize: "13px",
                    }}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}


</div>


<div
  style={{
    marginTop: "20px",
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
  }}
>
{/* LOCATION DETAILS */}
<div
  style={{
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      padding: "6px 42px 6px 10px",
      marginBottom: "14px",
      borderRadius: "6px",
      background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} calc(100% - 44px), ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      lineHeight: 1.3,
    }}
>
  02. LOCATION DETAILS
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  }}
>
  {/* COUNTRY */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  <span>Country</span>

  {hotelFormData.propertyScope === "domestic" ? (
    <input
      type="text"
      value="India"
      readOnly
      style={{
        padding: "11px",
        border: `1px solid ${selectedCategoryTheme?.border}`,
        borderRadius: "7px",
        background: "#E8EEF5",
        color: "#173B70",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "not-allowed",
      }}
    />
  ) : (
    <HotelSearchDropdown
      value={hotelFormData.country || ""}
      options={hotelCountries.map((country) => country.name)}
      placeholder={
        hotelFormData.propertyScope === "international"
          ? "Select or enter country"
          : "Select property scope first"
      }
      disabled={!hotelFormData.propertyScope}
      loading={countriesLoading}
      theme={selectedCategoryTheme}
      onChange={(country) => {
        setHotelFormData((prev) => ({
  ...prev,
  country,
  stateProvince: "",
  city: "",
  area: "",
  postalCode: "",
  fullAddress: "",
  googleMapsLocation: "",
}));

        setHotelStates([]);
        setHotelCities([]);
        setLocationApiError("");
      }}
    />
  )}
</div>



  {/* STATE / PROVINCE */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  <span>State / Province</span>

  <HotelSearchDropdown
    value={hotelFormData.stateProvince || ""}
    options={hotelStates}
    placeholder={
      !hotelFormData.country
        ? "Select country first"
        : "Select or enter state"
    }
    disabled={!hotelFormData.country}
    loading={statesLoading}
    theme={selectedCategoryTheme}
    onChange={(stateProvince) => {
      setHotelFormData((prev) => ({
  ...prev,
  stateProvince,
  city: "",
  area: "",
  postalCode: "",
  fullAddress: "",
  googleMapsLocation: "",
}));

      setHotelCities([]);
      setLocationApiError("");
    }}
  />

  <small
    style={{
      color: "#64748B",
      fontSize: "11px",
      fontWeight: 500,
    }}
  >
    {statesLoading
      ? "Loading available states / provinces..."
      : hotelFormData.country && hotelStates.length > 0
        ? `${hotelStates.length} suggestions available. You can also enter manually.`
        : hotelFormData.country
          ? "No suggestions available. Enter the state / province manually."
          : "Select a country first."}
  </small>
</div>




 {/* CITY */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  <span>City</span>

  <HotelSearchDropdown
    value={hotelFormData.city || ""}
    options={hotelCities}
    placeholder={
      !hotelFormData.stateProvince
        ? "Select state first"
        : "Select or enter city"
    }
    disabled={!hotelFormData.stateProvince}
    loading={citiesLoading}
    theme={selectedCategoryTheme}
    onChange={(city) => {
  setHotelFormData((prev) => ({
    ...prev,
    city,
    area: "",
    postalCode: "",
    fullAddress: "",
    googleMapsLocation: "",
  }));

  setLocationApiError("");
}}
  />

  <small
    style={{
      color: "#64748B",
      fontSize: "11px",
      fontWeight: 500,
    }}
  >
    {citiesLoading
      ? "Loading available cities..."
      : hotelFormData.stateProvince && hotelCities.length > 0
        ? `${hotelCities.length} suggestions available. You can also enter manually.`
        : hotelFormData.stateProvince
          ? "No suggestions available. Enter the city manually."
          : "Select a state / province first."}
  </small>
</div>




  {/* AREA / LOCALITY */}
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    Area / Locality
    <input
      value={hotelFormData.area || ""}
      placeholder="Enter locality"
      onChange={(e) =>
        handleHotelFormChange("area", e.target.value)
      }
      style={{
        padding: "11px",
        border: `1px solid ${selectedCategoryTheme?.border}`,
        borderRadius: "7px",
        background: selectedCategoryTheme?.light,
        fontSize: "13px",
      }}
    />
  </label>

  {/* POSTAL CODE */}
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    Postal Code
    <input
      value={hotelFormData.postalCode || ""}
      placeholder="Enter postal code"
      onChange={(e) =>
        handleHotelFormChange("postalCode", e.target.value)
      }
      style={{
        padding: "11px",
        border: `1px solid ${selectedCategoryTheme?.border}`,
        borderRadius: "7px",
        background: selectedCategoryTheme?.light,
        fontSize: "13px",
      }}
    />
  </label>


  {/* FULL ADDRESS */}
<label
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  Full Address

  <textarea
    value={hotelFormData.fullAddress || ""}
    placeholder="Enter complete property address"
    onChange={(e) =>
      handleHotelFormChange("fullAddress", e.target.value)
    }
    rows={3}
    style={{
      padding: "11px",
      minHeight: "85px",
      border: `1px solid ${selectedCategoryTheme?.border}`,
      borderRadius: "7px",
      background: selectedCategoryTheme?.light,
      outlineColor: selectedCategoryTheme?.primary,
      fontSize: "13px",
      resize: "vertical",
    }}
  />
</label>

{/* GOOGLE MAPS LOCATION */}
<label
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  Google Maps Location

  <input
    type="url"
    value={hotelFormData.googleMapsLocation || ""}
    placeholder="Paste Google Maps link"
    onChange={(e) =>
      handleHotelFormChange("googleMapsLocation", e.target.value)
    }
    style={{
      padding: "11px",
      border: `1px solid ${selectedCategoryTheme?.border}`,
      borderRadius: "7px",
      background: selectedCategoryTheme?.light,
      outlineColor: selectedCategoryTheme?.primary,
      fontSize: "13px",
    }}
  />
</label>


</div>

{locationApiError && (
  <div
    style={{
      marginTop: "10px",
      padding: "9px 12px",
      borderRadius: "7px",
      background: "#FFF7ED",
      color: "#9A3412",
      fontSize: "12px",
    }}
  >
    {locationApiError} Manual entry is available.
  </div>
)}




   

</div>
<div
  style={{
    marginTop: "20px",
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
  }}
>
{/* CONTACT DETAILS */}
<div
  style={{
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      padding: "6px 42px 6px 10px",
      marginBottom: "14px",
      borderRadius: "6px",
      background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} calc(100% - 44px), ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      lineHeight: 1.3,
    }}
>
  03. CONTACT DETAILS
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  }}
>
  {[
    {
      name: "contactPerson",
      label: "Reservation Contact Person",
      placeholder: "Enter contact person",
      type: "text",
    },
    {
      name: "contactPhone",
      label: "Phone Number",
      placeholder: "Enter phone number",
      type: "tel",
    },
    {
      name: "whatsappNumber",
      label: "WhatsApp Number",
      placeholder: "Enter WhatsApp number",
      type: "tel",
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "Enter email address",
      type: "email",
    },
    {
      name: "website",
      label: "Website",
      placeholder: "Enter website URL",
      type: "url",
    },
  ].map((field) => (
    <label
      key={field.name}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        color: "#334155",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {field.label}

      <input
        type={field.type}
        value={hotelFormData[field.name] || ""}
        placeholder={field.placeholder}
        onChange={(e) =>
          handleHotelFormChange(field.name, e.target.value)
        }
        style={{
          padding: "11px",
          border: `1px solid ${selectedCategoryTheme?.border}`,
          borderRadius: "7px",
          background: selectedCategoryTheme?.light,
          outlineColor: selectedCategoryTheme?.primary,
          fontSize: "13px",
        }}
      />
    </label>
  ))}
</div>



    

</div>
<div
  style={{
    marginTop: "20px",
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
  }}
>
{/* CATEGORY-SPECIFIC ACCOMMODATION UNITS */}
<div
  style={{
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      padding: "6px 42px 6px 10px",
      marginBottom: "14px",
      borderRadius: "6px",
      background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} calc(100% - 44px), ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      lineHeight: 1.3,
    }}
>
  
{selectedAccommodationCategory?.id === "RESORT"
  ? "04. RESORT ACCOMMODATION CATEGORIES"
  : selectedAccommodationCategory?.id === "VILLA"
  ? "04. VILLA ACCOMMODATION CATEGORIES"
  : selectedAccommodationCategory?.id === "HOMESTAY"
  ? "04. HOMESTAY ROOM CATEGORIES"
  : selectedAccommodationCategory?.id === "SAFARI_CAMP"
  ? "04. TENT / CAMP ACCOMMODATION CATEGORIES"
  : selectedAccommodationCategory?.id === "SAFARI_LODGE"
  ? "04. LODGE ACCOMMODATION CATEGORIES"
  : selectedAccommodationCategory?.id === "GUEST_HOUSE"
  ? "04. GUEST HOUSE ROOM CATEGORIES"
  : selectedAccommodationCategory?.id === "SERVICED_APARTMENT"
  ? "04. APARTMENT CATEGORIES"
  : selectedAccommodationCategory?.id === "BOUTIQUE_STAY"
  ? "04. BOUTIQUE ACCOMMODATION CATEGORIES"
  : selectedAccommodationCategory?.id === "HOSTEL"
  ? "04. DORMITORY / PRIVATE ROOM CATEGORIES"
  : selectedAccommodationCategory?.id === "OTHER"
  ? "04. ACCOMMODATION CATEGORIES"
  : "04. ROOM CATEGORIES"}

</div>




{selectedAccommodationCategory?.id === "RESORT" ? (
  <ResortAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
           MultiSelectDropdown={HotelMultiSelectDropdown}
  />
) : selectedAccommodationCategory?.id === "VILLA" ? (
  <VillaAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
    MultiSelectDropdown={HotelMultiSelectDropdown}
 
  />
) : selectedAccommodationCategory?.id === "SAFARI_CAMP" ? (
  <SafariCampAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
    MultiSelectDropdown={HotelMultiSelectDropdown}
  
  />
) : selectedAccommodationCategory?.id === "SAFARI_LODGE" ? (
  <SafariLodgeAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
    MultiSelectDropdown={HotelMultiSelectDropdown}
  
  />
) : selectedAccommodationCategory?.id === "GUEST_HOUSE" ? (
  <GuestHouseAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
    MultiSelectDropdown={HotelMultiSelectDropdown}
  
  />
) : selectedAccommodationCategory?.id === "SERVICED_APARTMENT" ? (
  <ServicedApartmentAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
    MultiSelectDropdown={HotelMultiSelectDropdown}
  
  />
) : selectedAccommodationCategory?.id === "BOUTIQUE_STAY" ? (
  <BoutiqueStayAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
    MultiSelectDropdown={HotelMultiSelectDropdown}
  />
) : selectedAccommodationCategory?.id === "HOSTEL" ? (
  <HostelAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
    MultiSelectDropdown={HotelMultiSelectDropdown}
  />
) : selectedAccommodationCategory?.id === "HOMESTAY" ? (





  <HomestayAccommodationForm
    roomCategories={hotelRoomCategories}
    onAdd={handleAddRoomCategory}
    onChange={handleRoomCategoryChange}
    onRemove={handleRemoveRoomCategory}
    expandedId={expandedHotelRoomCategoryId}
    onExpandedChange={setExpandedHotelRoomCategoryId}
    theme={selectedCategoryTheme}
    SearchDropdown={HotelSearchDropdown}
    MultiSelectDropdown={HotelMultiSelectDropdown}
  />
) : selectedAccommodationCategory?.id === "OTHER" ? (
  <OtherAccommodationForm
    value={hotelFormData.otherAccommodation || {}}
    onChange={(next) =>
      setHotelFormData((prev) => ({
        ...prev,
        otherAccommodation: next,
      }))
    }
    theme={selectedCategoryTheme}
  />
) : (

    
<div
  style={{
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderRadius: "9px",
  }}
>
  {hotelRoomCategories.length === 0 ? (
    <div
      style={{
        padding: "18px",
        textAlign: "center",
        color: "#64748B",
        fontSize: "12px",
      }}
    >
      No room categories added yet. Click below to add the first room category.
    </div>
  ) : (
    
hotelRoomCategories.map((room, index) => {
  const isExpanded = expandedHotelRoomCategoryId === room.id;

  return (
    <div
      key={room.id}
      style={{
        marginBottom: "9px",
        background: "#FFFFFF",
        border: `1px solid ${selectedCategoryTheme?.border}`,
        borderLeft: `4px solid ${selectedCategoryTheme?.primary}`,
        borderRadius: "8px",
        
      }}
    >
      {/* COMPACT ROOM HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "11px 13px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
            minWidth: "180px",
          }}
        >
          <div
            style={{
              width: "29px",
              height: "29px",
              borderRadius: "7px",
              background: selectedCategoryTheme?.light,
              color: selectedCategoryTheme?.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: "#17324D",
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              {room.roomCategory === "Other"
                ? room.customRoomCategory || "Custom Room Category"
                : room.roomCategory || "New Room Category"}
            </div>

            <div
  style={{
    display: "inline-flex",
    alignItems: "center",
    marginTop: "5px",
    padding: "3px 9px",
    borderRadius: "5px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    color: selectedCategoryTheme?.primary,
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.2px",
  }}
>
  <icon name="bed-double" size="xs" />
  <span style={{ marginLeft: "5px" }}>
    {room.numberOfRooms
      ? `${room.numberOfRooms} ROOMS`
      : "ROOM COUNT PENDING"}
  </span>
</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setExpandedHotelRoomCategoryId(
                isExpanded ? null : room.id
              )
            }
            style={{
              padding: "7px 11px",
              border: `1px solid ${selectedCategoryTheme?.border}`,
              borderRadius: "6px",
              background: selectedCategoryTheme?.light,
              color: selectedCategoryTheme?.primary,
              fontSize: "11px",
              fontWeight: 750,
              cursor: "pointer",
            }}
          >
            {isExpanded ? "Collapse" : "Edit"}
            {" "}
            {isExpanded ? "▲" : "▼"}
          </button>

          <button
            type="button"
            onClick={() => {
              handleRemoveRoomCategory(room.id);

              if (isExpanded) {
                setExpandedHotelRoomCategoryId(null);
              }
            }}
            style={{
              padding: "7px 10px",
              border: "1px solid #FECACA",
              borderRadius: "6px",
              background: "#FEF2F2",
              color: "#B91C1C",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* EXPANDABLE ROOM DETAILS */}
      {isExpanded && (
        <div
          style={{
            padding: "14px",
            borderTop: "1px solid #E8EEF5",
            background: "#FAFCFF",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "13px",
            }}
          >

            
            {/* ROOM CATEGORY */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <span>Room Category</span>

              <HotelSearchDropdown
                value={room.roomCategory}
                options={[
                  "Standard Room",
                  "Deluxe Room",
                  "Super Deluxe Room",
                  "Premium Room",
                  "Executive Room",
                  "Family Room",
                  "Junior Suite",
                  "Suite",
                  "Executive Suite",
                  "Presidential Suite",
                  "Dormitory",
                  "Other",
                ]}
                placeholder="Select or enter room category"
                theme={selectedCategoryTheme}
                onChange={(value) =>
                  handleRoomCategoryChange(
                    room.id,
                    "roomCategory",
                    value
                  )
                }
              />
            </div>

            {/* CUSTOM ROOM CATEGORY */}
            {room.roomCategory === "Other" && (
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                Custom Room Category

                <input
                  value={room.customRoomCategory}
                  placeholder="Enter room category"
                  onChange={(e) =>
                    handleRoomCategoryChange(
                      room.id,
                      "customRoomCategory",
                      e.target.value
                    )
                  }
                  style={{
                    padding: "11px",
                    border: `1px solid ${selectedCategoryTheme?.border}`,
                    borderRadius: "7px",
                    background: selectedCategoryTheme?.light,
                    fontSize: "13px",
                  }}
                />
              </label>
            )}

            {/* NUMBER OF ROOMS */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Number of Rooms

              <input
                type="number"
                min="0"
                value={room.numberOfRooms}
                placeholder="Enter number of rooms"
                onChange={(e) =>
                  handleRoomCategoryChange(
                    room.id,
                    "numberOfRooms",
                    e.target.value
                  )
                }
                style={{
  height: "42px",
  minHeight: "42px",
  boxSizing: "border-box",
  padding: "0 11px",
  border: `1px solid ${selectedCategoryTheme?.border}`,
  borderRadius: "7px",
  background: selectedCategoryTheme?.light,
  fontSize: "13px",
}}
              />
            </label>



            {/* BED CONFIGURATION */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  <span>Bed Configuration</span>

  <HotelMultiSelectDropdown
    values={room.bedConfiguration || []}
    options={[
      "Single Bed",
      "Twin Beds",
      "Double Bed",
      "Queen Bed",
      "King Bed",
      "Hollywood Twin",
      "Triple Bed",
      "Bunk Bed",
      "Sofa Bed",
      "Extra Bed",
      "Other",
    ]}
    placeholder="Select bed configuration"
    theme={selectedCategoryTheme}
    onChange={(values) =>
      handleRoomCategoryChange(
        room.id,
        "bedConfiguration",
        values
      )
    }
  />
</div>

{(room.bedConfiguration || []).includes("Other") && (
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    Other Bed Configuration

    <input
      type="text"
      value={room.customBedConfiguration || ""}
      placeholder="Enter bed configuration"
      onChange={(e) =>
        handleRoomCategoryChange(
          room.id,
          "customBedConfiguration",
          e.target.value
        )
      }
      style={{
        height: "42px",
        boxSizing: "border-box",
        padding: "0 11px",
        border: `1px solid ${selectedCategoryTheme?.border}`,
        borderRadius: "7px",
        background: selectedCategoryTheme?.light,
        fontSize: "13px",
      }}
    />
  </label>
)}



{/* MAXIMUM ADULTS */}
<label
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  Maximum Adults
  <input
    type="number"
    min="1"
    value={room.maximumAdults}
    placeholder="Enter maximum adults"
    onChange={(e) =>
      handleRoomCategoryChange(
        room.id,
        "maximumAdults",
        e.target.value
      )
    }
    style={{
  height: "42px",
  minHeight: "42px",
  boxSizing: "border-box",
  padding: "0 11px",
  border: `1px solid ${selectedCategoryTheme?.border}`,
  borderRadius: "7px",
  background: selectedCategoryTheme?.light,
  fontSize: "13px",
}}
  />
</label>

{/* MAXIMUM CHILDREN */}
<label
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  Maximum Children
  <input
    type="number"
    min="0"
    value={room.maximumChildren}
    placeholder="Enter maximum children"
    onChange={(e) =>
      handleRoomCategoryChange(
        room.id,
        "maximumChildren",
        e.target.value
      )
    }
    style={{
  height: "42px",
  minHeight: "42px",
  boxSizing: "border-box",
  padding: "0 11px",
  border: `1px solid ${selectedCategoryTheme?.border}`,
  borderRadius: "7px",
  background: selectedCategoryTheme?.light,
  fontSize: "13px",
}}
  />
</label>

{/* EXTRA BED AVAILABILITY */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  <span>Extra Bed Availability</span>
  <HotelSearchDropdown
    value={room.extraBedAvailable}
    options={["Available", "Not Available", "On Request"]}
    placeholder="Select availability"
    theme={selectedCategoryTheme}
    onChange={(value) =>
      handleRoomCategoryChange(
        room.id,
        "extraBedAvailable",
        value
      )
    }
  />
</div>



{/* MEAL PLAN */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  <span>Meal Plan</span>

  <HotelMultiSelectDropdown
    values={room.mealPlans || []}
    options={[
      "EP - Room Only",
      "CP - Breakfast",
      "MAP - Breakfast + Lunch or Dinner",
      "AP - Breakfast + Lunch + Dinner",
      "Custom",
    ]}
    placeholder="Select meal plans"
    theme={selectedCategoryTheme}
    onChange={(values) =>
      handleRoomCategoryChange(
        room.id,
        "mealPlans",
        values
      )
    }
  />
</div>

{/* CUSTOM MEAL PLAN */}
{room.mealPlans?.includes("Custom") && (
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    Custom Meal Plan Description

    <input
      type="text"
      value={room.customMealPlan || ""}
      placeholder="Describe the custom meal arrangement"
      onChange={(e) =>
        handleRoomCategoryChange(
          room.id,
          "customMealPlan",
          e.target.value
        )
      }
      style={{
        height: "42px",
        minHeight: "42px",
        boxSizing: "border-box",
        padding: "0 11px",
        border: `1px solid ${selectedCategoryTheme?.border}`,
        borderRadius: "7px",
        background: selectedCategoryTheme?.light,
        fontSize: "13px",
      }}
    />
  </label>
)}




{/* ROOM AMENITIES */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  <span>Room Amenities / Facilities</span>

  <HotelMultiSelectDropdown
    values={room.amenities || []}
    options={[
      "Air Conditioning",
      "Free Wi-Fi",
      "Television",
      "Mini Bar",
      "Tea / Coffee Maker",
      "Balcony",
      "Bathtub",
      "Shower",
      "Hair Dryer",
      "Wardrobe",
      "Work Desk",
      "Safe / Locker",
      "Telephone",
      "Refrigerator",
      "Room Service",
      "Other",
    ]}
    placeholder="Select room amenities"
    theme={selectedCategoryTheme}
    onChange={(values) =>
      handleRoomCategoryChange(
        room.id,
        "amenities",
        values
      )
    }
  />
</div>

{/* CUSTOM ROOM AMENITIES */}
{room.amenities?.includes("Other") && (
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    Other Room Amenities

    <input
      type="text"
      value={room.customAmenities || ""}
      placeholder="Enter additional room amenities"
      onChange={(e) =>
        handleRoomCategoryChange(
          room.id,
          "customAmenities",
          e.target.value
        )
      }
      style={{
        height: "42px",
        minHeight: "42px",
        boxSizing: "border-box",
        padding: "0 11px",
        border: `1px solid ${selectedCategoryTheme?.border}`,
        borderRadius: "7px",
        background: selectedCategoryTheme?.light,
        fontSize: "13px",
      }}
    />
  </label>
)}





{/* ROOM PHOTOS */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
    gridColumn: "1 / -1",
  }}
>
  <span>Room Photos (Optional)</span>

  <label
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
      padding: "15px",
      border: `1px dashed ${selectedCategoryTheme?.primary}`,
      borderRadius: "8px",
      background: selectedCategoryTheme?.light,
      color: selectedCategoryTheme?.primary,
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 750,
    }}
  >
    + SELECT ROOM PHOTOS

    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      hidden
      onChange={(e) => {
        const selectedFiles = Array.from(e.target.files || []);

        const photosWithPreview = selectedFiles.map((file) =>
          Object.assign(file, {
            previewUrl: URL.createObjectURL(file),
          })
        );

        handleRoomCategoryChange(
          room.id,
          "photos",
          [
            ...(room.photos || []),
            ...photosWithPreview,
          ]
        );

        e.target.value = "";
      }}
    />
  </label>

  {room.photos?.length > 0 && (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))",
        gap: "10px",
        padding: "12px",
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "7px",
      }}
    >
      {room.photos.map((photo, photoIndex) => (
       <div
  key={`${photo.name}-${photoIndex}`}
  style={{
    minWidth: 0,
    border: "1px solid #E2E8F0",
    borderRadius: "7px",
    overflow: "hidden",
    background: "#F8FAFC",
  }}
>
  <img
    src={
      photo.previewUrl ||
      (photo.driveFileId && hotelPhotoPreviewUrls[photo.driveFileId]) ||
      ""
    }
    alt={photo.name || "Unit photo"}
    style={{
      display: "block",
      width: "100%",
      height: "105px",
      objectFit: "cover",
      background: "#E2E8F0",
    }}
  />

  <div style={{ padding: "7px" }}>
    <div
      style={{
        fontSize: "10px",
        color: "#334155",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        marginBottom: "7px",
      }}
      title={photo.name}
    >
      {photo.name}
    </div>

    <div style={{ display: "flex", gap: "5px" }}>
      <button
        type="button"
        onClick={() => {
          const imageUrl =
            photo.previewUrl ||
            hotelPhotoPreviewUrls[photo.driveFileId];

          if (imageUrl) {
            window.open(imageUrl, "_blank");
          }
        }}
        style={{
          flex: 1,
          border: "none",
          background: selectedCategoryTheme?.light,
          color: selectedCategoryTheme?.primary,
          borderRadius: "4px",
          padding: "6px 4px",
          cursor: "pointer",
          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        View
      </button>

      <button
        type="button"
        onClick={() =>
  handleRemoveRoomPhoto(room.id, photoIndex)
}
        style={{
          flex: 1,
          border: "none",
          background: "#FEF2F2",
          color: "#B91C1C",
          borderRadius: "4px",
          padding: "6px 4px",
          cursor: "pointer",
          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        Remove
      </button>
    </div>
  </div>
</div>

      ))}
    </div>
  )}

  <small
    style={{
      color: "#64748B",
      fontSize: "11px",
      fontWeight: 500,
    }}
  >
    Select multiple JPG, PNG or WebP photos. Click a thumbnail's View option to open the full image.
  </small>
</div>





{/* ROOM DESCRIPTION */}
<label
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
    gridColumn: "1 / -1",
  }}
>
  Room Description
  <textarea
    value={room.roomDescription}
    placeholder="Describe the room, its features and special arrangements"
    rows={3}
    onChange={(e) =>
      handleRoomCategoryChange(
        room.id,
        "roomDescription",
        e.target.value
      )
    }
    style={{
      padding: "11px",
      border: `1px solid ${selectedCategoryTheme?.border}`,
      borderRadius: "7px",
      background: selectedCategoryTheme?.light,
      fontSize: "13px",
      resize: "vertical",
    }}
  />
</label>


          </div>
        </div>
      )}
    </div>
  );
})
)}



  <button
    type="button"
    onClick={handleAddRoomCategory}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      width: "100%",
      padding: "12px",
      border: `1px dashed ${selectedCategoryTheme?.primary}`,
      borderRadius: "7px",
      background: "#FFFFFF",
      color: selectedCategoryTheme?.primary,
      fontSize: "12px",
      fontWeight: 800,
      cursor: "pointer",
    }}
  >
    + ADD ANOTHER ROOM CATEGORY
  </button>
</div>

)}

</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 1fr)",
    gap: "14px",
    alignItems: "stretch",
    marginTop: "20px",
  }}
>




{/* PROPERTY AMENITIES */}
<div
  style={{
    marginTop: "20px",
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
  }}
>
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      padding: "6px 42px 6px 10px",
      marginBottom: "14px",
      borderRadius: "6px",
      background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} calc(100% - 44px), ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      lineHeight: 1.3,
    }}
  >
    05. PROPERTY AMENITIES & FACILITIES
  </div>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    <span>Property Amenities</span>

    <HotelMultiSelectDropdown
  values={hotelFormData.amenities || []}
  onChange={(value) =>
    handleHotelFormChange("amenities", value)
  }
  theme={selectedCategoryTheme}
  placeholder="Select property amenities"
  allowCustom={false}
  customTriggerOption="Other"
  options={getPropertyAmenityOptions(selectedAccommodationCategory?.id)}
/>
  </div>
</div>




{/* PROPERTY OPERATIONAL DETAILS */}
<div
  style={{
    marginTop: "20px",
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
  }}
>
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      padding: "6px 42px 6px 10px",
      marginBottom: "14px",
      borderRadius: "6px",
      background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} calc(100% - 44px), ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      lineHeight: 1.3,
    }}
  >
    06. PROPERTY OPERATIONAL DETAILS
  </div>

  
<div
  style={{
    display: "flex",
    flexDirection: "row",
flexWrap: "wrap",
gap: "10px",
  }}
>
  {/* CHECK-IN */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      flex: "1 1 180px",
minWidth: "180px",
      padding: "8px 10px",
      background: "#FFFFFF",
      border: "1px solid #CBD5E1",
      borderRadius: "7px",
    }}
  >
    <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
      Check-in
    </span>

    <input
      type="time"
      value={hotelFormData.checkInTime || ""}
      onChange={(e) =>
        handleHotelFormChange("checkInTime", e.target.value)
      }
      style={{
        width: "135px",
        height: "34px",
        boxSizing: "border-box",
        padding: "0 7px",
        border: "1px solid #E2E8F0",
        borderRadius: "5px",
        background: "#F8FAFC",
        color: "#173B70",
        fontSize: "12px",
      }}
    />
  </div>

  {/* CHECK-OUT */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      flex: "1 1 180px",
minWidth: "180px",
      padding: "8px 10px",
      background: "#FFFFFF",
      border: "1px solid #CBD5E1",
      borderRadius: "7px",
    }}
  >
    <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
      Check-out
    </span>

    <input
      type="time"
      value={hotelFormData.checkOutTime || ""}
      onChange={(e) =>
        handleHotelFormChange("checkOutTime", e.target.value)
      }
      style={{
        width: "135px",
        height: "34px",
        boxSizing: "border-box",
        padding: "0 7px",
        border: "1px solid #E2E8F0",
        borderRadius: "5px",
        background: "#F8FAFC",
        color: "#173B70",
        fontSize: "12px",
      }}
    />
  </div>
</div>



{/* LANGUAGES SPOKEN */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginTop: "12px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700,
  }}
>
  <span>Languages Spoken</span>

  <HotelMultiSelectDropdown
    values={hotelFormData.languages || []}
    onChange={(value) =>
      handleHotelFormChange("languages", value)
    }
    theme={selectedCategoryTheme}
    placeholder="Select languages spoken"
    options={[
      "English",
      "Hindi",
      "Bengali",
      "Assamese",
      "Gujarati",
      "Kannada",
      "Malayalam",
      "Marathi",
      "Odia",
      "Punjabi",
      "Tamil",
      "Telugu",
      "Urdu",
      "French",
      "German",
      "Spanish",
      "Arabic",
      "Chinese",
      "Japanese",
      "Russian",
      "Other",
    ]}
  />
</div>


</div>
</div>




{/* PROPERTY PHOTOS */}
<div
  style={{
    marginTop: "20px",
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
  }}
>
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      padding: "6px 42px 6px 10px",
      marginBottom: "14px",
      borderRadius: "6px",
      background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} calc(100% - 44px), ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      lineHeight: 1.3,
    }}
  >
    07. PROPERTY PHOTOS
  </div>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    <span>Property Photos (Optional)</span>



{isEditingHotelProperty && (
  <button
    type="button"
    onClick={handleConnectGoogleDrive}
    style={{
      width: "100%",
      border: "1px solid #C7D6E9",
      background: "#FFFFFF",
      color: selectedCategoryTheme?.primary || "#173B70",
      borderRadius: "6px",
      padding: "9px 12px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: 800,
    }}
  >
    CONNECT DRIVE
  </button>
)}


    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        padding: "15px",
        border: `1px dashed ${selectedCategoryTheme?.primary}`,
        borderRadius: "8px",
        background: "#FFFFFF",
        color: selectedCategoryTheme?.primary,
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 750,
      }}
    >
      + SELECT PROPERTY PHOTOS

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files || []);

          const photosWithPreview = selectedFiles.map((file) =>
            Object.assign(file, {
              previewUrl: URL.createObjectURL(file),
            })
          );

          handleHotelFormChange("photos", [
            ...(hotelFormData.photos || []),
            ...photosWithPreview,
          ]);

          e.target.value = "";
        }}
      />
    </label>

    {hotelFormData.photos?.length > 0 && (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
          gap: "10px",
          padding: "12px",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "7px",
        }}
      >
        {hotelFormData.photos.map((photo, photoIndex) => (
          <div
            key={`${photo.name}-${photoIndex}`}
            style={{
              minWidth: 0,
              border: "1px solid #E2E8F0",
              borderRadius: "7px",
              overflow: "hidden",
              background: "#F8FAFC",
            }}
          >
            <img
              src={
  photo.previewUrl ||
  hotelPhotoPreviewUrls[photo.driveFileId] ||
  ""
}
              alt={photo.name}
              style={{
                display: "block",
                width: "100%",
                height: "110px",
                objectFit: "cover",
                background: "#E2E8F0",
              }}
            />

            <div style={{ padding: "7px" }}>
              <div
                title={photo.name}
                style={{
                  fontSize: "10px",
                  color: "#334155",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "7px",
                }}
              >
                {photo.name}
              </div>

              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  type="button"
                 onClick={() => {
  const imageUrl =
    photo.previewUrl ||
    hotelPhotoPreviewUrls[photo.driveFileId];

  if (imageUrl) {
    window.open(imageUrl, "_blank");
  }
}}
                  style={{
                    flex: 1,
                    border: "none",
                    background: selectedCategoryTheme?.light,
                    color: selectedCategoryTheme?.primary,
                    borderRadius: "4px",
                    padding: "6px 4px",
                    cursor: "pointer",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() => handleRemovePropertyPhoto(photoIndex)}
                  style={{
                    flex: 1,
                    border: "none",
                    background: "#FEF2F2",
                    color: "#B91C1C",
                    borderRadius: "4px",
                    padding: "6px 4px",
                    cursor: "pointer",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    <small
      style={{
        color: "#64748B",
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      Add multiple JPG, PNG or WebP photos of the property. These photos will appear in the Property Details page.
    </small>
  </div>
</div>




{/* PROPERTY STATUS */}
<div
  style={{
    marginTop: "20px",
    padding: "16px",
    background: selectedCategoryTheme?.light,
    border: `1px solid ${selectedCategoryTheme?.border}`,
    borderLeft: `4px solid ${selectedCategoryTheme?.primary || "#0D9488"}`,
    borderRadius: "9px",
  }}
>
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      maxWidth: "100%",
      padding: "6px 42px 6px 10px",
      marginBottom: "14px",
      borderRadius: "6px",
      background: `linear-gradient(90deg, ${selectedCategoryTheme?.primary || "#0D9488"} 0%, ${selectedCategoryTheme?.primary || "#0D9488"} calc(100% - 44px), ${selectedCategoryTheme?.light || "#F1F5F9"} 100%)`,
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      lineHeight: 1.3,
    }}
  >
    08. PROPERTY STATUS
  </div>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      maxWidth: "280px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 700,
    }}
  >
    <span>Registration Status</span>

    <select
      value={hotelFormData.status || "Active"}
      onChange={(e) =>
        handleHotelFormChange("status", e.target.value)
      }
      style={{
        width: "100%",
        height: "42px",
        boxSizing: "border-box",
        padding: "0 11px",
        border: "1px solid #CBD5E1",
        borderRadius: "7px",
        background: "#FFFFFF",
        color: hotelFormData.status === "Inactive"
          ? "#B45309"
          : "#15803D",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>

    <small
      style={{
        color: "#64748B",
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      Inactive properties remain registered but can be excluded from normal property selection lists.
    </small>
  </div>
</div>




{hotelPropertySaveMessage && (
  <div
    style={{
      marginTop: "16px",
      padding: "12px 15px",
      borderRadius: "7px",
      background: "#ECFDF5",
      border: "1px solid #A7F3D0",
      color: "#047857",
      fontSize: "13px",
      fontWeight: 700,
    }}
  >
    {hotelPropertySaveMessage}
  </div>
)}

{hotelPropertySaveError && (
  <div
    style={{
      marginTop: "16px",
      padding: "12px 15px",
      borderRadius: "7px",
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      color: "#B91C1C",
      fontSize: "13px",
      fontWeight: 700,
    }}
  >
    {hotelPropertySaveError}
  </div>
)}





    {/* FORM ACTIONS */}
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "25px",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
      onClick={() => {
  setHotelPropertySaveMessage("");
  setHotelPropertySaveError("");
  setHotelMasterPage("listing");
}}
        style={{
          padding: "10px 18px",
          border: "1px solid #CBD5E1",
          borderRadius: "7px",
          background: "#FFFFFF",
          color: "#475569",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>





      <button
  type="button"
  onClick={handleSaveHotelProperty}
  disabled={isSavingHotelProperty}
  style={{
    padding: "10px 20px",
    border: "none",
    borderRadius: "7px",
    background: isSavingHotelProperty
      ? "#94A3B8"
      : selectedCategoryTheme?.primary || "#173B70",
    color: "#FFFFFF",
    fontWeight: 700,
    cursor: isSavingHotelProperty ? "not-allowed" : "pointer",
    opacity: isSavingHotelProperty ? 0.75 : 1,
  }}
>
  {isSavingHotelProperty ? "Saving Property..." : "Save Property"}
</button>
    </div>
  </div>
)}

  </div>


) : (

  <div
    style={{
      marginTop: "25px",
      padding: "25px",
      background: "#FFFFFF",
      border: "1px solid #E1E8F0",
      borderRadius: "12px",
    }}
  >
    <div
      style={{
        textAlign: "left",
        borderLeft: "4px solid #0D9488",
        paddingLeft: "14px",
        marginBottom: "25px",
      }}
    >
      <h2
        style={{
          color: "#17324D",
          fontSize: "21px",
          fontWeight: 800,
          margin: 0,
        }}
      >
        {activeItem?.title}
      </h2>

      <p
        style={{
          color: "#64748B",
          fontSize: "13px",
          margin: "6px 0 0",
        }}
      >
        {activeItem?.description}
      </p>
    </div>

    <div
      style={{
        marginTop: "25px",
        padding: "20px",
        background: "#F4F7FB",
        borderRadius: "9px",
        color: "#526579",
        fontSize: "13px",
        textAlign: "left",
      }}
    >
      This section is ready for its functional implementation.
    </div>
  </div>
)}


    </div>
  );
}
