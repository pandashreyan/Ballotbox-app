
# BallotBox - Advanced Full-Stack Election Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

BallotBox is a modern, feature-rich, and secure full-stack election management application. Built with a cutting-edge technology stack including Next.js 15 (App Router), React, TypeScript, ShadCN UI, Tailwind CSS, MongoDB for core data, Firebase (Authentication & Firestore) for user/candidate profiles, and Genkit (with Google Gemini) for AI-powered features. It provides distinct, role-based experiences for Administrators, Candidates, and Voters, facilitating a seamless and transparent electoral process.

<!-- Add a Live Demo link if you deploy it -->
<!-- **Live Demo:** [Link to your deployed BallotBox app] -->

## Key Features

### General Platform Features:
*   **Role-Based Access Control:** Tailored dashboards and functionalities for Administrators, Candidates, and Voters.
*   **Responsive Design:** Fluid user interface adapting to desktops, tablets, and mobile devices.
*   **Light/Dark Mode:** Automatic theme switching based on user preference or manual selection.
*   **Optimized Performance:** Leverages Next.js App Router, Server Components, and `next/font` for fast load times and optimized font delivery.
*   **Enhanced User Experience:** Custom error pages (`404 Not Found`, `500 Error Boundary`) for graceful error handling.
*   **SEO & Social Sharing Ready:** Includes Open Graph and Twitter card metadata for better link previews.
*   **Security Conscious:** Implements a basic Content Security Policy (CSP) to mitigate common web vulnerabilities.

### AI-Powered Features (Genkit & Gemini):
*   **Candidate Platform Summarization:** AI automatically generates concise and objective summaries of candidate platforms, accessible via a dialog on candidate cards.
*   **Election Information Chatbot:** An interactive chatbot (accessible via a floating button) to answer user queries about:
    *   General election processes.
    *   Historical election information from around the world and different countries.
    *   Current national leadership of various countries (with a disclaimer about potential staleness).

### Real-time & Dynamic Updates:
*   **Election Results:** The election results page polls for updates every 10 seconds to provide near real-time vote counts.
*   **Admin Dashboards:** Voter and Candidate management pages for administrators utilize Firebase Firestore listeners for real-time updates on statuses and registrations.

### Admin Features:
*   **Election Lifecycle Management:**
    *   Create new elections with detailed information (name, description, start/end dates).
    *   Add initial candidates during election creation.
    *   Delete existing elections.
*   **Candidate Approval Workflow:**
    *   View a list of candidates who have registered and are awaiting approval.
    *   Approve or revoke candidate profile registrations, updating their status in real-time.
*   **Voter Management & Verification:**
    *   View a comprehensive list of all registered voters.
    *   Toggle voter eligibility status.
    *   Toggle voter verification status.
    *   Filter the voter list by various statuses (all, eligible, ineligible, verified, unverified).

### Candidate Features:
*   **Profile Registration & Management:** Candidates can register their full profile including personal details (name, DOB), party affiliation, a detailed manifesto, and contact information using Firebase Authentication.
*   **Election Participation:** Approved candidates can register to participate in specific upcoming elections created by an administrator.
*   **Voting Rights:** Candidates are also eligible to cast votes in elections.

### Voter Features:
*   **Secure User Registration:** Voters can create accounts using email and password via Firebase Authentication. Voter-specific details (like National ID, Aadhaar for mock login) are collected for mock scenarios.
*   **Election Browsing:** View lists of ongoing, upcoming, and concluded elections.
*   **Candidate Details:** Access detailed information for each candidate, including their party, platform (with AI summary), and image.
*   **Secure Voting:** Cast a single, secure vote per election if eligible and verified. Vote casting is restricted to the election's active period.
*   **Vote Confirmation:** Receive immediate on-screen confirmation of their cast vote.

## Tech Stack

