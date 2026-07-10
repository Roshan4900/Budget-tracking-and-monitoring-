/* ============================================================
   Sudurpaschim Province Budget Visualizer — DATA
   This is the single source of truth for every figure.
   Amounts are in Crore Rupees (Cr) unless noted.
============================================================ */

const ministries = [
  { name:"Infrastructure & Transport", nepali:"भौतिक पूर्वाधार", amt:412, last:376, color:"#1a3c5e" },
  { name:"Education",                  nepali:"शिक्षा",          amt:318, last:290, color:"#378ADD" },
  { name:"Health",                     nepali:"स्वास्थ्य",       amt:244, last:218, color:"#1D9E75" },
  { name:"Agriculture & Land",         nepali:"कृषि तथा भूमि",   amt:198, last:172, color:"#EF9F27" },
  { name:"Social Development",         nepali:"सामाजिक विकास",   amt:186, last:168, color:"#7F77DD" },
  { name:"Internal Affairs",           nepali:"गृह तथा प्रशासन", amt:168, last:160, color:"#888780" },
  { name:"Forest & Environment",       nepali:"वन तथा वातावरण",  amt:142, last:128, color:"#3B6D11" },
  { name:"Industry & Tourism",         nepali:"उद्योग पर्यटन",   amt:98,  last:84,  color:"#854F0B" },
  { name:"Law & Parliament",           nepali:"कानून तथा संसद",  amt:76,  last:84,  color:"#B4B2A9" },
];

const districts = [
  { name:"Kailali",    nepali:"कैलाली",    pop:775, alloc:342, hdi:0.524 },
  { name:"Kanchanpur", nepali:"कञ्चनपुर",  pop:452, alloc:228, hdi:0.531 },
  { name:"Baitadi",    nepali:"बैतडी",     pop:245, alloc:218, hdi:0.462 },
  { name:"Achham",     nepali:"अछाम",      pop:257, alloc:208, hdi:0.431 },
  { name:"Doti",       nepali:"डोटी",      pop:207, alloc:198, hdi:0.468 },
  { name:"Bajhang",    nepali:"बाजहाङ",    pop:195, alloc:196, hdi:0.421 },
  { name:"Dadeldhura", nepali:"डडेल्धुरा", pop:142, alloc:164, hdi:0.487 },
  { name:"Bajura",     nepali:"बाजुरा",    pop:156, alloc:192, hdi:0.408 },
  { name:"Darchula",   nepali:"दार्चुला",  pop:133, alloc:182, hdi:0.419 },
];

const projects = [
  { name:"Dhangadhi-Doti Fast Track Road",     dist:"Kailali/Doti",  budget:88, spent:52, status:"ongoing" },
  { name:"Seti Provincial Hospital Expansion", dist:"Dhangadhi",     budget:42, spent:38, status:"ongoing" },
  { name:"Mahakali Irrigation Project",        dist:"Kanchanpur",    budget:68, spent:24, status:"delayed" },
  { name:"Bajhang Agroforestry Program",       dist:"Bajhang",       budget:34, spent:34, status:"completed" },
  { name:"Rural Electrification Phase II",     dist:"Bajura/Achham", budget:56, spent:31, status:"ongoing" },
  { name:"Darchula Border Trade Zone",         dist:"Darchula",      budget:28, spent:8,  status:"delayed" },
  { name:"Province Assembly Building",         dist:"Dhangadhi",     budget:22, spent:22, status:"completed" },
  { name:"Shuklaphanta Tourism Circuit",       dist:"Kanchanpur",    budget:18, spent:6,  status:"delayed" },
];

const revenues = [
  { name:"Federal Equalization Grant", nepali:"समानीकरण अनुदान", amt:824, type:"Federal" },
  { name:"Federal Conditional Grant",  nepali:"सशर्त अनुदान",    amt:486, type:"Federal" },
  { name:"Special Grant",              nepali:"विशेष अनुदान",     amt:142, type:"Federal" },
  { name:"Complementary Grant",        nepali:"पूरक अनुदान",      amt:110, type:"Federal" },
  { name:"Province Tax Revenue",       nepali:"प्रदेश कर राजस्व", amt:198, type:"Own" },
  { name:"Non-Tax Revenue",            nepali:"गैर-कर राजस्व",    amt:112, type:"Own" },
  { name:"Internal Borrowing",         nepali:"आन्तरिक ऋण",       amt:80,  type:"Loan" },
];

const indicators = [
  { name:"Literacy rate",          val:62.4, nat:76.3, tgt:75.0 },
  { name:"Below poverty line",     val:26.8, nat:18.7, tgt:15.0 },
  { name:"School enrollment",      val:84.2, nat:88.1, tgt:95.0 },
  { name:"Health facility access", val:71.0, nat:80.4, tgt:90.0 },
  { name:"Safe drinking water",    val:68.5, nat:78.2, tgt:85.0 },
  { name:"Road connectivity",      val:58.3, nat:72.6, tgt:80.0 },
];

const sdgs = [
  { goal:"SDG 9 — Infrastructure",  amt:412, color:"#D85A30" },
  { goal:"SDG 4 — Education",        amt:318, color:"#378ADD" },
  { goal:"SDG 3 — Health",          amt:244, color:"#1D9E75" },
  { goal:"SDG 1 — No Poverty",      amt:186, color:"#7F77DD" },
  { goal:"SDG 2 — Zero Hunger",     amt:198, color:"#EF9F27" },
  { goal:"SDG 13 — Climate Action", amt:142, color:"#3B6D11" },
  { goal:"SDG 8 — Decent Work",     amt:98,  color:"#854F0B" },
];