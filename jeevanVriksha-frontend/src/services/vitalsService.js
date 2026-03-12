import db from "../db/offlineDB";

export const syncVitals = async () => {

  const allVitals = await db.vitals.toArray();

  const unsynced = allVitals.filter(v => v.synced === false);

  const user = JSON.parse(localStorage.getItem("user"));

  for (const record of unsynced) {

    try {

      const res = await fetch("http://localhost:5001/api/vitals/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(record)
      });

      if (res.ok) {
        await db.vitals.update(record.id, { synced: true });
        console.log("Vitals synced:", record);
      }

    } catch (err) {
      console.log("Still offline");
    }

  }

};