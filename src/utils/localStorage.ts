import { Recipe, User } from '../types'

const RECIPES_KEY = 'tastygram_recipes'
const USER_KEY = 'tastygram_user'

export function getRecipes(): Recipe[] {
  const data = localStorage.getItem(RECIPES_KEY)
  return data ? JSON.parse(data) : []
}

export function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes))
}

export function getUser(): User | null {
  const data = localStorage.getItem(USER_KEY)
  return data ? JSON.parse(data) : null
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
}
