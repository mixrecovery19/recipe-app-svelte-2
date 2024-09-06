<script lang="ts">
    import { onMount } from "svelte";
    import { createClient } from '@supabase/supabase-js';
    import { goto } from '$app/navigation';

    const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseClient = createClient(supabaseURL, supabaseAnonKey);

    let email = '';
    let password = '';
    let loginError = '';
    let successMessage = '';
    let userId = '';  // Store authenticated user's id here

    let showMemberForm = false;    
    let m_member_first_name = '';
    let m_member_last_name = '';
    let m_member_username = '';
    let m_member_street_number = '';
    let m_member_street_name = '';
    let m_member_street_type = '';
    let m_member_suburb = '';
    let m_member_state = '';
    let m_member_post_code = '';
    let m_member_country = '';
    let m_member_contact_number = '';

    // Fetch user data when the component is mounted
    onMount(async () => {
        const { data: user, error: userError } = await supabaseClient.auth.getUser();

        if (userError) {
            loginError = 'Error fetching user data.';
            return;
        }

        if (user?.user?.id) {
            userId = user.user.id;  // Store the authenticated user's ID
            email = user.user.email ?? '';  // Use the user's email if available
        }

        // Optionally fetch member data for this user if they exist
        const { data: memberData, error: memberError } = await supabaseClient
            .from('Member')
            .select('*')
            .eq('m_user_id', userId);

        if (memberError) {
            loginError = 'Error fetching member details.';
        } else if (memberData?.length > 0) {
            // If member data exists, you can pre-fill the form (optional)
            const member = memberData[0];
            m_member_first_name = member.m_member_first_name;
            m_member_last_name = member.m_member_last_name;
            m_member_username = member.m_member_username;
            m_member_street_number = member.m_member_street_number;
            m_member_street_name = member.m_member_street_name;
            m_member_street_type = member.m_member_street_type;
            m_member_suburb = member.m_member_suburb;
            m_member_state = member.m_member_state;
            m_member_post_code = member.m_member_post_code;
            m_member_country = member.m_member_country;
            m_member_contact_number = member.m_member_contact_number;
        }
    });

    // Function to submit or update member details
    const submitMemberDetails = async () => {
        const { error } = await supabaseClient
            .from('Member')
            .upsert([  // Using upsert to update if record exists, otherwise insert
                {                    
                    m_user_id: userId,  // Associate this member with the authenticated user
                    m_member_first_name,
                    m_member_last_name,
                    m_member_username,
                    m_member_email: email,
                    m_member_street_number,
                    m_member_street_name,
                    m_member_street_type,
                    m_member_suburb,
                    m_member_state,
                    m_member_post_code,
                    m_member_country,
                    m_member_contact_number
                }
            ], { onConflict: 'm_user_id' });  // Prevent duplicate user entries

        if (error) {
            loginError = error.message;
        } else {
            successMessage = 'Member details saved successfully.';
            loginError = '';
            showMemberForm = false;
        }
    };

    // Show form for updating member details
    function updateMemberDetails() {
        showMemberForm = true;
    }
    function navigateToMemberSubmissions() {
        goto('/member_submissions');
    };

</script>

<main>
    <h1>Logged In Members</h1>
    <button id="cr" type="button" on:click={updateMemberDetails}>UPDATE DETAILS</button>
    <button id="cr" type="button" on:click={() => goto('/')}>MEMBER HOME</button>
    <button id="cr" on:click={navigateToMemberSubmissions}>
        Go to Member Submissions
    </button>
    {#if showMemberForm}
        <!-- Member Details Form -->
        <h2>Fill in your details</h2>

        <div>
            <label for="first_name">First Name:</label>
            <input type="text" id="first_name" bind:value={m_member_first_name} placeholder="Enter your first name" />
        </div>

        <div>
            <label for="last_name">Last Name:</label>
            <input type="text" id="last_name" bind:value={m_member_last_name} placeholder="Enter your last name" />
        </div>

        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" bind:value={m_member_username} placeholder="Enter your username" />
        </div>

        <!-- Add more fields as needed -->

        <button on:click={submitMemberDetails}>Submit Member Details</button>
    {/if}

    {#if successMessage}
        <p style="color: green;">{successMessage}</p>
    {/if}

    {#if loginError}
        <p style="color: red;">{loginError}</p>
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
