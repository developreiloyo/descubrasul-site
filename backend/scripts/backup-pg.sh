#!/usr/bin/env bash
# Backup automatizado do PostgreSQL para o DescubraSul.
# Executa via cron no VPS — copiar para /opt/descubrasul/scripts/backup-pg.sh
#
# Configuração no VPS:
#   echo "0 3 * * * root /opt/descubrasul/scripts/backup-pg.sh >> /var/log/descubrasul-backup.log 2>&1" \
#     > /etc/cron.d/descubrasul-backup
#
# Requisitos:
#   - docker e docker compose instalados
#   - .env.prod no diretório COMPOSE_DIR com POSTGRES_USER, POSTGRES_DB, POSTGRES_PASSWORD
#   - awscli configurado com credenciais do R2 (se R2_BUCKET for definido)
#   - BACKUP_DIR com espaço suficiente para 7 backups locais

set -euo pipefail

COMPOSE_DIR="${COMPOSE_DIR:-/opt/descubrasul}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/descubrasul}"
RETAIN_DAYS="${RETAIN_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# R2/S3 destino — opcional. Deixar vazio para pular upload.
R2_BUCKET="${R2_BUCKET:-}"
R2_PREFIX="${R2_PREFIX:-backups/postgres}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log "Iniciando backup — ${TIMESTAMP}"

mkdir -p "${BACKUP_DIR}"

# Carrega variáveis do .env.prod sem expor no ambiente global
set -a
# shellcheck disable=SC1091
source "${COMPOSE_DIR}/.env.prod"
set +a

log "Executando pg_dump no container db..."
docker compose -f "${COMPOSE_DIR}/docker-compose.prod.yml" exec -T db \
    pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip > "${BACKUP_FILE}"

SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
log "Backup gerado: ${BACKUP_FILE} (${SIZE})"

# Upload para R2 / S3 (se configurado)
if [[ -n "${R2_BUCKET}" ]]; then
    log "Enviando para R2: s3://${R2_BUCKET}/${R2_PREFIX}/"
    aws s3 cp "${BACKUP_FILE}" "s3://${R2_BUCKET}/${R2_PREFIX}/$(basename "${BACKUP_FILE}")" \
        --endpoint-url "${R2_ENDPOINT_URL:-}" \
        --no-progress
    log "Upload concluído."
fi

# Remove backups locais com mais de RETAIN_DAYS dias
log "Limpando backups locais com mais de ${RETAIN_DAYS} dias..."
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime "+${RETAIN_DAYS}" -delete

TOTAL=$(find "${BACKUP_DIR}" -name "backup_*.sql.gz" | wc -l)
log "Backup finalizado. Arquivos locais retidos: ${TOTAL}"
