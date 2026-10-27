
import { saveMedicineOffline } from "./offlineMedicine";
import db from "../db/offlineDB";

const API = import.meta.env.VITE_API_URL;

const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user.token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  return user.token;
};

export const getMyMedicineStock = async () => {
  const token = getToken();

  const response = await fetch(`${API}/api/medicine/my-stock`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch medicine stock");
  }

  return Array.isArray(data) ? data : [];
};

export const cacheMedicineStock = async (stockData) => {
  await db.medicineStock.clear();

  for (const item of stockData) {
    const medicine = item.medicineId;

    await db.medicineStock.put({
      medicineId:
        typeof medicine === "object" ? medicine?._id : medicine,
      name:
        typeof medicine === "object" ? medicine?.name : "Medicine",
      dosage:
        typeof medicine === "object" ? medicine?.dosage : "",
      quantity: item.quantity ?? 0,
    });
  }
};

export const getCachedMedicineStock = async () => {
  return db.medicineStock.toArray();
};

export const distributeMedicine = async (payload) => {
  if (!navigator.onLine) {
    await saveMedicineOffline(payload);
    return { offline: true };
  }

  const token = getToken();

  const response = await fetch(`${API}/api/medicine/distribute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to distribute medicine");
  }

  return data;
};
