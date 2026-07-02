import { useEffect, useMemo, useRef, useState } from "react";

export default function RelationshipModel() {
  const [count, setCount] = useState(5);
  const [rhOn, setRhOn] = useState(false);
  const [time, setTime] = useState(0);
  const previousCount = useRef(count);

  const relationships = (count * (count - 1)) / 2;
  const newestNodeId = count - 1;
  const addedPerson = count > previousCount.current;

  // Expose inputs to Webflow / parent page
  useEffect(() => {
    window.RHRelationship = {
      setCount: (value) => setCount(Number(value)),
      setRhOn: (value) => setRhOn(Boolean(value)),
      toggleRhOn: () => setRhOn((current) => !current),
      getState: () => ({
        count,
        relationships,
        rhOn,
      }),
    };

    return () => {
      delete window.RHRelationship;
    };
  }, [count, relationships, rhOn]);

  // Expose outputs to Webflow / parent page
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("rh-relationship-update", {
        detail: {
          count,
          relationships,
          rhOn,
        },
      })
    );

    previousCount.current = count;
  }, [count, relationships, rhOn]);

  useEffect(() => {
    let frame;

    const animate = (timestamp) => {
      setTime(timestamp * 0.001);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const nodes = useMemo(() => {
    const radius = 180;
    const cx = 300;
    const cy = 300;

    return Array.from({ length: count }, (_, i) => {
      const angle = -Math.PI / 2 + (i / count) * Math.PI * 2;
      const baseX = cx + Math.cos(angle) * radius;
      const baseY = cy + Math.sin(angle) * radius;

      const phase = i * 1.37;
      const drift = 10;

      return {
        id: i,
        x: baseX + Math.cos(time * 0.55 + phase) * drift,
        y: baseY + Math.sin(time * 0.65 + phase) * drift,
      };
    });
  }, [count, time]);

  const lines = useMemo(() => {
    const all = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const isNewLine =
          addedPerson && (i === newestNodeId || j === newestNodeId);

        all.push({
          id: `${i}-${j}`,
          a: nodes[i],
          b: nodes[j],
          isNewLine,
        });
      }
    }

    return all;
  }, [nodes, addedPerson, newestNodeId]);

  return (
    <section className="relationship-section">
      <div className="relationship-model">
        <svg viewBox="0 0 600 600">
          {!rhOn &&
            lines.map(({ id, a, b, isNewLine }) => (
              <path
                key={id}
                d={`M ${a.x} ${a.y} Q 300 300 ${b.x} ${b.y}`}
                className={
                  isNewLine
                    ? "relationship-line relationship-line-new"
                    : "relationship-line"
                }
                fill="none"
                stroke="black"
                strokeWidth="0.15"
                pathLength="1"
              />
            ))}

          {rhOn && (
            <>
              <circle cx="300" cy="300" r="20" className="rh-core" />

              {nodes.map((node) => (
                <line
                  key={`organized-${node.id}`}
                  x1="300"
                  y1="300"
                  x2={node.x}
                  y2={node.y}
                  className="organized-line"
                />
              ))}
            </>
          )}

          {nodes.map((node) => (
            <circle
              key={`person-${node.id}`}
              cx={node.x}
              cy={node.y}
              r="3"
              className={
                node.id === newestNodeId && addedPerson
                  ? "person person-new"
                  : "person"
              }
            />
          ))}
        </svg>

        <div className="relationship-copy">
          <div className="relationship-stats">
            <p>Headcount: {count}</p>
            <p>Relationships: {relationships}</p>
          </div>
        </div>

        <div className="relationship-controls">
          <input
            type="range"
            min="2"
            max="50"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />

          <button
            className={rhOn ? "toggle active" : "toggle"}
            onClick={() => setRhOn(!rhOn)}
          >
            RH.OI {rhOn ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </section>
  );
}