






import React, { useEffect, useState } from "react";
import DMCQuery from "./DMCQuery";

import DMCEnquiryHistory from "./dmc/DMCEnquiryHistory";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from "../utils/supplierStorage";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const countries = [
  "Australia", "Austria", "Azerbaijan", "Bahrain", "Bhutan", "Cambodia", "Canada",
  "China", "Egypt", "France", "Germany", "Greece", "Hong Kong", "Indonesia",
  "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya", "Laos", "Malaysia",
  "Maldives", "Mauritius", "Nepal", "Netherlands", "New Zealand", "Oman",
  "Philippines", "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Switzerland", "Taiwan", "Tanzania",
  "Thailand", "Turkey", "UAE", "United Kingdom", "United States", "Uzbekistan",
  "Vietnam"
];

const domesticDestinations = {
  "Andhra Pradesh": ["Visakhapatnam", "Tirupati", "Vijayawada", "Araku Valley", "Amaravati", "Srisailam", "Lepakshi"],
  "Arunachal Pradesh": ["Tawang", "Ziro Valley", "Bomdila", "Itanagar", "Dirang", "Mechuka", "Namdapha National Park"],
  "Assam": ["Guwahati", "Kaziranga", "Majuli", "Sivasagar", "Tezpur", "Dibrugarh", "Manas National Park"],
  "Bihar": ["Bodh Gaya", "Patna", "Nalanda", "Rajgir", "Vaishali", "Vikramshila"],
  "Chhattisgarh": ["Chitrakote Falls", "Jagdalpur", "Barnawapara", "Raipur", "Sirpur", "Mainpat"],
  "Goa": ["North Goa", "South Goa", "Panaji", "Calangute", "Candolim", "Baga", "Anjuna", "Palolem", "Colva", "Dudhsagar Falls"],
  "Gujarat": ["Ahmedabad", "Rann of Kutch", "Dwarka", "Somnath", "Statue of Unity", "Gir National Park", "Vadodara", "Saputara"],
  "Haryana": ["Gurugram", "Kurukshetra", "Pinjore", "Sultanpur National Park"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Dalhousie", "Kasol", "Spiti", "Kullu", "Kasauli", "Chamba", "Bir Billing", "Kinnaur"],
  "Jharkhand": ["Ranchi", "Netarhat", "Deoghar", "Betla National Park", "Hundru Falls"],
  "Jammu and Kashmir": ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"],
  "Karnataka": ["Bengaluru", "Mysuru", "Coorg", "Hampi", "Gokarna", "Badami", "Chikmagalur", "Kabini", "Jog Falls", "Udupi"],
  "Kerala": ["Munnar", "Alleppey", "Thekkady", "Kochi", "Wayanad", "Kovalam", "Varkala", "Kumarakom", "Vagamon", "Bekal"],
  "Madhya Pradesh": ["Khajuraho", "Ujjain", "Bhopal", "Jabalpur", "Kanha", "Bandhavgarh", "Pachmarhi", "Orchha", "Gwalior", "Amarkantak"],
  "Maharashtra": ["Mumbai", "Pune", "Lonavala", "Mahabaleshwar", "Nashik", "Aurangabad", "Ajanta Caves", "Ellora Caves", "Shirdi", "Alibaug", "Tadoba"],
  "Odisha": ["Puri", "Bhubaneswar", "Konark", "Chilika", "Cuttack", "Gopalpur", "Similipal", "Daringbadi"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Pushkar", "Mount Abu", "Ranthambore", "Bikaner", "Chittorgarh", "Bundi", "Ajmer"],
  "Sikkim": ["Gangtok", "Pelling", "Lachung", "Yumthang Valley", "Tsomgo Lake", "Nathula Pass", "Ravangla", "Namchi"],
  "Tamil Nadu": ["Chennai", "Ooty", "Kodaikanal", "Madurai", "Rameswaram", "Kanyakumari", "Mahabalipuram", "Thanjavur", "Yercaud", "Kumbakonam"],
  "Uttar Pradesh": ["Agra", "Varanasi", "Ayodhya", "Prayagraj", "Lucknow", "Mathura", "Vrindavan", "Sarnath", "Fatehpur Sikri", "Kushinagar"],
  "Uttarakhand": ["Rishikesh", "Haridwar", "Mussoorie", "Nainital", "Jim Corbett", "Auli", "Chopta", "Kedarnath", "Badrinath", "Valley of Flowers", "Dehradun"],
  "West Bengal": ["Kolkata", "Darjeeling", "Kalimpong", "Dooars", "Sundarbans", "Digha", "Mandarmani", "Shantiniketan", "Murshidabad", "Bishnupur", "Mukutmanipur"]
};

const internationalDestinations = {
  "Australia": ["Sydney", "Melbourne", "Gold Coast", "Cairns"],
  "Bhutan": ["Thimphu", "Paro", "Punakha", "Phobjikha", "Bumthang", "Trongsa", "Haa Valley", "Dochula Pass"],
  "Cambodia": ["Siem Reap", "Phnom Penh"],
  "Egypt": ["Cairo", "Luxor", "Aswan", "Hurghada"],
  "France": ["Paris", "Nice", "Lyon", "Marseille"],
  "Indonesia": ["Bali", "Jakarta", "Lombok", "Yogyakarta"],
  "Italy": ["Rome", "Venice", "Florence", "Milan"],
  "Japan": ["Tokyo", "Kyoto", "Osaka", "Mount Fuji", "Hokkaido"],
  "Kenya": ["Nairobi", "Masai Mara", "Amboseli", "Lake Nakuru"],
  "Malaysia": ["Kuala Lumpur", "Langkawi", "Penang", "Genting Highlands"],
  "Maldives": ["Male", "Maafushi", "North Male Atoll", "South Ari Atoll"],
  "Mauritius": ["Port Louis", "Grand Baie", "Flic en Flac", "Le Morne"],
  "Nepal": ["Kathmandu", "Pokhara", "Chitwan", "Lumbini"],
  "Singapore": ["Singapore City", "Sentosa"],
  "South Africa": ["Cape Town", "Johannesburg", "Kruger National Park", "Durban"],
  "Sri Lanka": ["Colombo", "Kandy", "Bentota", "Galle", "Nuwara Eliya", "Sigiriya"],
  "Switzerland": ["Zurich", "Lucerne", "Interlaken", "Geneva", "Zermatt"],
  "Tanzania": ["Serengeti", "Ngorongoro", "Zanzibar", "Kilimanjaro"],
  "Thailand": ["Bangkok", "Pattaya", "Phuket", "Krabi", "Chiang Mai", "Koh Samui", "Phi Phi Islands", "Hua Hin", "Khao Lak", "Ayutthaya"],
  "UAE": ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah"],
  "United Kingdom": ["London", "Edinburgh", "Manchester", "Liverpool"],
  "United States": ["New York", "Los Angeles", "San Francisco", "Las Vegas", "Orlando"],
  "Vietnam": ["Hanoi", "Ho Chi Minh City", "Da Nang", "Ha Long Bay", "Hoi An", "Sapa", "Ninh Binh", "Hue", "Phu Quoc", "Nha Trang"]
};

export default function SupplierMaster({
  currentUser,
  userProfile,
  onBackToWorkspace
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [supplierView, setSupplierView] = useState("directory");
  const [dmcPage, setDmcPage] = useState("suppliers");
  const [directQueryDMC, setDirectQueryDMC] = useState(null);
  const [historyDMC, setHistoryDMC] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = String(userProfile?.role || currentUser?.role || "").trim().toLowerCase() === "admin";

  const [showAddSupplier, setShowAddSupplier] = useState(false);
const [isEditingSupplier, setIsEditingSupplier] = useState(false);
const [savingSupplier, setSavingSupplier] = useState(false);
const [formError, setFormError] = useState("");
const [bulkDomesticStates, setBulkDomesticStates] = useState([]);
const [bulkInternationalCountries, setBulkInternationalCountries] = useState([]);
const [showDomesticCoverageEditor, setShowDomesticCoverageEditor] = useState(false);
const [showInternationalCoverageEditor, setShowInternationalCoverageEditor] = useState(false);

const [supplierForm, setSupplierForm] = useState({
  companyName: "",
  categories: [],
  contactPerson: "",
  mobile: "",
  alternateMobile: "",
  email: "",
  website: "",
  officeAddress: "",
  city: "",
  state: "",
  country: "India",
  marketCoverage: [],
  domesticCoverage: [{ state: "", destinations: "", destinationDraft: "" }],
  internationalCoverage: [{ country: "", destinations: "", destinationDraft: "" }],
  specializations: "",
  services: "",
  paymentTerms: "",
  contractDetails: ""
});




  async function loadSuppliers() {
    try {
      setLoading(true);
      setError("");

      const records = await getSuppliers();
      setSuppliers(records);
    } catch (err) {
      console.error("Supplier loading failed:", err);
      setError(err.message || "Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  }


  async function handleDeleteSupplier(supplier) {
    if (!isAdmin || !supplier?.id) return;

    const confirmed = window.confirm(
      `Delete DMC supplier ${supplier.companyName} (${supplier.supplierId})?\\n\\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteSupplier(supplier.id, currentUser?.uid || null);
      const records = await getSuppliers();
      setSuppliers(records);
      if (selectedSupplier?.id === supplier.id) {
        setSelectedSupplier(null);
        setSupplierView("category");
      }
      window.alert("DMC supplier deleted successfully.");
    } catch (err) {
      console.error("Supplier deletion failed:", err);
      window.alert(err.message || "Unable to delete supplier. Please try again.");
    }
  }

  function handleSupplierFieldChange(event) {
  const { name, value } = event.target;

  setSupplierForm(previous => ({
    ...previous,
    [name]: value
  }));
}

function handleCategoryToggle(category) {
  setSupplierForm(previous => ({
    ...previous,
    categories: previous.categories.includes(category)
      ? previous.categories.filter(item => item !== category)
      : [...previous.categories, category]
  }));
}

function handleMarketCoverageToggle(market) {
  setSupplierForm(previous => ({
    ...previous,
    marketCoverage: previous.marketCoverage.includes(market)
      ? previous.marketCoverage.filter(item => item !== market)
      : [...previous.marketCoverage, market]
  }));
}

function handleCoverageRowChange(type, index, field, value) {
  setSupplierForm(previous => ({
    ...previous,
    [type]: previous[type].map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row)
  }));
}

function addCoverageRow(type) {
  setSupplierForm(previous => ({
    ...previous,
    [type]: [...previous[type], type === "domesticCoverage"
      ? { state: "", destinations: "", destinationDraft: "" }
      : { country: "", destinations: "", destinationDraft: "" }]
  }));
}

function removeCoverageRow(type, index) {
  setSupplierForm(previous => ({
    ...previous,
    [type]: previous[type].filter((_, rowIndex) => rowIndex !== index)
  }));
}

function addSelectedCoverageEntities(type, selectedValues, clearSelection) {
  const field = type === "domesticCoverage" ? "state" : "country";
  setSupplierForm(previous => {
    const existing = new Set(previous[type].map(row => (row[field] || "").trim().toLowerCase()).filter(Boolean));
    const additions = selectedValues.filter(value => !existing.has(value.trim().toLowerCase())).map(value => ({
      [field]: value, destinations: "", destinationDraft: "", destinationSelections: []
    }));
    const rows = previous[type].filter(row => (row[field] || "").trim());
    return { ...previous, [type]: [...rows, ...additions] };
  });
  clearSelection([]);
}

function toggleDestinationSelection(type, index, destination) {
  setSupplierForm(previous => ({
    ...previous,
    [type]: previous[type].map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const selected = row.destinationSelections || [];
      return { ...row, destinationSelections: selected.includes(destination) ? selected.filter(item => item !== destination) : [...selected, destination] };
    })
  }));
}

function addCheckedDestinations(type, index) {
  setSupplierForm(previous => ({
    ...previous,
    [type]: previous[type].map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const current = (row.destinations || "").split(",").map(item => item.trim()).filter(Boolean);
      (row.destinationSelections || []).forEach(item => { if (!current.some(existing => existing.toLowerCase() === item.toLowerCase())) current.push(item); });
      return { ...row, destinations: current.join(", "), destinationSelections: [] };
    })
  }));
}

function addCoverageDestination(type, index) {
  setSupplierForm(previous => ({
    ...previous,
    [type]: previous[type].map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const candidate = (row.destinationDraft || "").trim().replace(/,$/, "");
      if (!candidate) return row;
      const current = (row.destinations || "").split(",").map(item => item.trim()).filter(Boolean);
      if (!current.some(item => item.toLowerCase() === candidate.toLowerCase())) current.push(candidate);
      return { ...row, destinations: current.join(", "), destinationDraft: "" };
    })
  }));
}

function removeCoverageDestination(type, index, destination) {
  setSupplierForm(previous => ({
    ...previous,
    [type]: previous[type].map((row, rowIndex) => rowIndex !== index ? row : ({
      ...row,
      destinations: (row.destinations || "").split(",").map(item => item.trim()).filter(item => item && item.toLowerCase() !== destination.toLowerCase()).join(", ")
    }))
  }));
}





function createEmptySupplierForm() {
  return {
    companyName: "", categories: [], contactPerson: "", mobile: "", alternateMobile: "",
    email: "", website: "", officeAddress: "", city: "", state: "", country: "India",
    marketCoverage: [],
    domesticCoverage: [{ state: "", destinations: "", destinationDraft: "" }],
    internationalCoverage: [{ country: "", destinations: "", destinationDraft: "" }],
    specializations: "", services: "", paymentTerms: "", contractDetails: ""
  };
}

function resetSupplierEntryState() {
  setSupplierForm(createEmptySupplierForm());
  setIsEditingSupplier(false);
  setFormError("");
  setBulkDomesticStates([]);
  setBulkInternationalCountries([]);
  setShowDomesticCoverageEditor(false);
  setShowInternationalCoverageEditor(false);
}

function closeSupplierEntry() {
  setShowAddSupplier(false);
  resetSupplierEntryState();
}

function openNewSupplierEntry() {
  resetSupplierEntryState();
  setShowAddSupplier(true);
}

function beginEditSupplier() {
  if (!selectedSupplier || !getSupplierCategoryList(selectedSupplier).includes("dmc")) return;

  setSupplierForm({
    companyName: selectedSupplier.companyName || "",
    categories: Array.isArray(selectedSupplier.categories)
      ? selectedSupplier.categories
      : typeof selectedSupplier.categories === "string"
        ? selectedSupplier.categories.split(",").map(item => item.trim()).filter(Boolean)
        : [],
    contactPerson: selectedSupplier.contactPerson || "",
    mobile: selectedSupplier.mobile || "",
    alternateMobile: selectedSupplier.alternateMobile || "",
    email: selectedSupplier.email || "",
    website: selectedSupplier.website || "",
    officeAddress: selectedSupplier.officeAddress || "",
    city: selectedSupplier.city || "",
    state: selectedSupplier.state || "",
    country: selectedSupplier.country || "India",
    marketCoverage: Array.isArray(selectedSupplier.marketCoverage) ? selectedSupplier.marketCoverage : [],
    domesticCoverage: Array.isArray(selectedSupplier.domesticCoverage) && selectedSupplier.domesticCoverage.length
      ? selectedSupplier.domesticCoverage.map(item => ({
          state: item.state || "",
          destinations: Array.isArray(item.destinations) ? item.destinations.join(", ") : (item.destinations || ""),
          destinationDraft: ""
        }))
      : [{ state: "", destinations: "", destinationDraft: "" }],
    internationalCoverage: Array.isArray(selectedSupplier.internationalCoverage) && selectedSupplier.internationalCoverage.length
      ? selectedSupplier.internationalCoverage.map(item => ({
          country: item.country || "",
          destinations: Array.isArray(item.destinations) ? item.destinations.join(", ") : (item.destinations || ""),
          destinationDraft: ""
        }))
      : [{ country: "", destinations: "", destinationDraft: "" }],
    specializations: Array.isArray(selectedSupplier.specializations)
      ? selectedSupplier.specializations.join(", ")
      : (selectedSupplier.specializations || ""),
    services: Array.isArray(selectedSupplier.services)
      ? selectedSupplier.services.join(", ")
      : (selectedSupplier.services || ""),
    paymentTerms: selectedSupplier.paymentTerms || "",
    contractDetails: selectedSupplier.contractDetails || ""
  });

  setFormError("");
  setIsEditingSupplier(true);
  setShowAddSupplier(true);
}

async function handleSaveSupplier() {
  setFormError("");

  if (!supplierForm.companyName.trim()) {
    setFormError("Please enter the supplier company name.");
    return;
  }

  if (supplierForm.categories.length === 0) {
    setFormError("Please select at least one supplier category.");
    return;
  }

  if (supplierForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierForm.email)) {
    setFormError("Please enter a valid email address.");
    return;
  }

  setSavingSupplier(true);

  try {
    const supplierData = {
      ...supplierForm,
      companyName: supplierForm.companyName.trim(),
      categories: supplierForm.categories,
      marketCoverage: supplierForm.marketCoverage,
      domesticCoverage: supplierForm.domesticCoverage.filter(item => item.state.trim() || item.destinations.trim()).map(item => ({
        state: item.state.trim(),
        destinations: item.destinations.split(",").map(value => value.trim()).filter(Boolean)
      })),
      internationalCoverage: supplierForm.internationalCoverage.filter(item => item.country.trim() || item.destinations.trim()).map(item => ({
        country: item.country.trim(),
        destinations: item.destinations.split(",").map(value => value.trim()).filter(Boolean)
      })),
      specializations: supplierForm.specializations.split(",").map(item => item.trim()).filter(Boolean),
      services: supplierForm.services.split(",").map(item => item.trim()).filter(Boolean),
      changedBy: currentUser?.uid || null
    };

    if (isEditingSupplier && selectedSupplier?.id) {
      const { changedBy, ...updatePayload } = supplierData;
      await updateSupplier(selectedSupplier.id, updatePayload, currentUser?.uid || null);
      const records = await getSuppliers();
      setSuppliers(records);
      const refreshedSupplier = records.find(item => item.id === selectedSupplier.id);
      if (refreshedSupplier) setSelectedSupplier(refreshedSupplier);
    } else {
      await createSupplier(supplierData);
      await loadSuppliers();
    }

    setShowAddSupplier(false);
    resetSupplierEntryState();

    window.alert(isEditingSupplier ? "DMC supplier updated successfully." : "Supplier registered successfully.");
  } catch (err) {
    console.error("Supplier registration failed:", err);

    if (err.message === "SUPPLIER_ID_COUNTER_NOT_INITIALIZED") {
      setFormError("Supplier ID counter is not initialized. Please contact Admin.");
    } else {
      setFormError(err.message || "Unable to save supplier. Please try again.");
    }
  } finally {
    setSavingSupplier(false);
  }
}





  useEffect(() => {
    loadSuppliers();
  }, []);

  const activeCount = suppliers.filter(
    supplier => supplier.isActive === true
  ).length;

  const inactiveCount = suppliers.filter(
    supplier => supplier.isActive === false
  ).length;


  const supplierCategories = [
  { key: "DMC", label: "DMC" },
  
  { key: "Transport Supplier", label: "Transport" },
  { key: "Activity / Excursion Supplier", label: "Activities" },
  { key: "Other", label: "Other" }
];

const getSupplierCategoryList = (supplier) => {
  const rawCategories = supplier.categories;

  const categories = Array.isArray(rawCategories)
    ? rawCategories
    : typeof rawCategories === "string"
      ? rawCategories.split(",")
      : [];

  return categories
    .map(category => String(category).trim().toLowerCase())
    .filter(Boolean);
};

const categoryCounts = supplierCategories.reduce((counts, category) => {
  const categoryKey = category.key.trim().toLowerCase();

  counts[category.key] = suppliers.filter(
    supplier => getSupplierCategoryList(supplier).includes(categoryKey)
  ).length;

  return counts;
}, {});

const filteredSuppliers = suppliers.filter(supplier => {
  const matchesCategory =
    selectedCategory === "ALL" ||
    getSupplierCategoryList(supplier).includes(selectedCategory.trim().toLowerCase());

  const searchText = supplierSearch.trim().toLowerCase();

  const matchesSearch =
    !searchText ||
    (supplier.supplierId || "").toLowerCase().includes(searchText) ||
    (supplier.companyName || "").toLowerCase().includes(searchText) ||
    (supplier.contactPerson || "").toLowerCase().includes(searchText);

  return matchesCategory && matchesSearch;
});




  const coverageMiniButton = { border: "1px solid #d8c8d9", background: "#fff", color: "#623a60", borderRadius: "7px", padding: "7px 9px", cursor: "pointer", fontWeight: 800 };
  const coverageAddButton = { border: "1px solid #c99abb", background: "#f8eff6", color: "#623a60", borderRadius: "7px", padding: "0 12px", cursor: "pointer", fontSize: "10px", fontWeight: 850 };
  const coverageChipWrap = { display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "7px" };
  const coverageChip = { display: "inline-flex", alignItems: "center", gap: "5px", border: "1px solid #e4cddd", background: "#f8edf4", color: "#633b5d", borderRadius: "14px", padding: "3px 8px", fontSize: "10px", fontWeight: 700 };
  const coverageChipRemove = { border: 0, background: "transparent", color: "#8c4c79", cursor: "pointer", padding: 0, fontWeight: 900 };

  const styles = {
    page: {
      width: "100%",
      padding: "18px",
      boxSizing: "border-box",
      fontFamily: "inherit",
      color: "#18324f"
    },
    header: {
    background: "linear-gradient(105deg, #B94F7B 0%, #A94F83 52%, #784C83 100%)",
      borderRadius: "14px",
      padding: "20px 22px",
      color: "#ffffff",
      marginBottom: "16px",
      textAlign: "left",
      boxShadow: "0 5px 16px rgba(7, 89, 133, 0.14)"
    },
    backButton: {
      border: "1px solid rgba(255,255,255,0.55)",
      background: "rgba(255,255,255,0.12)",
      color: "#ffffff",
      borderRadius: "7px",
      padding: "7px 12px",
      fontSize: "11px",
      fontWeight: 700,
      cursor: "pointer",
      marginBottom: "13px"
    },
    title: {
      fontSize: "22px",
      color: "#ffffff",
      fontWeight: 850,
      margin: 0,
      letterSpacing: "0.2px"
    },
    subtitle: {
      fontSize: "12px",
      margin: "6px 0 0",
      opacity: 0.92
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "12px",
      marginBottom: "16px"
    },
    panel: {
      background: "#ffffff",
      border: "1px solid #dbe6ee",
      borderRadius: "12px",
      padding: "15px",
      boxShadow: "0 2px 8px rgba(15, 45, 75, 0.045)"
    },


    categoryGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
  gap: "12px",
  marginTop: "18px",
  marginBottom: "16px"
},
categoryCard: {
  border: "1px solid #dce4ec",
  borderRadius: "10px",
  padding: "15px 14px",
  minHeight: "88px",
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.2s ease",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
},
categoryCount: {
  fontSize: "24px",
  fontWeight: 850,
  color: "#334155"
},
categoryLabel: {
  fontSize: "12px",
  fontWeight: 800,
  color: "#334155",
  marginTop: "8px"
},



    statLabel: {
      fontSize: "11px",
      color: "#64748b",
      fontWeight: 700
    },
    statValue: {
      fontSize: "25px",
      fontWeight: 850,
      marginTop: "5px",
      color: "#075985"
    },
    sectionHeading: {
      fontSize: "14px",
      fontWeight: 850,
      color: "#164e70",
      margin: 0
    },
    searchInput: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #d6e1e9",
      borderRadius: "8px",
      padding: "10px 12px",
      fontSize: "12px",
      outline: "none"
    },
   
tableWrap: {
  width: "100%",
  overflowX: "hidden",
  marginTop: "14px"
},
table: {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  minWidth: 0,
  fontSize: "11px"
},

th: {
  padding: "7px 10px",
  height: "28px",
  background: "linear-gradient(180deg, #07516B 0%, #003B55 100%)",
  color: "#ffffff",
  textAlign: "left",
  verticalAlign: "middle",
  fontWeight: 850,
  fontSize: "10px",
  borderBottom: "1px solid #0b526d",
  borderRight: "1px solid rgba(255,255,255,0.22)",
  whiteSpace: "nowrap"
},

td: {
  padding: "12px 10px",
  borderBottom: "1px solid #edf1f5",
  color: "#0f172a",
  fontWeight: 700,
  textAlign: "left",
  verticalAlign: "middle",
  lineHeight: 1.5,
  overflowWrap: "break-word"
},

rowEven: {
  background: "#f3f7fa"
},
rowOdd: {
  background: "#eaf2f7"
},

    empty: {
      textAlign: "center",
      padding: "30px 12px",
      color: "#64748b",
      fontSize: "12px"
    }
  };

  return (
    <div style={styles.page}>




{/* ADD SUPPLIER MODAL */}
{showAddSupplier && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(15, 30, 50, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "18px"
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "1180px",
        maxHeight: "92vh",
        overflowY: "auto",
        background: "#ffffff",
        borderRadius: "14px",
        boxShadow: "0 15px 50px rgba(0,0,0,0.22)"
      }}
    >
      <div style={{
        padding: "18px 22px",
        background: "linear-gradient(105deg, #B94F7B 0%, #A94F83 52%, #784C83 100%)",
        color: "#ffffff",
        borderRadius: "14px 14px 0 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: "17px", fontWeight: 850 }}>
            {isEditingSupplier ? "EDIT DMC SUPPLIER" : "ADD NEW SUPPLIER"}
          </div>
          <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.9 }}>
            {isEditingSupplier ? "Update the DMC supplier profile and destination coverage" : "Register a supplier in the Orbitz supplier network"}
          </div>
        </div>

        <button
          type="button"
          onClick={closeSupplierEntry}
          style={{
            border: "1px solid rgba(255,255,255,0.55)",
            background: "transparent",
            color: "#ffffff",
            borderRadius: "7px",
            padding: "6px 10px",
            cursor: "pointer",
            fontWeight: 800
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "20px", display: "grid", gap: "18px" }}>
       <section style={{ marginBottom: "2px" }}>
          <h3 style={{
  fontSize: "13px",
  color: "#244761",
  margin: "0 0 12px",
  textAlign: "left",
  fontWeight: 850,
  letterSpacing: "0.2px"
}}>
            COMPANY INFORMATION
          </h3>

         <label style={{
  display: "block",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 750,
  color: "#334155",
  marginBottom: "6px"
}}>
            Company Name *
          </label>
          <input
            name="companyName"
            value={supplierForm.companyName}
            onChange={handleSupplierFieldChange}
            placeholder="Enter registered company name"
            style={styles.searchInput}
          />

          <div style={{
  fontSize: "13px",
  fontWeight: 850,
  color: "#244761",
  marginTop: "14px",
  marginBottom: "10px",
  textAlign: "left",
  letterSpacing: "0.2px"
}}>
  SUPPLIER CATEGORIES *
</div>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "9px"
          }}>
            {[
              "DMC",
              
              "Transport Supplier",
              "Activity / Excursion Supplier",
              "Other"
            ].map(category => (
              <label key={category} style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 10px",
                border: "1px solid #dbe3ec",
                borderRadius: "7px",
                fontSize: "11px",
                cursor: "pointer",
                background: supplierForm.categories.includes(category)
                  ? "#f9edf3"
                  : "#ffffff"
              }}>
                <input
                  type="checkbox"
                  checked={supplierForm.categories.includes(category)}
                  onChange={() => { if (!isEditingSupplier) handleCategoryToggle(category); }}
                  disabled={isEditingSupplier}
                />
                {category}
              </label>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: "2px" }}>
          <h3 style={{
  fontSize: "13px",
  color: "#244761",
  margin: "0 0 12px",
  textAlign: "left",
  fontWeight: 850,
  letterSpacing: "0.2px"
}}>
            CONTACT DETAILS
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px"
          }}>
            {[
              ["contactPerson", "Contact Person", "Enter contact person"],
              ["mobile", "Mobile Number", "Enter mobile number"],
              ["alternateMobile", "Alternate Mobile", "Enter alternate number"],
              ["email", "Email Address", "Enter email address"],
              ["website", "Website", "Enter website"]
            ].map(([name, label, placeholder]) => (
              <div key={name}>
                <label style={{
  display: "block",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 750,
  color: "#334155",
  marginBottom: "6px"
}}>
                  {label}
                </label>
                <input
                  name={name}
                  value={supplierForm[name]}
                  onChange={handleSupplierFieldChange}
                  placeholder={placeholder}
                  style={styles.searchInput}
                />
              </div>
            ))}
          </div>
        </section>

        {supplierForm.categories.includes("DMC") && (
        <section style={{ marginBottom: "2px", display: "grid", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", color: "#244761", margin: "0 0 2px", textAlign: "left", fontWeight: 850 }}>DMC MARKET & DESTINATION COVERAGE</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "2px" }}>
            {["Domestic", "International"].map(market => (
              <label key={market} style={{ display: "flex", alignItems: "center", gap: "7px", border: "1px solid #d6c5d5", borderRadius: "8px", padding: "8px 12px", fontSize: "11px", fontWeight: 750, background: supplierForm.marketCoverage.includes(market) ? "#f4e5ef" : "#fff", color: "#56304f" }}>
                <input type="checkbox" checked={supplierForm.marketCoverage.includes(market)} onChange={() => handleMarketCoverageToggle(market)} />{market}
              </label>
            ))}
          </div>
          {supplierForm.marketCoverage.includes("Domestic") && (
            <div style={{ border: "1px solid #e2d7e4", borderRadius: "9px", padding: "13px", marginBottom: "2px", background: "#fdfafd" }}>
              <button type="button" onClick={() => setShowDomesticCoverageEditor(value => !value)} aria-expanded={showDomesticCoverageEditor} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", border: 0, background: "transparent", padding: "2px 0 10px", color: "#56304f", cursor: "pointer", textAlign: "left", fontSize: "12px", fontWeight: 850 }}>
                <span>DOMESTIC COVERAGE — STATE & DESTINATIONS</span><span>{showDomesticCoverageEditor ? "− COLLAPSE" : "+ EXPAND"}</span>
              </button>
              {showDomesticCoverageEditor && <>
              <div style={{ border: "1px solid #eaddea", borderRadius: "8px", padding: "10px", marginBottom: "12px", background: "#fff" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#56304f", marginBottom: "7px", textAlign: "left" }}>SELECT STATES (MULTIPLE)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "6px", maxHeight: "145px", overflowY: "auto" }}>
                  {indianStates.map(stateName => <label key={stateName} style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "11px", padding: "5px 7px", background: bulkDomesticStates.includes(stateName) ? "#f3e5ef" : "#fafafa", borderRadius: "6px" }}><input type="checkbox" checked={bulkDomesticStates.includes(stateName)} onChange={() => setBulkDomesticStates(prev => prev.includes(stateName) ? prev.filter(x => x !== stateName) : [...prev, stateName])} />{stateName}</label>)}
                </div>
                <div style={{ display: "flex", gap: "7px", marginTop: "8px", flexWrap: "wrap" }}>
                  <input id="orbitz-manual-domestic-state" placeholder="Add unlisted state / UT" style={{ ...styles.searchInput, maxWidth: "280px" }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); const value = event.currentTarget.value.trim(); if (value) { setBulkDomesticStates(prev => prev.includes(value) ? prev : [...prev, value]); event.currentTarget.value = ""; } } }} />
                  <button type="button" onClick={() => { const el = document.getElementById("orbitz-manual-domestic-state"); const value = el?.value.trim(); if (value) { setBulkDomesticStates(prev => prev.includes(value) ? prev : [...prev, value]); el.value = ""; } }} style={coverageAddButton}>ADD MANUAL</button>
                  <button type="button" onClick={() => addSelectedCoverageEntities("domesticCoverage", bulkDomesticStates, setBulkDomesticStates)} style={coverageAddButton}>ADD SELECTED STATES ({bulkDomesticStates.length})</button>
                </div>
              </div>
              {supplierForm.domesticCoverage.map((row, index) => (
                <div key={`domestic-${index}`} style={{ borderBottom: "1px solid #eaddea", padding: "8px 0 12px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <strong style={{ color: "#56304f", fontSize: "12px" }}>{row.state || "Unspecified state"}</strong>
                    <button type="button" onClick={() => removeCoverageRow("domesticCoverage", index)} style={coverageMiniButton}>REMOVE STATE</button>
                  </div>
                  <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
                    {(domesticDestinations[row.state] || []).map(destination => <label key={destination} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 7px", fontSize: "11px", background: (row.destinationSelections || []).includes(destination) ? "#f3e5ef" : "#fff", borderRadius: "6px" }}><input type="checkbox" checked={(row.destinationSelections || []).includes(destination)} onChange={() => toggleDestinationSelection("domesticCoverage", index, destination)} />{destination}</label>)}
                  </div>
                  <button type="button" onClick={() => addCheckedDestinations("domesticCoverage", index)} style={{ ...coverageAddButton, marginTop: "7px" }}>ADD CHECKED DESTINATIONS</button>
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}><input value={row.destinationDraft || ""} onChange={event => handleCoverageRowChange("domesticCoverage", index, "destinationDraft", event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addCoverageDestination("domesticCoverage", index); } }} placeholder="Type an unlisted destination" style={styles.searchInput} /><button type="button" onClick={() => addCoverageDestination("domesticCoverage", index)} style={coverageAddButton}>ADD MANUAL</button></div>
                  <div style={coverageChipWrap}>{(row.destinations || "").split(",").map(item => item.trim()).filter(Boolean).map(item => <span key={item} style={coverageChip}>{item}<button type="button" onClick={() => removeCoverageDestination("domesticCoverage", index, item)} style={coverageChipRemove}>×</button></span>)}</div>
                </div>
              ))}
              <button type="button" onClick={() => addCoverageRow("domesticCoverage")} style={{ display: "block", marginLeft: 0, marginRight: "auto", border: "1px dashed #a77c9f", background: "#f8eff6", color: "#623a60", borderRadius: "7px", padding: "7px 11px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>+ ADD EMPTY STATE ROW</button>
              </>}
            </div>
          )}
          {supplierForm.marketCoverage.includes("International") && (
            <div style={{ border: "1px solid #e2d7e4", borderRadius: "9px", padding: "13px", marginBottom: "2px", background: "#fdfafd" }}>
              <button type="button" onClick={() => setShowInternationalCoverageEditor(value => !value)} aria-expanded={showInternationalCoverageEditor} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", border: 0, background: "transparent", padding: "2px 0 10px", color: "#56304f", cursor: "pointer", textAlign: "left", fontSize: "12px", fontWeight: 850 }}>
                <span>INTERNATIONAL COVERAGE — COUNTRY & DESTINATIONS</span><span>{showInternationalCoverageEditor ? "− COLLAPSE" : "+ EXPAND"}</span>
              </button>
              {showInternationalCoverageEditor && <>
              <div style={{ border: "1px solid #eaddea", borderRadius: "8px", padding: "10px", marginBottom: "12px", background: "#fff" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#56304f", marginBottom: "7px", textAlign: "left" }}>SELECT COUNTRIES (MULTIPLE)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "6px", maxHeight: "145px", overflowY: "auto" }}>
                  {countries.map(countryName => <label key={countryName} style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "11px", padding: "5px 7px", background: bulkInternationalCountries.includes(countryName) ? "#f3e5ef" : "#fafafa", borderRadius: "6px" }}><input type="checkbox" checked={bulkInternationalCountries.includes(countryName)} onChange={() => setBulkInternationalCountries(prev => prev.includes(countryName) ? prev.filter(x => x !== countryName) : [...prev, countryName])} />{countryName}</label>)}
                </div>
                <div style={{ display: "flex", gap: "7px", marginTop: "8px", flexWrap: "wrap" }}>
                  <input id="orbitz-manual-international-country" placeholder="Add unlisted country" style={{ ...styles.searchInput, maxWidth: "280px" }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); const value = event.currentTarget.value.trim(); if (value) { setBulkInternationalCountries(prev => prev.includes(value) ? prev : [...prev, value]); event.currentTarget.value = ""; } } }} />
                  <button type="button" onClick={() => { const el = document.getElementById("orbitz-manual-international-country"); const value = el?.value.trim(); if (value) { setBulkInternationalCountries(prev => prev.includes(value) ? prev : [...prev, value]); el.value = ""; } }} style={coverageAddButton}>ADD MANUAL</button>
                  <button type="button" onClick={() => addSelectedCoverageEntities("internationalCoverage", bulkInternationalCountries, setBulkInternationalCountries)} style={coverageAddButton}>ADD SELECTED COUNTRIES ({bulkInternationalCountries.length})</button>
                </div>
              </div>
              {supplierForm.internationalCoverage.map((row, index) => (
                <div key={`international-${index}`} style={{ borderBottom: "1px solid #eaddea", padding: "8px 0 12px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <strong style={{ color: "#56304f", fontSize: "12px" }}>{row.country || "Unspecified country"}</strong>
                    <button type="button" onClick={() => removeCoverageRow("internationalCoverage", index)} style={coverageMiniButton}>REMOVE COUNTRY</button>
                  </div>
                  <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
                    {(internationalDestinations[row.country] || []).map(destination => <label key={destination} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 7px", fontSize: "11px", background: (row.destinationSelections || []).includes(destination) ? "#f3e5ef" : "#fff", borderRadius: "6px" }}><input type="checkbox" checked={(row.destinationSelections || []).includes(destination)} onChange={() => toggleDestinationSelection("internationalCoverage", index, destination)} />{destination}</label>)}
                  </div>
                  <button type="button" onClick={() => addCheckedDestinations("internationalCoverage", index)} style={{ ...coverageAddButton, marginTop: "7px" }}>ADD CHECKED DESTINATIONS</button>
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}><input value={row.destinationDraft || ""} onChange={event => handleCoverageRowChange("internationalCoverage", index, "destinationDraft", event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addCoverageDestination("internationalCoverage", index); } }} placeholder="Type an unlisted destination" style={styles.searchInput} /><button type="button" onClick={() => addCoverageDestination("internationalCoverage", index)} style={coverageAddButton}>ADD MANUAL</button></div>
                  <div style={coverageChipWrap}>{(row.destinations || "").split(",").map(item => item.trim()).filter(Boolean).map(item => <span key={item} style={coverageChip}>{item}<button type="button" onClick={() => removeCoverageDestination("internationalCoverage", index, item)} style={coverageChipRemove}>×</button></span>)}</div>
                </div>
              ))}
              <button type="button" onClick={() => addCoverageRow("internationalCoverage")} style={{ display: "block", marginLeft: 0, marginRight: "auto", border: "1px dashed #a77c9f", background: "#f8eff6", color: "#623a60", borderRadius: "7px", padding: "7px 11px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>+ ADD EMPTY COUNTRY ROW</button>
              </>}
            </div>
          )}
          <div style={{ display: "grid", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#56304f", marginBottom: "5px", textAlign: "left" }}>Services offered (comma-separated)</label>
              <textarea name="services" value={supplierForm.services} onChange={handleSupplierFieldChange} placeholder="Hotels, transfers, sightseeing, tour packages" rows={2} style={{ ...styles.searchInput, resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#56304f", marginBottom: "5px", textAlign: "left" }}>Specializations (comma-separated)</label>
              <textarea name="specializations" value={supplierForm.specializations} onChange={handleSupplierFieldChange} placeholder="Luxury, budget, family, group, adventure" rows={2} style={{ ...styles.searchInput, resize: "vertical" }} />
            </div>
          </div>
        </section>
        )}



<section style={{ marginBottom: "2px" }}>
         <h3 style={{
  fontSize: "13px",
  color: "#244761",
  margin: "0 0 12px",
  textAlign: "left",
  fontWeight: 850,
  letterSpacing: "0.2px"
}}>
            OFFICE ADDRESS
          </h3>

          <div style={{ display: "grid", gap: "10px" }}>
            <input
              name="officeAddress"
              value={supplierForm.officeAddress}
              onChange={handleSupplierFieldChange}
              placeholder="Office address"
              style={styles.searchInput}
            />

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px"
            }}>
              {[
                ["city", "City"],
                ["state", "State"],
                ["country", "Country"]
              ].map(([name, placeholder]) => (
                <input
                  key={name}
                  name={name}
                  value={supplierForm[name]}
                  onChange={handleSupplierFieldChange}
                  placeholder={placeholder}
                  style={styles.searchInput}
                />
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: "2px" }}>
         <h3 style={{
  fontSize: "13px",
  color: "#244761",
  margin: "0 0 12px",
  textAlign: "left",
  fontWeight: 850,
  letterSpacing: "0.2px"
}}>
            PAYMENT & CONTRACT DETAILS
          </h3>

          <textarea
            name="paymentTerms"
            value={supplierForm.paymentTerms}
            onChange={handleSupplierFieldChange}
            placeholder="Payment terms"
            rows={2}
            style={{ ...styles.searchInput, resize: "vertical" }}
          />

          <textarea
            name="contractDetails"
            value={supplierForm.contractDetails}
            onChange={handleSupplierFieldChange}
            placeholder="Contract details / notes"
            rows={3}
            style={{ ...styles.searchInput, resize: "vertical", marginTop: "10px" }}
          />
        </section>

        {formError && (
          <div style={{
            padding: "10px",
            borderRadius: "7px",
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: "12px"
          }}>
            {formError}
          </div>
        )}

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          borderTop: "1px solid #e5eaf0",
          paddingTop: "15px"
        }}>
          <button
            type="button"
            onClick={closeSupplierEntry}
            style={{
              padding: "10px 17px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#475569",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: 700
            }}
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleSaveSupplier}
            disabled={savingSupplier}
            style={{
              padding: "10px 18px",
              border: "none",
              background: "#075985",
              color: "#ffffff",
              borderRadius: "7px",
              cursor: savingSupplier ? "not-allowed" : "pointer",
              fontWeight: 800
            }}
          >
            {savingSupplier ? "SAVING..." : isEditingSupplier ? "UPDATE SUPPLIER" : "SAVE SUPPLIER"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}




      {/* PAGE HEADER */}
      {supplierView === "details" ? (
        <div style={{
          ...styles.header,
          background: "linear-gradient(105deg, #B94F7B 0%, #A94F83 52%, #784C83 100%)",
          alignItems: "flex-start",
          textAlign: "left",
          padding: "12px 18px",
          marginBottom: "9px"
        }}>
          <button type="button" onClick={() => setSupplierView("category")}
            style={{ ...styles.backButton, marginBottom: "7px", padding: "7px 13px", fontSize: "11px", background: "#ffffff", color: "#71345f", border: "2px solid #ffffff", boxShadow: "0 2px 7px rgba(40,15,40,0.22)" }}>
            ← BACK TO {selectedCategory === "ALL" ? "ALL SUPPLIERS" : selectedCategory.toUpperCase()}
          </button>
          <h1 style={{ ...styles.title, fontSize: "19px", margin: "0 0 2px", textAlign: "left" }}>
            {selectedSupplier?.companyName || "SUPPLIER DETAILS"}
          </h1>
          <p style={{ ...styles.subtitle, margin: 0, textAlign: "left" }}>
            {selectedSupplier?.supplierId || "Supplier profile"}
          </p>
        </div>
      ) : supplierView === "directory" ? (
        <div style={styles.header}>
          <button type="button" style={styles.backButton} onClick={onBackToWorkspace}>
            ← BACK TO WORKSPACE
          </button>
          <h1 style={styles.title}>DMC / SUPPLIER MASTER</h1>
          <p style={styles.subtitle}>Manage supplier profiles, destination partners and service networks</p>
        </div>
      ) : (
        <div style={{
          ...styles.header,
          background: ({
            DMC: "linear-gradient(105deg, #C75A88 0%, #A94F83 55%, #784C83 100%)",
           
            "Transport Supplier": "linear-gradient(105deg, #55A987 0%, #378A6B 55%, #23664F 100%)",
            "Activity / Excursion Supplier": "linear-gradient(105deg, #9275C0 0%, #7656A6 55%, #563D83 100%)",
            Other: "linear-gradient(105deg, #C99A4D 0%, #AD7C32 55%, #80591F 100%)",
            ALL: "linear-gradient(105deg, #8798AA 0%, #65798E 55%, #46596D 100%)"
          })[selectedCategory] || "linear-gradient(105deg, #B94F7B 0%, #784C83 100%)",
          alignItems: "flex-start",
          textAlign: "left",
          padding: "11px 18px",
          marginBottom: "9px"
        }}>
          <button type="button"
            onClick={() => { setSupplierView("directory"); setSupplierSearch(""); }}
            style={{ ...styles.backButton, alignSelf: "flex-start", marginBottom: "5px", padding: "7px 13px", fontSize: "11px", background: "#ffffff", color: "#71345f", border: "2px solid #ffffff", boxShadow: "0 2px 7px rgba(40,15,40,0.22)" }}>
            ← BACK TO SUPPLIER DIRECTORY
          </button>
          <h1 style={{ ...styles.title, fontSize: "19px", margin: "0 0 2px", textAlign: "left" }}>
            {selectedCategory === "ALL" ? "ALL SUPPLIERS" :
              supplierCategories.find(item => item.key === selectedCategory)?.label?.toUpperCase() || selectedCategory.toUpperCase()}
          </h1>
          <p style={{ ...styles.subtitle, margin: 0, textAlign: "left" }}>
            Search and manage suppliers in this category
          </p>
        </div>
      )}

      {/* QUICK CATEGORY NAVIGATION — AVAILABLE ON EVERY SUPPLIER PAGE */}
      {supplierView === "details" && selectedSupplier && (
  <div style={{ ...styles.panel, padding: "18px", display: "grid", gap: "17px" }}>
    {getSupplierCategoryList(selectedSupplier).includes("dmc") && (
      <div style={{ display: "flex", justifyContent: "flex-end", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
        <button type="button" onClick={beginEditSupplier} style={{ padding: "9px 16px", border: "none", borderRadius: "7px", background: "linear-gradient(105deg, #B94F7B 0%, #784C83 100%)", color: "#ffffff", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>✎ EDIT DMC SUPPLIER</button>
      </div>
    )}
    <section>
      <h3 style={{ margin: "0 0 10px", color: "#07516B", fontSize: "13px", fontWeight: 850, textAlign: "left", borderBottom: "1px solid #dce6ed", paddingBottom: "8px" }}>DESTINATIONS & COVERAGE</h3>
      <div style={{ display: "grid", gap: "9px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "8px", background: "#f5f0f6", border: "1px solid #eaddea" }}>
          <strong style={{ fontSize: "11px", color: "#49334a" }}>Market Coverage:</strong>
          {(selectedSupplier.marketCoverage || []).map((item, i) => <span key={i} style={{ padding: "5px 11px", borderRadius: "999px", background: "#6b3d70", border: "1px solid #57305c", color: "#ffffff", fontSize: "11px", fontWeight: 800, boxShadow: "0 1px 3px rgba(45,20,50,0.16)" }}>{item}</span>)}
        </div>
        <div style={{ padding: "10px 12px", borderRadius: "8px", background: "#f5f0f6", border: "1px solid #eaddea" }}>
          <strong style={{ display: "block", textAlign: "left", color: "#111ee2", fontSize: "12px", fontWeight: 850, marginBottom: "8px" }}>Domestic State & Destinations</strong>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", rowGap: "8px" }}>
          {(selectedSupplier.domesticCoverage || []).map((item, i) => <div key={i} style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "6px", padding: "7px 12px 7px 0", marginRight: "12px", borderRight: i < (selectedSupplier.domesticCoverage || []).length - 1 ? "2px solid #c9b5cc" : "none" }}>
            <span style={{ padding: "5px 10px", borderRadius: "999px", background: "#dcecf4", color: "#174b63", border: "1px solid #b9d8e7", fontSize: "11px", fontWeight: 800 }}>{item.state}</span>
            {(Array.isArray(item.destinations) ? item.destinations : String(item.destinations || "").split(",").map(x => x.trim()).filter(Boolean)).map((destination, j) => <span key={j} style={{ padding: "5px 10px", borderRadius: "999px", background: "#ffffff", border: "1px solid #8b6a9a", color: "#49334f", fontSize: "11px", fontWeight: 700, boxShadow: "0 1px 2px rgba(40,20,50,0.08)" }}>{destination}</span>)}
          </div>)}
          </div>
        </div>
        <div style={{ padding: "10px 12px", borderRadius: "8px", background: "#f5f0f6", border: "1px solid #eaddea" }}>
          <strong style={{ display: "block", textAlign: "left", color: "#111ee2", fontSize: "12px", fontWeight: 850, marginBottom: "8px" }}>International Country & Destinations</strong>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", rowGap: "8px" }}>
          {(selectedSupplier.internationalCoverage || []).map((item, i) => <div key={i} style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "6px", padding: "7px 12px 7px 0", marginRight: "12px", borderRight: i < (selectedSupplier.internationalCoverage || []).length - 1 ? "2px solid #c9b5cc" : "none" }}>
            <span style={{ padding: "5px 10px", borderRadius: "999px", background: "#f8e8d7", color: "#75451c", border: "1px solid #e8c69f", fontSize: "11px", fontWeight: 800 }}>{item.country}</span>
            {(Array.isArray(item.destinations) ? item.destinations : String(item.destinations || "").split(",").map(x => x.trim()).filter(Boolean)).map((destination, j) => <span key={j} style={{ padding: "5px 10px", borderRadius: "999px", background: "#ffffff", border: "1px solid #8b6a9a", color: "#49334f", fontSize: "11px", fontWeight: 700, boxShadow: "0 1px 2px rgba(40,20,50,0.08)" }}>{destination}</span>)}
          </div>)}
          </div>
        </div>
      </div>
    </section>
    {[
      ["COMPANY INFORMATION", [["Supplier ID", selectedSupplier.supplierId], ["Company Name", selectedSupplier.companyName], ["Categories", Array.isArray(selectedSupplier.categories) ? selectedSupplier.categories.join(", ") : selectedSupplier.categories], ["Status", selectedSupplier.isActive ? "Active" : "Inactive"]]],
      ["CONTACT DETAILS", [["Contact Person", selectedSupplier.contactPerson], ["Mobile", selectedSupplier.mobile], ["Alternate Mobile", selectedSupplier.alternateMobile], ["Email", selectedSupplier.email], ["Website", selectedSupplier.website]]],
      ["SERVICES & SPECIALIZATION", [["Services Offered", selectedSupplier.services], ["Specializations", selectedSupplier.specializations]]],
      ["OFFICE ADDRESS", [["Address", selectedSupplier.officeAddress], ["City", selectedSupplier.city], ["State", selectedSupplier.state], ["Country", selectedSupplier.country]]],
      ["PAYMENT & CONTRACT", [["Payment Terms", selectedSupplier.paymentTerms], ["Contract Details / Notes", selectedSupplier.contractDetails]]]
    ].map(([sectionTitle, fields]) => (
      <section key={sectionTitle}>
        <h3 style={{ margin: "0 0 10px", color: "#07516B", fontSize: "13px", fontWeight: 850, textAlign: "left", borderBottom: "1px solid #dce6ed", paddingBottom: "8px" }}>{sectionTitle}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))", gap: "8px 10px" }}>
          {fields.map(([label, value]) => {
            const values = Array.isArray(value) ? value : [value];
            const normalized = values.flatMap(item => Array.isArray(item) ? item : [item]).filter(Boolean).flatMap(item => String(item).split(",").map(part => part.trim()).filter(Boolean));
            return (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "7px", padding: "9px 11px", borderRadius: "8px", background: "#f5f0f6", border: "1px solid #eaddea", minHeight: "38px", boxSizing: "border-box" }}>
                <span style={{ color: "#65445f", fontSize: "11px", fontWeight: 800, flex: "0 0 auto" }}>{label}</span>
                <span style={{ color: "#8a6b83", fontSize: "12px", fontWeight: 800 }}>:</span>
                <span style={{ display: "flex", flexWrap: "wrap", gap: "4px", color: "#172b3d", fontSize: "12px", fontWeight: 650, overflowWrap: "anywhere" }}>
                  {normalized.length ? normalized.map((item, chipIndex) => <span key={`${label}-${chipIndex}`} style={{ display: "inline-block", padding: "3px 7px", borderRadius: "999px", background: "#eadce9", border: "1px solid #dbc8d9", color: "#49334a", fontSize: "11px", lineHeight: 1.4 }}>{item}</span>) : <span>—</span>}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    ))}
  </div>
)}

{supplierView === "category" && (
        <div style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "6px",
          padding: "7px 10px",
          marginBottom: "8px",
          background: "#ffffff",
          border: "1px solid #dce4ec",
          borderRadius: "10px",
          boxShadow: "0 2px 7px rgba(15,45,75,0.04)"
        }}>
          {[
            { key: "DMC", label: "DMC", color: "#C75A88", soft: "#F7EAF0" },
            
            { key: "Transport Supplier", label: "Transport", color: "#378A6B", soft: "#EDF6F1" },
            { key: "Activity / Excursion Supplier", label: "Activities", color: "#7656A6", soft: "#F1EDF8" },
            { key: "Other", label: "Other", color: "#AD7C32", soft: "#FAF4E8" },
            { key: "ALL", label: "All Suppliers", color: "#65798E", soft: "#F0F3F6" }
          ].map(category => {
            const active = selectedCategory === category.key;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(category.key);
                  setSupplierSearch("");
                  setDmcPage("suppliers");
                }}
                style={{
                  border: active ? `1px solid ${category.color}` : "1px solid #dce4ec",
                  background: active ? category.soft : "#ffffff",
                  color: active ? category.color : "#526273",
                  borderRadius: "20px",
                  padding: "5px 10px",
                  fontSize: "10px",
                  fontWeight: active ? 850 : 700,
                  cursor: "pointer",
                  boxShadow: active ? `inset 0 -2px 0 ${category.color}` : "none",
                  transition: "all 0.15s ease"
                }}
              >
                {category.label}
                {category.key !== "ALL" && (
                  <span style={{ marginLeft: "6px", opacity: 0.78 }}>
                    {categoryCounts[category.key] || 0}
                  </span>
                )}
                {category.key === "ALL" && (
                  <span style={{ marginLeft: "6px", opacity: 0.78 }}>
                    {suppliers.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* SUPPLIER OVERVIEW — DIRECTORY ONLY */}
      {supplierView === "directory" && (
      <div style={styles.statsGrid}>
        <div style={styles.panel}>
          <div style={styles.statLabel}>TOTAL SUPPLIERS</div>
          <div style={styles.statValue}>{suppliers.length}</div>
        </div>

        <div style={styles.panel}>
          <div style={styles.statLabel}>ACTIVE SUPPLIERS</div>
          <div style={{ ...styles.statValue, color: "#16845b" }}>
            {activeCount}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.statLabel}>INACTIVE SUPPLIERS</div>
          <div style={{ ...styles.statValue, color: "#b45309" }}>
            {inactiveCount}
          </div>
        </div>
      </div>
      )}



      


{/* SUPPLIER DIRECTORY */}
<div style={styles.panel}>
  {supplierView === "directory" && (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  }}>
    <div>
      <h2 style={styles.sectionHeading}>
        SUPPLIER DIRECTORY
      </h2>
      <div style={{
        fontSize: "11px",
        color: "#64748b",
        marginTop: "4px"
      }}>
        Search and manage registered suppliers
      </div>
    </div>

    <button
      type="button"
      onClick={openNewSupplierEntry}
      style={{
        padding: "10px 16px",
        border: "none",
        borderRadius: "8px",
        background: "linear-gradient(105deg, #B94F7B, #784C83)",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 3px 8px rgba(120, 76, 131, 0.18)"
      }}
    >
      + ADD SUPPLIER
    </button>
  </div>
  )}






{/* SUPPLIER CATEGORY QUICK ACCESS */}
{supplierView === "directory" && (
<div style={styles.categoryGrid}>
  {[
    {
      key: "DMC",
      label: "DMC",
      gradient: "linear-gradient(180deg, #E7A2BD 0%, #F7EAF0 100%)"
    },
    
    {
      key: "Transport Supplier",
      label: "Transport",
      gradient: "linear-gradient(180deg, #9BCDB7 0%, #EDF6F1 100%)"
    },
    {
      key: "Activity / Excursion Supplier",
      label: "Activities",
      gradient: "linear-gradient(180deg, #B8A5D9 0%, #F1EDF8 100%)"
    },
    {
      key: "Other",
      label: "Other",
      gradient: "linear-gradient(180deg, #E5C58D 0%, #FAF4E8 100%)"
    },
    {
      key: "ALL",
      label: "All Suppliers",
      gradient: "linear-gradient(180deg, #AEBBCB 0%, #F0F3F6 100%)"
    }
  ].map(category => {
    const count = category.key === "ALL"
      ? suppliers.length
      : categoryCounts[category.key] || 0;

    const selected = selectedCategory === category.key;

    return (
      <button
        key={category.key}
        type="button"
        onClick={() => {
          setSelectedCategory(category.key);
          setSupplierSearch("");
          setSupplierView("category");
        }}
        style={{
          ...styles.categoryCard,
          background: category.gradient,
          border: selected
            ? "2px solid #A94F83"
            : "1px solid #dce4ec",
          boxShadow: selected
            ? "0 3px 10px rgba(169,79,131,0.15)"
            : "0 2px 6px rgba(15,45,75,0.04)"
        }}
      >
        <div style={styles.categoryCount}>{count}</div>
        <div style={styles.categoryLabel}>{category.label}</div>
      </button>
    );
  })}
</div>
)}

{supplierView === "category" && selectedCategory === "DMC" && (
  <div style={{ marginTop: "12px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px", flexWrap: "wrap", padding: "10px 12px", background: "#fff", border: "1px solid #ead5e2", borderRadius: "11px", boxShadow: "0 2px 8px rgba(120,76,131,.05)" }}>
    
    <button type="button" onClick={() => { setDmcPage("suppliers"); setDirectQueryDMC(null); }} 
    style={{
  border: "1px solid #07516B",
  background: dmcPage === "suppliers" ? "#07516B" : "#315F9B",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "9px 17px",
  fontSize: "11px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: dmcPage === "suppliers"
    ? "0 3px 7px rgba(7,81,107,.25)"
    : "0 2px 5px rgba(49,95,155,.18)"
}}
>DMC SUPPLIERS
</button>

    <button type="button" onClick={() => { setDirectQueryDMC(null); setDmcPage("query"); }} 
    style={{
  border: "1px solid #315F9B",
  background: dmcPage === "query" ? "#07516B" : "#315F9B",
  color: "#FFFFFF",
  borderRadius: "999px",
  padding: "9px 17px",
  fontSize: "11px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: dmcPage === "query"
    ? "0 3px 7px rgba(7,81,107,.25)"
    : "0 2px 5px rgba(49,95,155,.18)"
}}
    >
      DMC QUERY
      </button>
  </div>
)}

{supplierView === "category" && selectedCategory === "DMC" && dmcPage === "query" && (
  <DMCQuery
    initialSelectedDMC={directQueryDMC}
    currentUser={currentUser}
    userProfile={userProfile}
    onBackToWorkspace={() => {
      setDmcPage("suppliers");
      setDirectQueryDMC(null);
    }}
  />
)}


{supplierView === "category" && selectedCategory === "DMC" && dmcPage === "history" && historyDMC && (
  <DMCEnquiryHistory
  supplier={historyDMC}
  currentUser={currentUser}
  userProfile={userProfile}
  onBack={() => {
    setDmcPage("suppliers");
    setHistoryDMC(null);
  }}
/>
)}




{supplierView === "category" && (
  <>
  {!(selectedCategory === "DMC" && dmcPage === "query") && <div style={{ marginTop: "15px" }}>
   <input
  type="search"
  value={supplierSearch}
  onChange={(e) => setSupplierSearch(e.target.value)}
  placeholder={
    selectedCategory === "ALL"
      ? "Search all suppliers by ID, company name or contact..."
      : `Search ${selectedCategory} suppliers by ID, company name or contact...`
  }
  style={styles.searchInput}
/>
  </div>}



 
{!(selectedCategory === "DMC" && dmcPage === "query") && <>
{loading ? (
          <div style={styles.empty}>Loading supplier records...</div>
        ) : error ? (
          <div style={{
            ...styles.empty,
            color: "#b91c1c"
          }}>
            {error}
          </div>
       
) : filteredSuppliers.length === 0 ? (
  <div style={styles.empty}>
    <div style={{
      fontSize: "14px",
      fontWeight: 800,
      color: "#31566e",
      marginBottom: "5px"
    }}>
      {supplierSearch.trim()
        ? "No matching suppliers found"
        : selectedCategory === "ALL"
          ? "No suppliers registered yet"
          : `No ${selectedCategory} suppliers registered yet`}
    </div>

    {supplierSearch.trim()
      ? "Try changing your search keywords."
      : "Supplier records will appear here when registered in this category."}
  </div>
) : (

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  
<th style={{
  ...styles.th,
  width: selectedCategory === "DMC" ? "12%" : "14%",
  borderRadius: "6px 0 0 6px"
}}>
  SUPPLIER ID
</th>

<th style={{ ...styles.th, width: selectedCategory === "DMC" ? "20%" : "24%" }}>
  COMPANY NAME
</th>

<th style={{ ...styles.th, width: selectedCategory === "DMC" ? "19%" : "24%" }}>
  SUPPLIER DETAILS
</th>

<th style={{ ...styles.th, width: selectedCategory === "DMC" ? "17%" : "23%" }}>
  CONTACT
</th>

<th style={{
  ...styles.th,
  width: selectedCategory === "DMC" ? "14%" : "15%",
  borderRight: selectedCategory === "DMC" ? "1px solid rgba(255,255,255,0.18)" : "none",
  borderRadius: selectedCategory === "DMC" ? "0" : "0 6px 6px 0"
}}>
  STATUS
</th>

{selectedCategory === "DMC" && (
  <th style={{ ...styles.th, width: "18%", borderRadius: "0 6px 6px 0" }}>
    ACTION
  </th>
)}

                </tr>
              </thead>

              <tbody>
               {filteredSuppliers.map((supplier, index) => (
                  <tr
  key={supplier.id}
  style={{ ...(index % 2 === 0 ? styles.rowEven : styles.rowOdd), cursor: "pointer" }}
  onClick={() => {
    setSelectedSupplier(supplier);
    setSupplierView("details");
  }}
  title="View supplier details"
>
                    <td style={styles.td}>
                      <strong>{supplier.supplierId}</strong>
                    </td>
                    <td style={styles.td}>
                      {supplier.companyName}
                    </td>
                    <td style={styles.td}>
                      {[
                        ...(Array.isArray(supplier.services) ? supplier.services : supplier.services ? [supplier.services] : []),
                        ...(Array.isArray(supplier.specializations) ? supplier.specializations : supplier.specializations ? [supplier.specializations] : []),
                        ...(Array.isArray(supplier.domesticCoverage) ? supplier.domesticCoverage.flatMap(item => item.destinations || []) : []),
                        ...(Array.isArray(supplier.internationalCoverage) ? supplier.internationalCoverage.flatMap(item => item.destinations || []) : [])
                      ].slice(0, 3).join(", ") || "—"}
                    </td>
                    <td style={styles.td}>
                      {supplier.mobile || supplier.email || "—"}
                    </td>
                    <td style={styles.td}>
                      {supplier.isActive ? "Active" : "Inactive"}
                    </td>
{selectedCategory === "DMC" && (
  <td style={{ ...styles.td, textAlign: "center", whiteSpace: "nowrap" }}>
    <div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  flexWrap: "nowrap",
  whiteSpace: "nowrap",
  width: "100%"
}}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setDirectQueryDMC(supplier);
          setDmcPage("query");
        }}
        style={{
          border: "1px solid #9bc9d3",
          background: "#eaf6f8",
          color: "#07516B",
          borderRadius: "6px",
          padding: "5px 6px",
fontSize: "9px",
          fontWeight: 800,
          cursor: "pointer"
        }}
        title={`Prepare an enquiry for ${supplier.companyName}`}
      >
        QUERY
      </button>


      <button
  type="button"
  onClick={(event) => {
    event.stopPropagation();
    setHistoryDMC(supplier);
    setDmcPage("history");
  }}
  style={{
    border: "1px solid #c8b4d2",
    background: "#f5eff8",
    color: "#784C83",
    borderRadius: "6px",
    padding: "5px 6px",
fontSize: "9px",
    fontWeight: 800,
    cursor: "pointer"
  }}
  title={`View enquiry history for ${supplier.companyName}`}
>
  HISTORY
</button>



      {isAdmin && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleDeleteSupplier(supplier);
          }}
          style={{
            border: "1px solid #e2a5b0",
            background: "#fff1f3",
            color: "#b4233c",
            borderRadius: "6px",
            padding: "5px 6px",
fontSize: "9px",
            fontWeight: 800,
            cursor: "pointer"
          }}
          title={`Delete ${supplier.companyName}`}
        >
          DELETE
        </button>
      )}
    </div>
  </td>
)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
</>}
  </>
)}

    </div>
    </div>
  );
}
