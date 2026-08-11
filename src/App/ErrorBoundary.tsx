import React from "react"

type Props = { children: React.ReactNode }
type State = { error: Error | null }

// Last line of defence: if anything throws during render (e.g. a browser
// blocking an API we depend on), show a reload prompt instead of leaving the
// page blank. Plain inline styles and no i18n on purpose, since the crash
// could have happened above the providers those would rely on. The error is
// printed on the page itself, since on mobile there is often no way to reach
// the browser console.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    const { error } = this.state
    if (!error) {
      return this.props.children
    }
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1em",
          height: "100svh",
          margin: 0,
          padding: "1em",
          boxSizing: "border-box",
          background: "#000",
          color: "#fff",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <p>Something went wrong.</p>
        <button onClick={() => window.location.reload()}>Reload</button>
        <pre
          style={{
            width: "100%",
            maxWidth: "40em",
            maxHeight: "50svh",
            overflow: "auto",
            margin: 0,
            padding: "0.75em",
            boxSizing: "border-box",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid #444",
            borderRadius: "5px",
            fontFamily: "monospace",
            fontSize: "0.75em",
            textAlign: "left",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {error.stack ?? `${error.name}: ${error.message}`}
        </pre>
      </div>
    )
  }
}
