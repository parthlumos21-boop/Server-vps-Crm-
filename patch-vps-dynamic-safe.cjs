const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const file = path.join(__dirname, 'src', 'pages', 'admin', 'search', 'AdminAdvancedSearchPage.jsx');
const cssFile = path.join(__dirname, 'src', 'pages', 'admin', 'search', 'AdminAdvancedSearchPage.css');
const htmlFile = path.join(__dirname, 'index.html');

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
const injection = "\n  const [dbMongoUsers, setDbMongoUsers] = useState([])\n  useEffect(() => {\n    userApi.listDirectory().then(users => {\n      if (Array.isArray(users)) setDbMongoUsers(users)\n    }).catch(err => console.error('Error fetching MongoDB users:', err))\n  }, [])\n\n  const resolveOwnerCode = (ownerName, fallbackCode) => {\n    if (!ownerName || ownerName === '-') return fallbackCode || '-'\n    const nameLower = String(ownerName).trim().toLowerCase()\n    const dbUser = dbMongoUsers.find(u => \n      String(u.name || '').trim().toLowerCase() === nameLower \n      || String(u.username || '').trim().toLowerCase() === nameLower\n    )\n    if (dbUser && dbUser.ownerCode) {\n      return String(dbUser.ownerCode).trim()\n    }\n    return fallbackCode || '-'\n  }\n\n  const isDummyOrDemo = (str) => {\n    if (!str) return false\n    const s = String(str).toLowerCase().trim()\n    return s.includes('demo') || s.includes('dummy')\n  }\n\n  const isSpecificDummy = (name, project) => {\n    const n = String(name || '').toLowerCase().trim()\n    const p = String(project || '').toLowerCase().trim()\n    if ((n === 'abc' || n === 'demo' || n === 'adani') && (p === 'general enquiry' || p === '-')) {\n      return true\n    }\n    return false\n  }\n";

if (!code.includes("const [dbMongoUsers, setDbMongoUsers] = useState")) {
  code = code.replace(hookMark, hookMark + injection);
}

// 3. Patch handleOpenDeal to navigate to dynamic ID url
const oldHandleOpenDeal = "  const handleOpenDeal = () => {\n    navigate('/admin/deals/view')\n  }";

const newHandleOpenDeal = "  const handleOpenDeal = (dealId) => {\n    if (dealId) {\n      navigate(buildAdminDealDetailUrl(dealId))\n    } else {\n      navigate('/admin/deals/view')\n    }\n  }";

if (code.includes(oldHandleOpenDeal)) {
  code = code.replace(oldHandleOpenDeal, newHandleOpenDeal);
}

// 4. Patch accountRows (displays OWNER CODE ONLY + Filters out dummy/demo data)
const accountRowsTarget = "  const accountRows = useMemo(() => (\n    normalizedAccounts\n      .filter((account) => matchesQuery(normalizedSearchQuery, [\n        account.accountNumber,\n        account.accountOwnerCode,\n        account.name,\n        account.projectName,\n        account.email,\n        account.phone,\n        account.accountOwnerDisplay || account.accountOwner,\n        account.contactPerson,\n        account.address,\n      ]))\n      .map((account) => ({\n        id: account.id,\n        accountNumber: account.accountNumber || account.accountNo || account.account_no || account.raw?.accountNumber || account.raw?.accountNo || '-',\n        accountName: account.name || '-',\n        projectName: account.projectName || '-',\n        email: account.email || '-',\n        phone: account.phone || '-',\n        accountOwnerCode: account.accountOwnerCode || getCrmOwnerCode(account.accountOwnerDisplay || account.accountOwnerName || account.accountOwner) || '-',\n        account,\n      }))\n  ), [normalizedAccounts, normalizedSearchQuery])";

