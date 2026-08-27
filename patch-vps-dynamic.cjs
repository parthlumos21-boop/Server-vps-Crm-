const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const file = path.join(__dirname, 'src', 'pages', 'admin', 'search', 'AdminAdvancedSearchPage.jsx');

if (!fs.existsSync(file)) {
  console.log('Error: src/pages/admin/search/AdminAdvancedSearchPage.jsx not found! Make sure you run this script in ~/app/crm');
  process.exit(1);
}

let code = fs.readFileSync(file, 'utf8');

// 1. Add imports
if (!code.includes("import { userApi }")) {
  code = code.replace(
    "import { useClickOutside } from '../../../hooks'",
    "import { useClickOutside } from '../../../hooks'\nimport { userApi } from '../../../services/userApi'"
  );
}

if (code.includes("import React, { useMemo, useState } from 'react'")) {
  code = code.replace(
    "import React, { useMemo, useState } from 'react'",
    "import React, { useMemo, useState, useEffect } from 'react'"
  );
}

// 2. Add dynamic states and helpers
const hookMark = "const AdminAdvancedSearchPage = () => {\n  const location = useLocation()\n  const navigate = useNavigate()";
const injection = `\n  const [dbMongoUsers, setDbMongoUsers] = useState([])\n  useEffect(() => {\n    userApi.listDirectory().then(users => {\n      if (Array.isArray(users)) setDbMongoUsers(users)\n    }).catch(err => console.error('Error fetching MongoDB users:', err))\n  }, [])\n\n  const resolveOwnerCode = (ownerName, fallbackCode) => {\n    if (!ownerName || ownerName === '-') return fallbackCode || '-'\n    const nameLower = String(ownerName).trim().toLowerCase()\n    const dbUser = dbMongoUsers.find(u => \n      String(u.name || '').trim().toLowerCase() === nameLower \n      || String(u.username || '').trim().toLowerCase() === nameLower\n    )\n    if (dbUser && dbUser.ownerCode) {\n      return String(dbUser.ownerCode).trim()\n    }\n    return fallbackCode || '-'\n  }\n`;

if (!code.includes("const [dbMongoUsers, setDbMongoUsers] = useState")) {
  code = code.replace(hookMark, hookMark + injection);
}

// 3. Patch handleOpenDeal to navigate to dynamic ID url
const oldHandleOpenDeal = `  const handleOpenDeal = () => {
    navigate('/admin/deals/view')
  }`;

const newHandleOpenDeal = `  const handleOpenDeal = (dealId) => {
    if (dealId) {
      navigate(buildAdminDealDetailUrl(dealId))
    } else {
      navigate('/admin/deals/view')
    }
  }`;

if (code.includes(oldHandleOpenDeal)) {
  code = code.replace(oldHandleOpenDeal, newHandleOpenDeal);
}

// 4. Patch accountRows (displays as per owner code only)
const accountRowsTarget = `  const accountRows = useMemo(() => (
    normalizedAccounts
      .filter((account) => matchesQuery(normalizedSearchQuery, [
        account.accountNumber,
        account.accountOwnerCode,
        account.name,
        account.projectName,
        account.email,
        account.phone,
        account.accountOwnerDisplay || account.accountOwner,
        account.contactPerson,
        account.address,
      ]))
      .map((account) => ({
        id: account.id,
        accountNumber: account.accountNumber || account.accountNo || account.account_no || account.raw?.accountNumber || account.raw?.accountNo || '-',
        accountName: account.name || '-',
        projectName: account.projectName || '-',
        email: account.email || '-',
        phone: account.phone || '-',
        accountOwnerCode: account.accountOwnerCode || getCrmOwnerCode(account.accountOwnerDisplay || account.accountOwnerName || account.accountOwner) || '-',
        account,
      }))
  ), [normalizedAccounts, normalizedSearchQuery])`;

