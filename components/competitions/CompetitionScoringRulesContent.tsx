import type { ReactNode } from 'react'
import { RunMilestonesCallout } from '@/components/competitions/RunMilestonesCallout'
import { WicketHaulsCallout } from '@/components/competitions/WicketHaulsCallout'
import { ScoringRulesPointBadge as Pt } from '@/components/competitions/ScoringRulesPointBadge'
import { FANTASY_SCORING_POINT_VALUES as P } from '@/lib/updatedScoring'

function SectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-white/15 bg-white p-4 text-slate-900 shadow-xl sm:p-6">
      <h2 className="mb-3 border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  )
}

function RuleRow({
  label,
  points,
  children,
}: {
  label: string
  points: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="grid grid-cols-3 min-w-0 flex-1 flex-wrap items-center gap-2 justify-between">
        <span className="font-medium text-slate-800 col-span-1">{label}</span>
        <span className="col-span-1">{points}</span>
        <div className="col-span-1 min-w-0 text-sm leading-relaxed text-slate-600 sm:max-w-[min(100%,28rem)]">
          {children}
        </div>
      </div>
    </div>
  )
}

export const CompetitionScoringRulesContent = () => (
  <div className="space-y-5">
    <SectionCard title="How points work">
      <p className="mb-3 text-sm leading-relaxed text-slate-600">
        Fantasy points are calculated per player, per match. Only players in the{' '}
        <strong>playing XI</strong> (including <strong>Impact Player</strong>{' '}
        substitutions) earn points — everyone else scores <Pt>0</Pt> for that
        match.
      </p>
      <p className="text-sm leading-relaxed text-slate-600">
        Totals are built in order: <strong>raw match points</strong> (all
        categories below) → <strong>captain / vice-captain multiplier</strong> →{' '}
        <strong>playoff multiplier</strong> (if applicable) →{' '}
        <strong>rounded</strong> to the final score.
      </p>
    </SectionCard>

    <SectionCard title="Season awards (once per season)">
      <RuleRow
        label="Player of the series"
        points={<Pt>+{P.PLAYER_OF_SERIES}</Pt>}
      >
        Awarded once when the season’s player of the series is confirmed.
      </RuleRow>
      <RuleRow label="Orange Cap" points={<Pt>+{P.ORANGE_CAP}</Pt>}>
        End-of-season top run-scorer award.
      </RuleRow>
      <RuleRow label="Purple Cap" points={<Pt>+{P.PURPLE_CAP}</Pt>}>
        End-of-season top wicket-taker award.
      </RuleRow>
      <RuleRow label="Emerging player" points={<Pt>+{P.EMERGING_PLAYER}</Pt>}>
        Season emerging-player award when designated.
      </RuleRow>
    </SectionCard>

    <SectionCard title="Match awards">
      <RuleRow
        label="Playing XI / Impact Player"
        points={<Pt>+{P.XI_PARTICIPATION}</Pt>}
      >
        Flat bonus for being part of the playing XI or entering as Impact
        Player.
      </RuleRow>
      <RuleRow
        label="Player of the match"
        points={<Pt>+{P.PLAYER_OF_MATCH}</Pt>}
      >
        When named player of the match for that fixture.
      </RuleRow>
      <RuleRow
        label="Top scorer of the match"
        points={<Pt>+{P.TOP_SCORER}</Pt>}
      >
        Highest runs in the match; ties broken by strike rate. Everyone tied on
        runs + SR after tie-break can earn the bonus.
      </RuleRow>
      <RuleRow
        label="Top wicket-taker of the match"
        points={<Pt>+{P.TOP_WICKET_TAKER}</Pt>}
      >
        Most wickets in the match; ties broken by best (lowest) economy. Tied
        leaders on wickets + economy can share the bonus.
      </RuleRow>
    </SectionCard>

    <SectionCard title="Batting">
      <RuleRow label="Runs" points={<Pt>+{P.PER_RUN}/run</Pt>}>
        Each run scored adds {P.PER_RUN} fantasy point.
      </RuleRow>
      <RuleRow label="Fours" points={<Pt>+{P.PER_FOUR}/4</Pt>}>
        Each boundary four adds {P.PER_FOUR} points (in addition to run points).
      </RuleRow>
      <RuleRow label="Sixes" points={<Pt>+{P.PER_SIX}/6</Pt>}>
        Each six adds {P.PER_SIX} points (in addition to run points).
      </RuleRow>

      <RunMilestonesCallout />

      <RuleRow
        label="Strike rate bonus"
        points={<Pt>+{P.STRIKE_RATE_BONUS}</Pt>}
      >
        If you face at least {P.STRIKE_RATE_MIN_BALLS} balls and your strike
        rate is above {P.STRIKE_RATE_THRESHOLD}.
      </RuleRow>
    </SectionCard>

    <SectionCard title="Bowling">
      <RuleRow label="Overs bowled" points={<Pt>+{P.PER_OVER}/over</Pt>}>
        {P.PER_OVER} point per <strong>full</strong> over (integer part of overs
        bowled).
      </RuleRow>
      <RuleRow label="Wickets" points={<Pt>+{P.PER_WICKET}/wk</Pt>}>
        {P.PER_WICKET} points per dismissal.
      </RuleRow>
      <RuleRow label="Dot balls" points={<Pt>+{P.PER_DOT_BALL}/dot</Pt>}>
        {P.PER_DOT_BALL} point per dot ball bowled.
      </RuleRow>
      <RuleRow label="Maidens" points={<Pt>+{P.PER_MAIDEN}/mdn</Pt>}>
        {P.PER_MAIDEN} points per maiden over.
      </RuleRow>
      <RuleRow label="Economy bonus" points={<Pt>+{P.ECONOMY_BONUS}</Pt>}>
        Economy strictly below {P.ECONOMY_THRESHOLD}, with at least{' '}
        {P.ECONOMY_MIN_OVERS} completed overs.
      </RuleRow>
      <RuleRow
        label="Hat-trick (admin-flagged)"
        points={<Pt>+{P.HATTRICK_BONUS}</Pt>}
      >
        Must be flagged by admin; stacks with other bowling points.
      </RuleRow>

      <WicketHaulsCallout />
    </SectionCard>

    <SectionCard title="Fielding">
      <RuleRow label="Catches" points={<Pt>+{P.PER_CATCH}/catch</Pt>}>
        {P.PER_CATCH} points per catch.
      </RuleRow>
      <RuleRow label="Stumpings" points={<Pt>+{P.PER_STUMPING}/stumping</Pt>}>
        {P.PER_STUMPING} points per stumping.
      </RuleRow>
      <RuleRow
        label="Direct run-outs"
        points={<Pt>+{P.PER_DIRECT_RUNOUT}/RO</Pt>}
      >
        Sole credit for the dismissal.
      </RuleRow>
      <RuleRow
        label="Assisted run-outs"
        points={<Pt>+{P.PER_ASSISTED_RUNOUT}/assist</Pt>}
      >
        Shared credit between fielders.
      </RuleRow>
    </SectionCard>

    <SectionCard title="Captain, vice-captain & playoffs">
      <RuleRow label="Captain" points={<Pt>×{P.CAPTAIN_MULTIPLIER}</Pt>}>
        Entire raw total for that match (including awards) multiplied by{' '}
        {P.CAPTAIN_MULTIPLIER}.
      </RuleRow>
      <RuleRow
        label="Vice-captain"
        points={<Pt>×{P.VICE_CAPTAIN_MULTIPLIER}</Pt>}
      >
        Entire raw total multiplied by {P.VICE_CAPTAIN_MULTIPLIER}.
      </RuleRow>
      <RuleRow
        label="Playoff matches"
        points={<Pt>×{P.PLAYOFF_MULTIPLIER}</Pt>}
      >
        Applied after the captain/VC step on designated playoff fixtures.
      </RuleRow>
      <p className="mt-3 text-xs text-slate-500">
        Captain and vice-captain multipliers apply to the full raw total.
        Playoff multiplier applies after that step.
      </p>
    </SectionCard>

    <SectionCard title="Your fantasy squad">
      <p className="text-sm leading-relaxed text-slate-600">
        Each entry picks 15 players with one captain and one vice-captain. For a
        given match, each selected player’s <strong>final fantasy score</strong>{' '}
        (after all multipliers) counts toward your team total for that match.
        Points from players not in your squad are ignored.
      </p>
    </SectionCard>
  </div>
)
