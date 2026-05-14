# Playwright Sanzu — Claude Code Guidelines

## Playwright Test Planner, Generator and Healer

- Always verify `.mcp.json` exists in the project root with browser tools configured before invoking the `@playwright-test-planner`, `@playwright-test-generator`, or `@playwright-test-healer` agents.

## Playwright Test Generation

- Run generated tests through a healer pass before declaring completion.
