# Mapeamento de slugs de Categoria DescubraSul → Google Product Category (IDs numéricos)
# Taxonomia completa: https://www.google.com/basepages/producttype/taxonomy-with-ids.pt-BR.txt
# Atualizar se novas categorias forem adicionadas em categorias/migrations/0002_seed_categorias.py

CATEGORIA_GMC: dict[str, int | None] = {
    "restaurantes": 1689,   # Food, Beverages & Tobacco > Food Items
    "alimentacao":  1689,   # Food, Beverages & Tobacco > Food Items
    "moda":         1604,   # Apparel & Accessories > Clothing
    "estetica":     2036,   # Health & Beauty > Personal Care > Skin Care
    "academias":    990,    # Sporting Goods > Exercise & Fitness
    "pet_shop":     1,      # Animals & Pet Supplies
    "clinicas":     491,    # Health & Beauty
    "educacao":     783,    # Media > Books (aproximação — sem categoria ideal para cursos)
    "lojas_gerais": None,   # Genérico demais — Google classificará automaticamente
    "servicos":     None,   # Serviços não têm categoria direta no GMC
}
