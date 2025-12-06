import { createClient } from '@supabase/supabase-js'

// Configuration from User Prompt
const supabaseUrl = 'https://ksvahwdyqajukocbfulq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdmFod2R5cWFqdWtvY2JmdWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTc2NjUsImV4cCI6MjA4MDE3MzY2NX0.vFLe3tDm-r9plIcX8VthpP1kGEFAI53fICcCwEGEJs0'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey)