import db from "../db/offlineDB";

export const savePatient = async (patientData) => {

  if (navigator.onLine) {

    try {

      await fetch("http://localhost:5001/api/patients", {
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