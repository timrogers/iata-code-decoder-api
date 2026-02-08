# Plan: Cross-Platform MCP Server in Rust with Clipboard Support

## Executive Summary

This document outlines a comprehensive plan for implementing a cross-platform MCP (Model Context Protocol) server in Rust that provides clipboard functionality for AI agents. The server will enable AI systems to copy strings to the system clipboard across Windows, macOS, and Linux platforms.

## Project Overview

### Goals
1. Create a standalone MCP server implemented in Rust
2. Provide clipboard operations as MCP tools
3. Ensure cross-platform compatibility (Windows, macOS, Linux)
4. Maintain security and user consent for clipboard operations
5. Follow MCP specification and best practices

### Non-Goals
- This is NOT a replacement for the existing TypeScript IATA code decoder API
- This is a separate, complementary MCP server focused on clipboard operations
- Does not require integration with IATA code lookup functionality

## Architecture

### Technology Stack

#### Core Dependencies
- **Rust Edition**: 2021 or later
- **MCP SDK**: `mcp-server-rust` or implement based on MCP specification
- **Clipboard Library**: `arboard` (cross-platform clipboard support)
- **HTTP Server**: `axum` or `actix-web` (for remote MCP server)
- **Serialization**: `serde` and `serde_json`
- **Async Runtime**: `tokio`

#### Optional Dependencies
- **CLI Framework**: `clap` (for command-line interface)
- **Logging**: `tracing` and `tracing-subscriber`
- **Error Handling**: `thiserror` or `anyhow`

### Project Structure

```
rust-mcp-clipboard-server/
├── Cargo.toml                  # Project manifest
├── Cargo.lock                  # Dependency lock file
├── README.md                   # Project documentation
├── LICENSE.md                  # License file
├── .gitignore                  # Git ignore patterns
├── src/
│   ├── main.rs                 # Entry point
│   ├── lib.rs                  # Library root
│   ├── mcp/
│   │   ├── mod.rs              # MCP module root
│   │   ├── server.rs           # MCP server implementation
│   │   ├── transport.rs        # HTTP transport layer
│   │   └── tools.rs            # Tool definitions and handlers
│   ├── clipboard/
│   │   ├── mod.rs              # Clipboard module root
│   │   └── operations.rs       # Clipboard operations
│   └── error.rs                # Error types and handling
├── tests/
│   ├── integration_tests.rs    # Integration tests
│   └── clipboard_tests.rs      # Clipboard-specific tests
└── examples/
    └── client.rs               # Example MCP client

```

## Implementation Phases

### Phase 1: Project Setup (Week 1)

#### Tasks
1. **Initialize Rust Project**
   - Create new Rust project with `cargo new rust-mcp-clipboard-server`
   - Configure `Cargo.toml` with dependencies
   - Set up project structure
   - Initialize git repository

2. **Add Core Dependencies**
   ```toml
   [dependencies]
   arboard = "3.3"           # Cross-platform clipboard
   tokio = { version = "1.35", features = ["full"] }
   axum = "0.7"              # Web framework
   serde = { version = "1.0", features = ["derive"] }
   serde_json = "1.0"
   tracing = "0.1"
   tracing-subscriber = "0.3"
   thiserror = "1.0"
   uuid = { version = "1.6", features = ["v4"] }
   
   [dev-dependencies]
   reqwest = { version = "0.11", features = ["json"] }
   ```

3. **Set Up Development Environment**
   - Configure IDE (VS Code with rust-analyzer)
   - Set up CI/CD pipeline (GitHub Actions)
   - Configure linting (clippy) and formatting (rustfmt)

### Phase 2: Clipboard Operations (Week 2)

#### Tasks
1. **Implement Clipboard Module**
   - Create `src/clipboard/mod.rs`
   - Implement clipboard read/write operations using `arboard`
   - Handle platform-specific edge cases
   - Implement error handling for clipboard failures

2. **Clipboard Operations API**
   ```rust
   pub enum ClipboardOperation {
       Copy(String),
       Read,
       Clear,
   }
   
   pub struct ClipboardManager {
       clipboard: Mutex<Clipboard>,
   }
   
   impl ClipboardManager {
       pub fn new() -> Result<Self, ClipboardError>;
       pub fn copy_text(&self, text: String) -> Result<(), ClipboardError>;
       pub fn read_text(&self) -> Result<String, ClipboardError>;
       pub fn clear(&self) -> Result<(), ClipboardError>;
   }
   ```

