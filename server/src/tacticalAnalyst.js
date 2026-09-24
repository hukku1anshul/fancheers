// Tactical Insight Engine
// Contextual tactical knowledge, rules breakdowns, and strategic analysis by sport

const TACTICAL_KNOWLEDGE = {
  cricket: [
    {
      condition: (m) => m?.score?.includes('/') || true,
      tag: 'DRS & PITCH ANALYSIS',
      insight: 'Ultra-edge confirms clean daylight between bat and pad. Ball-tracking projected clipping top of leg bail.',
      advantage: 'Bowling Side +6% control',
      answers: {
        'Why overturned?': 'Ball-tracking algorithm verified impact in-line and projected the trajectory clipping the leg-stump.',
        'Tactical advantage?': 'Batting team is 1 wicket away from exposing the lower-order tailenders before over 40.',
        'Momentum key?': 'Conserving top-order wickets while rotating singles into deep backward square-leg.'
      }
    },
    {
      tag: 'DEATH OVER BLUEPRINT',
      insight: 'Fielders pushed to wide long-off boundary. Bowlers targeting 135kph blockhole yorkers outside off-stump.',
      advantage: 'Fielding Side +12% discipline',
      answers: {
        'Why overturned?': 'Clear spike registered on snickometer as the toe-end passed the inner edge.',
        'Tactical advantage?': 'Required run rate climbing above 8.5 per over, forcing high-risk aerial lofted drives.',
        'Momentum key?': 'Targeting the shorter boundary (62m) on the leg-side during the final five overs.'
      }
    }
  ],
  football: [
    {
      tag: 'HIGH-PRESS TACTICAL SHIFT',
      insight: 'Defensive line stepped 15 meters higher into 4-2-4 formation, forcing quick turnovers in opponent third.',
      advantage: 'Pressing Side +14% territory',
      answers: {
        'Why overturned?': 'Semi-automated offside geometry showed the attacker’s shoulder blade was 4cm ahead.',
        'Tactical advantage?': 'Inverted fullbacks creating numerical 3v2 superiorities through central passing corridors.',
        'Momentum key?': 'Exploiting the space vacated behind the advanced right-back with direct diagonal switches.'
      }
    }
  ],
  soccer: [
    {
      tag: 'TACTICAL COUNTER-BLOCK',
      insight: 'Midfield pivoted into a disciplined 5-4-1 low block, denying through-balls into the central half-spaces.',
      advantage: 'Defending Side +9% structure',
      answers: {
        'Why overturned?': 'VAR check deemed minimal contact inside penalty box did not reach threshold for clear error.',
        'Tactical advantage?': 'Compact defensive spacing suffocating opponent playmakers between defensive and midfield lines.',
        'Momentum key?': 'Rapid vertical transition to winger within 3 touches of winning back possession.'
      }
    }
  ],
  baseball: [
    {
      tag: 'PITCHER REPERTOIRE SHIFT',
      insight: 'Closer leaning heavily on 86mph sweeping slider away, generating 48% swing-and-miss on low-and-away counts.',
      advantage: 'Pitcher +18% whiff rate',
      answers: {
        'Why overturned?': 'High-speed replay revealed runner’s cleat scraped the bag 0.04s prior to the glove tag.',
        'Tactical advantage?': 'Opposing lineup batting .160 against breaking balls when falling behind 0-2 in the count.',
        'Momentum key?': 'Laying off high fastballs to force the pitcher deeper into full 3-2 pitch counts.'
      }
    }
  ],
  basketball: [
    {
      tag: 'ZONE DEFENSE ADAPTATION',
      insight: 'Switched to a 2-3 matchup zone after timeout, choking paint penetration and baiting perimeter attempts.',
      advantage: 'Defensive Unit +11% stop rate',
      answers: {
        'Why overturned?': 'Replay review confirmed defender established legal guarding position outside restricted arc.',
        'Tactical advantage?': 'Pick-and-roll coverage trapping ballhandler, taking away primary isolation scoring option.',
        'Momentum key?': 'Crashing the weak-side offensive glass for second-chance putbacks against zone shifts.'
      }
    }
  ]
};

export function getTacticalInsight(match, query = null) {
  const sport = (match?.sport || 'cricket').toLowerCase();
  const bank = TACTICAL_KNOWLEDGE[sport] || TACTICAL_KNOWLEDGE.cricket;
  const index = Math.floor((Date.now() / 60000) % bank.length);
  const current = bank[index] || bank[0];

  const quickQuestions = Object.keys(current.answers);

  if (query && current.answers[query]) {
    return {
      sport,
      tag: current.tag,
      insight: current.insight,
      advantage: current.advantage,
      query,
      answer: current.answers[query],
      quickQuestions,
      timestamp: Date.now()
    };
  }

  return {
    sport,
    tag: current.tag,
    insight: current.insight,
    advantage: current.advantage,
    query: null,
    answer: null,
    quickQuestions,
    timestamp: Date.now()
  };
}
