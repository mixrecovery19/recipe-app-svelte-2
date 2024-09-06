<script>
    import { goto } from '$app/navigation'; 
    import '../app.postcss';
  
    function navigateToRecipes() {
        goto('/recipes');
    }
    
    function navigateToMember() {
        goto('/member');
    };

</script>

<h1 class="text-center">MixRecovery19 Recipe Library</h1>
<p class="home-ptag">Welcome to the MixRecovery19 Recipe Library</p>
<p class="home-ptag">Go To Recipes To Search For Recipes</p>
<p class="home-ptag">Use Member Submissions To Create and Share Your Own</p>

<button id="cr" on:click={navigateToRecipes}>
    Go to Recipes
</button>

<button id="cr" on:click={navigateToMember}>
    Login/Sign-Up
</button>
