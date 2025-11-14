// Quick script to create test users
// Run: node scripts/create-test-users.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function createUsers() {
  console.log('Creating test users...\n');

  // Create Admin
  try {
    const adminResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'admin@vessel.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin created:', adminResponse.data.data.user.email);
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  Admin already exists');
    } else {
      console.error('❌ Error creating admin:', error.response?.data?.message || error.message);
    }
  }

  // Create Crew
  try {
    const crewResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'crew@vessel.com',
      password: 'crew123',
      role: 'crew',
    });
    console.log('✅ Crew created:', crewResponse.data.data.user.email);
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  Crew already exists');
    } else {
      console.error('❌ Error creating crew:', error.response?.data?.message || error.message);
    }
  }

  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@vessel.com / admin123');
  console.log('Crew: crew@vessel.com / crew123');
}

createUsers().catch(console.error);

