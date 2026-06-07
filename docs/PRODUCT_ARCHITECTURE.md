# Product Architecture

`ai-video-studio` is a local-first AI + Remotion video studio. The current
product boundary is `VideoProject`: generation, page preview, segment editing,
and local export all operate on schema-validated project data.

## Core Loop

1. The user gives a topic, brief, story, or video requirement.
2. The provider receives the registered template descriptions, capabilities,
   schemas, and implementation rules.
3. The provider plans one or more `VideoSegment` items.
4. For each segment, the provider chooses one primary `templateId` based on
   the template's usage description and suitability.
5. The provider generates that template's structured `implementation`
   parameters.
6. Zod validates the returned `VideoProject`.
7. The page renders an assembled full-video preview from the project.
8. The user edits structured fields or asks for natural-language segment
   revision.
9. The render endpoint exports the current edited project through Remotion.

## Composition Model

The product should not ask AI to write Remotion source code. AI chooses from
existing templates and fills validated parameters.

The durable model is:

```txt
Remotion primitives/components
  reusable visual building blocks, transitions, layouts, media helpers

Template block contract
  semantic bridge that records a visual block's effect, AI-visible fields,
  and mapping from template parameters to Remotion primitives

Template
  describes when it should be used, which parameters it accepts, and how
  those parameters are rendered by composing blocks and Remotion
  primitives/components

VideoSegment
  user-facing editable unit; implemented by one primary template

VideoProject
  full generated video assembled from one or more segments
```

One template may internally compose many Remotion components. Those components
are implementation details of templates, not additional segment-level
templates.

For AI-assisted development, new visual capability should usually be introduced
as a small primitive plus a template-local block contract before changing a
template's top-level implementation schema.

External Remotion libraries may use the word `template` for reusable examples
such as text effects, charts, transitions, logo reveals, backgrounds, and
media layouts. In this product, treat those as Remotion component candidates,
not as `VideoSegment` templates. A reusable component only becomes a product
template if it can implement a complete segment intent and has a schema,
definition, runtime adapter, editor path, and registration.

## Directory Intent

Current and future structure should keep page UI, video runtime, template
metadata, and generation code separated:

```txt
src/app/
  Next.js routes, API routes, and product page entry points

src/components/
  product-page UI components only; not Remotion video components

src/remotion/
  Remotion root, compositions, and reusable video primitives/components

src/templates/
  template-local schema, server-safe definition, editor, runtime adapter,
  and bundle export

src/lib/
  shared project contracts, provider code, render helpers, and compatibility
  re-exports
```

When adding reusable video building blocks such as title scenes, bullet scenes,
captions, backgrounds, progress markers, or transitions, prefer a Remotion
runtime directory such as `src/remotion/primitives/` rather than
`src/components/`.

The component-library policy for external Remotion examples is documented in
`docs/REMOTION_COMPONENT_LIBRARY.md`.

## Template Selection Contract

Template definitions are part of the prompt contract. Each template should
explain:

- what use cases it is best for
- what use cases it should avoid
- expected text density and timing range
- required and optional implementation fields
- examples or rules that help the provider fill parameters safely

The provider should use those definitions to select the most suitable
template for each segment, then emit only schema-valid parameters for that
template.
