import Dexie from "dexie";

export const db = new Dexie("JeevanVrikshaDB");

db.version(1).stores({
  vitals: "++id, patientId, synced",
  patients: "++id, phone, synced",

  medicineStock: "medicineId,name,quantity"
});

export default db;