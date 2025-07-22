// Simple test file to verify Supabase initialization
console.log('Testing Supabase initialization...');

try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment variables:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseAnonKey ? 'Present' : 'Missing'
  });
  
  if (supabaseUrl && supabaseAnonKey) {
    console.log('Supabase environment variables are available');
  } else {
    console.error('Missing Supabase environment variables');
  }
} catch (error) {
  console.error('Error testing Supabase:', error);
}

export const testSupabase = () => {
  console.log('Supabase test function called');
  return true;
};