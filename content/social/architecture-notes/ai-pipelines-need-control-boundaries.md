# AI Pipelines Need Control Boundaries

Teaser:
AI belongs inside a governed integration path, not in charge of one.

Short LinkedIn:
Enterprise AI needs control boundaries. The model is useful, but it is not the system of record and it should not become the implicit owner of workflow state. A short note on preprocessing, scoped tool access, validation, approval, and controlled write-back.

Technical LinkedIn:
The framing is simple: AI is an untrusted reasoning component operating inside a governed integration path. That pushes design effort into input normalization, redaction, provenance, scoped MCP or tool access, deterministic validation, diffing, approval, and controlled adapter writes. The note includes a threat table for the common failure modes.

Suggested tags:
architecture-notes, ai-governance, workflow-validation, secure-integration
