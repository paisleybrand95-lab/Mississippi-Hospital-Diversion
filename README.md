# Mississippi Hospital Diversion

**Real-time hospital diversion status network for Mississippi EMS personnel.**

Built for ambulance crews, charge nurses, and EMS supervisors across the state of Mississippi.

---

## Features

- **24 Mississippi hospitals** with real addresses, phone numbers, and ED direct lines
- **Role-based login** — EMS Crew, Charge Nurse, Supervisor/Admin
- **Live status board** — sorted by severity (BYPASS → DIVERT → ADVISORY → OPEN)
- **GPS Nearest Hospitals** — finds closest accepting facilities using device location
- **Map view** — color-coded hospital pins across the state
- **Alerts feed** — chronological log of every status change
- **EMS / Nurse update modal** — publish diversion status, reason, and estimated clear time
- **Admin dashboard** — system-wide overview, region breakdown, active diversion list
- **Nurse view** — my facility only, with direct update controls

## Hospital Regions

| Region | Key Facilities |
|--------|---------------|
| Central | UMMC, Baptist, St. Dominic, Merit Health |
| North | NMMC Tupelo, Baptist North MS |
| South | Forrest General, Wesley, South Central |
| Coast | Memorial Gulfport, Singing River, Ocean Springs |
| East | Anderson Regional, Rush Foundation, Oktibbeha |
| Delta | Delta Regional |
| Southwest | King's Daughters, SW MS Regional, Merit Natchez |

## Demo Credentials

| Role | Field | PIN |
|------|-------|-----|
| EMS Crew | Any Unit ID (e.g. MED-7) | 1234 |
| Charge Nurse | Select hospital | 5678 |
| Supervisor/Admin | Any Admin ID | 9999 |

## Getting Started

```bash
npm install
npm start
```

## Tech Stack

- React 18
- Pure CSS-in-JS (no external UI library)
- Haversine GPS distance calculation
- Browser Geolocation API

## Author

Bryan "BW" White  
Life Still Goes On Publishing  
[www.lifestillgoeson.com](https://www.lifestillgoeson.com)

---

*Mississippi EMS Bureau · MSDH Division of Emergency Planning*
