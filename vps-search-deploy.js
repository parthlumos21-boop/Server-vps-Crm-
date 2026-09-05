const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const file = path.join(__dirname, 'src', 'pages', 'admin', 'search', 'AdminAdvancedSearchPage.jsx');

if (!fs.existsSync(file)) {
  console.log('Error: src/pages/admin/search/AdminAdvancedSearchPage.jsx not found! Make sure you run this script in ~/app/crm');
  process.exit(1);
}

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
  console.log('[+] Patched AdminAdvancedSearchPage.jsx successfully.');
  
  console.log('Building the application with npm run build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!');
  } catch (err) {
    console.error('❌ Build failed:', err.message);
  }
} else {
  console.log('⚠️ No changes were needed (file might already be patched).');
}
