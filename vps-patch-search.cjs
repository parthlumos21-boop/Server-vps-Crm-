const fs = require('fs');
const path = require('path');

// Target the dist/assets folder where compiled frontend code lives on the VPS
const distDir = path.join(__dirname, 'dist', 'assets');

console.log('--- Starting VPS Search Patch ---');

if (!fs.existsSync(distDir)) {
  console.log('Error: "dist/assets" folder not found! Make sure you run this script in the root of your CRM directory on the VPS (where the dist folder is).');
  process.exit(1);
}

const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
let totalPatches = 0;

for (const file of files) {
  const filePath = path.join(distDir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern 1: Patch the 'Accounts' table row logic
  const regexRows = /accountNumber:([a-zA-Z0-9_$]+)\.accountOwnerCode\|\|[a-zA-Z0-9_$]+\(\1\.accountOwnerDisplay\|\|\1\.accountOwnerName\|\|\1\.accountOwner\)\|\|"-"/g;
  if (regexRows.test(code)) {
    code = code.replace(regexRows, 'accountNumber:$1.accountNumber||$1.accountNo||$1.account_no||$1.raw?.accountNumber||$1.raw?.accountNo||"-"');
    changed = true;
    console.log(`[+] Patched Accounts table in ${file}`);
  }

  // Pattern 2: Patch the 'Account Contacts' table row logic
  const contactRegex = /accountNumber:([a-zA-Z0-9_$]+),accountName:([a-zA-Z0-9_$]+)\.name,/g;
  if (contactRegex.test(code)) {
    code = code.replace(contactRegex, 'accountNumber:$2.accountNumber||$2.accountNo||$2.account_no||$2.raw?.accountNumber||$2.raw?.accountNo||"-",accountName:$2.name,');
    changed = true;
    console.log(`[+] Patched Account Contacts table in ${file}`);
  }

  if (changed) {
    fs.writeFileSync(filePath, code);
    totalPatches++;
  }
}

if (totalPatches > 0) {
  console.log(`--- Success! Applied ${totalPatches} patches. The Account No should now display correctly on the VPS. ---`);
} else {
  console.log('--- No patches applied. The minified files might already be fixed, or the patterns were not found. ---');
}