const accountRowsReplacement = `  const accountRows = useMemo(() => (
    normalizedAccounts
      .filter((account) => matchesQuery(normalizedSearchQuery, [
        account.accountNumber,
        account.accountOwnerCode,
        account.name,
        account.projectName,
        account.email,
        account.phone,
        account.accountOwnerDisplay || account.accountOwner,
        account.contactPerson,
        account.address,
      ]))
      .map((account) => {
        const rawOwner = account.accountOwnerDisplay || account.accountOwnerName || account.accountOwner || '';
        const liveOwnerCode = resolveOwnerCode(rawOwner, account.accountOwnerCode || getCrmOwnerCode(rawOwner));
        return {
          id: account.id,
          accountNumber: liveOwnerCode || '-',
          accountName: account.name || '-',
          projectName: account.projectName || '-',
          email: account.email || '-',
          phone: account.phone || '-',
          accountOwnerCode: liveOwnerCode,
          account,
        }
      })
  ), [normalizedAccounts, normalizedSearchQuery, dbMongoUsers])`;

if (code.includes(accountRowsTarget)) {
  code = code.replace(accountRowsTarget, accountRowsReplacement);
}

// 5. Patch accountContactRows (displays as per owner code only)
const accountContactRowsTarget = `  const accountContactRows = useMemo(() => (
    normalizedAccounts
      .flatMap((account) => buildAccountContacts(account))
      .filter((contact) => matchesQuery(normalizedSearchQuery, [
        contact.accountNumber,
        contact.accountName,
        contact.accountOwner,
        contact.accountOwnerCode,
        contact.contactPerson,
        contact.email,
        contact.phone,
        contact.designation,
      ]))
  ), [normalizedAccounts, normalizedSearchQuery])`;

const accountContactRowsReplacement = `  const accountContactRows = useMemo(() => (
    normalizedAccounts
      .flatMap((account) => buildAccountContacts(account))
      .map((contact) => {
        const liveOwnerCode = resolveOwnerCode(contact.accountOwner, contact.accountOwnerCode);
        return {
          ...contact,
          accountOwnerCode: liveOwnerCode,
          accountNumber: liveOwnerCode || '-',
        }
      })
      .filter((contact) => matchesQuery(normalizedSearchQuery, [
        contact.accountNumber,
        contact.accountName,
        contact.accountOwner,
        contact.accountOwnerCode,
        contact.contactPerson,
        contact.email,
        contact.phone,
        contact.designation,
      ]))
  ), [normalizedAccounts, normalizedSearchQuery, dbMongoUsers])`;

if (code.includes(accountContactRowsTarget)) {
  code = code.replace(accountContactRowsTarget, accountContactRowsReplacement);
}

// 6. Patch customerRows
const customerRowsTarget = `  const customerRows = useMemo(() => (
    customers
      .map((customer) => {
        const primaryContact = getPrimaryCustomerContact(customer)
        return {
          id: customer.id,
          customerNumber: customer.customerNumber || '-',
          customerName: customer.customerName || '-',
          email: primaryContact.email || '-',
          phone: primaryContact.mobile || primaryContact.phone || '-',
          customerOwner: customer.customerOwnerDisplay || getCrmOwnerDisplay(customer.customerOwner) || customer.customerOwner || '-',
          customer,
        }
      })
      .filter((customer) => matchesQuery(normalizedSearchQuery, [
        customer.customerNumber,
        customer.customerName,
        customer.email,
        customer.phone,
        customer.customerOwner,
      ]))
  ), [customers, normalizedSearchQuery])`;

