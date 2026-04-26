const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat,
  HeadingLevel, TabStopType, TabStopPosition, PageNumber, Footer,
  Header, UnderlineType
} = require('docx');
const fs = require('fs');

const RED    = "C62828";
const NAVY   = "0A1628";
const GRAY   = "4B5563";
const LGRAY  = "F3F4F6";
const BLACK  = "111827";
const WHITE  = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ── Helpers ──────────────────────────────────────────────────────────────────
const P = (children, opts = {}) => new Paragraph({ children, ...opts });
const T = (text, opts = {}) => new TextRun({ text, font: "Arial", ...opts });
const BR = () => P([T("")], { spacing: { after: 0, before: 0 } });
const HR = () => P([], {
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RED, space: 1 } },
  spacing: { after: 160, before: 160 }
});

const bullet = (text, bold = false) => P([T(text, { bold, size: 22, color: BLACK })], {
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 80 }
});

const sectionHead = (text) => P([T(text, { bold: true, size: 24, color: RED, allCaps: true })], {
  spacing: { before: 280, after: 120 }
});

const body = (text, opts = {}) => P([T(text, { size: 22, color: BLACK, ...opts })], {
  spacing: { after: 160 },
  alignment: AlignmentType.JUSTIFIED
});

const bold = (text) => T(text, { bold: true, size: 22, color: BLACK });
const norm = (text) => T(text, { size: 22, color: BLACK });

// ── Stat box ──────────────────────────────────────────────────────────────────
const statBox = (number, label) => new TableCell({
  borders,
  width: { size: 2200, type: WidthType.DXA },
  shading: { fill: "FFF5F5", type: ShadingType.CLEAR },
  margins: { top: 120, bottom: 120, left: 140, right: 140 },
  children: [
    P([T(number, { bold: true, size: 48, color: RED, font: "Arial" })],
      { alignment: AlignmentType.CENTER }),
    P([T(label, { size: 16, color: GRAY, font: "Arial" })],
      { alignment: AlignmentType.CENTER }),
  ]
});

