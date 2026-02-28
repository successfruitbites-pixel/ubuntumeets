# UbuntuMeet

Secure. Private. Made for Africa. A privacy-focused video conferencing platform designed for African freelancers, micro businesses, and professionals.

## Features
- Secure Video Calling (powered by Daily.co)
- Authentication & Database (powered by Supabase)
- Whiteboard (powered by tldraw)
- Screen Sharing
- Local Recording (MediaRecorder API)

## Setup Instructions for Non-Technical Users

### 1. Create a Supabase Account & Database
1. Go to [Supabase](https://supabase.com/) and sign up for a free account.
2. Click "New Project", give it a name like "UbuntuMeet", and create a secure database password.
3. Wait for the database to finish setting up.
4. Go to the "SQL Editor" on the left sidebar.
5. Copy the contents of the `supabase.sql` file in this repository and paste it into the SQL Editor. Click "Run" to create your database tables.
6. Go to "Project Settings" (gear icon) -> "API".
7. Copy the **Project URL** and the **anon public key**. You will need these for your `.env` file.
8. Go to "Authentication" -> "Providers" and enable Google if you want Google Sign-In (you'll need to set up Google Cloud credentials for this).

### 2. Create a Daily.co Account & API Key
1. Go to [Daily.co](https://daily.co/) and sign up for a free account.
2. Go to the "Developers" tab in your dashboard.
3. Copy your **API Key**. You will need this for your `.env` file.

### 3. Set up Environment Variables
1. Rename the `.env.example` file to `.env`.
2. Fill in the values you copied from Supabase and Daily.co:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key
   - `DAILY_API_KEY`: Your Daily.co API key

### 4. Upload Code to GitHub
1. Create a free account on [GitHub](https://github.com/).
2. Create a new repository named "ubuntumeet".
3. Follow the instructions to push your local code to the GitHub repository.

### 5. Deploy to Vercel
1. Go to [Vercel](https://vercel.com/) and sign up with your GitHub account.
2. Click "Add New..." -> "Project".
3. Import your "ubuntumeet" repository from GitHub.
4. In the "Environment Variables" section, add the three variables from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `DAILY_API_KEY`
5. Click "Deploy". Vercel will build and host your app for free!
