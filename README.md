# 🍲 Hostel Mess Management Portal

A modern, full-stack Next.js web application for hostel mess meal preference management, attendance tracking, and strict automated cutoff enforcement, optimized for instant deployment on **Vercel**.

Deployed repository: [https://github.com/udita06/hostel-mess.git](https://github.com/udita06/hostel-mess.git)

---

## 🚀 Key Features

### 1. 🍱 Food Selection & 30-Day Advance Booking
* **Advance Booking:** Students can mark and plan their meal preferences (Lunch & Dinner) for the next 30 days starting from the current date.
* **Meal Choices:** Toggle between **Veg (V)** and **Non-Veg (NV)**, or clear preference.
* **Instant Save:** Click the **Save (✓ tick sign)** button to save preferences to the database with delightful confirmation animations.
* **Quick Batch Tools:** One-click shortcuts to mark open dates as all Veg, all Non-Veg, or clear selections.

### 2. ⏰ Strict Automated Cutoff & Freeze Enforcement
* **☀️ Lunch Cutoff:** **10:00 PM on the day before**. If the current time passes 10:00 PM, the lunch option is frozen and locked.
* **🌙 Dinner Cutoff:** **10:00 AM on the same day**. If the current time passes 10:00 AM, the dinner option is frozen and locked.
* **🔒 Freeze Protection:** Once locked, students cannot modify or cancel their selection.
* **👑 Admin Override:** Hostel Warden / Admin has complete authority to modify or cancel any student's meal at any time.
* **📩 Student Override Request:** Locked students can send a direct change request explaining their circumstances for warden review.
* **🧪 Interactive Time Simulator:** Built right into the header, allowing reviewers to simulate "8:00 PM yesterday (Open)", "10:30 PM yesterday (Lunch Frozen)", or "11:30 AM today (Both Frozen)" to verify cutoff behavior on the spot!

### 3. 📊 Central Dashboard & 30-Day Hostel Forecast
* **Top Summary Tiles:**
  * Today's Non-Veg (NV) count (with Lunch & Dinner breakdown)
  * Today's Veg (V) count (with Lunch & Dinner breakdown)
  * Total bookings & active students in hostel
  * Ratio & Preference distribution
* **Date Filter:** Calendar date picker (defaults to today; data filters in real-time).
* **30-Day Hostel Total Count Grid:** Displays daily projected Veg and Non-Veg totals across the next 30 days for mess procurement and cooking estimates.
* **Year-Wise Segregation Tabs:**
  * `All Years | 1st Year | 2nd Year | 3rd Year | 4th Year`
  * Displays Student Name, Year (1st–4th), Course (B.Tech, M.Tech, MCA), Room Number, Lunch Preference, and Dinner Preference.
  * Search by student name, room number, or email.
  * Filter by Course (B.Tech, M.Tech, MCA) and Meal Choice.
  * Admin direct edit button on each student's row.
  * Student read-only view of peers with their own record highlighted.

### 4. 👤 User Profiles & Role-Based Access Control
* **Student Access (Limited):**
  * View their personal profile, course, year, and room number.
  * Track personal 30-day meal booking statistics (Veg vs Non-Veg ratio, attendance rate).
  * View pending override requests with live approval/rejection status.
* **Admin Access (Complete Read & Write):**
  * Add new students and residents.
  * Update student details (Name, Email, Year, Course, Room Number).
  * Delete user accounts.
  * Review and approve/reject late meal override requests.
  * Modify food preferences for any student on any day with zero cutoff lock restrictions.
  * Export complete mess database to JSON.
  * Reset database to initial seed.

### 5. 📋 Google Form (GForm) Data Sync
* **GForm Workflow:** Per requirements, students can update their registration or dietary details via Google Form.
* **In-App Integration:** Includes direct Google Form configuration, embedded form launcher, 1-click response sync simulator, and custom Google Sheet CSV / JSON importer.

### 6. 🔐 Login Page
* Email-based login for all residents.
* Quick 1-click demo profiles for instant evaluation on Vercel:
  * **Hostel Warden (Admin):** `admin@hostel.edu`
  * **Rahul Sharma (Student - 2nd Yr B.Tech):** `rahul.s@hostel.edu`
  * **Diya Sen (Student - 1st Yr MCA):** `diya.s@hostel.edu`

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Confetti:** Canvas Confetti
* **Deployment Target:** Vercel

---

## 💻 Local Development

1. Clone repository:
   ```bash
   git clone https://github.com/udita06/hostel-mess.git
   cd hostel-mess
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete hostel mess management portal"
   git push origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new) and import `udita06/hostel-mess`.
3. Vercel automatically detects Next.js. Click **Deploy**.
4. Your application will be live in ~60 seconds!
