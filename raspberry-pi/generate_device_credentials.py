#!/usr/bin/env python3
"""
Device Credentials Generator
Generates unique device ID and secret key for Raspberry Pi devices
"""

import secrets
import string
import json
from datetime import datetime

def generate_device_id():
    """Generate a unique device ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
    return f"DEVICE_{timestamp}_{random_suffix}"

def generate_device_key():
    """Generate a secure device key"""
    # Generate a 32-character alphanumeric key
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def main():
    print("=" * 60)
    print("PanelSena Device Credentials Generator")
    print("=" * 60)
    print()

    # Generate credentials
    device_id = generate_device_id()
    device_key = generate_device_key()

    print("✓ Generated Device Credentials:")
    print()
    print(f"Device ID:  {device_id}")
    print(f"Device Key: {device_key}")
    print()
    print("=" * 60)
    print()

    # Ask if user wants to save to config
    save = input("Save these credentials to config.json? (y/n): ").strip().lower()

    if save == 'y':
        try:
            # Load existing config
            with open('config.json', 'r') as f:
                config = json.load(f)

            # Update with new credentials
            config['device_id'] = device_id
            config['device_key'] = device_key

            # Save back
            with open('config.json', 'w') as f:
                json.dump(config, f, indent=2)

            print()
            print("✓ Credentials saved to config.json")
            print()
        except Exception as e:
            print(f"✗ Error saving to config.json: {e}")
            print()

    # Save to a separate file for record
    credentials_file = f"device_credentials_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(credentials_file, 'w') as f:
        f.write("PanelSena Device Credentials\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"Device ID:  {device_id}\n")
        f.write(f"Device Key: {device_key}\n\n")
        f.write("IMPORTANT: Keep this key secure!\n")
        f.write("You will need both values when adding this device in the dashboard.\n")

    print(f"✓ Credentials also saved to: {credentials_file}")
    print()
    print("NEXT STEPS:")
    print("1. Copy config.json to your Raspberry Pi")
    print("2. In PanelSena dashboard, go to Displays → Add Display")
    print("3. Enter the Device ID and Device Key to link the device")
    print()
    print("⚠ IMPORTANT: Keep the Device Key secure!")
    print()

if __name__ == "__main__":
    main()
