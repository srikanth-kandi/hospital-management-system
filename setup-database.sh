#!/bin/bash

# Database Setup Script for Hospital Management System
# PostgreSQL Installation and Configuration

set -e

echo "🗄️ Setting up PostgreSQL Database for HMS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Database configuration
DB_NAME="hms_db"
DB_USER="hms_user"
DB_PASSWORD="hms_secure_password_2024"
DB_HOST="localhost"
DB_PORT="5432"

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
print_status "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user and database
print_status "Creating database user and database..."
sudo -u postgres psql << EOF
-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT CREATE ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $DB_USER;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;

-- Exit
\q
EOF

# Configure PostgreSQL for remote connections (if needed)
print_status "Configuring PostgreSQL for connections..."

# Backup original configuration
sudo cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Update postgresql.conf
sudo tee -a /etc/postgresql/*/main/postgresql.conf > /dev/null <<EOF

# HMS Database Configuration
listen_addresses = 'localhost'
port = $DB_PORT
max_connections = 100
shared_buffers = 128MB
effective_cache_size = 4GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
EOF

# Update pg_hba.conf for local connections
sudo tee -a /etc/postgresql/*/main/pg_hba.conf > /dev/null <<EOF

# HMS Database Access
local   $DB_NAME    $DB_USER                     md5
host    $DB_NAME    $DB_USER    127.0.0.1/32     md5
host    $DB_NAME    $DB_USER    ::1/128          md5
EOF

# Restart PostgreSQL
print_status "Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Test database connection
print_status "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" || {
    print_error "Database connection failed!"
    exit 1
}

# Create .env file for backend
print_status "Creating backend environment file..."
sudo tee /var/www/hms/.env > /dev/null <<EOF
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=$DB_NAME

# JWT Configuration
JWT_SECRET=hms_jwt_secret_key_$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://hms.srikanthkandi.tech

# Logging
LOG_LEVEL=info
EOF

# Set proper permissions
sudo chown -R $USER:$USER /var/www/hms
sudo chmod 600 /var/www/hms/.env

# Create database backup script
print_status "Creating database backup script..."
tee backup-database.sh > /dev/null <<EOF
#!/bin/bash

# Database Backup Script
BACKUP_DIR="/var/backups/hms-database"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hms_backup_\$DATE.sql"

echo "🗄️ Creating database backup..."

# Create backup directory
sudo mkdir -p \$BACKUP_DIR

# Create backup
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > \$BACKUP_FILE

# Move to backup directory
sudo mv \$BACKUP_FILE \$BACKUP_DIR/

# Compress backup
sudo gzip \$BACKUP_DIR/\$BACKUP_FILE

# Keep only last 7 days of backups
sudo find \$BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup created: \$BACKUP_DIR/\$BACKUP_FILE.gz"
EOF

chmod +x backup-database.sh

# Create database restore script
print_status "Creating database restore script..."
tee restore-database.sh > /dev/null <<EOF
#!/bin/bash

# Database Restore Script
if [ -z "\$1" ]; then
    echo "Usage: ./restore-database.sh <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="\$1"

echo "🔄 Restoring database from backup..."

# Check if backup file exists
if [ ! -f "\$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: \$BACKUP_FILE"
    exit 1
fi

# Restore database
gunzip -c "\$BACKUP_FILE" | PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

echo "✅ Database restored successfully!"
EOF

chmod +x restore-database.sh

# Create cron job for daily backups
print_status "Setting up daily database backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/backup-database.sh") | crontab -

# Test database with backend
print_status "Testing database with backend application..."
cd backend

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    npm install
fi

# Build the application
npm run build

# Test database connection
print_status "Testing backend database connection..."
NODE_ENV=production node -e "
const { AppDataSource } = require('./build/config/data-source');
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connection successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });
"

print_status "Database setup completed successfully!"
echo ""
echo "🗄️ Database Information:"
echo "  Database Name: $DB_NAME"
echo "  Database User: $DB_USER"
echo "  Database Host: $DB_HOST"
echo "  Database Port: $DB_PORT"
echo ""
echo "📋 Useful commands:"
echo "  Database Backup: ./backup-database.sh"
echo "  Database Restore: ./restore-database.sh <backup_file.sql.gz>"
echo "  PostgreSQL Status: sudo systemctl status postgresql"
echo "  PostgreSQL Logs: sudo tail -f /var/log/postgresql/postgresql-*.log"
echo ""
echo "🔒 Database credentials are stored in /var/www/hms/.env"
echo "📅 Daily backups are scheduled at 2:00 AM" 