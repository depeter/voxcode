use serde::{Deserialize, Serialize};

// Messages sent from Rust to the sidecar (via stdin)
#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type")]
pub enum ToSidecar {
    #[serde(rename = "send")]
    Send {
        text: String,
        cwd: Option<String>,
    },
    #[serde(rename = "respond_permission")]
    RespondPermission {
        #[serde(rename = "requestId")]
        request_id: String,
        decision: String,
    },
    #[serde(rename = "set_permission_mode")]
    SetPermissionMode {
        mode: String,
    },
    #[serde(rename = "interrupt")]
    Interrupt,
}

// Messages received from the sidecar (via stdout)
#[derive(Debug, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum FromSidecar {
    #[serde(rename = "sdk_message")]
    SdkMessage {
        message: serde_json::Value,
    },
    #[serde(rename = "permission_request")]
    PermissionRequest {
        #[serde(rename = "requestId")]
        request_id: String,
        #[serde(rename = "toolName")]
        tool_name: String,
        input: serde_json::Value,
    },
    #[serde(rename = "session_ready")]
    SessionReady {
        #[serde(rename = "sessionId")]
        session_id: String,
    },
    #[serde(rename = "streaming_text")]
    StreamingText {
        text: String,
    },
    #[serde(rename = "turn_complete")]
    TurnComplete {
        messages: Vec<serde_json::Value>,
    },
    #[serde(rename = "error")]
    Error {
        message: String,
    },
}
