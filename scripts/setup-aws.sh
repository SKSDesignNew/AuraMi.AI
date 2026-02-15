#!/usr/bin/env bash
set -euo pipefail

#
# AuraMi.AI — AWS Infrastructure Setup
#
# This script creates all required AWS resources:
#   1. RDS PostgreSQL database
#   2. S3 bucket for family assets
#   3. Amplify app connected to GitHub
#
# Prerequisites:
#   - AWS CLI configured (aws configure)
#   - GitHub personal access token with repo scope
#
# Usage:
#   ./scripts/setup-aws.sh
#   ./scripts/setup-aws.sh --region us-east-1 --repo SKSDesignNew/AuraMi.AI
#

REGION="${AWS_REGION:-us-east-1}"
REPO=""
GITHUB_TOKEN=""
APP_NAME="aurami-ai"
DB_NAME="aurami"
DB_USER="aurami_admin"
S3_BUCKET="aurami-family-assets"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --region)       REGION="$2"; shift 2 ;;
    --repo)         REPO="$2"; shift 2 ;;
    --token)        GITHUB_TOKEN="$2"; shift 2 ;;
    --app-name)     APP_NAME="$2"; shift 2 ;;
    --db-name)      DB_NAME="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: ./scripts/setup-aws.sh [options]"
      echo ""
      echo "Options:"
      echo "  --region <region>    AWS region (default: us-east-1)"
      echo "  --repo <owner/repo>  GitHub repository"
      echo "  --token <token>      GitHub personal access token"
      echo "  --app-name <name>    Amplify app name (default: aurami-ai)"
      echo "  --db-name <name>     Database name (default: aurami)"
      echo ""
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo ""
echo "========================================"
echo "  AuraMi.AI — AWS Setup"
echo "========================================"
echo "  Region:   $REGION"
echo "  App Name: $APP_NAME"
echo "  DB Name:  $DB_NAME"
echo "  S3:       $S3_BUCKET"
echo "========================================"
echo ""

# ─── Step 1: S3 Bucket ───────────────────────
echo "[1/4] Creating S3 bucket: $S3_BUCKET"

if aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
  echo "      Bucket already exists. Skipping."
else
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$REGION"
  else
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi

  # Block public access
  aws s3api put-public-access-block --bucket "$S3_BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

  # Enable versioning
  aws s3api put-bucket-versioning --bucket "$S3_BUCKET" \
    --versioning-configuration Status=Enabled

  # CORS for browser uploads
  aws s3api put-bucket-cors --bucket "$S3_BUCKET" \
    --cors-configuration '{
      "CORSRules": [{
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedHeaders": ["*"],
        "MaxAgeSeconds": 3600
      }]
    }'

  echo "      Bucket created."
fi
echo ""

# ─── Step 2: RDS PostgreSQL ──────────────────
echo "[2/4] Creating RDS PostgreSQL instance: $APP_NAME-db"

DB_EXISTS=$(aws rds describe-db-instances \
  --db-instance-identifier "$APP_NAME-db" \
  --region "$REGION" \
  --query 'DBInstances[0].DBInstanceIdentifier' \
  --output text 2>/dev/null || echo "none")

if [ "$DB_EXISTS" != "none" ]; then
  echo "      RDS instance already exists. Skipping."
  DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "$APP_NAME-db" \
    --region "$REGION" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)
else
  # Generate a random password
  DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)

  aws rds create-db-instance \
    --db-instance-identifier "$APP_NAME-db" \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version "15.4" \
    --master-username "$DB_USER" \
    --master-user-password "$DB_PASSWORD" \
    --db-name "$DB_NAME" \
    --allocated-storage 20 \
    --storage-type gp3 \
    --publicly-accessible \
    --backup-retention-period 7 \
    --region "$REGION" \
    --no-multi-az

  echo "      RDS instance creating... (this takes 5-10 minutes)"
  echo ""
  echo "      SAVE THESE CREDENTIALS:"
  echo "      ─────────────────────────"
  echo "      DB_USER:     $DB_USER"
  echo "      DB_PASSWORD: $DB_PASSWORD"
  echo "      DB_NAME:     $DB_NAME"
  echo "      DB_PORT:     5432"
  echo "      ─────────────────────────"
  echo ""

  # Wait for the instance to be available
  echo "      Waiting for RDS to become available..."
  aws rds wait db-instance-available \
    --db-instance-identifier "$APP_NAME-db" \
    --region "$REGION"

  DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "$APP_NAME-db" \
    --region "$REGION" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

  echo "      DB_HOST: $DB_ENDPOINT"