3. **Test Cross-Platform Behavior**
   - Write unit tests for clipboard operations
   - Test on Windows, macOS, and Linux (via CI)
   - Handle permission and access errors gracefully

### Phase 3: MCP Protocol Implementation (Week 3-4)

#### Tasks
1. **Implement MCP Server Core**
   - Study MCP specification (based on current TypeScript implementation)
   - Implement MCP message types (initialize, list_tools, call_tool)
   - Create server state management
   - Implement session handling

2. **MCP Server Structure**
   ```rust
   pub struct McpServer {
       name: String,
       version: String,
       clipboard: Arc<ClipboardManager>,
   }
   
   impl McpServer {
       pub fn new(name: String, version: String) -> Result<Self, McpError>;
       pub async fn handle_initialize(&self, request: InitializeRequest) 
           -> Result<InitializeResponse, McpError>;
       pub async fn handle_list_tools(&self) -> Result<ListToolsResponse, McpError>;
       pub async fn handle_call_tool(&self, request: CallToolRequest) 
           -> Result<CallToolResponse, McpError>;
   }
   ```

3. **Define MCP Tools**
   - Tool 1: `copy_to_clipboard` - Copy text to system clipboard
   - Tool 2: `read_from_clipboard` - Read current clipboard content
   - Tool 3: `clear_clipboard` - Clear clipboard content

4. **Tool Schemas**
   ```rust
   // copy_to_clipboard
   {
       "name": "copy_to_clipboard",
       "description": "Copy a string to the system clipboard",
       "inputSchema": {
           "type": "object",
           "properties": {
               "text": {
                   "type": "string",
                   "description": "The text to copy to the clipboard"
               }
           },
           "required": ["text"]
       }
   }
   
   // read_from_clipboard
   {
       "name": "read_from_clipboard",
       "description": "Read the current text content from the system clipboard",
       "inputSchema": {
           "type": "object",
           "properties": {}
       }
   }
   
   // clear_clipboard
   {
       "name": "clear_clipboard",
       "description": "Clear the system clipboard",
       "inputSchema": {
           "type": "object",
           "properties": {}
       }
   }
   ```

### Phase 4: HTTP Transport Layer (Week 5)

#### Tasks
1. **Implement HTTP Server with Axum**
   - Create REST endpoints for MCP protocol
   - Implement SSE (Server-Sent Events) for streaming responses
   - Handle session management
   - Add CORS support

2. **HTTP Endpoints**
   ```
   POST   /mcp                  # Initialize new MCP session
   POST   /mcp/:sessionId       # Send MCP request
   GET    /mcp/:sessionId       # SSE endpoint for responses
   DELETE /mcp/:sessionId       # Close session
   GET    /health               # Health check endpoint
   ```

3. **Request/Response Handling**
   - Parse JSON-RPC 2.0 messages
   - Route to appropriate MCP handlers
   - Stream responses via SSE
   - Handle errors and timeouts

### Phase 5: Security and Permissions (Week 6)

#### Tasks
1. **Security Considerations**
   - Implement rate limiting (similar to existing API)
   - Add request validation
   - Sanitize clipboard content for security
   - Consider content size limits

2. **Permission Model**
   - Optional: Implement user consent for clipboard operations
   - Log all clipboard operations for audit
   - Consider adding a whitelist/blacklist for callers

3. **Configuration**
   ```toml
   [server]
   host = "127.0.0.1"
   port = 4001
   
   [security]
   max_clipboard_size = 10485760  # 10MB
   rate_limit_per_minute = 100
   require_user_consent = true
   
   [logging]
   level = "info"
   ```

### Phase 6: Testing (Week 7)

#### Tasks
1. **Unit Tests**
   - Test clipboard operations independently
   - Test MCP message parsing and routing
   - Test error handling

2. **Integration Tests**
   - Test full MCP request/response cycle
   - Test session management
   - Test concurrent requests
   - Test error scenarios

3. **Cross-Platform Testing**
   - Set up GitHub Actions for Windows, macOS, Linux
   - Test clipboard operations on each platform
   - Document platform-specific behaviors

### Phase 7: Documentation and Distribution (Week 8)

#### Tasks
1. **Write Documentation**
   - README with installation and usage instructions
   - API documentation for MCP tools
   - Architecture documentation
   - Contributing guidelines

