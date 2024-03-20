import { createClient } from '@supabase/auth-helpers-sveltekit'

/*
const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseAnonKey = 'your-anon-key'
*/

export const supabaseClient = createClient(
  'https://onyejpwyognfysshvufb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueWVqcHd5b2duZnlzc2h2dWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwODI1OTksImV4cCI6MjAyNDY1ODU5OX0.DKSQU7EErPYXiW7Dyn5FXZ-8bFSlVyMPqYlPWzxdtvc'
);