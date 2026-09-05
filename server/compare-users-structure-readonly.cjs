const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI
  || process.env.MONGO_URI
  || 'mongodb://127.0.0.1:27017/crm';

(async () => {
  const local = JSON.parse(fs.readFileSync('local-users-structure.json', 'utf8'));

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  const users = await db.collection('users').find({}).toArray();

  const serverFieldSet = new Set();
  users.forEach(u => Object.keys(u).forEach(k => serverFieldSet.add(k)));

  const serverFields = Array.from(serverFieldSet).sort();
  const localFields = local.fields || [];

  console.log('READ ONLY - NO UPDATE DONE');
  console.log(`Local users count: ${local.count}`);
  console.log(`Server database: ${db.databaseName}`);
  console.log(`Server users count: ${users.length}`);

  console.log('\nFields missing on server:');
  console.log(localFields.filter(f => !serverFieldSet.has(f)));

  console.log('\nExtra fields on server:');
  console.log(serverFields.filter(f => !localFields.includes(f)));

  console.log('\nServer users owner-code check:');
  users
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
    .forEach(u => {
      console.log({
        name: u.name || '',
        username: u.username || '',
        email: u.email || '',
        ownerCode: u.ownerCode || '',
        owner_code: u.owner_code || '',
        accountOwnerCode: u.accountOwnerCode || '',
        employeeId: u.employeeId || '',
        legacyId: u.legacyId || ''
      });
    });

  await client.close();
})();
