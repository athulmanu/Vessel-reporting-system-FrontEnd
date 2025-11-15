// Quick script to create test users
// Run: node scripts/create-test-users.js

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const ADMIN_LOGIN_EMAIL = process.env.ADMIN_LOGIN_EMAIL || 'admin@vessel.com';
const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_LOGIN_PASSWORD || 'admin123';

async function createUsers() {
  console.log('Creating test users via admin-protected endpoint...\n');

  let adminToken;
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_LOGIN_EMAIL,
      password: ADMIN_LOGIN_PASSWORD,
    });
    adminToken = loginResponse.data.data.token;
    console.log('🔐 Authenticated as admin:', ADMIN_LOGIN_EMAIL);
  } catch (error) {
    console.error('❌ Unable to login as admin. Ensure the admin account exists and credentials are correct.');
    console.error('Details:', error.response?.data?.message || error.message);
    process.exit(1);
  }

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  };

  const createUser = async ({ email, password, role, label }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        { email, password, role },
        authHeaders
      );
      console.log(`✅ ${label} created:`, response.data.data.user.email);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log(`⚠️  ${label} already exists`);
      } else {
        console.error(`❌ Error creating ${label}:`, error.response?.data?.message || error.message);
      }
    }
  };

  await createUser({ email: 'admin@vessel.com', password: 'admin123', role: 'admin', label: 'Admin' });
  await createUser({ email: 'crew@vessel.com', password: 'crew123', role: 'crew', label: 'Crew' });

  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@vessel.com / admin123');
  console.log('Crew: crew@vessel.com / crew123');
}

createUsers().catch((error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

