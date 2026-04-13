// ============================================================
// lib/scoring.ts — IPL Fantasy League Scoring Engine
// ============================================================

export interface PlayerMatchStats {
  // Identity
  playerId: string
  matchId: string
  isCaptain?: boolean
  isViceCaptain?: boolean
  isPlayoffMatch?: boolean

  // Participation
  playedInXI: boolean // true = Playing XI or Impact Player

  // Batting
  runs: number
  ballsFaced: number
  fours: number
  sixes: number
  isDismissed: boolean // false = not out

  // Bowling
  wickets: number
  oversBowled: number  // decimal e.g. 3.4 = 3 overs 4 balls
  runsConceded: number
  dotBalls: number
  maidenOvers: number
  hasHattrick: boolean // flagged by admin — can't derive from aggregates

  // Fielding
  catches: number
  stumpings: number
  directRunOuts: number   // sole credit
  assistedRunOuts: number // split credit (5 pts each)

  // Match awards (set after all players in the match are scored)
  isPlayerOfTheMatch?: boolean
  isTopScorerOfMatch?: boolean    // resolved via tiebreaker (SR)
  isTopWicketTakerOfMatch?: boolean // resolved via tiebreaker (economy)

  // Season awards (set at end of season — applied once)
  isPlayerOfSeries?: boolean
  hasOrangeCap?: boolean
  hasPurpleCap?: boolean
  isEmergingPlayer?: boolean
}

export interface PointsBreakdown {
  // Season
  playerOfSeries: number
  orangeCap: number
  purpleCap: number
  emergingPlayer: number

  // Match general
  xi: number
  playerOfMatch: number
  topScorer: number
  topWicketTaker: number

  // Batting
  runPoints: number
  fourPoints: number
  sixPoints: number
  strikeRateBonus: number
  milestone30: number
  milestone50: number
  milestone100: number

  // Bowling
  overPoints: number
  wicketPoints: number
  dotBallPoints: number
  maidenPoints: number
  economyBonus: number
  hattrickBonus: number
  haul3wBonus: number
  haul5wBonus: number
  haul6wBonus: number

  // Fielding
  catchPoints: number
  stumpingPoints: number
  directRunOutPoints: number
  assistedRunOutPoints: number

  // Totals
  rawTotal: number
  afterCaptainMultiplier: number
  afterPlayoffMultiplier: number
  finalScore: number
}

// ============================================================
// CONSTANTS
// ============================================================

const POINTS = {
  // Season awards
  PLAYER_OF_SERIES: 200,
  ORANGE_CAP: 200,
  PURPLE_CAP: 200,
  EMERGING_PLAYER: 200,

  // Match general
  XI_PARTICIPATION: 2,
  PLAYER_OF_MATCH: 50,
  TOP_SCORER: 10,
  TOP_WICKET_TAKER: 10,

  // Batting
  PER_RUN: 1,
  PER_FOUR: 2,
  PER_SIX: 3,
  MILESTONE_30: 10,
  MILESTONE_50: 25,
  MILESTONE_100: 50,
  STRIKE_RATE_BONUS: 5,       // SR > 200, min 10 balls
  STRIKE_RATE_THRESHOLD: 200,
  STRIKE_RATE_MIN_BALLS: 10,

  // Bowling
  PER_OVER: 2,
  PER_WICKET: 25,
  PER_DOT_BALL: 1,
  PER_MAIDEN: 20,
  ECONOMY_BONUS: 10,           // economy < 8, min 1 over
  ECONOMY_THRESHOLD: 8,
  ECONOMY_MIN_OVERS: 1,
  HATTRICK_BONUS: 75,
  HAUL_3W: 25,
  HAUL_5W: 50,
  HAUL_6W: 100,

  // Fielding
  PER_CATCH: 10,
  PER_STUMPING: 10,
  PER_DIRECT_RUNOUT: 10,
  PER_ASSISTED_RUNOUT: 5,

  // Multipliers
  CAPTAIN_MULTIPLIER: 2,
  VICE_CAPTAIN_MULTIPLIER: 1.5,
  PLAYOFF_MULTIPLIER: 1.5,
} as const

