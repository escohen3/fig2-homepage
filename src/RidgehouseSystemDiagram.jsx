import { useEffect, useMemo, useState } from "react";

const W = 1964;
const H = 782;

// Time each signal stage remains active.
const PULSE_MS = 650;

const baseInput = {
  id: "input",
  x: 705,
  y: 391,
};

const baseDecision = {
  id: "decision",
  x: 980,
  y: 391,
};

const baseOutput = {
  id: "output",
  x: 1255,
  y: 391,
};

const baseNodes = [
  // Inputs
  { id: "signals", x: 705, y: 170 },
  { id: "data", x: 535, y: 235 },
  { id: "context", x: 465, y: 391 },
  { id: "behavior-in", x: 535, y: 545 },
  { id: "devices", x: 705, y: 615 },

  // Outputs
  { id: "interface", x: 1255, y: 170 },
  { id: "product", x: 1425, y: 235 },
  { id: "behavior-out", x: 1495, y: 391 },
  { id: "brand", x: 1425, y: 545 },
  { id: "systems", x: 1255, y: 615 },
];

const inputNodeIds = baseNodes.slice(0, 5).map((node) => node.id);
const outputNodeIds = baseNodes.slice(5).map((node) => node.id);

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSubset(items) {
  const count = randomInteger(1, items.length);

  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, count);
}

function createSignalCycle() {
  return {
    phase: 0,
    inputNodeIds: randomSubset(inputNodeIds),
    outputNodeIds: randomSubset(outputNodeIds),
  };
}

export default function RidgehouseSystemDiagram() {
  const allBasePoints = useMemo(
    () => [baseInput, baseDecision, baseOutput, ...baseNodes],
    []
  );

  const motion = useMemo(() => {
    return Object.fromEntries(
      allBasePoints.map((point, index) => [
        point.id,
        {
          ax: 10 + (index % 4) * 5,
          ay: 8 + (index % 5) * 4,
          sx: 0.00045 + index * 0.000035,
          sy: 0.00038 + index * 0.00004,
          px: index * 1.7,
          py: index * 2.3,
        },
      ])
    );
  }, [allBasePoints]);

  const [time, setTime] = useState(0);
  const [signal, setSignal] = useState(createSignalCycle);

  /*
    Signal sequence:

    0. Random group of 1–5 input nodes
    1. Input hub
    2. Decision / AI
    3. Output hub
    4. Random group of 1–5 output nodes
    5. Output hub
    6. Decision / AI
    7. Input hub
    8. Repeat with new random groups
  */
  const activeIds = useMemo(() => {
    const sequence = [
      signal.inputNodeIds,
      ["input"],
      ["decision"],
      ["output"],
      signal.outputNodeIds,
      ["output"],
      ["decision"],
      ["input"],
    ];

    return new Set(sequence[signal.phase]);
  }, [signal]);

  useEffect(() => {
    let frame;

    const tick = (now) => {
      setTime(now);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSignal((current) => {
        const nextPhase = current.phase + 1;

        if (nextPhase >= 8) {
          return createSignalCycle();
        }

        return {
          ...current,
          phase: nextPhase,
        };
      });
    }, PULSE_MS);

    return () => window.clearInterval(interval);
  }, []);

  const floatPoint = (point) => {
    const pointMotion = motion[point.id];

    return {
      ...point,

      x:
        point.x +
        Math.sin(time * pointMotion.sx + pointMotion.px) * pointMotion.ax +
        Math.sin(time * pointMotion.sx * 0.41 + pointMotion.py) *
          pointMotion.ax *
          0.45,

      y:
        point.y +
        Math.cos(time * pointMotion.sy + pointMotion.py) * pointMotion.ay +
        Math.sin(time * pointMotion.sy * 0.52 + pointMotion.px) *
          pointMotion.ay *
          0.45,
    };
  };

  const input = floatPoint(baseInput);
  const decision = floatPoint(baseDecision);
  const output = floatPoint(baseOutput);
  const nodes = baseNodes.map(floatPoint);

  const inputNodes = nodes.slice(0, 5);
  const outputNodes = nodes.slice(5);

  const inputLines = inputNodes.map((node) => [input, node]);
  const outputLines = outputNodes.map((node) => [output, node]);

  const centerLines = [
    [input, decision],
    [decision, output],
  ];

  const allPoints = [input, decision, output, ...nodes];

  return (
    <section className="w-full bg-white px-6 py-24 text-black">
      <div className="mx-auto max-w-[1320px] text-center">
        <div className="mt-12 border-2 border-black px-4 py-10 md:px-12 md:py-16">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Animated system signal moving between inputs, AI, and outputs"
            className="h-auto w-full"
          >
            <defs>
              <filter
                id="signal-glow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="8" result="blur" />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
              strokeLinecap="round"
            >
              {[...centerLines, ...inputLines, ...outputLines].map(
                ([start, end], index) => (
                  <line
                    key={index}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                  />
                )
              )}
            </g>

            <g>
              {allPoints.map((node) => {
                const isActive = activeIds.has(node.id);

                return (
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
                      r={isActive ? 13 : 8}
                      fill={isActive ? "#ff2b2b" : "currentColor"}
                      filter={isActive ? "url(#signal-glow)" : undefined}
                      style={{
                        transition: "r 180ms ease, fill 180ms ease",
                      }}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}