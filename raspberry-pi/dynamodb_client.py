#!/usr/bin/env python3
"""
PanelSena DynamoDB Client for Raspberry Pi
Provides DynamoDB operations to replace Firebase Realtime Database functionality
"""

import boto3
import time
import json
from botocore.exceptions import ClientError
from typing import Dict, Any, Optional, List

class DynamoDBClient:
    def __init__(self, region_name='us-east-1', aws_access_key_id=None, aws_secret_access_key=None):
        """Initialize DynamoDB client"""
        self.dynamodb = boto3.resource(
            'dynamodb',
            region_name=region_name,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key
        )

        # Table names (should match the ones in the web app)
        self.display_status_table = 'PanelSena-DisplayStatus'
        self.commands_table = 'PanelSena-PlaybackCommands'
        self.device_registry_table = 'PanelSena-DeviceRegistry'
        self.device_links_table = 'PanelSena-DeviceLinks'

        # Get table references
        self.display_status = self.dynamodb.Table(self.display_status_table)
        self.commands = self.dynamodb.Table(self.commands_table)
        self.device_registry = self.dynamodb.Table(self.device_registry_table)
        self.device_links = self.dynamodb.Table(self.device_links_table)

    def create_display_status_key(self, user_id: str, display_id: str) -> Dict[str, str]:
        """Create composite key for display status"""
        return {
            'pk': f'DISPLAY_STATUS#{user_id}',
            'sk': f'DISPLAY#{display_id}'
        }

    def create_command_key(self, user_id: str, display_id: str, command_id: str) -> Dict[str, str]:
        """Create composite key for commands"""
        return {
            'pk': f'COMMANDS#{user_id}#{display_id}',
            'sk': f'COMMAND#{command_id}'
        }

    def create_device_registry_key(self, device_id: str) -> Dict[str, str]:
        """Create composite key for device registry"""
        return {
            'pk': 'DEVICE_REGISTRY',
            'sk': f'DEVICE#{device_id}'
        }

    def create_device_link_key(self, device_id: str) -> Dict[str, str]:
        """Create composite key for device links"""
        return {
            'pk': 'DEVICE_LINKS',
            'sk': f'LINK#{device_id}'
        }

    def register_device(self, device_id: str, device_key: str, display_name: str,
                       ip_address: str = '', mac_address: str = '', os_version: str = '') -> bool:
        """Register a new device in the registry"""
        try:
            key = self.create_device_registry_key(device_id)
            item = {
                **key,
                'deviceId': device_id,
                'deviceKey': device_key,
                'displayName': display_name,
                'registeredAt': int(time.time() * 1000),
                'lastSeen': int(time.time() * 1000),
                'ipAddress': ip_address,
                'macAddress': mac_address,
                'osVersion': os_version,
                'linkedToUser': None,
                'status': 'registered'
            }

            self.device_registry.put_item(Item=item)
            print(f"[INFO] Device {device_id} registered successfully")
            return True
        except ClientError as e:
            print(f"[ERROR] Failed to register device: {e}")
            return False

    def verify_device_credentials(self, device_id: str, device_key: str) -> bool:
        """Verify device credentials"""
        try:
            key = self.create_device_registry_key(device_id)
            response = self.device_registry.get_item(Key=key)

            if 'Item' not in response:
                return False

            device_data = response['Item']
            return device_data.get('deviceKey') == device_key
        except ClientError as e:
            print(f"[ERROR] Failed to verify device credentials: {e}")
            return False

    def update_device_last_seen(self, device_id: str) -> bool:
        """Update device's last seen timestamp"""
        try:
            key = self.create_device_registry_key(device_id)
            self.device_registry.update_item(
                Key=key,
                UpdateExpression='SET lastSeen = :lastSeen',
                ExpressionAttributeValues={':lastSeen': int(time.time() * 1000)}
            )
            return True
        except ClientError as e:
            print(f"[ERROR] Failed to update device last seen: {e}")
            return False

    def get_device_link(self, device_id: str) -> Optional[Dict[str, str]]:
        """Get device link information"""
        try:
            key = self.create_device_link_key(device_id)
            response = self.device_links.get_item(Key=key)

            if 'Item' not in response:
                return None

            link_data = response['Item']
            return {
                'userId': link_data.get('userId'),
                'displayId': link_data.get('displayId')
            }
        except ClientError as e:
            print(f"[ERROR] Failed to get device link: {e}")
            return None

    def update_display_status(self, user_id: str, display_id: str, status_data: Dict[str, Any]) -> bool:
        """Update display status"""
        try:
            key = self.create_display_status_key(user_id, display_id)

            # Check if item exists
            response = self.display_status.get_item(Key=key)
            item_exists = 'Item' in response

            if item_exists:
                # Update existing item
                update_expression = 'SET #status = :status, lastHeartbeat = :lastHeartbeat'
                expression_names = {'#status': 'status'}
                expression_values = {
                    ':status': status_data,
                    ':lastHeartbeat': int(time.time() * 1000)
                }

                # Add optional fields
                if 'currentContent' in status_data:
                    update_expression += ', currentContent = :currentContent'
                    expression_values[':currentContent'] = status_data['currentContent']

                if 'schedule' in status_data:
                    update_expression += ', schedule = :schedule'
                    expression_values[':schedule'] = status_data['schedule']

                if 'errorMessage' in status_data:
                    update_expression += ', errorMessage = :errorMessage'
                    expression_values[':errorMessage'] = status_data['errorMessage']

                self.display_status.update_item(
                    Key=key,
                    UpdateExpression=update_expression,
                    ExpressionAttributeNames=expression_names,
                    ExpressionAttributeValues=expression_values
                )
            else:
                # Create new item
                item = {
                    **key,
                    **status_data,
                    'lastHeartbeat': int(time.time() * 1000),
                    'createdAt': int(time.time() * 1000)
                }
                self.display_status.put_item(Item=item)

            return True
        except ClientError as e:
            print(f"[ERROR] Failed to update display status: {e}")
            return False

    def get_pending_commands(self, user_id: str, display_id: str) -> Dict[str, Dict[str, Any]]:
        """Get all pending commands for a display"""
        try:
            # Query by partition key
            response = self.commands.query(
                KeyConditionExpression='pk = :pk',
                ExpressionAttributeValues={':pk': f'COMMANDS#{user_id}#{display_id}'}
            )

            commands = {}
            for item in response.get('Items', []):
                command_id = item['sk'].replace('COMMAND#', '')
                # Remove DynamoDB keys from the command data
                command_data = {k: v for k, v in item.items() if k not in ['pk', 'sk', 'ttl']}
                commands[command_id] = command_data

            return commands
        except ClientError as e:
            print(f"[ERROR] Failed to get pending commands: {e}")
            return {}

    def update_command_status(self, user_id: str, display_id: str, command_id: str,
                            status: str, result: str = '') -> bool:
        """Update command execution status"""
        try:
            key = self.create_command_key(user_id, display_id, command_id)
            self.commands.update_item(
                Key=key,
                UpdateExpression='SET #status = :status, #result = :result',
                ExpressionAttributeNames={'#status': 'status', '#result': 'result'},
                ExpressionAttributeValues={':status': status, ':result': result}
            )
            return True
        except ClientError as e:
            print(f"[ERROR] Failed to update command status: {e}")
            return False

    def send_command(self, user_id: str, display_id: str, command_type: str,
                   payload: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """Send a command to a display"""
        try:
            command_id = f"cmd_{int(time.time() * 1000)}_{str(time.time()).split('.')[-1]}"
            key = self.create_command_key(user_id, display_id, command_id)

            command_data = {
                **key,
                'commandId': command_id,
                'type': command_type,
                'payload': payload or {},
                'timestamp': int(time.time() * 1000),
                'status': 'pending',
                'ttl': int(time.time()) + (24 * 60 * 60)  # TTL for 24 hours
            }

            self.commands.put_item(Item=command_data)
            return command_id
        except ClientError as e:
            print(f"[ERROR] Failed to send command: {e}")
            return None

    def cleanup_old_commands(self, user_id: str, display_id: str) -> bool:
        """Clean up old executed commands (older than 1 hour)"""
        try:
            # Get all commands
            commands = self.get_pending_commands(user_id, display_id)

            one_hour_ago = int(time.time() * 1000) - (60 * 60 * 1000)
            deleted_count = 0

            for command_id, command in commands.items():
                if (command.get('timestamp', 0) < one_hour_ago and
                    command.get('status') != 'pending'):
                    key = self.create_command_key(user_id, display_id, command_id)
                    self.commands.delete_item(Key=key)
                    deleted_count += 1

            if deleted_count > 0:
                print(f"[INFO] Cleaned up {deleted_count} old commands")
            return True
        except ClientError as e:
            print(f"[ERROR] Failed to cleanup old commands: {e}")
            return False