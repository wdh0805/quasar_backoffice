import { defineStore } from 'pinia'

function randId(prefix, n) {
  return `${prefix}-${String(Math.floor(Math.random() * 90000) + 10000)}`
}
function randDate(daysAgo = 30) {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  const pad = v => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(Math.floor(Math.random()*24))}:${pad(Math.floor(Math.random()*60))}`
}

const CUSTOMERS = ['John Doe', 'Sarah', 'Michael', 'Emma', 'Chris', 'Yuki', 'Lena']
const REGIONS   = ['Domestic', 'Global - US', 'Global - JP']
const PAY_TYPES = [
  'ON3D Purchase',
  'Point Purchase',
  'Appliance - Surgical Splint',
  'Appliance - CMD Splint',
  'Appliance - Aligner Model',
  'Appliance - Direct Aligner',
  'Appliance - IDB',
  'Appliance - ATOZ Guide',
  'Appliance - Implant Guide',
  'Appliance - ATOZ Positioning'
]
const PROD_UIDS = Array.from({length:20}, (_,i) => `PROD-${String(i).padStart(3,'0')}`)

function genPayments(n=40) {
  const random = Array.from({length:n}).map((_,i) => {
    const region = REGIONS[Math.floor(Math.random()*REGIONS.length)]
    return {
      payUid:    `PAY-${100000 + i}`,
      date:      randDate(30),
      customer:  CUSTOMERS[Math.floor(Math.random()*CUSTOMERS.length)],
      region,
      payType:   PAY_TYPES[Math.floor(Math.random()*PAY_TYPES.length)],
      prodUid:   PROD_UIDS[Math.floor(Math.random()*PROD_UIDS.length)],
      amount:    Math.floor(Math.random()*300) + 20,
      cardNum:   `-****-${Math.floor(Math.random()*9000)+1000}`,
      status:    Math.random() > 0.3 ? 'Completed' : Math.random() > 0.5 ? 'Refund' : 'Fail',
    }
  })

  // Guaranteed Refund records
  const refunds = [
    { payUid: 'PAY-REF-001', date: '2026-05-18 09:21', customer: 'John Doe',  region: 'Domestic',    payType: 'ON3D Purchase',                prodUid: 'PROD-002', amount: 150, cardNum: '-****-4421', status: 'Refund' },
    { payUid: 'PAY-REF-002', date: '2026-05-16 14:05', customer: 'Sarah',     region: 'Global - US',  payType: 'Appliance - Surgical Splint',  prodUid: 'PROD-007', amount: 210, cardNum: '-****-8832', status: 'Refund' },
    { payUid: 'PAY-REF-003', date: '2026-05-14 11:47', customer: 'Michael',   region: 'Global - JP',  payType: 'Appliance - Aligner Model',    prodUid: 'PROD-011', amount: 88,  cardNum: '-****-2291', status: 'Refund' },
    { payUid: 'PAY-REF-004', date: '2026-05-12 16:33', customer: 'Emma',      region: 'Domestic',    payType: 'Point Purchase',               prodUid: 'PROD-015', amount: 55,  cardNum: '-****-5573', status: 'Refund' },
    { payUid: 'PAY-REF-005', date: '2026-05-10 08:58', customer: 'Yuki',      region: 'Global - JP',  payType: 'ON3D Purchase',                prodUid: 'PROD-019', amount: 330, cardNum: '-****-9914', status: 'Refund' },
  ]

  return [...refunds, ...random]
}


function genUsers(n=15) {
  const COMPANIES = ['Smile Dental Clinic', 'Bright Ortho', 'Seoul Dental', 'Global Dent', 'Yuki Clinic', 'Star Dental', 'Lena Medical']
  return Array.from({length:n}).map((_,i) => ({
    regDate: randDate(60).split(' ')[0],
    name: CUSTOMERS[i % CUSTOMERS.length] + (i >= CUSTOMERS.length ? ` ${i}` : ''),
    email: `user${i}@example.com`,
    region: REGIONS[Math.floor(Math.random()*REGIONS.length)],
    phone: `555-${Math.floor(Math.random()*900)+100}-0000`,
    lastLogin: randDate(7),
    purchases: `$ ${Math.floor(Math.random()*5000)}`,
    productAvailable: Math.random() > 0.5 ? 'Yes' : 'No',
    point: Math.floor(Math.random()*50)*10000,
    company: COMPANIES[i % COMPANIES.length],
  }))
}

function genProducts(n=20) {
  const typeCombos = [
    'Platform, Surgery',
    'Platform, Orthodontics',
    'Platform_Discount, Orthodontics_Discount, Surgery_Discount',
    'Platform_Discount, Orthodontics_Discount',
    'Platform, Orthodontics_Discount, Surgery_Discount',
    'Platform',
    'Platform, Surgery',
    'Platform, Orthodontics',
  ]
  const CUSTOMERS2 = ['Michael', 'David', 'Robert', 'James', 'John Doe', 'Sarah', 'Emma', 'Yuki']
  return Array.from({length:n}).map((_,i) => ({
    uid: PROD_UIDS[i],
    type: typeCombos[i % typeCombos.length],
    customer: CUSTOMERS2[i % CUSTOMERS2.length],
    region: REGIONS[Math.floor(Math.random()*REGIONS.length)],
    price: `$ ${Math.floor(Math.random()*200)+50}`,
    purchaseTime: `2026-05-${String(Math.floor(Math.random()*18)+1).padStart(2,'0')} 12:00`,
    dueDate: `2026-${Math.random()>0.5?'06':'07'}-${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}`,
    lastConnect: `2026-05-${String(Math.floor(Math.random()*18)+1).padStart(2,'0')} ${String(Math.floor(Math.random()*24)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
    available: Math.random() > 0.4 ? 'Yes' : 'No',
    subscribe: Math.random() > 0.4 ? 'Yes' : 'No',
    publish: Math.random() > 0.5 ? 'Yes' : 'No',
  }))
}

export const useDataStore = defineStore('data', {
  state: () => {
    const rawProds = genProducts(20)
    const products = rawProds.map(p => {
      const typeLower = (p.type || '').toLowerCase()
      if (!typeLower.includes('platform')) {
        p.type = p.type ? 'Platform, ' + p.type : 'Platform'
      }
      return p
    })
    return {
      payments: genPayments(40),
      users: genUsers(15),
      products,
    }
  },
  getters: {
    getUserByEmail: (state) => (email) => state.users.find(u => u.email === email),
    getPaymentByUid: (state) => (uid) => state.payments.find(p => p.payUid === uid),
    getProductByUid: (state) => (uid) => state.products.find(p => p.uid === uid),
  },
  actions: {
    adjustPoint(email, delta) {
      const u = this.users.find(u => u.email === email)
      if (u) u.point = Math.max(0, u.point + delta)
    }
  }
})
