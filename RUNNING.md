# Running WorkspacePro Locally

Follow these steps to set up and run WorkspacePro on your machine.

## Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Cloudinary Account (for images)
- Resend Account (for emails)

## Step 1: Clone and Install
```bash
git clone <repository-url>
cd workspace-pro
npm install
```

## Step 2: Environment Variables
Create a `.env` file in the root directory and add the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/workspacepro"

# NextAuth
AUTH_SECRET="your-auth-secret" # Generate with: npx auth secret
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (Inventory Images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"

# Resend (Invoicing)
RESEND_API_KEY="your-resend-key"
```

## Step 3: Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Step 4: Run Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Key Commands
- `npm run build`: Production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks
- `npx prisma studio`: Open Prisma database GUI
