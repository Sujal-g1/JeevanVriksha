import Dexie from "dexie";

export const db = new Dexie("JeevanVrikshaQueueDB");

        db.version(1).stores({
        queue: "++id,type,endpoint,payload,synced,createdAt",
        patients: "++id,_id,name,phone,village"
        });


export default db;