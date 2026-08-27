import{Y as Je,bu as Na,an as It,A as ja,l as De,al as va,bH as ya,r as h,j as e,bC as C,bI as qa,bJ as wa,bt as rt,bx as Sa,bK as _a,u as Aa,s as Ca,V as Ta,bg as Pa,br as Ia,bB as Fa,bE as Ea,B as Oa,b6 as za,aX as La,G as Qa,H as $a,ai as ka,bG as Ra,bF as Ua,T as Ma,n as Da}from"./index-Cs3ih_BA.js";const He=(t={})=>({id:t.id,userId:t.userId??t.user_id,companyId:t.companyId??t.company_id,entityType:t.entityType??t.entity_type??"",name:t.name??"",columns:Array.isArray(t.columns)?t.columns:[],filters:t.filters&&typeof t.filters=="object"?t.filters:{},sort:t.sort&&typeof t.sort=="object"?t.sort:{},isDefault:!!(t.isDefault??t.is_default),isShared:!!(t.isShared??t.is_shared)}),et={async listCustomViews(t){const s=await Je.get("/custom-views",{params:t?{entityType:t}:{}});return(Array.isArray(s==null?void 0:s.data)?s.data:[]).map(He)},async createCustomView(t){const s=await Je.post("/custom-views",t);return He((s==null?void 0:s.data)||{})},async updateCustomView(t,s){const l=await Je.put(`/custom-views/${encodeURIComponent(t)}`,s);return He((l==null?void 0:l.data)||{})},async upsertCustomViewByName(t){const s=(t==null?void 0:t.entityType)||"",l=String((t==null?void 0:t.name)||"").trim(),i=(await this.listCustomViews(s)).find(r=>String(r.name||"").trim()===l)||null;return i!=null&&i.id?this.updateCustomView(i.id,t):this.createCustomView(t)}},tt=6,at=8,it="crm-admin-quotation-manager-layout",Ft="quotation_layout_preferences",Et="Admin Quotation Manager Layout",Va=5*1024*1024,Ba=["pdf","xls","xlsx"],Ot={num:"",owner:"",date:"",company:"",amount:"",status:"",project:""},st={accountNumber:"",name:"",email:"",phone:"",accountOwner:""},Ga=[{value:"",label:"Select"},{value:"open",label:"Open"},{value:"approved",label:"Approved"},{value:"customer_approved",label:"Customer Approved"},{value:"customer_rejected",label:"Customer Rejected"},{value:"rejected",label:"Rejected"},{value:"cancelled",label:"Cancelled"}],zt=[{value:"INR",label:"INR"},{value:"USD",label:"USD"},{value:"AED",label:"AED"},{value:"NZD",label:"NZ$"},{value:"CAD",label:"CAD"},{value:"SEK",label:"SEK"},{value:"SGD",label:"SGD"},{value:"AUD",label:"AUD"},{value:"JPY",label:"JPY"},{value:"EUR",label:"Euro"},{value:"GBP",label:"GBP"},{value:"QAR",label:"QAR"},{value:"SAR",label:"SAR"},{value:"OMR",label:"OMR"}],Rt=()=>new Date().toISOString().slice(0,10),Ka=(t,s)=>{const l=new Date(t||Rt());return l.setDate(l.getDate()+s),l.toISOString().slice(0,10)},nt=()=>{const t=Rt();return{selectedAccountId:"",selectedAccountLabel:"",clientAccountNumber:"",companyName:"",contactPerson:"",address:"",email:"",phone:"",accountOwner:"",quoteNumber:"",quotationDate:t,totalAmount:"",amountCurrency:"INR",totalProductTax:"",taxCurrency:"INR",quotationStatus:"",validUntilDate:Ka(t,30),quoteFile:null,quoteFileName:""}},Se=[{key:"num",label:"Quotation Number",exportValue:t=>t.num},{key:"date",label:"Quotation Date",exportValue:t=>t.date},{key:"owner",label:"Quotation Owner",exportValue:t=>t.owner},{key:"company",label:"Company Name",exportValue:t=>t.company},{key:"project",label:"Project Name",exportValue:t=>t.project},{key:"amount",label:"Amount",exportValue:t=>t.amountLabel},{key:"status",label:"Status",exportValue:t=>t.statusLabel}],Wa=[{key:"num",label:"Quotation Number",type:"text",width:18},{key:"date",label:"Quotation Date",type:"date",align:"center",width:18},{key:"owner",label:"Quotation Owner",type:"text",width:22},{key:"company",label:"Company Name",type:"text",width:28},{key:"project",label:"Project Name",type:"text",width:28},{key:"amountLabel",label:"Amount",type:"text",width:18},{key:"statusLabel",label:"Status",type:"text",width:16}],Ue=["num","owner","date","amount","status","company","project"],ht=(t=[],s="deal")=>{const l=t.filter(Boolean),i=(s==="account"?["num","owner","date","company","amount","status","project"]:["num","owner","date","amount","status","company","project"]).filter(r=>l.includes(r));return l.forEach(r=>{i.includes(r)||i.push(r)}),i},Lt=()=>{try{const t=window.localStorage.getItem(it),s=t?JSON.parse(t):null,l=Array.isArray(s==null?void 0:s.selectedFields)&&s.selectedFields.length>0?s.selectedFields.filter(o=>Se.some(i=>i.key===o)):Ue;return{selectedFields:ht(l)}}catch{return{selectedFields:Ue}}},ot=(t={})=>{const s=Array.isArray(t==null?void 0:t.selectedFields)&&t.selectedFields.length>0?t.selectedFields.filter(l=>Se.some(o=>o.key===l)):Ue;return{selectedFields:ht(s.length>0?s:Ue)}},I={brandKey:"swati",organizationName:"Swati Switchgears India Pvt Ltd",organizationLegalName:"Swati Switchgears (India) Pvt. Ltd.",organizationAddress:"36 Shubhlaxmi Industrial Estate, Sarkhej Bavla Road, Changodar, Ahmedabad - 382210",organizationAddressLines:["36 Shubhlaxmi Industrial Estate,","Sarkhej Bavla Road, Changodar,","Ahmedabad - 382210"],organizationEmail:"mkt@swatiswitchgears.com",organizationPhone:"9913536307",organizationGstin:"24AAACZ0615P1Z7",organizationStateCode:"24",website:"www.swatiswitchgears.com",organizationTagline:"",logoType:"image"},ct={brandKey:"lumos",organizationName:"Lumos Building Automation Pvt Ltd",organizationLegalName:"Lumos Building Automation Pvt. Ltd.",organizationAddress:"Vadodara, Gujarat, India",organizationEmail:"sales@lumosbuildingautomation.com",organizationPhone:"+91 265 4000 222",organizationGstin:"24AAECL9020K1ZY",organizationStateCode:"24",website:"www.lumosbuildingautomation.com",organizationTagline:"Building automation, controls and smart infrastructure solutions.",logoType:"image"},Qt={swati:I,"swati-switch":I,"swati-switch-gear":I,lumos:ct,"lumos-building":ct},bt=[{key:"pdf",label:"View As PDF",icon:Na,iconClass:"aqp-action-icon--pdf"},{key:"preview",label:"Preview",icon:It},{key:"view",label:"View Quote",icon:It},{key:"approve",label:"Approve Quote",icon:ja},{key:"reject",label:"Reject Quote",icon:De},{key:"clone",label:"Clone Quote",icon:va},{key:"account",label:"View Account",icon:ya}],w=t=>String(t||"").trim().toLowerCase(),$t=t=>String(t||"").split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean),Za=(t={})=>[t.address,t.location,t.state].filter(Boolean).join(", "),Xa=(t="")=>{const s=String(t||"").split(".");return s.length>1?w(s.pop()):""},kt=t=>{if(!t)return"Quote File is required.";const s=Xa(t.name);return Ba.includes(s)?t.size>Va?"Quote File size must be 5 MB or less.":"":"Only PDF, XLS and XLSX files are allowed."},Ve=(t={})=>{const s=w(t.profileKey);if(s&&Qt[s])return Qt[s];const l=w(t.profileName||t.organizationName);return l.includes("swati")?I:l.includes("lumos")?ct:{}},Ya=(t={})=>Ve(t).brandKey==="swati",Ja=(t={})=>Ve(t).brandKey==="lumos",xt=t=>t==="lumos"?Ra:t==="swati"?Ua:null,Ut=t=>t==="lumos"?"lumos":t==="swati"?"swati":"",Ha=(t={})=>{const s=Ve(t);return s.logoType?s.logoType==="image":w(t.profileName||t.organizationName).includes("swati")},Mt=t=>{if(!t)return"-";const s=new Date(t);if(Number.isNaN(s.getTime()))return String(t);const l=String(s.getDate()).padStart(2,"0"),o=String(s.getMonth()+1).padStart(2,"0"),i=s.getFullYear();return`${l}-${o}-${i}`},lt=t=>{if(!t)return"-";const s=new Date(t);return Number.isNaN(s.getTime())?String(t):new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",year:"numeric"}).format(s)},S=t=>{const s=Number.parseFloat(t);return Number.isFinite(s)?s:0},m=t=>String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),gt=t=>{const s=w(t).replace(/[\s-]+/g,"_");return s?s==="accepted"?"approved":s==="new"?"draft":s:"draft"},_e=t=>{const s=gt(t),l={draft:"Draft",sent:"Sent",approved:"Approved",rejected:"Rejected",cancelled:"Cancelled",open:"Open"};return l[s]?l[s]:s.split("_").map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" ")},Dt=t=>{const s=gt(t);return s==="approved"?"aqp-status--approved":s==="rejected"?"aqp-status--rejected":s==="sent"?"aqp-status--sent":"aqp-status--open"},dt=t=>{const s=gt(t);return s==="approved"||s==="cancelled"?"aqp-num-badge--orange":"aqp-num-badge--teal"},es=(t={})=>[t==null?void 0:t.name,t==null?void 0:t.username,t==null?void 0:t.email].map(s=>w(s)).filter(Boolean),ts=(t,s)=>{var q,j,y,v,O;const l=w(t==null?void 0:t.role);if(l==="admin"||l==="super_admin")return bt.map(z=>z.key);const i=[s==null?void 0:s.owner,(q=s==null?void 0:s.raw)==null?void 0:q.selectedAccountOwner,(j=s==null?void 0:s.raw)==null?void 0:j.ownerName,(y=s==null?void 0:s.raw)==null?void 0:y.createdBy].map(z=>w(z)),r=es(t),c=i.some(z=>z&&r.includes(z)),d=!!((v=t==null?void 0:t.permissions)!=null&&v.approveQuotes||(O=t==null?void 0:t.permissions)!=null&&O.approveQuotation);if(l==="viewer"||!c&&!d)return["pdf","preview","view"];const N=["pdf","preview","view","clone"];return d&&N.push("approve","reject"),N},ut=(t,s)=>{const l=new Set(ts(t,s));return bt.filter(o=>l.has(o.key))},pt=(t,s)=>{const o=Math.max(1,t-Math.floor(2.5)),i=Math.min(s,o+5-1),r=Math.max(1,i-5+1);return Array.from({length:i-r+1},(c,d)=>r+d)},U=t=>t||"-",g=t=>String(t??"").trim().replace(/^-+\s*/,""),as=(...t)=>t.map(s=>String(s||"").trim()).filter(Boolean).join(", "),mt=(t={})=>{const l=(Array.isArray(t.lineItems)?t.lineItems:[]).filter(i=>String((i==null?void 0:i.description)||"").trim()).map((i,r)=>{const c=S(i.quantity||i.qty||0),d=S(i.rate||i.price||i.unitPrice||0),N=Number.isFinite(Number(i.amount))?Number(i.amount):c*d;return{id:i.id||`line-${r+1}`,srNo:r+1,description:i.description,quantity:c,unit:i.unit||"Nos",rate:d,amount:N}});if(l.length>0)return l;const o=[t.product,t.otherProduct,t.otherService,t.projectName].filter(Boolean).join(" / ");return!o&&!S(t.amount)?[]:[{id:t.id||"line-1",srNo:1,description:o||t.companyName||"Quotation Item",quantity:1,unit:"Nos",rate:S(t.amount),amount:S(t.amount)}]},Vt=t=>{const s=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],l=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],o=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];return t===0?"":t<10?s[t]:t<20?l[t-10]:t<100?`${o[Math.floor(t/10)]}${t%10?` ${s[t%10]}`:""}`:`${s[Math.floor(t/100)]} Hundred${t%100?` ${Vt(t%100)}`:""}`},ss=t=>{const s=Math.floor(Math.abs(S(t)));if(!s)return"Zero";const l=[{divisor:1e7,label:"Crore"},{divisor:1e5,label:"Lakh"},{divisor:1e3,label:"Thousand"},{divisor:1,label:""}];let o=s;const i=[];return l.forEach(({divisor:r,label:c})=>{if(o>=r){const d=Math.floor(o/r);o%=r,d>0&&(i.push(Vt(d)),c&&i.push(c))}}),i.join(" ").trim()},Bt=(t,s)=>{if(!t)return null;const l=s.find(r=>String(r.id)===String(t.selectedAccountId||""));if(l)return l;const o=w(t.clientAccountNumber);if(o){const r=s.find(c=>w(c.accountNumber)===o);if(r)return r}const i=w(t.companyName);if(i){const r=s.find(c=>w(c.name)===i);if(r)return r}return null},Re=(t,s)=>{var $,Ne,se;const l=Ve(t),o=l.brandKey?l:I,i=Ya(t)||!l.brandKey,r=Ja(t),c=!!l.brandKey,d=o.brandKey||(i?"swati":r?"lumos":"swati"),N=xt(d),q=mt(t),j=q.reduce((Be,D)=>Be+S(D.amount),0),y=S(t.cgstAmount||t.cgst||0),v=S(t.sgstAmount||t.sgst||0),O=S(t.igstAmount||t.igst||0),z=S(t.taxAmount||0),Ae=S(t.amount),te=j+y+v+O+z,xe=Ae>0?Math.max(Ae,te):te,Ce=t.logoType||l.logoType||(Ha(t)?"image":"text"),L=t.clientAddressDetails||as(s==null?void 0:s.address,s==null?void 0:s.location,s==null?void 0:s.state)||"-",M=c?o.organizationName:t.organizationName||o.organizationName||t.profileName||I.organizationName,Te=c?o.organizationLegalName||M:t.organizationLegalName||o.organizationLegalName||M,ge=c?o.organizationAddress||"":t.organizationAddress||o.organizationAddress||I.organizationAddress,ae=o.organizationAddressLines||$t(ge),Pe=c?o.organizationEmail||"":t.organizationEmail||o.organizationEmail||I.organizationEmail,fe=c?o.organizationPhone||"":t.organizationPhone||o.organizationPhone||I.organizationPhone,Ie=c?o.organizationGstin||"":t.organizationGstin||o.organizationGstin||I.organizationGstin,Q=c?o.organizationStateCode||"":t.organizationStateCode||o.organizationStateCode||I.organizationStateCode;return{id:t.id,quotationNumber:t.quotationNumber||"-",quotationDate:lt(t.quotationDate||t.createdAt),validUntil:lt(t.validUntil),currency:t.currency||o.currency||"INR",statusLabel:_e(t.status),profileName:t.profileName||"-",brandKey:d,brandClassName:Ut(d),logoSource:N,isSwatiDocument:i,isLumosDocument:r,organizationName:M,organizationLegalName:Te,organizationAddress:ge,organizationAddressLines:ae,organizationEmail:Pe,organizationPhone:fe,organizationGstin:Ie,organizationStateCode:Q,website:c?o.website||"":t.website||o.website||I.website,organizationTagline:t.organizationTagline||o.organizationTagline||"",logoType:Ce,companyName:t.companyName||(s==null?void 0:s.name)||"-",clientAccountNumber:t.clientAccountNumber||(s==null?void 0:s.accountNumber)||"-",contactPerson:t.contactPerson||(s==null?void 0:s.contactPerson)||"-",telephone:t.telephone||(s==null?void 0:s.phone)||(s==null?void 0:s.contactPhone)||"-",email:t.email||(s==null?void 0:s.email)||(s==null?void 0:s.contactEmail)||"-",gstin:t.gstin||(s==null?void 0:s.gstin)||"-",stateCode:t.stateCode||(s==null?void 0:s.stateCode)||"-",accountOwner:(s==null?void 0:s.accountOwnerDisplay)||t.selectedAccountOwner||(s==null?void 0:s.accountOwner)||"-",customerReferenceNumber:(($=t.customerReference)==null?void 0:$.number)||"-",customerReferenceDate:lt((Ne=t.customerReference)==null?void 0:Ne.date),customerReferenceSubject:((se=t.customerReference)==null?void 0:se.subject)||"-",quotationSubject:t.quotationSubject||"-",projectName:t.projectName||"-",clientAddressDetails:L,clientAddressLines:$t(L==="-"?"":L),product:t.product||"-",otherProduct:t.otherProduct||"-",otherService:t.otherService||"-",deliveryTerms:t.deliveryTerms||"-",paymentTerms:t.paymentTerms||"-",warrantyTerms:t.warrantyTerms||"-",quotationNotes:t.quotationNotes||"-",rejectionReason:t.rejectionReason||"",lineItems:q,subtotal:j,cgst:y,sgst:v,igst:O,otherTax:z,total:xe,amountInWords:`${ss(xe)} ${t.currency==="USD"?"US Dollars":t.currency==="EUR"?"Euros":"Rupees"} Only`}},ns=[{key:"srNo",label:"Sr No",type:"integer",align:"center",width:8},{key:"description",label:"Description",align:"left",width:48,wrap:!0},{key:"quantity",label:"Qty",type:"number",align:"right",width:10},{key:"unit",label:"Unit",align:"center",width:10},{key:"rate",label:"Rate",type:"currency",align:"right",width:16},{key:"amount",label:"Amount",type:"currency",align:"right",width:18}],os=t=>{if(!t)return null;const s=d=>{const N=String(d??"").trim();return N&&N!=="-"?N:""},l=[{label:"Quotation No.",value:s(t.quotationNumber)},{label:"Quotation Date",value:s(t.quotationDate)},{label:"Valid Until",value:s(t.validUntil)},{label:"Status",value:s(t.statusLabel)},{label:"Currency",value:s(t.currency)},{label:"Profile",value:s(t.profileName)},{label:"Customer",value:s(t.companyName)},{label:"Account No.",value:s(t.clientAccountNumber)},{label:"Contact Person",value:s(t.contactPerson)},{label:"Telephone",value:s(t.telephone)},{label:"Email",value:s(t.email)},{label:"GSTIN",value:s(t.gstin)},{label:"State Code",value:s(t.stateCode)},{label:"Account Owner",value:s(t.accountOwner)},{label:"Customer Address",value:s(t.clientAddressDetails)},{label:"Project Name",value:s(t.projectName)},{label:"Quotation Subject",value:s(t.quotationSubject)},{label:"Inquiry Ref No",value:s(t.customerReferenceNumber)},{label:"Inquiry Ref Date",value:s(t.customerReferenceDate)},{label:"Inquiry Subject",value:s(t.customerReferenceSubject)},{label:"Delivery Terms",value:s(t.deliveryTerms)},{label:"Payment Terms",value:s(t.paymentTerms)},{label:"Warranty Terms",value:s(t.warrantyTerms)},{label:"Quotation Notes",value:s(t.quotationNotes)}].filter(d=>d.value);t.rejectionReason&&l.push({label:"Rejection Reason",value:t.rejectionReason});const o=(t.lineItems||[]).map(d=>({srNo:d.srNo,description:d.description,quantity:d.quantity,unit:d.unit,rate:d.rate,amount:d.amount})),i=[],r=(d,N)=>{!Number.isFinite(Number(N))||Number(N)===0||i.push({srNo:"",description:d,quantity:"",unit:"",rate:"",amount:Number(N)})};r("Subtotal",t.subtotal),r("CGST",t.cgst),r("SGST",t.sgst),r("IGST",t.igst),r("Other Tax",t.otherTax),r("Total",t.total),t.amountInWords&&i.push({srNo:"",description:`Amount in Words: ${t.amountInWords}`,quantity:"",unit:"",rate:"",amount:""});const c=[...o,...i];return{title:`Sales Quotation - ${s(t.quotationNumber)||"Draft"}`,subtitle:s(t.companyName)||s(t.organizationName),sheetName:"Quotation",companyName:t.organizationName,metadata:l,columns:ns,rows:c}},Gt=t=>{const s=t.logoSource||xt(t.brandKey),l=t.brandClassName||Ut(t.brandKey),o=t.lineItems.map(r=>`
    <tr>
      <td class="text-center">${r.srNo}</td>
      <td class="description-cell">${m(r.description)}</td>
      <td class="text-center">${m(r.quantity)}</td>
      <td class="text-center">${m(r.unit)}</td>
      <td class="money">${m(C(r.rate,t.currency))}</td>
      <td class="money">${m(C(r.amount,t.currency))}</td>
    </tr>
  `).join(""),i=s?`<div class="logo-wrap logo-wrap--${m(l||"default")}"><img src="${s}" alt="${m(t.organizationName)}" class="logo logo--${m(l||"default")}" /></div>`:`<div class="logo-text">${m(t.organizationName)}</div>`;return`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${m(t.quotationNumber)} - Sales Quotation</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #1f2933; background: #ffffff; }
        .print-shell { padding: 14px; }
        .print-toolbar {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          width: 100%;
          max-width: 980px;
          margin: 0 auto 14px;
        }
        .print-toolbar button {
          padding: 10px 16px;
          border: 1px solid #1f6ea4;
          border-radius: 8px;
          background: linear-gradient(180deg, #3291d1 0%, #1f6ea4 100%);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .print-toolbar button:last-child {
          border-color: #c7d6e2;
          background: #ffffff;
          color: #355163;
        }
        .quotation-print {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #c9d5df;
        }
        .quotation-header {
          padding: 18px 16px 0;
          background: #ffffff;
        }
        .quotation-main {
          padding: 12px 16px 16px;
        }
        .quotation-footer {
          border-top: 1px solid #d5e0ea;
          padding: 12px 18px;
          text-align: center;
          font-size: 10.5px;
          line-height: 1.5;
          color: #52606d;
          background: #ffffff;
        }
        .brand-head {
          text-align: center;
          padding-bottom: 12px;
        }
        .logo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 0;
          width: fit-content;
          max-width: 100%;
          margin: 0 auto 8px;
          padding: 0;
          border: none;
          background: transparent;
          box-shadow: none;
        }
        .logo {
          display: block;
          width: 213px;
          height: 142px;
          max-width: 100%;
          max-height: 152px;
          object-fit: contain;
          object-position: center;
          padding: 0;
          border: none;
          background: transparent;
          box-shadow: none;
          filter: none;
          opacity: 1;
        }
        .logo--swati {
          width: 196px;
          height: 148px;
          max-height: 159px;
        }
        .logo--lumos {
          width: 311px;
          height: 142px;
          max-height: 152px;
          background: transparent;
          border-radius: 0;
          padding: 0;
        }
        .logo-text {
          font-size: 18px;
          font-weight: 800;
          color: #164f7d;
          margin-bottom: 8px;
        }
        .company-name {
          margin: 0;
          font-size: 20px;
          line-height: 1.25;
          font-weight: 800;
          color: #102a43;
        }
        .company-contact {
          margin-top: 7px;
          font-size: 10px;
          line-height: 1.5;
          color: #52606d;
        }
        .party-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .party-card {
          border: 1px solid #a9dfe3;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 10.5px;
          line-height: 1.42;
          background: #ffffff;
        }
        .section-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #1f6ea4;
          margin-bottom: 8px;
        }
        .field-row {
          display: grid;
          grid-template-columns: 92px minmax(0, 1fr);
          gap: 8px;
          margin-top: 5px;
        }
        .field-row strong {
          color: #243b53;
          font-weight: 700;
        }
        .field-row span {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        h1 {
          margin: 0;
          padding: 12px 14px;
          text-align: center;
          font-size: 19px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: 1px;
          border-top: 1px solid #d5e0ea;
          border-bottom: 1px solid #d5e0ea;
          background: #dc2626;
          border-color: #b91c1c;
          color: #ffffff;
        }
        h2, h3, p { margin: 0 0 6px; }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid #cbd9e3;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .meta-cell {
          padding: 9px 10px;
          border-right: 1px solid #d5e0ea;
          background: #f4f8fb;
        }
        .meta-cell:last-child { border-right: none; }
        .meta-label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          color: #627d98;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }
        .meta-value {
          font-size: 10px;
          font-weight: 700;
          color: #102a43;
        }
        table { width: 100%; border-collapse: collapse; }
        .items-table {
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
        }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        .items-table th,
        .items-table td {
          box-sizing: border-box;
          border: 1px solid #c9d5df;
          padding: 6px 6px;
          font-size: 10px;
          vertical-align: top;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .items-table th:nth-child(1),
        .items-table td:nth-child(1) { width: 42px !important; }
        .items-table th:nth-child(2),
        .items-table td:nth-child(2) { width: auto !important; }
        .items-table th:nth-child(3),
        .items-table td:nth-child(3) { width: 50px !important; }
        .items-table th:nth-child(4),
        .items-table td:nth-child(4) { width: 58px !important; }
        .items-table th:nth-child(5),
        .items-table td:nth-child(5) { width: 84px !important; }
        .items-table th:nth-child(6),
        .items-table td:nth-child(6) { width: 92px !important; }
        .items-table th {
          background: #dc2626;
          color: #ffffff;
          font-size: 8.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: center;
        }
        .description-cell {
          overflow-wrap: anywhere;
          line-height: 1.3;
        }
        .text-center { text-align: center; }
        .money {
          text-align: right;
          white-space: nowrap;
        }
        .summary-layout {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
          margin-top: 10px;
        }
        .summary-card,
        .totals-card,
        .terms-card {
          border: 1px solid #a9dfe3;
          border-radius: 10px;
          padding: 10px 12px;
          background: #ffffff;
        }
        .summary-card,
        .totals-card { min-height: 158px; }
        .detail-row,
        .total-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 5px 0;
          border-bottom: 1px solid #edf2f7;
          font-size: 10px;
        }
        .detail-row:last-child,
        .total-row:last-child { border-bottom: none; }
        .detail-row strong,
        .total-row strong { color: #243b53; }
        .detail-row span,
        .total-row span {
          text-align: right;
          overflow-wrap: anywhere;
        }
        .totals-table td {
          padding: 7px 8px;
          border-bottom: 1px solid #d9e2ec;
          font-size: 11px;
        }
        .totals-table td:last-child { text-align: right; }
        .totals-table tr:last-child td { border-bottom: none; }
        .grand-total td {
          border-top: 2px solid #1f6ea4;
          font-weight: 700;
          background: #eff6ff;
        }
        .amount-words {
          margin-top: 12px;
          border: 1px solid #cbd9e3;
          border-radius: 4px;
          padding: 9px 10px;
          font-size: 10px;
          line-height: 1.5;
          background: #f4f8fb;
        }
        .amount-words strong {
          display: block;
          margin-bottom: 4px;
          color: #102a43;
        }
        .terms-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .terms-title {
          margin: 0 0 8px;
          font-size: 9px;
          text-transform: uppercase;
          color: #1f6ea4;
        }
        .terms-value {
          font-size: 10px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        @page {
          size: A4;
          margin: 10mm;
        }
        @media print {
          body { background: #ffffff; }
          .print-shell { padding: 0; }
          .print-toolbar { display: none; }
          .quotation-print { max-width: none; border: none; }
          .quotation-header { padding: 0 0 0; }
          .quotation-main { padding: 14px 0 16px; }
          .items-table thead { display: table-header-group; }
          tr, .party-card, .summary-card, .totals-card, .terms-card, .amount-words { page-break-inside: avoid; }
        }
        @media (max-width: 840px) {
          .print-shell { padding: 12px; }
          .party-grid,
          .meta-grid,
          .summary-layout,
          .terms-grid {
            grid-template-columns: 1fr;
          }
          .meta-cell { border-right: none; border-bottom: 1px solid #d5e0ea; }
          .meta-cell:last-child { border-bottom: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-shell">
        <div class="print-toolbar">
          <button type="button" onclick="window.print()">Print / Save PDF</button>
          <button type="button" onclick="window.close()">Close</button>
        </div>
        <div class="quotation-print">
          <div class="quotation-header">
            <div class="brand-head">
              ${i}
              <h2 class="company-name">${m(t.organizationName)}</h2>
              <div class="company-contact">
                ${m(t.organizationAddress)}<br />
                Email: ${m(t.organizationEmail)} | Phone: ${m(t.organizationPhone)} | GSTIN: ${m(t.organizationGstin)}
              </div>
            </div>
            <div class="party-grid">
              <div class="party-card">
                <div class="section-label">Customer Details</div>
                <div class="field-row"><strong>Customer Name</strong><span>${m(g(t.companyName))}</span></div>
                <div class="field-row"><strong>Client Account No.</strong><span>${m(g(t.clientAccountNumber))}</span></div>
                <div class="field-row"><strong>Contact Person</strong><span>${m(g(t.contactPerson))}</span></div>
                <div class="field-row"><strong>Email</strong><span>${m(g(t.email))}</span></div>
                <div class="field-row"><strong>GSTIN</strong><span>${m(g(t.gstin))}</span></div>
                <div class="field-row"><strong>Address</strong><span>${m(g(t.clientAddressDetails))}</span></div>
              </div>
              <div class="party-card">
                <div class="section-label">Sales Details</div>
                <div class="field-row"><strong>Sales Executive</strong><span>${m(t.accountOwner)}</span></div>
                <div class="field-row"><strong>Mobile Number</strong><span>${m(t.organizationPhone)}</span></div>
                <div class="field-row"><strong>Email Address</strong><span>${m(t.organizationEmail)}</span></div>
                <div class="field-row"><strong>Quotation Reference</strong><span>${m(t.quotationNumber)}</span></div>
              </div>
            </div>
          <h1>SALES QUOTATION</h1>
          </div>
          <div class="quotation-main">
            <div class="meta-grid">
              <div class="meta-cell">
                <div class="meta-label">Quotation No.</div>
                <div class="meta-value">${m(t.quotationNumber)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Quotation Date</div>
                <div class="meta-value">${m(t.quotationDate)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Valid Until</div>
                <div class="meta-value">${m(t.validUntil)}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Currency</div>
                <div class="meta-value">${m(t.currency)}</div>
              </div>
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width:42px;">Sr.</th>
                  <th>Description</th>
                  <th style="width:50px;">Qty</th>
                  <th style="width:58px;">Unit</th>
                  <th style="width:84px;">Rate</th>
                  <th style="width:92px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${o||'<tr><td colspan="6">No quotation items available.</td></tr>'}
              </tbody>
            </table>

            <div class="summary-layout">
              <div class="summary-card">
                <div class="section-label">Quotation Details</div>
                <div class="detail-row"><strong>Profile Name</strong><span>${m(g(t.profileName))}</span></div>
                <div class="detail-row"><strong>Project</strong><span>${m(g(t.projectName))}</span></div>
                <div class="detail-row"><strong>Account Owner</strong><span>${m(g(t.accountOwner))}</span></div>
                <div class="detail-row"><strong>Subject</strong><span>${m(g(t.quotationSubject))}</span></div>
                <div class="detail-row"><strong>Product</strong><span>${m([t.product,t.otherProduct].filter(r=>r&&r!=="-").join(" / "))}</span></div>
                <div class="detail-row"><strong>Service</strong><span>${m(g(t.otherService))}</span></div>
              </div>
              <div class="totals-card">
                <div class="section-label">Amount Summary</div>
                <div class="total-row"><strong>Sub Total</strong><span>${m(C(t.subtotal,t.currency))}</span></div>
                <div class="total-row"><strong>CGST</strong><span>${m(C(t.cgst,t.currency))}</span></div>
                <div class="total-row"><strong>SGST</strong><span>${m(C(t.sgst,t.currency))}</span></div>
                <div class="total-row"><strong>IGST</strong><span>${m(C(t.igst,t.currency))}</span></div>
                <div class="total-row"><strong>Other Tax</strong><span>${m(C(t.otherTax,t.currency))}</span></div>
                <div class="total-row grand-total"><strong>Total Amount</strong><span>${m(C(t.total,t.currency))}</span></div>
              </div>
            </div>

            <div class="amount-words"><strong>Amount in Words</strong>${m(t.amountInWords)}</div>

            <div class="terms-grid">
              <div class="terms-card">
                <h3 class="terms-title">Inquiry Reference</h3>
                <div class="terms-value">Number: ${m(g(t.customerReferenceNumber))}&#10;Date: ${m(g(t.customerReferenceDate))}&#10;Subject: ${m(g(t.customerReferenceSubject))}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Terms &amp; Conditions</h3>
                <div class="terms-value">Delivery: ${m(g(t.deliveryTerms))}&#10;Payment: ${m(g(t.paymentTerms))}&#10;Warranty: ${m(g(t.warrantyTerms))}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Quotation Notes</h3>
                <div class="terms-value">${m(g(t.quotationNotes))}</div>
              </div>
              <div class="terms-card">
                <h3 class="terms-title">Status</h3>
                <div class="terms-value">Status: ${m(t.statusLabel)}${t.rejectionReason?`&#10;Reason: ${m(t.rejectionReason)}`:""}</div>
              </div>
            </div>
          </div>
          <div class="quotation-footer">
            <strong>${m(t.organizationName)}</strong><br />
            Website: ${m(t.website||I.website)} | Email: ${m(t.organizationEmail)} | Phone: ${m(t.organizationPhone)}
          </div>
        </div>
      </div>
    </body>
  </html>`},be=t=>{if(!t)return;const s=document.title,l=`Quotation-${(t==null?void 0:t.quotationNumber)||"Document"}.pdf`,o=document.createElement("iframe");let i=null;o.title=l,o.setAttribute("aria-hidden","true"),o.style.position="fixed",o.style.left="-10000px",o.style.top="0",o.style.width="1024px",o.style.height="768px",o.style.border="0",o.style.opacity="0";const r=()=>{i&&window.clearTimeout(i),document.title=s,window.removeEventListener("afterprint",r),o.parentNode&&o.parentNode.removeChild(o)},c=()=>{const d=o.contentDocument;if(!d)return Promise.resolve();const N=Array.from(d.images||[]);return Promise.all(N.map(q=>q.complete?Promise.resolve():new Promise(j=>{q.onload=j,q.onerror=j})))};o.onload=()=>{c().then(()=>{const d=o.contentWindow;if(!d){r();return}document.title=l,window.addEventListener("afterprint",r),i=window.setTimeout(r,2500),d.focus(),d.print()})},document.title=l,document.body.appendChild(o),o.srcdoc=Gt(t)};function Kt({status:t}){return e.jsx("span",{className:`aqp-status ${Dt(t)}`,children:_e(t)})}function K({title:t,onClose:s,size:l="",children:o,footer:i}){return h.useEffect(()=>{const r=c=>{c.key==="Escape"&&s()};return document.addEventListener("keydown",r),()=>document.removeEventListener("keydown",r)},[s]),e.jsx("div",{className:"aqp-overlay",role:"presentation",onClick:s,children:e.jsxs("div",{className:`aqp-modal ${l}`.trim(),role:"dialog","aria-modal":"true",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"aqp-modal-header",children:[e.jsx("span",{className:"aqp-modal-title",children:t}),e.jsx("button",{type:"button",className:"aqp-modal-close",onClick:s,"aria-label":"Close",children:e.jsx(De,{})})]}),e.jsx("div",{className:"aqp-modal-body",children:o}),i?e.jsx("div",{className:"aqp-modal-footer",children:i}):null]})})}const ls=({value:t,fieldKey:s,editable:l=!1,multiline:o=!1,className:i="",onCommit:r})=>{const[c,d]=h.useState(!1),[N,q]=h.useState(t||"");h.useEffect(()=>{c||q(t||"")},[c,t]);const j=()=>{const y=String(N||"").trim();d(!1),y!==String(t||"").trim()&&(r==null||r(s,y))};return!l||!s?e.jsx("span",{className:i,children:t}):c?o?e.jsx("textarea",{className:"aqp-doc-edit-input aqp-doc-edit-input--textarea",value:N,onChange:y=>q(y.target.value),onBlur:j,onKeyDown:y=>{y.key==="Escape"&&d(!1),(y.ctrlKey||y.metaKey)&&y.key==="Enter"&&j()},autoFocus:!0}):e.jsx("input",{className:"aqp-doc-edit-input",value:N,onChange:y=>q(y.target.value),onBlur:j,onKeyDown:y=>{y.key==="Escape"&&d(!1),y.key==="Enter"&&j()},autoFocus:!0}):e.jsxs("span",{className:`aqp-doc-editable ${i}`.trim(),children:[e.jsx("span",{className:"aqp-doc-editable-value",children:t}),e.jsx("button",{type:"button",className:"aqp-doc-edit-btn",onClick:()=>{q(t||""),d(!0)},"aria-label":"Edit quotation field",children:e.jsx(Da,{})})]})},rs=(t,s,l)=>(o,i,r={})=>e.jsx(ls,{fieldKey:o,value:i,editable:s,multiline:r.multiline,className:r.className,onCommit:l});function Me({documentData:t,editable:s=!1,onEditField:l}){const o=t.logoSource||xt(t.brandKey),i=t.isLumosDocument?"lumos":t.isSwatiDocument?"swati":"default",r=[t.product,t.otherProduct].filter(d=>d&&d!=="-").join(" / "),c=rs(t,s,l);return e.jsx("div",{className:"aqp-doc aqp-print-scope",children:e.jsxs("div",{className:"aqp-doc__frame",children:[e.jsxs("div",{className:"aqp-doc__brand-head",children:[e.jsx("div",{className:`aqp-doc__logo-wrap aqp-doc__logo-wrap--${i}`,children:o?e.jsx("img",{src:o,alt:t.organizationName,className:`aqp-doc__brand-logo aqp-doc__brand-logo--${i}`}):e.jsx("div",{className:"aqp-doc__text-logo",children:t.organizationName})}),e.jsx("h2",{children:t.organizationName}),e.jsxs("p",{children:[t.organizationAddress,e.jsx("br",{}),"Email: ",t.organizationEmail," | Phone: ",t.organizationPhone," | GSTIN: ",t.organizationGstin]})]}),e.jsxs("div",{className:"aqp-doc__party-grid",children:[e.jsxs("section",{className:"aqp-doc__party-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Customer Details"}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Customer Name"}),c("companyName",g(t.companyName))]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Client Account No."}),c("clientAccountNumber",g(t.clientAccountNumber))]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Contact Person"}),c("contactPerson",g(t.contactPerson))]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Email"}),c("email",g(t.email))]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"GSTIN"}),c("gstin",g(t.gstin))]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Address"}),c("clientAddressDetails",g(t.clientAddressDetails),{multiline:!0})]})]}),e.jsxs("section",{className:"aqp-doc__party-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Sales Details"}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Sales Executive"}),c("selectedAccountOwner",t.accountOwner)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Mobile Number"}),c("organizationPhone",t.organizationPhone)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Email Address"}),c("organizationEmail",t.organizationEmail)]}),e.jsxs("div",{className:"aqp-doc__field-row",children:[e.jsx("strong",{children:"Quotation Reference"}),c("quotationNumber",t.quotationNumber)]})]})]}),e.jsx("div",{className:"aqp-doc__title",children:"SALES QUOTATION"}),e.jsxs("div",{className:"aqp-doc__meta",children:[e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Quotation No."}),e.jsx("strong",{children:c("quotationNumber",t.quotationNumber)})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Quotation Date"}),e.jsx("strong",{children:c("quotationDate",t.quotationDate)})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Valid Until"}),e.jsx("strong",{children:c("validUntil",t.validUntil)})]}),e.jsxs("div",{className:"aqp-doc__meta-cell",children:[e.jsx("span",{className:"aqp-doc__meta-label",children:"Currency"}),e.jsx("strong",{children:c("currency",t.currency)})]})]}),e.jsxs("table",{className:"aqp-doc__table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"42px"},children:"Sr."}),e.jsx("th",{children:"Description"}),e.jsx("th",{style:{width:"50px"},children:"Qty"}),e.jsx("th",{style:{width:"58px"},children:"Unit"}),e.jsx("th",{style:{width:"84px"},children:"Rate"}),e.jsx("th",{style:{width:"92px"},children:"Amount"})]})}),e.jsx("tbody",{children:t.lineItems.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:6,children:"No quotation items available."})}):t.lineItems.map(d=>e.jsxs("tr",{children:[e.jsx("td",{className:"aqp-doc__num",children:d.srNo}),e.jsx("td",{className:"aqp-doc__description",children:c(`lineItems.${d.srNo-1}.description`,d.description,{multiline:!0})}),e.jsx("td",{className:"aqp-doc__num",children:c(`lineItems.${d.srNo-1}.quantity`,d.quantity)}),e.jsx("td",{className:"aqp-doc__num",children:c(`lineItems.${d.srNo-1}.unit`,d.unit)}),e.jsx("td",{className:"aqp-doc__amount",children:c(`lineItems.${d.srNo-1}.rate`,C(d.rate,t.currency))}),e.jsx("td",{className:"aqp-doc__amount",children:C(d.amount,t.currency)})]},d.id))})]}),e.jsxs("div",{className:"aqp-doc__summary",children:[e.jsxs("div",{className:"aqp-doc__summary-card",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Quotation Details"}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Profile Name"}),c("profileName",g(t.profileName))]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Project"}),c("projectName",g(t.projectName))]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Account Owner"}),c("selectedAccountOwner",g(t.accountOwner))]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Subject"}),c("quotationSubject",g(t.quotationSubject))]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Product"}),c("product",r)]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Service"}),c("otherService",g(t.otherService))]})]}),e.jsxs("div",{className:"aqp-doc__totals",children:[e.jsx("div",{className:"aqp-doc__eyebrow",children:"Amount Summary"}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Sub Total"}),e.jsx("span",{children:C(t.subtotal,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"CGST"}),e.jsx("span",{children:C(t.cgst,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"SGST"}),e.jsx("span",{children:C(t.sgst,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"IGST"}),e.jsx("span",{children:C(t.igst,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row",children:[e.jsx("strong",{children:"Other Tax"}),e.jsx("span",{children:C(t.otherTax,t.currency)})]}),e.jsxs("div",{className:"aqp-doc__kv-row aqp-doc__grand-total",children:[e.jsx("strong",{children:"Total Amount"}),e.jsx("span",{children:C(t.total,t.currency)})]})]})]}),e.jsxs("div",{className:"aqp-doc__amount-words",children:[e.jsx("strong",{children:"Amount in Words"}),e.jsx("span",{children:t.amountInWords})]}),e.jsxs("div",{className:"aqp-doc__terms",children:[e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Inquiry Reference"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Number:"})," ",c("customerReference.number",g(t.customerReferenceNumber))]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Date:"})," ",c("customerReference.date",g(t.customerReferenceDate))]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Subject:"})," ",c("customerReference.subject",g(t.customerReferenceSubject))]})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Terms & Conditions"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Delivery:"})," ",c("deliveryTerms",g(t.deliveryTerms))]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Payment:"})," ",c("paymentTerms",g(t.paymentTerms))]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Warranty:"})," ",c("warrantyTerms",g(t.warrantyTerms))]})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Quotation Notes"}),e.jsx("p",{children:c("quotationNotes",g(t.quotationNotes),{multiline:!0})})]}),e.jsxs("section",{className:"aqp-doc__terms-card",children:[e.jsx("h4",{children:"Status"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Status:"})," ",t.statusLabel]}),t.rejectionReason?e.jsxs("p",{children:[e.jsx("strong",{children:"Reason:"})," ",t.rejectionReason]}):null]})]}),e.jsxs("div",{className:"aqp-doc__footer",children:[e.jsx("strong",{children:t.organizationName}),e.jsx("br",{}),"Website: ",t.website||I.website," | Email: ",t.organizationEmail," | Phone: ",t.organizationPhone]})]})})}function Wt({documentData:t,title:s,subtitle:l,onBack:o,onPrint:i,onDownload:r}){const[c,d]=h.useState(100),[N,q]=h.useState(!1);h.useEffect(()=>{d(100)},[t]),h.useEffect(()=>{if(!N)return;const v=()=>q(!1);return window.addEventListener("click",v),()=>window.removeEventListener("click",v)},[N]);const j=s||`QUOTATION - ${(t==null?void 0:t.quotationNumber)||"-"}`,y=l||(t==null?void 0:t.companyName)||"-";return e.jsxs("div",{className:"aqp-page aqp-page--pdf",children:[e.jsxs("div",{className:"aqp-pdf-toolbar",children:[e.jsxs("div",{className:"aqp-pdf-toolbar-copy",children:[e.jsx("h1",{children:j}),e.jsx("p",{children:y})]}),e.jsxs("div",{className:"aqp-pdf-toolbar-actions",children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:o,children:"Back"}),e.jsx("button",{type:"button",className:"aqp-pdf-close-btn",onClick:o,"aria-label":"Close quotation PDF",children:e.jsx(De,{})}),e.jsx("div",{className:"aqp-pdf-toolbar-status",children:e.jsx("span",{children:"PDF View"})}),e.jsxs("div",{className:"aqp-pdf-toolbar-zoom",children:[e.jsx("button",{type:"button",className:"aqp-pdf-icon-btn",onClick:()=>d(v=>Math.max(70,v-10)),"aria-label":"Zoom out",children:e.jsx(qa,{})}),e.jsxs("span",{className:"aqp-pdf-zoom-value",children:[c,"%"]}),e.jsx("button",{type:"button",className:"aqp-pdf-icon-btn",onClick:()=>d(v=>Math.min(160,v+10)),"aria-label":"Zoom in",children:e.jsx(wa,{})})]}),e.jsxs("button",{type:"button",className:"aqp-pdf-action-btn",onClick:i,"aria-label":"Print quotation",children:[e.jsx(rt,{}),"Print"]}),e.jsxs("button",{type:"button",className:"aqp-pdf-action-btn",onClick:()=>{if(typeof r=="function"){r();return}be(t)},"aria-label":"Download quotation PDF",children:[e.jsx(Sa,{}),"Download PDF"]}),e.jsxs("div",{className:"aqp-pdf-more",children:[e.jsx("button",{type:"button",className:`aqp-pdf-icon-btn${N?" aqp-pdf-icon-btn--active":""}`,"aria-label":"More options",onClick:v=>{v.stopPropagation(),q(O=>!O)},"aria-expanded":N,"aria-haspopup":"menu",children:e.jsx(_a,{})}),N?e.jsxs("div",{className:"aqp-action-menu aqp-action-menu--viewer",onClick:v=>v.stopPropagation(),children:[e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{d(100),q(!1)},children:"Reset Zoom"}),e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{d(90),q(!1)},children:"Fit Document"}),e.jsx("button",{type:"button",className:"aqp-action-item",onClick:()=>{i(),q(!1)},children:"Print / Save PDF"})]}):null]})]})]}),e.jsx("div",{className:"aqp-pdf-workspace",children:e.jsx("div",{className:"aqp-pdf-stage",children:e.jsx("div",{className:"aqp-pdf-canvas",children:e.jsx("div",{className:"aqp-pdf-zoom-surface",style:{zoom:c/100},children:e.jsx(Me,{documentData:t})})})})})]})}const is=({allowUsers:t=!1,generatorPath:s="/admin/quotations"})=>{const l=Aa(),{user:o}=Ca(),{quotations:i,quotationsLoading:r,quotationsError:c,accounts:d,createQuotation:N,updateQuotation:q,addNotification:j}=Ta(),y=t||o&&(o.role==="admin"||o.role==="super_admin");h.useEffect(()=>{y||l("/unauthorized",{replace:!0})},[y,l]);const[v,O]=h.useState("account"),[z]=h.useState(!1),[Ae,te]=h.useState(!1),[xe,Ce]=h.useState(Lt),[L,M]=h.useState(Lt),[Te,ge]=h.useState(""),[ae,Pe]=h.useState(""),[fe,Ie]=h.useState(Ot),[Q,$]=h.useState(1),[Ne,se]=h.useState(!1),[Be,D]=h.useState(!1),[p,ne]=h.useState(nt),[_,V]=h.useState({}),[ft,k]=h.useState(""),[je,Nt]=h.useState(!1),[W,Ge]=h.useState(st),[Z,X]=h.useState(1),[oe,Ke]=h.useState(null),[We,jt]=h.useState(null),[F,le]=h.useState(null),[Ze,Fe]=h.useState(!1),[T,vt]=h.useState(null),[Y,Xe]=h.useState(null),[J,Ye]=h.useState(null),[yt,Ee]=h.useState(""),[Oe,ve]=h.useState(""),[re,ze]=h.useState(""),[qt,Zt]=Pa(),ye=qt.get("view")||"",ie=h.useMemo(()=>ht(xe.selectedFields,v).map(a=>Se.find(n=>n.key===a)).filter(Boolean),[xe.selectedFields,v]),Xt=h.useMemo(()=>Se.filter(a=>!L.selectedFields.includes(a.key)),[L.selectedFields]),ce=h.useMemo(()=>d.map((a,n)=>Ia(a,n,{recordSource:"admin-quotation-view"})).sort(Fa),[d]),de=h.useMemo(()=>ce.find(a=>String(a.id)===String(p.selectedAccountId||""))||null,[ce,p.selectedAccountId]),qe=h.useMemo(()=>ce.filter(a=>Object.entries(W).every(([n,u])=>{const x=w(u);if(!x)return!0;const b=n==="accountOwner"?a.accountOwnerDisplay||a.accountOwner||"":a[n];return w(b).includes(x)})),[W,ce]),ue=h.useMemo(()=>Math.max(1,Math.ceil(qe.length/at)),[qe.length]),Yt=h.useMemo(()=>pt(Z,ue),[Z,ue]),wt=h.useMemo(()=>{const a=(Z-1)*at;return qe.slice(a,a+at)},[Z,qe]),pe=h.useMemo(()=>i.map((a,n)=>{const u=Bt(a,ce),x=S(a.amount)||mt(a).reduce((b,P)=>b+S(P.amount),0);return{id:a.id||`quotation-${n}`,num:a.quotationNumber||`Quotation ${n+1}`,owner:(u==null?void 0:u.accountOwnerDisplay)||a.selectedAccountOwner||(u==null?void 0:u.accountOwner)||"-",date:Mt(a.quotationDate||a.createdAt),dateSort:a.quotationDate||a.createdAt||"",company:a.companyName||(u==null?void 0:u.name)||a.clientName||"-",amount:x,amountLabel:C(x,a.currency||"INR"),status:a.status||"draft",statusLabel:_e(a.status),project:a.projectName||a.product||a.otherProduct||a.otherService||"-",profileName:a.profileName||"-",linkedAccount:u,raw:a}}).sort((a,n)=>new Date(n.dateSort||0).getTime()-new Date(a.dateSort||0).getTime()),[ce,i]),B=h.useMemo(()=>pe.filter(a=>v!=="account"&&v!=="deal"?!1:Object.entries(fe).every(([n,u])=>{const x=w(u);if(!x)return!0;const b=n==="amount"?`${a.amount} ${a.amountLabel}`:n==="status"?a.statusLabel:a[n];return w(b).includes(x)})),[v,fe,pe]),me=h.useMemo(()=>Math.max(1,Math.ceil(B.length/tt)),[B.length]),Jt=h.useMemo(()=>pt(Q,me),[Q,me]),Le=h.useMemo(()=>{const a=(Q-1)*tt;return B.slice(a,a+tt)},[B,Q]);h.useEffect(()=>{$(a=>Math.min(a,me))},[me]),h.useEffect(()=>{X(a=>Math.min(a,ue))},[ue]),h.useEffect(()=>{let a=!0;return(async()=>{try{const u=await et.listCustomViews(Ft);if(!a)return;const x=u.find(P=>P.name===Et)||null;if(!x)return;const b=ot({selectedFields:x.columns});ge(String(x.id||"")),Ce(b),M(b),window.localStorage.setItem(it,JSON.stringify(b))}catch{}})(),()=>{a=!1}},[]);const St=a=>{const n=new URLSearchParams(qt);a?n.set("view",a):n.delete("view"),Zt(n,{replace:!0})},Ht=()=>{ne(nt()),V({}),k(""),Ge(st),X(1),D(!1),se(!0)},_t=()=>{je||(se(!1),D(!1),V({}),k(""))},E=(a,n)=>{ne(u=>({...u,[a]:n})),k(""),V(u=>u[a]?{...u,[a]:""}:u)},ea=()=>{k(""),Ge(st),X(1),D(!0)},we=(a,n)=>{Ge(u=>({...u,[a]:n})),X(1)},ta=a=>{ne(n=>({...n,selectedAccountId:a.id||"",selectedAccountLabel:[a.accountNumber,a.name].filter(Boolean).join(" - "),clientAccountNumber:a.accountNumber||"",companyName:a.name||"",contactPerson:a.contactPerson||"",address:Za(a),email:a.contactEmail||a.email||"",phone:a.contactMobile||a.contactPhone||a.phone||"",accountOwner:a.accountOwnerName||a.accountOwner||""})),V(n=>({...n,selectedAccountId:""})),k(""),D(!1)},aa=a=>{var x;const n=((x=a.target.files)==null?void 0:x[0])||null,u=kt(n);if(u){ne(b=>({...b,quoteFile:null,quoteFileName:""})),V(b=>({...b,quoteFile:u})),a.target.value="";return}ne(b=>({...b,quoteFile:n,quoteFileName:(n==null?void 0:n.name)||""})),V(b=>({...b,quoteFile:""})),k("")},sa=async a=>{var P,A,he;if(a.preventDefault(),je)return;const n={};p.selectedAccountId||(n.selectedAccountId="Please select an account from Account List."),p.quoteNumber.trim()||(n.quoteNumber="Quote Number is required."),p.quotationDate||(n.quotationDate="Quotation Date is required."),String(p.totalAmount).trim()||(n.totalAmount="Total Amount is required."),p.quotationStatus||(n.quotationStatus="Quotation Status is required.");const u=kt(p.quoteFile);if(u&&(n.quoteFile=u),V(n),k(""),Object.keys(n).length>0)return;const x={quotationNumber:p.quoteNumber.trim(),quotationDate:p.quotationDate,validUntil:p.validUntilDate||p.quotationDate,amount:Number.parseFloat(p.totalAmount)||0,totalAmount:Number.parseFloat(p.totalAmount)||0,taxAmount:Number.parseFloat(p.totalProductTax)||0,productTax:Number.parseFloat(p.totalProductTax)||0,currency:p.amountCurrency||"INR",taxCurrency:p.taxCurrency||p.amountCurrency||"INR",status:p.quotationStatus,clientName:p.contactPerson||p.companyName||p.clientAccountNumber,companyName:p.companyName,clientAccountNumber:p.clientAccountNumber,contactPerson:p.contactPerson,telephone:p.phone,email:p.email,clientAddressDetails:p.address,selectedAccountId:p.selectedAccountId,selectedAccountOwner:p.accountOwner,quotationFileName:((P=p.quoteFile)==null?void 0:P.name)||"",quotationFileSize:((A=p.quoteFile)==null?void 0:A.size)||0,quotationFileType:((he=p.quoteFile)==null?void 0:he.type)||"",projectName:(de==null?void 0:de.projectName)||p.companyName||p.clientAccountNumber};Nt(!0);const b=await N(x);if(Nt(!1),!b.success){const G=b.code==="DUPLICATE_QUOTATION"||b.status===409,R=b.message||"Unable to upload quotation.";k(R),G?j("warning","Duplicate quotation",R):j("error","Error",R);return}j("success","Success","Quotation uploaded successfully."),O("account"),$(1),Ie(Ot),se(!1),D(!1),ne(nt()),V({}),k("")},Qe=(a,n=!0)=>{le(a),Fe(n),n&&St(a.id)},At=()=>{le(null),(Ze||ye)&&(Fe(!1),St(""))};h.useEffect(()=>{if(!ye){Ze&&(le(null),Fe(!1));return}const a=pe.find(n=>{var u;return String(n.id)===String(ye)||String(((u=n.raw)==null?void 0:u.id)||"")===String(ye)});a&&(Fe(!0),le(n=>(n==null?void 0:n.id)===a.id?n:a))},[pe,ye,Ze]);const na=a=>a?pe.filter(n=>String(n.raw.selectedAccountId||"")===String(a.id||"")||w(n.raw.clientAccountNumber)===w(a.accountNumber)||w(n.company)===w(a.name)):[],oa=a=>{jt(a)},la=()=>{jt(null)},ra=()=>{be(H)},ia=()=>{H&&be(H)},ca=async a=>{const n=ot(a),u={entityType:Ft,name:Et,columns:n.selectedFields,filters:{},sort:{},isDefault:!1,isShared:!1},x=Te?await et.updateCustomView(Te,u):await et.upsertCustomViewByName(u);x!=null&&x.id&&ge(String(x.id))},Ct=async a=>{if(L.selectedFields.length===0){j("error","Field selection required","Select at least one quotation field.");return}const n=ot(L);if(Ce(n),a){window.localStorage.setItem(it,JSON.stringify(n));try{await ca(n)}catch{j("warning","Saved locally","The quotation layout was saved in this browser, but database sync is unavailable right now.")}}te(!1)},da=a=>{M(n=>n.selectedFields.includes(a)?n:{...n,selectedFields:[...n.selectedFields,a]})},ua=a=>{M(n=>n.selectedFields.length<=1?n:{...n,selectedFields:n.selectedFields.filter(u=>u!==a)})},pa=a=>{!ae||ae===a||(M(n=>{const u=n.selectedFields.indexOf(ae),x=n.selectedFields.indexOf(a);if(u<0||x<0)return n;const b=[...n.selectedFields];return b.splice(u,1),b.splice(x,0,ae),{...n,selectedFields:b}}),Pe(""))},ma=a=>{const n=`Quotation_Manager_${v}_${new Date().toISOString().slice(0,10)}`,u=[{label:"View",value:v.toUpperCase()},{label:"Total Records",value:String(B.length)},{label:"Generated On",value:new Date().toLocaleString("en-IN")}],x=B.map(b=>{var P,A;return{date:b.dateSort||((P=b.raw)==null?void 0:P.quotationDate)||((A=b.raw)==null?void 0:A.createdAt)||"",owner:b.owner||"",company:b.company||"",project:b.project||"",num:b.num||"",amountLabel:b.amountLabel||"",statusLabel:b.statusLabel||_e(b.status),oldStatus:b.oldStatus||"",newStatus:b.newStatus||"",convertToPo:b.convertToPo||"",poValueJobNo:b.poValueJobNo||"",reasonForLostOrder:b.reasonForLostOrder||""}});Ma({filename:`${n}.xlsx`,title:"Quotation Manager",subtitle:`${v.toUpperCase()} quotations`,sheetName:"Quotation Manager",metadata:u,columns:Wa,rows:x}),j("success","Excel exported","Quotation manager data exported to Excel.")},ha=async()=>{if(!Y)return;ze(Y.id);const a=await q(Y.id,{status:"approved",rejectionReason:"",approvedAt:new Date().toISOString()});if(ze(""),!a.success){j("error","Approval failed",a.message||"Unable to approve this quotation.");return}Xe(null),j("success","Quotation approved","The quotation status has been updated to Approved.")},ba=async()=>{const a=yt.trim();if(!a){ve("Rejection reason is required.");return}if(!J)return;ve(""),ze(J.id);const n=await q(J.id,{status:"rejected",rejectionReason:a,rejectedAt:new Date().toISOString()});if(ze(""),!n.success){j("error","Reject failed",n.message||"Unable to reject this quotation.");return}Ye(null),Ee(""),j("success","Quotation rejected","The quotation has been rejected and the reason was saved.")},Tt=a=>{const n=Number.parseFloat(String(a||"").replace(/[^\d.-]/g,""));return Number.isFinite(n)?n:0},xa=(a={},n="",u="")=>{if(n.startsWith("customerReference.")){const[,x]=n.split(".");return{customerReference:{...a.customerReference||{},[x]:u}}}if(n.startsWith("lineItems.")){const[,x,b]=n.split("."),P=Number.parseInt(x,10),he=(Array.isArray(a.lineItems)&&a.lineItems.length>0?a.lineItems:mt(a)).map((G,R)=>{if(R!==P)return G;const ee={...G};return b==="quantity"?ee.quantity=Tt(u):b==="rate"?ee.rate=Tt(u):ee[b]=u,ee.amount=S(ee.quantity)*S(ee.rate),ee});return{lineItems:he,amount:he.reduce((G,R)=>G+S(R.amount),0),totalAmount:he.reduce((G,R)=>G+S(R.amount),0)}}return{[n]:u}},ga=async(a,n)=>{if(!(F!=null&&F.id)||!a)return;const u=F.raw||{},x=xa(u,a,n),b={...u,...x};le(A=>(A==null?void 0:A.id)===F.id?{...A,raw:b}:A);const P=await q(F.id,x);if(!P.success){j("error","Quotation update failed",P.message||"Unable to save quotation field."),le(A=>(A==null?void 0:A.id)===F.id?{...A,raw:u}:A);return}j("success","Quotation updated","Quotation field saved.")},$e=oe?Re(oe.raw,oe.linkedAccount):null,H=We?Re(We.raw,We.linkedAccount):null,ke=F?Re(F.raw,F.linkedAccount):null,fa=oe?ut(o,oe):[];F&&ut(o,F);const f=(T==null?void 0:T.linkedAccount)||null,Pt=h.useMemo(()=>na(f),[f,pe]);return y?H?e.jsx(Wt,{documentData:H,title:`QUOTATION - ${H.quotationNumber}`,subtitle:H.companyName,onBack:la,onPrint:ra,onDownload:ia}):e.jsxs("div",{className:"aqp-page",children:[e.jsx("div",{className:"aqp-titlebar",children:e.jsx("h1",{className:"aqp-title",children:"Quotation Manager"})}),e.jsxs("div",{className:"aqp-tab-bar",children:[e.jsxs("div",{className:"aqp-tabs",children:[e.jsx("button",{type:"button",className:`aqp-tab${v==="account"?" aqp-tab--active":""}`,onClick:()=>O("account"),children:"ACCOUNT"}),e.jsx("button",{type:"button",className:`aqp-tab${v==="deal"?" aqp-tab--active":""}`,onClick:()=>O("deal"),children:"DEAL"})]}),e.jsxs("div",{className:"aqp-tab-actions",children:[e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:Ht,children:[e.jsx(Ea,{className:"aqp-btn-icon"}),"Upload Quotation"]}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--red aqp-btn--generate",onClick:()=>l(s,{state:{openGenerator:!0}}),children:[e.jsx(Oa,{className:"aqp-btn-icon"}),"Generate Quotation"]})]})]}),e.jsx("div",{className:"aqp-content-wrapper",children:e.jsxs("div",{className:"aqp-main-content",children:[e.jsx("div",{className:"aqp-report-controls",children:e.jsx("div",{className:"aqp-report-controls-left",children:e.jsx("div",{className:"aqp-report-export",children:e.jsx(za,{label:"Export",title:"Export quotation manager",className:"aqp-report-export",items:[{key:"quotation-manager-excel",label:"Export to Excel",badge:"XLSX",onClick:()=>ma()}]})})})}),e.jsx("div",{className:"aqp-table-wrap",children:e.jsxs("table",{className:"aqp-table",children:[e.jsxs("thead",{children:[e.jsx("tr",{className:"aqp-thead-row",children:ie.map(a=>e.jsxs("th",{className:`aqp-th aqp-field--${a.key}`,children:[a.label," ",e.jsx(La,{className:"aqp-sort-icon"})]},a.key))}),e.jsx("tr",{className:"aqp-search-row",children:ie.map(a=>e.jsx("th",{className:`aqp-search-th aqp-field--${a.key}`,children:e.jsx("input",{className:"aqp-search-input",value:fe[a.key]||"",onChange:n=>{Ie(u=>({...u,[a.key]:n.target.value})),$(1)},placeholder:"Search "+a.label})},a.key))})]}),e.jsx("tbody",{children:r&&Le.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,ie.length),children:"Loading quotations..."})}):c&&Le.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,ie.length),children:c})}):Le.length===0?e.jsx("tr",{className:"aqp-row",children:e.jsx("td",{className:"aqp-td",colSpan:Math.max(1,ie.length),children:"No quotations found."})}):Le.map(a=>e.jsx("tr",{className:"aqp-row",onClick:()=>Qe(a),title:`Click to view ${a.num}`,children:ie.map(n=>{if(n.key==="num")return e.jsx("td",{className:`aqp-td aqp-td--num aqp-field--${n.key}`,children:e.jsx("button",{type:"button",className:`aqp-num-badge aqp-num-badge--button ${dt(a.status)}`,onClick:b=>{b.stopPropagation(),Qe(a)},children:a.num})},n.key);if(n.key==="status")return e.jsx("td",{className:`aqp-td aqp-field--${n.key}`,children:e.jsx(Kt,{status:a.status})},n.key);const u=n.exportValue(a),x=n.key==="company"?`aqp-td aqp-td--link aqp-field--${n.key}`:n.key==="amount"?`aqp-td aqp-td--amount aqp-field--${n.key}`:`aqp-td aqp-field--${n.key}`;return e.jsx("td",{className:x,children:u},n.key)})},a.id))})]})}),e.jsxs("div",{className:"aqp-pagination",children:[e.jsx("span",{className:"aqp-page-icon",children:B.length}),e.jsxs("span",{className:"aqp-total-label",children:["Total records: ",B.length]}),e.jsxs("div",{className:"aqp-page-btns",children:[e.jsx("button",{type:"button",className:"aqp-page-btn",onClick:()=>$(a=>Math.max(1,a-1)),disabled:Q===1,children:e.jsx(Qa,{})}),Jt.map(a=>e.jsx("button",{type:"button",className:`aqp-page-btn${Q===a?" aqp-page-btn--active":""}`,onClick:()=>$(a),children:a},a)),e.jsx("button",{type:"button",className:"aqp-page-btn",onClick:()=>$(a=>Math.min(me,a+1)),disabled:Q===me,children:e.jsx($a,{})})]})]})]})}),Ae?e.jsx("div",{className:"aqp-field-panel-overlay",onClick:()=>te(!1),children:e.jsxs("div",{className:"aqp-field-panel",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"aqp-field-panel-header",children:[e.jsx("h2",{children:"Select Quotation Report Fields"}),e.jsxs("div",{className:"aqp-field-panel-actions",children:[e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--ghost",onClick:()=>te(!1),children:"Close"}),e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--blue",onClick:()=>Ct(!1),children:"Apply"}),e.jsx("button",{type:"button",className:"aqp-field-panel-btn aqp-field-panel-btn--green",onClick:()=>Ct(!0),children:"Save & Apply"})]})]}),e.jsxs("div",{className:"aqp-field-panel-grid",children:[e.jsxs("section",{className:"aqp-field-box",children:[e.jsx("div",{className:"aqp-field-box-header",children:"Quotation Fields"}),e.jsx("div",{className:"aqp-field-box-list",children:Xt.map(a=>e.jsxs("button",{type:"button",className:"aqp-field-option",onClick:()=>da(a.key),children:[e.jsx("span",{children:a.label}),e.jsx("strong",{children:"+"})]},a.key))})]}),e.jsxs("section",{className:"aqp-field-box",children:[e.jsx("div",{className:"aqp-field-box-header",children:"Selected Fields"}),e.jsx("div",{className:"aqp-field-box-list",children:L.selectedFields.map(a=>{const n=Se.find(u=>u.key===a);return n?e.jsxs("div",{className:"aqp-field-selected",draggable:!0,onDragStart:()=>Pe(n.key),onDragOver:u=>u.preventDefault(),onDrop:()=>pa(n.key),children:[e.jsx("span",{children:n.label}),e.jsx("button",{type:"button",className:"aqp-field-remove",onClick:()=>ua(n.key),children:e.jsx(De,{})})]},n.key):null})})]})]})]})}):null,Ne?e.jsx(K,{title:"Upload Account Quotation",onClose:_t,size:"aqp-modal--upload",footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:_t,disabled:je,children:"Close"}),e.jsx("button",{type:"submit",form:"aqp-upload-quotation-form",className:"aqp-btn aqp-btn--blue",disabled:je,children:je?"Saving...":"Save"})]}),children:e.jsxs("form",{id:"aqp-upload-quotation-form",className:"aqp-upload-form",onSubmit:sa,children:[e.jsx("div",{className:"aqp-upload-note",children:"Please select the account from the Account List popup before saving the uploaded quotation."}),e.jsxs("div",{className:"aqp-upload-grid",children:[e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Select Account"}),e.jsxs("div",{className:"aqp-upload-account-picker",children:[e.jsx("input",{className:`aqp-upload-input${_.selectedAccountId?" aqp-upload-input--error":""}`,value:p.selectedAccountLabel,placeholder:"Click the search icon to select an account",readOnly:!0}),e.jsx("button",{type:"button",className:"aqp-upload-account-button",onClick:ea,"aria-label":"Search accounts",children:e.jsx(ka,{})})]}),_.selectedAccountId?e.jsx("div",{className:"aqp-form-error",children:_.selectedAccountId}):null]}),de?e.jsxs("div",{className:"aqp-upload-account-card aqp-upload-grid__full",children:[e.jsx("div",{className:"aqp-upload-account-note",children:"Please double click on another account in the list if you want to change this selection."}),e.jsxs("div",{className:"aqp-upload-account-grid",children:[e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account No."}),e.jsx("span",{className:"aqp-upload-account-item-value",children:de.accountNumber||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account Name"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:de.name||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Email"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:p.email||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Phone"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:p.phone||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Account Owner"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:p.accountOwner||"-"})]}),e.jsxs("div",{className:"aqp-upload-account-item aqp-upload-account-item--wide",children:[e.jsx("span",{className:"aqp-upload-account-item-label",children:"Address"}),e.jsx("span",{className:"aqp-upload-account-item-value",children:p.address||"-"})]})]})]}):null,e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Quote Number"}),e.jsx("input",{className:`aqp-upload-input${_.quoteNumber?" aqp-upload-input--error":""}`,value:p.quoteNumber,onChange:a=>E("quoteNumber",a.target.value)}),_.quoteNumber?e.jsx("div",{className:"aqp-form-error",children:_.quoteNumber}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Quotation Date"}),e.jsx("input",{type:"date",className:`aqp-upload-input${_.quotationDate?" aqp-upload-input--error":""}`,value:p.quotationDate,onChange:a=>E("quotationDate",a.target.value)}),_.quotationDate?e.jsx("div",{className:"aqp-form-error",children:_.quotationDate}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Total Amount"}),e.jsxs("div",{className:"aqp-upload-field-inline",children:[e.jsx("input",{type:"number",min:"0",step:"0.01",className:`aqp-upload-input${_.totalAmount?" aqp-upload-input--error":""}`,value:p.totalAmount,onChange:a=>E("totalAmount",a.target.value)}),e.jsx("select",{className:"aqp-upload-select aqp-upload-select--currency",value:p.amountCurrency,onChange:a=>E("amountCurrency",a.target.value),children:zt.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value))})]}),_.totalAmount?e.jsx("div",{className:"aqp-form-error",children:_.totalAmount}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Total Product Tax"}),e.jsxs("div",{className:"aqp-upload-field-inline",children:[e.jsx("input",{type:"number",min:"0",step:"0.01",className:"aqp-upload-input",value:p.totalProductTax,onChange:a=>E("totalProductTax",a.target.value)}),e.jsx("select",{className:"aqp-upload-select aqp-upload-select--currency",value:p.taxCurrency,onChange:a=>E("taxCurrency",a.target.value),children:zt.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value))})]})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Quotation Status"}),e.jsx("select",{className:`aqp-upload-select${_.quotationStatus?" aqp-upload-select--error":""}`,value:p.quotationStatus,onChange:a=>E("quotationStatus",a.target.value),children:Ga.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value||"select"))}),_.quotationStatus?e.jsx("div",{className:"aqp-form-error",children:_.quotationStatus}):null]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Valid Until Date"}),e.jsx("input",{type:"date",className:"aqp-upload-input",value:p.validUntilDate,onChange:a=>E("validUntilDate",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Contact Person"}),e.jsx("input",{className:"aqp-upload-input",value:p.contactPerson,onChange:a=>E("contactPerson",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label",children:"Address"}),e.jsx("textarea",{className:"aqp-textarea",rows:3,value:p.address,onChange:a=>E("address",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Email"}),e.jsx("input",{className:"aqp-upload-input",value:p.email,onChange:a=>E("email",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Phone"}),e.jsx("input",{className:"aqp-upload-input",value:p.phone,onChange:a=>E("phone",a.target.value)})]}),e.jsxs("label",{className:"aqp-form-field aqp-upload-grid__full",children:[e.jsx("span",{className:"aqp-form-label aqp-form-label--required",children:"Quote File"}),e.jsx("input",{type:"file",accept:".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",className:`aqp-upload-file-input${_.quoteFile?" aqp-upload-file-input--error":""}`,onChange:aa}),e.jsx("div",{className:"aqp-upload-file-note",children:"Allowed file types: PDF, XLS, XLSX. Maximum size: 5 MB."}),p.quoteFileName?e.jsx("div",{className:"aqp-upload-file-name",children:p.quoteFileName}):null,_.quoteFile?e.jsx("div",{className:"aqp-form-error",children:_.quoteFile}):null]})]}),ft?e.jsx("div",{className:"aqp-upload-message",children:ft}):null]})}):null,Ne&&Be?e.jsx(K,{title:"Account List",onClose:()=>D(!1),size:"aqp-modal--xl",children:e.jsxs("div",{className:"aqp-account-list",children:[e.jsx("div",{className:"aqp-account-list-note",children:"Please double click on the account to select a account."}),e.jsx("div",{className:"aqp-account-list-table-wrap",children:e.jsxs("table",{className:"aqp-account-list-table",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"aqp-account-list-header-row",children:[e.jsx("th",{children:"Account No."}),e.jsx("th",{children:"Account Name"}),e.jsx("th",{children:"Email"}),e.jsx("th",{children:"Phone"}),e.jsx("th",{children:"Account Owner"})]}),e.jsxs("tr",{className:"aqp-account-list-search-row",children:[e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:W.accountNumber,onChange:a=>we("accountNumber",a.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:W.name,onChange:a=>we("name",a.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:W.email,onChange:a=>we("email",a.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:W.phone,onChange:a=>we("phone",a.target.value),placeholder:"Search here ..."})}),e.jsx("th",{children:e.jsx("input",{className:"aqp-account-list-search-input",value:W.accountOwner,onChange:a=>we("accountOwner",a.target.value),placeholder:"Search here ..."})})]})]}),e.jsx("tbody",{children:wt.length>0?wt.map(a=>e.jsxs("tr",{className:`aqp-account-list-row${p.selectedAccountId===a.id?" aqp-account-list-row--selected":""}`,onDoubleClick:()=>ta(a),children:[e.jsx("td",{children:a.accountNumber||"-"}),e.jsx("td",{children:a.name||"-"}),e.jsx("td",{children:a.email||"-"}),e.jsx("td",{children:a.phone||"-"}),e.jsx("td",{children:a.accountOwnerDisplay||a.accountOwner||"-"})]},a.id)):e.jsx("tr",{children:e.jsx("td",{colSpan:"5",className:"aqp-account-list-empty",children:"No accounts found."})})})]})}),e.jsxs("div",{className:"aqp-account-list-pagination",children:[e.jsxs("span",{className:"aqp-account-list-total",children:["Total records: ",qe.length]}),e.jsxs("div",{className:"aqp-account-list-pagination-actions",children:[e.jsx("button",{type:"button",className:"aqp-account-list-page-button",onClick:()=>X(a=>Math.max(1,a-1)),disabled:Z===1,children:"prev"}),Yt.map(a=>e.jsx("button",{type:"button",className:`aqp-account-list-page-button${a===Z?" aqp-account-list-page-button--active":""}`,onClick:()=>X(a),children:a},a)),e.jsx("button",{type:"button",className:"aqp-account-list-page-button",onClick:()=>X(a=>Math.min(ue,a+1)),disabled:Z===ue,children:"next"})]})]})]})}):null,$e?e.jsx(K,{title:`Quotation Preview - ${$e.quotationNumber}`,onClose:()=>Ke(null),size:"aqp-modal--xl",footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>Ke(null),children:"Close"}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>be($e),children:[e.jsx(rt,{className:"aqp-btn-icon"}),"Print"]}),fa.some(a=>a.key==="pdf")?e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:()=>{const a=oe;Ke(null),oa(a)},children:"View As PDF"}):null]}),children:e.jsx(Me,{documentData:$e})}):null,ke?e.jsxs(K,{title:`View Quotation - ${ke.quotationNumber}`,onClose:At,size:"aqp-modal--xl",children:[e.jsx("div",{className:"aqp-view-top-actions",children:e.jsxs("div",{className:"aqp-modal-footer-group",children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:At,children:"Close"}),e.jsxs("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:()=>be(ke),children:[e.jsx(rt,{className:"aqp-btn-icon"}),"Print"]})]})}),e.jsx("div",{className:"aqp-view-quotation-document",children:e.jsx(Me,{documentData:ke,editable:!0,onEditField:ga})})]}):null,T?e.jsx(K,{title:`View Account - ${T.company}`,onClose:()=>vt(null),size:"aqp-modal--lg",footer:e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>vt(null),children:"Close"}),children:e.jsxs("div",{className:"aqp-account",children:[e.jsxs("div",{className:"aqp-account__grid",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Account No.:"})," ",U((f==null?void 0:f.accountNumber)||T.raw.clientAccountNumber)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Account Name:"})," ",U((f==null?void 0:f.name)||T.company)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Email:"})," ",U((f==null?void 0:f.email)||T.raw.email)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Phone:"})," ",U((f==null?void 0:f.phone)||T.raw.telephone)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Account Owner:"})," ",U((f==null?void 0:f.accountOwnerDisplay)||(f==null?void 0:f.accountOwner)||T.raw.selectedAccountOwner)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"GSTIN:"})," ",U((f==null?void 0:f.gstin)||T.raw.gstin)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"State Code:"})," ",U((f==null?void 0:f.stateCode)||T.raw.stateCode)]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Contact Person:"})," ",U((f==null?void 0:f.contactPerson)||T.raw.contactPerson)]})]}),e.jsxs("div",{className:"aqp-account__section",children:[e.jsx("h3",{children:"Address"}),e.jsx("p",{children:U((f==null?void 0:f.address)||T.raw.clientAddressDetails)})]}),e.jsxs("div",{className:"aqp-account__section",children:[e.jsx("h3",{children:"Related Quotations"}),Pt.length===0?e.jsx("p",{children:"No related quotations found."}):e.jsxs("table",{className:"aqp-account__table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Quotation No."}),e.jsx("th",{children:"Date"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Amount"})]})}),e.jsx("tbody",{children:Pt.map(a=>e.jsxs("tr",{onClick:()=>Qe(a),title:`Click to view ${a.num}`,children:[e.jsx("td",{className:"aqp-account__table-cell--num",children:e.jsx("button",{type:"button",className:`aqp-num-badge aqp-num-badge--button ${dt(a.status)}`,onClick:n=>{n.stopPropagation(),Qe(a)},children:a.num})}),e.jsx("td",{children:a.date}),e.jsx("td",{children:a.statusLabel}),e.jsx("td",{children:a.amountLabel})]},a.id))})]})]})]})}):null,Y?e.jsx(K,{title:"Approve Quote",onClose:()=>Xe(null),footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>Xe(null),disabled:re===Y.id,children:"Cancel"}),e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:ha,disabled:re===Y.id,children:re===Y.id?"Approving...":"Approve"})]}),children:e.jsx("p",{children:"Are you sure you want to approve this quote?"})}):null,J?e.jsxs(K,{title:"Reject Quote",onClose:()=>{Ye(null),ve(""),Ee("")},footer:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--gray",onClick:()=>{Ye(null),ve(""),Ee("")},disabled:re===J.id,children:"Cancel"}),e.jsx("button",{type:"button",className:"aqp-btn aqp-btn--blue",onClick:ba,disabled:re===J.id,children:re===J.id?"Rejecting...":"Reject Quote"})]}),children:[e.jsxs("label",{className:"aqp-form-field",children:[e.jsx("span",{className:"aqp-form-label",children:"Rejection Reason"}),e.jsx("textarea",{className:`aqp-textarea${Oe?" aqp-textarea--error":""}`,rows:5,value:yt,onChange:a=>{Ee(a.target.value),Oe&&ve("")},placeholder:"Enter rejection reason"})]}),Oe?e.jsx("div",{className:"aqp-form-error",children:Oe}):null]}):null]}):null},ds=Object.freeze(Object.defineProperty({__proto__:null,ACTIONS:bt,ModalShell:K,QuotationDocument:Me,QuotationPdfViewer:Wt,StatusBadge:Kt,buildPrintableHtml:Gt,buildQuotationDocumentData:Re,buildQuotationViewExportOptions:os,buildVisiblePages:pt,default:is,formatListDate:Mt,formatStatusLabel:_e,getActionBadgeClassName:dt,getAllowedQuotationActions:ut,getStatusClassName:Dt,resolveLinkedAccount:Bt,safeLower:w,toNumber:S,triggerBrowserPdfSave:be},Symbol.toStringTag,{value:"Module"}));export{bt as A,K as M,Wt as Q,Kt as S,Mt as a,Re as b,Me as c,et as d,pt as e,_e as f,dt as g,ds as h,Bt as r,w as s,be as t};
