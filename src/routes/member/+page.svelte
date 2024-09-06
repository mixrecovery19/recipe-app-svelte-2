<script lang="ts">
    import { createClient } from '@supabase/supabase-js';
    import { goto } from '$app/navigation';

    const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseClient = createClient(supabaseURL, supabaseAnonKey);

    let email = '';
    let password = '';
    let loginError = '';
    let successMessage = '';
    let userId = '';
    let username = '';    

    // Function for signing up users
    const signUp = async () => {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
        });

        if (error) {
            loginError = error.message;
            successMessage = '';
        } else {
            successMessage = 'Signed up successfully, please verify your email.';
            loginError = '';
            userId = data.user?.id ?? '';            
            
            // Create member record after successful signup
            await createMemberRecord(userId, username);
        }
    };

    // Function for logging in users
    const login = async () => {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            loginError = error.message;
        } else {
            loginError = '';
            successMessage = 'Logged in successfully!';
            userId = data.user?.id ?? '';

            // Check if the member record already exists
            const { data: memberData, error: memberError } = await supabaseClient
                .from('Member')
                .select('m_user_id')
                .eq('m_user_id', userId)
                .single();

            // If no member record found, create it
            if (memberError || !memberData) {
                await createMemberRecord(userId, username);
            }

            // Redirect to the logged-in page
            goto('/member/logged_in');
        }
    };

    // Create member record in the database
    const createMemberRecord = async (userId: string, username: string) => {
        const { error } = await supabaseClient
            .from('Member')
            .insert([
                {
                    m_user_id: userId,  
                    m_member_username: username  
                }
            ]);

        if (error) {
            loginError = error.message;
        } else {
            successMessage = 'Member record created successfully.';
        }
    };

    // Function for logging out
    const logout = async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            console.log('Logged out successfully!');
            goto('/');
        }
    };
</script>

<main>
    <!-- Sign-up form -->
    <h1>Sign Up</h1>

    <div>
        <label for="email">Email:</label>
        <input type="email" id="email" bind:value={email} placeholder="Enter your email" />
    </div>

    <div>
        <label for="password">Password:</label>
        <input type="password" id="password" bind:value={password} placeholder="Enter your password" />
    </div>

    <div>
        <label for="username">Username:</label>
        <input type="text" id="username" bind:value={username} placeholder="Choose a username" />
    </div>

    <button on:click={signUp}>Sign Up</button>

    <button on:click={login}>Login</button>

    <button on:click={logout}>Logout</button>

    {#if loginError}
        <p style="color: red;">{loginError}</p>
    {/if}

    {#if successMessage}
        <p style="color: green;">{successMessage}</p>
    {/if}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }
    input {
        margin: 0.5rem;
        padding: 0.5rem;
        width: 100%;
    }
    button {
        margin: 1rem;
    }
</style>
