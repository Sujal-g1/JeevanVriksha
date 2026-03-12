import db from "../db/offlineDB";
const API = import.meta.env.VITE_API_URL;

export const syncVitals = async () => {

  const unsynced = await db.vitals
    .where("synced")
    .equals(false)
    .toArray();

  for (const record of unsynced) {

    try {

      await fetch(`${API}/api/vitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(record)
      });

      await db.vitals.update(record.id, { synced: true });

    } catch (err) {

      console.log("Still offline");

    }

  }

};