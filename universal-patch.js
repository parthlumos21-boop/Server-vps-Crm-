const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Starting Universal VPS Search Patch ---');

let patched = false;

// 1. Try to patch SRC file
const srcFile = path.join(__dirname, 'src', 'pages', 'admin', 'search', 'AdminAdvancedSearchPage.jsx');
if (fs.existsSync(srcFile)) {
  let code = fs.readFileSync(srcFile, 'utf8');
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
    fs.writeFileSync(srcFile, code);
    console.log('[+] Patched AdminAdvancedSearchPage.jsx in source.');
    patched = true;
    
    // Try to build on VPS
    try {
      console.log('Running build on VPS...');
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build successful!');
    } catch (e) {
      console.log('⚠️ Build failed (might not have build dependencies on VPS). Falling back to patching dist directly...');
    }
  }
}

// 2. Try to patch DIST folder directly (just in case build didn't run or they only have dist)
const distDir = path.join(__dirname, 'dist', 'assets');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(distDir, file);
    let code = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const regexRows = /accountNumber:([a-zA-Z0-9_$]+)\.accountOwnerCode\|\|[a-zA-Z0-9_$]+\(\1\.accountOwnerDisplay\|\|\1\.accountOwnerName\|\|\1\.accountOwner\)\|\|"-"/g;
    if (regexRows.test(code)) {
      code = code.replace(regexRows, 'accountNumber:$1.accountNumber||$1.accountNo||$1.account_no||$1.raw?.accountNumber||$1.raw?.accountNo||"-"');
      changed = true;
      console.log(`[+] Patched minified Accounts table in ${file}`);
    }

    const contactRegex = /accountNumber:([a-zA-Z0-9_$]+),accountName:([a-zA-Z0-9_$]+)\.name,/g;
    if (contactRegex.test(code)) {
      code = code.replace(contactRegex, 'accountNumber:$2.accountNumber||$2.accountNo||$2.account_no||$2.raw?.accountNumber||$2.raw?.accountNo||"-",accountName:$2.name,');
      changed = true;
      console.log(`[+] Patched minified Account Contacts table in ${file}`);
    }

    if (changed) {
      fs.writeFileSync(filePath, code);
      patched = true;
    }
  }
}

if (patched) {
  console.log('✅ Patching completed successfully!');
} else {
  console.log('⚠️ No files were patched. They might already be updated or the patterns were not found.');
}