2. **Build and Distribution**
   - Create release builds for all platforms
   - Set up GitHub releases
   - Consider packaging (e.g., Homebrew, Chocolatey, snap)
   - Provide Docker image (optional)

3. **Client Examples**
   - Example MCP client in Rust
   - Example usage with Claude Desktop
   - Example usage with other MCP clients

## Technical Design Decisions

### Why Rust?
1. **Performance**: Near-native performance for clipboard operations
2. **Memory Safety**: No garbage collection, predictable performance
3. **Cross-Platform**: Excellent cross-platform support with cargo
4. **Async**: First-class async/await support with Tokio
5. **Type Safety**: Strong type system prevents many bugs at compile time

### Why `arboard` for Clipboard?
1. **Cross-Platform**: Supports Windows, macOS, Linux out of the box
2. **Simple API**: Easy to use, well-documented
3. **Active Maintenance**: Regularly updated and maintained
4. **No Dependencies on GUI**: Works in headless environments

### Why Axum for HTTP?
1. **Modern**: Built on Tokio, hyper, and tower
2. **Type-Safe**: Leverages Rust's type system
3. **Performance**: Excellent performance characteristics
4. **Ergonomic**: Clean, intuitive API

## Deployment Considerations

### Local Deployment
```bash
# Build the server
cargo build --release

# Run the server
./target/release/rust-mcp-clipboard-server

# Or with configuration
./target/release/rust-mcp-clipboard-server --config config.toml
```

### Docker Deployment
```dockerfile
FROM rust:1.75 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libxcb1 libxcb-shape0 libxcb-xfixes0
COPY --from=builder /app/target/release/rust-mcp-clipboard-server /usr/local/bin/
EXPOSE 4001
CMD ["rust-mcp-clipboard-server"]
```

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "clipboard-server": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:4001/mcp"]
    }
  }
}
```

## Security Considerations

### 1. Clipboard Access Control
- **Problem**: Clipboard may contain sensitive information
- **Solution**: 
  - Optional user consent before clipboard operations
  - Rate limiting to prevent abuse
  - Audit logging of all operations

### 2. Content Validation
- **Problem**: Malicious content could be copied to clipboard
- **Solution**:
  - Size limits on clipboard content
  - Validation of input format
  - Sanitization of special characters if needed

### 3. Network Security
- **Problem**: Remote access to clipboard is sensitive
- **Solution**:
  - Default to localhost binding only
  - Optional HTTPS support
  - Authentication/authorization (optional)

### 4. Resource Limits
- **Problem**: DOS attacks via excessive requests
- **Solution**:
  - Rate limiting per session
  - Maximum session lifetime
  - Connection limits

## Testing Strategy

### Unit Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_copy_to_clipboard() {
        let manager = ClipboardManager::new().unwrap();
        let text = "Hello, World!".to_string();
        manager.copy_text(text.clone()).unwrap();
        let result = manager.read_text().unwrap();
        assert_eq!(result, text);
    }

    #[test]
    fn test_clear_clipboard() {
        let manager = ClipboardManager::new().unwrap();
        manager.copy_text("test".to_string()).unwrap();
        manager.clear().unwrap();
        // Note: Some platforms may not support reading empty clipboard
    }
}
```

### Integration Tests
```rust
#[tokio::test]
async fn test_mcp_copy_to_clipboard() {
    let server = start_test_server().await;
    let client = reqwest::Client::new();
    
    // Initialize session
    let init_response = client
        .post(&format!("{}/mcp", server.url()))
        .json(&json!({
            "jsonrpc": "2.0",
            "method": "initialize",
            "params": { "protocolVersion": "2024-11-05" },
            "id": 1
        }))
        .send()
        .await
        .unwrap();
    
    let session_id = /* extract from response */;
    
    // Call copy_to_clipboard tool
    let response = client
        .post(&format!("{}/mcp/{}", server.url(), session_id))
        .json(&json!({
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": "copy_to_clipboard",
                "arguments": { "text": "Test content" }
            },
            "id": 2
        }))
        .send()
        .await
        .unwrap();
    
    assert_eq!(response.status(), 200);
}
```

### Cross-Platform CI
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
    - name: Run tests
      run: cargo test --all-features
    - name: Run clippy
      run: cargo clippy -- -D warnings
    - name: Check formatting
      run: cargo fmt -- --check
