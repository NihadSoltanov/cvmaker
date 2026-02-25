import { createClient } from '@supabase/supabase-js';

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

async function createTestUser() {
    console.log('Creating test user...');
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: 'testlogin@example.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: 'Test Login User' }
    });

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('User already exists. You can use testlogin@example.com / password123');
        } else {
            console.error('Error creating user:', error);
        }
    } else {
        console.log('User created successfully. ID:', data.user.id);
    }
}

createTestUser();
