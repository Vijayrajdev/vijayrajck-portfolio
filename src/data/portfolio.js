// Single source of truth for all portfolio content.
export const PORTFOLIO_DATA = {
  profile: {
    name: "Vijay Raj C K",
    role: "Senior Data Engineer",
    certification: "Google Cloud Certified ACE",
    email: "vijayrajck2@gmail.com",
    phone: "+91 9150199456",
    linkedin: "https://linkedin.com/in/vijay-raj-02",
    github: "https://github.com/Vijayrajdev",
    website: "https://vijayrajck.vercel.app",
    location: "Chennai, India",
    resume: "/Vijay_Raj_CK_Senior_Data_Engineer_3YOE.pdf",
    avatar: "/avatar.jpg",
    summary:
      "Senior Data Engineer with 3 years of experience designing robust, event-driven ETL/ELT pipelines and autonomous AI data architectures on GCP. Proven expertise in BigQuery, Terraform, dbt, Airflow, and Python to automate infrastructure and power business decisions at scale.",
    roles: [
      "Senior Data Engineer",
      "Agentic AI Architect",
      "GCP Certified ACE",
      "Pipeline Automation Specialist",
    ],
  },

  // The narrative arc: how design became development became autonomy.
  story: [
    {
      id: "design",
      label: "Design",
      title: "It started with interfaces.",
      text: 'Full-stack origins at DevTown — responsive front-ends, REST APIs, remote Agile teams. That eye for craft never left: it resurfaced as the "Deep Glass" design language behind JobTrackr.',
    },
    {
      id: "develop",
      label: "Develop",
      title: "Then came the pipelines.",
      text: "At Ingram Micro I architect event-driven ETL/ELT systems on GCP — BigQuery, Cloud Composer, Pub/Sub — surfacing trusted data into Looker and cutting manual pipeline creation effort by 80%.",
    },
    {
      id: "automate",
      label: "Automate",
      title: "Now the systems build themselves.",
      text: "Sentinel-Forge is where it converges: a multi-agent platform on Vertex AI that detects schema drift, writes its own Terraform and dbt fixes, and submits validated PRs while I sleep.",
    },
  ],

  experience: [
    {
      title: "Senior Data Engineer",
      company: "Ingram Micro",
      location: "Chennai, India",
      period: "Apr 2026 – Present",
      badge: "Promoted",
      highlights: [
        "Architected scalable, event-driven ETL/ELT pipelines on GCP using BigQuery, Cloud Composer (Airflow), Cloud Functions, and Pub/Sub.",
        "Optimized complex queries, significantly improving pipeline run-time efficiency and ensuring downstream data integrity.",
        "Reduced manual data pipeline creation effort by 80% through automation, ensuring early project delivery.",
      ],
    },
    {
      title: "Data Engineer",
      company: "Ingram Micro",
      location: "Chennai, India",
      period: "Jul 2023 – Mar 2026",
      badge: null,
      highlights: [
        "Engineered Python and SQL data scripts powering end-to-end data ingestion and transformation workflows.",
        "Surfaced structured datasets into Looker, enabling accurate stakeholder reporting.",
      ],
    },
    {
      title: "Full-Stack Developer (Intern)",
      company: "DevTown",
      location: "Chennai, India",
      period: "Sep 2021 – Dec 2021",
      badge: "Origin",
      highlights: [
        "Developed responsive front-end components and designed RESTful APIs using Node.js, Express, and MongoDB.",
        "Practiced Git-based version control and CI/CD pipeline workflows within a remote Agile development team.",
      ],
    },
  ],

  awards: [
    {
      name: "Supernova Excellence Award",
      issuer: "Ingram Micro",
      year: "2025",
      accent: "#a855f7",
      icon: "supernova",
    },
    {
      name: "Rock Star Award",
      issuer: "Ingram Micro",
      year: "2025",
      accent: "#22d3ee",
      icon: "bolt",
    },
    {
      name: "Dashing Debut Award",
      issuer: "Ingram Micro",
      year: "2024",
      accent: "#f472b6",
      icon: "rocket",
    },
    {
      name: "Best Outgoing Student",
      issuer: "Jerusalem College of Engineering",
      year: "2023",
      accent: "#fbbf24",
      icon: "gradcap",
    },
  ],

  projects: [
    {
      id: "pipewright",
      name: "Pipewright",
      tagline: "Your Junior Data Engineer",
      description:
        "Drop in raw files and Pipewright infers the schema, keys and table relationships, then drafts the DDL, SQL, dbt tests, quality checks, docs and Airflow/Dagster pipelines that come next. Runs in the browser, streams multi-GB files, and works with your own AI key or none at all.",
      tech: ["TypeScript", "Next.js", "BigQuery", "dbt", "Airflow", "Claude"],
      accent: "#fb8c5a",
      github: "https://github.com/Vijayrajdev/Pipewright",
      live: "https://pipewright-beige.vercel.app",
    },
    {
      id: "sentinel-forge",
      name: "Sentinel-Forge",
      tagline: "Autonomous Agentic Data Engineering Platform",
      description:
        "Self-healing ingestion platform built on a tiered multi-agent architecture with dynamic schema drift detection. Synthesizes Terraform (HCL) and dbt pipeline code and submits validated PRs directly to GitHub.",
      tech: ["GCP", "Vertex AI (Gemini)", "BigQuery", "Terraform", "dbt"],
      accent: "#a78bfa",
      github: "https://github.com/Vijayrajdev/sentinel",
    },
    {
      id: "nexus",
      name: "Nexus",
      tagline: "Centralized Data Hub",
      description:
        "End-to-end centralized data hub integrating dbt, BigQuery, and AI Agents, provisioned entirely via Infrastructure as Code.",
      tech: ["BigQuery", "dbt", "AI Agents", "Infrastructure as Code"],
      accent: "#38bdf8",
      github: "https://github.com/Vijayrajdev/nexus-autonomous-data-engine",
    },
    {
      id: "jobtrackr",
      name: "JobTrackr Enterprise",
      tagline: "Enterprise Application Tracking",
      description:
        'Enterprise-grade job application tracking system with a signature "Deep Glass" UI, centralizing and managing large volumes of application data.',
      tech: ["Python", "SQL", "React", "Cloud Architecture"],
      accent: "#f472b6",
      github: "https://github.com/Vijayrajdev/JobTrackr",
    },
  ],
};
