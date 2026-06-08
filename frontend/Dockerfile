FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
