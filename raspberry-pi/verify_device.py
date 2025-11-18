#!/usr/bin/env python3
"""
Verify Device Registration in DynamoDB
Checks if a device was successfully registered in the DeviceRegistry table
"""

import json
import sys
from dynamodb_client import DynamoDBClient

def main():
    # Load config
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load config.json: {e}")
        sys.exit(1)

    device_id = config.get('device_id')
    if not device_id:
        print("[ERROR] No device_id found in config.json")
        sys.exit(1)

    # Initialize DynamoDB client
    try:
        dynamodb = DynamoDBClient(
            region_name=config.get("aws_region", "us-east-1"),
            aws_access_key_id=config.get("aws_access_key_id"),
            aws_secret_access_key=config.get("aws_secret_access_key")
        )
        print(f"[INFO] Connected to DynamoDB (Region: {config.get('aws_region')})")
    except Exception as e:
        print(f"[ERROR] Failed to connect to DynamoDB: {e}")
        sys.exit(1)

    # Check if device exists in registry
    print(f"\nChecking registration for device: {device_id}")
    print("-" * 60)
    
    try:
        key = dynamodb.create_device_registry_key(device_id)
        response = dynamodb.device_registry.get_item(Key=key)
        
        if 'Item' in response:
            device = response['Item']
            print("[SUCCESS] Device found in registry!")
            print("\nDevice Details:")
            print(f"  Device ID:     {device.get('deviceId')}")
            print(f"  Display Name:  {device.get('displayName')}")
            print(f"  Status:        {device.get('status')}")
            print(f"  Registered At: {device.get('registeredAt')}")
            print(f"  Linked To:     {device.get('linkedToUser', 'Not linked')}")
            
            if device.get('ipAddress'):
                print(f"  IP Address:    {device.get('ipAddress')}")
            if device.get('macAddress'):
                print(f"  MAC Address:   {device.get('macAddress')}")
            
            # Check if device is linked
            if device.get('linkedToUser'):
                print(f"\n[INFO] Device is linked to user: {device.get('linkedToUser')}")
                print(f"[INFO] Display ID: {device.get('linkedDisplayId')}")
            else:
                print("\n[INFO] Device is registered but not yet linked to a user")
                print("[INFO] Use the PanelSena dashboard to link this device")
        else:
            print("[ERROR] Device NOT found in registry!")
            print("\nPossible causes:")
            print("  1. Device registration failed silently")
            print("  2. Wrong AWS credentials or region")
            print("  3. DynamoDB table doesn't exist")
            print("  4. Insufficient IAM permissions")
            
            # Try to list all items to check if table is accessible
            print("\n[INFO] Attempting to scan DeviceRegistry table...")
            try:
                response = dynamodb.device_registry.scan(Limit=5)
                item_count = response.get('Count', 0)
                print(f"[INFO] Table is accessible. Found {item_count} items.")
                
                if item_count == 0:
                    print("[INFO] Table is empty. No devices registered yet.")
                else:
                    print("[INFO] Table has devices, but this device is not among them.")
                    print("\nRegistered devices:")
                    for item in response.get('Items', []):
                        print(f"  - {item.get('deviceId')} ({item.get('displayName')})")
            except Exception as scan_error:
                print(f"[ERROR] Cannot access table: {scan_error}")
                
    except Exception as e:
        print(f"[ERROR] Failed to check device registration: {e}")
        print("\nPlease verify:")
        print("  1. AWS credentials are correct")
        print("  2. AWS region is correct (currently: {})".format(config.get('aws_region')))
        print("  3. DynamoDB tables exist in the specified region")
        print("  4. IAM user has necessary permissions")
        sys.exit(1)

if __name__ == "__main__":
    main()
