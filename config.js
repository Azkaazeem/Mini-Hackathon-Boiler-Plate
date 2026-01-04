import { createClient } from 'https://esm.sh/@supabase/supabase-js';
console.log(createClient);


const supaUrl = 'https://hjfjzwqsfnxnvzncojrc.supabase.co';
const supaKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZmp6d3FzZm54bnZ6bmNvanJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTU1NTUsImV4cCI6MjA3OTk3MTU1NX0.VSmP58VrnLILi5B4PIw7tuI7f_1hQdTSWKyjnpGISJ0'; // Isay Anon Key banayein


const supabase = createClient(supaUrl, supaKey);
// console.log(createClient);

export default supabase;