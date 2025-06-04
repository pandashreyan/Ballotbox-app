
# BallotBox: AI-Powered Election Management Platform 🗳️✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-skyblue?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-SDK_v11-orange?logo=firebase)](https://firebase.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green?logo=mongodb)](https://www.mongodb.com/)
[![Genkit](https://img.shields.io/badge/Genkit_AI-v1-brightgreen?logo=google-cloud)](https://firebase.google.com/docs/genkit)

BallotBox is a modern, secure, and feature-rich full-stack election management application. Built with Next.js, React, ShadCN UI, Tailwind CSS, MongoDB, Firebase, and powered by Genkit AI, it provides a seamless experience for administrators, candidates, and voters. From creating elections to casting votes and getting AI-driven insights, BallotBox aims to make the democratic process more accessible and transparent.

<!-- **Live Demo:** [Link to your deployed app (Coming Soon!)] -->

## Key Features 🚀

### General Features:
*   **Responsive Design:** Adapts to various screen sizes for a consistent experience on desktop and mobile.
*   **Light/Dark Mode:** Theme support based on user preference.
*   **Role-Based Access Control:** Distinct interfaces and functionalities for Admins, Candidates, and Voters.
*   **Real-time Updates:**
    *   Election results page polls for updates.
    *   Admin pages for voter and candidate management update in real-time using Firestore listeners.
*   **Custom Error Pages:** User-friendly error pages for 404 (Not Found) and 500 (Server Error).
*   **Optimized Fonts & Images:** Utilizes `next/font` for font optimization and `next/image` for image optimization.
*   **Toasts/Notifications:** For user feedback on actions.

### AI-Powered Features (Genkit & Gemini):
*   **Candidate Platform Summarization:** AI generates concise summaries of candidate manifestos.
*   **Election Information Chatbot:** An interactive chatbot to answer user questions about general election processes, global election history, and current national leadership (with appropriate disclaimers).

### Admin Features:
*   **Election Management:**
    *   Create new elections with details (name, description, dates, initial candidates).
    *   Delete existing elections.
*   **Candidate Approval Management:**
    *   View list of registered candidates awaiting profile approval.
    *   Approve or revoke candidate profile registrations.
    *   Real-time updates on candidate list.
*   **Voter Management:**
    *   View list of all registered voters.
    *   Toggle voter eligibility status.
    *   Toggle voter verification status.
    *   Filter voter list by various statuses (eligible, verified, etc.).
    *   Real-time updates on voter list.

### Candidate Features:
*   **Profile Registration:** Candidates can register their full profile via Firebase Auth and Firestore (personal details, party, manifesto, DOB, National ID).
*   **Election Participation:** Register for specific upcoming elections created by an admin (adds them to MongoDB election document).
*   **Voting Rights:** Candidates can also cast votes in elections they are eligible for.

### Voter Features:
*   **User Registration & Login:** Voters can create accounts and log in using Firebase Authentication (Email/Password).
*   **View Elections:** Browse ongoing, upcoming, and concluded elections.
*   **View Candidate Details:** See candidate information, party, and AI-summarized platform.
*   **Secure Voting:** Cast a single vote per election (if eligible and verified by admin, and if they haven't voted already for that election).
*   **Vote Confirmation:** See a confirmation of their cast vote.

## Tech Stack 🛠️

*   **Framework:** [Next.js](https://nextjs.org/) 15 (App Router)
*   **Frontend:** [React](https://reactjs.org/) 18, [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** React Hooks (`useState`, `useEffect`, custom hooks like `useAuth`)
*   **Forms:** [React Hook Form](https://react-hook-form.com/)
*   **Schema Validation:** [Zod](https://zod.dev/)
*   **Authentication:**
    *   [Firebase Authentication](https://firebase.google.com/docs/auth): For Voters & Candidates (Email/Password).
    *   Mock Authentication: For Admin role and easy role switching in development (via `localStorage` and `useAuth` hook).
*   **Databases:**
    *   [MongoDB](https://www.mongodb.com/): Stores election data, candidates within elections, and vote counts.
    *   [Firebase Firestore](https://firebase.google.com/docs/firestore): Stores user profiles (voters, candidates) including their statuses (eligibility, verification, approval).
*   **AI Integration:** [Genkit (Google AI)](https://firebase.google.com/docs/genkit) with Gemini models (e.g., Gemini 2.0 Flash) for AI flows.
*   **API Layer:** Next.js API Routes (Server Actions are also used for form submissions where appropriate).

## Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [Git](https://git-scm.com/)
*   Access to MongoDB (local instance or a cloud service like MongoDB Atlas)
*   A Firebase Project

## Environment Variables

Create a `.env` file in the root of your project and add the following environment variables. Replace placeholder values with your actual credentials.

```env
# MongoDB Configuration
MONGODB_URI="your_mongodb_connection_string_here"
MONGODB_DB_NAME="your_mongodb_database_name_here"

# Firebase Configuration (client-side keys are in src/lib/firebase.ts)
# For Genkit with Google AI, you'll need a Google AI API Key.
# Ensure this is set in your environment where the Genkit server runs.
# GOOGLE_API_KEY="your_google_ai_api_key_for_genkit" (if not using Application Default Credentials)

# Base URL of your deployed application (used for metadata, etc.)
# For local development:
NEXT_PUBLIC_APP_URL="http://localhost:9002"
# For production, set this to your actual domain:
# NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

**Note on Firebase Client Configuration:** The client-side Firebase configuration is located in `src/lib/firebase.ts`. For enhanced security in production, consider moving these to `NEXT_PUBLIC_` environment variables and referencing them in `src/lib/firebase.ts`.

## Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/pandashreyan/Ballotbox-app.git
    cd Ballotbox-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

## Database Setup

*   **MongoDB:**
    *   Ensure you have a MongoDB instance running.
    *   Update `MONGODB_URI` and `MONGODB_DB_NAME` in your `.env` file.
    *   Collections (`elections`) will be created automatically as the app runs.
*   **Firebase Firestore:**
    *   Set up a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable **Firestore** in your Firebase project (Native mode).
    *   Enable **Email/Password** sign-in method in Firebase Authentication.
    *   Copy your Firebase project's web configuration details into `src/lib/firebase.ts`.
    *   **Important:** Configure Firestore Security Rules for production to restrict access appropriately (e.g., only admins can modify certain fields, users can only update their own profiles). The current `firestore.rules` might be basic and need review.
    *   The necessary Firestore indexes are defined in `firestore.indexes.json`. You may need to deploy these via the Firebase CLI or allow Firestore to auto-create them (which can take time).

## Running the Application

The application requires two separate terminal processes to run concurrently in development:

1.  **Run the Next.js Development Server:**
    This serves the frontend and Next.js API routes.
    ```bash
    npm run dev
    ```
    The Next.js app will typically start on `http://localhost:9002`.

2.  **Run the Genkit Development Server (in a separate terminal):**
    This server handles the execution of AI flows (like platform summarization and the chatbot).
    ```bash
    npm run genkit:dev
    ```
    Or, for auto-reloading Genkit flows on changes:
    ```bash
    npm run genkit:watch
    ```
    The Genkit server usually starts on `http://localhost:3400` (check your console output).

Visit `http://localhost:9002` (or your configured port) in your browser to use the application.

## Authentication & Roles

*   **Voters and Candidates:** Register and log in using Firebase Authentication (Email/Password). Their respective Firestore documents (`voters/{uid}` or `candidates/{uid}`) store role-specific information and statuses.
*   **Admin:** Admin functionality is primarily accessed via a mock role selection in the header dropdown. This is for development and testing convenience. Selecting "Admin" via the dropdown signs out any active Firebase user and sets a mock admin context.
*   **Role Switching:** The header dropdown allows switching between mock roles (Admin, Candidate, Voter, Guest/Logout) to test different parts of theapplication. If a Firebase user is logged in, switching to "Admin" or a mock "Candidate" will sign out the Firebase user. Switching to a mock "Voter" will also sign out the Firebase user.

## Available Scripts

*   `npm run dev`: Starts the Next.js development server (with Turbopack).
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching for auto-reloads.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server (after `npm run build`).
*   `npm run lint`: Runs ESLint to check for code quality issues.
*   `npm run typecheck`: Runs TypeScript type checking.

## Deployment

For deploying this Next.js application, platforms like [Vercel](https://vercel.com/) (by the creators of Next.js) or [Netlify](https://www.netlify.com/) are highly recommended due to their excellent Next.js support.

1.  **Push your code to a Git provider** (e.g., GitHub, GitLab).
2.  **Connect your Git repository** to your chosen hosting platform.
3.  **Configure Environment Variables** on the hosting platform (ensure all variables from your `.env` file, including `GOOGLE_API_KEY` for Genkit and `NEXT_PUBLIC_APP_URL`, are set).
4.  **Build Command:** Typically `npm run build` or `next build`.
5.  **Publish Directory:** Usually `.next`.
6.  **Deploying Genkit Flows:** Genkit flows are part of the Next.js server-side code and will be deployed with your Next.js application. Ensure any necessary API keys (e.g., `GOOGLE_API_KEY`) are set as environment variables on your hosting platform where the serverless functions/server will run.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

<!--
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
(You'll need to create a LICENSE.txt file if you want to formalize this. For now, the badge indicates MIT.)
-->
If you don't have a `LICENSE.txt` file, you can create one with the standard MIT License text.

---

Happy Voting and Building! 💻
```