import { createClient } from '@supabase/supabase-js';

// અહીં તમારા બ્રાઉઝરમાંથી કોપી કરેલો અસલી URL અને Published Key બેઠા અવતરણ ચિહ્નો (" ") ની અંદર પેસ્ટ કરી દો.
const supabaseUrl = "https://supabase.com/dashboard/project/fyigbbqubpjzmnkcaqcc/settings/api-keys";
const supabaseAnonKey = "sb_publishable_P4kFOCBKQqrbOKTgwRgQPw_5tXKtx3p";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
