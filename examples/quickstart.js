#!/usr/bin/env node

/**
 * Quickstart example for @ezenv/sdk
 * 
 * This is the simplest way to get started with EzEnv.
 * Run this file directly: node quickstart.js
 */

const { createClient } = require('@ezenv/sdk');

// Configuration - update these values
const config = {
  apiKey: process.env.EZENV_API_KEY || 'ezenv_your_api_key_here',
  baseUrl: process.env.EZENV_BASE_URL || 'http://localhost:3000',
  projectName: process.env.PROJECT_NAME || 'my-project',
  environment: process.env.ENVIRONMENT || 'development'
};

async function main() {
  console.log('🚀 EzEnv SDK Quickstart\n');
  
  // Check if API key is configured
  if (config.apiKey === 'ezenv_your_api_key_here') {
    console.log('⚠️  Please configure your API key first!');
    console.log('\nOption 1: Set environment variable');
    console.log('  export EZENV_API_KEY="your_actual_api_key"');
    console.log('\nOption 2: Update the config object in this file');
    console.log('\nGet your API key from: Settings → API Keys in your EzEnv dashboard\n');
    process.exit(1);
  }

  // Create the client
  console.log('📡 Connecting to:', config.baseUrl);
  const client = createClient(config.apiKey, config.baseUrl);

  try {
    // Fetch secrets
    console.log(`📦 Fetching secrets for: ${config.projectName} (${config.environment})\n`);
    const secrets = await client.get(config.projectName, config.environment);
    
    // Display results
    const secretKeys = Object.keys(secrets);
    if (secretKeys.length === 0) {
      console.log('No secrets found for this project/environment.');
      console.log('\nMake sure to:');
      console.log('1. Create the project in your EzEnv dashboard');
      console.log('2. Add the environment (development, staging, production)');
      console.log('3. Add some secrets to the environment');
    } else {
      console.log(`✅ Successfully fetched ${secretKeys.length} secrets:\n`);
      secretKeys.forEach(key => {
        // Show key names but hide values for security
        const value = secrets[key];
        const maskedValue = value.substring(0, 3) + '*'.repeat(Math.min(value.length - 3, 10));
        console.log(`   ${key} = ${maskedValue}`);
      });
      
      console.log('\n💡 Tip: Use client.load() to automatically load these into process.env');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Provide helpful error messages
    if (error.name === 'AuthError') {
      console.log('\n🔑 Authentication failed. Please check your API key.');
    } else if (error.name === 'NotFoundError') {
      console.log('\n🔍 Project or environment not found.');
      console.log('Make sure the project name and environment match exactly.');
    } else if (error.name === 'NetworkError') {
      console.log('\n🌐 Could not connect to EzEnv API.');
      console.log('Check that the base URL is correct and the server is running.');
    }
  }
}

// Run the example
main().catch(console.error);