```

## Performance Targets

### Response Time
- Clipboard operations: < 10ms (p95)
- MCP request handling: < 50ms (p95)
- Session initialization: < 100ms (p95)

### Throughput
- Support 1000+ requests per second per session
- Handle 100+ concurrent sessions

### Resource Usage
- Memory: < 50MB base + ~1MB per session
- CPU: < 5% idle, < 50% under load

## Future Enhancements

### Phase 2 Features (Post-MVP)
1. **Advanced Clipboard Operations**
   - Support for rich text (HTML, RTF)
   - Support for images
   - Support for files/file paths
   - Clipboard history

2. **Additional Tools**
   - `get_clipboard_formats` - List available formats
   - `copy_with_format` - Copy with specific format
   - `watch_clipboard` - Stream clipboard changes

3. **Integration Features**
   - Clipboard synchronization across devices
   - Clipboard sharing between MCP clients
   - Integration with existing IATA decoder API

4. **Advanced Security**
   - End-to-end encryption for clipboard content
   - OAuth/JWT authentication
   - Fine-grained permissions

## Migration/Integration Path

### Standalone Deployment
The Rust MCP clipboard server will be a separate project and can be deployed independently:
1. Different repository (e.g., `rust-mcp-clipboard-server`)
2. Different port (e.g., 4001 vs 4000)
3. Independent configuration
4. Can run alongside existing TypeScript API

### Optional Integration
If desired, the two servers could be integrated:
1. TypeScript API could proxy to Rust server for clipboard operations
2. Rust server could include IATA lookup tools
3. Shared session management between servers
4. Single entry point for all MCP tools

However, keeping them separate is recommended for:
- Separation of concerns
- Independent scaling
- Different deployment requirements
- Easier maintenance

## Success Criteria

### Functional Requirements
- ✅ Copy text to clipboard on Windows, macOS, Linux
- ✅ Read text from clipboard on all platforms
- ✅ Clear clipboard on all platforms
- ✅ Implement MCP protocol correctly
- ✅ Handle concurrent requests safely
- ✅ Proper error handling and reporting

### Non-Functional Requirements
- ✅ Response time < 50ms (p95)
- ✅ Memory usage < 100MB for 10 sessions
- ✅ Pass all tests on all platforms
- ✅ Security audit passes
- ✅ Documentation complete and clear

### Quality Requirements
- ✅ Code coverage > 80%
- ✅ No clippy warnings
- ✅ Formatted with rustfmt
- ✅ All dependencies up to date
- ✅ No known security vulnerabilities

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Project Setup | Week 1 | Project structure, dependencies configured |
| 2. Clipboard Operations | Week 2 | Working clipboard module with tests |
| 3. MCP Protocol | Week 3-4 | Complete MCP server implementation |
| 4. HTTP Transport | Week 5 | Working HTTP server with MCP endpoints |
| 5. Security | Week 6 | Security features implemented |
| 6. Testing | Week 7 | Comprehensive test suite |
| 7. Documentation | Week 8 | Complete documentation and examples |

**Total Duration**: 8 weeks

## Resources

### Learning Resources
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [arboard Documentation](https://docs.rs/arboard/)
- [Axum Documentation](https://docs.rs/axum/)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)

### Reference Implementations
- Current TypeScript MCP implementation in `src/api.ts`
- Official MCP SDK examples
- Rust MCP server examples (if available)

### Tools
- Rust toolchain (rustc, cargo, clippy, rustfmt)
- MCP Inspector for testing
- Postman/curl for HTTP testing
- GitHub Actions for CI/CD

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Platform-specific clipboard issues | High | Medium | Extensive testing on all platforms, fallback mechanisms |
| MCP protocol changes | Medium | Low | Follow stable version, implement version negotiation |
| Performance bottlenecks | Medium | Low | Early performance testing, profiling, optimization |
| Security vulnerabilities | High | Medium | Security audit, rate limiting, input validation |
| Library dependencies | Low | Medium | Pin versions, regular updates, minimal dependencies |

## Conclusion

This plan provides a comprehensive roadmap for implementing a cross-platform MCP server in Rust with clipboard functionality. The implementation will:

1. Be standalone and independent from the existing TypeScript API
2. Provide secure, fast clipboard operations
3. Follow MCP specification for AI agent integration
4. Support Windows, macOS, and Linux
5. Include comprehensive testing and documentation

The 8-week timeline is realistic for a high-quality implementation with proper testing and documentation. The modular architecture allows for future enhancements while maintaining a clean separation of concerns.
