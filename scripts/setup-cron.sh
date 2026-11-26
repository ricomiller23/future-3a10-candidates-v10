#!/usr/bin/env bash

# Setup Automated Cron Job for FUTURE 3a10candidates
# Schedule: Every morning at 8:00 AM EST (5:00 AM PST)

PROJECT_DIR="/Users/ericmiller/.gemini/antigravity-ide/scratch/future-3a10-candidates"
NODE_PATH=$(which node || echo "/usr/local/bin/node")

# 5:00 AM PST = 8:00 AM EST
CRON_JOB="0 5 * * * cd ${PROJECT_DIR} && ${NODE_PATH} scripts/daily-sec-scanner.js >> logs/cron.log 2>&1"

(crontab -l 2>/dev/null | grep -v "daily-sec-scanner.js"; echo "$CRON_JOB") | crontab -

echo "Cron job scheduled successfully: Every morning at 8:00 AM EST (5:00 AM PST)"
