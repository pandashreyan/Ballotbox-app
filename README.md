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
[![Genkit](https://img.shields.io/badge/Genkit_AI-v1-brightgreen?logo=google-cloud)](https://firebase.google.com/docs/genkit)

---

> **BallotBox** is a premium, secure, and highly intelligent full-stack election management platform. It offers role-based interfaces for Admins, Candidates, and Voters with real-time updates, AI-powered election analytics, and automated platform comparisons. Built using cutting-edge technologies like **Next.js 15**, **Firebase**, **MongoDB**, and **Genkit + Gemini AI**, it empowers modern organizations to conduct digital elections with full transparency, scalable performance, and absolute trust.

---

## 🚀 Key Premium Additions

### 📊 1. Real-Time Live Results Dashboard (SSE Streaming)
* **Election Night Atmosphere**: Results stream live as votes are cast—no page refreshes required!
* **High Performance**: Built using **Server-Sent Events (SSE)** coupled with memory-optimized Node.js Event Emitters, ensuring minimal database load and instantaneous response times.
* **Micro-Animations**: Real-time Recharts visualizations smoothly slide candidates' progress bars the moment a ballot register is committed.

### 🤖 2. Side-by-Side Platform Comparer (AI Assistant)
* **Comparative Platform Matrix**: Voters can select 2 or more candidates and click **"Compare Platforms"** to generate an automated, objective side-by-side matrix analyzing their manifestos in key policy sectors.
* **Empowered Voters**: Uses Google Genkit to run structured Gemini LLM queries to produce clear, unbiased platform summaries.

### 🛡️ 3. Bulletproof AI Fallback Engine (Zero-Downtime Design)
* **Quota-Proof Resiliency**: Intercepts `429 Too Many Requests` API limits and connection timeouts gracefully.
* **Smart Local Comparative Engine**: If Gemini limits are exceeded, a built-in fallback parser analyzes candidate profile manifestos locally to generate a clean, rich structured comparison matrix, ensuring zero-downtime voting guidance.

---

## 🚀 Features at a Glance

### 🌐 General
- **Responsive Design** for flawless mobile and desktop viewports
- **Sleek Dark/Light Mode** support
- **Role-Based Access Control (RBAC)**
- **Real-Time Data Sync** (Firestore listeners + SSE)
- **High-Fidelity Animations** using Tailwind Animate & Framer Motion
- **Toasts & Micro-Interactions** for instant feedback

### 🧠 AI Features (Genkit + Gemini)
- **AI-Powered Manifesto Summarization**
- **Interactive Election Chatbot** (Contextual voter FAQs with rate-limit fallbacks)
- **Side-by-Side Platform Matrix Comparer**

### 🛡️ Admin Panel
- Create, manage, and delete **elections**
- Approve or revoke **candidate** applications
- Control **voter** registration (verification, eligibility)
- Real-time audit dashboard via Firestore

### 👤 Candidate Panel
- Profile application form with image uploads
- Live status checker for registration approvals

### 🗳️ Voter Panel
- Secure **one-time voting** per election
- Active results dashboard
- Automated platform side-by-side comparison matrix

---

## 🛠️ Tech Stack

| Category | Tech Used |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Frontend** | [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/) |
| **Databases** | [MongoDB](https://www.mongodb.com/) (Collections), [Firestore](https://firebase.google.com/docs/firestore) (Live Auditing) |
| **AI Engine** | [Google Genkit](https://firebase.google.com/docs/genkit) + [Gemini-2.0-Flash API](https://deepmind.google/discover/blog/google-gemini-ai/) |
| **Server Events** | Server-Sent Events (SSE) + EventEmitters |

---

## 📦 Environment Setup

Create a `.env.local` file in your root:

\`\`\`env
# Gemini/Genkit
GEMINI_API_KEY="your_gemini_api_key"

# MongoDB Connection
MONGODB_URI="your_mongodb_srv_string"
MONGODB_DB_NAME="ballotbox"

# URL
NEXT_PUBLIC_APP_URL="http://localhost:9002"
\`\`\`

---

## 🔧 Installation & Local Run

\`\`\`bash
# Clone the repository
git clone https://github.com/pandashreyan/Ballotbox-app.git
cd Ballotbox-app

# Install dependencies
npm install

# Start Next.js App Router
npm run dev
\`\`\`

### 2️⃣ Run Genkit AI server (Optional)
```bash
npm run genkit:dev
# Or with hot reload:
npm run genkit:watch
```

* **Local Dev URL**: [http://localhost:9002](http://localhost:9002)
* **Production Live URL**: [https://ballotbox-app-production.up.railway.app/](https://ballotbox-app-production.up.railway.app/)

---

## 🚀 Zero-Config Cloud Deployment

### Recommended Platforms:
* **[Railway]** (Recommended for full-stack Next.js hosting with automated builders)
* **[Vercel]** 

### 🛡️ Built-In Deployment Safeguards Included:
1. **Asynchronous Parameter Signatures**: Completely Next.js 15 compilant—all dynamic folder paths asynchronously await `params` as a `Promise` during tracing.
2. **Dynamic Route Enforcement**: All dynamic API endpoints use `export const dynamic = 'force-dynamic'` to prevent pre-render build failures on Vercel/Railway.
3. **Build-Time Database Safety**: The database client in `mongodb.ts` resolves mock promises during compile traces when env keys are absent in isolated cloud builders, resolving build-breaking trace exceptions.

---

## 🤝 Contributing

Pull requests are welcome! 🙌  
- Fork this repo
- Create your feature branch (\`git checkout -b feature/your-feature\`)
- Commit your changes (\`git commit -m 'Add feature'\`)
- Push (\`git push origin feature/your-feature\`)
- Open a Pull Request!

---

## 📝 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).  

---

> Built with 💻 by [Shreyan Panda](https://github.com/pandashreyan)  
> Let's make digital democracy smarter, resilient, and more accessible.
