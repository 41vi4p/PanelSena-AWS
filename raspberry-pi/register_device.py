#!/usr/bin/env python3
"""
Register Device in DynamoDB
Registers a device from config.json into the DynamoDB device registry
"""

import json
import sys
from dynamodb_client import DynamoDBClient

def main():
    print("=" * 60)
    print("PanelSena Device Registration")
    print("=" * 60)
    print()

    # Load config
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load config.json: {e}")
        sys.exit(1)

    # Get device credentials
    device_id = config.get('device_id')
    device_key = config.get('device_key')
    display_name = config.get('display_name', 'Raspberry Pi Display')

    if not device_id or not device_key:
        print("[ERROR] device_id and device_key must be set in config.json")
        print("Run generate_device_credentials.py first to generate credentials")
        sys.exit(1)

    print(f"Device ID:   {device_id}")
    print(f"Device Key:  {device_key[:8]}...")
    print(f"Display Name: {display_name}")
    print()

    # Initialize DynamoDB client
    try:
        dynamodb = DynamoDBClient(
            region_name=config.get("aws_region", "us-east-1"),
            aws_access_key_id=config.get("aws_access_key_id"),
            aws_secret_access_key=config.get("aws_secret_access_key")
        )
        print("[INFO] Connected to DynamoDB")
    except Exception as e:
        print(f"[ERROR] Failed to connect to DynamoDB: {e}")
        sys.exit(1)

    # Register device
    print()
    print("Registering device in DynamoDB...")
    success = dynamodb.register_device(
        device_id=device_id,
        device_key=device_key,
        display_name=display_name
    )

    if success:
        print()
        print("=" * 60)
        print("✓ Device registered successfully!")
        print("=" * 60)
        print()
        print("NEXT STEPS:")
        print("1. Go to PanelSena dashboard → Displays → Add Display")
        print("2. Enter the following credentials:")
        print(f"   Device ID:  {device_id}")
        print(f"   Device Key: {device_key}")
        print("3. This will link the device to your user account")
        print()
    else:
        print()
        print("[ERROR] Failed to register device")
        print("Check your AWS credentials and DynamoDB table permissions")
        sys.exit(1)

if __name__ == "__main__":
    main()
