
# BallotBox - Full-Stack Election Management Platform

BallotBox is a modern, full-stack election management application built with Next.js, React, ShadCN UI, Tailwind CSS, MongoDB, Firebase, and Genkit for AI-powered features. It allows administrators to create and manage elections, candidates to register and participate, and voters to cast their votes securely.

<!-- Add a Live Demo link if you deploy it -->
<!-- **Live Demo:** [Link to your deployed app] -->

## Features

### General Features:
*   **Role-Based Access Control:** Distinct experiences for Admins, Candidates, and Voters.
*   **Responsive Design:** User interface adapts to various screen sizes.
*   **Light/Dark Mode:** Theme support based on user preference.
*   **AI-Powered Platform Summaries:** Genkit and Gemini are used to provide concise summaries of candidate platforms.
*   **Real-time Updates:**
    *   Election results page polls for updates.
    *   Admin pages for voter and candidate management update in real-time using Firestore listeners.

### Admin Features:
*   **Election Management:**
    *   Create new elections with details (name, description, dates).
    *   Add initial candidates to elections.
    *   Delete existing elections.
*   **Candidate Approval:**
    *   View list of registered candidates awaiting approval.
    *   Approve or revoke candidate profile registrations.
*   **Voter Management:**
    *   View list of all registered voters.
    *   Toggle voter eligibility status.
    *   Toggle voter verification status.
    *   Filter voter list by status.

### Candidate Features:
*   **Profile Registration:** Candidates can register their full profile (personal details, party, manifesto).
*   **Election Participation:** Register for specific upcoming elections created by an admin.
*   **Voting Rights:** Candidates can also cast votes in elections they are eligible for.

### Voter Features:
*   **User Registration:** Voters can create accounts using email and password.
*   **View Elections:** Browse ongoing, upcoming, and concluded elections.
*   **View Candidate Details:** See candidate information, party, and platform.
*   **Cast Vote:** Securely cast a single vote per election (if eligible and verified).
*   **Vote Confirmation:** See a confirmation of their cast vote.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) 15 (App Router)
*   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** React Hooks (`useState`, `useEffect`, custom hooks)
*   **Forms:** [React Hook Form](https://react-hook-form.com/)
*   **Schema Validation:** [Zod](https://zod.dev/)
*   **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth) (for Voters/Candidates), Mock Auth (for Admin and role switching)
*   **Databases:**
    *   [MongoDB](https://www.mongodb.com/): Stores election data, candidate lists within elections, and vote counts.
    *   [Firebase Firestore](https://firebase.google.com/docs/firestore): Stores user profiles (voters, candidates) and their statuses.
*   **AI Integration:** [Genkit (Google AI)](https://firebase.google.com/docs/genkit) with Gemini models for features like platform summarization.
*   **API Layer:** Next.js API Routes

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```

### 2. Environment Variables

Create a `.env` file in the root of your project and add the following environment variables.
Replace the placeholder values with your actual credentials.

```env
# MongoDB Configuration
MONGODB_URI="your_mongodb_connection_string"
MONGODB_DB_NAME="your_mongodb_database_name"

# Firebase Configuration (primarily for Genkit server-side use if needed, client-side is in src/lib/firebase.ts)
# Ensure your src/lib/firebase.ts has the correct client-side Firebase config.
# For Genkit with Google AI, you might need GOOGLE_API_KEY if not using Application Default Credentials.
# GOOGLE_API_KEY="your_google_ai_api_key_for_genkit"

# NEXT_PUBLIC_ variables are exposed to the browser.
# If you move your Firebase client config to .env, prefix with NEXT_PUBLIC_
# e.g., NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
```

**Note on Firebase Configuration:** The client-side Firebase configuration is currently hardcoded in `src/lib/firebase.ts`. For production, it's best practice to move these to environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) and reference them in `src/lib/firebase.ts`.

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Database Setup

*   **MongoDB:**
    *   Ensure you have a MongoDB instance running (local or cloud-based like MongoDB Atlas).
    *   Update the `MONGODB_URI` and `MONGODB_DB_NAME` in your `.env` file.
    *   No specific schema setup is required beforehand; collections and documents will be created as the app runs.
*   **Firebase Firestore:**
    *   Set up a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable Firestore in your Firebase project.
    *   Enable Email/Password sign-in method in Firebase Authentication.
    *   Copy your Firebase project's configuration details into `src/lib/firebase.ts`.
    *   Firestore security rules should be configured for production to restrict access appropriately.

### 5. Running the Application

The application consists of the Next.js frontend/backend and the Genkit development server for AI features.

*   **Run the Next.js Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will typically start the Next.js app on `http://localhost:9002`.

*   **Run the Genkit Development Server (in a separate terminal):**
    The Genkit server handles AI flow executions.
    ```bash
    npm run genkit:dev
    # or for auto-reloading on changes:
    npm run genkit:watch
    ```
    This usually starts the Genkit server on `http://localhost:3400` (check console output).

Visit `http://localhost:9002` (or your configured port) in your browser.

## Authentication & Roles

*   **Voters and Candidates:** Register and log in using Firebase Authentication.
*   **Admin:** Admin functionality is accessed via a mock role selection in the header dropdown. This is for development and testing convenience.
*   **Role Switching:** The header dropdown allows switching between mock roles (Admin, Candidate, Voter, Guest) to test different parts of the application without multiple accounts. If a Firebase user is logged in, switching to "Admin" or "Candidate" (mock) will sign out the Firebase user. Switching to "Voter" (mock) will also sign out the Firebase user and simulate a mock voter.

## Available Scripts

*   `npm run dev`: Starts the Next.js development server (with Turbopack).
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server.
*   `npm run lint`: Runs ESLint.
*   `npm run typecheck`: Runs TypeScript type checking.

## Deployment

For deploying this Next.js application, platforms like [Vercel](https://vercel.com/) (by the creators of Next.js) or [Netlify](https://www.netlify.com/) are recommended.

1.  **Push your code to a Git provider** (e.g., GitHub, GitLab).
2.  **Connect your Git repository** to your chosen hosting platform.
3.  **Configure Environment Variables** on the hosting platform (MongoDB URI, DB Name, Firebase API keys, Genkit keys, etc.).
4.  **Build Command:** Typically `next build` or `npm run build`.
5.  **Publish Directory:** Usually `.next`.
6.  **Deploying Genkit Flows:** Genkit flows are part of the Next.js server-side code and will be deployed with your Next.js application. Ensure any necessary API keys (e.g., for Google AI) are set as environment variables on your hosting platform.

<!--
## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) (you'll need to create this file) before submitting a pull request.
-->

<!--
## License

This project is licensed under the [MIT License](LICENSE) (you'll need to create this file and choose a license).
-->

---

Happy Voting!
