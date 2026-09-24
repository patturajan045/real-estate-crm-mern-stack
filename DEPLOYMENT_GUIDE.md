# EstateFlow CRM - Production Live Deployment Guide

This guide provides end-to-end instructions for deploying the **EstateFlow Real Estate CRM** to production:
- **Database**: MongoDB Atlas (Cloud Database)
- **Backend API**: Render (Node.js/Express Web Service)
- **Frontend App**: Vercel (Vite + React Single-Page Application)

---

## Architecture Overview

```
                      +----------------------------------------+
                      |             User Browser               |
                      +-------------------+--------------------+
                                          |
                HTTPS Static Assets / SPA | HTTPS API Requests
                                          v
      +---------------------------------+   +------------------------------------+
      |        Vercel (Frontend)        |   |       Render (Backend API)         |
      |   https://<your-app>.vercel.app |-->| https://<backend-app>.onrender.com |
      |  - Vite React SPA               |   |  - Express / Node.js Engine        |
      |  - vercel.json SPA rewrites     |   |  - JWT Auth & CORS handling        |
      +---------------------------------+   +------------------+-----------------+
                                                               |
                                              Mongoose TLS /   | mongodb+srv://
                                              Atlas Driver     v
                                            +------------------------------------+
                                            |       MongoDB Atlas (Database)     |
                                            |  - Database: real_estate_crm       |
                                            |  - Auto-seeded Super Admin & CMS   |
                                            +------------------------------------+
```

---

## Step 1: Set Up MongoDB Atlas

1. **Create an Account or Log In**:
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.

2. **Create a Database Cluster**:
   - Click **Create Deployment** (or **Build a Database**).
   - Choose the **M0 Free Tier** (shared cluster).
   - Select your preferred cloud provider (AWS/GCP/Azure) and a region closest to your Render server (e.g. US East / Oregon / Frankfurt).
   - Click **Create**.

3. **Configure Database Access (User Credentials)**:
   - Under **Security** in the left sidebar, click **Database Access**.
   - Click **Add New Database User**.
   - Select **Password Authentication**.
   - Choose a username (e.g., `crm_admin`) and a strong password (e.g., `SecureAtlasPass2026`).
     > **Tip**: If your password contains special characters like `@`, `#`, or `%`, make sure to URL-encode them (e.g., `@` becomes `%40`), or use an alphanumeric password.
   - Set **Database User Privileges** to **Read and write to any database**.
   - Click **Add User**.

4. **Configure Network Access (IP Whitelist)**:
   - In the left sidebar under **Security**, click **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
     > **Why?** Cloud hosting providers like Render use dynamic outgoing IP addresses for web services. Allowing `0.0.0.0/0` allows Render to reach your cluster.
   - Click **Confirm**.

5. **Get Your Connection String**:
   - In the left sidebar, click **Database** (or **Clusters**).
   - Click **Connect** next to your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like this:
     ```text
     mongodb+srv://crm_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Insert your actual password and add `/real_estate_crm` right before the `?` query parameters:
     ```text
     mongodb+srv://crm_admin:SecureAtlasPass2026@cluster0.xxxxx.mongodb.net/real_estate_crm?retryWrites=true&w=majority
     ```
   - Save this connection string for Step 2.

---

## Step 2: Deploy Backend to Render

### Option A: 1-Click Blueprint (Recommended)
This repository includes a pre-configured `render.yaml` blueprint.

1. Push your code to your GitHub/GitLab repository.
2. Log in to [render.com](https://render.com).
3. On your Render Dashboard, click **New +** and select **Blueprint**.
4. Connect your Git repository.
5. Render detects `render.yaml` automatically and prompts for environment variables:
   - `MONGO_URI`: Paste your MongoDB Atlas connection string from Step 1.
   - `CLIENT_URL`: Enter your Vercel URL (e.g., `https://your-crm-name.vercel.app`), or enter `*` initially and update it after deploying frontend.
   - `JWT_SECRET_KEY`: Automatically generated with a secure random key.
6. Click **Apply**.

---

### Option B: Manual Web Service Setup on Render

