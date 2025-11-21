# DynamoDB Setup Guide for PanelSena

This guide will help you set up Amazon DynamoDB to replace Firebase Realtime Database in your PanelSena application.

## Prerequisites

1. An AWS account
2. AWS CLI installed (optional, but recommended)
3. Your application deployed or ready to deploy

## Step 1: Create DynamoDB Tables

### Option A: Using AWS Management Console (Web Interface)

1. **Sign in to AWS Management Console**
   - Go to https://console.aws.amazon.com/
   - Sign in with your AWS account

2. **Navigate to DynamoDB**
   - Search for "DynamoDB" in the search bar
   - Click on "DynamoDB" to open the service

3. **Create Tables**

   You'll need to create 4 tables:

   #### Table 1: Display Status Table
   - **Table name**: `PanelSena-DisplayStatus` (or set `DYNAMODB_DISPLAY_STATUS_TABLE` env var)
   - **Primary key**:
     - Partition key: `pk` (String)
     - Sort key: `sk` (String)
   - **Settings**:
     - Uncheck "Use default settings"
     - **Capacity mode**: On-demand (pay per request)
     - **Encryption**: Default (AWS managed)

   #### Table 2: Playback Commands Table
   - **Table name**: `PanelSena-PlaybackCommands` (or set `DYNAMODB_COMMANDS_TABLE` env var)
   - **Primary key**:
     - Partition key: `pk` (String)
     - Sort key: `sk` (String)
   - **Settings**: Same as above
   - **TTL (Time to Live)**: Enable TTL on the `ttl` attribute

   #### Table 3: Device Registry Table
   - **Table name**: `PanelSena-DeviceRegistry` (or set `DYNAMODB_DEVICE_REGISTRY_TABLE` env var)
   - **Primary key**:
     - Partition key: `pk` (String)
     - Sort key: `sk` (String)
   - **Settings**: Same as above

   #### Table 4: Device Links Table
   - **Table name**: `PanelSena-DeviceLinks` (or set `DYNAMODB_DEVICE_LINKS_TABLE` env var)
   - **Primary key**:
     - Partition key: `pk` (String)
     - Sort key: `sk` (String)
   - **Settings**: Same as above

### Option B: Using AWS CLI

If you prefer using the command line, you can create the tables with these commands:

```bash
# Display Status Table
aws dynamodb create-table \
  --table-name PanelSena-DisplayStatus \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Playback Commands Table
aws dynamodb create-table \
  --table-name PanelSena-PlaybackCommands \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES

# Enable TTL on Playback Commands Table
aws dynamodb update-table \
  --table-name PanelSena-PlaybackCommands \
  --time-to-live-specification \
    AttributeName=ttl,Enabled=true

# Device Registry Table
aws dynamodb create-table \
  --table-name PanelSena-DeviceRegistry \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

# Device Links Table
aws dynamodb create-table \
  --table-name PanelSena-DeviceLinks \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

## Step 2: Create IAM User/Role for Application Access

### Option A: Using AWS Management Console

1. **Navigate to IAM**
   - Search for "IAM" in the search bar
   - Click on "IAM" to open the service

2. **Create a Policy**
   - Click on "Policies" in the left sidebar
   - Click "Create policy"
   - Select "JSON" tab and paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/PanelSena-DisplayStatus",
        "arn:aws:dynamodb:*:*:table/PanelSena-PlaybackCommands",
        "arn:aws:dynamodb:*:*:table/PanelSena-DeviceRegistry",
        "arn:aws:dynamodb:*:*:table/PanelSena-DeviceLinks"
      ]
    }
  ]
}
```

   - Click "Next"
   - Name: `PanelSena-DynamoDB-Policy`
   - Click "Create policy"

3. **Create IAM User**
   - Click on "Users" in the left sidebar
   - Click "Create user"
   - User name: `panelsena-app-user`
   - Click "Next"
   - Select "Attach policies directly"
   - Search for and select `PanelSena-DynamoDB-Policy`
   - Click "Next"
   - Click "Create user"

4. **Create Access Keys**
   - In the user details, go to "Security credentials" tab
   - Under "Access keys", click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next"
   - Click "Create access key"
   - **IMPORTANT**: Save the Access Key ID and Secret Access Key

### Option B: Using AWS CLI

```bash
# Create the policy
aws iam create-policy \
  --policy-name PanelSena-DynamoDB-Policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        "Resource": [
          "arn:aws:dynamodb:*:*:table/PanelSena-DisplayStatus",
          "arn:aws:dynamodb:*:*:table/PanelSena-PlaybackCommands",
          "arn:aws:dynamodb:*:*:table/PanelSena-DeviceRegistry",
          "arn:aws:dynamodb:*:*:table/PanelSena-DeviceLinks"
        ]
      }
    ]
  }'

# Create IAM user
aws iam create-user --user-name panelsena-app-user

# Attach policy to user
aws iam attach-user-policy \
  --user-name panelsena-app-user \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/PanelSena-DynamoDB-Policy

# Create access keys
aws iam create-access-key --user-name panelsena-app-user
```

## Step 3: Configure Environment Variables

Add these environment variables to your application:

```bash
# AWS Configuration
AWS_REGION=us-east-1  # Change to your preferred region
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# DynamoDB Table Names (optional, defaults provided)
DYNAMODB_DISPLAY_STATUS_TABLE=PanelSena-DisplayStatus
DYNAMODB_COMMANDS_TABLE=PanelSena-PlaybackCommands
DYNAMODB_DEVICE_REGISTRY_TABLE=PanelSena-DeviceRegistry
DYNAMODB_DEVICE_LINKS_TABLE=PanelSena-DeviceLinks
```

## Step 4: Update Raspberry Pi Configuration

Since the Raspberry Pi code still uses Firebase, you'll need to update it to use DynamoDB as well. The current migration only covers the backend API.

For the Raspberry Pi devices, you have a few options:

1. **Keep Firebase for device communication** (hybrid approach)
2. **Migrate Raspberry Pi to use DynamoDB** (requires updating the Python code)
3. **Use AWS IoT Core** for device communication (recommended for production)

## Step 5: Test the Migration

1. Deploy your updated application
2. Test display registration and linking
3. Test sending playback commands
4. Monitor DynamoDB tables for data consistency

## Cost Estimation

- **DynamoDB On-Demand**: ~$1.25 per million requests
- **Data storage**: ~$0.25 per GB/month
- **Data transfer**: Usually covered by AWS free tier for small applications

## Monitoring and Maintenance

1. **CloudWatch**: Set up alarms for DynamoDB throttling
2. **DynamoDB Streams**: Enable for change data capture if needed
3. **Backup**: Configure automated backups for production data

## Troubleshooting

- **Access Denied**: Check IAM permissions and environment variables
- **Table Not Found**: Verify table names and AWS region
- **Throttling**: Consider switching to provisioned capacity for high-traffic applications

## Security Best Practices

1. Use IAM roles instead of access keys when possible
2. Enable DynamoDB encryption at rest
3. Use VPC endpoints for enhanced security
4. Regularly rotate access keys
5. Monitor access patterns with CloudTrail