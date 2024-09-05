<script lang="ts">
    import { createClient } from '@supabase/supabase-js';
    import { writable } from 'svelte/store';

    const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseClient = createClient(supabaseURL, supabaseAnonKey);

    const email = writable('');
    const password = writable('');
    const loginError = writable('');
    const successMessage = writable('');
    const userId = writable('');

    // Member Table fields
    const m_member_first_name = writable('');
    const m_member_last_name = writable('');
    const m_member_username = writable('');
    const m_member_street_number = writable('');
    const m_member_street_name = writable('');
    const m_member_street_type = writable('');
    const m_member_suburb = writable('');
    const m_member_state = writable('');
    const m_member_post_code = writable('');
    const m_member_country = writable('');
    const m_member_contact_number = writable('');
    
    const showMemberForm = writable(false);

    const signUp = async () => {
        const { data, error } = await supabaseClient.auth.signUp({
            email: $email,
            password: $password,
        });

        if (error) {
            loginError.set(error.message);
            successMessage.set('');
        } else {
            successMessage.set('Signed up successfully, please fill out your details.');
            loginError.set('');
            userId.set(data.user?.id ?? '');
            showMemberForm.set(true); 
        }
    };

    const submitMemberDetails = async () => {
        const { data, error } = await supabaseClient
            .from('member')
            .insert([
                {
                    m_user_id: userId,
                    m_member_first_name: m_member_first_name,
                    m_member_last_name: m_member_last_name,
                    m_member_username: m_member_username,
                    m_member_email: email,
                    m_member_street_number: m_member_street_number,
                    m_member_street_name: m_member_street_name,
                    m_member_street_type: m_member_street_type,
                    m_member_suburb: m_member_suburb,
                    m_member_state: m_member_state,
                    m_member_post_code: m_member_post_code,
                    m_member_country: m_member_country,
                    m_member_contact_number: m_member_contact_number
                }
            ]);

        if (error) {
            loginError.set(error.message);
        } else {
            successMessage.set('Member details saved successfully.');
            loginError.set('');
            showMemberForm.set(false); 
        }
    };
</script>

<main>
    <!-- Sign-up form -->
    <h1>Sign Up</h1>

    <div>
        <label for="email">Email:</label>
        <input type="email" id="email" bind:value={$email} placeholder="Enter your email" />
    </div>

    <div>
        <label for="password">Password:</label>
        <input type="password" id="password" bind:value={$password} placeholder="Enter your password" />
    </div>

    <button on:click={signUp}>Sign Up</button>

    {#if $loginError}
        <p style="color: red;">{$loginError}</p>
    {/if}

    {#if $successMessage}
        <p style="color: green;">{$successMessage}</p>
    {/if}

    {#if $showMemberForm}
        <!-- Member Details Form -->
        <h2>Fill in your details</h2>

        <div>
            <label for="first_name">First Name:</label>
            <input type="text" id="first_name" bind:value={$m_member_first_name} placeholder="Enter your first name" />
        </div>

        <div>
            <label for="last_name">Last Name:</label>
            <input type="text" id="last_name" bind:value={$m_member_last_name} placeholder="Enter your last name" />
        </div>

        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" bind:value={$m_member_username} placeholder="Enter your username" />
        </div>

        <div>
            <label for="street_number">Street Number:</label>
            <input type="text" id="street_number" bind:value={$m_member_street_number} placeholder="Enter your street number" />
        </div>

        <div>
            <label for="street_name">Street Name:</label>
            <input type="text" id="street_name" bind:value={$m_member_street_name} placeholder="Enter your street name" />
        </div>

        <div>
            <label for="street_type">Street Type:</label>
            <input type="text" id="street_type" bind:value={$m_member_street_type} placeholder="Enter your street type" />
        </div>

        <div>
            <label for="suburb">Suburb:</label>
            <input type="text" id="suburb" bind:value={$m_member_suburb} placeholder="Enter your suburb" />
        </div>

        <div>
            <label for="state">State:</label>
            <input type="text" id="state" bind:value={$m_member_state} placeholder="Enter your state" />
        </div>

        <div>
            <label for="post_code">Post Code:</label>
            <input type="text" id="post_code" bind:value={$m_member_post_code} placeholder="Enter your post code" />
        </div>

        <div>
            <label for="country">Country:</label>
            <input type="text" id="country" bind:value={$m_member_country} placeholder="Enter your country" />
        </div>

        <div>
            <label for="contact_number">Contact Number:</label>
            <input type="text" id="contact_number" bind:value={$m_member_contact_number} placeholder="Enter your contact number" />
        </div>

        <button on:click={submitMemberDetails}>Submit Member Details</button>
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
