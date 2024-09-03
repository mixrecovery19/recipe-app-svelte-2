   <script lang='ts'>   
        import { onMount } from 'svelte';
        import { createClient } from '@supabase/supabase-js';
        import { goto } from '$app/navigation';
        import '../../../app.postcss';    
        
        const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const supabaseClient = createClient(supabaseURL, supabaseAnonKey);
        
        let Categories: any[] = [];
        let recipeIngredients: { name: string; quantity: string; unit: string; }[] = [
        { name: '', quantity: '', unit: ''}
        ];     
        let categoryMap: Record<number, string> = {}; 
        let r_recipes_id: number = 0;
        let r_recipes_title: string = '';
        let r_recipes_description: string = '';
        let r_recipes_instructions: string = '';
        let r_recipes_preparation_time: number = 0;
        let r_recipes_cooking_time: number = 0;
        let r_recipes_servings: number = 0;
        let selectedCategory: number | null = null;    

    onMount(async () => {

        const { data: recentRecipeData, error: recentRecipeError } = await supabaseClient
            .from('Recipes')
            .select('*')
            .order('r_recipes_created_at', { ascending: false })
            .limit(1);

        if (recentRecipeError) {
            console.error('Error fetching the most recent recipe:', recentRecipeError);
        } else if (recentRecipeData && recentRecipeData.length > 0) {
            const recentRecipe = recentRecipeData[0];
            r_recipes_id = recentRecipe.r_recipes_id;
            r_recipes_title = recentRecipe.r_recipes_title;
            r_recipes_description = recentRecipe.r_recipes_description;
            r_recipes_instructions = recentRecipe.r_recipes_instructions;
            r_recipes_preparation_time = recentRecipe.r_recipes_preparation_time;
            r_recipes_cooking_time = recentRecipe.r_recipes_cooking_time;
            r_recipes_servings = recentRecipe.r_recipes_servings;
            selectedCategory = recentRecipe.c_category_id;
            console.log('Most Recent Recipe:', recentRecipe); //bug fix...if database drops out
        }

        const { data: categoriesData, error: categoriesError } = await supabaseClient
            .from('Category')
            .select('*');

        if (categoriesError) {
            console.error('Error fetching categories:', categoriesError);
        } else {
            Categories = categoriesData;
            categoryMap = Categories.reduce((map, category) => {
                map[category.c_category_id] = category.c_category_name;
                return map;
            }, {});
            console.log('Categories:', Categories);  // bug fix...if database drops out
        }

        const { data: recipeIngredientsData, error: recipeIngredientsError } = await supabaseClient
            .from('recipe_ingredients')
            .select('*');

        if (recipeIngredientsError) {
            console.error('Error fetching recipe ingredients:', recipeIngredientsError);
        } else {
            recipeIngredients = recipeIngredientsData;
            console.log('recipe_ingredients:', recipeIngredients);  // bug fix...if database drops out
        }
    });

    async function handleRecipeSubmission() {
    try {        
        const { data: recentRecipeData, error: recentRecipeError } = await supabaseClient
            .from('Recipes')
            .select('r_recipes_id')
            .order('r_recipes_created_at', { ascending: false })
            .limit(1);

        if (recentRecipeError) {
            throw new Error('Error fetching the most recent recipe ID');
        }

        const recentRecipeId = recentRecipeData[0]?.r_recipes_id;

        if (!recentRecipeId) {
            throw new Error('No recent recipe found.');
        }        
        for (const ingredient of recipeIngredients) {
            const { data, error } = await supabaseClient
                .from('recipe_ingredients')
                .insert([
                    {
                        r_recipes_id: recentRecipeId,  
                        ri_recipe_ingredients_name: ingredient.name,
                        ri_recipe_ingredients_quantity: ingredient.quantity,
                        ri_recipe_ingredients_unit: ingredient.unit,                        
                    },
                ]);
                
            if (error) {
                console.error('Error inserting ingredient:', error);
            } else {
                console.log('Inserted ingredient:', data);
            }
        }

        alert('Recipe ingredients submitted successfully!');
        
        recipeIngredients = [
            { name: '', quantity: '', unit: '' }
        ];
        
        goto('/member_submissions/completed_member_submissions');

    } catch (error) {
        console.error('Error submitting recipe ingredients:', error);
        alert('There was an error submitting your recipe ingredients.');
    }
}

