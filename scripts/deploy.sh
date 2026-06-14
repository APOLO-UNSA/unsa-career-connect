#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh – Script de despliegue para AWS EC2
# Ejecutar con: bash scripts/deploy.sh [DOMINIO]
# Ejemplo:      bash scripts/deploy.sh careerconnect.unsa.edu.pe
# ─────────────────────────────────────────────────────────────────────────────

set -e

DOMAIN=${1:-"tu-dominio.com"}
APP_DIR="/opt/unsa-career-connect"
REPO_URL="https://github.com/tu-usuario/unsa-career-connect.git"  # Cambiar

echo "============================================================"
echo " UNSA Career Connect – Despliegue en AWS EC2"
echo " Dominio: $DOMAIN"
echo "============================================================"

# ─── 1. Actualizar sistema ────────────────────────────────────────────────────
echo "[1/7] Actualizando sistema..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ─── 2. Instalar Docker y Docker Compose ─────────────────────────────────────
echo "[2/7] Instalando Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker ubuntu
  rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

docker --version
docker-compose --version

# ─── 3. Clonar / Actualizar repositorio ──────────────────────────────────────
echo "[3/7] Clonando repositorio..."
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  sudo git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi
sudo chown -R ubuntu:ubuntu "$APP_DIR"

# ─── 4. Configurar variables de entorno ──────────────────────────────────────
echo "[4/7] Configurando .env..."
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"

  # Generar NEXTAUTH_SECRET automáticamente
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
  DB_PASSWORD=$(openssl rand -base64 16 | tr -d '/')

  sed -i "s|your-super-secret-key-change-in-production|$NEXTAUTH_SECRET|g" "$APP_DIR/.env"
  sed -i "s|changeme_in_prod|$DB_PASSWORD|g" "$APP_DIR/.env"
  sed -i "s|http://localhost:3000|https://$DOMAIN|g" "$APP_DIR/.env"

  echo ""
  echo "⚠️  IMPORTANTE: Edita $APP_DIR/.env y completa:"
  echo "   - GROQ_API_KEY (obtener en console.groq.com)"
  echo "   - SMTP_* (configuración de email)"
  echo ""
  read -p "Presiona Enter cuando hayas editado el .env..."
fi

# ─── 5. Actualizar nginx.conf con el dominio ─────────────────────────────────
echo "[5/7] Configurando Nginx con dominio $DOMAIN..."
sed -i "s/tu-dominio.com/$DOMAIN/g" "$APP_DIR/nginx/nginx.conf"

# ─── 6. Obtener certificado SSL (Let's Encrypt) ──────────────────────────────
echo "[6/7] Configurando SSL con Let's Encrypt..."

# Primero iniciar nginx en modo HTTP-only para el desafío ACME
docker-compose -f "$APP_DIR/docker-compose.yml" up -d db nginx

# Esperar que nginx arranque
sleep 10

# Solicitar certificado
docker run --rm \
  -v "$APP_DIR/certbot/certs:/etc/letsencrypt" \
  -v "$APP_DIR/certbot/webroot:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  --email admin@${DOMAIN} \
  --agree-tos --no-eff-email \
  -d "$DOMAIN" -d "www.$DOMAIN" || echo "⚠️ SSL ya configurado o error"

# ─── 7. Iniciar todos los servicios ──────────────────────────────────────────
echo "[7/7] Iniciando todos los servicios..."
cd "$APP_DIR"
docker-compose up -d --build

# Esperar que la app inicie
echo "Esperando que la aplicación inicie..."
sleep 30

# Verificar
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
  echo ""
  echo "============================================================"
  echo " ✅ Despliegue exitoso!"
  echo " 🌐 La plataforma está disponible en: https://$DOMAIN"
  echo "============================================================"
else
  echo ""
  echo "⚠️ La aplicación puede estar iniciándose. Verifica en:"
  echo "   docker-compose logs -f app"
fi

# ─── Configurar renovación automática de SSL ─────────────────────────────────
(crontab -l 2>/dev/null; echo "0 12 * * * cd $APP_DIR && docker-compose run --rm certbot renew --quiet && docker-compose exec nginx nginx -s reload") | crontab -

echo ""
echo "Comandos útiles:"
echo "  Ver logs:     cd $APP_DIR && docker-compose logs -f"
echo "  Reiniciar:    cd $APP_DIR && docker-compose restart"
echo "  Actualizar:   cd $APP_DIR && git pull && docker-compose up -d --build"
