# DescubraSul

Vitrina digital regional para o Sul de Santa Catarina.

## Stack

- **Backend**: Django 5 + DRF + PostgreSQL + pgvector + Redis + Celery
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Deploy**: Docker Compose + EasyPanel

## Setup local

```bash
# 1. Clonar e entrar na pasta
git clone https://github.com/developreiloyo/descubrasul-site.git
cd descubrasul-site

# 2. Criar o .env a partir do exemplo
cp .env.example .env
# Editar .env com suas variáveis

# 3. Subir os serviços
docker compose up -d

# 4. Aplicar migrações
docker compose exec backend python manage.py migrate

# 5. Criar superusuário
docker compose exec backend python manage.py createsuperuser
```

Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin Django: http://localhost:8000/admin

## Estrutura

```
├── backend/          Django + DRF
├── frontend/         Next.js 16
├── CLAUDE.md         Instruções para Claude Code
└── .claude/          Subagentes por domínio
```
