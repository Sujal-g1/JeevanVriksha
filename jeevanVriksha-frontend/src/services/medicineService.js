import { saveMedicineOffline } from "./offlineMedicine";

const API = import.meta.env.VITE_API_URL;

export const distributeMedicine = async (payload) => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!navigator.onLine) {

    await saveMedicineOffline(payload);

    alert("Saved offline. Will sync when internet returns.");

    return;
  }

  await fetch(`${API}/api/medicine/distribute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`
    },
    body: JSON.stringify(payload)
  });

};