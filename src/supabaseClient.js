import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://tpomgmsricrgccayabjy.supabase.co'
const SUPABASE_ANON = 'sb_publishable_BAtLBnTwkvEjK2wzgMKUHA_4HLGwunY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
