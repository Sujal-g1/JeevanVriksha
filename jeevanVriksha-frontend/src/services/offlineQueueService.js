import db from "../db/offlineQueueDB";

export const addToQueue = async (type, endpoint, payload) => {

  try {

    const record = {
      type,
      endpoint,
      payload,
      synced: false,
      createdAt: new Date()
    };

    await db.queue.add(record);

    console.log("Saved to offline queue:", record);

  } catch (error) {

    console.error("Queue save failed:", error);

  }

};