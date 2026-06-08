FROM python:3.12-slim

# Dependências do sistema (inclui libmagic para validação de uploads)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Coletar arquivos estáticos
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000