/** Same values as `POINTS` — exported for the scoring rules page and docs. */
export const FANTASY_SCORING_POINT_VALUES = POINTS

// ============================================================
// HELPERS
// ============================================================

function strikeRate(runs: number, balls: number): number {
  if (balls === 0) return 0
  return (runs / balls) * 100
}

function economy(runsConceded: number, oversBowled: number): number {
  if (oversBowled === 0) return 0
  // oversBowled stored as decimal (3.4 = 3 overs 4 balls = 22 balls = 22/6 overs)
  const fullOvers = Math.floor(oversBowled)
  const extraBalls = Math.round((oversBowled - fullOvers) * 10)
  const totalOvers = fullOvers + extraBalls / 6
  return runsConceded / totalOvers
}

function completedOvers(oversBowled: number): number {
  // Returns full overs as a number for threshold checks (e.g. min 2 overs)
  const fullOvers = Math.floor(oversBowled)
  const extraBalls = Math.round((oversBowled - fullOvers) * 10)
  return fullOvers + extraBalls / 6
}

// ============================================================
// CORE SCORING FUNCTION
// ============================================================

export function calculateFantasyPoints(stats: PlayerMatchStats): PointsBreakdown {
  const b: PointsBreakdown = {
    playerOfSeries: 0, orangeCap: 0, purpleCap: 0, emergingPlayer: 0,
    xi: 0, playerOfMatch: 0, topScorer: 0, topWicketTaker: 0,
    runPoints: 0, fourPoints: 0, sixPoints: 0, strikeRateBonus: 0,
    milestone30: 0, milestone50: 0, milestone100: 0,
    overPoints: 0, wicketPoints: 0, dotBallPoints: 0, maidenPoints: 0,
    economyBonus: 0, hattrickBonus: 0, haul3wBonus: 0, haul5wBonus: 0, haul6wBonus: 0,
    catchPoints: 0, stumpingPoints: 0, directRunOutPoints: 0, assistedRunOutPoints: 0,
    rawTotal: 0, afterCaptainMultiplier: 0, afterPlayoffMultiplier: 0, finalScore: 0,
  }

  if (!stats.playedInXI) {
    // Player not in XI — zero points, skip all calculation
    b.finalScore = 0
    return b
  }

  // ── Season awards ──────────────────────────────────────────
  if (stats.isPlayerOfSeries)  b.playerOfSeries = POINTS.PLAYER_OF_SERIES
  if (stats.hasOrangeCap)      b.orangeCap      = POINTS.ORANGE_CAP
  if (stats.hasPurpleCap)      b.purpleCap      = POINTS.PURPLE_CAP
  if (stats.isEmergingPlayer)  b.emergingPlayer = POINTS.EMERGING_PLAYER

  // ── Match general ──────────────────────────────────────────
  b.xi = POINTS.XI_PARTICIPATION
  if (stats.isPlayerOfTheMatch)     b.playerOfMatch   = POINTS.PLAYER_OF_MATCH
  if (stats.isTopScorerOfMatch)     b.topScorer       = POINTS.TOP_SCORER
  if (stats.isTopWicketTakerOfMatch) b.topWicketTaker = POINTS.TOP_WICKET_TAKER

  // ── Batting ────────────────────────────────────────────────
  b.runPoints  = stats.runs  * POINTS.PER_RUN
  b.fourPoints = stats.fours * POINTS.PER_FOUR
  b.sixPoints  = stats.sixes * POINTS.PER_SIX

  // Milestones are additive — 100 runs earns all three tiers
  if (stats.runs >= 30)  b.milestone30  = POINTS.MILESTONE_30
  if (stats.runs >= 50)  b.milestone50  = POINTS.MILESTONE_50
  if (stats.runs >= 100) b.milestone100 = POINTS.MILESTONE_100

  // Strike rate bonus
  const sr = strikeRate(stats.runs, stats.ballsFaced)
  if (stats.ballsFaced >= POINTS.STRIKE_RATE_MIN_BALLS && sr > POINTS.STRIKE_RATE_THRESHOLD) {
    b.strikeRateBonus = POINTS.STRIKE_RATE_BONUS
  }

  // ── Bowling ────────────────────────────────────────────────
  b.overPoints    = Math.floor(stats.oversBowled) * POINTS.PER_OVER
  b.wicketPoints  = stats.wickets  * POINTS.PER_WICKET
  b.dotBallPoints = stats.dotBalls * POINTS.PER_DOT_BALL
  b.maidenPoints  = stats.maidenOvers * POINTS.PER_MAIDEN

  // Economy bonus
  const eco         = economy(stats.runsConceded, stats.oversBowled)
  const compOvers   = completedOvers(stats.oversBowled)
  if (compOvers >= POINTS.ECONOMY_MIN_OVERS && eco < POINTS.ECONOMY_THRESHOLD) {
    b.economyBonus = POINTS.ECONOMY_BONUS
  }

  // Hattrick — flagged by admin, stacks with everything
  if (stats.hasHattrick) b.hattrickBonus = POINTS.HATTRICK_BONUS

  // Wicket haul bonuses — additive (3W + 5W + 6W all stack)
  if (stats.wickets >= 3) b.haul3wBonus = POINTS.HAUL_3W
  if (stats.wickets >= 5) b.haul5wBonus = POINTS.HAUL_5W
  if (stats.wickets >= 6) b.haul6wBonus = POINTS.HAUL_6W

  // ── Fielding ───────────────────────────────────────────────
  b.catchPoints          = stats.catches         * POINTS.PER_CATCH
  b.stumpingPoints       = stats.stumpings       * POINTS.PER_STUMPING
  b.directRunOutPoints   = stats.directRunOuts   * POINTS.PER_DIRECT_RUNOUT
  b.assistedRunOutPoints = stats.assistedRunOuts * POINTS.PER_ASSISTED_RUNOUT

  // ── Totals ─────────────────────────────────────────────────
  b.rawTotal =
    b.playerOfSeries + b.orangeCap + b.purpleCap + b.emergingPlayer +
    b.xi + b.playerOfMatch + b.topScorer + b.topWicketTaker +
    b.runPoints + b.fourPoints + b.sixPoints +
    b.milestone30 + b.milestone50 + b.milestone100 + b.strikeRateBonus +
    b.overPoints + b.wicketPoints + b.dotBallPoints + b.maidenPoints +
    b.economyBonus + b.hattrickBonus + b.haul3wBonus + b.haul5wBonus + b.haul6wBonus +
    b.catchPoints + b.stumpingPoints + b.directRunOutPoints + b.assistedRunOutPoints

  // Step 1 — Captain / Vice Captain multiplier
  if (stats.isCaptain) {
    b.afterCaptainMultiplier = b.rawTotal * POINTS.CAPTAIN_MULTIPLIER
  } else if (stats.isViceCaptain) {
    b.afterCaptainMultiplier = b.rawTotal * POINTS.VICE_CAPTAIN_MULTIPLIER
  } else {
    b.afterCaptainMultiplier = b.rawTotal
  }

  // Step 2 — Playoff multiplier (applied after C/VC)
  if (stats.isPlayoffMatch) {
    b.afterPlayoffMultiplier = b.afterCaptainMultiplier * POINTS.PLAYOFF_MULTIPLIER
  } else {
    b.afterPlayoffMultiplier = b.afterCaptainMultiplier
  }

  b.finalScore = Math.round(b.afterPlayoffMultiplier)

  return b
}

