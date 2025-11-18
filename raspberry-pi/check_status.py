#!/usr/bin/env python3
"""
Check Display Status in DynamoDB
Verifies that the display status is being written correctly to DynamoDB
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

    # Get device link to find user_id and display_id
    print(f"\nChecking device link for: {device_id}")
    print("-" * 60)
    
    try:
        link_data = dynamodb.get_device_link(device_id)
        
        if not link_data:
            print("[ERROR] Device is not linked to any user")
            print("Please link the device from the dashboard first")
            sys.exit(1)
        
        user_id = link_data.get('userId')
        display_id = link_data.get('displayId')
        
        print(f"[SUCCESS] Device is linked!")
        print(f"  User ID:    {user_id}")
        print(f"  Display ID: {display_id}")
        print()
        
        # Now check the display status
        print("Checking display status in DynamoDB...")
        print("-" * 60)
        
        key = dynamodb.create_display_status_key(user_id, display_id)
        response = dynamodb.display_status.get_item(Key=key)
        
        if 'Item' in response:
            status_item = response['Item']
            print("[SUCCESS] Display status found!")
            print("\nStatus Details:")
            print(f"  Status:         {status_item.get('status', 'N/A')}")
            print(f"  Display Name:   {status_item.get('displayName', 'N/A')}")
            print(f"  Last Heartbeat: {status_item.get('lastHeartbeat', 'N/A')}")
            print(f"  Volume:         {status_item.get('volume', 'N/A')}")
            print(f"  Brightness:     {status_item.get('brightness', 'N/A')}")
            
            if status_item.get('currentContent'):
                print(f"  Current Content: {status_item.get('currentContent')}")
            else:
                print(f"  Current Content: None")
            
            if status_item.get('schedule'):
                print(f"  Schedule:       {status_item.get('schedule')}")
            else:
                print(f"  Schedule:       None")
            
            print("\n[SUCCESS] Display status structure looks correct!")
            print("The dashboard should be able to read this data.")
            
            # Check if heartbeat is recent (within last 30 seconds)
            import time
            current_time = int(time.time() * 1000)
            last_heartbeat = status_item.get('lastHeartbeat', 0)
            time_diff = (current_time - last_heartbeat) / 1000  # Convert to seconds
            
            print(f"\nHeartbeat Check:")
            print(f"  Last heartbeat was {time_diff:.1f} seconds ago")
            
            if time_diff < 30:
                print(f"  ✓ Device is actively sending heartbeats")
            elif time_diff < 60:
                print(f"  ⚠ Device heartbeat is slightly delayed")
            else:
                print(f"  ✗ Device may be offline (no recent heartbeat)")
                print(f"  Make sure player.py is running")
        else:
            print("[ERROR] No display status found in DynamoDB!")
            print("\nPossible causes:")
            print("  1. player.py is not running")
            print("  2. player.py failed to authenticate")
            print("  3. Heartbeat thread is not working")
            print("\nTry running player.py and check for errors")
            
    except Exception as e:
        print(f"[ERROR] Failed to check display status: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
