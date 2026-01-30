# MCP Gemini Design - MANDATORY FOR FRONTEND

## ABSOLUTE RULE - NEVER IGNORE

**You MUST NEVER write frontend/UI code yourself.**

Gemini is your frontend developer. You are NOT allowed to create visual components, pages, or interfaces without going through Gemini. This is NON-NEGOTIABLE.

### When to use Gemini? ALWAYS for:
- Creating a page (dashboard, landing, settings, etc.)
- Creating a visual component (card, modal, sidebar, form, button, etc.)
- Modifying the design of an existing element
- Anything related to styling/layout

### Exceptions (you can do it yourself):
- Modifying text/copy
- Adding JS logic without changing the UI
- Non-visual bug fixes
- Data wiring (useQuery, useMutation, etc.)

## MANDATORY Workflow

### 1. New project without existing design
```
STEP 1: generate_vibes → show options to the user
STEP 2: User chooses their vibe
STEP 3: create_frontend with the chosen vibe AND generateDesignSystem: true
STEP 4: Gemini returns code + designSystem in the response
STEP 5: Save the code to the target file AND save designSystem to design-system.md at project root
```

### 2. Subsequent pages/components (after first page)
```
Use create_frontend / modify_frontend / snippet_frontend with projectRoot parameter.
The design-system.md is automatically loaded and Gemini will use the exact same styles.
```

### 3. Existing project with its own design
```
ALWAYS pass CSS/theme files in the `context` parameter
```

### 4. After Gemini's response
```
Gemini returns code → YOU write it to disk with Write/Edit
```

## Design System Feature

When creating the FIRST page of a new project, set `generateDesignSystem: true` in create_frontend. Gemini will return both the code AND a complete design system with all colors, typography, spacing, buttons, inputs, cards, etc.

Save this design system to `design-system.md` at the project root. For all subsequent calls (create_frontend, modify_frontend, snippet_frontend), pass `projectRoot` and the design system will be automatically loaded. This ensures all pages have a consistent look and feel.
