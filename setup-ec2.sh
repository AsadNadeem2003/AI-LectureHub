#!/bin/bash
# =============================================================================
# AI LectureHub — EC2 Ubuntu Automated Server Bootstrap Script
# =============================================================================
set -e

echo "🚀 [1/4] Updating Ubuntu package repositories..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# -----------------------------------------------------------------------------
# 1. Configure 4GB Virtual Swap Memory (Prevents Out-Of-Memory on Free Tier)
# -----------------------------------------------------------------------------
if [ ! -f /swapfile ]; then
  echo "💾 [2/4] Configuring 4GB Virtual Swap Memory..."
  sudo fallocate -l 4G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  sudo sysctl vm.swappiness=10
  echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
  echo "✅ 4GB Swap Memory successfully enabled!"
else
  echo "ℹ️ Swapfile already exists. Skipping swap setup."
fi

# -----------------------------------------------------------------------------
# 2. Install Official Docker Engine & Docker Compose Plugin
# -----------------------------------------------------------------------------
echo "🐳 [3/4] Installing Official Docker Engine & Compose Plugin..."
if ! command -v docker &> /dev/null; then
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  # Enable non-root docker execution
  sudo usermod -aG docker "$USER"
  sudo systemctl enable docker
  sudo systemctl start docker
  echo "✅ Docker Engine successfully installed!"
else
  echo "ℹ️ Docker is already installed."
fi

# -----------------------------------------------------------------------------
# 3. Configure Firewall (UFW)
# -----------------------------------------------------------------------------
echo "🛡️ [4/4] Configuring Firewall Rules..."
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
sudo ufw --force enable || true

echo ""
echo "============================================================================="
echo "🎉 Server Setup Complete! Total Available Working Memory (RAM + Swap): ~5 GB"
echo "============================================================================="
echo "To start your production containers, run:"
echo "  docker compose -f docker-compose.prod.yml up -d --build"
echo "============================================================================="