const customerRowsReplacement = `  const customerRows = useMemo(() => (
    customers
      .map((customer) => {
        const primaryContact = getPrimaryCustomerContact(customer)
        const rawOwner = customer.customerOwnerDisplay || getCrmOwnerDisplay(customer.customerOwner) || customer.customerOwner || '';
        const ownerCode = resolveOwnerCode(rawOwner, getCrmOwnerCode(rawOwner));
        const rawCustomerNo = customer.customerNumber || customer.customerNo || customer.customer_no || customer.raw?.customerNumber || customer.raw?.customerNo || customer.id || '';
        const cleanCustomerNo = (ownerCode && rawCustomerNo.startsWith(ownerCode + '-'))
          ? rawCustomerNo.slice(ownerCode.length + 1)
          : (ownerCode && rawCustomerNo.startsWith(ownerCode))
            ? rawCustomerNo.slice(ownerCode.length)
            : rawCustomerNo;
        const finalCustomerNo = (ownerCode && cleanCustomerNo)
          ? \`\${ownerCode}-\${cleanCustomerNo}\`
          : cleanCustomerNo || ownerCode || '-';
        return {
          id: customer.id,
          customerNumber: finalCustomerNo,
          customerName: customer.customerName || '-',
          email: primaryContact.email || '-',
          phone: primaryContact.mobile || primaryContact.phone || '-',
          customerOwner: rawOwner || '-',
          customer,
        }
      })
      .filter((customer) => matchesQuery(normalizedSearchQuery, [
        customer.customerNumber,
        customer.customerName,
        customer.email,
        customer.phone,
        customer.customerOwner,
      ]))
  ), [customers, normalizedSearchQuery, dbMongoUsers])`;

if (code.includes(customerRowsTarget)) {
  code = code.replace(customerRowsTarget, customerRowsReplacement);
}

// 7. Patch customerContactRows
const customerContactRowsTarget = `  const customerContactRows = useMemo(() => (
    customers
      .flatMap((customer) => buildCustomerContacts(customer))
      .filter((contact) => matchesQuery(normalizedSearchQuery, [
        contact.customerNumber,
        contact.customerName,
        contact.contactPerson,
        contact.email,
        contact.phone,
        contact.designation,
      ]))
  ), [customers, normalizedSearchQuery])`;

const customerContactRowsReplacement = `  const customerContactRows = useMemo(() => (
    customers
      .flatMap((customer) => buildCustomerContacts(customer))
      .map((contact) => {
        const parentCustomer = customers.find(c => c.id === contact.customerId) || {};
        const rawOwner = parentCustomer.customerOwnerDisplay || getCrmOwnerDisplay(parentCustomer.customerOwner) || parentCustomer.customerOwner || '';
        const ownerCode = resolveOwnerCode(rawOwner, getCrmOwnerCode(rawOwner));
        const rawCustomerNo = contact.customerNumber || '';
        const cleanCustomerNo = (ownerCode && rawCustomerNo.startsWith(ownerCode + '-'))
          ? rawCustomerNo.slice(ownerCode.length + 1)
          : (ownerCode && rawCustomerNo.startsWith(ownerCode))
            ? rawCustomerNo.slice(ownerCode.length)
            : rawCustomerNo;
        const finalCustomerNo = (ownerCode && cleanCustomerNo)
          ? \`\${ownerCode}-\${cleanCustomerNo}\`
          : cleanCustomerNo || ownerCode || '-';
        return {
          ...contact,
          customerNumber: finalCustomerNo,
        }
      })
      .filter((contact) => matchesQuery(normalizedSearchQuery, [
        contact.customerNumber,
        contact.customerName,
        contact.contactPerson,
        contact.email,
        contact.phone,
        contact.designation,
      ]))
  ), [customers, normalizedSearchQuery, dbMongoUsers])`;

if (code.includes(customerContactRowsTarget)) {
  code = code.replace(customerContactRowsTarget, customerContactRowsReplacement);
}

// 8. Patch dealRows
const dealRowsTarget = `  const dealRows = useMemo(() => (
    deals
      .map((deal) => ({
        id: deal.id,
        dealNumber: deal.dealNumber || '-',
        dealName: deal.name || deal.projectName || '-',
        customerName: deal.customerName || '-',
        dealOwner: deal.dealOwnerDisplay || getCrmOwnerDisplay(deal.dealOwner) || deal.dealOwner || '-',
        status: deal.status || '-',
        deal,
      }))
      .filter((deal) => matchesQuery(normalizedSearchQuery, [
        deal.dealNumber,
        deal.dealName,
        deal.customerName,
        deal.dealOwner,
        deal.status,
      ]))
  ), [deals, normalizedSearchQuery])`;

