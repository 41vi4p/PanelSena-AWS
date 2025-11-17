# EC2 Deployment Setup

## Required GitHub Secrets

Before deploying, you need to set up the following secrets in your GitHub repository:

### EC2 Connection Secrets
- `EC2_HOST`: Your EC2 instance public IP or DNS name
- `EC2_USERNAME`: SSH username (usually `ubuntu` for Ubuntu instances)
- `EC2_SSH_KEY`: Private SSH key for connecting to EC2 (generate with `ssh-keygen`)
- `EC2_PORT`: SSH port (optional, defaults to 22)

### AWS Configuration Secrets
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region (e.g., `us-east-1`)
- `DYNAMODB_TABLE_NAME`: DynamoDB table name (e.g., `panelsena-devices`)

## Setting up Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret listed above

## EC2 Instance Setup

Your EC2 instance should have:
- Ubuntu 20.04+ or Amazon Linux 2+
- SSH access configured
- Security group allowing inbound traffic on port 3000 (Next.js default)

## Deployment Process

The workflow will:
1. Build your Next.js application
2. Create a deployment package
3. SSH into your EC2 instance
4. Install Node.js and pnpm if needed
5. Deploy and start the application as a systemd service
6. Verify the deployment

## Manual Deployment

You can also trigger deployment manually:
1. Go to Actions tab in GitHub
2. Select "Deploy to EC2" workflow
3. Click "Run workflow"

## Troubleshooting

- Check the workflow logs for detailed error messages
- Ensure your EC2 security group allows HTTP traffic on port 3000
- Verify SSH key has correct permissions (`chmod 600 ~/.ssh/id_rsa`)
- Check systemd service status: `sudo systemctl status panel-sena`