const accountRowsReplacement = "  const accountRows = useMemo(() => (\n    normalizedAccounts\n      .filter((account) => {\n        const name = account.name || '';\n        const project = account.projectName || '';\n        const owner = account.accountOwnerDisplay || account.accountOwner || '';\n        if (isDummyOrDemo(name) || isDummyOrDemo(project) || isDummyOrDemo(owner)) return false;\n        if (isSpecificDummy(name, project)) return false;\n        return matchesQuery(normalizedSearchQuery, [\n          account.accountNumber,\n          account.accountOwnerCode,\n          account.name,\n          account.projectName,\n          account.email,\n          account.phone,\n          account.accountOwnerDisplay || account.accountOwner,\n          account.contactPerson,\n          account.address,\n        ]);\n      })\n      .map((account) => {\n        const rawOwner = account.accountOwnerDisplay || account.accountOwnerName || account.accountOwner || '';\n        const liveOwnerCode = resolveOwnerCode(rawOwner, account.accountOwnerCode || getCrmOwnerCode(rawOwner));\n        const displayOwnerCode = (liveOwnerCode && liveOwnerCode !== '-') ? liveOwnerCode : '-';\n        return {\n          id: account.id,\n          accountNumber: displayOwnerCode,\n          accountName: account.name || '-',\n          projectName: account.projectName || '-',\n          email: account.email || '-',\n          phone: account.phone || '-',\n          accountOwnerCode: liveOwnerCode,\n          account,\n        }\n      })\n  ), [normalizedAccounts, normalizedSearchQuery, dbMongoUsers])";

if (code.includes(accountRowsTarget)) {
  code = code.replace(accountRowsTarget, accountRowsReplacement);
}

// 5. Patch accountContactRows (displays OWNER CODE ONLY + Filters out dummy/demo data)
const accountContactRowsTarget = "  const accountContactRows = useMemo(() => (\n    normalizedAccounts\n      .flatMap((account) => buildAccountContacts(account))\n      .filter((contact) => matchesQuery(normalizedSearchQuery, [\n        contact.accountNumber,\n        contact.accountName,\n        contact.accountOwner,\n        contact.accountOwnerCode,\n        contact.contactPerson,\n        contact.email,\n        contact.phone,\n        contact.designation,\n      ]))\n  ), [normalizedAccounts, normalizedSearchQuery])";

const accountContactRowsReplacement = "  const accountContactRows = useMemo(() => (\n    normalizedAccounts\n      .filter((account) => {\n        const name = account.name || '';\n        const project = account.projectName || '';\n        const owner = account.accountOwnerDisplay || account.accountOwner || '';\n        if (isDummyOrDemo(name) || isDummyOrDemo(project) || isDummyOrDemo(owner)) return false;\n        if (isSpecificDummy(name, project)) return false;\n        return true;\n      })\n      .flatMap((account) => buildAccountContacts(account))\n      .map((contact) => {\n        const liveOwnerCode = resolveOwnerCode(contact.accountOwner, contact.accountOwnerCode);\n        const displayOwnerCode = (liveOwnerCode && liveOwnerCode !== '-') ? liveOwnerCode : '-';\n        return {\n          ...contact,\n          accountOwnerCode: liveOwnerCode,\n          accountNumber: displayOwnerCode,\n        }\n      })\n      .filter((contact) => matchesQuery(normalizedSearchQuery, [\n        contact.accountNumber,\n        contact.accountName,\n        contact.accountOwner,\n        contact.accountOwnerCode,\n        contact.contactPerson,\n        contact.email,\n        contact.phone,\n        contact.designation,\n      ]))\n  ), [normalizedAccounts, normalizedSearchQuery, dbMongoUsers])";

if (code.includes(accountContactRowsTarget)) {
  code = code.replace(code.includes(accountContactRowsTarget) ? accountContactRowsTarget : "", accountContactRowsReplacement);
}

// 6. Patch customerRows (Filters out dummy/demo data)
const customerRowsTarget = "  const customerRows = useMemo(() => (\n    customers\n      .map((customer) => {\n        const primaryContact = getPrimaryCustomerContact(customer)\n        return {\n          id: customer.id,\n          customerNumber: customer.customerNumber || '-',\n          customerName: customer.customerName || '-',\n          email: primaryContact.email || '-',\n          phone: primaryContact.mobile || primaryContact.phone || '-',\n          customerOwner: customer.customerOwnerDisplay || getCrmOwnerDisplay(customer.customerOwner) || customer.customerOwner || '-',\n          customer,\n        }\n      })\n      .filter((customer) => matchesQuery(normalizedSearchQuery, [\n        customer.customerNumber,\n        customer.customerName,\n        customer.email,\n        customer.phone,\n        customer.customerOwner,\n      ]))\n  ), [customers, normalizedSearchQuery])";