const dealRowsReplacement = `  const dealRows = useMemo(() => (
    deals
      .map((deal) => {
        const rawOwner = deal.dealOwnerDisplay || getCrmOwnerDisplay(deal.dealOwner) || deal.dealOwner || '';
        const ownerCode = resolveOwnerCode(rawOwner, getCrmOwnerCode(rawOwner));
        const rawDealNo = deal.dealNumber || deal.deal_number || deal.dealNo || deal.deal_no || deal.id || '';
        const cleanDealNo = (ownerCode && rawDealNo.startsWith(ownerCode + '-'))
          ? rawDealNo.slice(ownerCode.length + 1)
          : (ownerCode && rawDealNo.startsWith(ownerCode))
            ? rawDealNo.slice(ownerCode.length)
            : rawDealNo;
        const finalDealNo = (ownerCode && cleanDealNo)
          ? \`\${ownerCode}-\${cleanDealNo}\`
          : cleanDealNo || ownerCode || '-';
        return {
          id: deal.id,
          dealNumber: finalDealNo,
          dealName: deal.name || deal.projectName || '-',
          customerName: deal.customerName || '-',
          dealOwner: rawOwner || '-',
          status: deal.status || '-',
          deal,
        }
      })
      .filter((deal) => matchesQuery(normalizedSearchQuery, [
        deal.dealNumber,
        deal.dealName,
        deal.customerName,
        deal.dealOwner,
        deal.status,
      ]))
  ), [deals, normalizedSearchQuery, dbMongoUsers])`;

if (code.includes(dealRowsTarget)) {
  code = code.replace(dealRowsTarget, dealRowsReplacement);
}

// 9. Patch dealContactRows
const dealContactRowsTarget = `  const dealContactRows = useMemo(() => (
    deals
      .flatMap((deal) => buildDealContacts(deal))
      .filter((contact) => matchesQuery(normalizedSearchQuery, [
        contact.dealNumber,
        contact.dealName,
        contact.customerName,
        contact.contactPerson,
        contact.email,
        contact.phone,
      ]))
  ), [deals, normalizedSearchQuery])`;

const dealContactRowsReplacement = `  const dealContactRows = useMemo(() => (
    deals
      .flatMap((deal) => buildDealContacts(deal))
      .map((contact) => {
        const parentDeal = deals.find(d => d.id === contact.dealId) || {};
        const rawOwner = parentDeal.dealOwnerDisplay || getCrmOwnerDisplay(parentDeal.dealOwner) || parentDeal.dealOwner || '';
        const ownerCode = resolveOwnerCode(rawOwner, getCrmOwnerCode(rawOwner));
        const rawDealNo = contact.dealNumber || '';
        const cleanDealNo = (ownerCode && rawDealNo.startsWith(ownerCode + '-'))
          ? rawDealNo.slice(ownerCode.length + 1)
          : (ownerCode && rawDealNo.startsWith(ownerCode))
            ? rawDealNo.slice(ownerCode.length)
            : rawDealNo;
        const finalDealNo = (ownerCode && cleanDealNo)
          ? \`\${ownerCode}-\${cleanDealNo}\`
          : cleanDealNo || ownerCode || '-';
        return {
          ...contact,
          dealNumber: finalDealNo,
        }
      })
      .filter((contact) => matchesQuery(normalizedSearchQuery, [
        contact.dealNumber,
        contact.dealName,
        contact.customerName,
        contact.contactPerson,
        contact.email,
        contact.phone,
      ]))
  ), [deals, normalizedSearchQuery, dbMongoUsers])`;

if (code.includes(dealContactRowsTarget)) {
  code = code.replace(dealContactRowsTarget, dealContactRowsReplacement);
}

