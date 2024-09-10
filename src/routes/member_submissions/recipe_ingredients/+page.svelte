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
        let selectedDietaryRequirement: number[] = [];
        let dietaryRequirements: any[] = [];
        let imageFile: File | null = null; 
        let recipeDietaryRequirements: any[] = [];
        let recipeIngredientsData: any[] = [];
        let publicURL = '';         

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
            
        }

        const { data: recipeIngredientsData, error: recipeIngredientsError } = await supabaseClient
            .from('recipe_ingredients')
            .select('*');

        if (recipeIngredientsError) {
            console.error('Error fetching recipe ingredients:', recipeIngredientsError);
        } else {
            recipeIngredients = recipeIngredientsData;
            
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

onMount(() => {
        fetchDietaryRequirements();
        fetchRecipeDietaryRequirements();
        });
async function fetchDietaryRequirements() {
        const { data: dietaryRequirementsData, error: dietaryRequirementsError } = await supabaseClient
            .from('Dietary Requirements')
            .select('*');
        
        if (dietaryRequirementsError) {
            console.error('Error fetching dietary requirements:', dietaryRequirementsError);
        } else {
            dietaryRequirements = dietaryRequirementsData;
        }
    }    
    
async function fetchRecipeDietaryRequirements() {
        const { data: recipeDietaryRequirementsData, error: recipeDietaryRequirementsError } = await supabaseClient
            .from('Recipe Dietary Requirements')
            .select('*');
       
    }
function toggleDietaryRequirement(dietaryRequirementId: number) {
        if (selectedDietaryRequirement.includes(dietaryRequirementId)) {
            selectedDietaryRequirement = selectedDietaryRequirement.filter(id => id !== dietaryRequirementId);
        } else {
            selectedDietaryRequirement = [...selectedDietaryRequirement, dietaryRequirementId];
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
async function addRecipeDietaryRequirementsData(event: MouseEvent) {
        try {        
        if (!r_recipes_id) {
            throw new Error('Recipe ID is not set.');
        }        
        for (const dr_id of selectedDietaryRequirement) {
            const { data, error } = await supabaseClient
                .from('Recipe Dietary Requirements')
                .insert([
                    {
                        r_recipes_id: r_recipes_id, 
                        dr_dietary_requirements_id: dr_id, 
                    },
                ]);

            if (error) {
                console.error('Error inserting dietary requirement:', error);
            } else {
                console.log('Inserted dietary requirement:', data);
            }
        }        
        alert('Dietary requirements submitted successfully!');
        selectedDietaryRequirement = []; 
    } catch (error) {
        console.error('Unexpected error:', error);
        alert('There was an error submitting the dietary requirements.');
    }
    }

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        imageFile = target.files ? target.files[0] : null;
    } 
    
  
    async function uploadImage() {
    if (!imageFile) {
        alert("Please select an image file first.");
        return;
    }

    const fileName = `${Date.now()}_${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('recipes_images')
        .upload(fileName, imageFile);

    if (uploadError) {
        console.error('Error uploading image:', uploadError.message);
        alert('Failed to upload image.');
        return;
    } else {
        console.log('Image uploaded successfully:', uploadData);
    }

    // Get the public URL of the uploaded image
    const { data: publicUrlData } = supabaseClient.storage
        .from('recipes_images')
        .getPublicUrl(fileName);

    const publicURL = publicUrlData?.publicUrl;

    if (!publicURL) {
        console.error('Error getting public URL');
        alert('Failed to get image URL.');
        return;
    }

    console.log('Image public URL:', publicURL);

    // Update the recipe with the image URL in the r_recipes_image field
    const { data: updateData, error: updateError } = await supabaseClient
        .from('Recipes')
        .update({ r_recipes_image: publicURL })  // Update the image URL
        .eq('r_recipes_id', r_recipes_id);       // Ensure you're updating the right recipe

    if (updateError) {
        console.error('Error updating recipe with image URL:', updateError.message);
        alert('Failed to update recipe with image URL.');
    } else {
        console.log('Recipe updated with image URL:', updateData);
        alert('Image uploaded and recipe updated successfully.');
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
        <colgroup>
            <col class="col-ingredient">
            <col class="col-quantity">
            <col class="col-unit">
            <col class="col-add">
        </colgroup>
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
            
            <tr>
                <td><label for="dietary_requirements">Dietary Requirements</label></td>            
                <td>
                    <div class="dietary-requirements-container">
                        {#each dietaryRequirements as dietaryRequirement}
                            <label class="dietary-checkbox">
                                <input
                                    type="checkbox"
                                    name="dietary_requirements"
                                    value={dietaryRequirement.dr_dietary_requirements_id}
                                    on:change={() => toggleDietaryRequirement(dietaryRequirement.dr_dietary_requirements_id)}
                                />
                                {dietaryRequirement.dr_dietary_requirements_name}
                            </label>
                        {/each}
                    </div>
                </td>
            </tr>
            <tr>
                <td><label for="r_recipes_image">Upload Image (Optional):</label></td>
                <td>                  
                  <label for="r_recipes_image" class="custom-file-upload">Choose File</label>
                  <input type="file" id="r_recipes_image" accept="image/*" on:change={handleFileChange} />
                  <div class="button-container">            
                  <button id="cr" type="button" on:click={uploadImage}>Upload Image</button>
                  <button id="cr" type="button" on:submit={uploadImage}>Image</button>
                  </div>
                </td>
              </tr>                
            </tbody>
        </table>
    
    <p>Click ADD INGREDIENTS until you have entered all ingredients. When you're happy with your recipe, press SUBMIT RECIPE.</p>
    <div class="button-container">
    <button id="cr" type="button" on:click={addRecipeDietaryRequirementsData}>ADD DIETARY REQUIREMENTS</button>               
    <button id="cr" type="button" on:click={handleRecipeSubmission}>SUBMIT RECIPE</button>
    <button id="cr" type="button" on:click={() => goto('/member_submissions/')}>GO BACK</button>  
    <button id="cr" type="button" on:click={() => goto('/member/logged_in')}>HOME</button> 
    </div>     
</form>

