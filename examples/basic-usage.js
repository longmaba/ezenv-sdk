/**
 * Basic usage examples for ezenv-sdk
 * 
 * This example demonstrates how to use the EzEnv SDK to fetch
 * environment variables from your EzEnv instance.
 */

const { EzEnv, createClient } = require('ezenv-sdk');

// Example 1: Using the EzEnv class directly
async function example1() {
  console.log('=== Example 1: Using EzEnv class ===\n');
  
  // Initialize the client with your API key
  const client = new EzEnv({
    apiKey: 'ezenv_your_api_key_here', // Replace with your actual API key
    baseUrl: 'http://localhost:3000'   // Replace with your EzEnv instance URL
  });

  try {
    // Fetch secrets for a specific project and environment
    const secrets = await client.get('my-project', 'development');
    
    console.log('Fetched secrets:');
    Object.entries(secrets).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  } catch (error) {
    console.error('Error fetching secrets:', error.message);
  }
}

// Example 2: Using the factory function
async function example2() {
  console.log('\n=== Example 2: Using createClient factory ===\n');
  
  // Create client using the factory function
  const client = createClient(
    'ezenv_your_api_key_here',  // API key
    'http://localhost:3000'     // Base URL (optional)
  );

  try {
    // Fetch secrets with options
    const secrets = await client.get('my-project', 'production', {
      noCache: true,     // Bypass cache for fresh data
      timeout: 10000     // 10 second timeout
    });
    
    console.log('Production secrets fetched (bypassing cache)');
    console.log('Number of secrets:', Object.keys(secrets).length);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 3: Loading secrets directly into process.env
async function example3() {
  console.log('\n=== Example 3: Loading into process.env ===\n');
  
  const client = new EzEnv({
    apiKey: process.env.EZENV_API_KEY || 'ezenv_your_api_key_here',
    baseUrl: process.env.EZENV_BASE_URL || 'http://localhost:3000'
  });

  try {
    // Load secrets directly into process.env
    await client.load('my-project', 'development', {
      override: false  // Don't override existing env vars
    });
    
    console.log('Secrets loaded into process.env');
    console.log('Example - DATABASE_URL:', process.env.DATABASE_URL);
  } catch (error) {
    console.error('Error loading secrets:', error.message);
  }
}

// Example 4: Error handling
async function example4() {
  console.log('\n=== Example 4: Error handling ===\n');
  
  const client = new EzEnv({
    apiKey: 'ezenv_invalid_key',
    baseUrl: 'http://localhost:3000'
  });

  try {
    await client.get('non-existent-project', 'development');
  } catch (error) {
    // Different error types are thrown for different scenarios
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    
    // You can check for specific error types
    if (error.name === 'AuthError') {
      console.log('Authentication failed - check your API key');
    } else if (error.name === 'NotFoundError') {
      console.log('Project or environment not found');
    } else if (error.name === 'NetworkError') {
      console.log('Network issue - check your connection');
    }
  }
}

// Example 5: Cache management
async function example5() {
  console.log('\n=== Example 5: Cache management ===\n');
  
  const client = new EzEnv({
    apiKey: 'ezenv_your_api_key_here',
    baseUrl: 'http://localhost:3000'
  });

  try {
    // First call - fetches from API
    console.log('First call (from API)...');
    await client.get('my-project', 'development');
    
    // Second call - returns from cache
    console.log('Second call (from cache)...');
    await client.get('my-project', 'development');
    
    console.log('Cache size:', client.getCacheSize());
    
    // Clear cache
    client.clearCache();
    console.log('Cache cleared. Size:', client.getCacheSize());
    
    // Next call will fetch from API again
    console.log('Third call (from API after cache clear)...');
    await client.get('my-project', 'development');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run examples (uncomment the ones you want to test)
async function runExamples() {
  // await example1();
  // await example2();
  // await example3();
  // await example4();
  // await example5();
  
  console.log('\nTo run these examples:');
  console.log('1. Replace "ezenv_your_api_key_here" with your actual API key');
  console.log('2. Update the baseUrl to point to your EzEnv instance');
  console.log('3. Uncomment the examples you want to run');
  console.log('4. Run: node basic-usage.js');
}

runExamples();