import { createClient } from '@supabase/supabase-js';

// သင့်ရဲ့ Supabase Project မှ URL နှင့် API Key ကို ဤနေရာတွင် အစားထိုးပါ
const supabaseUrl = 'https://jmrxlgkivehiofgsskxp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcnhsZ2tpdmVoaW9mZ3Nza3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4ODM3MjcsImV4cCI6MjA5MTQ1OTcyN30.jQ9UdH-_0NODDMKvbkTPdGqEoUu6q3yVhNFru1kGQvc';

export const supabase = createClient(supabaseUrl, supabaseKey);