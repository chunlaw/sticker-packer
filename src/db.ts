// db.ts

let db: IDBDatabase;
let version = 1;
const storeName = 'sticker-packer'

export enum Stores {
  Packs = 'packs',
  Stickers = 'stickers',
}

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // open the connection
    const request = indexedDB.open(storeName);

    request.onupgradeneeded = () => {
      db = request.result;

      // if the data object store doesn't exist, create it
      if (!db.objectStoreNames.contains(Stores.Packs)) {
        console.log('Creating packs store');
        db.createObjectStore(Stores.Packs, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(Stores.Stickers)) {
        console.log('Creating stickers store');
        db.createObjectStore(Stores.Stickers, { keyPath: 'id' });
      }
      // no need to resolve here
    };

    request.onsuccess = () => {
      db = request.result;
      version = db.version;
      resolve(true);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};

export const saveData = <T>(objectStoreName: Stores, data: T): Promise<T|string|null> => {
  return new Promise(resolve => {
    const request = indexedDB.open(storeName, version)
    
    request.onsuccess = () => {
      db = request.result;
      const tx = db.transaction(objectStoreName, 'readwrite');
      const store = tx.objectStore(objectStoreName);
      store.put(data);
      resolve(data);
    }

    request.onerror = () => {
      const error = request.error?.message
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  })
}

export const getStoreData = <T>(objectStoreName: Stores, id: string ): Promise<T> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(storeName);

    request.onsuccess = () => {
      db = request.result;
      const tx = db.transaction(objectStoreName, 'readonly');
      const store = tx.objectStore(objectStoreName);
      const res = store.get(id);
      res.onsuccess = () => {
        if ( res.result === undefined ) {
          reject();
        }
        resolve(res.result);
      };
      res.onerror = () => {
        reject();
      }
    };
  });
};

export const getStore = <T>(objectStoreName: Stores): Promise<T[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(storeName);

    request.onsuccess = () => {
      db = request.result;
      const tx = db.transaction(objectStoreName, 'readonly');
      const store = tx.objectStore(objectStoreName);
      const res = store.getAll();
      res.onsuccess = () => {
        resolve(res.result);
      };
    };
  });
};

export const removeStoreData = (objectStoreName: Stores, id: string ): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(storeName);

    request.onsuccess = () => {
      db = request.result;
      const tx = db.transaction(objectStoreName, 'readonly');
      const store = tx.objectStore(objectStoreName);
      const res = store.delete(id);
      res.onsuccess = () => {
        if ( res.result === undefined ) {
          resolve();
        }
        reject();
      };
      res.onerror = () => {
        reject();
      }
    };
  });
};