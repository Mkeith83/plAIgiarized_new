from typing import Dict, List, Optional
import asyncio
import websockets
import json
from datetime import datetime
from ..logging.service import LoggingService
from ...ai.integration_hub import AIIntegrationHub

class RealTimeCollaboration:
    def __init__(self):
        self.logger = LoggingService()
        self.ai_hub = AIIntegrationHub()
        
        # Collaboration settings
        self.settings = {
            "max_participants": 50,
            "sync_interval": 1000,  # ms
            "batch_updates": True,
            "compression": True,
            "auto_resolve": True
        }
        
        # Active sessions
        self.sessions = {}
        self.participants = {}
        self.changes_queue = {}
        
        self._initialize_websockets()

    async def _initialize_websockets(self):
        """Initialize WebSocket server."""
        try:
            self.server = await websockets.serve(
                self._handle_connection,
                "0.0.0.0",
                8765
            )
            
            # Start background tasks
            asyncio.create_task(self._process_changes())
            asyncio.create_task(self._cleanup_sessions())

        except Exception as e:
            self.logger.error("Error initializing WebSockets", e)
            raise

    async def _handle_connection(self, websocket, path):
        """Handle new WebSocket connections."""
        try:
            # Authenticate connection
            auth = await websocket.recv()
            auth_data = json.loads(auth)
            
            if not self._validate_auth(auth_data):
                await websocket.close(1008, "Invalid authentication")
                return
            
            # Register participant
            participant_id = auth_data["user_id"]
            session_id = auth_data["session_id"]
            
            self._register_participant(
                participant_id,
                session_id,
                websocket
            )
            
            try:
                async for message in websocket:
                    await self._handle_message(
                        participant_id,
                        session_id,
                        message
                    )
            
            finally:
                self._unregister_participant(
                    participant_id,
                    session_id
                )

        except Exception as e:
            self.logger.error("Error handling connection", e)
            await websocket.close(1011, "Internal error")

    def _validate_auth(self, auth_data: Dict) -> bool:
        """Validate authentication data."""
        required_fields = ["user_id", "session_id", "token"]
        return all(field in auth_data for field in required_fields)

    def _register_participant(
        self,
        participant_id: str,
        session_id: str,
        websocket
    ):
        """Register new participant in session."""
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "participants": set(),
                "state": {},
                "last_update": datetime.now()
            }
            self.changes_queue[session_id] = []
        
        self.sessions[session_id]["participants"].add(participant_id)
        self.participants[participant_id] = {
            "websocket": websocket,
            "session_id": session_id,
            "last_active": datetime.now()
        }

    def _unregister_participant(
        self,
        participant_id: str,
        session_id: str
    ):
        """Unregister participant from session."""
        if session_id in self.sessions:
            self.sessions[session_id]["participants"].discard(participant_id)
            
            if not self.sessions[session_id]["participants"]:
                del self.sessions[session_id]
                del self.changes_queue[session_id]
        
        if participant_id in self.participants:
            del self.participants[participant_id]

    async def _handle_message(
        self,
        participant_id: str,
        session_id: str,
        message: str
    ):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "change":
                await self._queue_change(
                    session_id,
                    participant_id,
                    data["change"]
                )
            
            elif message_type == "sync":
                await self._send_state(
                    participant_id,
                    session_id
                )
            
            elif message_type == "ai_request":
                await self._handle_ai_request(
                    participant_id,
                    session_id,
                    data["request"]
                )

        except Exception as e:
            self.logger.error("Error handling message", e)

    async def _queue_change(
        self,
        session_id: str,
        participant_id: str,
        change: Dict
    ):
        """Queue change for processing."""
        self.changes_queue[session_id].append({
            "participant_id": participant_id,
            "change": change,
            "timestamp": datetime.now()
        })

    async def _process_changes(self):
        """Process queued changes periodically."""
        while True:
            try:
                for session_id, changes in self.changes_queue.items():
                    if not changes:
                        continue
                    
                    # Process changes in batch
                    if self.settings["batch_updates"]:
                        merged_changes = self._merge_changes(changes)
                        self.sessions[session_id]["state"].update(merged_changes)
                    else:
                        for change in changes:
                            self.sessions[session_id]["state"].update(
                                change["change"]
                            )
                    
                    # Notify participants
                    await self._broadcast_updates(session_id)
                    
                    # Clear processed changes
                    self.changes_queue[session_id] = []
                
                await asyncio.sleep(self.settings["sync_interval"] / 1000)

            except Exception as e:
                self.logger.error("Error processing changes", e)
                await asyncio.sleep(1)

    def _merge_changes(self, changes: List[Dict]) -> Dict:
        """Merge multiple changes intelligently."""
        merged = {}
        for change in sorted(changes, key=lambda x: x["timestamp"]):
            if self.settings["auto_resolve"]:
                self._resolve_conflicts(merged, change["change"])
            else:
                merged.update(change["change"])
        return merged

    def _resolve_conflicts(self, base: Dict, change: Dict):
        """Resolve conflicts between changes."""
        for key, value in change.items():
            if key in base:
                if isinstance(base[key], dict) and isinstance(value, dict):
                    self._resolve_conflicts(base[key], value)
                else:
                    # Keep most recent change
                    base[key] = value
            else:
                base[key] = value

    async def _broadcast_updates(self, session_id: str):
        """Broadcast updates to all session participants."""
        if session_id not in self.sessions:
            return
        
        message = {
            "type": "update",
            "state": self.sessions[session_id]["state"],
            "timestamp": datetime.now().isoformat()
        }
        
        if self.settings["compression"]:
            message = self._compress_message(message)
        
        tasks = []
        for participant_id in self.sessions[session_id]["participants"]:
            if participant_id in self.participants:
                websocket = self.participants[participant_id]["websocket"]
                tasks.append(websocket.send(json.dumps(message)))
        
        await asyncio.gather(*tasks)

    async def _send_state(self, participant_id: str, session_id: str):
        """Send current state to participant."""
        if participant_id not in self.participants:
            return
        
        websocket = self.participants[participant_id]["websocket"]
        state = self.sessions.get(session_id, {}).get("state", {})
        
        message = {
            "type": "state",
            "state": state,
            "timestamp": datetime.now().isoformat()
        }
        
        if self.settings["compression"]:
            message = self._compress_message(message)
        
        await websocket.send(json.dumps(message))

    async def _handle_ai_request(
        self,
        participant_id: str,
        session_id: str,
        request: Dict
    ):
        """Handle AI-related requests."""
        try:
            result = await self.ai_hub.process_document(request)
            
            if participant_id in self.participants:
                websocket = self.participants[participant_id]["websocket"]
                await websocket.send(json.dumps({
                    "type": "ai_response",
                    "result": result,
                    "request_id": request.get("id")
                }))

        except Exception as e:
            self.logger.error("Error handling AI request", e)

    async def _cleanup_sessions(self):
        """Clean up inactive sessions periodically."""
        while True:
            try:
                current_time = datetime.now()
                
                # Clean up inactive sessions
                inactive_sessions = [
                    session_id for session_id, session in self.sessions.items()
                    if not session["participants"]
                ]
                
                for session_id in inactive_sessions:
                    del self.sessions[session_id]
                    del self.changes_queue[session_id]
                
                # Clean up inactive participants
                inactive_participants = [
                    p_id for p_id, p in self.participants.items()
                    if (current_time - p["last_active"]).seconds > 300
                ]
                
                for participant_id in inactive_participants:
                    session_id = self.participants[participant_id]["session_id"]
                    self._unregister_participant(participant_id, session_id)
                
                await asyncio.sleep(60)

            except Exception as e:
                self.logger.error("Error cleaning up sessions", e)
                await asyncio.sleep(60)

    def _compress_message(self, message: Dict) -> Dict:
        """Compress message for transmission."""
        # Implement message compression if needed
        return message 