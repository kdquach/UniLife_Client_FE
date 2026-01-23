export const CATEGORIES = ["All", "Burgers", "Pizza", "Salads", "Wraps", "Mains", "Bowls", "Pasta"];

export const MENU_ITEMS = [
  {
    id: "classic-burger",
    name: "Classic Burger",
    category: "Burgers",
    description: "Juicy beef patty with fresh lettuce, tomato, and our special sauce",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    category: "Pizza",
    description: "Fresh mozzarella, tomato sauce, and basil on a crispy crust",
    price: 14.99,
    image: "",
  },
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    category: "Salads",
    description: "Crisp romaine, parmesan, croutons, and Caesar dressing",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "chicken-wrap",
    name: "Chicken Wrap",
    category: "Wraps",
    description: "Grilled chicken with mixed greens, tomato, and ranch dressing",
    price: 10.99,
    image: "",
  },
];

export { money } from "@/utils/currency.js";
