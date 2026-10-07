export interface SampleNotePreset {
  id: string;
  title: string;
  subject: string;
  campusExample: string;
  content: string;
}

export const SAMPLE_NOTES: SampleNotePreset[] = [
  {
    id: 'bio-cellular',
    title: 'Cellular Respiration & Bioenergetics',
    subject: 'Biology / Pre-Med (Bio 101)',
    campusExample: 'UC Berkeley / BIO 1A',
    content: `Bio 1A - Lecture 14: Cellular Respiration & ATP Synthesis

1. Overview of Respiration:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ~30-32 ATP (Delta G = -686 kcal/mol).
Catabolic, exergonic redox process. Glucose is oxidized to CO2; O2 is reduced to H2O.
Key electron carriers: NAD+ (oxidized) / NADH (reduced), FAD (oxidized) / FADH2 (reduced).

2. Glycolysis (Cytosol):
- Occurs without oxygen (anaerobic).
- Energy investment phase uses 2 ATP (phosphorylates glucose via hexokinase and PFK-1).
- PFK-1 (Phosphofructokinase-1) is the main committed step and allosterically inhibited by ATP & citrate, stimulated by AMP.
- Energy payoff phase generates 4 ATP via substrate-level phosphorylation + 2 NADH + 2 Pyruvate.
- Net yield per glucose: 2 ATP, 2 NADH, 2 Pyruvate.

3. Pyruvate Oxidation (Mitochondrial Matrix):
- Pyruvate enters matrix via pyruvate translocase (symport with H+).
- Pyruvate dehydrogenase complex (PDH) converts 3C pyruvate to 2C Acetyl-CoA.
- Produces 1 CO2 and 1 NADH per pyruvate (total 2 CO2, 2 NADH per glucose).

4. Citric Acid Cycle / Krebs (Mitochondrial Matrix):
- Acetyl-CoA (2C) combines with Oxaloacetate (4C) to form Citrate (6C).
- Cycle turns twice per glucose.
- Total yield per glucose (2 turns): 4 CO2, 6 NADH, 2 FADH2, 2 GTP/ATP (substrate-level).
- Regenerates Oxaloacetate so the cycle can continue.

5. Oxidative Phosphorylation & ETC (Inner Mitochondrial Membrane):
- Complex I (NADH dehydrogenase): accepts electrons from NADH, pumps 4 H+ across inner membrane to intermembrane space.
- Complex II (Succinate dehydrogenase): accepts electrons from FADH2 (does NOT pump H+).
- Coenzyme Q (Ubiquinone) transfers electrons from I and II to Complex III (cytochrome bc1), which pumps 4 H+.
- Cytochrome c shuttles electrons to Complex IV (cytochrome c oxidase), which pumps 2 H+ and transfers e- to final acceptor O2 to form H2O.
- Proton motive force (PMF): steep electrochemical gradient across inner membrane (high [H+] in intermembrane space, pH ~7.0 vs matrix pH ~7.8).
- ATP Synthase (F0/F1 complex): H+ flows through F0 rotor down gradient, causing conformational rotation in F1 catalytic head to synthesize ATP from ADP + Pi. Chemiosmosis hypothesis (Peter Mitchell 1961).
- Uncoupling proteins (e.g., UCP1 / thermogenin in brown adipose) dissipate PMF as heat instead of making ATP.
- Inhibitors: Rotenone (blocks Complex I), Cyanide & CO (block Complex IV), Oligomycin (blocks ATP synthase).`
  },
  {
    id: 'econ-monopoly',
    title: 'Microeconomics: Monopoly & Price Discrimination',
    subject: 'Economics (Econ 101)',
    campusExample: 'Michigan / ECON 102',
    content: `Econ 102 - Lecture 9: Monopoly & Imperfect Competition

1. Monopoly Characteristics:
- Single seller of a unique product with no close substitutes.
- High barriers to entry: legal (patents, copyrights), resource ownership (De Beers diamonds), natural monopolies (economies of scale over entire relevant demand, e.g., local water utility).
- Monopolist is a price maker, facing downward-sloping market demand curve.

2. Revenue Curves & Profit Maximization:
- Downward sloping demand means Marginal Revenue (MR) lies strictly below Average Revenue / Demand (P) because to sell an additional unit, the firm must lower the price on ALL units sold (price effect vs output effect).
- MR = P * (1 - 1/|Ed|). Profit-maximizing monopolist will ALWAYS produce in the elastic portion of the demand curve (|Ed| > 1), where MR > 0.
- Golden profit maximization rule: MR = MC.
- Output Q* is found where MR = MC; Price P* is found by going up vertically from Q* to the Demand curve.
- Profit = (P* - ATC) * Q*.

3. Welfare Implications & Deadweight Loss:
- In perfect competition: P = MC (allocative efficiency), producing at Qc.
- In monopoly: P > MC, producing Qm < Qc.
- Results in Deadweight Loss (DWL): loss of total economic surplus (triangle between demand and MC from Qm to Qc).
- Consumer surplus is drastically reduced; part is captured as monopoly profit, part is lost to DWL.

4. Price Discrimination (First, Second, and Third Degree):
- Conditions needed: market power, ability to segment buyers by elasticity, prevention of resale/arbitrage.
- First-degree (Perfect price discrimination): charges every consumer their exact maximum willingness to pay. Consumer surplus = 0. Entire surplus captured by producer. Quantity produced equals competitive level (P = MC at margin), so DWL = 0, but highly unequal distribution.
- Second-degree: non-linear pricing based on quantity or quality tiers (bulk discounts, airline seat classes).
- Third-degree: charging different prices to identifiable groups based on elasticity of demand (student/senior discounts, movie matinees). Group with more elastic demand gets lower price; group with less elastic demand gets higher price.`
  },
  {
    id: 'law-first-amendment',
    title: 'Constitutional Law: First Amendment & Free Speech',
    subject: 'Pre-Law / Poli Sci (ConLaw)',
    campusExample: 'Columbia / POLS 3245',
    content: `ConLaw - Week 6: First Amendment Free Speech Doctrine

1. Framework & Core Distinction:
- Content-Based vs Content-Neutral Restrictions:
  * Content-Based restrictions target the subject matter or viewpoint of speech. Presumptively unconstitutional and subjected to Strict Scrutiny: government must prove a compelling governmental interest and that the law is narrowly tailored using the least restrictive means (Reed v. Town of Gilbert 2015).
  * Viewpoint-Based discrimination is the most egregious form of content-based restriction; almost never survives review (Matal v. Tam 2017).
  * Content-Neutral restrictions regulate time, place, and manner (TPM) without regard to the message. Subject to Intermediate Scrutiny: must serve a significant governmental interest, be narrowly tailored, and leave open ample alternative channels of communication (Ward v. Rock Against Racism 1989).

2. Unprotected & Low-Value Categories:
- Incitement to Imminent Lawless Action: Brandenburg v. Ohio (1969) two-prong standard: speech is directed to inciting or producing imminent lawless action AND is likely to incite or produce such action. Mere advocacy of abstract violence is protected.
- True Threats: Virginia v. Black (2003) & Counterman v. Colorado (2023). Speaker must have a conscious subjective mental state of at least recklessness regarding the threatening nature of the statement.
- Fighting Words: Chaplinsky v. New Hampshire (1942). Words that by their very utterance inflict injury or tend to incite an immediate breach of peace. Severely narrowed in modern jurisprudence.
- Defamation: New York Times Co. v. Sullivan (1964). Public officials/figures must prove "actual malice" (knowledge of falsity or reckless disregard of truth) by clear and convincing evidence. Private figures need only show negligence for actual damages (Gertz v. Robert Welch).
- Obscenity: Miller v. California (1973) 3-prong test: (a) appeals to prurient interest under contemporary community standards, (b) depicts sexual conduct in a patently offensive way specifically defined by state law, (c) lacks serious literary, artistic, political, or scientific value (SLAPS national standard).

3. Commercial Speech Doctrine:
- Central Hudson Gas & Electric Corp. v. Public Service Commission (1980) 4-part test:
  1. Does speech concern lawful activity and is it not misleading?
  2. Is the asserted governmental interest substantial?
  3. Does the regulation directly advance the governmental interest?
  4. Is the regulation not more extensive than necessary (reasonable fit)?`
  }
];
