import {
  siApacheairflow,
  siGooglebigquery,
  siGooglecloud,
  siGooglegemini,
  siPython,
  siTerraform,
} from 'simple-icons'

// Real brand marks extruded into 3D for the background scene.
// Python uses its official secondary yellow and Composer the Airflow teal so
// the set doesn't collapse into six shades of blue.
export const LOGOS_3D = [
  { name: 'BigQuery', color: `#${siGooglebigquery.hex}`, path: siGooglebigquery.path },
  { name: 'Vertex AI', color: `#${siGooglegemini.hex}`, path: siGooglegemini.path },
  { name: 'Terraform', color: `#${siTerraform.hex}`, path: siTerraform.path },
  { name: 'Google Cloud', color: `#${siGooglecloud.hex}`, path: siGooglecloud.path },
  { name: 'Python', color: '#FFD43B', path: siPython.path },
  { name: 'Composer', color: '#00C7D4', path: siApacheairflow.path },
]