const customerRowsReplacement = "  const customerRows = useMemo(() => (\n    customers\n      .filter((customer) => {\n        const name = customer.customerName || '';\n        const owner = customer.customerOwnerDisplay || customer.customerOwner || '';\n        return !isDummyOrDemo(name) && !isDummyOrDemo(owner);\n      })\n      .map((customer) => {\n        const primaryContact = getPrimaryCustomerContact(customer)\n        const rawOwner = customer.customerOwnerDisplay || getCrmOwnerDisplay(customer.customerOwner) || customer.customerOwner || '';\n        const ownerCode = resolveOwnerCode(rawOwner, getCrmOwnerCode(rawOwner));\n        const rawCustomerNo = customer.customerNumber || customer.customerNo || customer.customer_no || customer.raw?.customerNumber || customer.raw?.customerNo || customer.id || '';\n        const cleanCustomerNo = (ownerCode && rawCustomerNo.startsWith(ownerCode + '-'))\n          ? rawCustomerNo.slice(ownerCode.length + 1)\n          : (ownerCode && rawCustomerNo.startsWith(ownerCode))\n            ? rawCustomerNo.slice(ownerCode.length)\n            : rawCustomerNo;\n        const finalCustomerNo = (ownerCode && cleanCustomerNo)\n          ? (ownerCode + '-' + cleanCustomerNo)\n          : cleanCustomerNo || ownerCode || '-';\n        return {\n          id: customer.id,\n          customerNumber: finalCustomerNo,\n          customerName: customer.customerName || '-',\n          email: primaryContact.email || '-',\n          phone: primaryContact.mobile || primaryContact.phone || '-',\n          customerOwner: rawOwner || '-',\n          customer,\n        }\n      })\n      .filter((customer) => matchesQuery(normalizedSearchQuery, [\n        customer.customerNumber,\n        customer.customerName,\n        customer.email,\n        customer.phone,\n        customer.customerOwner,\n      ]))\n  ), [customers, normalizedSearchQuery, dbMongoUsers])";

if (code.includes(customerRowsTarget)) {
  code = code.replace(customerRowsTarget, customerRowsReplacement);
}

// 7. Patch customerContactRows (Filters out dummy/demo data)
const customerContactRowsTarget = "  const customerContactRows = useMemo(() => (\n    customers\n      .flatMap((customer) => buildCustomerContacts(customer))\n      .filter((contact) => matchesQuery(normalizedSearchQuery, [\n        contact.customerNumber,\n        contact.customerName,\n        contact.contactPerson,\n        contact.email,\n        contact.phone,\n        contact.designation,\n      ]))\n  ), [customers, normalizedSearchQuery])";

const customerContactRowsReplacement = "  const customerContactRows = useMemo(() => (\n    customers\n      .filter((customer) => {\n        const name = customer.customerName || '';\n        const owner = customer.customerOwnerDisplay || customer.customerOwner || '';\n        return !isDummyOrDemo(name) && !isDummyOrDemo(owner);\n      })\n      .flatMap((customer) => buildCustomerContacts(customer))\n      .map((contact) => {\n        const parentCustomer = customers.find(c => c.id === contact.customerId) || {};\n        const rawOwner = parentCustomer.customerOwnerDisplay || getCrmOwnerDisplay(parentCustomer.customerOwner) || parentCustomer.customerOwner || '';\n        const ownerCode = resolveOwnerCode(rawOwner, getCrmOwnerCode(rawOwner));\n        const rawCustomerNo = contact.customerNumber || '';\n        const cleanCustomerNo = (ownerCode && rawCustomerNo.startsWith(ownerCode + '-'))\n          ? rawCustomerNo.slice(ownerCode.length + 1)\n          : (ownerCode && rawCustomerNo.startsWith(ownerCode))\n            ? rawCustomerNo.slice(ownerCode.length)\n            : rawCustomerNo;\n        const finalCustomerNo = (ownerCode && cleanCustomerNo)\n          ? (ownerCode + '-' + cleanCustomerNo)\n          : cleanCustomerNo || ownerCode || '-';\n        return {\n          ...contact,\n          customerNumber: finalCustomerNo,\n        }\n      })\n      .filter((contact) => matchesQuery(normalizedSearchQuery, [\n        contact.customerNumber,\n        contact.customerName,\n        contact.contactPerson,\n        contact.email,\n        contact.phone,\n        contact.designation,\n      ]))\n  ), [customers, normalizedSearchQuery, dbMongoUsers])";

if (code.includes(customerContactRowsTarget)) {
  code = code.replace(customerContactRowsTarget, customerContactRowsReplacement);
}

