const fs = require('fs');
const { MongoClient } = require('mongodb');


const lumosEmails = new Set([
  'demotest@gmail.com',
  'kuldeepnayi@gmail.com',
  'memariyavishal99@gmail.com',
]);

function getCompanyBucket(user) {
  const email = String(user.email || '').trim().toLowerCase();

  if (lumosEmails.has(email)) {
    return 'lumos';
  }

  const text = [
    user.company,
    user.companyName,
    user.email,
    user.username,
  ].filter(Boolean).join(' ').toLowerCase();

  if (text.includes('lumos') || text.includes('lumossolution.com')) return 'lumos';
  if (text.includes('swati') || text.includes('swatiswitchgears.com')) return 'swati';

  return 'swati';
}

const APPLY = process.argv.includes('--apply');
const uri = process.env.MONGODB_URI
  || process.env.MONGO_URI
  || 'mongodb://127.0.0.1:27017/crm';

const normEmail = (v) => String(v || '').trim().toLowerCase();

const codeOf = (u = {}) => String(
  u.ownerCode
  || u.owner_code
  || u.accountOwnerCode
  || u.employeeId
  || ''
).trim();

(async () => {
  const local = JSON.parse(fs.readFileSync('local-users-structure.json', 'utf8'));
  const localUsers = Array.isArray(local.sampleUsers) ? local.sampleUsers : [];

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  const users = db.collection('users');
  const serverUsers = await users.find({}).toArray();

  const serverByEmail = new Map();
  const existingCodeOwner = new Map();

  for (const user of serverUsers) {
    const email = normEmail(user.email);
    if (email) serverByEmail.set(email, user);

    const code = codeOf(user);
    if (code) existingCodeOwner.set(code, user);
  }

  const updates = [];
  const skippedNoEmail = [];
  const skippedNoLocalCode = [];
  const skippedEmailNotFound = [];
  const skippedSameCode = [];
  const conflicts = [];

  for (const localUser of localUsers) {
    const email = normEmail(localUser.email);
    const localCode = codeOf(localUser);

    if (!email) {
      skippedNoEmail.push(localUser);
      continue;
    }

    if (!localCode) {
      skippedNoLocalCode.push(localUser);
      continue;
    }

    const serverUser = serverByEmail.get(email);

    if (!serverUser) {
      skippedEmailNotFound.push(localUser);
      continue;
    }

    const currentCode = codeOf(serverUser);

    if (currentCode === localCode) {
      skippedSameCode.push({
        email,
        name: serverUser.name,
        ownerCode: currentCode,
      });
      continue;
    }

    const ownerUsingLocalCode = existingCodeOwner.get(localCode);

    if (
      ownerUsingLocalCode
      && String(ownerUsingLocalCode._id) !== String(serverUser._id)
    ) {
      conflicts.push({
        email,
        localCode,
        targetUser: {
          name: serverUser.name,
          username: serverUser.username,
          email: serverUser.email,
          currentCode,
        },
        codeAlreadyUsedBy: {
          name: ownerUsingLocalCode.name,
          username: ownerUsingLocalCode.username,
          email: ownerUsingLocalCode.email,
          ownerCode: codeOf(ownerUsingLocalCode),
        },
      });
      continue;
    }

    updates.push({
      preview: {
        name: serverUser.name,
        username: serverUser.username,
        email: serverUser.email,
        from: currentCode || 'NO CODE',
        to: localCode,
      },
      updateOne: {
        filter: { _id: serverUser._id },
        update: {
          $set: {
            ownerCode: localCode,
            owner_code: localCode,
            accountOwnerCode: localCode,
          },
        },
      },
    });
  }

  console.log(APPLY ? 'APPLY MODE' : 'DRY RUN - NO UPDATE DONE');
  console.log('');
  console.log(`Local users in file: ${localUsers.length}`);
  console.log(`Server users: ${serverUsers.length}`);
  console.log(`Updates ready by email: ${updates.length}`);
  console.log(`Already same ownerCode: ${skippedSameCode.length}`);
  console.log(`Skipped no local email: ${skippedNoEmail.length}`);
  console.log(`Skipped no local ownerCode: ${skippedNoLocalCode.length}`);
  console.log(`Skipped email not found on server: ${skippedEmailNotFound.length}`);
  console.log(`Conflicts blocked: ${conflicts.length}`);

  console.log('\nPlanned updates:');
  updates.forEach((u) => console.log(u.preview));

  if (conflicts.length) {
    console.log('\nBLOCKED: ownerCode already used by another VPS user.');
    conflicts.forEach((c) => console.log(JSON.stringify(c, null, 2)));
  }

  if (skippedEmailNotFound.length) {
    console.log('\nEmails from local not found on server:');
    skippedEmailNotFound.forEach((u) => console.log({
      name: u.name,
      username: u.username,
      email: u.email,
      ownerCode: codeOf(u),
    }));
  }

  if (APPLY) {
    if (conflicts.length) {
      console.log('\nNo update applied because conflicts exist.');
    } else if (updates.length) {
      await users.bulkWrite(updates.map(({ updateOne }) => ({ updateOne })));
      console.log(`\nApplied ownerCode updates: ${updates.length}`);
    } else {
      console.log('\nNothing to update.');
    }
  }

  await client.close();
})();