// 10. Patch column layout parameters
const sectionColumnsTarget = `  const sectionColumns = {
    accounts: [
      { key: 'accountNumber', label: 'Account No.', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },
      { key: 'accountName', label: 'Account Name' },
      { key: 'projectName', label: 'Project Name', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
    ],
    accountContacts: [
      { key: 'accountNumber', label: 'Account No.', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'designation', label: 'Designation' },
    ],
    customers: [
      { key: 'customerNumber', label: 'Customer No.', isRecordNumber: true, onClick: (row) => handleOpenCustomer(row.customer.id) },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'customerOwner', label: 'Customer Owner' },
    ],
    customerContacts: [
      { key: 'customerNumber', label: 'Customer No.', isRecordNumber: true, onClick: (row) => handleOpenCustomer(row.customerId) },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'designation', label: 'Designation' },
    ],
    deals: [
      { key: 'dealNumber', label: 'Deal No.', isRecordNumber: true, onClick: () => handleOpenDeal() },
      { key: 'dealName', label: 'Deal Name' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'dealOwner', label: 'Deal Owner' },
      { key: 'status', label: 'Status' },
    ],
    dealContacts: [
      { key: 'dealNumber', label: 'Deal No.', isRecordNumber: true, onClick: () => handleOpenDeal() },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'customerName', label: 'Customer Name' },
    ],
    projects: [
      { key: 'projectCode', label: 'Project Code', isRecordNumber: true, onClick: (row) => handleOpenProject(row.id) },
      { key: 'projectName', label: 'Project Name', isRecordNumber: true, onClick: (row) => handleOpenProject(row.id) },
      { key: 'accountName', label: 'Account Name' },
      { key: 'consultantName', label: 'Consultant' },
      { key: 'architectName', label: 'Architect' },
      { key: 'pmcName', label: 'PMC' },
      { key: 'projectStatus', label: 'Project Status' },
      { key: 'projectLocation', label: 'Location' },
    ],
  }`;

const sectionColumnsReplacement = `  const sectionColumns = {
    accounts: [
      { key: 'accountNumber', label: 'Account No.', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },
      { key: 'accountName', label: 'Account Name' },
      { key: 'projectName', label: 'Project Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
    ],
    accountContacts: [
      { key: 'accountNumber', label: 'Account No.', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'designation', label: 'Designation' },
    ],
    customers: [
      { key: 'customerNumber', label: 'Customer No.', isRecordNumber: true, onClick: (row) => handleOpenCustomer(row.customer.id) },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'customerOwner', label: 'Customer Owner' },
    ],
    customerContacts: [
      { key: 'customerNumber', label: 'Customer No.', isRecordNumber: true, onClick: (row) => handleOpenCustomer(row.customerId) },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'designation', label: 'Designation' },
    ],
    deals: [
      { key: 'dealNumber', label: 'Deal No.', isRecordNumber: true, onClick: (row) => handleOpenDeal(row.id) },
      { key: 'dealName', label: 'Deal Name' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'dealOwner', label: 'Deal Owner' },
      { key: 'status', label: 'Status' },
    ],
    dealContacts: [
      { key: 'dealNumber', label: 'Deal No.', isRecordNumber: true, onClick: (row) => handleOpenDeal(row.dealId) },
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'customerName', label: 'Customer Name' },
    ],
    projects: [
      { key: 'projectName', label: 'Project Name', isRecordNumber: true, onClick: (row) => handleOpenProject(row.id) },
      { key: 'accountName', label: 'Account Name' },
      { key: 'consultantName', label: 'Consultant' },
      { key: 'architectName', label: 'Architect' },
      { key: 'pmcName', label: 'PMC' },
      { key: 'projectStatus', label: 'Project Status' },
      { key: 'projectLocation', label: 'Location' },
    ],
  }`;

if (code.includes(sectionColumnsTarget)) {
  code = code.replace(sectionColumnsTarget, sectionColumnsReplacement);
}

fs.writeFileSync(file, code);
console.log('✅ Successfully patched AdminAdvancedSearchPage.jsx locally with MongoDB user mapping, Project table link removals, and Deal links!');

try {
  console.log('Rebuilding app locally...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful.');
} catch (e) {
  console.error('❌ Build failed.', e.message);
}
