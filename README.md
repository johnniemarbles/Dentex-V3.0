# Dentistry.Exchange

The Operating System for Modern Dentistry. A multi-tenant platform featuring clinic directories, bookings, and recruitment.

## Version
**0.0.1** (Green Heartbeat)

## Dependencies
Run the following command to install the required packages:
```bash
npm install react-router-dom @supabase/supabase-js lucide-react
```

## Architecture
- **Virtual Router**: Simulates subdomains via path prefixes:
  - `/` -> `www` (Landing)
  - `/clinics` -> `clinics` (Directory)
  - `/admin` -> `admin` (Platform)
  - `/recruit` -> `recruit` (Jobs)

## Setup
1. Configure `lib/supabaseClient.ts` with your Supabase credentials.
2. Run `npm start`.
