import db from "../db/offlineQueueDB";

export const saveMedicineOffline = async (payload) => {

  await db.queue.add({
    type: "medicine-distribute",
    endpoint: "/api/medicine/distribute",
    payload: payload,
    synced: false,
    createdAt: new Date()
  });

  console.log("Medicine distribution saved offline");

};