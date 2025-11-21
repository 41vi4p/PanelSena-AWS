# AWS Setup Guide for PanelSena

This guide will help you set up AWS services for your PanelSena digital signage platform.

## Prerequisites

- AWS Account ([Sign up](https://aws.amazon.com/))
- AWS CLI installed (optional, for command-line access)
- Basic knowledge of AWS services

## AWS Services Required

PanelSena uses the following AWS services:
- **DynamoDB** - NoSQL database for device management and real-time operations
- **S3** - File storage for content uploads
- **IAM** - Identity and access management

## Step 1: Create DynamoDB Table

### Using AWS Console

1. Go to [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click **Create table**
3. Configure table settings:
   - **Table name**: `panelsena-devices`
   - **Primary key**: `device_id` (String)
   - **Sort key**: `data_type` (String)
4. Enable **DynamoDB Streams** (optional, for advanced monitoring)
5. Click **Create**

### Using AWS CLI

```bash
aws dynamodb create-table \
  --table-name panelsena-devices \
  --attribute-definitions \
    AttributeName=device_id,AttributeType=S \
    AttributeName=data_type,AttributeType=S \
  --key-schema \
    AttributeName=device_id,KeyType=HASH \
    AttributeName=data_type,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

## Step 2: Enable TTL (Time To Live)

TTL automatically deletes expired items to manage storage costs.

1. In DynamoDB Console, select your `panelsena-devices` table
2. Go to **Additional settings** → **TTL**
3. Click **Enable TTL**
4. Set **TTL attribute name** to `ttl`
5. Click **Enable TTL**

TTL is used for:
- Command expiration (commands older than 1 hour)
- Status cleanup (old status updates)
- Temporary data management

## Step 3: Create S3 Bucket

### Using AWS Console

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Configure bucket:
   - **Bucket name**: Choose a unique name (e.g., `panelsena-content-12345`)
   - **Region**: Select your preferred region
   - **Block all public access**: Keep enabled for security
4. Click **Create bucket**

### Using AWS CLI

```bash
aws s3 mb s3://panelsena-content-$(date +%s) --region us-east-1
```

## Step 4: Create IAM User and Policy

### Create IAM Policy

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Policies** → **Create policy**
3. Select **JSON** tab and paste:

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
      "Resource": "arn:aws:dynamodb:*:*:table/panelsena-devices"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

4. Replace `your-bucket-name` with your actual S3 bucket name
5. Click **Next**
6. Name the policy: `PanelSenaAccess`
7. Click **Create policy**

### Create IAM User

1. In IAM Console, click **Users** → **Create user**
2. Set **User name**: `panelsena-user`
3. Select **Provide user access to the AWS Management Console** (optional)
4. Click **Next**
5. Attach the `PanelSenaAccess` policy
6. Click **Next** → **Create user**

### Generate Access Keys

1. Select the new user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Choose **Application running outside AWS**
5. Click **Create access key**
6. **Save the Access Key ID and Secret Access Key securely**

## Step 5: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=panelsena-devices
S3_BUCKET_NAME=your-bucket-name

# Optional: For production deployments
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Step 6: Test AWS Configuration

### Test DynamoDB Connection

Run this in your Next.js project:

```bash
npm run dev
```

Check browser console for any AWS errors.

### Test S3 Access

Upload a test file through the PanelSena dashboard to verify S3 connectivity.

## Security Best Practices

### IAM Permissions

- Use least privilege principle
- Rotate access keys every 90 days
- Use IAM roles for EC2 instances instead of access keys
- Enable MFA for AWS account

### DynamoDB Security

- Use TTL to automatically clean up old data
- Implement proper partition key design
- Monitor with CloudWatch for unusual activity
- Use DynamoDB encryption at rest

### S3 Security

- Keep buckets private (no public access)
- Use signed URLs for content access
- Enable versioning for backup
- Set up lifecycle policies for cost optimization

## Cost Optimization

### DynamoDB

- Use on-demand pricing for variable workloads
- Enable TTL to reduce storage costs
- Monitor read/write capacity usage

### S3

- Use appropriate storage classes (Standard, IA, Glacier)
- Set up lifecycle policies to move old content
- Monitor storage costs and access patterns

## Monitoring and Logging

### CloudWatch

Set up CloudWatch alarms for:
- DynamoDB throttling events
- S3 bucket size limits
- Unusual access patterns

### AWS Budgets

Create budgets to monitor AWS costs and set up alerts.

## Troubleshooting

### Common Issues

#### Access Denied Errors

1. Check IAM permissions
2. Verify access keys are correct
3. Ensure region matches your resources

#### DynamoDB Connection Issues

1. Verify table name and region
2. Check VPC/security group settings
3. Confirm IAM user has DynamoDB permissions

#### S3 Upload Failures

1. Verify bucket exists and permissions
2. Check bucket region matches your config
3. Ensure bucket is not public (should be private)

### Debugging Tools

- **AWS CLI**: Test permissions with `aws sts get-caller-identity`
- **CloudWatch Logs**: Check for detailed error messages
- **DynamoDB Console**: Query table directly for debugging
- **S3 Console**: Verify bucket contents and permissions

## Next Steps

Once AWS is configured:

1. **Deploy your application** to EC2 or Vercel
2. **Set up Raspberry Pi devices** using the quick start guide
3. **Test end-to-end functionality** with real devices
4. **Monitor costs and performance** using AWS Console

## Support

For AWS-specific issues:
- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Support](https://aws.amazon.com/support/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)

For PanelSena-specific issues:
- Check the troubleshooting section in main README
- Open an issue on GitHub</content>
<parameter name="filePath">/home/davidporathur/Documents/PanelSena-AWS/AWS_SETUP.md