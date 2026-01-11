# WorkspacePro

WorkspacePro is a powerful, modern business operations platform designed for contractors and small business owners to manage projects, inventory, and finances in one place.

## Features

### 🚀 Dashboard & Onboarding
- **Interactive Overview**: Real-time statistics on projects, inventory, and finances.
- **Smart Onboarding**: A stateless guide to help new users set up their workspace.
- **Micro-interactions**: Smooth transitions and skeleton loading states for a premium feel.

### 📋 Project Management
- **Centralized Tracking**: Manage multiple projects with ease.
- **Activity Feed**: Real-time updates on project changes and member actions.
- **Resource Allocation**: Link inventory directly to projects.

### 📦 Inventory Management
- **Visual Tracking**: Cloudinary integration for item images.
- **Stock Alerts**: Automatic low-stock notifications.
- **SKU Management**: Organize items by SKU and categories.

### 💰 Finance & Invoicing
- **Professional Invoices**: professional A4 previews and PDF exports.
- **Email Integration**: Send invoices directly via **Resend**.
- **Revenue Analytics**: Monthly revenue charts and payment tracking with **Recharts**.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS + Shadcn/ui
- **Uploads**: Cloudinary
- **Emails**: Resend
- **Charts**: Recharts

## Architecture
- **Server Actions**: All business logic handled via secure Next.js Server Actions.
- **Zod Validation**: End-to-end type safety and validation.
- **Multi-tenancy**: Workspace-based data isolation.
