#!/bin/bash

# Load environment variables from Laravel's .env file
ENV_FILE="/var/www/garg-enterprises/backend/.env"
if [ -f "$ENV_FILE" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        if [[ "$line" =~ ^# ]] || [[ -z "$line" ]]; then
            continue
        fi
        # Export the variable
        export "$line"
    done < "$ENV_FILE"
fi

# Configuration
BACKUP_DIR="/var/backups/postgres"
CONTAINER_NAME="ge_postgres"
DB_NAME="${DB_DATABASE:-garg_inventory}"
DB_USER="${DB_USERNAME:-garg_admin}"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# R2 Backup Bucket name (defaults to garg-inventory-backups)
R2_BUCKET="garg-inventory-backups"
export AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}"
export AWS_DEFAULT_REGION="${R2_DEFAULT_REGION:-auto}"

# Ensure local backup directory exists
mkdir -p "$BACKUP_DIR"

# Check if the container is running
if [ "$(docker inspect -f '{{.State.Running}}' $CONTAINER_NAME 2>/dev/null)" != "true" ]; then
    echo "[$(date)] Error: Container $CONTAINER_NAME is not running. Script aborted." >> /var/log/garg_backup.log
    exit 1
fi

# 1. Run PostgreSQL dump inside container
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "[$(date)] Error: pg_dump failed." >> /var/log/garg_backup.log
    rm -f "$BACKUP_FILE"
    exit 1
fi

# 2. Compress the dump file
gzip -9 "$BACKUP_FILE"

# 3. Upload to Cloudflare R2 via AWS CLI (S3 Compatibility Mode)
# If credentials are placeholder or empty, print warning and do not upload
if [[ "$AWS_ACCESS_KEY_ID" == *"placeholder"* ]] || [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$R2_ENDPOINT" ]; then
    echo "[$(date)] Backup completed locally. Upload to R2 skipped (placeholder credentials)." >> /var/log/garg_backup.log
else
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        echo "[$(date)] Error: aws-cli is not installed. Cloudflare R2 upload skipped." >> /var/log/garg_backup.log
    else
        aws s3 cp "$BACKUP_FILE.gz" "s3://$R2_BUCKET/db_backup_$TIMESTAMP.sql.gz" --endpoint-url "$R2_ENDPOINT" --no-progress
        if [ $? -eq 0 ]; then
            echo "[$(date)] Backup uploaded successfully to Cloudflare R2." >> /var/log/garg_backup.log
        else
            echo "[$(date)] Error: Cloudflare R2 upload failed." >> /var/log/garg_backup.log
        fi
    fi
fi

# 4. Clean up local backups older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;

# Log action
echo "[$(date)] Backup process completed: db_backup_$TIMESTAMP.sql.gz" >> /var/log/garg_backup.log