// 8. Patch dealRows (Filters out dummy/demo data)
const dealRowsTarget = "  const dealRows = useMemo(() => (\n    deals\n      .map((deal) => ({\n        id: deal.id,\n        dealNumber: deal.dealNumber || '-',\n        dealName: deal.name || deal.projectName || '-',\n        customerName: deal.customerName || '-',\n        dealOwner: deal.dealOwnerDisplay || getCrmOwnerDisplay(deal.dealOwner) || deal.dealOwner || '-',\n        status: deal.status || '-',\n        deal,\n      }))\n      .filter((deal) => matchesQuery(normalizedSearchQuery, [\n        deal.dealNumber,\n        deal.dealName,\n        deal.customerName,\n        deal.dealOwner,\n        deal.status,\n      ]))\n  ), [deals, normalizedSearchQuery])";

const dealRowsReplacement = "  const dealRows = useMemo(() => (\n    deals\n      .filter((deal) => {\n        const name = deal.name || deal.projectName || '';\n        const customer = deal.customerName || '';\n        const owner = deal.dealOwnerDisplay || deal.dealOwner || '';\n        return !isDummyOrDemo(name) && !isDummyOrDemo(customer) && !isDummyOrDemo(owner);\n      })\n      .map((deal) => {\n        const rawOwner = deal.dealOwnerDisplay || getCrmOwnerDisplay(deal.dealOwner) || deal.dealOwner || '';\n        const ownerCode = resolveOwnerCode(rawOwner, getCrmOwnerCode(rawOwner));\n        const rawDealNo = deal.dealNumber || deal.deal_number || deal.dealNo || deal.deal_no || deal.id || '';\n        const cleanDealNo = (ownerCode && rawDealNo.startsWith(ownerCode + '-'))\n          ? rawDealNo.slice(ownerCode.length + 1)\n          : (ownerCode && rawDealNo.startsWith(ownerCode))\n            ? rawDealNo.slice(ownerCode.length)\n            : rawDealNo;\n        const finalDealNo = (ownerCode && cleanDealNo)\n          ? (ownerCode + '-' + cleanDealNo)\n          : cleanDealNo || ownerCode || '-';\n        return {\n          id: deal.id,\n          dealNumber: finalDealNo,\n          dealName: deal.name || deal.projectName || '-',\n          customerName: deal.customerName || '-',\n          dealOwner: rawOwner || '-',\n          status: deal.status || '-',\n          deal,\n        }\n      })\n      .filter((deal) => matchesQuery(normalizedSearchQuery, [\n        deal.dealNumber,\n        deal.dealName,\n        deal.customerName,\n        deal.dealOwner,\n        deal.status,\n      ]))\n  ), [deals, normalizedSearchQuery, dbMongoUsers])";

if (code.includes(dealRowsTarget)) {
  code = code.replace(dealRowsTarget, dealRowsReplacement);
}

// 9. Patch dealContactRows (Filters out dummy/demo data)
const dealContactRowsTarget = "  const dealContactRows = useMemo(() => (\n    deals\n      .flatMap((deal) => buildDealContacts(deal))\n      .filter((contact) => matchesQuery(normalizedSearchQuery, [\n        contact.dealNumber,\n        contact.dealName,\n        contact.customerName,\n        contact.contactPerson,\n        contact.email,\n        contact.phone,\n      ]))\n  ), [deals, normalizedSearchQuery])";

const dealContactRowsReplacement = "  const dealContactRows = useMemo(() => (\n    deals\n      .filter((deal) => {\n        const name = deal.name || deal.projectName || '';\n        const customer = deal.customerName || '';\n        const owner = deal.dealOwnerDisplay || deal.dealOwner || '';\n        return !isDummyOrDemo(name) && !isDummyOrDemo(customer) && !isDummyOrDemo(owner);\n      })\n      .flatMap((deal) => buildDealContacts(deal))\n      .map((contact) => {\n        const parentDeal = deals.find(d => d.id === contact.dealId) || {};\n        const rawOwner = parentDeal.dealOwnerDisplay || getCrmOwnerDisplay(parentDeal.dealOwner) || parentDeal.dealOwner || '';\n        const ownerCode = resolveOwnerCode(rawOwner, getCrmOwnerCode(rawOwner));\n        const rawDealNo = contact.dealNumber || '';\n        const cleanDealNo = (ownerCode && rawDealNo.startsWith(ownerCode + '-'))\n          ? rawDealNo.slice(ownerCode.length + 1)\n          : (ownerCode && rawDealNo.startsWith(ownerCode))\n            ? rawDealNo.slice(ownerCode.length)\n            : rawDealNo;\n        const finalDealNo = (ownerCode && cleanDealNo)\n          ? (ownerCode + '-' + cleanDealNo)\n          : cleanDealNo || ownerCode || '-';\n        return {\n          ...contact,\n          dealNumber: finalDealNo,\n        }\n      })\n      .filter((contact) => matchesQuery(normalizedSearchQuery, [\n        contact.dealNumber,\n        contact.dealName,\n        contact.customerName,\n        contact.contactPerson,\n        contact.email,\n        contact.phone,\n      ]))\n  ), [deals, normalizedSearchQuery, dbMongoUsers])";

