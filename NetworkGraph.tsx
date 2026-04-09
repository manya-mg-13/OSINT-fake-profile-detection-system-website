import { useEffect, useRef, useState, useCallback } from 'react';
import type { GraphNode, GraphEdge, RiskLevel } from '../../types';
import { getRiskColor } from '../../lib/osint-engine';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
}

const REPULSION = 4000;
const ATTRACTION = 0.04;
const DAMPING = 0.85;
const TICK_COUNT = 200;

function initSimulation(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number): GraphNode[] {
  const angle = (2 * Math.PI) / nodes.length;
  const radius = Math.min(width, height) * 0.3;
  const cx = width / 2;
  const cy = height / 2;

  const positioned = nodes.map((n, i) => ({
    ...n,
    x: n.isTarget ? cx : cx + radius * Math.cos(i * angle),
    y: n.isTarget ? cy : cy + radius * Math.sin(i * angle),
    vx: 0,
    vy: 0,
  }));

  for (let tick = 0; tick < TICK_COUNT; tick++) {
    for (let i = 0; i < positioned.length; i++) {
      let fx = 0, fy = 0;
      for (let j = 0; j < positioned.length; j++) {
        if (i === j) continue;
        const dx = positioned[i].x - positioned[j].x;
        const dy = positioned[i].y - positioned[j].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = REPULSION / (dist * dist);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }

      for (const edge of edges) {
        if (edge.source === positioned[i].id || edge.target === positioned[i].id) {
          const other = edge.source === positioned[i].id
            ? positioned.find(n => n.id === edge.target)
            : positioned.find(n => n.id === edge.source);
          if (other) {
            fx -= (positioned[i].x - other.x) * ATTRACTION;
            fy -= (positioned[i].y - other.y) * ATTRACTION;
          }
        }
      }

      if (positioned[i].isTarget) { fx = (cx - positioned[i].x) * 0.2; fy = (cy - positioned[i].y) * 0.2; }

      positioned[i].vx = (positioned[i].vx + fx) * DAMPING;
      positioned[i].vy = (positioned[i].vy + fy) * DAMPING;
      positioned[i].x = Math.max(40, Math.min(width - 40, positioned[i].x + positioned[i].vx));
      positioned[i].y = Math.max(40, Math.min(height - 40, positioned[i].y + positioned[i].vy));
    }
  }
  return positioned;
}

export default function NetworkGraph({ nodes, edges, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simNodes, setSimNodes] = useState<GraphNode[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const { width, height } = svgRef.current.getBoundingClientRect();
    const w = width || 800;
    const h = height || 600;
    const sim = initSimulation(nodes, edges, w, h);
    setSimNodes(sim);
  }, [nodes, edges]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ ...pan });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: panStart.x + (e.clientX - dragStart.x),
      y: panStart.y + (e.clientY - dragStart.y),
    });
  }, [dragging, dragStart, panStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(2.5, z - e.deltaY * 0.001)));
  }, []);

  const getEdgeColor = (weight: number) => {
    if (weight >= 0.8) return '#ef4444';
    if (weight >= 0.5) return '#f97316';
    return '#475569';
  };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full select-none"
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <defs>
        <radialGradient id="glow-critical" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-high" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-medium" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
        </radialGradient>
        <filter id="blur-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
        </marker>
      </defs>

      <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
        {edges.map((edge, i) => {
          const src = simNodes.find(n => n.id === edge.source);
          const tgt = simNodes.find(n => n.id === edge.target);
          if (!src || !tgt) return null;
          const isHovered = hoveredId === edge.source || hoveredId === edge.target;
          return (
            <line
              key={i}
              x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
              stroke={getEdgeColor(edge.weight)}
              strokeWidth={isHovered ? 2 : 1}
              strokeOpacity={isHovered ? 0.8 : 0.35}
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {simNodes.map(node => {
          const r = node.isTarget ? 22 : node.radius;
          const color = getRiskColor(node.riskLevel);
          const isHov = hoveredId === node.id;
          return (
            <g key={node.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onNodeClick(node)}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {(node.riskLevel === 'critical' || node.riskLevel === 'high' || isHov) && (
                <circle cx={node.x} cy={node.y} r={r * 2.5} fill={`url(#glow-${node.riskLevel})`} />
              )}
              <circle
                cx={node.x} cy={node.y} r={r + 4}
                fill="none"
                stroke={color}
                strokeWidth={isHov ? 2 : 1}
                strokeOpacity={isHov ? 0.8 : 0.3}
              />
              <circle
                cx={node.x} cy={node.y} r={r}
                fill={color}
                fillOpacity={node.isTarget ? 0.9 : 0.7}
                stroke={color}
                strokeWidth={node.isTarget ? 2 : 1}
                filter={isHov ? 'url(#blur-glow)' : undefined}
              />
              {node.isTarget && (
                <text x={node.x} y={node.y + 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  TARGET
                </text>
              )}
              <text
                x={node.x}
                y={node.y + r + 14}
                textAnchor="middle"
                fill={isHov ? 'white' : '#94a3b8'}
                fontSize={isHov ? 12 : 10}
                fontWeight={node.isTarget ? 'bold' : 'normal'}
              >
                @{node.username.length > 12 ? node.username.substring(0, 10) + '..' : node.username}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}