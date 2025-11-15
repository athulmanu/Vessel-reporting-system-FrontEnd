# How to Login to Vessel Issue Reporting System

## Step 1: Create Test Users (Admin Token Required)

The `/api/auth/register` route is restricted to authenticated admins. Use the seeded admin
(`admin@vessel.com / admin123`) to obtain a token, or insert users directly via MongoDB.

### Option A: Register Users via API

1. **Login as Admin**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@vessel.com",
  "password": "admin123"
}
```

2. **Register Target User**
```bash
POST http://localhost:3000/api/auth/register
Authorization: Bearer YOUR_ADMIN_JWT
Content-Type: application/json

{
  "email": "crew@vessel.com",
  "password": "crew123",
  "role": "crew"
}
```

### Option B: Use MongoDB Compass or CLI

Insert documents directly if you prefer working in the database.

## Step 2: Update API URL (If Using Physical Device)

**If you're testing on a physical Android/iOS device**, you need to change the API URL from `localhost` to your computer's IP address.

### Find Your Computer's IP:
- **Windows**: Run `ipconfig` in CMD/PowerShell
- **Mac/Linux**: Run `ifconfig` or `ip addr`

### Update API URL:
Edit `src/api/axiosClient.ts` and change:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

To:
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
// Example: 'http://192.168.1.165:3000/api'
```

## Step 3: Login Credentials

### Admin Login:
- **Email**: `admin@vessel.com`
- **Password**: `admin123`
- **After login**: Redirects to Admin/VesselList screen

### Crew Login:
- **Email**: `crew@vessel.com`
- **Password**: `crew123`
- **After login**: Redirects to Crew/MyVessels screen

## Step 4: Test the Login

1. Make sure backend is running on `http://localhost:3000`
2. Open the app in Expo
3. Enter email and password
4. Tap "Sign In"
5. You should be redirected based on your role

## Troubleshooting

### "Network request failed"
- Check if backend is running
- Verify API URL is correct
- If on physical device, use computer's IP instead of localhost
- Check firewall settings

### "Invalid email or password"
- Make sure user exists in database
- Verify password is correct
- Check backend logs for errors

### "Cannot connect to backend"
- Test backend in browser: `http://localhost:3000/health`
- Should return: `{"status":"OK",...}`
- If using physical device, test: `http://YOUR_IP:3000/health`

