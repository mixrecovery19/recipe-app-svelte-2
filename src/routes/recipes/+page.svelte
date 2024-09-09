<script lang="ts">
    import { createClient } from '@supabase/supabase-js';
    import '../../app.postcss';
    import { goto } from '$app/navigation';    

    const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseClient = createClient(supabaseURL, supabaseAnonKey);

    let searchQuery: string = '';
    let searchResults: any[] = [];

    async function handleSearch() {
        if (searchQuery.trim() === '') {
            searchResults = [];
            return;
        }
        
        const { data, error } = await supabaseClient
            .from('Recipes')
            .select('*')
            .ilike('r_recipes_title', `%${searchQuery}%`);

        if (error) {
            console.error('Error searching recipes:', error);
            searchResults = [];
        } else {
            searchResults = data;
        }
    }

    function handleViewRecipe(recipeId: number) {        
        goto(`/recipes/${recipeId}`);
    }
</script>

<h1 class="heading">Search Recipes</h1>
<input
    type="text"
    placeholder="Search recipes by title..."
    bind:value={searchQuery}
    on:input={handleSearch}
/>

{#if searchResults.length > 0}
    <ul>
        {#each searchResults as recipe}
            <li>
                <h3>{recipe.r_recipes_title}</h3>
                <p><strong>Description:</strong> {recipe.r_recipes_description}</p>
                <p><strong>Instructions:</strong> {recipe.r_recipes_instructions}</p>
                <p><strong>Preparation Time:</strong> {recipe.r_recipes_preparation_time} mins</p>
                <p><strong>Cooking Time:</strong> {recipe.r_recipes_cooking_time} mins</p>
                <p><strong>Servings:</strong> {recipe.r_recipes_servings}</p>
                <button id="cr" type="button" on:click={() => handleViewRecipe(recipe.r_recipes_id)}>
                    View Recipe
                </button>
            </li>
        {/each}
    </ul>
{:else}
    <p>No recipes found matching your search.</p>
{/if}
<button id="cr" type="button" on:click={() => goto('/member/logged_in')}>CANCEL</button>