import Dexie from 'dexie';

const db = new Dexie('ReactSampleDB');
db.version(1).stores({ quantities: '&id,productName' });

export default db;