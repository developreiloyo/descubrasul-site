import { redirect } from "next/navigation";

// /food → atalho para categoria restaurantes
export default function FoodPage() {
  redirect("/restaurantes");
}