*   **Core Framework:** [Next.js](https://nextjs.org/) 15 (App Router, Server Components, `next/font`)
*   **Frontend:** [React](https://reactjs.org/) 18, [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/) (beautiful, accessible, and customizable components)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (utility-first CSS framework)
*   **State Management:** React Hooks (`useState`, `useEffect`, `useContext`, custom hooks like `useAuth`)
*   **Forms:** [React Hook Form](https://react-hook-form.com/) (performant and flexible form validation)
*   **Schema Validation:** [Zod](https://zod.dev/) (TypeScript-first schema declaration and validation)
*   **Authentication:**
    *   [Firebase Authentication](https://firebase.google.com/docs/auth): For Voters and Candidates (Email/Password).
    *   Mock Authentication: For Admin role and easy role-switching during development.
*   **Databases:**
    *   [MongoDB](https://www.mongodb.com/): Primary database for election data, candidate lists within elections, and vote counts.
    *   [Firebase Firestore](https://firebase.google.com/docs/firestore): Stores user profiles (voters, candidates), their registration details, and statuses (eligibility, verification, approval).
*   **AI Integration:**
    *   [Genkit (Google AI)](https://firebase.google.com/docs/genkit): Framework for building AI-powered features.
    *   [Google Gemini Models](https://deepmind.google/technologies/gemini/): Used for platform summarization and chatbot responses.
*   **API Layer:** Next.js API Routes (Route Handlers)
*   **Utilities:** `date-fns` for date formatting, `lucide-react` for icons.

## Visual Appeal & UI/UX

*   **Modern Aesthetics:** Clean, professional design suitable for a production-level application.
*   **Consistent UI:** Powered by ShadCN UI and Tailwind CSS, ensuring a cohesive look and feel.
*   **Theming:** Supports both light and dark modes, adapting to user system preferences.
*   **Accessibility:** ShadCN UI components are built with accessibility in mind (ARIA attributes).
*   **Interactive Elements:** Smooth transitions, loading states, and feedback mechanisms (e.g., toasts).

## Getting Started

Follow these instructions to set up and run the BallotBox project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```
*(Replace `YOUR_USERNAME/YOUR_REPOSITORY_NAME` with the actual repository path)*

### 2. Environment Variables

Create a `.env` file in the root of your project. Copy the contents of `.env.example` (if provided) or use the structure below, replacing placeholder values with your actual credentials.

```env
# MongoDB Configuration
MONGODB_URI="your_mongodb_connection_string_with_username_password_and_cluster"
MONGODB_DB_NAME="your_mongodb_database_name" # e.g., ballotbox_dev

# Firebase Configuration (Client-Side - for src/lib/firebase.ts)
# These are read by Next.js and prefixed with NEXT_PUBLIC_
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="000000000000"
NEXT_PUBLIC_FIREBASE_APP_ID="1:000000000000:web:0000000000000000000000"
# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX" # Optional, if you use Analytics

# Google AI API Key (for Genkit server-side use with Gemini models)
GOOGLE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" # Get this from Google AI Studio

# Application Base URL (used for metadata, ensure it's correct for your deployment)
NEXT_PUBLIC_APP_URL="http://localhost:9002"
```

**Important Notes on Environment Variables:**
*   Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
*   `GOOGLE_API_KEY` is used server-side by Genkit and should **not** be prefixed with `NEXT_PUBLIC_`.
*   Ensure your `src/lib/firebase.ts` is configured to read these `NEXT_PUBLIC_FIREBASE_` variables (it should be by default in this project).

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

*   **MongoDB:**
    *   Ensure you have a MongoDB instance running (local or a cloud service like MongoDB Atlas).
    *   Update `MONGODB_URI` and `MONGODB_DB_NAME` in your `.env` file with your instance details.
    *   Collections (`elections`) will be created automatically as the app runs.
*   **Firebase Firestore:**
    *   Set up a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable **Firestore** in your Firebase project (Native mode is fine).
    *   Enable **Email/Password sign-in method** in Firebase Authentication.
    *   Copy your Firebase project's web app configuration details into the `NEXT_PUBLIC_FIREBASE_` variables in your `.env` file.
    *   Firestore security rules (`firestore.rules`) and indexes (`firestore.indexes.json`) are provided. You can deploy them using the Firebase CLI: `firebase deploy --only firestore`.

### 5. Running the Application

The application requires two main processes to run concurrently in development: the Next.js server and the Genkit server.

*   **Terminal 1: Run the Next.js Development Server:**
    ```bash
    npm run dev
    ```
    This will typically start the Next.js app on `http://localhost:9002`.

*   **Terminal 2: Run the Genkit Development Server (for AI features):**
    The Genkit server handles AI flow executions (platform summarization, chatbot).
    ```bash
    npm run genkit:dev
    ```
    Or, for automatic reloading on changes to AI flow files:
    ```bash
    npm run genkit:watch
    ```
    This usually starts the Genkit server on `http://localhost:3400` (check console output). The Genkit Developer UI will also be available (typically `http://localhost:3400/dev`).

Visit `http://localhost:9002` (or your configured port) in your browser to use the application.

## Authentication & Roles

*   **Voters and Candidates:** Register and log in using Firebase Authentication.
    *   Voter registration creates a record in Firestore (`voters` collection) with `isEligible` and `isVerified` set to `false` by default.
    *   Candidate registration creates a record in Firestore (`candidates` collection) with `isApproved` set to `false` by default.
*   **Admin:** The Admin role is accessed via a **mock role selection** in the header dropdown. This is primarily for development and testing convenience. Selecting "Admin" via the dropdown will sign out any active Firebase user and simulate an admin session.
*   **Role Switching (Mock):** The header dropdown allows switching between mock roles (Admin, Candidate, Voter, Guest) to test different parts of theapplication without needing multiple accounts or manual database changes.
    *   If a Firebase user is logged in, switching to "Admin" or "Candidate" (mock) will sign out the Firebase user.
    *   Switching to "Voter" (mock) will also sign out the Firebase user and simulate a mock voter.
    *   Selecting "Guest" (Log Out) clears any mock role and signs out the Firebase user.

## Available Scripts

*   `npm run dev`: Starts the Next.js development server (uses Turbopack for speed).
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching for auto-reloads.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server (after running `npm run build`).
*   `npm run lint`: Runs ESLint to check for code quality issues.
*   `npm run typecheck`: Runs TypeScript type checking.

## Deployment

For deploying this Next.js application, platforms like [Vercel](https://vercel.com/) (recommended) or [Netlify](https://www.netlify.com/) are excellent choices.

1.  **Push your code to a Git provider** (e.g., GitHub, GitLab).
2.  **Connect your Git repository** to your chosen hosting platform (e.g., Vercel).
3.  **Configure Environment Variables** on the hosting platform:
    *   `MONGODB_URI`
    *   `MONGODB_DB_NAME`
    *   All `NEXT_PUBLIC_FIREBASE_...` variables from your `.env` file.
    *   `GOOGLE_API_KEY` (for Genkit).
    *   `NEXT_PUBLIC_APP_URL` (set to your production domain).
4.  **Build Command:** Typically `npm run build` (Vercel usually detects this automatically for Next.js).
5.  **Publish Directory:** Usually `.next` (Vercel usually detects this automatically).
6.  **Deploying Genkit Flows:** Genkit flows are part of the Next.js server-side code and will be deployed with your Next.js application. Ensure `GOOGLE_API_KEY` is set on your hosting platform.

## Potential Future Enhancements

*   More granular role permissions.
*   Two-factor authentication.
*   Advanced real-time analytics dashboard for admins.
*   Email notifications for candidates and voters.
*   Full internationalization (i18n).
*   Automated E2E testing.

<!--
## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) (you'll need to create this file) before submitting a pull request.
-->

<!--
## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
(You'll need to create a LICENSE file if you want to specify one, e.g., MIT License content)
-->

---

Happy Voting with BallotBox!
