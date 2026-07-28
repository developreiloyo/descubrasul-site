#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "google-auth>=2.35.0",
#   "requests>=2.32.0",
#   "python-dotenv>=1.0",
# ]
# ///
"""
Registro único do projeto GCP no Google Merchant Center (Merchant API v1).

Execução:
    uv run tools/gmc-mcp/register_developer.py

Pré-requisitos:
  - ~/.config/descubrasul/.env.gmc com GMC_SERVICE_ACCOUNT_JSON e GMC_MERCHANT_ID
  - Conta de serviço com role Administrador no Merchant Center (pode rebaixar depois)

Após sucesso: rebaixar merchant-center-sync para Estándar no Merchant Center.
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from google.auth.transport.requests import AuthorizedSession
from google.oauth2 import service_account

# ── Config ────────────────────────────────────────────────────────────────────

ENV_FILE = Path.home() / ".config/descubrasul/.env.gmc"
load_dotenv(ENV_FILE)

MERCHANT_ID        = os.environ["GMC_MERCHANT_ID"]
GCP_PROJECT_NUMBER = "562478645521"
DEVELOPER_EMAIL    = "eagleconsultoria2025@gmail.com"

# ── Auth ──────────────────────────────────────────────────────────────────────

info = json.loads(os.environ["GMC_SERVICE_ACCOUNT_JSON"])
print(f"service_account : {info['client_email']}")
print(f"merchant_id     : {MERCHANT_ID}")
print(f"gcp_project     : {GCP_PROJECT_NUMBER}")
print(f"developer_email : {DEVELOPER_EMAIL}")
print()

creds = service_account.Credentials.from_service_account_info(
    info, scopes=["https://www.googleapis.com/auth/content"]
)
session = AuthorizedSession(creds)

# ── Chamada ───────────────────────────────────────────────────────────────────

url = (
    f"https://merchantapi.googleapis.com/accounts/v1"
    f"/accounts/{MERCHANT_ID}/developerRegistration:registerGcp"
)
body = {
    "project":        f"projects/{GCP_PROJECT_NUMBER}",
    "developerEmail": DEVELOPER_EMAIL,
}

print(f"POST {url}")
print(f"body: {json.dumps(body, indent=2)}")
print()

r = session.post(url, json=body, timeout=15)

print(f"HTTP {r.status_code}")
print(r.text)
