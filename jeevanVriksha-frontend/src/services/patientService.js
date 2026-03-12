import db from "../db/offlineDB";

const API = import.meta.env.VITE_API_URL;

export const savePatient = async (patientData) => {

  if (navigator.onLine) {

    try {

      await fetch(`${API}/api/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(patientData)
      });

      return { status: "online_saved" };

    } catch (error) {

      await db.patients.add({
        ...patientData,
        synced: false
      });

      return { status: "offline_saved" };

    }

  } else {

    await db.patients.add({
      ...patientData,
      synced: false
    });

    return { status: "offline_saved" };

  }

};