async function addRecipeIngredientsData(event: MouseEvent) {
    try {
        const ingredient = recipeIngredients[0];
        const { data, error } = await supabaseClient
            .from('recipe_ingredients')
            .insert([
                {
                    r_recipes_id: r_recipes_id,  
                    ri_recipe_ingredients_name: ingredient.name,
                    ri_recipe_ingredients_quantity: ingredient.quantity,
                    ri_recipe_ingredients_unit: ingredient.unit,                        
                },
            ]);

        if (error) {
            console.error('Error inserting ingredient:', error);
        } else {
            console.log('Inserted ingredient:', data);            
            recipeIngredients = [...recipeIngredients, { name: '', quantity: '', unit: ''}];

            ingredient.name = '';
            ingredient.quantity = '';
            ingredient.unit = '';
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

</script>

<form class="table-wrap" method="POST">
    <table class="table">
        <tr>
            <td><label for="r_recipes_id">Recipe ID</label></td>
            <td>{r_recipes_id}</td>
        </tr>
        <tr>
            <td><label for="r_recipes_title">Recipe Title</label></td>
            <td>{r_recipes_title}</td>
        </tr>
        <tr>
            <td><label for="r_recipes_description">Recipe Description</label></td>
            <td>{r_recipes_description}</td>
        </tr>
        <tr>
            <td><label for="r_recipes_instructions">Instructions</label></td>
            <td><input type="text" id="r_recipes_instructions" bind:value={r_recipes_instructions} required></td>
        </tr>
        <tr>
            <td><label for="r_recipes_preparation_time">Preparation Time (mins)</label></td>
            <td><input type="number" id="r_recipes_preparation_time" bind:value={r_recipes_preparation_time} required></td>
        </tr>
        <tr>
            <td><label for="r_recipes_cooking_time">Cooking Time (mins)</label></td>
            <td><input type="number" id="r_recipes_cooking_time" bind:value={r_recipes_cooking_time} required></td>
        </tr>
        <tr>
            <td><label for="r_recipes_servings">Servings</label></td>
            <td><input type="number" id="r_recipes_servings" bind:value={r_recipes_servings} required></td>
        </tr>
        <tr>
            <td><label for="category">Category</label></td>
            <td>
                <div>
                    {#each Categories as category}
                        <label>
                            <input
                                type="radio"
                                name="category"
                                value={category.c_category_id}
                                checked={selectedCategory === category.c_category_id}
                                on:change={() => selectedCategory = category.c_category_id}
                            />
                            {category.c_category_name}
                        </label>
                    {/each}
                </div>
            </td>
        </tr>
    </table>
</form>

<form class="table-wrap">
    <table class="table">
        <tbody>        
            <tr>
                <th class="heading">Ingredient Name</th>
                <th class="heading">Quantity</th>
                <th class="heading">Unit</th>
                <th class="heading">Add</th>
            </tr>
    
            {#if recipeIngredients.length > 0}
                <tr>
                    <td><input type="text" bind:value={recipeIngredients[0].name} placeholder="Ingredient Name"></td>
                    <td><input type="number" bind:value={recipeIngredients[0].quantity} placeholder="Quantity"></td>
                    <td><input type="text" bind:value={recipeIngredients[0].unit} placeholder="Unit"></td>
                    <td><button type="button" on:click={addRecipeIngredientsData}>ADD</button></td>
                </tr>
            {/if}
        </tbody>
        </table>        
        <p>Click the ADD INGEDIENTS until you have entered your ingredients. When you are happy with your recipe press SUBMIT RECIPE</p>               
            
        <button id="cr" type="button" on:click={addRecipeIngredientsData}>ADD INGREDIENTS</button>              
        <button id="cr" type="button" on:click={handleRecipeSubmission}>SUBMIT RECIPE</button>                
            
        <button id="cr" type="button" on:click={() => goto('/member_submissions/')}>CANCEL</button>        
</form>                           
           

            
                    
            
        
        
