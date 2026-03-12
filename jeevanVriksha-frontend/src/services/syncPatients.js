import db from "../db/offlineDB";

const API = import.meta.env.VITE_API_URL;

export const syncPatients = async () => {

  const all = await db.patients.toArray();

const unsynced = all.filter(p => p.synced === false);

  for (const patient of unsynced) {

    try {

      await fetch(`${API}/api/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(patient)
      });

      await db.patients.update(patient.id, { synced: true });

    } catch (error) {

      console.log("Still offline");

    }

  }

};