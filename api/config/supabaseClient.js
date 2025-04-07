const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://jkviudctlniitzbivtnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprdml1ZGN0bG5paXR6Yml2dG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjU4NDMsImV4cCI6MjA1OTQwMTg0M30.vPe8Ti_VE1fCsrAwiaUBda3hwpTWZXogu029H-xc3wo';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Testar conexão
supabase.from('usuarios').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error.message);
    } else {
      console.log('Conectado ao Supabase com sucesso');
    }
  });

module.exports = { supabase }; 