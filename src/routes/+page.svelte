<script>
    import { goto } from '$app/navigation'; 
    import '../app.postcss';
  
    function navigateToRecipes() {
        goto('/recipes');
    }

    function navigateToMemberSubmissions() {
        goto('/member_submissions');
    };
</script>
<h1 class="text-center">MixRecovery19 Recipe Library</h1>
<p class="home-ptag">Welcome to the MixRecovery19 Recipe Library</p>
<p class="home-ptag">Go To Recipes To Search For Recipes</p>
<p class="home-ptag">Use Member Submissions To Create and Share Your Own</p>
<button on:click={navigateToRecipes}>
    Go to Recipes
</button>
<button on:click={navigateToMemberSubmissions}>
    Go to Member Submissions
</button>

<style> 
    button {
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }
</style>
