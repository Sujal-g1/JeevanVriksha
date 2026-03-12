import db from "../db/offlineQueueDB";

// SAVE patients to IndexedDB
export const cachePatients = async (patients) => {

  try {

    await db.patients.clear();

    await db.patients.bulkAdd(patients);

  } catch (error) {

    console.error("Cache save failed:", error);

  }

};


// LOAD patients from IndexedDB
export const getCachedPatients = async () => {

  try {

    const patients = await db.patients.toArray();

    return patients;

  } catch (error) {

    console.error("Cache read failed:", error);

    return [];

  }

};

export const cachePatientProfile = async (profile) => {

  try {

    await db.patients.put(profile);

  } catch (error) {

    console.error("Profile cache failed:", error);

  }

};

// CACHE PATIENT PROFILE
export const getCachedPatientProfile = async (id) => {

  try {

    const patient = await db.patients
      .where("_id")
      .equals(id)
      .first();

    return patient;

  } catch (error) {

    console.error("Profile cache read failed:", error);

    return null;

  }

};