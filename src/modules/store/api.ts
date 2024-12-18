import Papa from "papaparse";

import {Store as IStore, STORE, CsvStore} from "./";

function convertCsvStoreToStore(csvStore: CsvStore): IStore {
  return {
    name: csvStore.nombre,
    description: csvStore.descripcion,
    logo: csvStore.logo,
    banner: csvStore.banner,
    instagram: csvStore.instagram,
    whatsapp: "https://wa.me/" + csvStore.celular,
    phone: csvStore.celular,
    location: csvStore.ubicacion,
    shipping: Number(csvStore.envio),
    shippingType: csvStore["opciones-envio"].split(",").map((item) => item.trim()),
  };
}

export default {
  fetch: async (): Promise<IStore> => {
    const storeUrl = process.env.NEXT_PUBLIC_STORE;

    if (!storeUrl) {
      throw new Error("STORE environment variable is not defined");
    }

    return fetch(storeUrl, {next: {tags: ["store"]}}).then(async (response) => {
      const csv = await response.text();

      return new Promise<IStore>((resolve, reject) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            const csvStore = results.data[0] as CsvStore; // Utilizamos el tipo CsvStore
            const store = convertCsvStoreToStore(csvStore); // Convertimos a IStore

            resolve(store); // Retornamos el objeto convertido a IStore
          },
          error: (error: Error) => {
            reject(error.message);
          },
        });
      });
    });
  },
  mock: {
    fetch: (): Promise<IStore> => {
      return Promise.resolve(STORE);
    },
  },
};
