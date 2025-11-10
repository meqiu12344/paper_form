// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// // Upewnij się, że masz te zmienne w pliku .env
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// console.log("Supabase URL:", supabaseUrl);
// console.log("Supabase Service Role Key:", supabaseServiceRoleKey);

// if (!supabaseUrl || !supabaseServiceRoleKey) {
//   throw new Error("Missing Supabase credentials in environment variables.");
// }

// Użycie klucza Service Role Key jest bezpieczniejsze w funkcjach serwerowych
export const supabase = createClient(
  "https://wyfwdyponrnmgdzxykap.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZndkeXBvbnJubWdkenh5a2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTg2MzEsImV4cCI6MjA3ODI5NDYzMX0.cLbZCljxEIoqYN2Cc4q4gr5c9z8YPc1bvdzoMHC94nA", {
});