const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI
  || process.env.MONGO_URI
  || 'mongodb://127.0.0.1:27017/crm';

(async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db();
    const users = await db.collection('users')
      .find({})
      .project({
        password: 0,
        passwordHash: 0,
        resetToken: 0,
        token: 0,
      })
      .sort({ name: 1, username: 1 })
      .toArray();

    console.log(`Database: ${db.databaseName}`);
    console.log(`Users count: ${users.length}`);
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Read users failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
})();
