import db from "../db/offlineQueueDB";

const API = import.meta.env.VITE_API_URL;

let isSyncing = false;

export const syncMedicineQueue = async () => {

  if (isSyncing) {
    console.log("Sync already running");
    return;
  }

  isSyncing = true;

  try {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      console.log("No user logged in");
      isSyncing = false;
      return;
    }

    const unsyncedItems = await db.queue
      .where("synced")
      .equals(false)
      .toArray();

    for (const item of unsyncedItems) {

      try {

        const res = await fetch(`${API}${item.endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(item.payload)
        });

        if (res.ok) {

          await db.queue.update(item.id, { synced: true });

          console.log("Synced item:", item.id);

        }

      } catch (err) {

        console.log("Sync failed for item:", item.id);

      }

    }

  } catch (err) {

    console.log("Queue sync error:", err);

  }

  isSyncing = false;

};