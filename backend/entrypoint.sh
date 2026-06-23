#!/bin/sh
set -e

# ─── Esperar a Postgres ─────────────────────────────────────
# Sin esto, si el backend arranca antes que la DB, gunicorn muere
echo "→ Aguardando Postgres em ${DB_HOST:-db}:${DB_PORT:-5432}..."
until python -c "
import socket, sys, os
s = socket.socket()
s.settimeout(2)
try:
    s.connect((os.environ.get('DB_HOST', 'db'), int(os.environ.get('DB_PORT', '5432'))))
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    echo "  Postgres ainda nao esta pronto, aguardando 1s..."
    sleep 1
done
echo "✓ Postgres pronto."

# ─── Migrations ─────────────────────────────────────────────
echo "→ Aplicando migrations..."
python manage.py migrate --noinput
echo "✓ Migrations aplicadas."

# ─── Collectstatic (runtime, con envs reais) ────────────────
echo "→ Coletando static files..."
python manage.py collectstatic --noinput --clear
echo "✓ Static coletado."

# ─── Gunicorn ───────────────────────────────────────────────
# exec → gunicorn vira PID 1 e recebe SIGTERM corretamente
echo "→ Iniciando Gunicorn..."
exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers ${GUNICORN_WORKERS:-3} \
    --timeout ${GUNICORN_TIMEOUT:-120} \
    --access-logfile - \
    --error-logfile - \
    --log-level ${GUNICORN_LOG_LEVEL:-info}
