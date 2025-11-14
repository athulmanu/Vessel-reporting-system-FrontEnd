# MarineWorld Project Structure

```
MarineWorld/
│
├── App.tsx                          # Main app entry point with React Query provider
├── app.json                         # Expo configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── metro.config.js                  # Metro bundler configuration
│
├── src/                             # Main source code directory
│   │
│   ├── api/                         # API services
│   │   ├── axiosClient.ts          # Axios instance with JWT interceptor
│   │   ├── auth.ts                 # Authentication API endpoints
│   │   ├── vessels.ts              # Vessel CRUD operations
│   │   ├── issues.ts                # Issue CRUD operations
│   │   └── jobs.ts                 # Maintenance scan job
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── user.ts                 # User, Auth types
│   │   ├── vessel.ts                # Vessel types
│   │   └── issue.ts                 # Issue types
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── useAuth.ts              # Authentication hook with React Query
│   │
│   ├── navigation/                  # Navigation setup
│   │   └── AppNavigator.tsx        # React Navigation container with auth routing
│   │
│   ├── screens/                     # Screen components
│   │   └── Login/
│   │       └── LoginScreen.tsx     # Login screen (✅ Complete)
│   │
│   └── components/                  # Reusable components (to be created)
│       ├── VesselCard.tsx          # (Pending)
│       └── IssueCard.tsx           # (Pending)
│
├── app/                             # Expo Router files (legacy, not used)
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   └── modal.tsx
│
├── assets/                          # Static assets
│   └── images/                      # Image files
│
├── components/                      # Expo template components (legacy)
│   ├── external-link.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/
│
├── constants/                       # App constants
│   └── theme.ts
│
├── hooks/                           # Expo template hooks (legacy)
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
│
├── scripts/                         # Utility scripts
│   └── reset-project.js
│
└── node_modules/                    # Dependencies

```

## 📁 Key Directories

### `/src` - Main Application Code
- **`api/`** - All API service files
  - `axiosClient.ts` - Configured Axios with JWT token interceptor
  - `auth.ts` - Login, getMe endpoints
  - `vessels.ts` - Vessel CRUD operations
  - `issues.ts` - Issue CRUD + recommendations
  - `jobs.ts` - Maintenance scan endpoint

- **`types/`** - TypeScript definitions
  - `user.ts` - User, AuthResponse, LoginCredentials
  - `vessel.ts` - Vessel, CreateVesselData, UpdateVesselData
  - `issue.ts` - Issue, CreateIssueData, RecommendationsResponse

- **`hooks/`** - Custom React hooks
  - `useAuth.ts` - Authentication state management with React Query

- **`navigation/`** - Navigation configuration
  - `AppNavigator.tsx` - React Navigation setup with role-based routing

- **`screens/`** - Screen components
  - `Login/LoginScreen.tsx` - ✅ Complete
  - `Crew/` - ⏳ To be created (MyVessels, ReportIssue, MyIssues, Recommendations)
  - `Admin/` - ⏳ To be created (VesselList, VesselForm, VesselIssues)

- **`components/`** - ⏳ To be created
  - `VesselCard.tsx`
  - `IssueCard.tsx`

## 🎯 Current Status

### ✅ Completed
- [x] Project setup with Expo
- [x] TypeScript configuration
- [x] API client with Axios + JWT interceptor
- [x] All API services (auth, vessels, issues, jobs)
- [x] TypeScript types for all entities
- [x] useAuth hook with React Query
- [x] React Navigation setup
- [x] Login screen with role-based redirect

### ⏳ Pending (Next Steps)
- [ ] Crew screens (MyVessels, ReportIssue, MyIssues, Recommendations)
- [ ] Admin screens (VesselList, VesselForm, VesselIssues, MaintenanceScan)
- [ ] Reusable components (VesselCard, IssueCard)
- [ ] Loading and Error components

## 📝 Notes

- **Entry Point**: `App.tsx` (configured in package.json)
- **Navigation**: React Navigation (not Expo Router)
- **State Management**: React Query for server state
- **Storage**: AsyncStorage for JWT tokens
- **Backend URL**: `http://localhost:3000/api` (in axiosClient.ts)

## 🚀 Next Steps

Ready to create:
1. Crew screens
2. Admin screens  
3. Shared components

