<script lang="ts">
    import { onMount } from "svelte";
    import { createClient } from '@supabase/supabase-js';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';

    const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseClient = createClient(supabaseURL, supabaseAnonKey);

    let recipe: any = null;
    let recipeIngredients: any[] = [];
    let filteredIngredients: any[] = [];
    let searchQuery: string = '';

    onMount(async () => {        
        const { r_recipes_id } = get(page).params;
        const recipe_id = Number(r_recipes_id);

        if (!recipe_id) {
            console.error('No recipe ID provided.');
            return;
        }
        
        const { data: recipeData, error: recipeError } = await supabaseClient
            .from('Recipes')
            .select('*')
            .eq('r_recipes_id', recipe_id)
            .single();

        if (recipeError) {
            console.error('Error fetching recipe:', recipeError);
        } else {
            recipe = recipeData;
            console.log('Recipe:', recipe);
        }
        
        const { data: ingredientsData, error: ingredientsError } = await supabaseClient
            .from('recipe_ingredients')
            .select('*')
            .eq('r_recipes_id', recipe_id);

        if (ingredientsError) {
            console.error('Error fetching ingredients:', ingredientsError);
        } else {
            recipeIngredients = ingredientsData.filter(ingredient => 
                ingredient.ri_recipe_ingredients_name && 
                ingredient.ri_recipe_ingredients_quantity && 
                ingredient.ri_recipe_ingredients_unit
            );
            filteredIngredients = recipeIngredients;
            console.log('Ingredients:', recipeIngredients);
        }
    });

    function handleSearch() {
        if (searchQuery.trim() === '') {
            filteredIngredients = recipeIngredients;
        } else {
            filteredIngredients = recipeIngredients.filter(ingredient =>
                ingredient.ri_recipe_ingredients_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    }
</script>

<h1 class="heading">Recipe Details</h1>

{#if recipe}
    <div>
        <h2>{recipe.r_recipes_title}</h2>

        {#if recipe.r_recipes_image}
            <img 
                src={`${recipe.r_recipes_image}`} 
                alt={recipe.r_recipes_title} 
                style="max-width: 100%; height: auto;" 
            />
        {/if}

        <p><strong>Description:</strong> {recipe.r_recipes_description}</p>
        <p><strong>Instructions:</strong> {recipe.r_recipes_instructions}</p>
        <p><strong>Preparation Time:</strong> {recipe.r_recipes_preparation_time} mins</p>
        <p><strong>Cooking Time:</strong> {recipe.r_recipes_cooking_time} mins</p>
        <p><strong>Servings:</strong> {recipe.r_recipes_servings}</p>
        <p><strong>Category ID:</strong> {recipe.c_category_id}</p>
        
        <h3 class="heading">Ingredients</h3>
        
        <input
            type="text"
            placeholder="Search ingredients..."
            bind:value={searchQuery}
            on:input={handleSearch}
        />

        {#if filteredIngredients.length > 0}
            <ul>
                {#each filteredIngredients as ingredient}
                    <li>
                        {ingredient.ri_recipe_ingredients_name} - {ingredient.ri_recipe_ingredients_quantity} {ingredient.ri_recipe_ingredients_unit}
                    </li>
                {/each}
            </ul>
        {:else}
            <p>No ingredients found for this search.</p>
        {/if}
    </div>
{:else}
    <p>No recipe found.</p>
{/if}
