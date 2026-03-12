import db from "../db/offlineDB";

export const syncPatients = async () => {

  const all = await db.patients.toArray();

const unsynced = all.filter(p => p.synced === false);

  for (const patient of unsynced) {

    try {

      await fetch("http://localhost:5001/api/patients", {
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