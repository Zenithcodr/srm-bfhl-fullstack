import React, { useMemo, useState } from "react";

const initialPayload = JSON.stringify(
  {
    data: ["A->B", "A->C", "B->D"]
  },
  null,
  2
);

function TreeBranch({ node }) {
  const entries = Object.entries(node);

  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className="tree-branch">
      {entries.map(([key, value]) => (
        <li key={`${key}-${Object.keys(value).length}`}>
          <span className="tree-node">{key}</span>
          <TreeBranch node={value} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [payloadText, setPayloadText] = useState(initialPayload);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = useMemo(() => {
    const base = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

    if (!base) {
      return "/bfhl";
    }

    return `${base}/bfhl`;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    let parsed;

    try {
      parsed = JSON.parse(payloadText);
    } catch {
      setError("Invalid JSON. Please provide a valid JSON body.");
      return;
    }

    if (!parsed || !Array.isArray(parsed.data)) {
      setError('Payload must be in the form: { "data": [] }');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Request failed.");
      }

      const json = await response.json();
      setResult(json);
    } catch (requestError) {
      setError(requestError.message || "API call failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="hero-card">
        <h1>SRM Full Stack Engineering Challenge - Round 1</h1>
        <p>
          Submit node relationships to the <strong>/bfhl</strong> endpoint and inspect the returned hierarchy
          analysis.
        </p>
      </section>

      <section className="panel">
        <h2>Input</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="payload">Request Body (JSON)</label>

          <textarea
            id="payload"
            value={payloadText}
            onChange={(event) => setPayloadText(event.target.value)}
            rows={12}
            spellCheck={false}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>

      {result && (
        <>
          <section className="panel">
            <h2>Summary</h2>

            <div className="summary-grid">
              <article className="summary-card">
                <h3>Total Trees</h3>
                <p>{result.summary?.total_trees ?? 0}</p>
              </article>

              <article className="summary-card">
                <h3>Total Cycles</h3>
                <p>{result.summary?.total_cycles ?? 0}</p>
              </article>

              <article className="summary-card">
                <h3>Largest Tree Root</h3>
                <p>{result.summary?.largest_tree_root || "(none)"}</p>
              </article>
            </div>
          </section>

          <section className="panel">
            <h2>Hierarchies</h2>

            {Array.isArray(result.hierarchies) && result.hierarchies.length > 0 ? (
              <div className="hierarchy-grid">
                {result.hierarchies.map((item, index) => (
                  <article className="hierarchy-card" key={`${item.root}-${index}`}>
                    <h3>Root: {item.root}</h3>

                    {item.has_cycle ? (
                      <p className="cycle-badge">Cycle detected</p>
                    ) : (
                      <>
                        <p>Depth: {item.depth}</p>

                        <div className="tree-wrap">
                          <div className="tree-root">{item.root}</div>
                          <TreeBranch node={item.tree?.[item.root] || {}} />
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p>No hierarchies found.</p>
            )}
          </section>

          <section className="panel split">
            <article>
              <h2>Invalid Entries</h2>

              {Array.isArray(result.invalid_entries) && result.invalid_entries.length > 0 ? (
                <ul className="chip-list">
                  {result.invalid_entries.map((entry, index) => (
                    <li key={`${entry}-${index}`}>{entry === "" ? '""' : entry}</li>
                  ))}
                </ul>
              ) : (
                <p>None</p>
              )}
            </article>

            <article>
              <h2>Duplicate Edges</h2>

              {Array.isArray(result.duplicate_edges) && result.duplicate_edges.length > 0 ? (
                <ul className="chip-list">
                  {result.duplicate_edges.map((edge) => (
                    <li key={edge}>{edge}</li>
                  ))}
                </ul>
              ) : (
                <p>None</p>
              )}
            </article>
          </section>

          <section className="panel">
            <h2>Full JSON Response</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </section>
        </>
      )}
    </main>
  );
}