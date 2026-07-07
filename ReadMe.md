# 🌐 SkillSphere

**An AI-Powered Hyperlocal Freelance Ecosystem**

SkillSphere is an enterprise-grade, full-stack MERN platform designed to connect hiring clients with verified local professionals. Moving beyond basic filtering, the platform leverages Hugging Face semantic vector matching, real-time Socket.IO collaboration workspaces, MongoDB geospatial indexing, and a Stripe Connect escrow ledger to create a secure, high-end freelance marketplace.

Designed with a premium, minimalist Apple/Tesla-inspired user interface, SkillSphere prioritizes clarity, performance, and trust.

---

## ✨ Advanced Key Features

* **🤖 AI-Powered Job Matching:** Utilizes Hugging Face semantic vector embeddings to score freelancer skills against project requirements, outputting real-time match percentages.
* **📍 Hyperlocal Discovery Engine:** Built on MongoDB Atlas `$geoNear` 2dsphere spatial indexing, allowing users to filter opportunities within precise geographic radii (e.g., 25km–100km).
* **🛡️ Multi-Role Authentication (RBAC):** Secure JWT-based access control with distinct dashboard capabilities for Clients, Freelancers, and Administrators. Features Two-Factor Authentication (2FA) TOTP readiness.
* **💬 Real-Time Execution Workspace:** Encrypted Socket.IO chat rooms featuring live read receipts, typing indicators, and file attachments.
* **💳 Secure Escrow Ledger:** Financial workflows integrating Stripe Connect. Clients fund milestones into escrow, tracking deliverable progress via an interactive 0–100% completion slider before approving payouts.
* **⚖️ Governance & Dispute Resolution:** Root admin portal to audit platform GMV, moderate escrow disputes, suspend fraudulent accounts, and adjudicate verified feedback algorithms.
* **📅 Availability Scheduler:** Interactive booking engine allowing clients to lock in consultation windows directly from a freelancer's configured calendar slots.

---

## 🛠️ Tech Stack Architecture

**Frontend**
* **Framework:** React.js
* **Styling:** Tailwind CSS
* **State Management:** Redux Toolkit & TanStack React Query
* **Analytics:** Recharts

**Backend**
* **Runtime:** Node.js + Express.js
* **Database:** MongoDB Atlas
* **Real-Time:** Socket.IO
* **Security:** Helmet, Express-Rate-Limit, Mongo-Sanitize, Bcrypt.js, JsonWebToken

**Third-Party SaaS Integrations**
* **Payments:** Stripe API
* **File Storage:** Cloudinary
* **AI Inference:** Hugging Face API

---

## 🗄️ Database Collections

The MongoDB architecture relies on highly relational and aggregated schemas:
`Users` | `FreelancerProfiles` | `Gigs` | `Proposals` | `Reviews` | `Messages` | `Payments` | `Notifications` | `Disputes` | `AdminLogs`

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the SkillSphere ecosystem locally on your machine.

### 1. Clone the Repository
```Bash
git clone [https://github.com/your-username/skillsphere.git](https://github.com/your-username/skillsphere.git)
cd skillsphere
```

### 2. Backend Setup
```Bash
cd backend
npm install
```
Create a .env file in the /backend root directory and add the following local environment variables:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
NODE_ENV=development

Seed the Database:
```Bash
node seed.js
```

Start the backend server:
```Bash
npm run dev
```

### 3. Frontend Setup
```Bash
cd frontend
npm install
```
Start the Vite development server:
```Bash
npm run dev
```
Open your browser and navigate to http://localhost:5173.
(Note: You can instantly bypass password entry using the "⚡ Instant Sandbox Testing" buttons on the login screen).

## 📄 License
This project is licensed under the MIT License.