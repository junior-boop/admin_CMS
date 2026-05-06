# Runtime Instructions

This directory contains the logic for interacting with CMS data at runtime (e.g., in an Astro site using this CMS).

## CMS Clients
- `client.ts`: Provides the `createCMSClient` function. This is the main entry point for developers to access their content.
- `collections.ts`: Implements the proxy-based collection access logic.
- `cached-collections.ts`: Adds KV caching to collection operations.

## Media Handling
- `media.ts`: Handles interaction with Cloudflare R2 for media storage.

## Data Flow
1. The user project calls `createCMSClient(config, { db, kv })`.
2. The client returns a proxy that dynamically routes requests to the appropriate collection.
3. Requests are validated and then executed against D1 (with optional KV caching).

## State Management
- `state.ts`: Manages the global state of the CMS runtime within the worker/request lifecycle.

## Key Considerations
- Performance: Caching is critical. Ensure that read operations are cached where appropriate.
- Type Safety: The runtime must preserve the types defined in the user's configuration.
- Environment: Always assume the presence of Cloudflare bindings (`DB`, `CACHE`, `STORAGE`).
