import Link from "next/link";
import {
  TeamSelectionLi as Li,
  TeamSelectionP as P,
  TeamSelectionSectionCard as SectionCard,
  TeamSelectionUl as Ul,
} from "@/components/competitions/TeamSelectionRulesPrimitives";
import { SQUAD_RULES } from "@/lib/squadComposition";

interface CompetitionTeamSelectionRulesContentProps {
  competitionId: string;
}

export const CompetitionTeamSelectionRulesContent = ({
  competitionId,
}: CompetitionTeamSelectionRulesContentProps) => (
  <div className="space-y-5">
    <SectionCard title="What you are building">
      <P>
        Your <strong>fantasy entry</strong> is a squad of exactly <strong>15 players</strong>, split across three
        price tiers. You also set a <strong>team name</strong>, <strong>one captain</strong>, and{" "}
        <strong>one vice-captain</strong> from those 15. The app validates every rule below before your squad can be
        saved.
      </P>
      <P>
        After you submit, your picks are fixed for the competition (unless an admin reopens entries). Points for
        each match come from how those players perform — see{" "}
        <Link
          href={`/competitions/${competitionId}/scoring-rules`}
          className="font-medium text-slate-800 underline underline-offset-2 hover:text-slate-950"
        >
          Scoring rules
        </Link>{" "}
        for runs, wickets, bonuses, and captain / vice-captain multipliers.
      </P>
    </SectionCard>

    <SectionCard title="Three tiers (5 + 5 + 5 players)">
      <P>
        Players are grouped into <strong>three tiers</strong> by credit cost. You must pick <strong>exactly five</strong>{" "}
        players from each tier — no more, no fewer — for a total of 15.
      </P>
      <Ul>
        <Li>
          <strong>Tier 1</strong> — 5 players at <strong>1 credit</strong> each (budget picks).
        </Li>
        <Li>
          <strong>Tier 2</strong> — 5 players at <strong>3 credits</strong> each (mid-tier).
        </Li>
        <Li>
          <strong>Tier 3</strong> — 5 players at <strong>5 credits</strong> each (premium picks).
        </Li>
      </Ul>
      <P>
        Credits describe the <em>tier price band</em> for that player in the draft UI; they are not added up as a
        budget you spend — the structure is always 5×1 + 5×3 + 5×5 slots.
      </P>
    </SectionCard>

    <SectionCard title="Franchises and unique players">
      <P>
        Inside <strong>each tier column</strong>, you cannot pick two players from the <strong>same franchise</strong>.
        Tier 1 therefore has five different franchises; the same applies independently to Tier 2 and Tier 3.
      </P>
      <P>
        You <strong>can</strong> use the same franchise in a <em>different</em> tier (e.g. one CSK pick in Tier 1 and
        another in Tier 3) — the limit is <strong>per tier</strong>, not across all 15.
      </P>
      <P>
        The same <strong>player</strong> can appear only <strong>once</strong> in your squad: all 15 IDs must be
        distinct across every tier.
      </P>
    </SectionCard>

    <SectionCard title="Role balance (squad composition)">
      <P>
        Each player has a role: batter, bowler, wicket-keeper, or all-rounder. When all 15 spots are filled, your squad
        must satisfy <strong>all</strong> of these constraints (enforced server-side):
      </P>
      <Ul>
        <Li>
          At least <strong>{SQUAD_RULES.minBat} batters</strong>
        </Li>
        <Li>
          At least <strong>{SQUAD_RULES.minBowl} bowlers</strong>
        </Li>
        <Li>
          At least <strong>{SQUAD_RULES.minWk} wicket-keepers</strong>
        </Li>
        <Li>
          At most <strong>{SQUAD_RULES.maxAllrounder} all-rounders</strong>
        </Li>
      </Ul>
      <P>
        If you are short on a minimum or over the all-rounder cap, the UI shows which requirement failed. Adjust your
        picks until the composition panel shows the rules as satisfied.
      </P>
    </SectionCard>

    <SectionCard title="Captain, vice-captain & team name">
      <P>
        <strong>Captain</strong> and <strong>vice-captain</strong> are both required. Each must be one of your 15
        players, they must be <strong>different people</strong>, and they must belong to <strong>different franchises</strong>{" "}
        (e.g. if your captain plays for CSK, your vice-captain cannot be any other CSK player in your squad).
      </P>
      <P>
        Enter a <strong>team name</strong> (up to 120 characters, visible on the leaderboard). How captain (×2) and
        vice-captain (×1.5) apply to match scores is in{" "}
        <Link
          href={`/competitions/${competitionId}/scoring-rules`}
          className="font-medium text-slate-800 underline underline-offset-2 hover:text-slate-950"
        >
          Scoring rules
        </Link>
        .
      </P>
    </SectionCard>

    <SectionCard title="Who can submit and when">
      <Ul>
        <Li>
          You must <strong>join the competition</strong> (be a participant) before you can save an entry.
        </Li>
        <Li>
          Submissions are only accepted while <strong>entries are open</strong>: before the competition’s published{" "}
          <strong>entry deadline</strong>, and unless an admin has <strong>frozen</strong> entries early.
        </Li>
        <Li>
          After the deadline or freeze, you cannot create or update your squad through the normal flow.
        </Li>
      </Ul>
    </SectionCard>

    <SectionCard title="Summary checklist">
      <Ul>
        <Li>15 players: 5 from Tier 1, 5 from Tier 2, 5 from Tier 3</Li>
        <Li>No duplicate player across the full squad</Li>
        <Li>Within each tier: at most one player per franchise</Li>
        <Li>
          Roles: ≥{SQUAD_RULES.minBat} bat, ≥{SQUAD_RULES.minBowl} bowl, ≥{SQUAD_RULES.minWk} WK, ≤
          {SQUAD_RULES.maxAllrounder} all-rounders
        </Li>
        <Li>Captain + vice-captain from the 15; different players and different franchises</Li>
        <Li>Team name set</Li>
        <Li>Submitted while entries are open</Li>
      </Ul>
    </SectionCard>
  </div>
);
