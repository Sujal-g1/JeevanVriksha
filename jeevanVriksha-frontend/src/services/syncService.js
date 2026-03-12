import db from "../db/offlineDB";

export const syncVitals = async () => {

  const unsynced = await db.vitals
    .where("synced")
    .equals(false)
    .toArray();

  for (const record of unsynced) {

    try {

      await fetch("http://localhost:5001/api/vitals", {
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