# SocialConnect

A full-stack social media web application built with Next.js (App Router) and Supabase (Postgres + Auth).
Users can register, log in, create posts with images, like/unlike posts, comment, follow other users, and view notifications.

# 🚀 Features

## 🔐 Authentication

User registration & login with Supabase Auth

Profiles auto-linked to users

## 👤 Profiles

View & edit profile

Following & followers count auto-updated via triggers

Notifications for new follows

## 📝 Posts

Create, read, update, and delete posts

Upload optional images

Like / Unlike posts

Comment on posts

## 🔔 Notifications

Trigger-based notifications for follows (and extendable for likes/comments)


⚙️ Setup
1️⃣ Clone & Install
```bash
git clone https://github.com/Nitin1692/vegatack-assignment.git
cd vegatack-assignment
npm install
```

2️⃣ Environment Variables

Create a .env.local file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role
```

▶️ Running the App
```bash
npm run dev
```


App will be available at http://localhost:3000

## 🔮 API Endpoints
Auth

POST /api/auth/register → register user

POST /api/auth/login → login user

Posts

GET /api/posts → list posts

POST /api/posts → create post

PUT /api/posts/:id → update post

DELETE /api/posts/:id → delete post

Likes

POST /api/posts/:id/like → like post

DELETE /api/posts/:id/like → unlike post

Comments

GET /api/posts/:id/comments → get comments

POST /api/posts/:id/comments → add comment

Profiles

GET /api/profiles/:id → get profile

PUT /api/profiles/:id → update profile

## 🛠️ Tech Stack

Next.js (App Router)

Supabase (Postgres + Auth)

TypeScript

TailwindCSS

shadcn/ui