fi
echo ""

# ─── Step 3: Amplify App ─────────────────────
echo "[3/4] Creating Amplify app: $APP_NAME"

AMPLIFY_EXISTS=$(aws amplify list-apps \
  --region "$REGION" \
  --query "apps[?name=='$APP_NAME'].appId" \
  --output text)

if [ -n "$AMPLIFY_EXISTS" ]; then
  echo "      Amplify app already exists: $AMPLIFY_EXISTS"
  AMPLIFY_APP_ID="$AMPLIFY_EXISTS"
else
  if [ -z "$REPO" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo "      To create Amplify app, provide --repo and --token:"
    echo "      ./scripts/setup-aws.sh --repo owner/repo --token ghp_xxx"
    echo "      Skipping Amplify creation."
    AMPLIFY_APP_ID=""
  else
    AMPLIFY_APP_ID=$(aws amplify create-app \
      --name "$APP_NAME" \
      --repository "https://github.com/$REPO" \
      --access-token "$GITHUB_TOKEN" \
      --build-spec "$(cat amplify.yml)" \
      --platform WEB_COMPUTE \
      --region "$REGION" \
      --query 'app.appId' \
      --output text)

    echo "      Amplify app created: $AMPLIFY_APP_ID"

    # Create main branch
    aws amplify create-branch \
      --app-id "$AMPLIFY_APP_ID" \
      --branch-name main \
      --stage PRODUCTION \
      --enable-auto-build \
      --region "$REGION" > /dev/null

    # Create staging branch
    aws amplify create-branch \
      --app-id "$AMPLIFY_APP_ID" \
      --branch-name staging \
      --stage DEVELOPMENT \
      --enable-auto-build \
      --region "$REGION" > /dev/null

    echo "      Branches created: main (production), staging (development)"
  fi
fi
echo ""

# ─── Step 4: Summary ─────────────────────────
echo "[4/4] Setup Complete!"
echo ""
echo "========================================"
echo "  AWS Resources Created"
echo "========================================"
echo ""
echo "  S3 Bucket:      $S3_BUCKET"
echo "  RDS Endpoint:   ${DB_ENDPOINT:-pending}"
echo "  RDS Database:   $DB_NAME"
echo "  RDS Username:   $DB_USER"
echo "  Amplify App ID: ${AMPLIFY_APP_ID:-not created}"
echo ""
echo "  Next Steps:"
echo "  ─────────────────────────────────────"
echo "  1. Add environment variables to Amplify console or GitHub secrets:"
echo ""
echo "     DB_HOST=${DB_ENDPOINT:-<your-rds-endpoint>}"
echo "     DB_PORT=5432"
echo "     DB_NAME=$DB_NAME"
echo "     DB_USER=$DB_USER"
echo "     DB_PASSWORD=<your-password>"
echo "     DB_SSL=true"
echo "     AWS_REGION=$REGION"
echo "     S3_BUCKET=$S3_BUCKET"
echo "     NEXTAUTH_URL=https://aurami.ai"
echo "     NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "     ANTHROPIC_API_KEY=<your-key>"
echo "     OPENAI_API_KEY=<your-key>"
if [ -n "${AMPLIFY_APP_ID:-}" ]; then
  echo "     AMPLIFY_APP_ID=$AMPLIFY_APP_ID"
fi
echo ""
echo "  2. Run database migrations:"
echo "     node scripts/migrate.mjs"
echo ""
echo "  3. Deploy:"
echo "     ./scripts/deploy.sh --env production"
echo ""
echo "========================================"
