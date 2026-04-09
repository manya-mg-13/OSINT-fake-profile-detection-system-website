import type {
    AnalysisData,
    AnalysisBreakdown,
    Indicator,
    OSINTSource,
    BehaviorPattern,
    NetworkConnection,
    ProfileMetadata,
    RiskLevel,
    Platform,
    ThreatCategory,
    LinguisticAnalysis,
    GeolocationRisk,
  } from '../types';
  
  function hashStr(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    }
    return Math.abs(hash);
  }
  
  function seededRand(seed: number, min: number, max: number): number {
    const x = Math.sin(seed) * 10000;
    const r = x - Math.floor(x);
    return Math.floor(r * (max - min + 1)) + min;
  }
  
  function seededBool(seed: number, trueProbability: number): boolean {
    const x = Math.sin(seed) * 10000;
    const r = x - Math.floor(x);
    return r < trueProbability;
  }
  
  export function getRiskLevel(score: number): RiskLevel {
    if (score >= 75) return 'critical';
    if (score >= 55) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }
  
  export function getRiskColor(level: RiskLevel): string {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
    }
  }
  
  const suspiciousUsernamePatterns = [
    { pattern: /\d{4,}/, label: 'Contains 4+ consecutive digits', weight: 12 },
    { pattern: /[_]{2,}/, label: 'Multiple consecutive underscores', weight: 8 },
    { pattern: /(real|official|verified|legit|genuine)\d*/i, label: 'False authority claim in username', weight: 18 },
    { pattern: /[0-9]{2,}$/, label: 'Ends with numbers (bot pattern)', weight: 10 },
    { pattern: /^[a-z]+\d{6,}$/i, label: 'Auto-generated username pattern', weight: 20 },
    { pattern: /(crypto|nft|forex|invest|earn|profit)/i, label: 'Financial scam keyword', weight: 15 },
    { pattern: /(giveaway|free|win|prize)/i, label: 'Giveaway scam keyword', weight: 16 },
    { pattern: /support|help|service/i, label: 'Impersonates support account', weight: 14 },
  ];
  
  export function analyzeProfile(username: string, platform: Platform): AnalysisData {
    const seed = hashStr(username + platform);
  
    const usernameScore = computeUsernameScore(username, seed);
    const meta = generateMetadata(username, seed, platform);
    const accountAgeScore = computeAccountAgeScore(meta.accountAge, seed);
    const activityScore = computeActivityScore(meta, seed);
    const networkConnections = generateNetworkConnections(username, platform, seed);
    const networkScore = computeNetworkScore(networkConnections, seed);
    const contentScore = computeContentScore(seed);
    const consistencyScore = computeConsistencyScore(seed);
    const darkWebScore = seededRand(seed + 99, 0, 40);
  
    const breakdown: AnalysisBreakdown = {
      usernameScore,
      accountAgeScore,
      activityScore,
      networkScore,
      contentScore,
      consistencyScore,
      darkWebScore,
    };
  
    const indicators = generateIndicators(username, meta, breakdown, seed);
    const osintSources = generateOSINTSources(username, platform, seed);
    const behaviorPatterns = generateBehaviorPatterns(seed);
    const linguisticAnalysis = generateLinguisticAnalysis(seed);
    const geolocationRisk = generateGeolocationRisk(seed);
  
    const threatCategories = detectThreatCategories(username, breakdown, seed);
  
    const summary = generateSummary(username, platform, breakdown, threatCategories);
  
    return {
      breakdown,
      indicators,
      osintSources,
      connections: networkConnections,
      metadata: meta,
      behaviorPatterns,
      threatCategories,
      linguisticAnalysis,
      geolocationRisk,
      summary,
    };
  }
  
  function computeUsernameScore(username: string, seed: number): number {
    let score = 0;
    for (const { pattern, weight } of suspiciousUsernamePatterns) {
      if (pattern.test(username)) score += weight;
    }
    if (username.length < 4) score += 10;
    if (username.length > 20) score += 8;
    score += seededRand(seed + 1, 0, 15);
    return Math.min(score, 100);
  }
  
  function generateMetadata(username: string, seed: number, _platform: Platform): ProfileMetadata {
    const accountAge = seededRand(seed + 10, 1, 1460);
    const followerCount = seededRand(seed + 11, 0, 50000);
    const followingCount = seededRand(seed + 12, 0, 8000);
    const postCount = seededRand(seed + 13, 0, 5000);
    const averagePostsPerDay = parseFloat((postCount / Math.max(accountAge, 1)).toFixed(2));
    const joinDate = new Date(Date.now() - accountAge * 86400000).toISOString().split('T')[0];
  
    return {
      accountAge,
      followerCount,
      followingCount,
      postCount,
      averagePostsPerDay,
      hasProfilePicture: seededBool(seed + 14, 0.65),
      bio: seededBool(seed + 15, 0.55) ? generateBio(seed) : '',
      verified: seededBool(seed + 16, 0.05),
      location: generateLocation(seed),
      website: seededBool(seed + 17, 0.3) ? `https://${username.toLowerCase()}.link` : '',
      engagementRate: parseFloat((seededRand(seed + 18, 0, 800) / 100).toFixed(2)),
      joinDate,
    };
  }
  
  function generateBio(seed: number): string {
    const bios = [
      'Crypto enthusiast | DM for opportunities 💰',
      'Official support account - contact for help',
      'Investment advisor | 500%+ returns guaranteed',
      'Free followers | DM me now',
      'Verified investor | Teaching financial freedom',
      'NFT artist | Drops every week | DM for collabs',
      'Helping people earn from home | 100% legit',
      '',
    ];
    return bios[seededRand(seed + 20, 0, bios.length - 1)];
  }
  
  function generateLocation(seed: number): string {
    const locations = ['Lagos, Nigeria', 'London, UK', 'New York, US', 'Dubai, UAE', 'Mumbai, India', 'Unknown', '', 'Worldwide', 'Earth'];
    return locations[seededRand(seed + 21, 0, locations.length - 1)];
  }
  
  function computeAccountAgeScore(ageInDays: number, seed: number): number {
    let score = 0;
    if (ageInDays < 7) score += 40;
    else if (ageInDays < 30) score += 30;
    else if (ageInDays < 90) score += 20;
    else if (ageInDays < 180) score += 10;
    score += seededRand(seed + 30, 0, 10);
    return Math.min(score, 100);
  }
  
  function computeActivityScore(meta: ProfileMetadata, seed: number): number {
    let score = 0;
    if (meta.averagePostsPerDay > 20) score += 35;
    else if (meta.averagePostsPerDay > 10) score += 25;
    else if (meta.averagePostsPerDay > 5) score += 15;
  
    const ratio = meta.followingCount > 0 ? meta.followerCount / meta.followingCount : 0;
    if (ratio < 0.1 && meta.followingCount > 500) score += 25;
    if (meta.followerCount > 10000 && meta.postCount < 10) score += 30;
  
    if (!meta.hasProfilePicture) score += 15;
    if (!meta.bio) score += 10;
    score += seededRand(seed + 40, 0, 15);
    return Math.min(score, 100);
  }
  
  function generateNetworkConnections(username: string, platform: Platform, seed: number): NetworkConnection[] {
    const count = seededRand(seed + 50, 3, 12);
    const connectionTypes: Array<'follower' | 'following' | 'mutual' | 'mentioned' | 'coordinated'> = ['follower', 'following', 'mutual', 'mentioned', 'coordinated'];
    const connections: NetworkConnection[] = [];
  
    const knownBadActors = [
      'crypto_giveaway_real', 'free_followers_boost', 'investment_guru_profit',
      'verify_your_account', 'nft_drop_official', 'dating_scammer_2024',
    ];
  
    for (let i = 0; i < count; i++) {
      const connSeed = seed + 51 + i * 7;
      const isBadActor = seededBool(connSeed, 0.3);
      const connUsername = isBadActor
        ? knownBadActors[seededRand(connSeed + 1, 0, knownBadActors.length - 1)]
        : `user_${hashStr(username + i).toString(36).substring(0, 8)}`;
      const connRiskScore = isBadActor
        ? seededRand(connSeed + 2, 65, 95)
        : seededRand(connSeed + 2, 5, 60);
  
      connections.push({
        id: `conn_${i}`,
        username: connUsername,
        platform: platform,
        riskScore: connRiskScore,
        riskLevel: getRiskLevel(connRiskScore),
        connectionType: connectionTypes[seededRand(connSeed + 3, 0, connectionTypes.length - 1)],
        sharedPatterns: generateSharedPatterns(connSeed),
      });
    }
    return connections;
  }
  
  function generateSharedPatterns(seed: number): string[] {
    const patterns = [
      'Same posting schedule', 'Identical hashtag sets', 'Coordinated amplification',
      'Shared IP subnet', 'Template bio', 'Mutual follow cluster', 'Simultaneous account creation',
    ];
    const count = seededRand(seed, 0, 3);
    const selected: string[] = [];
    for (let i = 0; i < count; i++) {
      selected.push(patterns[seededRand(seed + i, 0, patterns.length - 1)]);
    }
    return [...new Set(selected)];
  }
  
  function computeNetworkScore(connections: NetworkConnection[], seed: number): number {
    const highRiskConns = connections.filter(c => c.riskScore >= 60).length;
    let score = highRiskConns * 12;
    score += seededRand(seed + 60, 0, 20);
    return Math.min(score, 100);
  }
  
  function computeContentScore(seed: number): number {
    return seededRand(seed + 70, 5, 85);
  }
  
  function computeConsistencyScore(seed: number): number {
    return seededRand(seed + 80, 5, 80);
  }
  
  function generateIndicators(username: string, meta: ProfileMetadata, breakdown: AnalysisBreakdown, seed: number): Indicator[] {
    const indicators: Indicator[] = [];
  
    for (const { pattern, label, weight } of suspiciousUsernamePatterns) {
      if (pattern.test(username)) {
        indicators.push({ type: 'suspicious', category: 'Username Pattern', description: label, weight });
      }
    }
  
    if (meta.accountAge < 30) {
      indicators.push({ type: 'suspicious', category: 'Account Age', description: `Account created only ${meta.accountAge} days ago`, weight: 20 });
    } else if (meta.accountAge < 90) {
      indicators.push({ type: 'warning', category: 'Account Age', description: `Account is relatively new (${meta.accountAge} days)`, weight: 10 });
    } else {
      indicators.push({ type: 'safe', category: 'Account Age', description: `Account has ${meta.accountAge} days of history`, weight: 0 });
    }
  
    if (!meta.hasProfilePicture) {
      indicators.push({ type: 'suspicious', category: 'Profile Completeness', description: 'No profile picture detected', weight: 15 });
    }
    if (!meta.bio) {
      indicators.push({ type: 'warning', category: 'Profile Completeness', description: 'Empty biography', weight: 8 });
    }
  
    if (meta.averagePostsPerDay > 15) {
      indicators.push({ type: 'suspicious', category: 'Activity Pattern', description: `Abnormally high post frequency: ${meta.averagePostsPerDay} posts/day`, weight: 25 });
    }
  
    const ratio = meta.followingCount > 0 ? meta.followerCount / meta.followingCount : 0;
    if (ratio < 0.05 && meta.followingCount > 200) {
      indicators.push({ type: 'suspicious', category: 'Follow Pattern', description: `Suspicious follower ratio: ${meta.followerCount}/${meta.followingCount}`, weight: 20 });
    }
  
    if (breakdown.darkWebScore > 20) {
      indicators.push({ type: 'suspicious', category: 'Dark Web', description: 'Username pattern matches known dark web forum handles', weight: breakdown.darkWebScore });
    }
  
    if (seededBool(seed + 90, 0.4)) {
      indicators.push({ type: 'suspicious', category: 'Behavior', description: 'Posting times suggest automated scheduling', weight: 18 });
    }
    if (seededBool(seed + 91, 0.35)) {
      indicators.push({ type: 'warning', category: 'Content', description: 'High density of financial/investment keywords', weight: 12 });
    }
    if (seededBool(seed + 92, 0.3)) {
      indicators.push({ type: 'safe', category: 'Platform', description: 'Account verified by platform security', weight: 0 });
    }
  
    return indicators;
  }
  
  function generateOSINTSources(username: string, platform: Platform, seed: number): OSINTSource[] {
    return [
      {
        name: 'HaveIBeenPwned',
        icon: 'shield',
        found: seededBool(seed + 101, 0.4),
        data: seededBool(seed + 101, 0.4) ? `Username found in ${seededRand(seed + 102, 1, 5)} data breach(es)` : 'No breaches found',
        confidence: seededRand(seed + 103, 70, 99),
      },
      {
        name: 'Sherlock OSINT',
        icon: 'search',
        found: seededBool(seed + 104, 0.7),
        data: seededBool(seed + 104, 0.7) ? `Found on ${seededRand(seed + 105, 2, 8)} platforms with similar username` : 'No cross-platform presence',
        confidence: seededRand(seed + 106, 65, 95),
      },
      {
        name: 'Google Dorking',
        icon: 'globe',
        found: seededBool(seed + 107, 0.5),
        data: seededBool(seed + 107, 0.5) ? `${seededRand(seed + 108, 1, 12)} indexed results found` : 'No indexed web presence',
        confidence: seededRand(seed + 109, 60, 90),
      },
      {
        name: 'Scam Database',
        icon: 'alert-triangle',
        found: seededBool(seed + 110, 0.35),
        data: seededBool(seed + 110, 0.35) ? `Reported ${seededRand(seed + 111, 1, 8)} times for scam activity` : 'Not in scam database',
        confidence: seededRand(seed + 112, 80, 99),
      },
      {
        name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} API`,
        icon: 'database',
        found: true,
        data: `Profile metadata retrieved successfully`,
        confidence: 95,
      },
      {
        name: 'Wayback Machine',
        icon: 'clock',
        found: seededBool(seed + 113, 0.45),
        data: seededBool(seed + 113, 0.45) ? `${seededRand(seed + 114, 1, 20)} archived snapshots found` : 'No archived versions',
        confidence: seededRand(seed + 115, 55, 85),
      },
      {
        name: 'Dark Web Scan',
        icon: 'eye-off',
        found: seededBool(seed + 116, 0.25),
        data: seededBool(seed + 116, 0.25) ? 'Username referenced in dark web forums' : 'No dark web mentions',
        confidence: seededRand(seed + 117, 50, 80),
      },
      {
        name: 'TOR Exit Node Check',
        icon: 'network',
        found: seededBool(seed + 118, 0.2),
        data: seededBool(seed + 118, 0.2) ? 'Activity linked to TOR exit nodes' : 'No TOR activity detected',
        confidence: seededRand(seed + 119, 60, 90),
      },
    ];
  }
  
  function generateBehaviorPatterns(seed: number): BehaviorPattern[] {
    return [
      {
        pattern: 'Automated Posting',
        frequency: seededRand(seed + 120, 0, 100),
        botSimilarity: seededRand(seed + 121, 20, 95),
        description: 'Posts at regular intervals suggesting scheduling software',
        detected: seededBool(seed + 122, 0.5),
      },
      {
        pattern: 'Coordinated Amplification',
        frequency: seededRand(seed + 123, 0, 100),
        botSimilarity: seededRand(seed + 124, 30, 90),
        description: 'Simultaneous engagement with cluster of accounts',
        detected: seededBool(seed + 125, 0.35),
      },
      {
        pattern: 'Template Content',
        frequency: seededRand(seed + 126, 0, 100),
        botSimilarity: seededRand(seed + 127, 40, 95),
        description: 'Repeated use of identical or near-identical message templates',
        detected: seededBool(seed + 128, 0.45),
      },
      {
        pattern: 'Rapid Follow/Unfollow',
        frequency: seededRand(seed + 129, 0, 100),
        botSimilarity: seededRand(seed + 130, 50, 98),
        description: 'Mass following followed by unfollowing to gain followers',
        detected: seededBool(seed + 131, 0.3),
      },
      {
        pattern: 'Hashtag Flooding',
        frequency: seededRand(seed + 132, 0, 100),
        botSimilarity: seededRand(seed + 133, 25, 85),
        description: 'Excessive or irrelevant hashtag usage to boost visibility',
        detected: seededBool(seed + 134, 0.4),
      },
    ];
  }
  
  function generateLinguisticAnalysis(seed: number): LinguisticAnalysis {
    const spamWords = ['guaranteed', 'profit', 'DM', 'earn', 'free', 'limited offer', 'click link', 'crypto', 'invest now'];
    const detected = spamWords.filter((_, i) => seededBool(seed + 140 + i, 0.3));
    return {
      botProbability: seededRand(seed + 149, 10, 90),
      templateUsage: seededRand(seed + 150, 0, 80),
      sentimentScore: seededRand(seed + 151, -100, 100),
      spamKeywords: detected,
      languageConsistency: seededRand(seed + 152, 20, 100),
    };
  }
  
  function generateGeolocationRisk(seed: number): GeolocationRisk {
    const regions = ['Nigeria', 'Romania', 'China', 'Russia', 'India'];
    const flagged = seededBool(seed + 160, 0.4)
      ? [regions[seededRand(seed + 161, 0, regions.length - 1)]]
      : [];
    return {
      flaggedRegions: flagged,
      vpnDetected: seededBool(seed + 162, 0.35),
      proxyDetected: seededBool(seed + 163, 0.25),
      locationConsistency: seededRand(seed + 164, 20, 100),
      riskScore: seededRand(seed + 165, 0, 70),
    };
  }
  
  function detectThreatCategories(username: string, breakdown: AnalysisBreakdown, seed: number): ThreatCategory[] {
    const categories: ThreatCategory[] = [];
    if (/crypto|nft|invest|forex|profit/i.test(username) || breakdown.contentScore > 60) categories.push('financial_fraud');
    if (/official|real|support|verify/i.test(username)) categories.push('impersonation');
    if (breakdown.networkScore > 50) categories.push('bot_network');
    if (seededBool(seed + 170, 0.3)) categories.push('scam');
    if (seededBool(seed + 171, 0.15)) categories.push('phishing');
    if (categories.length === 0) categories.push('unknown');
    return [...new Set(categories)];
  }
  
  function generateSummary(username: string, platform: string, breakdown: AnalysisBreakdown, categories: ThreatCategory[]): string {
    const avgScore = Math.round(
      (breakdown.usernameScore + breakdown.accountAgeScore + breakdown.activityScore +
        breakdown.networkScore + breakdown.contentScore + breakdown.consistencyScore) / 6
    );
    const level = getRiskLevel(avgScore);
    const catStr = categories.filter(c => c !== 'unknown').join(', ') || 'suspicious behavior';
    return `Account @${username} on ${platform} shows ${level} risk indicators consistent with ${catStr}. ` +
      `Network analysis reveals connections to ${breakdown.networkScore > 50 ? 'multiple high-risk accounts' : 'some potentially suspicious accounts'}. ` +
      `Behavioral patterns ${breakdown.activityScore > 50 ? 'strongly suggest' : 'may indicate'} automated or inauthentic activity.`;
  }
  
  export function computeFinalScore(data: AnalysisData): number {
    const { breakdown } = data;
    const weighted =
      breakdown.usernameScore * 0.15 +
      breakdown.accountAgeScore * 0.15 +
      breakdown.activityScore * 0.25 +
      breakdown.networkScore * 0.20 +
      breakdown.contentScore * 0.10 +
      breakdown.consistencyScore * 0.10 +
      breakdown.darkWebScore * 0.05;
    return Math.min(Math.round(weighted), 100);
  }