if (code.includes(dealContactRowsTarget)) {
  code = code.replace(dealContactRowsTarget, dealContactRowsReplacement);
}

// 10. Patch column layout parameters (Rename Account No. to Owner Code + make it display only Owner Code)
const sectionColumnsTarget = "  const sectionColumns = {\n    accounts: [\n      { key: 'accountNumber', label: 'Account No.', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },\n      { key: 'accountName', label: 'Account Name' },\n      { key: 'projectName', label: 'Project Name', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n    ],\n    accountContacts: [\n      { key: 'accountNumber', label: 'Account No.', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },\n      { key: 'contactPerson', label: 'Contact Person' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n      { key: 'designation', label: 'Designation' },\n    ],\n    customers: [\n      { key: 'customerNumber', label: 'Customer No.', isRecordNumber: true, onClick: (row) => handleOpenCustomer(row.customer.id) },\n      { key: 'customerName', label: 'Customer Name' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n      { key: 'customerOwner', label: 'Customer Owner' },\n    ],\n    customerContacts: [\n      { key: 'customerNumber', label: 'Customer No.', isRecordNumber: true, onClick: (row) => handleOpenCustomer(row.customerId) },\n      { key: 'contactPerson', label: 'Contact Person' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n      { key: 'designation', label: 'Designation' },\n    ],\n    deals: [\n      { key: 'dealNumber', label: 'Deal No.', isRecordNumber: true, onClick: () => handleOpenDeal() },\n      { key: 'dealName', label: 'Deal Name' },\n      { key: 'customerName', label: 'Customer Name' },\n      { key: 'dealOwner', label: 'Deal Owner' },\n      { key: 'status', label: 'Status' },\n    ],\n    dealContacts: [\n      { key: 'dealNumber', label: 'Deal No.', isRecordNumber: true, onClick: () => handleOpenDeal() },\n      { key: 'contactPerson', label: 'Contact Person' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n      { key: 'customerName', label: 'Customer Name' },\n    ],\n    projects: [\n      { key: 'projectCode', label: 'Project Code', isRecordNumber: true, onClick: (row) => handleOpenProject(row.id) },\n      { key: 'projectName', label: 'Project Name', isRecordNumber: true, onClick: (row) => handleOpenProject(row.id) },\n      { key: 'accountName', label: 'Account Name' },\n      { key: 'consultantName', label: 'Consultant' },\n      { key: 'architectName', label: 'Architect' },\n      { key: 'pmcName', label: 'PMC' },\n      { key: 'projectStatus', label: 'Project Status' },\n      { key: 'projectLocation', label: 'Location' },\n    ],\n  }";

