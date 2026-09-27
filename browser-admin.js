import {createClient} from '@supabase/supabase-js';
globalThis.supabase={createClient};
await import('./public/js/editor-live.js');
await import('./public/js/settings.js');
