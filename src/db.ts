import Dexie from 'dexie';

const db = new Dexie('ReactSampleDB');
db.version(1).stores({ quantities: '&id,productName,isSynced' });

export default db;