#!/usr/bin/env python3
"""
PanelSena Raspberry Pi Player
A digital signage player that connects to AWS DynamoDB and plays scheduled content
"""

import os
import sys
import time
import json
import subprocess
import threading
import requests
from datetime import datetime
from pathlib import Path
import boto3
import vlc
from dynamodb_client import DynamoDBClient

# Configuration
CONFIG_FILE = "config.json"
CONTENT_DIR = "content"
CACHE_DIR = "cache"

class PanelSenaPlayer:
    def __init__(self):
        self.config = self.load_config()
        self.device_id = self.config.get("device_id")
        self.device_key = self.config.get("device_key")
        self.display_name = self.config.get("display_name", "Raspberry Pi Display")

        # Will be set after device link verification
        self.user_id = None
        self.display_id = None

        # State
        self.running = True

        # Initialize DynamoDB
        self.init_dynamodb()

        # Authenticate and get device link
        self.authenticate_device()

        # Create content directories
        Path(CONTENT_DIR).mkdir(exist_ok=True)
        Path(CACHE_DIR).mkdir(exist_ok=True)

        # VLC process (used for subprocess mode)
        self.vlc_process = None

        # VLC player instance with fullscreen and other options
        # For Linux desktop environments (Ubuntu, etc.)
        # Detect if running in a desktop environment
        display = os.environ.get('DISPLAY', '')
        
        if display:
            # Running in X11 desktop environment
            print(f"[INFO] Detected X11 display: {display}")
            # Let VLC create its own window - simpler and more reliable
            self.vlc_instance = vlc.Instance(
                '--no-video-title-show',
                '--video-on-top',
                '--fullscreen',
                '--mouse-hide-timeout=0'
            )
        else:
            # Headless or console mode
            print("[INFO] No X11 display detected, using default output")
            self.vlc_instance = vlc.Instance('--no-video-title-show', '--fullscreen')
        
        self.player = self.vlc_instance.media_player_new()
        self.player.set_fullscreen(True)
        
        self.current_media = None

        # State
        self.is_playing = False
        self.is_paused = False
        self.current_content = None
        self.current_schedule = None
        self.content_queue = []
        self.current_index = 0
        self.volume = 80
        self.brightness = 100  # Default brightness (0-100)

        # Heartbeat thread
        self.heartbeat_thread = threading.Thread(target=self.heartbeat_loop)
        self.heartbeat_thread.daemon = True

        print(f"[INFO] PanelSena Player initialized for display: {self.display_name}")

    def load_config(self):
        """Load configuration from config.json"""
        if not os.path.exists(CONFIG_FILE):
            print(f"[ERROR] Configuration file {CONFIG_FILE} not found!")
            print("Please create a config.json file with your Firebase credentials")
            sys.exit(1)

        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)

    def init_dynamodb(self):
        """Initialize DynamoDB client and AWS S3"""
        try:
            # Initialize DynamoDB client
            self.dynamodb_client = DynamoDBClient(
                region_name=self.config.get("aws_region", "us-east-1"),
                aws_access_key_id=self.config.get("aws_access_key_id"),
                aws_secret_access_key=self.config.get("aws_secret_access_key")
            )

            # Initialize AWS S3 client
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.config.get("aws_access_key_id"),
                aws_secret_access_key=self.config.get("aws_secret_access_key"),
                region_name=self.config.get("aws_region", "us-east-1")
            )
            self.s3_bucket_name = self.config.get("aws_s3_bucket_name")

            print("[INFO] DynamoDB and AWS S3 initialized successfully")
        except Exception as e:
            print(f"[ERROR] Failed to initialize services: {e}")
            sys.exit(1)

    def authenticate_device(self):
        """Authenticate device and get user/display link"""
        try:
            print(f"[INFO] Authenticating device: {self.device_id}")

            # First, register device in registry (or update last seen)
            if not self.dynamodb_client.verify_device_credentials(self.device_id, self.device_key):
                print("[ERROR] Invalid device key!")
                print("The device key in config.json does not match the registered device.")
                sys.exit(1)

            # Update last seen
            self.dynamodb_client.update_device_last_seen(self.device_id)
            print("[INFO] Device authenticated successfully")

            # Check if device is linked to a user
            link_data = self.dynamodb_client.get_device_link(self.device_id)

            if link_data:
                self.user_id = link_data.get('userId')
                self.display_id = link_data.get('displayId')
                print(f"[INFO] Device linked to user: {self.user_id}, display: {self.display_id}")
            else:
                print("[WARN] Device not linked to any user yet")
                print("Please link this device in the dashboard:")
                print(f"  Device ID:  {self.device_id}")
                print(f"  Device Key: {self.device_key}")
                print()
                print("Waiting for device to be linked...")

                # Wait for link
                self.wait_for_device_link()

        except Exception as e:
            print(f"[ERROR] Device authentication failed: {e}")
            sys.exit(1)

    def wait_for_device_link(self):
        """Wait for device to be linked to a user"""
        print("[INFO] Polling for device link every 5 seconds...")
        while self.running:
            link_data = self.dynamodb_client.get_device_link(self.device_id)
            if link_data:
                self.user_id = link_data.get('userId')
                self.display_id = link_data.get('displayId')
                print(f"[INFO] Device linked! User: {self.user_id}, Display: {self.display_id}")
                break
            time.sleep(5)

    def update_status(self, status="online", error_message=None):
        """Update display status in DynamoDB"""
        try:
            print(f"[DEBUG] update_status called with status={status}")

            if not self.user_id or not self.display_id:
                print("[WARN] Cannot update status - user_id or display_id not set")
                return

            status_data = {
                'displayId': self.display_id,
                'displayName': self.display_name,
                'status': status,
                'volume': self.volume,
                'brightness': self.brightness,
            }

            print(f"[DEBUG] Preparing status update: status={status}")

            # Add current content if playing
            if self.current_content:
                status_data['currentContent'] = {
                    'id': self.current_content.get('id'),
                    'name': self.current_content.get('name'),
                    'type': self.current_content.get('type'),
                    'url': self.current_content.get('url'),
                    'startedAt': self.current_content.get('startedAt'),
                }
            else:
                status_data['currentContent'] = None

            # Add schedule info if active
            if self.current_schedule:
                status_data['schedule'] = {
                    'id': self.current_schedule.get('id'),
                    'name': self.current_schedule.get('name'),
                    'contentQueue': self.content_queue,
                    'currentIndex': self.current_index,
                }
            else:
                status_data['schedule'] = None

            # Add error message if provided, or explicitly clear it
            if error_message:
                status_data['errorMessage'] = error_message
            else:
                # Explicitly clear any previous error message
                status_data['errorMessage'] = None

            print(f"[DEBUG] Setting DynamoDB status data...")
            success = self.dynamodb_client.update_display_status(self.user_id, self.display_id, status_data)

            if success:
                print(f"[DEBUG] DynamoDB status updated successfully with status={status}")
            else:
                print(f"[ERROR] Failed to update status in DynamoDB")

        except Exception as e:
            print(f"[ERROR] Failed to update status: {e}")
            import traceback
            traceback.print_exc()

    def heartbeat_loop(self):
        """Send heartbeat every 10 seconds"""
        print("[INFO] Heartbeat loop started")
        while self.running:
            try:
                if self.is_playing and not self.is_paused:
                    current_status = "playing"
                elif self.is_paused:
                    current_status = "paused"
                else:
                    current_status = "online"
                
                print(f"[DEBUG] Heartbeat: status={current_status}, is_playing={self.is_playing}, is_paused={self.is_paused}")
                self.update_status(current_status)
            except Exception as e:
                print(f"[ERROR] Heartbeat failed: {e}")
                import traceback
                traceback.print_exc()
                # Don't let heartbeat errors crash the loop
                pass

            time.sleep(10)
        
        print("[INFO] Heartbeat loop ended")

    def listen_for_commands(self):
        """Poll for commands from DynamoDB"""
        print("[INFO] Starting command polling...")

        def poll_commands():
            """Poll for pending commands"""
            while self.running:
                try:
                    if not self.user_id or not self.display_id:
                        time.sleep(5)
                        continue

                    # Get pending commands
                    commands = self.dynamodb_client.get_pending_commands(self.user_id, self.display_id)

                    # Process pending commands
                    for command_id, command in commands.items():
                        if command.get('status') == 'pending':
                            print(f"[INFO] Received command: {command.get('type')}")
                            self.execute_command(command_id, command)

                    # Poll every 2 seconds
                    time.sleep(2)

                except Exception as e:
                    print(f"[ERROR] Command polling failed: {e}")
                    time.sleep(5)  # Wait longer on error

        # Start polling in a separate thread
        command_thread = threading.Thread(target=poll_commands, daemon=True)
        command_thread.start()
        print("[INFO] Command polling started")

    def execute_command(self, command_id, command):
        """Execute a playback command"""
        try:
            command_type = command.get('type')
            payload = command.get('payload', {})

            print(f"[INFO] Executing command: {command_type}")
            print(f"[DEBUG] Payload: {payload}")

            if command_type == 'play':
                if 'scheduleId' in payload:
                    # Check if we have full schedule data in payload
                    schedule_data = payload.get('scheduleData')
                    self.load_and_play_schedule(payload['scheduleId'], schedule_data)
                elif 'contentId' in payload:
                    # Check if we have full content data in payload
                    content_data = payload.get('contentData')
                    self.play_single_content(payload['contentId'], content_data)

            elif command_type == 'pause':
                self.pause_playback()

            elif command_type == 'stop':
                self.stop_playback()

            elif command_type == 'skip':
                self.skip_content()

            elif command_type == 'volume':
                self.set_volume(payload.get('volume', 80))

            elif command_type == 'brightness':
                self.set_brightness(payload.get('brightness', 100))

            elif command_type == 'restart':
                self.restart_device()

            # Mark command as executed
            if self.user_id and self.display_id:
                success = self.dynamodb_client.update_command_status(
                    self.user_id, self.display_id, command_id, 'executed'
                )
                if not success:
                    print(f"[ERROR] Failed to mark command {command_id} as executed")
            else:
                print(f"[ERROR] Cannot update command status - missing user_id or display_id")

            print(f"[INFO] Command {command_type} executed successfully")

        except Exception as e:
            print(f"[ERROR] Failed to execute command: {e}")
            import traceback
            traceback.print_exc()

            # Mark command as failed
            try:
                if self.user_id and self.display_id:
                    self.dynamodb_client.update_command_status(
                        self.user_id, self.display_id, command_id, 'failed', str(e)
                    )
            except Exception as update_error:
                print(f"[ERROR] Failed to update command status: {update_error}")

    def load_and_play_schedule(self, schedule_id, schedule_data=None):
        """Load schedule from DynamoDB and start playback"""
        try:
            print(f"[INFO] Loading schedule: {schedule_id}")

            # Use provided schedule_data if available (from command payload)
            if not schedule_data:
                # Fallback to fetching from DynamoDB (legacy support)
                if not self.user_id:
                    print("[ERROR] Cannot load schedule - user_id not set")
                    self.update_status("error", "User ID not configured")
                    return

                schedule_data = self.dynamodb_client.get_schedule(self.user_id, schedule_id)
                
                if not schedule_data:
                    print(f"[ERROR] Schedule not found: {schedule_id}")
                    self.update_status("error", f"Schedule not found: {schedule_id}")
                    return

            print(f"[INFO] Schedule loaded: {schedule_data.get('name')}")

            # Set current schedule
            self.current_schedule = {
                'id': schedule_id,
                'name': schedule_data.get('name', 'Unnamed Schedule')
            }

            # Get content from schedule - prefer 'content' array with full data
            content_list = schedule_data.get('content', [])
            
            if content_list:
                # We have full content data, use it directly
                print(f"[INFO] Schedule has {len(content_list)} content items with full data")
                self.content_queue = content_list  # Store full content objects
                self.current_index = 0
                self.play_from_queue_with_data()
            else:
                # Fallback to content IDs only (legacy)
                content_ids = schedule_data.get('contentIds', [])
                
                if not content_ids:
                    print(f"[WARN] Schedule has no content items")
                    self.update_status("error", "Schedule has no content")
                    return

                print(f"[INFO] Schedule has {len(content_ids)} content IDs (legacy mode)")
                self.content_queue = content_ids
                self.current_index = 0
                self.play_from_queue()

        except Exception as e:
            print(f"[ERROR] Failed to load schedule: {e}")
            import traceback
            traceback.print_exc()
            self.update_status("error", str(e))

    def play_single_content(self, content_id, content_data=None):
        """Play a single content item"""
        try:
            print(f"[INFO] Playing content: {content_id}")

            # Use provided content_data if available (from command payload)
            if not content_data:
                # Fallback to fetching from DynamoDB (legacy support)
                if not self.user_id:
                    print("[ERROR] Cannot play content - user_id not set")
                    self.update_status("error", "User ID not configured")
                    return

                content_data = self.dynamodb_client.get_content_item(self.user_id, content_id)
                
                if not content_data:
                    print(f"[ERROR] Content not found: {content_id}")
                    self.update_status("error", f"Content not found: {content_id}")
                    return

            print(f"[INFO] Content loaded: {content_data.get('name')}")
            print(f"[DEBUG] Content type: {content_data.get('type')}")
            print(f"[DEBUG] Content URL: {content_data.get('url')}")
            print(f"[DEBUG] Storage ref: {content_data.get('storageRef')}")

            # Prepare content info for playback
            content_info = {
                'id': content_id,
                'name': content_data.get('name', 'Unnamed Content'),
                'type': content_data.get('type', 'video'),
                'url': content_data.get('url', ''),
            }

            # Determine storage path - prefer url, fallback to storageRef
            storage_path = content_data.get('url') or content_data.get('storageRef')
            
            if not storage_path:
                print(f"[ERROR] No URL or storage reference found for content")
                self.update_status("error", "Content has no URL")
                return

            # Determine file extension
            file_ext = self._get_file_extension(storage_path, content_data.get('type', 'video'))
            
            # Create local file path
            local_filename = f"{content_id}{file_ext}"
            local_path = os.path.join(CONTENT_DIR, local_filename)

            # Download content if not already cached
            if not os.path.exists(local_path):
                print(f"[INFO] Content not in cache, downloading...")
                if not self.download_content(storage_path, local_path):
                    print(f"[ERROR] Failed to download content")
                    self.update_status("error", "Failed to download content")
                    return
            else:
                print(f"[INFO] Using cached content: {local_path}")

            # Play the file
            if self.play_file(local_path, content_info):
                print(f"[INFO] Successfully started playback")
            else:
                print(f"[ERROR] Failed to start playback")

        except Exception as e:
            print(f"[ERROR] Failed to play content: {e}")
            import traceback
            traceback.print_exc()
            self.update_status("error", str(e))
    
    def _get_file_extension(self, storage_path, content_type):
        """Determine file extension from path or content type"""
        # Try to get extension from path, handling URLs with query parameters
        if '.' in storage_path:
            # Remove query parameters first
            path_without_query = storage_path.split('?')[0]
            # Split by dot and get the last part
            parts = path_without_query.split('.')
            if len(parts) > 1:
                ext = '.' + parts[-1]
                return ext
        
        # Fallback to content type
        type_extensions = {
            'image': '.jpg',
            'video': '.mp4',
            'document': '.pdf',
        }
        return type_extensions.get(content_type, '.mp4')

    def download_content(self, storage_path, local_path):
        """Download content from AWS S3"""
        try:
            print(f"[INFO] Downloading: {storage_path}")
            
            # Check if it's a full HTTPS URL or just a path
            if storage_path.startswith('http://') or storage_path.startswith('https://'):
                # It's a full URL, download directly with requests
                print(f"[INFO] Downloading from URL...")
                response = requests.get(storage_path, stream=True)
                response.raise_for_status()
                
                with open(local_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
            else:
                # It's an S3 key, download from S3
                print(f"[INFO] Downloading from S3...")
                self.s3_client.download_file(self.s3_bucket_name, storage_path, local_path)
            
            print(f"[INFO] Downloaded to: {local_path}")
            return True
        except Exception as e:
            print(f"[ERROR] Failed to download content: {e}")
            import traceback
            traceback.print_exc()
            return False

    def play_file(self, file_path, content_info):
        """Play a media file using VLC via subprocess"""
        try:
            if not os.path.exists(file_path):
                print(f"[ERROR] File not found: {file_path}")
                return False

            print(f"[INFO] Playing: {file_path}")
            print(f"[DEBUG] Absolute file path: {os.path.abspath(file_path)}")
            print(f"[DEBUG] File size: {os.path.getsize(file_path)} bytes")
            
            # Verify the file is a valid video
            try:
                import mimetypes
                mime_type, _ = mimetypes.guess_type(file_path)
                print(f"[DEBUG] MIME type: {mime_type}")
            except:
                pass
            
            # Update state first
            self.current_content = {
                **content_info,
                'startedAt': int(time.time() * 1000)
            }

            # Stop any current playback
            if hasattr(self, 'vlc_process') and self.vlc_process:
                try:
                    self.vlc_process.terminate()
                    self.vlc_process.wait(timeout=2)
                except:
                    try:
                        self.vlc_process.kill()
                    except:
                        pass
                self.vlc_process = None

            # Get absolute path
            abs_file_path = os.path.abspath(file_path)
            
            # Launch VLC as subprocess with fullscreen
            vlc_command = [
                'vlc',
                '--fullscreen',
                '--no-video-title-show',
                '--play-and-exit',
                '--no-qt-privacy-ask',
                '--no-qt-system-tray',
                '--mouse-hide-timeout=0',
                abs_file_path
            ]
            
            print(f"[DEBUG] Launching VLC with command: {' '.join(vlc_command)}")
            
            # Start VLC process
            self.vlc_process = subprocess.Popen(
                vlc_command,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            # Wait a bit to check if it started
            time.sleep(1)
            
            # Check if process is running
            if self.vlc_process.poll() is not None:
                print(f"[ERROR] VLC process exited immediately with code {self.vlc_process.returncode}")
                self.update_status("error", "Failed to start VLC playback")
                return False
            
            print(f"[INFO] VLC process started successfully (PID: {self.vlc_process.pid})")
            
            # Update state
            self.is_playing = True
            self.is_paused = False

            self.update_status("playing")
            
            # Monitor playback in a separate thread
            self.monitor_playback()

            return True

        except Exception as e:
            print(f"[ERROR] Failed to play file: {e}")
            import traceback
            traceback.print_exc()
            self.update_status("error", str(e))
            return False

    def monitor_playback(self):
        """Monitor playback and handle end of media"""
        def check_playback():
            while self.is_playing:
                # Check if VLC process is still running
                if hasattr(self, 'vlc_process') and self.vlc_process:
                    returncode = self.vlc_process.poll()
                    if returncode is not None:
                        print(f"[INFO] VLC process ended with code {returncode}")
                        self.handle_content_end()
                        break
                else:
                    # Process not found, stop playback
                    print("[INFO] VLC process not found")
                    self.handle_content_end()
                    break
                time.sleep(1)

        monitor_thread = threading.Thread(target=check_playback)
        monitor_thread.daemon = True
        monitor_thread.start()

    def handle_content_end(self):
        """Handle end of content playback"""
        if self.content_queue and len(self.content_queue) > 0:
            # We have a queue, play next item
            self.skip_content()
        else:
            # No queue, just stop and go to idle state
            print("[INFO] Content finished, no queue. Going to idle state.")
            self.is_playing = False
            self.is_paused = False
            self.current_content = None
            self.update_status("online")

    def play_from_queue(self):
        """Play next content from queue (content IDs only - legacy)"""
        if self.current_index < len(self.content_queue):
            content_id = self.content_queue[self.current_index]
            print(f"[INFO] Playing content {self.current_index + 1}/{len(self.content_queue)} from queue: {content_id}")
            # Play the content (will fetch metadata)
            self.play_single_content(content_id)
        else:
            # Loop back to start
            print(f"[INFO] Reached end of queue, looping back to start")
            self.current_index = 0
            if self.content_queue:
                self.play_from_queue()
            else:
                print(f"[INFO] Queue is empty, stopping playback")
                self.stop_playback()

    def play_from_queue_with_data(self):
        """Play next content from queue (full content data objects)"""
        if self.current_index < len(self.content_queue):
            content_obj = self.content_queue[self.current_index]
            content_id = content_obj.get('id')
            print(f"[INFO] Playing content {self.current_index + 1}/{len(self.content_queue)} from queue: {content_id}")
            # Play the content with full data already available
            self.play_single_content(content_id, content_obj)
        else:
            # Loop back to start
            print(f"[INFO] Reached end of queue, looping back to start")
            self.current_index = 0
            if self.content_queue:
                self.play_from_queue_with_data()
            else:
                print(f"[INFO] Queue is empty, stopping playback")
                self.stop_playback()

    def pause_playback(self):
        """Pause playback - not supported in subprocess mode"""
        try:
            print(f"[DEBUG] pause_playback called. is_playing={self.is_playing}, is_paused={self.is_paused}")
            print(f"[WARN] Pause/Resume not supported in subprocess VLC mode")
            # Note: Pausing requires using VLC's RC interface or similar
            # For simplicity, we'll just report the current state
        except Exception as e:
            print(f"[ERROR] Failed to pause/resume: {e}")
            import traceback
            traceback.print_exc()

    def stop_playback(self):
        """Stop playback"""
        try:
            # Terminate VLC process if running
            if hasattr(self, 'vlc_process') and self.vlc_process:
                try:
                    self.vlc_process.terminate()
                    self.vlc_process.wait(timeout=2)
                except:
                    try:
                        self.vlc_process.kill()
                    except:
                        pass
                self.vlc_process = None
        except Exception as e:
            print(f"[ERROR] Failed to stop playback: {e}")
        
        self.is_playing = False
        self.is_paused = False
        self.current_content = None
        self.current_schedule = None
        self.content_queue = []
        self.current_index = 0
        self.update_status("online")
        print("[INFO] Playback stopped")

    def skip_content(self):
        """Skip to next content"""
        if self.content_queue and len(self.content_queue) > 0:
            self.current_index += 1
            if self.current_index >= len(self.content_queue):
                self.current_index = 0
            
            # Check if queue contains full content objects or just IDs
            if isinstance(self.content_queue[0], dict):
                # Full content data
                self.play_from_queue_with_data()
            else:
                # Content IDs only
                self.play_from_queue()
            
            print(f"[INFO] Skipped to index {self.current_index}")
        else:
            print("[INFO] No content queue, stopping playback")
            self.stop_playback()

    def set_volume(self, volume):
        """Set playback volume"""
        self.volume = max(0, min(100, volume))
        self.player.audio_set_volume(self.volume)
        self.update_status()
        print(f"[INFO] Volume set to {self.volume}%")

    def set_brightness(self, brightness):
        """Set display brightness"""
        try:
            self.brightness = max(0, min(100, brightness))
            
            # Convert 0-100 to actual brightness value
            # For Raspberry Pi official display, brightness is controlled via /sys/class/backlight
            brightness_path = "/sys/class/backlight/rpi_backlight/brightness"
            max_brightness_path = "/sys/class/backlight/rpi_backlight/max_brightness"
            
            # Check if running on Raspberry Pi with official display
            if os.path.exists(brightness_path) and os.path.exists(max_brightness_path):
                try:
                    # Read max brightness
                    with open(max_brightness_path, 'r') as f:
                        max_brightness = int(f.read().strip())
                    
                    # Calculate actual brightness value
                    actual_brightness = int((self.brightness / 100.0) * max_brightness)
                    
                    # Write brightness value
                    with open(brightness_path, 'w') as f:
                        f.write(str(actual_brightness))
                    
                    print(f"[INFO] Display brightness set to {self.brightness}% (value: {actual_brightness}/{max_brightness})")
                except PermissionError:
                    print(f"[WARN] Permission denied to set brightness. Run with sudo or add user to video group.")
                    print(f"[WARN] To fix: sudo usermod -a -G video $USER")
                except Exception as e:
                    print(f"[ERROR] Failed to set hardware brightness: {e}")
            else:
                # Try alternative methods for different displays
                # Method 1: vcgencmd (for official Raspberry Pi display)
                try:
                    result = subprocess.run(
                        ['vcgencmd', 'display_power', '1'],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        print(f"[INFO] Display power on, brightness setting may require additional hardware support")
                except Exception as e:
                    print(f"[DEBUG] vcgencmd not available: {e}")
                
                # Method 2: ddcutil (for external displays with DDC/CI support)
                try:
                    result = subprocess.run(
                        ['ddcutil', 'setvcp', '10', str(self.brightness)],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if result.returncode == 0:
                        print(f"[INFO] Display brightness set to {self.brightness}% via DDC/CI")
                    else:
                        print(f"[WARN] ddcutil failed: {result.stderr}")
                except FileNotFoundError:
                    print(f"[INFO] Brightness set to {self.brightness}% (hardware control not available)")
                except Exception as e:
                    print(f"[DEBUG] ddcutil not available: {e}")
            
            # Update status regardless of hardware control success
            self.update_status()
            
        except Exception as e:
            print(f"[ERROR] Failed to set brightness: {e}")
            import traceback
            traceback.print_exc()

    def restart_device(self):
        """Restart the Raspberry Pi"""
        print("[INFO] Restarting device...")
        self.cleanup()
        os.system('sudo reboot')

    def cleanup(self):
        """Cleanup before shutdown"""
        print("[INFO] Cleaning up...")
        self.running = False
        self.stop_playback()
        self.update_status("offline")

    def run(self):
        """Main run loop"""
        try:
            # Initialize status
            self.update_status("online")

            # Start heartbeat
            self.heartbeat_thread.start()

            # Listen for commands
            self.listen_for_commands()

            # Keep running
            print("[INFO] Player is running. Press Ctrl+C to exit.")
            while self.running:
                time.sleep(1)

        except KeyboardInterrupt:
            print("\n[INFO] Shutting down...")
        except Exception as e:
            print(f"[ERROR] Unexpected error: {e}")
        finally:
            self.cleanup()

def main():
    """Main entry point"""
    print("=" * 50)
    print("PanelSena Raspberry Pi Player")
    print("=" * 50)

    player = PanelSenaPlayer()
    player.run()

if __name__ == "__main__":
    main()
