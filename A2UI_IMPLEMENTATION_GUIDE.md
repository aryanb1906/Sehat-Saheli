# A2UI Expansion Guide for Sehat-Saheli

Your project now uses a custom, cost-free implementation of the **A2UI (Agent-to-User Interface)** protocol via the Gemini Free Tier. This allows the AI Assistant "Saheli" to spawn interactive native UI components in real-time within the chat rather than just sending text back to the user.

## How it works
There are no special "function calling" API costs. Instead:
1. **The LLM is prompted** to end its message with a specific ````json ... ```` blueprint containing `component` and `data` keys.
2. **The Frontend Chat Parser** (`parseA2UI` inside `app/mother/talk/page.tsx`) intercepts this, strips the JSON codeblock from being shown or spoken aloud, and extracts the data.
3. **The React Renderer Map** receives `parsed.component`, and renders a rich custom UI widget matching that string format.

## How to add a NEW UI Tool (Example: "VaccinationTracker")

### Step 1: Update the AI System Prompt
Open `app/api/chat/route.ts` and locate the `systemPrompt` definition. 
Add the instruction trigger:

```typescript
// Add the instruction
"If the user asks about their baby's vaccination schedule or next shots, you MUST reply with a Vaccination Planner UI component."

// Add the JSON format example inside the prompt instructions:
For Vaccination:
\`\`\`json
{
  "component": "VaccinationCard",
  "data": { "nextDue": "E.g. Polio Drop 2", "dueDate": "approximate date" }
}
\`\`\`
```

### Step 2: Add the Component Renderer in the Chat UI
Open `app/mother/talk/page.tsx` and scroll to the bottom of the `messages.map` where all the `parsed.component === ...` logic lives. 
Add your new rendering block:

```tsx
{/* Vaccination Card Renderer */}
{parsed.component === "VaccinationCard" && parsed.data && (
  <Card className="overflow-hidden border-2 w-full animate-in fade-in flex flex-col p-6 bg-cyan-50 dark:bg-card">
    <div className="flex flex-col items-center mb-4">
      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">💉</span>
      </div>
      <h3 className="text-xl font-bold text-cyan-800 mb-2">Vaccination Alert</h3>
      <p className="font-semibold text-cyan-900">Next due: {parsed.data.nextDue}</p>
      <p className="text-sm mt-1 text-foreground/80">{parsed.data.dueDate}</p>
    </div>
    <Button 
      className="w-full text-md font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm" 
      onClick={() => router.push('/mother/vaccination-tracker')}
    >
      Open Tracker
    </Button>
  </Card>
)}
```

### Best Practices

1. **Keep JSON blocks at the end**: The parser looks for the ````json` code block at the end of the AI's response text. Make sure the system prompt enforces this.
2. **Always include graceful fallbacks**: Make sure any nested `parsed.data.something` checks are handled correctly with `|| "Default text"` in case the LLM hallucinates an empty payload.
3. **Hide the Code from Text-to-Speech**: The `parseA2UI` implicitly removes the JSON block from the readable `message.content`, meaning the `{speakText(parsed.text)}` button will never try to read out raw code.

Enjoy building more interactive and stunning flows for your users!
