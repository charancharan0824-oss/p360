# DeadlineGuard AI

> *"Never Miss a Deadline."*

DeadlineGuard AI is an intelligent academic productivity and deadline security application engineered specifically for college and university students. It eliminates academic anxiety by combining an intelligent multi-factor priority engine with Google Gemini AI to schedule study sessions, generate realistic study plans, and predict workload bottlenecks.

---

## 🌟 Key Features

### 1. Intelligent 5-Factor Priority System
Priorities are never guessed or hardcoded. The backend calculates priority scores (0–100) using an explainable formula:
$$\text{Priority Score} = (\text{Urgency} \times 0.40) + (\text{Difficulty} \times 0.20) + (\text{Academic Weight} \times 0.20) + (\text{Effort} \times 0.10) + (\text{Workload} \times 0.10)$$

- **Critical (80–100)**: Imminent deadlines (<12-24h), overdue submissions, or high-difficulty/high-credit tasks.
- **High (60–79)**: 2–3 day deadlines with heavy cognitive effort.
- **Medium (40–59)**: Standard assignments with manageable timelines.
- **Low (0–39)**: Early stage or minor credit exercises.
- **Explainable Rationale**: Transparent bottom-sheet breakdown showing individual factor ratings so students understand *why* a deadline is marked Critical.

### 2. Live Countdown & Overdue Safeguard
- Real-time countdown clock on every task (`2 days 5 hours remaining`, `Due in 35 minutes`).
- Automatic overdue detection with high urgency scaling to prevent grade deductions.

### 3. Gemini AI Study Architect & Workload Advisor
- **Context-Aware Study Planner**: Sends pending deadlines, estimated effort, and difficulty to Gemini 3.8 Flash to construct realistic hour-by-hour study schedules without hallucinations.
- **Interactive Chat Assistant**: Answers queries like *"What should I study today?"*, *"Which assignment should I complete first?"*, or *"I have 3 hours today. Create a study plan."*
- **Proactive AI Recommendations**: Automatically flags workload clusters and high-effort projects before deadline crunches occur.

### 4. Focus Mode (Pomodoro Telemetry)
- 25-minute focus session with 5-minute break.
- 50-minute deep work session with 10-minute break.
- Direct linkage to active course assignments with reflection logging and database persistence.
- Audio cues with browser WebAudio synthesizer.

### 5. Academic Subjects & Workload Management
- Course code, title, faculty member, credit weight (1–5), and custom color tokens.
- Full CRUD operations with task linkage.

### 6. Productivity Analytics & Streak Tracking
- Weekly study hours distribution.
- Subject-wise workload balance and completion rate.
- Priority distribution charts and consecutive study streak counter.

### 7. Dual Viewing Mode (Pixel 8 Pro Android Mockup + Responsive Web)
- Experience the native Material 3 Android layout with status bar, bottom navigation, and phone frame, or expand to full-screen fluid mode.

---

## 📱 Architecture & Technology Stack

### Android Mobile Client (`/android/`)
- **Language**: Kotlin 2.1
- **UI Toolkit**: Jetpack Compose with Material 3 (Dynamic Color & Typography)
- **Architecture**: MVVM (Model-View-ViewModel) + Clean Architecture
- **State Management**: StateFlow, SharedFlow, Coroutines
- **Networking**: Retrofit 2, OkHttp 3, Gson
- **Persistence**: Jetpack DataStore Preferences
- **Background Tasks**: Android WorkManager & NotificationManager

### Full-Stack Web Runtime & Simulator (`/server.ts` & `/src/`)
- **Server**: Node.js, Express, TypeScript, Vite Middleware, BCrypt, JWT
- **AI Engine**: `@google/genai` TypeScript SDK (`gemini-3.8-flash`)
- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons

### Spring Boot Production Backend (`/backend/`)
- **Framework**: Spring Boot 3.3.4 (Java 21)
- **Security**: Spring Security, JWT Bearer Authentication, BCrypt
- **ORM & Database**: Spring Data JPA, Hibernate, MySQL 8+
- **Architecture**: Controller $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Database

---

## 🚀 Getting Started

### 1. Environment Variables
Create or verify `.env` in the root directory:
```bash
# Gemini API Key (Injected automatically in AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Port (Must run on 3000 in AI Studio)
PORT=3000

# JWT Secret
JWT_SECRET="deadlineguard-ai-secret-jwt-key-2026"
```

### 2. Running the Full-Stack Web Applet
```bash
# Install dependencies
npm install

# Start development server with Vite middleware on Port 3000
npm run dev

# Or build for production
npm run build
npm start
```

### 3. Demo Credentials
The pre-seeded academic dataset comes configured for instant testing:
- **Email**: `vs2513@srmist.edu.in`
- **Password**: `student123`

---

## 📲 Running on Android Studio

1. Open the `/android` folder in **Android Studio Ladybug** or newer.
2. Ensure Android SDK 35 and JDK 21 are configured.
3. Configure the backend URL in `/android/app/build.gradle.kts`:
   - **For Android Emulator**: `http://10.0.2.2:3000/` (maps to host localhost)
   - **For Physical Android Phone**: `http://<YOUR_LOCAL_WIFI_IP>:3000/`
4. Click **Run** on your connected device or emulator.

---

## ☕ Running the Spring Boot Backend

1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Configure MySQL in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/deadlineguard_db?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   spring.jpa.hibernate.ddl-auto=update
   gemini.api.key=${GEMINI_API_KEY}
   ```
3. Run with Maven:
   ```bash
   ./mvnw spring-boot:run
   ```

---

## 🧪 Intelligent Priority System Verification Matrix

| Test Scenario | Urgency | Difficulty | Weight | Effort | Workload | Computed Score | Level |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **OS Assignment (Due in 18h)** | 88 (40%) | 80 (20%) | 100 (20%) | 70 (10%) | 75 (10%) | **86 / 100** | **Critical** |
| **Overdue Submission** | 100 (40%) | 60 (20%) | 80 (20%) | 45 (10%) | 50 (10%) | **88 / 100** | **Critical** |
| **Java Lab (Due in 42h)** | 72 (40%) | 60 (20%) | 80 (20%) | 65 (10%) | 75 (10%) | **71 / 100** | **High** |
| **Midterm Quiz (5 days out)** | 35 (40%) | 100 (20%) | 100 (20%) | 85 (10%) | 50 (10%) | **68 / 100** | **High** |
| **Presentation (8 days out)**| 15 (40%) | 60 (20%) | 60 (20%) | 100 (10%)| 30 (10%) | **43 / 100** | **Medium** |

---

## 🛡️ License
Apache-2.0
