const fs = require('fs');
const path = require('path');

// Load environment variables if needed
require('dotenv').config();

// Define the file path
const targetPath = path.resolve(__dirname, './src/environments/environment.prod.ts');

// Read the content of the file
const envFile = fs.readFileSync(targetPath, 'utf8');

// Replace the placeholders with actual environment variables
const result = envFile
  .replace('FIREBASE_API_KEY', process.env.FIREBASE_API_KEY || 'undefined')
  .replace('FIREBASE_AUTH_DOMAIN', process.env.FIREBASE_AUTH_DOMAIN || 'undefined')
  .replace('FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID || 'undefined')
  .replace('FIREBASE_STORAGE_BUCKET', process.env.FIREBASE_STORAGE_BUCKET || 'undefined')
  .replace('FIREBASE_MESSAGING_SENDER_ID', process.env.FIREBASE_MESSAGING_SENDER_ID || 'undefined')
  .replace('FIREBASE_APP_ID', process.env.FIREBASE_APP_ID || 'undefined');

// Write the result back to the file
fs.writeFileSync(targetPath, result, 'utf8');

console.log(`Environment variables replaced in ${targetPath}`); 