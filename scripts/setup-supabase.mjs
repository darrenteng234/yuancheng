import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://jizagahrnywfohhwcpoh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemFnYWhybnl3Zm9oaHdjcG9oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg4MzA1OCwiZXhwIjoyMDk2NDU5MDU4fQ.oQOj_Num_K1VG4wxqmsLShFDeQgu_tWK3lF2sLIdVwI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL(filename, label) {
  console.log(`\n--- Running ${label} ---`);
  const sql = readFileSync(filename, 'utf8');

  // Split on semicolons but be careful with function bodies
  // Use rpc to execute raw SQL
  const { error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    // Fallback: try executing via the REST API directly
    console.log('RPC not available, trying direct execution...');

    // Split into individual statements
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let success = 0;
    let failed = 0;

    for (const stmt of statements) {
      if (stmt.startsWith('CREATE EXTENSION') || stmt.startsWith('DO $$')) {
        // These need special handling, skip for now
        console.log('  Skipping (needs manual execution):', stmt.substring(0, 60) + '...');
        continue;
      }
      try {
        const { error: stmtError } = await supabase.from('_sql').select('*').limit(0);
        // Can't execute arbitrary SQL from client, need to use the dashboard
      } catch (e) {
        // Expected to fail
      }
    }

    console.log('\nNOTE: Cannot execute DDL from client SDK.');
    console.log('Please run the SQL files manually in Supabase SQL Editor:');
    console.log(`  1. ${filename}`);
    return false;
  }

  console.log(`${label} completed successfully`);
  return true;
}

async function main() {
  console.log('Believer Supabase Setup');
  console.log('========================');
  console.log(`Project: ${supabaseUrl}`);

  // Test connection
  const { error } = await supabase.from('temples').select('count').limit(1);
  if (error && error.code !== '42P01') {
    console.log('Connection error:', error.message);
    return;
  }

  console.log('Connection OK');

  // Since we can't execute DDL from the client SDK, provide instructions
  console.log('\n========================================');
  console.log('MANUAL STEP REQUIRED');
  console.log('========================================');
  console.log('\nGo to: https://supabase.com/dashboard/project/jizagahrnywfohhwcpoh/sql/new');
  console.log('\n1. Copy and run: supabase-schema.sql');
  console.log('2. Copy and run: supabase-seed.sql');
  console.log('\nThese files are at:');
  console.log('  ~/teman-style-prototype/believer/supabase-schema.sql');
  console.log('  ~/teman-style-prototype/believer/supabase-seed.sql');
}

main().catch(console.error);
