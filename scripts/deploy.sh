#!/usr/bin/env bash
set -euo pipefail

#
# AuraMi.AI — Manual Deployment Script
#
# Usage:
#   ./scripts/deploy.sh                    # Deploy current branch
#   ./scripts/deploy.sh --env production   # Deploy to production
#   ./scripts/deploy.sh --env staging      # Deploy to staging
#   ./scripts/deploy.sh --skip-migrate     # Skip DB migrations
#   ./scripts/deploy.sh --only-migrate     # Only run migrations
#

ENV="staging"
SKIP_MIGRATE=false
ONLY_MIGRATE=false
BRANCH=$(git branch --show-current)

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)         ENV="$2"; shift 2 ;;
    --skip-migrate) SKIP_MIGRATE=true; shift ;;
    --only-migrate) ONLY_MIGRATE=true; shift ;;
    --branch)      BRANCH="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: ./scripts/deploy.sh [options]"
      echo ""
      echo "Options:"
      echo "  --env <staging|production>  Target environment (default: staging)"
      echo "  --skip-migrate              Skip database migrations"
      echo "  --only-migrate              Only run database migrations"
      echo "  --branch <name>             Git branch to deploy (default: current)"
      echo ""
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo ""
echo "========================================"
echo "  AuraMi.AI Deployment"
echo "========================================"
echo "  Environment: $ENV"
echo "  Branch:      $BRANCH"
echo "  Migrate:     $([ "$SKIP_MIGRATE" = true ] && echo 'skip' || echo 'yes')"
echo "========================================"
echo ""

# ─── Validate ─────────────────────────────────
if [ -z "${AMPLIFY_APP_ID:-}" ]; then
  echo "ERROR: AMPLIFY_APP_ID is not set."
  echo "Set it in your environment or .env.local"
  exit 1
fi

if [ -z "${AWS_REGION:-}" ]; then
  echo "ERROR: AWS_REGION is not set."
  exit 1
fi

# ─── Step 1: Build ────────────────────────────
if [ "$ONLY_MIGRATE" = false ]; then
  echo "[1/4] Building Next.js..."
  npm run build
  echo "      Build complete."
  echo ""
fi

# ─── Step 2: Run Migrations ──────────────────
if [ "$SKIP_MIGRATE" = false ]; then
  echo "[2/4] Running database migrations..."

  if [ -z "${DB_HOST:-}" ]; then
    echo "      WARNING: DB_HOST not set, skipping migrations."
    echo "      Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD to enable."
  else
    node scripts/migrate.mjs
  fi
  echo ""
fi

if [ "$ONLY_MIGRATE" = true ]; then
  echo "Done (migrations only)."
  exit 0
fi

# ─── Step 3: Push to GitHub ───────────────────
echo "[3/4] Pushing to GitHub..."
git push origin "$BRANCH"
echo "      Pushed."
echo ""

# ─── Step 4: Trigger Amplify Deploy ──────────
echo "[4/4] Triggering AWS Amplify deployment..."

JOB_ID=$(aws amplify start-job \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name "$BRANCH" \
  --job-type RELEASE \
  --region "$AWS_REGION" \
  --query 'jobSummary.jobId' \
  --output text)

echo "      Amplify job started: $JOB_ID"
echo ""

# Poll for status
echo "      Waiting for deployment to complete..."
MAX_ATTEMPTS=60
for i in $(seq 1 $MAX_ATTEMPTS); do
  STATUS=$(aws amplify get-job \
    --app-id "$AMPLIFY_APP_ID" \
    --branch-name "$BRANCH" \
    --job-id "$JOB_ID" \
    --region "$AWS_REGION" \
    --query 'job.summary.status' \
    --output text)

  if [ "$STATUS" = "SUCCEED" ]; then
    echo ""
    echo "========================================"
    echo "  Deployment SUCCEEDED"
    echo "  Branch: $BRANCH"
    echo "  Job ID: $JOB_ID"
    echo "========================================"
    echo ""
    exit 0
  fi

  if [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
    echo ""
    echo "========================================"
    echo "  Deployment FAILED"
    echo "  Status: $STATUS"
    echo "  Job ID: $JOB_ID"
    echo "========================================"
    echo ""
    echo "Check the Amplify console for details."
    exit 1
  fi

  printf "      Status: %s (%d/%d)\r" "$STATUS" "$i" "$MAX_ATTEMPTS"
  sleep 10
done

echo ""
echo "Deployment timed out after 10 minutes."
echo "Check the Amplify console for job: $JOB_ID"
exit 1
