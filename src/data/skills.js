import {
  siGooglecloud,
  siGooglebigquery,
  siApacheairflow,
  siGooglepubsub,
  siGooglegemini,
  siTerraform,
  siPython,
  siPostgresql,
  siReact,
  siLooker,
  siGit,
  siTypescript,
} from 'simple-icons'

const icon = (si) => ({ path: si.path, hex: `#${si.hex}` })

// Skills & tools from the resume, each with a brand logo.
// dbt and Cloud Functions have no simple-icons entry — rendered as glyph tiles.
export const SKILLS = [
  { name: 'Google Cloud', category: 'Cloud & Infra', ...icon(siGooglecloud) },
  { name: 'BigQuery', category: 'Data', ...icon(siGooglebigquery) },
  { name: 'Cloud Composer · Airflow', category: 'Cloud & Infra', ...icon(siApacheairflow) },
  { name: 'Cloud Functions', category: 'Cloud & Infra', glyph: 'ƒ( )', hex: '#4285F4' },
  { name: 'Pub/Sub', category: 'Cloud & Infra', ...icon(siGooglepubsub), hex: '#669DF6' },
  { name: 'Vertex AI · Gemini', category: 'Data', ...icon(siGooglegemini) },
  { name: 'Terraform', category: 'Cloud & Infra', ...icon(siTerraform) },
  { name: 'dbt', category: 'Data', glyph: 'dbt', hex: '#FF694A' },
  { name: 'Python', category: 'Languages', ...icon(siPython) },
  { name: 'SQL', category: 'Languages', ...icon(siPostgresql) },
  { name: 'TypeScript', category: 'Languages', ...icon(siTypescript) },
  { name: 'REST APIs', category: 'Tools', glyph: '</>', hex: '#38bdf8' },
  { name: 'React', category: 'Tools', ...icon(siReact) },
  { name: 'Looker', category: 'Tools', ...icon(siLooker) },
  { name: 'Git', category: 'Tools', ...icon(siGit) },
]