1. Log in to [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your Git repository.
4. Fill in the service configuration:
   - **Name**: `estateflow-crm-backend` (or your preferred name)
   - **Region**: Choose the region closest to your MongoDB Atlas cluster (e.g., Oregon)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Expand **Advanced** -> **Health Check Path**:
   - Set to `/api/health`
6. Add the following **Environment Variables**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Port for Render router |
   | `MONGO_URI` | `mongodb+srv://.../real_estate_crm?retryWrites=true&w=majority` | Your Atlas string from Step 1 |
   | `JWT_SECRET_KEY` | `your_super_secret_jwt_random_key_here` | 32+ character random string |
   | `CLIENT_URL` | `https://your-crm.vercel.app` | Your Vercel frontend URL |

7. Click **Create Web Service**.
8. Wait for the build and deployment to finish. Once live, Render will give you your backend URL, for example:
   ```text
   https://estateflow-crm-backend.onrender.com
   ```
9. Verify the backend by opening:
   - `https://estateflow-crm-backend.onrender.com/api/health` (should return `{"status":"success",...}`)
   - `https://estateflow-crm-backend.onrender.com/` (should return JSON API service info)

---

## Step 3: Deploy Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your Git repository.
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`
   - **Build and Output Settings**:
     - Build Command: `npm run build` (or default `vite build`)
     - Output Directory: `dist`
     - Install Command: `npm install`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://estateflow-crm-backend.onrender.com` |

   *(Replace with your actual Render backend URL from Step 2)*
6. Click **Deploy**.
7. In about 30 seconds, Vercel will complete the build and assign your production domain:
   ```text
   https://<your-project-name>.vercel.app
   ```

---

## Step 4: Final Connection & Verification

1. **Update Render CORS**:
   - If you set `CLIENT_URL` to `*` or a temporary value during Step 2, go back to Render Dashboard -> your Backend service -> **Environment**.
   - Update `CLIENT_URL` with your actual live Vercel URL:
     ```text
     https://<your-project-name>.vercel.app
     ```
   - Click **Save Changes** (Render will automatically re-deploy).
   *(Note: The backend code also automatically allows any `*.vercel.app` origin out-of-the-box!)*

2. **Access the Application**:
   - Open your live Vercel URL in your browser.
   - The application automatically initializes the database upon first backend launch with default accounts and CMS labels.

3. **Sign In With Default Accounts**:
   - **Super Administrator**:
     - Email: `superadmin@crm.com`
     - Password: `admin123`
     - Role: Full platform privileges, team management, dynamic CMS settings.
   - **System Administrator**:
     - Email: `admin@crm.com`
     - Password: `admin123`
     - Role: Lead management, property units, bookings, user administration.
   - **Sales Employee**:
     - Email: `john.sales@crm.com`
     - Password: `sales123`
     - Role: Lead pipeline, unit view, bookings creation.

---

## Troubleshooting & FAQ

### 1. Render Free Tier Spin-Down (Cold Start)
- Render's free tier spins down web services after 15 minutes of inactivity.
- When you first visit the app after a period of inactivity, the first API request may take 30–50 seconds while the container boots up.
- Subsequent requests will be instant.
- To prevent spin-downs, you can upgrade to Render's Starter plan (\$7/mo) or use a free uptime monitor (like UptimeRobot) pinging `/api/health` every 10 minutes.

### 2. MongoDB Atlas "MongooseServerSelectionError"
- Check that your IP Whitelist on Atlas contains `0.0.0.0/0`.
- Verify the username and password in `MONGO_URI`. If your password has `@` or `#`, encode them (e.g. `P@ssword` -> `P%40ssword`).
- Ensure the cluster status is Active in the Atlas dashboard.

### 3. Page Refresh Shows 404 on Vercel
- This issue is pre-emptively solved by `frontend/vercel.json`, which redirects all SPA client routes (`/leads`, `/dashboard`, `/properties`, etc.) to `/index.html`.

### 4. CORS Errors in Browser Console
- Check that the backend `CLIENT_URL` matches your Vercel URL exactly (without a trailing slash).
- Note that the backend code built into this project automatically accepts requests from all `*.vercel.app` subdomains.
