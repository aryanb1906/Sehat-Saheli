"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Plus, Heart, Clock, Users, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

interface Recipe {
    id: number
    name: string
    ingredients: string[]
    calories: number
    protein: string
    iron?: string
    calcium?: string
    benefits: string[]
    instructions: string
    servings: number
    prepTime: number
    cookTime: number
}

export default function EnhancedNutritionPlanner() {
    const router = useRouter()
    const { toast } = useToast()
    const { content } = useLanguage()
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

    useEffect(() => {
        fetchRecipes()
    }, [])

    const fetchRecipes = async () => {
        try {
            const response = await fetch("/api/nutrition-recipes")
            const data = await response.json()
            setRecipes(data.recipes)
        } catch (error) {
            console.error("Failed to fetch recipes:", error)
            toast({
                title: "Error loading recipes",
                description: "Please check your connection and try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const filteredRecipes = recipes.filter(
        (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.benefits.some((b) => b.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
            {/* Header */}
            <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Nutrition Planner</h1>
                </div>
                <Input
                    placeholder="Search recipes, nutrients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white text-foreground"
                />
            </div>

            {/* Content */}
            <div className="p-6 max-w-6xl mx-auto">
                {/* Nutrition Tips Banner */}
                <Card className="mb-6 p-6 bg-success/10 border-success/30">
                    <h3 className="font-semibold text-success mb-2">💡 Daily Nutrition Tips</h3>
                    <ul className="text-sm text-foreground/80 space-y-1 leading-relaxed">
                        <li>• Eat iron-rich foods 5-6 times a week (spinach, dates, jaggery)</li>
                        <li>• Drink milk daily for calcium - baby's bones need it!</li>
                        <li>• Add protein to every meal (dal, eggs, yogurt, fish)</li>
                        <li>• Seasonal vegetables provide best nutrients</li>
                    </ul>
                </Card>

                {/* Recipes Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : filteredRecipes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Flame className="w-12 h-12 text-care/30 mb-4" />
                        <p className="text-lg font-semibold text-foreground/80">No recipes found</p>
                        <p className="text-sm text-foreground/60 mt-2">Try searching with different keywords</p>
                        <Button variant="outline" onClick={() => setSearch("")} className="mt-4">
                            Clear Search
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecipes.map((recipe) => (
                            <Card
                                key={recipe.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setSelectedRecipe(recipe)}
                            >
                                <div className="p-6">
                                    <h3 className="font-bold text-lg mb-2">{recipe.name}</h3>

                                    {/* Nutrition Highlights */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-care/20 rounded p-2 text-center">
                                            <Flame className="w-4 h-4 mx-auto text-care mb-1" />
                                            <span className="text-sm font-semibold">{recipe.calories} cal</span>
                                        </div>
                                        <div className="bg-accent/20 rounded p-2 text-center">
                                            <Heart className="w-4 h-4 mx-auto text-accent mb-1" />
                                            <span className="text-sm font-semibold">{recipe.protein}</span>
                                        </div>
                                    </div>

                                    {/* Benefits */}
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-foreground/70 mb-1">Benefits:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {recipe.benefits.slice(0, 2).map((b, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs bg-success/20 text-success rounded-full px-2 py-1"
                                                >
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time & Servings */}
                                    <div className="flex justify-between text-xs text-foreground/60">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {recipe.prepTime + recipe.cookTime} mins
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {recipe.servings} servings
                                        </span>
                                    </div>

                                    <Button className="w-full mt-4 bg-care text-white h-11" onClick={() => setSelectedRecipe(recipe)}>
                                        View Recipe
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Recipe Detail Modal */}
                {selectedRecipe && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedRecipe.name}</h2>
                                        <p className="text-sm text-foreground/60">
                                            Prep: {selectedRecipe.prepTime} min | Cook: {selectedRecipe.cookTime} min
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedRecipe(null)}
                                    >
                                        ✕
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Ingredients</h3>
                                        <ul className="text-sm space-y-1 mb-4 leading-relaxed">
                                            {selectedRecipe.ingredients.map((ing, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-care rounded-full"></span>
                                                    {ing}
                                                </li>
                                            ))}
                                        </ul>

                                        <h3 className="font-semibold mb-2">Nutrition</h3>
                                        <div className="text-sm space-y-1 leading-relaxed">
                                            <p>🔥 Calories: {selectedRecipe.calories}</p>
                                            <p>💪 Protein: {selectedRecipe.protein}</p>
                                            {selectedRecipe.iron && <p>🩸 Iron: {selectedRecipe.iron}</p>}
                                            {selectedRecipe.calcium && (
                                                <p>🦴 Calcium: {selectedRecipe.calcium}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Instructions</h3>
                                        <p className="text-sm mb-4 leading-relaxed">{selectedRecipe.instructions}</p>

                                        <h3 className="font-semibold mb-2">Health Benefits</h3>
                                        <ul className="text-sm space-y-1 leading-relaxed">
                                            {selectedRecipe.benefits.map((b, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <span className="text-success">✓</span>
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <Button className="w-full mt-6 bg-success text-white h-11" onClick={() => {
                                    toast({
                                        title: "✅ Added to Meal Plan!",
                                        description: `${selectedRecipe.name} added for this week`
                                    })
                                    setSelectedRecipe(null)
                                }}>
                                    Add to Meal Plan
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
