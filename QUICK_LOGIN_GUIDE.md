# 🚀 Quick Login Guide

## Your Computer IP: `ip`

## Step 1: Create Test Users (Admin-Only Registration)

The `/api/auth/register` endpoint now requires an authenticated admin token. Use the seeded admin
(`admin@vessel.com / admin123`) or any existing admin account to create additional users.

**Option A: Run the script (Easiest)**
```bash
cd Backend
npm start
# In another terminal:
cd ../FrontEnd/MarineWorld
ADMIN_LOGIN_EMAIL=admin@vessel.com ADMIN_LOGIN_PASSWORD=admin123 node scripts/create-test-users.js
```

**Option B: Use Postman/API Client**
```bash
# 1) Login as admin to get a token
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
  "email": "admin@vessel.com",
  "password": "admin123"
}

# 2) Use the token to register another user
POST http://localhost:3000/api/auth/register
Authorization: Bearer YOUR_ADMIN_JWT
Content-Type: application/json
{
  "email": "crew@vessel.com",
  "password": "crew123",
  "role": "crew"
}
```

## Step 2: Update API URL (If Using Physical Device)

**If testing on a physical phone**, update the API URL:

Edit `src/api/axiosClient.ts` line 4:
```typescript
// Change from:
const API_BASE_URL = 'http://localhost:3000/api';

// To:
const API_BASE_URL = 'http://192.168.1.165:3000/api';
```

**If testing on emulator/simulator**, keep `localhost`.

## Step 3: Login Credentials

### Admin Account:
- **Email**: `admin@vessel.com`
- **Password**: `admin123`
- **Access**: Vessel Management (CRUD operations)

### Crew Account:
- **Email**: `crew@vessel.com`
- **Password**: `crew123`
- **Access**: My Vessels, Report Issues, View Issues

## Step 4: Test Login

1. ✅ Backend running on `http://localhost:3000`
2. ✅ Frontend running in Expo
3. ✅ Users created (run script above)
4. ✅ API URL updated (if using physical device)
5. 📱 Open app → Enter credentials → Sign In

## Troubleshooting

### "Network request failed"
- **Emulator/Simulator**: Use `localhost:3000`
- **Physical Device**: Use `192.168.1.165:3000`
- Check backend is running
- Test in browser: `http://localhost:3000/health`

### "Invalid email or password"
- Run the create-users script
- Check backend logs
- Verify users exist in database

### Can't connect
- Ensure phone and computer on same WiFi
- Check Windows Firewall allows port 3000
- Verify backend is accessible

