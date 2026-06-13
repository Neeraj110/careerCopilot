<div align="center">
  <br />
  <h1>🚀 CareerCopilot</h1>
  <p>
    <strong>An AI-powered SQL workspace and database assistant built for the modern data era.</strong>
  </p>
  <p>
    CareerCopilot leverages advanced LLMs to understand your data, generate complex queries, and provide insightful analytics—all through a beautifully crafted interface.
  </p>
</div>

<br />

## ✨ Features

- **🤖 AI-Powered SQL Generation:** Convert natural language into optimized SQL queries instantly.
- **📊 Smart Analytics:** Intelligent data visualization, table parsing, and automated insights generation.
- **🔗 LangChain Agentic AI:** Orchestrates Google GenAI, Mistral, and Tavily for deep reasoning, search, and data processing.
- **🔐 Secure Authentication:** Seamless Google OAuth 2.0 integration and robust JWT-based session management.
- **⚡ Real-time Performance:** Built on bleeding-edge Next.js 16 and React 19, backed by TanStack Query for optimal caching and state synchronization.
- **💅 Premium UI/UX:** Stunning, responsive interface styled with Tailwind CSS v4, Framer Motion, and shadcn/ui.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL adapter)
- **AI/LLM:** [LangChain](https://js.langchain.com/) (`@langchain/google-genai`, `@langchain/langgraph`, `@langchain/tavily`)
- **Auth:** [Passport.js](https://www.passportjs.org/) (Google OAuth 2.0) & JWT
- **Validation:** [Zod](https://zod.dev/)
- **API Docs:** [Swagger](https://swagger.io/)

---

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [PostgreSQL](https://www.postgresql.org/)
- API Keys: Google Gemini / Mistral, Google OAuth, and Tavily (optional for advanced search)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/careerCopilot.git
   cd careerCopilot
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   
   # Setup Prisma and Database
   npm run db:generate
   npm run db:push
   
   # Start the development server
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   
   # Start the frontend server
   npm run dev
   ```

---

## 🔑 Environment Variables

Create `.env` files in both the `frontend` and `backend` directories. 

**Backend (`backend/.env`):**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_desk_sql"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# AI & LLM Providers
GEMINI_API_KEY="your-gemini-api-key"
TAVILY_API_KEY="your-tavily-api-key"
```

**Frontend (`frontend/.env`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

---

## 📂 Architecture & Structure

```
smart-desk-sql/
├── backend/                # Express & Prisma Backend Server
│   ├── prisma/             # Schema definitions and seed scripts
│   ├── src/                # API routes, controllers, and AI workflows
│   └── package.json        
└── frontend/               # Next.js 16 Frontend App
    ├── src/                # React components, pages, hooks, and Zustand store
    ├── public/             # Static assets
    └── package.json
```

---

## 💡 The "10x" Philosophy

This project is structured with scalability, developer experience (DX), and modern engineering principles in mind:
- **Type Safety End-to-End:** Using Zod for validation and TypeScript everywhere.
- **Agentic AI Workflow:** Utilizing LangGraph for complex, multi-step LLM reasoning instead of linear prompts.
- **Bleeding-Edge Tooling:** Leveraging React 19, Tailwind v4, and Express 5 for maximum performance.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is [ISC](https://opensource.org/licenses/ISC) licensed.
