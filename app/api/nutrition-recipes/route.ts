import { NextRequest, NextResponse } from "next/server";

// Nutrition Recipes Database
const recipesDatabase = [
    {
        id: 1,
        name: "Spinach & Chickpea Curry",
        language: "en",
        ingredients: ["spinach", "chickpeas", "onion", "garlic", "turmeric", "ginger"],
        calories: 250,
        protein: "12g",
        iron: "High",
        season: "Year-round",
        instructions: "Sauté onions, add spices, add chickpeas and spinach, simmer 15 mins",
        benefits: ["High in iron", "Rich in protein", "Good for hemoglobin"],
        servings: 2,
        prepTime: 10,
        cookTime: 15,
    },
    {
        id: 2,
        name: "Ragi (Finger Millet) Porridge",
        language: "en",
        ingredients: ["ragi", "milk", "honey", "banana", "dates"],
        calories: 180,
        protein: "6g",
        calcium: "High",
        season: "Year-round",
        instructions: "Mix ragi with milk, heat, add honey and banana, serve warm",
        benefits: ["High in calcium", "Rich in iron", "Good for baby development"],
        servings: 1,
        prepTime: 5,
        cookTime: 10,
    },
    {
        id: 3,
        name: "Lentil & Vegetable Khichdi",
        language: "en",
        ingredients: ["moong dal", "rice", "turmeric", "ghee", "salt", "vegetables"],
        calories: 220,
        protein: "8g",
        fiber: "High",
        season: "Year-round",
        instructions: "Cook dal and rice together, add turmeric, serve with ghee",
        benefits: ["Easy to digest", "Complete protein", "Rich in nutrients"],
        servings: 2,
        prepTime: 15,
        cookTime: 25,
    },
    {
        id: 4,
        name: "Dates & Almond Ladoo",
        language: "en",
        ingredients: ["dates", "almonds", "ghee", "sesame seeds"],
        calories: 150,
        protein: "4g",
        iron: "High",
        season: "Year-round",
        instructions: "Blend dates and almonds, roll into balls, coat with sesame",
        benefits: ["High in energy", "Rich in iron", "Natural sweetener"],
        servings: 6,
        prepTime: 20,
        cookTime: 0,
    },
];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const season = searchParams.get("season");
        const dietaryRestriction = searchParams.get("restriction");
        const calorieTarget = searchParams.get("calories");
        const trimester = searchParams.get("trimester");
        const condition = (searchParams.get("condition") || "").toLowerCase();
        const region = searchParams.get("region") || "general";

        let filteredRecipes = recipesDatabase;

        if (season) {
            filteredRecipes = filteredRecipes.filter(
                (r) => r.season === season || r.season === "Year-round"
            );
        }

        if (calorieTarget) {
            const target = parseInt(calorieTarget);
            filteredRecipes = filteredRecipes.filter(
                (r) => Math.abs(r.calories - target) < 100
            );
        }

        if (condition === "anemia") {
            filteredRecipes = filteredRecipes.filter((r) =>
                (r as any).iron === "High" || r.benefits.some((b) => b.toLowerCase().includes("iron")),
            );
        }

        if (condition === "diabetes") {
            filteredRecipes = filteredRecipes.filter((r) => r.calories <= 230);
        }

        const trimesterTips: Record<string, string[]> = {
            first: ["Focus on folate-rich meals", "Prefer small frequent meals to reduce nausea"],
            second: ["Increase protein and calcium", "Add iron-rich foods with vitamin C"],
            third: ["Prioritize hydration and fiber", "Split meals to avoid acidity and bloating"],
        };

        const localSubstitutions: Record<string, string[]> = {
            odisha: ["Palak -> Poi saag", "Chickpea -> Black gram", "Almond -> Groundnut"],
            bihar: ["Ragi -> Sattu", "Dates -> Jaggery peanut chikki", "Oats -> Dalia"],
            up: ["Broccoli -> Cauliflower greens", "Quinoa -> Bajra", "Almond -> Roasted chana"],
            general: ["Almond -> Roasted chana", "Quinoa -> Millets", "Avocado -> Groundnut + curd"],
        };

        return NextResponse.json({
            success: true,
            recipes: filteredRecipes,
            totalRecipes: filteredRecipes.length,
            personalization: {
                trimester: trimester || "not-specified",
                condition: condition || "none",
                region,
                tips: trimester ? trimesterTips[trimester] || [] : [],
                substitutions: localSubstitutions[region.toLowerCase()] || localSubstitutions.general,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch recipes" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, ingredients, calories, benefits, instructions } = body;

        // Save custom recipe (in production: save to database)
        const newRecipe = {
            id: recipesDatabase.length + 1,
            name,
            ingredients,
            calories,
            benefits,
            instructions,
            language: "en",
            servings: 2,
            prepTime: 15,
            cookTime: 20,
        };

        return NextResponse.json({
            success: true,
            message: "Recipe saved successfully",
            recipe: newRecipe,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to save recipe" },
            { status: 500 }
        );
    }
}