// ============================================================
// MATCH-LEVEL RESOLUTION
// Resolves top scorer / top wicket taker AFTER all players
// in a match have been scored. Call this once per match.
// ============================================================

export interface MatchPlayerResult {
  playerId: string
  stats: PlayerMatchStats
}

/**
 * Resolves isTopScorerOfMatch and isTopWicketTakerOfMatch for all
 * players in a match, then returns final breakdown for each.
 *
 * Tiebreakers:
 *   Top scorer    → most runs, tie broken by highest strike rate
 *   Top wicket taker → most wickets, tie broken by lowest economy rate
 *
 * If two players are equal on both tiebreakers, both receive the bonus.
 */
export function resolveMatchAndScore(players: MatchPlayerResult[]): {
  playerId: string
  breakdown: PointsBreakdown
}[] {
  const active = players.filter(p => p.stats.playedInXI)

  // ── Top scorer ─────────────────────────────────────────────
  const batters = [...active].sort((a, b) => {
    if (b.stats.runs !== a.stats.runs) return b.stats.runs - a.stats.runs
    const srA = strikeRate(a.stats.runs, a.stats.ballsFaced)
    const srB = strikeRate(b.stats.runs, b.stats.ballsFaced)
    return srB - srA
  })

  const topRuns = batters[0]?.stats.runs ?? 0
  const topSR   = batters[0] ? strikeRate(batters[0].stats.runs, batters[0].stats.ballsFaced) : 0
  const topScorerIds = new Set(
    batters
      .filter(p => {
        if (p.stats.runs !== topRuns) return false
        const sr = strikeRate(p.stats.runs, p.stats.ballsFaced)
        return Math.abs(sr - topSR) < 0.01 // float equality guard
      })
      .map(p => p.playerId)
  )

  // ── Top wicket taker ───────────────────────────────────────
  const bowlers = [...active]
    .filter(p => p.stats.wickets > 0)
    .sort((a, b) => {
      if (b.stats.wickets !== a.stats.wickets) return b.stats.wickets - a.stats.wickets
      const ecoA = economy(a.stats.runsConceded, a.stats.oversBowled)
      const ecoB = economy(b.stats.runsConceded, b.stats.oversBowled)
      return ecoA - ecoB // lower economy is better
    })

  const topWickets = bowlers[0]?.stats.wickets ?? 0
  const topEco     = bowlers[0] ? economy(bowlers[0].stats.runsConceded, bowlers[0].stats.oversBowled) : 0
  const topWicketIds = new Set(
    bowlers
      .filter(p => {
        if (p.stats.wickets !== topWickets) return false
        const eco = economy(p.stats.runsConceded, p.stats.oversBowled)
        return Math.abs(eco - topEco) < 0.01
      })
      .map(p => p.playerId)
  )

  // ── Apply flags and score ──────────────────────────────────
  return players.map(({ playerId, stats }) => {
    const enriched: PlayerMatchStats = {
      ...stats,
      isTopScorerOfMatch:     topScorerIds.has(playerId),
      isTopWicketTakerOfMatch: topWicketIds.has(playerId),
    }
    return { playerId, breakdown: calculateFantasyPoints(enriched) }
  })
}

// ============================================================
// ENTRY-LEVEL AGGREGATION
// Takes resolved player breakdowns and sums points for one
// fantasy entry (15 players, 1 captain, 1 vice captain).
// ============================================================

export function calculateEntryMatchScore(
  playerBreakdowns: { playerId: string; breakdown: PointsBreakdown }[],
  entryPlayerIds: string[]  // the 15 players in this entry
): {
  totalScore: number
  perPlayer: { playerId: string; points: number }[]
} {
  const inEntry = playerBreakdowns.filter(p => entryPlayerIds.includes(p.playerId))

  const perPlayer = inEntry.map(p => ({
    playerId: p.playerId,
    points: p.breakdown.finalScore,
  }))

  const totalScore = perPlayer.reduce((sum, p) => sum + p.points, 0)

  return { totalScore, perPlayer }
}