const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'admin', 'search', 'AdminAdvancedSearchPage.jsx');

if (!fs.existsSync(file)) {
  console.log('Error: File not found!');
  process.exit(1);
}

let code = fs.readFileSync(file, 'utf8');

// Fix 1: accountContactRows mapping
const target1 = "accountNumber: accountOwnerCode,";
const replacement1 = "accountNumber: account.accountNumber || account.accountNo || account.account_no || account.raw?.accountNumber || account.raw?.accountNo || '-',";

// Fix 2: accountRows mapping
const target2 = "accountNumber: account.accountOwnerCode || getCrmOwnerCode(account.accountOwnerDisplay || account.accountOwnerName || account.accountOwner) || '-',";
const replacement2 = "accountNumber: account.accountNumber || account.accountNo || account.account_no || account.raw?.accountNumber || account.raw?.accountNo || '-',";

let changed = false;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  changed = true;
  console.log('Fixed accountContactRows accountNumber display.');
} else {
  console.log('Could not find target1 in AdminAdvancedSearchPage.jsx. It may have already been modified.');
}

if (code.includes(target2)) {
  // We only replace the FIRST occurrence in accountRows mapping, but wait, there might be only one.
  code = code.replace(target2, replacement2);
  changed = true;
  console.log('Fixed accountRows accountNumber display.');
} else {
  console.log('Could not find target2 in AdminAdvancedSearchPage.jsx. It may have already been modified.');
}

if (changed) {
  fs.writeFileSync(file, code);
  console.log('Successfully updated AdminAdvancedSearchPage.jsx!');
} else {
  console.log('No changes were made.');
}
