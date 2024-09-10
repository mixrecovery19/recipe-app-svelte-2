<script lang="ts">
    import { onMount } from "svelte";
    import { createClient } from '@supabase/supabase-js';
    import { goto } from '$app/navigation';

    const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseClient = createClient(supabaseURL, supabaseAnonKey);

    let email = '';   
    let loginError = '';
    let successMessage = '';
    let userId = '';  
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

    onMount(async () => {
        const { data: user, error: userError } = await supabaseClient.auth.getUser();

        if (userError) {
            loginError = 'Error fetching user data.';
            return;
        }

        if (user?.user?.id) {
            userId = user.user.id;  
            email = user.user.email ?? '';  
        }
        
        const { data: memberData, error: memberError } = await supabaseClient
            .from('Member')
            .select('*')
            .eq('m_user_id', userId);

        if (memberError) {
            loginError = 'Error fetching member details.';
        } else if (memberData?.length > 0) {
            
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
    
    const submitMemberDetails = async () => {
        const { error } = await supabaseClient
            .from('Member')
            .insert([  
                {                    
                    m_user_id: userId,  
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
            ]);  

        if (error) {
            loginError = error.message;
        } else {
            successMessage = 'Member details saved successfully.';
            loginError = '';
            showMemberForm = false;
        }
    };
    
    function updateMemberDetails() {
        showMemberForm = true;
    }
    function navigateToMemberSubmissions() {
        goto('/member_submissions');
    };

</script>

<main>
    <h1 class="heading">Logged In Members</h1>
    
    <button id="cr" type="button" on:click={() => goto('/recipes')}>SEARCH RECIPES</button>
    <button id="cr" on:click={navigateToMemberSubmissions}>MEMBER SUBMISSIONS</button>
     
    <button id="cr" type="button" on:click={updateMemberDetails}>UPDATE DETAILS</button>
    
    {#if showMemberForm}
        
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
        <div>
            <label for="street_number">Street Number:</label>
            <input type="text" id="street_number" bind:value={m_member_street_number} placeholder="Enter your street number" />
        </div>
        <div>
            <label for="street_name">Street Name:</label>
            <input type="text" id="street_name" bind:value={m_member_street_name} placeholder="Enter your street name" />
        </div>
        <div>
            <label for="street_type">Street Type:</label>
            <input type="text" id="street_type" bind:value={m_member_street_type} placeholder="Enter your street type" />
        </div>
        <div>
            <label for="suburb">Suburb:</label>
            <input type="text" id="suburb" bind:value={m_member_suburb} placeholder="Enter your suburb" />
        </div>
        <div>
            <label for="state">State:</label>
            <input type="text" id="state" bind:value={m_member_state} placeholder="Enter your state" />
        </div>
        <div>
            <label for="post_code">Post Code:</label>
            <input type="text" id="post_code" bind:value={m_member_post_code} placeholder="Enter your post code" />
        </div>
        <div>
            <label for="country">Country:</label>
            <input type="text" id="country" bind:value={m_member_country} placeholder="Enter your country" />
        </div>
        <div>
            <label for="contact_number">Contact Number:</label>
            <input type="text" id="contact_number" bind:value={m_member_contact_number} placeholder="Enter your contact number" />
        </div>        

        <button id="cr" on:click={submitMemberDetails}>Submit Member Details</button>

    {/if}

    {#if successMessage}
        <p style="color: green;">{successMessage}</p>
    {/if}

    {#if loginError}
        <p style="color: red;">{loginError}</p>
    {/if}
</main>

