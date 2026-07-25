import { supabase } from './supabase.js';

async function inspectSchema() {
  console.log('Inspecting Supabase schema...');

  // Try querying common tables or PostgREST openapi spec
  const tablesToTry = [
    'production', 'production_lines', 'production_status', 'lines',
    'inventory', 'parts', 'stock', 'stock_levels',
    'procurement', 'purchase_orders', 'orders', 'vendor_quotes', 'vendors',
    'cost_analysis', 'budget', 'budgets', 'budget_forecast',
  ];

  for (const table of tablesToTry) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`\nTable [${table}] EXISTS! Sample columns:`);
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
      } else {
        console.log('(Table empty, but exists)');
      }
    }
  }

  // Also query PostgREST root OpenAPI schema if accessible
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
      });
      const spec = await res.json();
      if (spec && spec.definitions) {
        console.log('\n--- ALL TABLES AND COLUMNS FOUND IN SUPABASE DB ---');
        for (const [tableName, def] of Object.entries<any>(spec.definitions)) {
          console.log(`\nTable: "${tableName}"`);
          if (def.properties) {
            console.log('Columns:', Object.keys(def.properties));
          }
        }
      }
    } catch (e: any) {
      console.error('Error fetching OpenAPI spec:', e.message);
    }
  }
}

inspectSchema().catch(console.error);
