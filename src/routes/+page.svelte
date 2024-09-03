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
<h1 class="text-center">Welcome to the Recipe App!</h1>
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
