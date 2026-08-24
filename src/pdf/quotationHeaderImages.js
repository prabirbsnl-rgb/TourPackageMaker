

// =========================================================
// PDF QUOTATION HEADER IMAGES
//
// Separate from the Tour Package Maker destinationImages.
// These images are selected specifically for PDF header
// background use and can be changed independently later.
// =========================================================

export const quotationHeaderImages = {

  // -------------------------
  // DOMESTIC
  // -------------------------

  Kerala:
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1600&q=75",

  Kashmir:
    "https://images.unsplash.com/photo-1614591276564-7b3e69347a48?auto=format&fit=crop&w=1600&q=75",

  Meghalaya:
    "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1600&q=75",

  Goa:
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=75",

  Andaman:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=75",

  Ladakh:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=75",

  "Leh Ladakh via Kashmir":
    "/leh-ladakh.png",

  Sikkim:
    "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=1600&q=75",

  Rajasthan:
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=75",

    Arunachal:
  "https://images.unsplash.com/photo-1650790383072-6a4a4f7e7c5c?auto=format&fit=crop&w=1600&q=75",

  // -------------------------
  // INTERNATIONAL
  // -------------------------

  Singapore:
    "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?auto=format&fit=crop&w=1600&q=75",

  Malaysia:
    "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=75",

  Thailand:
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1600&q=75",

  Dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=75",

  Bali:
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=75",

  "Sri Lanka":
    "https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=1600&q=75",

  Maldives:
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1600&auto=format&fit=crop",

  Vietnam:
    "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1600&q=75"
};


// =========================================================
// FALLBACK
// Used when destination does not have a dedicated image.
// =========================================================

export const quotationHeaderFallback =
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=70";


  export function getQuotationHeaderImage(quoteData) {

  const customDestination =
    String(
      quoteData?.customDestination || ""
    ).trim();

  const destination =
    String(
      quoteData?.destination || ""
    ).trim();

  // Custom destination gets priority
  if (
    customDestination &&
    quotationHeaderImages[customDestination]
  ) {
    return quotationHeaderImages[
      customDestination
    ];
  }

  // Standard destination
  if (
    destination &&
    quotationHeaderImages[destination]
  ) {
    return quotationHeaderImages[
      destination
    ];
  }

  // Generic fallback
  return quotationHeaderFallback;
}