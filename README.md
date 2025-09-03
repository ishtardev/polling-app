
# 📊 PollMaster

A modern, full-stack polling application built with Next.js, Supabase, and deployed on Vercel. Create beautiful polls, share them with QR codes, and get real-time results instantly.

## ✨ Features

### 🔐 Authentication
- **User Registration/Login** - Secure authentication powered by Supabase Auth
- **Role-based Access** - Poll creators (registered users) and voters (registered/anonymous)

### 📋 Poll Management
- **Create Polls** - Add questions with multiple answer options
- **Edit/Delete Polls** - Full CRUD operations for poll creators
- **Dashboard** - Manage all your polls in one place

### 🔗 Sharing & Voting
- **Unique Shareable Links** - Every poll gets a unique URL for easy sharing
- **QR Code Generation** - Instant QR codes for quick mobile access
- **Duplicate Vote Prevention** - Smart system prevents multiple votes per user/IP
- **Real-time Results** - Live vote counts and percentage displays

### 📊 Analytics
- **Visual Results** - Beautiful progress bars and vote statistics
- **Vote Counts** - Track total votes and individual option performance
- **Responsive Design** - Works perfectly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Database + Authentication)
- **Deployment**: Vercel
- **Libraries**: qrcode.react for QR generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase account
- A Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ishtardev/polling-app.git
   cd polling-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase database**
   Run the SQL schema in your Supabase SQL editor:
   ```sql
   -- Create polls table
   CREATE TABLE polls (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     question TEXT NOT NULL,
     creator_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create options table
   CREATE TABLE options (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
     text TEXT NOT NULL
   );

   -- Create votes table
   CREATE TABLE votes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
     option_id UUID REFERENCES options(id) ON DELETE CASCADE,
     voter_id UUID REFERENCES auth.users(id),
     voter_ip TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🌐 Deployment

This app is optimized for Vercel deployment:

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Set environment variables** in your Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

## 📱 Usage

1. **Register/Login** - Create an account or sign in
2. **Create Poll** - Add your question and answer options
3. **Share** - Copy the link or scan the QR code
4. **Vote** - Anyone can vote using the shared link
5. **View Results** - Real-time results with beautiful visualizations

## 🎨 Screenshots

### Homepage
Modern landing page with feature highlights and call-to-action
![alt text](image.png)
### Dashboard
Clean interface to manage all your polls with statistics
![alt text](image-3.png)
### Creating polls 
![alt text](image-1.png)
### Poll Voting
Intuitive voting interface with instant results
![alt text](image-2.png)

## 🔐 Security Assessment

We conducted a thorough assessment of the authentication system and identified the following areas for improvement:

### Current Implementation
- **Supabase Authentication**: Uses Supabase's built-in authentication methods which provide basic security
- **Email/Password Auth**: Standard login and registration flows
- **Vote Protection**: Basic IP/user-based vote duplication prevention

### Security Recommendations
1. **Authentication Enhancements**:
   - Implement password strength requirements
   - Add rate limiting for login attempts
   - Consider adding multi-factor authentication for admin accounts

2. **Route Protection**:
   - Implement middleware for systematic route protection
   - Add session verification on protected routes
   - Create proper auth redirects for unauthenticated users

3. **Data Security**:
   - Ensure Supabase Row Level Security (RLS) policies are properly configured
   - Implement proper error handling that doesn't expose sensitive information
   - Add token refresh strategy for longer sessions

4. **General Improvements**:
   - Implement CSRF protection for form submissions
   - Add logging for security events (login attempts, password changes)
   - Create a session timeout for inactive users

These improvements would significantly enhance the security posture of the application while maintaining its usability.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- **Live Demo**: [polling-app](https://polling-app-khaki-seven.vercel.app/)
- **Repository**: https://github.com/ishtardev/polling-app
- **Issues**: https://github.com/ishtardev/polling-app/issues

---

Built with ❤️ by [ishtardev](https://github.com/ishtardev) 
