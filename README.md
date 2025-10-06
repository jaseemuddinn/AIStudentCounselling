# 🎓 AI-Driven Counsellor System for Students

An intelligent platform providing personalized academic and career guidance using Artificial Intelligence. The system offers scalable, always-available support through a conversational interface, helping students make informed decisions about their education and career paths.

## ✨ Features

- 🔐 **Secure Authentication** - NextAuth.js with credential-based login
- 👤 **Student Profiles** - Comprehensive profile system with academic and career information
- 💬 **AI-Powered Chat** - Multi-mode counselling (Academic, Career, Emotional, General)
- 🎯 **Smart Recommendations** - Personalized course, career, and skill suggestions
- 📊 **Goal Tracking** - Set and monitor academic and career goals
- 😊 **Mood Logging** - Track emotional wellbeing over time
- ☁️ **File Storage** - AWS S3 integration for profile pictures and documents
- 🤖 **Flexible AI** - Switch between Google Gemini and OpenAI

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v5
- **AI/ML**: Google Gemini API & OpenAI API
- **Storage**: AWS S3
- **Validation**: Zod
- **State Management**: Zustand
- **UI Components**: Custom + Lucide Icons
- **Charts**: Recharts
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key or OpenAI API Key
- AWS Account (for S3 storage)

## 🚀 Getting Started

### 1. Clone the repository

```bash
clone this repo
cd studentcounselling
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/student_counselling

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# AI Configuration (choose 'gemini' or 'openai')
AI_PROVIDER=gemini
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=student-counselling-uploads
```

### 4. Run MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── chat/             # Chat endpoints
│   │   └── profile/          # Profile endpoints
│   ├── (auth)/               # Auth pages (login, register)
│   ├── (dashboard)/          # Protected dashboard pages
│   └── page.js               # Landing page
├── components/                # React components
│   ├── ui/                   # UI components
│   ├── auth/                 # Auth components
│   ├── chat/                 # Chat components
│   └── dashboard/            # Dashboard components
├── lib/                       # Utilities and services
│   ├── ai/                   # AI service layer
│   ├── auth/                 # Auth configuration
│   ├── db/                   # Database connection
│   ├── storage/              # AWS S3 service
│   ├── utils/                # Helper functions
│   └── validations/          # Zod schemas
├── models/                    # Mongoose models
├── hooks/                     # Custom React hooks
├── constants/                 # Application constants
└── types/                     # TypeScript types
```

## 🗄️ Database Models

- **User** - User accounts and authentication
- **StudentProfile** - Student personal information
- **AcademicInfo** - Academic records and preferences
- **CareerProfile** - Career interests and goals
- **Conversation** - Chat conversations
- **Message** - Individual chat messages
- **Recommendation** - AI-generated recommendations
- **Goal** - Student goals and milestones
- **MoodLog** - Emotional wellbeing tracking

## 🤖 AI Provider Configuration

The system supports both Google Gemini and OpenAI. Switch between them by changing the `AI_PROVIDER` environment variable:

```env
AI_PROVIDER=gemini  # or 'openai'
```

### Chat Modes

1. **Academic Mode** - Course selection, study strategies, exam prep
2. **Career Mode** - Career exploration, job market insights, skills
3. **Emotional Mode** - Stress management, motivation, mental wellness
4. **General Mode** - Comprehensive support

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based session management
- Protected API routes
- Input validation with Zod
- Crisis keyword detection
- Secure file uploads

## 📈 Development Roadmap

### ✅ Phase 1: Foundation (Completed)

- [x] Project setup and dependencies
- [x] Database models and schemas
- [x] Authentication system
- [x] AI service layer (Gemini + OpenAI)
- [x] AWS S3 integration
- [x] Utility functions and validations

### 🚧 Phase 2: Core Features (In Progress)

- [ ] Login and registration pages
- [ ] Multi-step onboarding flow
- [ ] Profile management
- [ ] Chat interface
- [ ] Conversation management

### 📝 Phase 3: Advanced Features (Planned)

- [ ] Recommendation engine UI
- [ ] Goal tracking dashboard
- [ ] Mood logging interface
- [ ] Analytics and insights
- [ ] Admin panel

### 🎨 Phase 4: Polish (Planned)

- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing
- [ ] Documentation
- [ ] Deployment

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:

- AWS Amplify
- Railway
- Render
- DigitalOcean

## 📝 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Chat (To be implemented)

- `POST /api/chat` - Send message and get AI response
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/[id]` - Get conversation messages

### Profile (To be implemented)

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/upload` - Upload profile picture

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.


## 🙏 Acknowledgments

- Google Gemini API
- OpenAI API
- Next.js Team
- MongoDB Team

---

**Note**: This is an educational AI counselling system. While it provides helpful guidance, it is not a replacement for professional counselling or mental health services.
