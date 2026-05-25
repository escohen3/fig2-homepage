import { useEffect, useMemo, useState } from "react";

export default function RidgehouseSystemDiagram() {
  const W = 1964;
  const H = 782;

  const baseInput = { id: "input", x: 705, y: 391 };
  const baseDecision = { id: "decision", x: 980, y: 391 };
  const baseOutput = { id: "output", x: 1255, y: 391 };

  const baseNodes = [
    { id: "signals", label: "Signals", x: 705, y: 170, anchor: "top" },
    { id: "data", label: "Data", x: 535, y: 235, anchor: "left" },
    { id: "context", label: "Context", x: 465, y: 391, anchor: "left" },
    { id: "behavior-in", label: "Behavior", x: 535, y: 545, anchor: "left" },
    { id: "devices", label: "Devices", x: 705, y: 615, anchor: "bottom" },

    { id: "interface", label: "Interface", x: 1255, y: 170, anchor: "top" },
    { id: "product", label: "Product", x: 1425, y: 235, anchor: "right" },
    { id: "behavior-out", label: "Behavior", x: 1495, y: 391, anchor: "right" },
    { id: "brand", label: "Brand", x: 1425, y: 545, anchor: "right" },
    { id: "systems", label: "Systems", x: 1255, y: 615, anchor: "bottom" },
  ];

  const allBasePoints = useMemo(
    () => [baseInput, baseDecision, baseOutput, ...baseNodes],
    []
  );

  const motion = useMemo(() => {
    return Object.fromEntries(
      allBasePoints.map((p, i) => [
        p.id,
        {
          ax: 10 + (i % 4) * 5,
          ay: 8 + (i % 5) * 4,
          sx: 0.00045 + i * 0.000035,
          sy: 0.00038 + i * 0.00004,
          px: i * 1.7,
          py: i * 2.3,
        },
      ])
    );
  }, [allBasePoints]);

  const [t, setT] = useState(0);

  useEffect(() => {
    let frame;

    const tick = (now) => {
      setT(now);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, []);

  const floatPoint = (p) => {
    const m = motion[p.id];

    return {
      ...p,
      x:
        p.x +
        Math.sin(t * m.sx + m.px) * m.ax +
        Math.sin(t * m.sx * 0.41 + m.py) * m.ax * 0.45,
      y:
        p.y +
        Math.cos(t * m.sy + m.py) * m.ay +
        Math.sin(t * m.sy * 0.52 + m.px) * m.ay * 0.45,
    };
  };

  const input = floatPoint(baseInput);
  const decision = floatPoint(baseDecision);
  const output = floatPoint(baseOutput);
  const nodes = baseNodes.map(floatPoint);

  const inputNodes = nodes.slice(0, 5);
  const outputNodes = nodes.slice(5);

  const inputLines = inputNodes.map((n) => [input, n]);
  const outputLines = outputNodes.map((n) => [output, n]);

  const centerLines = [
    [input, decision],
    [decision, output],
  ];

  const labelProps = (node) => {
    const gap = 24;

    if (node.anchor === "left") {
      return {
        x: node.x - gap,
        y: node.y + 8,
        textAnchor: "end",
      };
    }

    if (node.anchor === "right") {
      return {
        x: node.x + gap,
        y: node.y + 8,
        textAnchor: "start",
      };
    }

    if (node.anchor === "top") {
      return {
        x: node.x,
        y: node.y - 26,
        textAnchor: "middle",
      };
    }

    return {
      x: node.x,
      y: node.y + 40,
      textAnchor: "middle",
    };
  };

  return (
    <section className="w-full bg-white px-6 py-24 text-black">
      <div className="mx-auto max-w-[1320px] text-center">
        <div className="mt-12 border-2 border-black px-4 py-10 md:px-12 md:py-16">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="System diagram showing input, decision layer, and output"
            className="h-auto w-full"
          >
            <g
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
              strokeLinecap="round"
            >
              {[...centerLines, ...inputLines, ...outputLines].map(
                ([a, b], i) => (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                  />
                )
              )}
            </g>

            <g>
              {[input, decision, output, ...nodes].map((node) => (
                <g key={node.id}>
                  
                  {node.id === "decision" && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="122"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    fill="currentColor"
                  />
                </g>
              ))}
            </g>

            <g className="font-sans text-[36px] font-medium">
              <text
                x={input.x + 36}
                y={input.y - 30}
                textAnchor="start"
              >
                Input
              </text>

              <text
                x={decision.x}
                y={decision.y - 36}
                textAnchor="middle"
              >
                Decision Layer
              </text>

              <text
                x={decision.x}
                y={decision.y + 62}
                textAnchor="middle"
              >
                AI + Memory
              </text>

              <text
                x={output.x - 36}
                y={output.y - 30}
                textAnchor="end"
              >
                Output
              </text>

              {nodes.map((node) => {
                const props = labelProps(node);

                return (
                  <text key={node.id} {...props}>
                    {node.label}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}