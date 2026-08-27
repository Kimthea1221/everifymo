// desktopfrontend/src/pages/fdafolder/reportData.js
const allConsumerReports = [
  {
    id: 1,
    caseId: "ICM-2025-00185",
    product: "HerbalSlim Capsules",
    manufacturer: "NatureFit Labs",
    category: "Food",
    source: "Walk-in",
    leaConfirmation: true,
    status: "Pending Verification",
    region: "Region IV-A",
    dateReceived: "2026-05-17 10:42",
    description: "Complainant claims no CPR or LTO is displayed on the product packaging, and there is no record of registration in the FDA database for this manufacturer.",
    documents: [
      { id: 'doc-1', name: 'Packaging_Front.jpg', size: '1.8 MB', type: 'image/jpeg', uploadedBy: 'Walk-in Complainant', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
      { id: 'doc-2', name: 'Intake_Receipt_Details.pdf', size: '420 KB', type: 'application/pdf', uploadedBy: 'LEA Officer', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'doc-3', name: 'Investigation_Notes.docx', size: '210 KB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadedBy: 'LEA Officer', url: '/sample-evidence.docx' }
    ]
  },
  {
    id: 2,
    caseId: "ICM-2026-00412",
    product: "GlowSkin Cream",
    manufacturer: "Radiant Beauty Co.",
    category: "Cosmetics",
    source: "Browser Extension",
    status: "Under Review",
    region: "NCR",
    dateReceived: "2026-06-01 09:15",
    description: "Advertised on social media with extreme therapeutic claims. Preliminary check shows incomplete registration papers.",
    documents: [
      { id: 'doc-4', name: 'Online_Ad_Screenshot.png', size: '2.4 MB', type: 'image/png', uploadedBy: 'Extension User', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800' }
    ]
  },
  {
    id: 3,
    caseId: "ICM-2026-00413",
    product: "SmoothSkin Lotion",
    manufacturer: "Radiant Beauty Co.",
    category: "Cosmetics",
    source: "Browser Extension",
    status: "Takedown Requested",
    region: "NCR",
    dateReceived: "2026-06-01 09:15",
    description: "Identical seller credentials as GlowSkin Cream. Takedown requested due to dangerous chemical content detected in third-party laboratory tests."
  },
  {
    id: 4,
    caseId: "ICM-2026-00511",
    product: "PureOxy Mask",
    manufacturer: "MedTech Innovations",
    category: "Medical Device",
    source: "Walk-in",
    status: "Verified",
    region: "Region III",
    dateReceived: "2026-06-05 14:30",
    description: "Walk-in complainant brought the medical mask for verification. Verified to have proper FDA medical grade approvals and licensing."
  },
  {
    id: 5,
    caseId: "ICM-2026-00620",
    product: "PainRelief Patch",
    manufacturer: "BioPharma Corp",
    category: "Pharmaceutical",
    source: "Walk-in",
    status: "Forwarded to LEA",
    region: "Region VII",
    dateReceived: "2026-06-10 11:20",
    description: "Unregistered pharmaceutical pain patches distributed locally. Case forwarded to LEA (CIDG) for field operation coordination."
  },
  {
    id: 6,
    caseId: "ICM-2026-00705",
    product: "DietSlim Shake",
    manufacturer: "NutraLife Inc.",
    category: "Food",
    source: "Browser Extension",
    status: "Takedown Completed",
    region: "Region XI",
    dateReceived: "2026-06-12 16:45",
    description: "Reported via web extension for selling unauthorized fat burner shake. Social media accounts have been shut down; takedown completed."
  },
  {
    id: 7,
    caseId: "ICM-2026-00810",
    product: "Miracle Hair Tonic",
    manufacturer: "GlowLabs LLC",
    category: "Cosmetics",
    source: "Browser Extension",
    status: "Dismissed",
    region: "Region IV-B",
    dateReceived: "2026-06-15 08:30",
    description: "Complainant claimed hair loss, but product verified to be compliant, fully registered, and complaints deemed groundless."
  },
  {
    id: 8,
    caseId: "ICM-2025-00191",
    product: "FreshBreath Mouthwash",
    manufacturer: "OralCare PH",
    category: "Cosmetics",
    source: "Walk-in",
    status: "Pending Verification",
    region: "CAR",
    dateReceived: "2026-05-18 08:02",
    description: "Intake form submitted by consumer. Suspicious labeling and active ingredients concentration needs lab verification."
  },
  {
    id: 9,
    caseId: "ICM-2026-01015",
    product: "DentalCure Paste",
    manufacturer: "OralCare Group",
    category: "Cosmetics",
    source: "Walk-in",
    status: "Under Review",
    region: "Region VI",
    dateReceived: "2026-06-25 15:40",
    description: "Complaint from local consumer association regarding dental paste triggering severe gum bleeding. Lab analysis underway."
  }
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseMonthIndex(dateString) {
  const datePart = dateString.split(' ')[0];
  const [year, month] = datePart.split('-');
  const monthIndex = Number(month) - 1;
  return Number.isNaN(monthIndex) ? 0 : monthIndex;
}

function getTrendData(reports) {
  const browserValues = Array(12).fill(0);
  const walkinValues = Array(12).fill(0);

  reports.forEach(report => {
    const monthIndex = parseMonthIndex(report.dateReceived);
    if (report.source === 'Browser Extension') {
      browserValues[monthIndex] += 1;
    } else if (report.source === 'Walk-in') {
      walkinValues[monthIndex] += 1;
    }
  });

  return {
    months: MONTHS,
    browserValues,
    walkinValues
  };
}

function getReportStats(reports) {
  const browserExtension = reports.filter(report => report.source === 'Browser Extension').length;
  const walkIn = reports.filter(report => report.source === 'Walk-in').length;
  const categoryCounts = reports.reduce((result, report) => {
    result[report.category] = (result[report.category] || 0) + 1;
    return result;
  }, {});

  const categoryMix = [
    { label: 'Cosmetics', value: categoryCounts['Cosmetics'] || 0, color: '#2563eb' },
    { label: 'Food', value: (categoryCounts['Food'] || 0) + (categoryCounts['Supplement'] || 0), color: '#10b981' },
    { label: 'Drugs', value: categoryCounts['Pharmaceutical'] || 0, color: '#06b6d4' },
    { label: 'Med Device', value: categoryCounts['Medical Device'] || 0, color: '#f59e0b' }
  ];

  return {
    browserExtension,
    walkIn,
    takedownsRecorded: 0,
    takedownsCompleted: 0,
    total: reports.length,
    categoryMix
  };
}

export { allConsumerReports, getTrendData, getReportStats };
