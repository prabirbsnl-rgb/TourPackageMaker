



import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";



import { db } from "../firebase";

const SERVICE_CATALOGUE_COLLECTION = "serviceCatalogue";

const CUSTOMER_DETAILS_SETTINGS_COLLECTION = "serviceSettings";
const CUSTOMER_DETAILS_SETTINGS_DOC = "customerDetailsFields";





// Get all service definitions.
export async function getAllServices() {
    const servicesRef = collection(
        db,
        SERVICE_CATALOGUE_COLLECTION
    );

    const servicesQuery = query(
        servicesRef,
        orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(servicesQuery);

    return snapshot.docs.map(docSnap => ({
        ...docSnap.data(),
        id: docSnap.id
    }));
}

// Get only active services for transaction entry.
export async function getActiveServices() {
    const services = await getAllServices();

    return services.filter(
        service => service.isActive === true
    );
}

// Add a new service definition.
export async function createServiceDefinition(serviceData) {
    if (!serviceData.serviceKey) {
        throw new Error("Service key is required.");
    }

    if (!serviceData.serviceName) {
        throw new Error("Service name is required.");
    }

    const serviceKey = serviceData.serviceKey.trim();

    const serviceName = serviceData.serviceName.trim();

    if (!serviceKey || !serviceName) {
        throw new Error("Service key and name cannot be empty.");
    }

    const existingServices = await getAllServices();

    const duplicate = existingServices.some(
        service =>
            service.serviceKey?.toLowerCase() ===
            serviceKey.toLowerCase()
    );

    if (duplicate) {
        throw new Error("This service key already exists.");
    }

    const docRef = await addDoc(
        collection(db, SERVICE_CATALOGUE_COLLECTION),
        {
            ...serviceData,
            serviceKey,
            serviceName,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }
    );

    return {
        ...serviceData,
        id: docRef.id,
        serviceKey,
        serviceName,
        isActive: true
    };
}

// Update an existing service definition.
export async function updateServiceDefinition(
    firestoreId,
    updates
) {
    if (!firestoreId) {
        throw new Error("Service document ID is required.");
    }

    const {
        id,
        serviceKey,
        createdAt,
        ...safeUpdates
    } = updates;

    if (
        safeUpdates.serviceName !== undefined &&
        (
            typeof safeUpdates.serviceName !== "string" ||
            !safeUpdates.serviceName.trim()
        )
    ) {
        throw new Error("Service name cannot be empty.");
    }

    await updateDoc(
        doc(db, SERVICE_CATALOGUE_COLLECTION, firestoreId),
        {
            ...safeUpdates,
            updatedAt: serverTimestamp()
        }
    );
}

// Activate or deactivate a service.
export async function setServiceActiveStatus(
    firestoreId,
    isActive
) {
    if (!firestoreId) {
        throw new Error("Service document ID is required.");
    }

    if (typeof isActive !== "boolean") {
        throw new Error("A valid service status is required.");
    }

    await updateDoc(
        doc(db, SERVICE_CATALOGUE_COLLECTION, firestoreId),
        {
            isActive,
            updatedAt: serverTimestamp()
        }
    );
}

// Get globally configured optional customer details fields.
export async function getCustomerDetailsFields() {
    const settingsRef = doc(
        db,
        CUSTOMER_DETAILS_SETTINGS_COLLECTION,
        CUSTOMER_DETAILS_SETTINGS_DOC
    );

    const snapshot = await getDoc(settingsRef);

    if (!snapshot.exists()) {
        return [];
    }

    return snapshot.data().fields || [];
}


// Save globally configured optional customer details fields.
export async function saveCustomerDetailsFields(fields) {
    if (!Array.isArray(fields)) {
        throw new Error("Customer details fields must be an array.");
    }

    await setDoc(
        doc(
            db,
            CUSTOMER_DETAILS_SETTINGS_COLLECTION,
            CUSTOMER_DETAILS_SETTINGS_DOC
        ),
        {
            fields,
            updatedAt: serverTimestamp()
        }
    );

    return fields;
}