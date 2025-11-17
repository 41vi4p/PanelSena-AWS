#!/usr/bin/env python3
"""
PanelSena Device Setup Wizard
Helps you set up a Raspberry Pi display device with automatic credential generation
"""

import os
import json
import secrets
import string
from datetime import datetime
from pathlib import Path

def print_header(text):
    """Print a formatted header"""
    print()
    print("=" * 70)
    print(f" {text}")
    print("=" * 70)
    print()

def print_step(step_number, text):
    """Print a step number"""
    print(f"\n[Step {step_number}] {text}")
    print("-" * 70)

def generate_device_id():
    """Generate a unique device ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    return f"DEVICE_{timestamp}_{random_suffix}"

def generate_device_key():
    """Generate a secure device key (32 characters)"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def get_user_input(prompt, default=None):
    """Get user input with optional default"""
    if default:
        user_input = input(f"{prompt} [{default}]: ").strip()
        return user_input if user_input else default
    return input(f"{prompt}: ").strip()

def main():
    print_header("🚀 PanelSena Raspberry Pi Setup Wizard")
    
    print("This wizard will help you set up your Raspberry Pi as a digital signage display.")
    print("You'll need:")
    print("  • AWS access keys with DynamoDB and S3 permissions")
    print("  • Your AWS region")
    print("  • Your S3 bucket name")
    print()
    input("Press Enter to continue...")
    
    # Step 1: Generate Device Credentials
    print_step(1, "Generating Device Credentials")
    
    device_id = generate_device_id()
    device_key = generate_device_key()
    
    print()
    print("✅ Generated unique device credentials:")
    print()
    print(f"   Device ID:  {device_id}")
    print(f"   Device Key: {device_key}")
    print()
    print("⚠️  IMPORTANT: Save these credentials! You'll need them to link this device in the dashboard.")
    print()
    input("Press Enter to continue...")
    
    # Step 2: Get Display Information
    print_step(2, "Display Configuration")
    
    display_name = get_user_input("Enter a name for this display", "Raspberry Pi Display")
    
    # Step 3: Get AWS Configuration
    print_step(3, "AWS Configuration")
    
    print()
    print("You need your AWS credentials:")
    print()
    
    # Get AWS credentials
    aws_access_key_id = get_user_input("AWS Access Key ID")
    aws_secret_access_key = get_user_input("AWS Secret Access Key")
    aws_region = get_user_input("AWS Region", "us-east-1")
    aws_s3_bucket_name = get_user_input("S3 Bucket Name")
    
    # Step 4: Create Configuration File
    print_step(4, "Creating Configuration File")
    
    config = {
        "device_id": device_id,
        "device_key": device_key,
        "display_name": display_name,
        "aws_access_key_id": aws_access_key_id,
        "aws_secret_access_key": aws_secret_access_key,
        "aws_region": aws_region,
        "aws_s3_bucket_name": aws_s3_bucket_name
    }
    
    # Write config.json
    with open("config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print()
    print("✅ Created config.json")
    
    # Step 5: Save credentials to file
    credentials_file = f"device_credentials_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(credentials_file, "w") as f:
        f.write("=" * 70 + "\n")
        f.write(" PanelSena Device Credentials\n")
        f.write("=" * 70 + "\n\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Display Name: {display_name}\n\n")
        f.write(f"Device ID:  {device_id}\n")
        f.write(f"Device Key: {device_key}\n\n")
        f.write("=" * 70 + "\n")
        f.write(" IMPORTANT INSTRUCTIONS\n")
        f.write("=" * 70 + "\n\n")
        f.write("🔒 Keep the Device Key secure and private!\n\n")
        f.write("To link this device to your PanelSena dashboard:\n\n")
        f.write("1. Log in to your PanelSena dashboard\n")
        f.write("2. Go to 'Displays' section\n")
        f.write("3. Click 'Add Display' or create a new display\n")
        f.write("4. Click 'Link Device' button\n")
        f.write("5. Enter the Device ID and Device Key from above\n")
        f.write("6. Click 'Link Device'\n\n")
        f.write("Once linked, this Raspberry Pi will automatically connect to your account!\n")
    
    print(f"✅ Saved credentials to: {credentials_file}")
    
    # Step 6: Setup Complete
    print_header("✨ Setup Complete!")
    
    print("Your Raspberry Pi is now configured!")
    print()
    print("📋 Summary:")
    print(f"   Display Name: {display_name}")
    print(f"   Device ID:    {device_id}")
    print(f"   Config File:  config.json")
    print(f"   Credentials:  {credentials_file}")
    print()
    print("=" * 70)
    print(" NEXT STEPS")
    print("=" * 70)
    print()
    print("1️⃣  Start the player:")
    print("     python3 player.py")
    print()
    print("2️⃣  Link the device in your dashboard:")
    print(f"     Device ID:  {device_id}")
    print(f"     Device Key: {device_key}")
    print()
    print("3️⃣  The player will automatically connect once linked!")
    print()
    print("💡 Tip: Keep the credentials file safe for future reference")
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
