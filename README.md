# Playground

> An open source AI playground powered by Groq's compound AI with built-in reasoning display, secure authentication, and self-service registration.

[![Deployment](https://img.shields.io/badge/deployment-vercel-black)](https://playground.amikkelson.io)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## Features

- **Streaming AI Responses** - Real-time streaming chat with Groq's compound AI models
- **Reasoning Display** - Transparent AI thinking process extracted from `<think>` tags
- **Self-Service Registration** - Users can create accounts at `/register` with username, email, and password
- **Secure Authentication** - Bcrypt password hashing with rate limiting (5 attempts, 30-min block)
- **Role-Based Access** - Admin and user roles with protected routes
- **Admin Dashboard** - User management, system stats, and model configuration
- **Model Settings** - Configurable temperature, max tokens, and top-p sampling
- **Clean White/Black UI** - High-contrast design with white backgrounds and 2px black borders
- **Responsive Design** - Mobile-first UI with 44px touch targets and safe area insets
- **Production-Ready** - Auto-deploys to Vercel with PostgreSQL database

## Tech Stack

- **Framework**: [Next.js 15.5.5](https://nextjs.org/) (App Router, Turbopack)
- **Frontend**: [React 19](https://react.dev/), TypeScript, [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **AI**: [Groq SDK](https://groq.com/) with streaming responses
- **Database**: PostgreSQL ([Neon](https://neon.tech/)) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) with bcrypt
- **Deployment**: [Vercel](https://vercel.com/) with auto-deploy from `master`

## Live Demo

**Production**: [https://playground.amikkelson.io](https://playground.amikkelson.io)

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (or use Neon/Vercel Postgres)
- **Groq API Key** ([Get one here](https://console.groq.com/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/playground.git
   cd playground
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   GROQ_API_KEY="gsk_..."
   NEXTAUTH_URL="http://localhost:13380"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   node scripts/seed-production.mjs  # Create admin user
   ```

5. **Run the development server**
   ```bash
   # Windows
   app.bat

   # Unix/Mac
   npm run dev -- -p 13380
   ```

6. **Open the application**

   Navigate to [http://localhost:13380](http://localhost:13380)

   - **Login**: Use admin credentials (created in step 4)
   - **Register**: Create a new user account at [http://localhost:13380/register](http://localhost:13380/register)

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using Vercel, which auto-deploys from the `master` branch:

1. **Install Vercel CLI** (one-time)
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy to production**
   ```bash
   # Windows
   vercel-update.ps1

   # Or manually
   vercel --prod --yes
   ```

3. **Set environment variables** in [Vercel Dashboard](https://vercel.com/dashboard)
   - `DATABASE_URL` - PostgreSQL connection string
   - `GROQ_API_KEY` - Your Groq API key
   - `NEXTAUTH_URL` - Production URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)

4. **Run database migrations** (one-time)
   ```bash
   # From your local machine with DATABASE_URL set to production
   npx prisma migrate deploy
   node scripts/seed-production.mjs
   ```

### Docker (Alternative)

For local development or self-hosting:

```bash
# Windows
docker-update.bat

# Unix/Mac
docker-compose up --build
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/db` |
| `GROQ_API_KEY` | Groq API key for AI models | Yes | `gsk_...` |
| `NEXTAUTH_URL` | Application base URL | Yes | `http://localhost:13380` |
| `NEXTAUTH_SECRET` | JWT signing secret | Yes | `openssl rand -base64 32` |

## Database Schema

### Main Tables

- **User** - User accounts with authentication and roles
  - `id`, `email`, `username`, `passwordHash`, `role` (admin/user)
  - `isActive`, `lastLoginAt`, `createdAt`, `updatedAt`

- **GroqModel** - Available AI models
  - `id`, `displayName`, `pricing`, `isVision`, `isActive`
  - `contextWindow`, `createdAt`, `updatedAt`

### Authentication Flow

1. User registers at `/register` or logs in at `/login` with username/password
2. Registration validates username/email uniqueness and password strength (8+ characters)
3. Passwords hashed with bcrypt (12 rounds) and stored as `passwordHash`
4. Login rate limiting: 5 failed attempts → 30-min block
5. JWT session created (httpOnly cookie, 7-day expiry)
6. Middleware redirects unauthenticated users to `/login`

## Architecture

```
app/
├── api/
│   ├── chat/route.ts              # Streaming AI chat (SSE)
│   ├── models/route.ts            # Fetch available models
│   ├── models/refresh/route.ts    # Sync models from Groq API
│   ├── auth/
│   │   ├── [...nextauth]/route.ts # NextAuth handler
│   │   └── register/route.ts      # User registration API
│   └── admin/                     # Admin-only endpoints
│       ├── users/route.ts         # User management
│       ├── models/route.ts        # Model management
│       └── stats/route.ts         # System statistics
├── page.tsx                       # Main chat interface
├── login/page.tsx                 # Login page
└── register/page.tsx              # Registration page

components/
├── agentic/
│   ├── reasoning-display.tsx      # AI thinking/reasoning UI
│   └── reasoning-card.tsx         # Individual reasoning step
├── admin/
│   ├── admin-dashboard.tsx        # Admin panel
│   ├── user-management-tab.tsx    # User CRUD
│   ├── model-management-tab.tsx   # Model CRUD
│   └── system-stats-tab.tsx       # System metrics
└── auth/
    ├── login-form.tsx             # Login form with validation
    ├── register-form.tsx          # Registration form with validation
    └── password-input.tsx         # Reusable password input with toggle

lib/
├── auth.ts                        # NextAuth configuration
├── auth/
│   ├── password.ts                # Bcrypt utilities
│   └── login-rate-limit.ts        # Rate limiting
├── admin-middleware.ts            # Server-side admin checks
├── admin-utils.ts                 # Client-safe admin helpers
├── groq.ts                        # Groq SDK + pricing
└── reasoning-parser.ts            # Extract <think> tags
```

## API Endpoints

### Public Endpoints

- `POST /api/chat` - Stream AI responses (SSE)
- `GET /api/models` - Fetch available models
- `POST /api/auth/[...nextauth]` - NextAuth authentication
- `POST /api/auth/register` - User registration (username, email, password)

### Admin Endpoints (Protected)

- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/[id]` - Update user (role, active status)
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/models` - List all models
- `PATCH /api/admin/models/[id]` - Update model settings
- `POST /api/models/refresh` - Sync models from Groq API
- `GET /api/admin/stats` - System statistics

## UI Design System

The application uses a clean, high-contrast white and black design system:

### Color Palette

- **Background**: White (`#FFFFFF`) or Light Gray (`#F9FAFB`)
- **Borders**: Black (`#000000`), 2px solid
- **Text**: Gray-900 (`#111827`) for headings, Gray-600 (`#4B5563`) for body
- **Buttons**: Black background (`#000000`), white text, hover state Gray-800 (`#1F2937`)
- **Focus States**: Gray-900 ring with shadow
- **Error States**: Red-500 borders, Red-50 backgrounds

### Design Principles

- **High Contrast**: Strong black borders on white backgrounds for clarity
- **Consistent Spacing**: 2px borders, 3px padding on inputs, rounded corners (8-12px)
- **Touch-Friendly**: 44px minimum touch targets (WCAG AAA)
- **Mobile-First**: 16px base font size prevents iOS zoom on input focus
- **Accessibility**: Clear error messages, proper labels, keyboard navigation

## Development

### Scripts

```bash
npm run dev          # Start dev server (port 13380)
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint
npx prisma studio    # Database GUI
```

### Database Migrations

```bash
# After schema changes
npx prisma generate                    # Regenerate Prisma client
npx prisma migrate dev --name <name>   # Create migration
npx prisma migrate deploy              # Apply migrations (production)
```

**Important**: Stop dev server before running `npx prisma generate` to avoid file locking errors.

### Creating an Admin User

```bash
node scripts/seed-production.mjs
```

Enter username, email, and password when prompted. The script will create an admin user with bcrypt-hashed password.

## Known Issues

### Windows exFAT Filesystem

**Problem**: Local builds fail with `EISDIR: illegal operation on a directory, readlink` on Windows exFAT drives.

**Cause**: exFAT doesn't support symbolic links required by Next.js/Webpack.

**Solutions**:
1. **Deploy via Vercel** (builds on Linux, no issue)
2. **Use WSL2** for local development
3. **Move project to C: drive** (if formatted as NTFS)
4. **Reformat D: to NTFS** (requires backup - data loss)

**Workaround**: Skip local builds and use Vercel's build system.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- Powered by [Groq](https://groq.com/) for ultra-fast AI inference
- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Neon](https://neon.tech/)
- Deployed on [Vercel](https://vercel.com/)

---
