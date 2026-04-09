import {
    AlertTriangle, CheckCircle, XCircle, Shield, Globe, Database,
    Activity, Network, Eye, Brain, MapPin, Clock, Users, BarChart2
  } from 'lucide-react';
  import RiskBadge from '../shared/RiskBadge';
  import type { AnalysisData, RiskLevel, Platform } from '../../types';
  import { getRiskColor } from '../../lib/osint-engine';
  
  interface Props {
    username: string;
    platform: Platform;
    riskScore: number;
    riskLevel: RiskLevel;
    data: AnalysisData;
    onViewNetwork: () => void;
  }
  
  function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
    const pct = (value / max) * 100;
    const color = value >= 60 ? 'bg-red-500' : value >= 35 ? 'bg-amber-500' : 'bg-emerald-500';
    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">{label}</span>
          <span className="text-white font-medium">{value}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }
  
  const riskGaugePath = (score: number) => {
    const angle = (score / 100) * 180 - 90;
    const rad = (angle * Math.PI) / 180;
    return { x: 60 + 45 * Math.cos(rad), y: 60 - 45 * Math.sin(rad) };
  };
  
  export default function RiskReport({ username, platform, riskScore, riskLevel, data, onViewNetwork }: Props) {
    const { breakdown, indicators, osintSources, behaviorPatterns, metadata, linguisticAnalysis, geolocationRisk, connections, threatCategories, summary } = data;
    const needle = riskGaugePath(riskScore);
    const color = getRiskColor(riskLevel);
  
    const suspiciousIndicators = indicators.filter(i => i.type === 'suspicious');
    const warningIndicators = indicators.filter(i => i.type === 'warning');
    const safeIndicators = indicators.filter(i => i.type === 'safe');
  
    return (
      <div className="space-y-5 max-w-5xl mx-auto">
        <div className="bg-slate-900 border rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center" style={{ borderColor: color + '30' }}>
          <div className="flex-shrink-0 text-center">
            <svg width="120" height="70" viewBox="0 0 120 70">
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${(riskScore / 100) * 157} 157`} style={{ transition: 'stroke-dasharray 1s ease' }} />
              <line x1="60" y1="60" x2={needle.x} y2={needle.y} stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="60" cy="60" r="4" fill="white" />
              <text x="60" y="50" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{riskScore}</text>
            </svg>
            <div className="mt-1">
              <RiskBadge level={riskLevel} size="lg" />
            </div>
          </div>
  
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-bold text-white">@{username}</h3>
                <div className="text-sm text-slate-400 capitalize mt-0.5">{platform} · Analyzed just now</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {threatCategories.filter(c => c !== 'unknown').map(cat => (
                  <span key={cat} className="text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-medium capitalize">
                    {cat.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{summary}</p>
            <div className="flex gap-3 flex-wrap">
              <button onClick={onViewNetwork} className="flex items-center gap-1.5 text-sm bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors">
                <Network size={14} /> View Network Map
              </button>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg">
                <Clock size={12} /> Joined {metadata.joinDate}
              </div>
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={15} className="text-cyan-400" />
              <span className="text-sm font-semibold text-white">Score Breakdown</span>
            </div>
            <ScoreBar label="Username Pattern" value={breakdown.usernameScore} />
            <ScoreBar label="Account Age" value={breakdown.accountAgeScore} />
            <ScoreBar label="Activity Pattern" value={breakdown.activityScore} />
            <ScoreBar label="Network Risk" value={breakdown.networkScore} />
            <ScoreBar label="Content Risk" value={breakdown.contentScore} />
            <ScoreBar label="Consistency" value={breakdown.consistencyScore} />
            <ScoreBar label="Dark Web" value={breakdown.darkWebScore} />
          </div>
  
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">Risk Indicators</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {suspiciousIndicators.map((ind, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-red-400">{ind.category}</div>
                    <div className="text-xs text-slate-400">{ind.description}</div>
                  </div>
                </div>
              ))}
              {warningIndicators.map((ind, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-amber-400">{ind.category}</div>
                    <div className="text-xs text-slate-400">{ind.description}</div>
                  </div>
                </div>
              ))}
              {safeIndicators.map((ind, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <CheckCircle size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-emerald-400">{ind.category}</div>
                    <div className="text-xs text-slate-400">{ind.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database size={15} className="text-cyan-400" />
              <span className="text-sm font-semibold text-white">OSINT Sources</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {osintSources.map((src, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${src.found ? 'bg-red-500/8 border-red-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${src.found ? 'bg-red-400' : 'bg-slate-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-300">{src.name}</div>
                    <div className="text-xs text-slate-500 truncate">{src.data}</div>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">{src.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} className="text-purple-400" />
              <span className="text-sm font-semibold text-white">Behavior Patterns</span>
            </div>
            <div className="space-y-3">
              {behaviorPatterns.map((bp, i) => (
                <div key={i} className={`p-3 rounded-lg border transition-colors ${bp.detected ? 'bg-orange-500/10 border-orange-500/20' : 'bg-slate-800/40 border-slate-700'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{bp.pattern}</span>
                    <div className="flex items-center gap-2">
                      {bp.detected && <span className="text-xs text-orange-400 font-semibold">DETECTED</span>}
                      <span className="text-xs text-slate-500">{bp.botSimilarity}% bot</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{bp.description}</p>
                  <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${bp.botSimilarity >= 70 ? 'bg-red-500' : bp.botSimilarity >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${bp.botSimilarity}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={15} className="text-cyan-400" />
                <span className="text-sm font-semibold text-white">Linguistic Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{linguisticAnalysis.botProbability}%</div>
                  <div className="text-xs text-slate-400">Bot Probability</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{linguisticAnalysis.templateUsage}%</div>
                  <div className="text-xs text-slate-400">Template Usage</div>
                </div>
              </div>
              {linguisticAnalysis.spamKeywords.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-1.5">Detected spam keywords:</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {linguisticAnalysis.spamKeywords.map(kw => (
                      <span key={kw} className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded border border-red-500/20">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
  
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-amber-400" />
                <span className="text-sm font-semibold text-white">Geolocation Risk</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className={`bg-slate-800 rounded-lg p-2.5 text-center border ${geolocationRisk.vpnDetected ? 'border-red-500/30' : 'border-slate-700'}`}>
                  <div className={`text-sm font-bold ${geolocationRisk.vpnDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                    {geolocationRisk.vpnDetected ? 'YES' : 'NO'}
                  </div>
                  <div className="text-xs text-slate-500">VPN</div>
                </div>
                <div className={`bg-slate-800 rounded-lg p-2.5 text-center border ${geolocationRisk.proxyDetected ? 'border-red-500/30' : 'border-slate-700'}`}>
                  <div className={`text-sm font-bold ${geolocationRisk.proxyDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                    {geolocationRisk.proxyDetected ? 'YES' : 'NO'}
                  </div>
                  <div className="text-xs text-slate-500">Proxy</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-2.5 text-center border border-slate-700">
                  <div className="text-sm font-bold text-white">{geolocationRisk.riskScore}</div>
                  <div className="text-xs text-slate-500">Geo Risk</div>
                </div>
              </div>
              {geolocationRisk.flaggedRegions.length > 0 && (
                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded p-2">
                  Flagged regions: {geolocationRisk.flaggedRegions.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
  
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">Connected Accounts ({connections.length})</span>
            <span className="text-xs text-slate-500">— Network connections identified via OSINT</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {connections.map(conn => (
              <div key={conn.id} className={`p-3 rounded-lg border flex items-start gap-3 ${
                conn.riskScore >= 60 ? 'bg-red-500/8 border-red-500/20' :
                conn.riskScore >= 35 ? 'bg-amber-500/8 border-amber-500/20' :
                'bg-slate-800/50 border-slate-700'
              }`}>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                  {conn.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">@{conn.username}</div>
                  <div className="text-xs text-slate-500 capitalize">{conn.connectionType}</div>
                  {conn.sharedPatterns.length > 0 && (
                    <div className="text-xs text-slate-600 truncate mt-0.5">{conn.sharedPatterns[0]}</div>
                  )}
                </div>
                <RiskBadge level={conn.riskLevel} size="sm" />
              </div>
            ))}
          </div>
        </div>
  
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-white">Account Metadata</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Account Age', value: `${metadata.accountAge} days` },
              { label: 'Followers', value: metadata.followerCount.toLocaleString() },
              { label: 'Following', value: metadata.followingCount.toLocaleString() },
              { label: 'Posts', value: metadata.postCount.toLocaleString() },
              { label: 'Posts/Day', value: metadata.averagePostsPerDay },
              { label: 'Engagement', value: `${metadata.engagementRate}%` },
              { label: 'Profile Pic', value: metadata.hasProfilePicture ? 'Yes' : 'No' },
              { label: 'Verified', value: metadata.verified ? 'Yes' : 'No' },
            ].map(item => (
              <div key={item.label} className="bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                <div className="text-sm font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
          {metadata.bio && (
            <div className="mt-3 p-3 bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Bio</div>
              <div className="text-sm text-slate-300">{metadata.bio}</div>
            </div>
          )}
        </div>
  
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${
          riskLevel === 'critical' || riskLevel === 'high'
            ? 'bg-red-500/10 border-red-500/30'
            : riskLevel === 'medium'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <Eye size={18} className={riskLevel === 'low' ? 'text-emerald-400' : 'text-red-400'} />
          <div>
            <div className="text-sm font-semibold text-white mb-1">Analyst Recommendation</div>
            <p className="text-sm text-slate-300">
              {riskLevel === 'critical' && 'IMMEDIATE ACTION REQUIRED. This profile exhibits multiple critical indicators of fraudulent activity. Report to platform authorities and relevant cybercrime units. Do not engage with this account.'}
              {riskLevel === 'high' && 'HIGH PRIORITY. Strong evidence of suspicious activity detected. Recommend reporting to platform and monitoring for coordinated behavior. Exercise extreme caution when interacting.'}
              {riskLevel === 'medium' && 'MONITOR. Several warning indicators present. Continue monitoring this account for escalation. Avoid sharing personal information.'}
              {riskLevel === 'low' && 'LOW RISK. Profile appears legitimate based on available OSINT data. Standard caution advised as with all online interactions.'}
            </p>
          </div>
        </div>
      </div>
    );
  }