const sectionColumnsReplacement = "  const sectionColumns = {\n    accounts: [\n      { key: 'accountNumber', label: 'Owner Code', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },\n      { key: 'accountName', label: 'Account Name' },\n      { key: 'projectName', label: 'Project Name' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n    ],\n    accountContacts: [\n      { key: 'accountNumber', label: 'Owner Code', isRecordNumber: true, onClick: (row) => setSelectedAccount(row.account) },\n      { key: 'contactPerson', label: 'Contact Person' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n      { key: 'designation', label: 'Designation' },\n    ],\n    customers: [\n      { key: 'customerNumber', label: 'Customer No.', isRecordNumber: true, onClick: (row) => handleOpenCustomer(row.customer.id) },\n      { key: 'customerName', label: 'Customer Name' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n      { key: 'customerOwner', label: 'Customer Owner' },\n    ],\n    customerContacts: [\n      { key: 'customerNumber', label: 'Customer No.', isRecordNumber: true, onClick: (row) => handleOpenCustomer(row.customerId) },\n      { key: 'contactPerson', label: 'Contact Person' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n      { key: 'designation', label: 'Designation' },\n    ],\n    deals: [\n      { key: 'dealNumber', label: 'Deal No.', isRecordNumber: true, onClick: (row) => handleOpenDeal(row.id) },\n      { key: 'dealName', label: 'Deal Name' },\n      { key: 'customerName', label: 'Customer Name' },\n      { key: 'dealOwner', label: 'Deal Owner' },\n      { key: 'status', label: 'Status' },\n    ],\n    dealContacts: [\n      { key: 'dealNumber', label: 'Deal No.', isRecordNumber: true, onClick: (row) => handleOpenDeal(row.dealId) },\n      { key: 'contactPerson', label: 'Contact Person' },\n      { key: 'email', label: 'Email' },\n      { key: 'phone', label: 'Phone' },\n      { key: 'customerName', label: 'Customer Name' },\n    ],\n    projects: [\n      { key: 'projectName', label: 'Project Name', isRecordNumber: true, onClick: (row) => handleOpenProject(row.id) },\n      { key: 'accountName', label: 'Account Name' },\n      { key: 'consultantName', label: 'Consultant' },\n      { key: 'architectName', label: 'Architect' },\n      { key: 'pmcName', label: 'PMC' },\n      { key: 'projectStatus', label: 'Project Status' },\n      { key: 'projectLocation', label: 'Location' },\n    ],\n  }";

if (code.includes(sectionColumnsTarget)) {
  code = code.replace(sectionColumnsTarget, sectionColumnsReplacement);
}

fs.writeFileSync(file, code);
console.log('✅ Successfully patched AdminAdvancedSearchPage.jsx locally!');

// 11. Patch CSS File to set Heading text color to White + Section styling match
if (fs.existsSync(cssFile)) {
  let cssCode = fs.readFileSync(cssFile, 'utf8');

  // Set Heading to White
  cssCode = cssCode.replace(
    ".admin-search-header h1 {\n  margin: 0 0 0.25rem;\n  color: var(--text-primary);",
    ".admin-search-header h1 {\n  margin: 0 0 0.25rem;\n  color: #ffffff;"
  );
  cssCode = cssCode.replace(
    ".admin-search-header p {\n  margin: 0;\n  color: var(--text-primary);",
    ".admin-search-header p {\n  margin: 0;\n  color: #ffffff;"
  );

  // Set Title styling (Red bg with rounded top corners, Black text color)
  cssCode = cssCode.replace(
    ".admin-search-section-title {\n  padding: 0.75rem 0.95rem;\n  background: red;\n  background-image: none;\n  color: #ffffff;",
    ".admin-search-section-title {\n  padding: 0.75rem 0.95rem;\n  background: #ff0000;\n  background-image: none;\n  color: #000000;"
  );

  // Set Table Header background to Dark Maroon/Dark Red
  cssCode = cssCode.replace(
    ".admin-search-section-table th {\n  background: red;\n  background-image: none;\n  color: #ffffff;",
    ".admin-search-section-table th {\n  background: #700c0c;\n  background-image: none;\n  color: #ffffff;"
  );

  fs.writeFileSync(cssFile, cssCode);
  console.log('✅ Successfully patched AdminAdvancedSearchPage.css!');
}

// 12. Patch index.html to automatically reload on Chunk Load failures (Strict MIME error)
if (fs.existsSync(htmlFile)) {
  let htmlCode = fs.readFileSync(htmlFile, 'utf8');
  const targetMark = "<link href=\"https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap\" rel=\"stylesheet\" />";
  const scriptInjection = "\n    <script>\n      window.addEventListener('error', (e) => {\n        const msg = String(e.message || '');\n        if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('Expected a JavaScript-or-Wasm module script')) {\n          console.warn('Chunk load error detected, reloading page to get latest version...', e);\n          window.location.reload(true);\n        }\n      }, true);\n    </script>";
  
  if (!htmlCode.includes("Chunk load error detected")) {
    htmlCode = htmlCode.replace(targetMark, targetMark + scriptInjection);
    fs.writeFileSync(htmlFile, htmlCode);
    console.log('✅ Successfully patched index.html for auto-reloads!');
  }
}

try {
  console.log('Rebuilding app locally...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful.');
} catch (e) {
  console.error('❌ Build failed.', e.message);
}
