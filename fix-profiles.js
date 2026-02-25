const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    'https://lmcnkocxmsgbnzjdxats.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtY25rb2N4bXNnYm56amR4YXRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjAxMjc3MywiZXhwIjoyMDg3NTg4NzczfQ.aasPFPxTBn3QTuCzJqYacvJMNsoVFZULzAWIjO-y8YI',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function fixProfile() {
    const { data: users, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
    if (usersErr) {
        console.error('Error fetching users:', usersErr);
        return;
    }

    for (const u of users.users) {
        const { data: prof, error: profErr } = await supabaseAdmin.from('profiles').select('id').eq('id', u.id).single();
        if (!prof) {
            console.log('Inserting profile for', u.email);
            await supabaseAdmin.from('profiles').insert([{
                id: u.id,
                email: u.email,
                full_name: u.user_metadata?.full_name || 'Test User'
            }]);
        }
    }
    console.log('Done fixing profiles.');
}

fixProfile();
