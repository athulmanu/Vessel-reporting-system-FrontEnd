module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|expo-status-bar|@expo|@react-navigation|@react-native-async-storage)/)',
  ],
};


