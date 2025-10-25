# DentWise

This project is a comprehensive dental-care platform that brings **AI voice assistance** to traditional clinic workflows. It stores doctors, patients, and appointment data in **PostgreSQL**, serves a **RESTful API** and **Server Actions** via **Next.js**, and provides a modern **React** UI for booking and administration. Authentication is handled by **Clerk**, voice calls by **Vapi**, and emails by **Resend**.

---

## Visit The Site

Feel free to check out the **[project here!]([https://your-app-url.example](https://dentwiseai.vercel.app/))**

![DentWise Screenshot](<img width="1012" height="652" alt="Screenshot 2025-10-24 at 11 44 35 PM" src="https://github.com/user-attachments/assets/e4154dce-c6da-4034-8a88-88af27dda75f" />)

---

## Features

* **PostgreSQL Database:** Persists users, doctors, and appointments with indexes and migrations via Prisma.
* **Next.js Backend:** App Router with **Route Handlers** (REST) and **Server Actions** for secure, type-safe operations.
* **React Frontend:** Modern UI built with React + TypeScript, Tailwind CSS, Radix UI, and shadcn/ui.
* **AI Voice Agent (Vapi):** Real-time STT/TTS calls for intake, FAQs, and appointment creation.
* **Authentication (Clerk):** Email/password and OAuth, session management, and role-based access (admin vs. user).
* **Email Notifications (Resend + React Email):** Branded confirmations, reminders, and invoices.
* **3-Step Booking Flow:** Dentist → Service & Time → Confirm, with availability checks and conflict prevention.
* **Admin Dashboard:** Manage doctors, appointments, and users.
* **Performance & DX:** TanStack Query caching, Turbopack dev builds, strict TypeScript, Biome formatting.

---

## Prerequisites

Before running this project locally, ensure you have the following installed:

* **Node.js 18+** and **npm**
* **PostgreSQL** database
* Accounts/keys for **Clerk**, **Vapi**, and **Resend**
* An IDE (VS Code, WebStorm, etc.)

---

## Installation

### Backend Setup

1. **Clone** this repository.
2. Create a file **`.env.local`** at the project root and set the required variables:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   DATABASE_URL=your_postgres_database_url
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
   NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
   RESEND_API_KEY=your_resend_api_key
   ADMIN_EMAIL=your_admin_email
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```
4. Run database migrations:

   ```bash
   npx prisma migrate dev --name init
   ```
5. (Optional) Seed initial data if a seed script is provided:

   ```bash
   npm run seed
   ```

### Frontend Setup

1. In the project root, install dependencies:

   ```bash
   npm install
   ```
2. Start the development server:

   ```bash
   npm run dev
   ```
3. Navigate to **`http://localhost:3000`** to use the app.

---

## Usage

* Access the application at **`http://localhost:3000`**.
* Sign in via **Clerk** (the first login matching `ADMIN_EMAIL` can be promoted to admin).
* Book appointments through the **3-step flow**; confirmation emails are sent via **Resend**.
* Start an AI voice session (when enabled) to collect patient info and schedule visits.

---

## Contributing

Contributions are welcome! If you’d like to enhance DentWise or report issues, please submit a pull request or open an issue.