// ── Feature row ───────────────────────────────────────────────────────────────
const featureRow = (icon, title, desc) => new TableRow({
  children: [
    new TableCell({
      borders: noBorders,
      width: { size: 600, type: WidthType.DXA },
      margins: { top: 60, bottom: 60, left: 0, right: 120 },
      children: [P([T(icon, { size: 28, font: "Segoe UI Emoji" })],
        { alignment: AlignmentType.CENTER })]
    }),
    new TableCell({
      borders: noBorders,
      width: { size: 8760, type: WidthType.DXA },
      margins: { top: 60, bottom: 60, left: 0, right: 0 },
      children: [
        P([T(title, { bold: true, size: 22, color: NAVY })]),
        P([T(desc, { size: 20, color: GRAY })], { spacing: { after: 0 } }),
      ]
    }),
  ]
});

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22, color: BLACK } }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1008, right: 1260, bottom: 1008, left: 1260 }
      }
    },
    children: [

      // ── LETTERHEAD ──────────────────────────────────────────────────────
      new Table({
        width: { size: 9720, type: WidthType.DXA },
        columnWidths: [6000, 3720],
        rows: [new TableRow({ children: [
          new TableCell({
            borders: noBorders,
            width: { size: 6000, type: WidthType.DXA },
            children: [
              P([T("LIFE STILL GOES ON PUBLISHING", { bold: true, size: 28, color: NAVY, allCaps: true })]),
              P([T("Bryan \u201CBW\u201D White, Founder", { size: 20, color: GRAY })],
                { spacing: { after: 40 } }),
              P([T("Pearl, Mississippi  \u00B7  www.lifestillgoeson.com", { size: 18, color: GRAY })],
                { spacing: { after: 0 } }),
            ]
          }),
          new TableCell({
            borders: noBorders,
            width: { size: 3720, type: WidthType.DXA },
            margins: { top: 0, bottom: 0, left: 200, right: 0 },
            children: [
              P([T("\u26A1", { size: 56, font: "Segoe UI Emoji" })],
                { alignment: AlignmentType.RIGHT }),
            ]
          }),
        ]})]
      }),

      HR(),

      // ── DATE / RECIPIENT ────────────────────────────────────────────────
      P([T("April 26, 2025", { size: 22, color: GRAY })], { spacing: { after: 240 } }),

      P([T("Dr. Daniel P. Edney", { bold: true, size: 22 })]),
      P([T("State Health Officer", { size: 22 })]),
      P([T("Mississippi State Department of Health (MSDH)", { size: 22 })]),
      P([T("570 East Woodrow Wilson Drive", { size: 22 })]),
      P([T("Jackson, Mississippi 39216", { size: 22 })], { spacing: { after: 280 } }),

      // ── SUBJECT LINE ────────────────────────────────────────────────────
      new Table({
        width: { size: 9720, type: WidthType.DXA },
        columnWidths: [9720],
        rows: [new TableRow({ children: [
          new TableCell({
            shading: { fill: "FFF5F5", type: ShadingType.CLEAR },
            borders: { top: border, bottom: border,
              left: { style: BorderStyle.SINGLE, size: 12, color: RED },
              right: noBorder },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              P([
                T("RE: ", { bold: true, size: 22, color: RED }),
                T("Partnership Proposal \u2014 MS Hospital Diversion App for Mississippi EMS Personnel",
                  { bold: true, size: 22, color: NAVY })
              ], { spacing: { after: 0 } })
            ]
          })
        ]})]
      }),

      BR(),

      // ── SALUTATION ──────────────────────────────────────────────────────
      body("Dear Dr. Edney:"),

      // ── OPENING ─────────────────────────────────────────────────────────
      P([
        norm("My name is Bryan \u201CBW\u201D White. I am a public safety administrator, EMT, law enforcement officer, and U.S. Navy Hospital Corpsman veteran with nearly four decades of combined service to the people of Mississippi. I am writing to introduce a mobile application I have developed that I believe can meaningfully improve emergency medical coordination across our state \u2014 and to formally request MSDH\u2019s consideration of an official partnership or data integration."),
      ], { spacing: { after: 160 }, alignment: AlignmentType.JUSTIFIED }),

      HR(),
      sectionHead("The Problem"),

      body("Every day, Mississippi EMS crews transport patients toward hospitals that are on diversion \u2014 only to discover this upon arrival or through informal radio contact. There is currently no unified, real-time digital system available to Mississippi ambulance personnel that shows the diversion status of all major hospitals across the state simultaneously. This gap costs critical minutes, increases patient risk, and places unnecessary strain on already-burdened emergency departments."),

      body("The 2022 Mississippi EMS System Assessment identified communication gaps between EMS and receiving facilities as a top-tier operational challenge. The MS Hospital Diversion App directly addresses this."),

      HR(),
      sectionHead("The Solution"),

      body("I have developed MS Hospital Diversion \u2014 a mobile application purpose-built for Mississippi EMS personnel, hospital charge nurses, and EMS supervisors. The app provides:"),

      BR(),

      // ── Feature table ───────────────────────────────────────────────────
      new Table({
        width: { size: 9720, type: WidthType.DXA },
        columnWidths: [600, 9120],
        rows: [
          featureRow("\uD83C\uDFE5", "Real-Time Status Board",
            "All 24 major Mississippi hospitals displayed with live diversion status (OPEN, ADVISORY, DIVERSION, BYPASS), sorted by severity."),
          featureRow("\uD83D\uDCCD", "GPS Nearest Hospitals",
            "Uses device location to rank closest accepting facilities with estimated drive times \u2014 critical for field crews with critical patients."),
          featureRow("\uD83D\uDD14", "Instant Push Notifications",
            "EMS units receive immediate alerts when any hospital escalates to DIVERSION or BYPASS status."),
          featureRow("\u26A1", "EMS / Nurse Update Portal",
            "Charge nurses publish diversion status, reason, and estimated clear time directly from their device. Updates are live statewide within seconds."),
          featureRow("\uD83D\uDCCA", "Admin Dashboard",
            "Supervisors see a system-wide overview with regional breakdown \u2014 Central, North, South, Coast, East, Delta, and Southwest."),
          featureRow("\uD83D\uDD10", "Role-Based Security",
            "Separate logins for EMS crews, charge nurses, and administrators with Firestore security rules enforcing appropriate access levels."),
        ]
      }),

      BR(),

      // ── Stats ───────────────────────────────────────────────────────────
      new Table({
        width: { size: 9720, type: WidthType.DXA },
        columnWidths: [2200, 2200, 2200, 2200, 920],
        rows: [new TableRow({ children: [
          statBox("24", "Hospitals Covered"),
          statBox("7", "MS Regions"),
          statBox("3", "User Roles"),
          statBox("< 2s", "Update Latency"),
          new TableCell({ borders: noBorders, width: { size: 920, type: WidthType.DXA }, children: [BR()] }),
        ]})]
      }),

      BR(),

      HR(),
      sectionHead("Partnership Request"),

      body("I am respectfully requesting MSDH\u2019s consideration of one or more of the following:"),

      bullet("Official endorsement of the app for use by Mississippi EMS agencies"),
      bullet("Integration with MSDH\u2019s existing hospital reporting infrastructure or EMS data systems"),
      bullet("Distribution of the app through the MS EMS Bureau\u2019s agency network"),
      bullet("Collaboration on a pilot program with two to three willing hospital systems and their affiliated EMS agencies"),
      bullet("Inclusion in MSDH\u2019s communications to hospital charge nurses statewide regarding voluntary participation"),

      BR(),
      body("The application is fully built, tested, and ready for deployment. It is available on GitHub at github.com/paisleybrand95-lab/Mississippi-Hospital-Diversion and can be submitted to the Apple App Store and Google Play Store upon establishing a partnership framework."),

      HR(),
      sectionHead("About the Developer"),

      body("I have served Mississippi\u2019s communities across four decades in uniform \u2014 as a Navy Hospital Corpsman, EMT, law enforcement officer, and public safety administrator currently serving at Hudspeth Regional Center Police Department in Whitfield, Mississippi. I am also the founder of Life Still Goes On Publishing, with a catalog of over ten published titles spanning faith, public safety, Black history, and leadership."),

      body("This application was not built for profit. It was built because I have stood at the back of an ambulance, I know what delayed information costs, and I believe Mississippi\u2019s EMS personnel deserve a better tool."),

      HR(),
      sectionHead("Next Steps"),

      body("I would welcome the opportunity to provide a live demonstration of the application at your convenience \u2014 in person in Jackson or via video conference. I am also available to present to the MS EMS Bureau, the Mississippi Hospital Association, or any relevant working group."),

      body("Please feel free to contact me at the information below. I look forward to the possibility of serving Mississippi\u2019s emergency medical infrastructure in this way."),

      BR(),
      P([T("Respectfully submitted,", { size: 22, color: BLACK })], { spacing: { after: 480 } }),
      P([T("Bryan \u201CBW\u201D White", { bold: true, size: 22, color: NAVY })]),
      P([T("Founder, Life Still Goes On Publishing", { size: 22, color: GRAY })]),
      P([T("Public Safety Administrator | EMT | Navy Hospital Corpsman (Veteran)", { size: 20, color: GRAY })]),

      BR(),

      // ── Contact block ───────────────────────────────────────────────────
      new Table({
        width: { size: 9720, type: WidthType.DXA },
        columnWidths: [4860, 4860],
        rows: [new TableRow({ children: [
          new TableCell({
            borders,
            shading: { fill: LGRAY, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            width: { size: 4860, type: WidthType.DXA },
            children: [
              P([T("WEBSITE", { size: 16, bold: true, color: GRAY, allCaps: true })]),
              P([T("www.lifestillgoeson.com", { size: 20, color: RED })], { spacing: { after: 0 } }),
            ]
          }),
          new TableCell({
            borders,
            shading: { fill: LGRAY, type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            width: { size: 4860, type: WidthType.DXA },
            children: [
              P([T("GITHUB REPOSITORY", { size: 16, bold: true, color: GRAY, allCaps: true })]),
              P([T("github.com/paisleybrand95-lab/Mississippi-Hospital-Diversion",
                { size: 18, color: RED })], { spacing: { after: 0 } }),
            ]
          }),
        ]})]
      }),

      BR(),
      P([T("Enclosure: MS Hospital Diversion \u2014 Feature Overview & Screenshots", { size: 18, color: GRAY, italics: true })]),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/MSDH-Outreach-Letter.docx', buffer);
  console.log('✓ MSDH-Outreach-Letter.docx created');
});
