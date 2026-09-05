const fs = require('fs');
const path = require('path');

function patchSrc() {
  const file = path.join(__dirname, 'src', 'pages', 'admin', 'search', 'AdminAdvancedSearchPage.jsx');
  if (!fs.existsSync(file)) return false;

  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  const target1 = "accountNumber: accountOwnerCode,";
  const replacement1 = "accountNumber: account.accountNumber || account.accountNo || account.account_no || account.raw?.accountNumber || account.raw?.accountNo || '-',";
  if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    changed = true;
  }

  const target2 = "accountNumber: account.accountOwnerCode || getCrmOwnerCode(account.accountOwnerDisplay || account.accountOwnerName || account.accountOwner) || '-',";
  const replacement2 = "accountNumber: account.accountNumber || account.accountNo || account.account_no || account.raw?.accountNumber || account.raw?.accountNo || '-',";
  if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    console.log('[SRC] Successfully updated AdminAdvancedSearchPage.jsx');
    return true;
  }
  return false;
}

function patchDist() {
  const distDir = path.join(__dirname, 'dist', 'assets');
  if (!fs.existsSync(distDir)) {
    console.log('[DIST] No dist/assets folder found. Skip patching dist.');
    return false;
  }

  const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
  let anyChanged = false;

  for (const file of files) {
    const filePath = path.join(distDir, file);
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Regex to match the minified version of: 
    // accountNumber: account.accountOwnerCode || getCrmOwnerCode(account.accountOwnerDisplay || account.accountOwnerName || account.accountOwner) || '-'
    const regexRows = /accountNumber:([a-zA-Z0-9_$]+)\.accountOwnerCode\|\|[a-zA-Z0-9_$]+\(\1\.accountOwnerDisplay\|\|\1\.accountOwnerName\|\|\1\.accountOwner\)\|\|"-"/g;
    
    if (regexRows.test(code)) {
      code = code.replace(regexRows, 'accountNumber:$1.accountNumber||$1.accountNo||$1.account_no||$1.raw?.accountNumber||$1.raw?.accountNo||"-"');
      changed = true;
      console.log(`[DIST] Patched accountRows in ${file}`);
    }

    // Try a more generic replacement for the contact mapping if it exists
    // (This is tricky so we do our best without breaking the file)
    // contact.accountNumber mapped to accountOwnerCode
    const contactRegex = /accountNumber:([a-zA-Z0-9_$]+),accountName:([a-zA-Z0-9_$]+)\.name,/g;
    if (contactRegex.test(code)) {
      code = code.replace(contactRegex, 'accountNumber:$2.accountNumber||$2.accountNo||$2.account_no||$2.raw?.accountNumber||$2.raw?.accountNo||"-",accountName:$2.name,');
      changed = true;
      console.log(`[DIST] Patched accountContactRows in ${file}`);
    }

    if (changed) {
      fs.writeFileSync(filePath, code);
      anyChanged = true;
    }
  }

  return anyChanged;
}

console.log('Starting patch for VPS...');
const srcPatched = patchSrc();
const distPatched = patchDist();

if (srcPatched || distPatched) {
  console.log('Patching complete. The fixes have been applied successfully.');
} else {
  console.log('No files needed patching. It might already be fixed, or the patterns were not found.');
}
