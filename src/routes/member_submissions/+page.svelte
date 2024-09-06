<script lang="ts">
    import { createClient } from '@supabase/supabase-js';
    import '../../app.postcss';
    import { onMount } from 'svelte';    
    import { goto } from '$app/navigation'; 
    
    const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseClient = createClient(supabaseURL, supabaseAnonKey);

    let Categories: any[] = [];    
    let categoryMap: Record<number, string> = {}; 
    let r_recipes_title: string = '';
    let r_recipes_description: string = '';
    let r_recipes_instructions: string = '';
    let r_recipes_preparation_time: number = 0;
    let r_recipes_cooking_time: number = 0;
    let r_recipes_servings: number = 0;
    let selectedCategory: number | null = null;
    let selectedDietaryRequirement: number | null = null;
    let imageFile: File | null = null;
    let dietaryRequirements: any[] = [];

    // Fetch categories on mount
    onMount(async () => {
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
    });

    // Fetch dietary requirements on mount
    onMount(async () => {
        const { data: dietaryRequirementsData, error: dietaryRequirementsError } = await supabaseClient
            .from('Dietary Requirements')
            .select('*');

        if (dietaryRequirementsError) {
            console.error('Error fetching dietary requirements:', dietaryRequirementsError);
        } else {
            dietaryRequirements = dietaryRequirementsData;
            console.log('Dietary Requirements fetched:', dietaryRequirements); // Log data
        }
    });

    async function uploadImage() {
        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.name}`;
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('recipes_images')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error('Error uploading image:', uploadError.message);
                return null;
            }

            const { data: publicUrlData } = supabaseClient.storage
                .from('recipes_images')
                .getPublicUrl(fileName);

            return publicUrlData.publicUrl; 
        }
        return null;
    }

    async function createRecipe(imageUrl: string | null) {
        const { data, error } = await supabaseClient
            .from('Recipes')
            .insert([{
                r_recipes_title,
                r_recipes_description,
                r_recipes_instructions,
                r_recipes_preparation_time,
                r_recipes_cooking_time,
                r_recipes_servings,
                c_category_id: selectedCategory,
                r_recipes_image: imageUrl,
                dr_dietary_requirements_id: selectedDietaryRequirement
            }])
            .single();

        if (error) {
            console.error('Error inserting recipe:', error.message);
            return null;
        } else {
            const recipeId = (data as { id: number })?.id;
            console.log('Recipe created with ID:', recipeId);            
            // Clear form fields
            r_recipes_title = '';
            r_recipes_description = '';
            r_recipes_instructions = '';
            r_recipes_preparation_time = 0;
            r_recipes_cooking_time = 0;
            r_recipes_servings = 0;
            selectedCategory = null;
            imageFile = null;
            selectedDietaryRequirement = null;

            return recipeId;
        }
    }

    function selectCategory(categoryId: number) {
        selectedCategory = categoryId;
    }

    function selectDietaryRequirement(dietaryRequirementId: number) {
        selectedDietaryRequirement = dietaryRequirementId;
    }

    async function handleSubmit() {
        const imageUrl = await uploadImage();
        if (imageUrl) {
            await createRecipe(imageUrl);
            goto('/member_submissions/recipe_ingredients');
        } else {
            console.error('Image upload failed, recipe not created.');
        }
    }

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        imageFile = target.files ? target.files[0] : null;
    }
</script>

<h1>Recipes</h1>

<form on:submit|preventDefault={handleSubmit}>
    <table>
        <tr>
            <td><label for="r_recipes_title">Recipe Title</label></td>
            <td><input type="text" id="r_recipes_title" bind:value={r_recipes_title} required></td>
        </tr>
        <tr>
            <td><label for="r_recipes_description">Recipe Description</label></td>
            <td><input type="text" id="r_recipes_description" bind:value={r_recipes_description} required></td>
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
            <td><label for="r_recipes_image">Upload Image:</label></td>
            <td><input type="file" id="r_recipes_image" accept="image/*" on:change={handleFileChange} required></td>
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
                                on:change={() => selectCategory(category.c_category_id)}
                            />
                            {category.c_category_name}
                        </label>
                    {/each}
                </div>
            </td>
        </tr>
        <tr>
            <td><label for="dietary_requirements">Dietary Requirements</label></td>            
            <td>
                <div class="dietary-requirements-container">
                    {#each dietaryRequirements as dietaryRequirement}
                        <label>
                            <input
                                type="radio"
                                name="dietary_requirements"
                                value={dietaryRequirement.dr_dietary_requirements_id}
                                checked={dietaryRequirements === dietaryRequirement.dr_dietary_requirements_id}
                                on:change={() => selectDietaryRequirement(dietaryRequirement.dr_dietary_requirements_id)}
                            />
                            {dietaryRequirement.dr_dietary_requirements_name}
                        </label>
                    {/each}
                </div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <button id="cr" type="submit">
                    Create Recipe & Insert Ingredients
                </button>       
            </td>
        </tr>
    </table>

    <button id="cr" type="button" on:click={() => goto('/')}>CANCEL</button>
</form>
