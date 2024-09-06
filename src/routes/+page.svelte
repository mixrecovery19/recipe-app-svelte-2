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

<h1 class="text-center">Interactive Recipe Library</h1>
<p class="home-ptag">Welcome to our Recipe Library</p>

<div class="center-container">
    <p class="home-ptag">Go To Recipes To Search For Recipes</p>
    <button id="cr" class="center-button" on:click={navigateToRecipes}>Go to Recipes</button>   
    
</div>

<p class="home-ptag">Use Member Submissions To Create and Share Your Own</p>

<button id="cr" class="center-button" on:click={navigateToMember}>
    Login/Sign-Up
</button>
