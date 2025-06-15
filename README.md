# 🗳️ BallotBox — AI-Powered Election Management Platform ✨

<p align="center">
  <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmVmcDg4dWhzanRhczliNXVram45d3NmNnpkcXJwejY3aXoybHZsZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GHPSN2mwXEnuPGuOiH/giphy.gif" alt="Welcome GIF" width="300" />
</p>

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)  
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)  
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-skyblue?logo=tailwind-css)](https://tailwindcss.com/)  
[![Firebase](https://img.shields.io/badge/Firebase-SDK_v11-orange?logo=firebase)](https://firebase.google.com/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green?logo=mongodb)](https://www.mongodb.com/)  
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-skyblue?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-SDK_v11-orange?logo=firebase)](https://firebase.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green?logo=mongodb)](https://www.mongodb.com/)
[![Genkit](https://img.shields.io/badge/Genkit_AI-v1-brightgreen?logo=google-cloud)](https://firebase.google.com/docs/genkit)



---

> **BallotBox** is a modern, secure, and intelligent full-stack election management system. It offers role-based interfaces for Admins, Candidates, and Voters with real-time updates, AI-powered insights, and seamless user experience. Built using cutting-edge technologies like **Next.js 15**, **Firebase**, **MongoDB**, and **Genkit + Gemini AI**, it empowers organizations to conduct digital elections with transparency, scalability, and trust.

---

## 🚀 Features at a Glance

### 🌐 General
- **Responsive Design** for mobile and desktop
- **Dark/Light Mode** toggle
- **Role-Based Access Control (RBAC)**
- **Real-Time Data Sync** (Firestore listeners)
- **Optimized Performance** with image/font loading
- **Toasts & Feedback** for user actions
- **Custom 404/500 Pages**

### 🧠 AI Features (Genkit + Gemini)
- **AI-Powered Manifesto Summarization**
- **Election Help Chatbot** (FAQs, historical & contextual election data)

### 🛡️ Admin Panel
- Create, manage, and delete **elections**
- Approve or revoke **candidate** registrations
- Manage **voter** status (verification, eligibility)
- Filter/search through dynamic lists
- View real-time updates via Firestore

### 👤 Candidate Panel
- Register a **detailed profile** (auth + form)
- Apply for elections (MongoDB-linked)
- **Vote** if eligible

### 🗳️ Voter Panel
- Sign up & login via **Firebase Authentication**
- View upcoming, active, and past elections
- Read candidate platforms + AI summaries
- **Secure One-Time Voting** per election
- Confirmation of vote submission

---

## 🛠️ Tech Stack

| Category        | Tech Used |
|----------------|-----------|
| Framework      | [Next.js 15](https://nextjs.org/) |
| Frontend       | [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) |
| UI Components  | [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/) |
| Forms & Validation | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| Auth           | [Firebase Auth (Email/Password)](https://firebase.google.com/docs/auth) |
| Databases      | [MongoDB](https://www.mongodb.com/), [Firestore](https://firebase.google.com/docs/firestore) |
| AI Integration | [Genkit](https://firebase.google.com/docs/genkit) + [Gemini AI](https://deepmind.google/discover/blog/google-gemini-ai/) |
| Dev Tools      | ESLint, TypeScript, Turbopack, Firestore Emulator |

---

## 📦 Environment Setup

Create a `.env` file in your root:

\`\`\`env
# MongoDB
MONGODB_URI="your_mongo_connection"
MONGODB_DB_NAME="ballotbox_db"

# Firebase
# Firebase client keys go in src/lib/firebase.ts
# For Genkit AI use:
GOOGLE_API_KEY="your_google_api_key"

# URLs
NEXT_PUBLIC_APP_URL="http://localhost:9002"
\`\`\`

---

## 🔧 Installation Guide

\`\`\`bash
# Clone the repo
git clone https://github.com/pandashreyan/Ballotbox-app.git
cd Ballotbox-app

# Install dependencies
npm install
# or
yarn install
\`\`\`

---

## 🧪 Local Development

### 1️⃣ Run the frontend (Next.js)
\`\`\`bash
npm run dev
\`\`\`

### 2️⃣ Run Genkit AI server
\`\`\`bash
npm run genkit:dev
# Or with hot reload:
npm run genkit:watch
\`\`\`

App will be available at: [http://localhost:9002](http://localhost:9002)

---

## 🗄️ Database Setup

### ✅ MongoDB
- Update `.env` with connection string
- Collections are auto-generated

### ✅ Firebase
- Enable Firestore (Native Mode)
- Enable Email/Password Auth
- Add Firebase config to `src/lib/firebase.ts`
- Configure **Firestore Security Rules** (⚠️ Production critical!)
- Deploy `firestore.indexes.json` (or allow Firestore to auto-create)

---

## 🔐 Authentication & Role Management

| Role     | Auth Method               | Permissions |
|----------|---------------------------|-------------|
| Voter    | Firebase Auth             | Vote, view |
| Candidate| Firebase Auth + Profile   | Register, vote |
| Admin    | Mock login via dropdown   | Full control |

ℹ️ Use the role switcher (top-right) during development to test multiple user flows.

---

## 📜 Scripts Available

\`\`\`bash
npm run dev              # Start Next.js dev server
npm run genkit:dev       # Start Genkit AI server
npm run genkit:watch     # Genkit server with file watching
npm run build            # Build Next.js app for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
\`\`\`

---

## 🚀 Deployment Guide

### Recommended Hosting:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)

### Steps:
1. Push repo to GitHub
2. Connect to hosting platform
3. Set environment variables (from `.env`)
4. Set build command:
   \`\`\`
   npm run build
   \`\`\`
5. Output directory:  
   \`\`\`
   .next
   \`\`\`

---

## 🤝 Contributing

Pull requests are welcome! 🙌  
If you have ideas or spot issues, feel free to:

- Fork this repo
- Create your feature branch: \`git checkout -b feature/your-feature\`
- Commit changes: \`git commit -m 'Add feature'\`
- Push: \`git push origin feature/your-feature\`
- Open a pull request!

---

## 📝 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).  
Make sure to add a \`LICENSE.txt\` file to your project root.

---

## 🌟 Acknowledgements

Thanks to the open-source community, Google Firebase, MongoDB, and the creators of Genkit + Gemini for empowering developers to build intelligent systems with ease.More actions

---

> Built with 💻 by [Shreyan Panda](https://github.com/pandashreyan)  
> Let's make digital democracy smarter and more accessible.
