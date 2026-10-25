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

// Skills & tools from the resume, each with a brand logo. `aliases` are the
// whole-word phrases that mark a skill as used in a project or role (lineage).
// dbt and Cloud Functions have no simple-icons entry — rendered as glyph tiles.
export const SKILLS = [
  { name: 'Google Cloud', aliases: ['google cloud', 'gcp'], category: 'Cloud & Infra', ...icon(siGooglecloud) },
  { name: 'BigQuery', aliases: ['bigquery'], category: 'Data', ...icon(siGooglebigquery) },
  { name: 'Cloud Composer · Airflow', aliases: ['cloud composer', 'airflow'], category: 'Cloud & Infra', ...icon(siApacheairflow) },
  { name: 'Cloud Functions', aliases: ['cloud functions'], category: 'Cloud & Infra', glyph: 'ƒ( )', hex: '#4285F4' },
  { name: 'Pub/Sub', aliases: ['pub/sub'], category: 'Cloud & Infra', ...icon(siGooglepubsub), hex: '#669DF6' },
  { name: 'Vertex AI · Gemini', aliases: ['vertex ai', 'gemini'], category: 'Data', ...icon(siGooglegemini) },
  { name: 'Terraform', aliases: ['terraform', 'infrastructure as code'], category: 'Cloud & Infra', ...icon(siTerraform) },
  { name: 'dbt', aliases: ['dbt'], category: 'Data', glyph: 'dbt', hex: '#FF694A' },
  { name: 'Python', aliases: ['python'], category: 'Languages', ...icon(siPython) },
  { name: 'SQL', aliases: ['sql'], category: 'Languages', ...icon(siPostgresql) },
  { name: 'TypeScript', aliases: ['typescript'], category: 'Languages', ...icon(siTypescript) },
  { name: 'REST APIs', aliases: ['rest api', 'restful api'], category: 'Tools', glyph: '</>', hex: '#38bdf8' },
  { name: 'React', aliases: ['react'], category: 'Tools', ...icon(siReact) },
  { name: 'Looker', aliases: ['looker'], category: 'Tools', ...icon(siLooker) },
  { name: 'Git', aliases: ['git'], category: 'Tools', ...icon(siGit) },
]
