#!/usr/bin/env python3
"""
PanelSena Raspberry Pi Player
A digital signage player that connects to Firebase and plays scheduled content
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
import firebase_admin
from firebase_admin import credentials, db, storage, firestore
import vlc

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

        # Initialize Firebase
        self.init_firebase()

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

    def init_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Initialize with service account
            cred = credentials.Certificate(self.config.get("service_account_path"))
            firebase_admin.initialize_app(cred, {
                'databaseURL': self.config.get("database_url"),
                'storageBucket': self.config.get("storage_bucket")
            })

            # Get database and storage references
            self.db = db
            self.storage_bucket = storage.bucket()
            self.firestore_db = firestore.client()

            print("[INFO] Firebase initialized successfully")
        except Exception as e:
            print(f"[ERROR] Failed to initialize Firebase: {e}")
            sys.exit(1)

    def authenticate_device(self):
        """Authenticate device and get user/display link"""
        try:
            print(f"[INFO] Authenticating device: {self.device_id}")

            # First, register device in registry (or update last seen)
            device_ref = self.db.reference(f'device_registry/{self.device_id}')
            device_data = device_ref.get()

            if device_data:
                # Verify device key
                if device_data.get('deviceKey') != self.device_key:
                    print("[ERROR] Invalid device key!")
                    print("The device key in config.json does not match the registered device.")
                    sys.exit(1)

                # Update last seen
                device_ref.update({'lastSeen': int(time.time() * 1000)})
                print("[INFO] Device authenticated successfully")
            else:
                # Register new device
                print("[INFO] Registering new device...")
                device_ref.set({
                    'deviceId': self.device_id,
                    'deviceKey': self.device_key,
                    'displayName': self.display_name,
                    'registeredAt': int(time.time() * 1000),
                    'lastSeen': int(time.time() * 1000),
                    'linkedToUser': None,
                    'status': 'registered'
                })
                print("[INFO] Device registered. Please link it in the dashboard.")

            # Check if device is linked to a user
            link_ref = self.db.reference(f'device_links/{self.device_id}')
            link_data = link_ref.get()

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
        link_ref = self.db.reference(f'device_links/{self.device_id}')

        print("[INFO] Polling for device link every 5 seconds...")
        while self.running:
            link_data = link_ref.get()
            if link_data:
                self.user_id = link_data.get('userId')
                self.display_id = link_data.get('displayId')
                print(f"[INFO] Device linked! User: {self.user_id}, Display: {self.display_id}")
                break
            time.sleep(5)

    def update_status(self, status="online", error_message=None):
        """Update display status in Firebase Realtime Database"""
        try:
            print(f"[DEBUG] update_status called with status={status}")
            
            if not self.user_id or not self.display_id:
                print("[WARN] Cannot update status - user_id or display_id not set")
                return

            status_ref = self.db.reference(f'users/{self.user_id}/displays/{self.display_id}/status')

            status_data = {
                'displayId': self.display_id,
                'displayName': self.display_name,
                'status': status,
                'lastHeartbeat': int(time.time() * 1000),
                'volume': self.volume,
                'brightness': self.brightness,
            }

            print(f"[DEBUG] Preparing status update: status={status}, lastHeartbeat={status_data['lastHeartbeat']}")

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

            # Add error message if provided
            if error_message:
                status_data['errorMessage'] = error_message

            print(f"[DEBUG] Setting Firebase status data...")
            status_ref.set(status_data)
            print(f"[DEBUG] Firebase status updated successfully with status={status}")

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
        """Listen for commands from Firebase"""
        commands_ref = self.db.reference(f'users/{self.user_id}/displays/{self.display_id}/commands')

        def command_listener(event):
            """Handle incoming commands"""
            if event.data is None:
                return

            # Handle both single command and multiple commands
            if isinstance(event.data, dict):
                # Check if it's a single command (has 'status' key) or multiple commands
                if 'status' in event.data:
                    # Single command object
                    if event.data.get('status') == 'pending':
                        command_id = event.data.get('commandId', 'unknown')
                        print(f"[INFO] Received command: {event.data.get('type')}")
                        self.execute_command(command_id, event.data)
                else:
                    # Multiple commands
                    for command_id, command in event.data.items():
                        if isinstance(command, dict) and command.get('status') == 'pending':
                            print(f"[INFO] Received command: {command.get('type')}")
                            self.execute_command(command_id, command)

        commands_ref.listen(command_listener)
        print("[INFO] Listening for commands...")

    def execute_command(self, command_id, command):
        """Execute a playback command"""
        command_ref = None
        try:
            command_type = command.get('type')
            payload = command.get('payload', {})

            print(f"[INFO] Executing command: {command_type}")

            if command_type == 'play':
                if 'scheduleId' in payload:
                    self.load_and_play_schedule(payload['scheduleId'])
                elif 'contentId' in payload:
                    self.play_single_content(payload['contentId'])

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
            command_ref = self.db.reference(
                f'users/{self.user_id}/displays/{self.display_id}/commands/{command_id}'
            )
            command_ref.update({
                'status': 'executed',
                'result': 'Command executed successfully'
            })
            print(f"[INFO] Command {command_type} executed successfully")

        except Exception as e:
            print(f"[ERROR] Failed to execute command: {e}")
            import traceback
            traceback.print_exc()
            
            # Mark command as failed
            try:
                if command_ref is None:
                    command_ref = self.db.reference(
                        f'users/{self.user_id}/displays/{self.display_id}/commands/{command_id}'
                    )
                command_ref.update({
                    'status': 'failed',
                    'result': str(e)
                })
            except Exception as update_error:
                print(f"[ERROR] Failed to update command status: {update_error}")

    def load_and_play_schedule(self, schedule_id):
        """Load schedule from Firestore and start playback"""
        try:
            print(f"[INFO] Loading schedule: {schedule_id}")

            # Fetch schedule from Firestore
            schedule_ref = self.firestore_db.collection('schedules').document(schedule_id)
            schedule_doc = schedule_ref.get()
            
            if not schedule_doc.exists:
                print(f"[ERROR] Schedule not found in Firestore: {schedule_id}")
                self.update_status("error", f"Schedule not found: {schedule_id}")
                return
            
            schedule_data = schedule_doc.to_dict()
            print(f"[INFO] Found schedule: {schedule_data.get('name')}")
            print(f"[DEBUG] Schedule data: {schedule_data}")
            
            # Get content IDs from schedule (the field is 'contentIds')
            content_ids = schedule_data.get('contentIds', [])
            if not content_ids or len(content_ids) == 0:
                print(f"[WARN] Schedule has no content items")
                print(f"[DEBUG] Available schedule fields: {list(schedule_data.keys())}")
                self.update_status("error", "Schedule has no content")
                return
            
            # Set the content queue
            self.content_queue = content_ids
            print(f"[INFO] Loaded {len(self.content_queue)} content items: {self.content_queue}")

            # Set current schedule info
            self.current_schedule = {
                'id': schedule_id,
                'name': schedule_data.get('name', f"Schedule {schedule_id}"),
            }

            # Start playing the first content
            self.current_index = 0
            print(f"[INFO] Starting playback from index {self.current_index}")
            self.play_from_queue()

        except Exception as e:
            print(f"[ERROR] Failed to load schedule: {e}")
            import traceback
            traceback.print_exc()
            self.update_status("error", str(e))

    def play_single_content(self, content_id):
        """Play a single content item"""
        try:
            print(f"[INFO] Playing content: {content_id}")
            
            # Fetch content metadata from Firestore (content is stored at root level)
            content_ref = self.firestore_db.collection('content').document(content_id)
            content_doc = content_ref.get()
            
            if not content_doc.exists:
                print(f"[ERROR] Content not found in Firestore: {content_id}")
                print(f"[DEBUG] Checked path: content/{content_id}")
                self.update_status("error", f"Content not found: {content_id}")
                return
            
            content_data = content_doc.to_dict()
            print(f"[INFO] Found content: {content_data.get('name')} ({content_data.get('type')})")
            
            # Get storage path
            storage_path = content_data.get('url', '')
            if not storage_path:
                print(f"[ERROR] No storage URL for content: {content_id}")
                self.update_status("error", "Content has no storage URL")
                return
            
            print(f"[DEBUG] Storage URL: {storage_path}")
            
            # Determine file extension from content type or URL
            content_type = content_data.get('type', 'video')
            file_extension = self._get_file_extension(storage_path, content_type)
            
            # Create local file path
            local_filename = f"{content_id}{file_extension}"
            local_path = os.path.join(CONTENT_DIR, local_filename)
            
            # Download if not already cached
            if not os.path.exists(local_path):
                print(f"[INFO] Downloading content from: {storage_path}")
                if not self.download_content(storage_path, local_path):
                    self.update_status("error", "Failed to download content")
                    return
            else:
                print(f"[INFO] Using cached content: {local_path}")
            
            # Prepare content info
            content_info = {
                'id': content_id,
                'name': content_data.get('name', 'Unknown'),
                'type': content_type,
                'url': storage_path,
            }
            
            # Play the file
            self.play_file(local_path, content_info)
            
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
        """Download content from Firebase Storage"""
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
                # It's a blob path, use Firebase Storage SDK
                print(f"[INFO] Downloading from blob path...")
                blob = self.storage_bucket.blob(storage_path)
                blob.download_to_filename(local_path)
            
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
        """Play next content from queue"""
        if self.current_index < len(self.content_queue):
            content_id = self.content_queue[self.current_index]
            # Play the content
            self.play_single_content(content_id)
        else:
            # Loop back to start
            self.current_index = 0
            if self.content_queue:
                self.play_from_queue()

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
