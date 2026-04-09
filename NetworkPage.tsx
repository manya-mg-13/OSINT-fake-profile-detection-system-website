import { useState, useMemo } from 'react';
import { Network, ZoomIn, ZoomOut, Maximize2, Info, Search } from 'lucide-react';
import NetworkGraph from '../network/NetworkGraph';
import RiskBadge from '../shared/RiskBadge';
import { analyzeProfile, getRiskLevel, getRiskColor } from '../../lib/osint-engine';
import type { GraphNode, GraphEdge, Platform, RiskLevel } from '../../types';

const DEMO_TARGETS = ['crypto_giveaway_real', 'investment_guru_profit', 'bot_cluster_node'];

function buildGraphData(targetUsername: string, platform: Platform): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const data = analyzeProfile(targetUsername, platform);
  const nodes: GraphNode[] = [
    {
      id: 'target',
      username: targetUsername,
      platform,
      riskScore: 85,
      riskLevel: getRiskLevel(85),
      isTarget: true,
      x: 0, y: 0, vx: 0, vy: 0,
      radius: 20,
    },
  ];

  const edges: GraphEdge[] = [];

  data.connections.forEach((conn, i) => {
    const nodeId = `conn_${i}`;
    nodes.push({
      id: nodeId,
      username: conn.username,
      platform: conn.platform,
      riskScore: conn.riskScore,
      riskLevel: conn.riskLevel,
      isTarget: false,
      x: 0, y: 0, vx: 0, vy: 0,
      radius: Math.max(10, Math.min(18, 8 + conn.riskScore / 10)),
    });
    edges.push({
      source: 'target',
      target: nodeId,
      weight: conn.riskScore / 100,
      type: conn.connectionType,
    });

    if (i % 3 === 0 && i + 1 < data.connections.length) {
      edges.push({
        source: nodeId,
        target: `conn_${i + 1}`,
        weight: 0.4,
        type: 'associated',
      });
    }
  });

  return { nodes, edges };
}

export default function NetworkPage() {
  const [targetUsername, setTargetUsername] = useState(DEMO_TARGETS[0]);
  const [platform] = useState<Platform>('twitter');
  const [inputVal, setInputVal] = useState(DEMO_TARGETS[0]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');

  const { nodes, edges } = useMemo(() => buildGraphData(targetUsername, platform), [targetUsername, platform]);

  const filteredNodes = filter === 'all' ? nodes : nodes.filter(n => n.riskLevel === filter || n.isTarget);
  const filteredEdges = edges.filter(e => {
    if (filter === 'all') return true;
    const src = filteredNodes.find(n => n.id === e.source);
    const tgt = filteredNodes.find(n => n.id === e.target);
    return src && tgt;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.replace(/^@/, '').trim();
    if (clean) { setTargetUsername(clean); setSelectedNode(null); }
  };

  const stats = {
    total: nodes.length,
    critical: nodes.filter(n => n.riskLevel === 'critical').length,
    high: nodes.filter(n => n.riskLevel === 'high').length,
    medium: nodes.filter(n => n.riskLevel === 'medium').length,
    low: nodes.filter(n => n.riskLevel === 'low').length,
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Network size={16} className="text-cyan-400" />
          <span className="text-sm font-semibold text-white">Network Connection Map</span>
          <span className="text-xs text-slate-500">— Force-directed graph of account relationships</span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-lg pl-7 pr-3 py-1.5 text-sm text-white outline-none w-44"
              placeholder="username"
            />
          </div>
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
            <Search size={13} /> Map
          </button>
        </form>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r border-slate-800 bg-slate-950 flex flex-col flex-shrink-0 p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Network Stats</div>
            <div className="space-y-1.5">
              {[
                { label: 'Total Nodes', val: stats.total, color: 'text-white' },
                { label: 'Critical', val: stats.critical, color: 'text-red-400' },
                { label: 'High Risk', val: stats.high, color: 'text-orange-400' },
                { label: 'Medium', val: stats.medium, color: 'text-amber-400' },
                { label: 'Low Risk', val: stats.low, color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-slate-400">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter by Risk</div>
            <div className="space-y-1">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors capitalize ${
                    filter === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
                  }`}>{f === 'all' ? 'All Nodes' : `${f} risk`}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Legend</div>
            {(['critical', 'high', 'medium', 'low'] as RiskLevel[]).map(lvl => (
              <div key={lvl} className="flex items-center gap-2 mb-1.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getRiskColor(lvl) }} />
                <span className="text-xs text-slate-400 capitalize">{lvl} risk</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full border-2 border-white bg-transparent flex-shrink-0" />
              <span className="text-xs text-slate-400">Target account</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed">
            Drag to pan · Scroll to zoom · Click nodes for details
          </div>
        </div>

        <div className="flex-1 relative bg-[#060c18]"
          style={{ backgroundImage: 'radial-gradient(circle, #0f1a2e 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
          {nodes.length > 0 ? (
            <NetworkGraph nodes={filteredNodes} edges={filteredEdges} onNodeClick={setSelectedNode} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600">
              Loading network...
            </div>
          )}
        </div>

        {selectedNode && (
          <div className="w-64 border-l border-slate-800 bg-slate-950 p-4 flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-cyan-400" />
                <span className="text-sm font-semibold text-white">Node Details</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
            </div>

            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white mx-auto mb-3"
              style={{ backgroundColor: getRiskColor(selectedNode.riskLevel) + '40', border: `2px solid ${getRiskColor(selectedNode.riskLevel)}` }}>
              {selectedNode.username.charAt(0).toUpperCase()}
            </div>

            <div className="text-center mb-4">
              <div className="text-sm font-bold text-white">@{selectedNode.username}</div>
              <div className="text-xs text-slate-500 capitalize mt-0.5">{selectedNode.platform}</div>
              <div className="mt-2 flex justify-center">
                <RiskBadge level={selectedNode.riskLevel} score={selectedNode.riskScore} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-800 rounded p-2.5">
                <div className="text-slate-500 mb-0.5">Risk Score</div>
                <div className="text-white font-bold text-lg">{selectedNode.riskScore}/100</div>
                <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${selectedNode.riskScore}%`,
                    backgroundColor: getRiskColor(selectedNode.riskLevel)
                  }} />
                </div>
              </div>
              <div className="bg-slate-800 rounded p-2.5">
                <div className="text-slate-500">Role</div>
                <div className="text-white">{selectedNode.isTarget ? 'Investigation Target' : 'Connected Account'}</div>
              </div>
              <div className="bg-slate-800 rounded p-2.5">
                <div className="text-slate-500">Platform</div>
                <div className="text-white capitalize">{selectedNode.platform}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}