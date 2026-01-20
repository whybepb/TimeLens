# TimeLens ⏱️

> A premium productivity and wellness app that combines focus tracking, health metrics, and intelligent coaching to help you achieve your daily goals.

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=flat&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey)

## ✨ Features

### 🎯 Focus Timer (Pomodoro)
- Customizable Pomodoro timer with focus, short break, and long break sessions
- Set intentions before each focus session
- Track session history and daily focus statistics
- Beautiful glassmorphic timer interface with progress visualization

### 📊 Productivity Dashboard
- **Productivity-Vitality Score (PVC)** - A unique metric combining productivity and health data
- Daily goals tracking for steps, sleep, and focus time
- Real-time progress visualization with animated rings
- AI-powered coaching advice via LLM integration

### 📈 Statistics & Analytics
- Weekly trends for steps, sleep, focus time, and PVC score
- Calendar heatmap for activity visualization
- 30-day averages dashboard
- Streak tracking with badges and milestones

### 🌬️ Breathe Mode
- Guided breathing exercises for relaxation
- Multiple breathing patterns
- Calming animations and haptic feedback

### 🏥 Health Integration
- Apple HealthKit integration (iOS)
- Track steps, sleep, and other health metrics
- Sync health data with productivity goals

### 🔔 Smart Notifications
- Customizable reminder notifications
- Goal completion alerts
- Break reminders during focus sessions

### 🎨 Premium UI/UX
- Glassmorphic design language
- Dark mode with multiple theme options
- Smooth animations powered by Reanimated
- Responsive layouts for all device sizes

### ☁️ Cloud Sync
- User authentication via Appwrite
- Cross-device data synchronization
- Secure backup of goals, streaks, and progress

## 🛠️ Tech Stack

### Frontend (Mobile App)
| Technology | Purpose |
|------------|---------|
| React Native 0.81 | Cross-platform mobile development |
| Expo SDK 54 | Development platform & native APIs |
| Expo Router | File-based navigation |
| TypeScript | Type-safe development |
| NativeWind/Tailwind | Utility-first styling |
| React Native Reanimated | Smooth animations |
| Lucide Icons | Beautiful icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| Appwrite | Database & authentication |
| JWT | Secure token authentication |
| Argon2 | Password hashing |

## 📦 Project Structure

```
timelens/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Entry point
│   ├── dashboard.tsx      # Main dashboard
│   ├── focus.tsx          # Pomodoro timer
│   ├── stats.tsx          # Statistics & goals
│   ├── breathe.tsx        # Breathing exercises
│   ├── settings.tsx       # App settings
│   ├── auth.tsx           # Authentication
│   └── onboarding.tsx     # First-time setup
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic services
│   └── constants/         # App constants & config
├── backend/               # Node.js Express backend
│   └── src/
│       ├── server.js      # Express server
│       └── middleware/    # Auth middleware
├── assets/                # Images, fonts, etc.
└── targets/               # iOS widget targets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/timelens.git
   cd timelens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the app**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Configure backend environment**
   ```bash
   cp .env.example .env
   # Add your Appwrite credentials
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

**Frontend (.env)**
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APPWRITE_ENDPOINT=your-appwrite-endpoint
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
```

**Backend (backend/.env)**
```env
APPWRITE_ENDPOINT=your-appwrite-endpoint
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
JWT_SECRET=your-jwt-secret
```

## 📱 iOS Setup

For iOS development with HealthKit:

1. Open the iOS project in Xcode
   ```bash
   cd ios && open timelens.xcworkspace
   ```

2. Configure your Apple Developer Team in Xcode

3. Enable HealthKit capabilities in Xcode

4. Build and run on a physical device (HealthKit requires real device)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using React Native & Expo
</p>
