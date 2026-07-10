# AI Concepts for Beginners Video Design

**Status:** completed and validated on 2026-07-10.

## Job

- Audience: Chinese-speaking AI beginners with no engineering prerequisite.
- Format: 16:9 landscape, 1920x1080, 30fps.
- Target duration: 7-9 minutes, owned by generated narration timing.
- Tone: natural, vivid, lightly humorous, never condescending.
- Output: a dedicated Agent Producer Remotion composition, not `VideoProject`.

## Narrative Order

The video uses one continuous metaphor: opening an AI restaurant whose staff
gradually gains memory, reference material, tools, procedures, specialist
skills, and teammates.

1. LLM: the broadly trained but currently empty-handed chef-brain.
2. Prompt: the customer's current order.
3. Context: everything currently placed on the chef's workbench.
4. RAG: the waiter who looks up the restaurant's private recipe archive before answering.
5. Function calling: the structured work order that asks a named tool to act.
6. MCP: the standard socket and menu that lets many tools connect consistently.
7. Agent: the manager that can observe, decide, act, and inspect the result.
8. Workflow: the fixed operating procedure used when repeatability matters.
9. Skill: a reusable specialist playbook loaded for a particular kind of task.
10. Subagent: a delegated specialist working on a bounded parallel assignment.
11. LangChain: one optional software toolbox for assembling model, retrieval,
    tool, agent, and workflow pieces; it is not synonymous with any of them.

## Story Structure

### Act 1: A brain that can talk

Start with a chef receiving the vague order “随便来点好吃的”. Reveal that an
LLM predicts useful language from training, while prompt and context determine
what it can use right now. Camera language moves from a wide restaurant reveal
to a close-up order ticket and then an overhead workbench view.

### Act 2: A brain that can look things up and act

The restaurant receives a recipe archive and tool wall. Retrieval is shown as
searching and carrying relevant cards back into the workbench. Function calling
turns a sentence into a precise tool ticket. MCP widens the camera to reveal a
standardized connector rail behind the tools.

### Act 3: A system that can organize work

The chef becomes a manager who loops through observe, plan, act, and check.
Workflow is contrasted as a railway line: less improvisation, more certainty.
Skills are specialist manuals; subagents are parallel stations with bounded
assignments. The finale zooms out to the complete system map, then identifies
LangChain as one construction kit rather than the entire building.

## Visual Direction

- Dark navy “night restaurant / control room” base with warm orange food-light,
  cyan tool-light, mint retrieval-light, and violet orchestration accents.
- Use repo primitives first: `GradientShiftBackground`, `GridPulse`, `Kicker`,
  `VideoPanel`, `CalloutGrid`, and `useEntranceProgress`.
- Add sample-local visual blocks only for concepts that require explicit
  relationships: context workbench, retrieval conveyor, tool ticket, MCP socket
  rail, agent loop, workflow rail, skill manuals, subagent split, and final map.
- All render-critical movement is frame-driven through Remotion APIs.
- Bottom captions stay clear of scene content and remove VoxCPM expression tags.

## Audio Direction

- Use the existing `voices/f5-tts/noobli` reference through VoxCPM voice clone.
- Delivery: warm Chinese science explainer, conversational, curious, lightly
  playful, medium-fast but clearly articulated.
- Use punctuation as caption/timing boundaries.
- Use only sparse expression tags, mainly `[Uhm]`, `[Question-ah]`, and
  `[laughing]` where they materially improve delivery.
- Generated WAV files, TTS summary, stills, and mp4 remain local-only.

## Acceptance

- Covers all eleven requested concepts in dependency-aware order.
- Includes at least one concrete example and one misconception correction per act.
- Explains agent versus workflow, skill versus prompt, subagent versus agent,
  function calling versus MCP, and LangChain versus the underlying concepts.
- Reuses standalone-video runtime and repo primitives.
- Registers a dedicated composition and producer sample manifest.
- Has a focused smoke, TypeScript/lint validation, representative still review,
  and a rendered mp4 when local runtime permits.
