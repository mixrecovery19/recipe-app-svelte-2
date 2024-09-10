import { supabaseClient } from './supabaseClient'; 
import { goto } from '$app/navigation'; 

let selectedCategory: number | null = null;
let r_recipes_title = '';
let r_recipes_description = '';
let r_recipes_instructions = '';
let r_recipes_preparation_time = 0;
let r_recipes_cooking_time = 0;
let r_recipes_servings = 0;

export function selectCategory(categoryId: number) {
    selectedCategory = categoryId;
}
export async function createRecipe() {
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
            
        }])
        .single();

    if (error) {
        console.error('Error inserting recipe:', error.message);
        return null;
    } else {
        const recipeId = (data as { id: number })?.id;
        console.log('Recipe created with ID:', recipeId);          
        
        if (recipeId) {
            const { data: recipeData, error: recipeError } = await supabaseClient
                .from('Recipes')
                .select('*')
                .eq('r_recipes_id', recipeId)
                .single();

            if (recipeError) {
                console.error('Error fetching recipe:', recipeError);
            } else {
                console.log('Recipe fetched:', recipeData);
            }                            
          }
        // Clear form fields
        r_recipes_title = '';
        r_recipes_description = '';
        r_recipes_instructions = '';
        r_recipes_preparation_time = 0;
        r_recipes_cooking_time = 0;
        r_recipes_servings = 0;
        selectedCategory = null;            
        
        return recipeId;
    }
}   
export async function handleSubmit() {
    const recipeId = await createRecipe();
    if (recipeId) {
        goto('/member_submissions/recipe_ingredients');
    }
}         