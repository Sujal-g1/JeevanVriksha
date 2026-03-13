import db from "../db/offlineDB";

export const cacheMedicineStock = async (stockData) => {

  await db.medicineStock.clear();

  for (const item of stockData) {

    await db.medicineStock.put({
      medicineId: item.medicineId._id,
      name: item.medicineId.name,
      quantity: item.quantity
    });

  }

};

export const getCachedMedicineStock = async () => {

  return await db.medicineStock.toArray();

};