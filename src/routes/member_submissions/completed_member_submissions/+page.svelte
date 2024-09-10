<script lang="ts">
    import { onMount } from "svelte";
    import { createClient } from '@supabase/supabase-js';
    import '../../../app.postcss';
    import { goto } from '$app/navigation';       
    
    const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseClient = createClient(supabaseURL, supabaseAnonKey);

    let recipe_id: number = 0;
    let recipe: any = null;
    let recipeIngredients: any[] = [];    
    let selectedDietaryRequirementsData: any[] = [];

    onMount(async () => {    
        
        const { data: latestRecipeData, error: latestRecipeError } = await supabaseClient
            .from('Recipes')
            .select('r_recipes_id')
            .order('r_recipes_created_at', { ascending: false })
            .limit(1)
            .single();

        if (latestRecipeError) {
            console.error('Error fetching the latest recipe ID:', latestRecipeError);
            return;
        }

        if (latestRecipeData) {
            recipe_id = latestRecipeData.r_recipes_id;
            console.log('Latest Recipe ID:', recipe_id);
        } else {
            console.error('No recipes found.');
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
            console.log('Ingredients:', recipeIngredients);
        }        
        await fetchRecipeDietaryRequirements();
    });
    async function fetchRecipeDietaryRequirements() {        
    const { data: recipeDietaryRequirementsData, error: recipeDietaryRequirementsError } = await supabaseClient
        .from('Recipe Dietary Requirements')
        .select('dr_dietary_requirements_id')
        .eq('r_recipes_id', recipe_id);
    
    if (recipeDietaryRequirementsError) {
        console.error('Error fetching recipe dietary requirements:', recipeDietaryRequirementsError);
    } else if (recipeDietaryRequirementsData.length > 0) {
        const dietaryRequirementIds = recipeDietaryRequirementsData.map(item => item.dr_dietary_requirements_id);
        console.log('Dietary Requirement IDs for this recipe:', dietaryRequirementIds);
        
        const { data: dietaryRequirementsData, error: dietaryRequirementsError } = await supabaseClient
            .from('Dietary Requirements')
            .select('dr_dietary_requirements_name')
            .in('dr_dietary_requirements_id', dietaryRequirementIds);

        if (dietaryRequirementsError) {
            console.error('Error fetching dietary requirement names:', dietaryRequirementsError);
        } else {
            selectedDietaryRequirementsData = dietaryRequirementsData;
            console.log('Dietary requirement names for this recipe:', selectedDietaryRequirementsData);
        }
    } else {
        console.log('No dietary requirements associated with this recipe.');
    }
}
    
    
</script>

<header class="center-button">    
    <button id="cr" type="button" on:click={() => goto('/member_submissions')}>ANOTHER SUBMISSION</button>    
    <button id="cr" type="button" on:click={() => goto('/member/logged_in')}>HOME</button> 
    <button id="cr" type="button" on:click={() => goto('/recipes')}>SEARCH RECIPES</button>
</header>

<h1 class="heading">Recipe Details</h1>

{#if recipe}
    <div>
        <h2 class="heading">{recipe.r_recipes_title}</h2>

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

        <p><strong>Dietary Requirements:</strong>
            {#if selectedDietaryRequirementsData.length > 0}
                <ul>
                    {#each selectedDietaryRequirementsData as requirement}
                        <li>{requirement.dr_dietary_requirements_name}</li>
                    {/each}
                </ul>
            {:else}
                <p>No dietary requirements found for this recipe.</p>
            {/if}
        </p>

        <h3 class="heading">Ingredients</h3>
        {#if recipeIngredients.length > 0}
            <ul>
                {#each recipeIngredients as ingredient}
                    <li>
                        {ingredient.ri_recipe_ingredients_name} - {ingredient.ri_recipe_ingredients_quantity} {ingredient.ri_recipe_ingredients_unit}
                    </li>
                {/each}
            </ul>
        {:else}
            <p>No ingredients found for this recipe.</p>
        {/if}
    </div>
{:else}
    <p>No recipe found.</p>
{/if}
