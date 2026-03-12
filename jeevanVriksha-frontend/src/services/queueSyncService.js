import db from "../db/offlineQueueDB";

export const syncQueue = async () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const items = await db.queue.toArray();
  const unsynced = items.filter(i => i.synced === false);

  for (const item of unsynced) {

    try {

      const res = await fetch(`http://localhost:5001${item.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(item.payload)
      });

      // Only mark synced if server accepted it
      if (res.ok) {

        await db.queue.update(item.id, { synced: true });

        console.log("Synced item:", item);

      } else {

        console.log("Server rejected item:", await res.text());

      }

    } catch (err) {

      console.log("Still offline");

    }

  }

};