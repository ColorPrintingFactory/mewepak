const assets = '/assets/media/packaging-guides/';
const report = '/contact/?topic=impact-report#project-enquiry';
const event = '/contact/?topic=events#project-enquiry';
const trial = '/inquiry/?service=technical#quote-request';
const material = '/inquiry/?service=recycling#quote-request';

export const depth = {
  'pouch-patrol': {
    image: ['/assets/media/packaging-guides/prepress-proof.webp', 'Pouch, colour swatches and artwork proof', 'Concept visual · from artwork to sample'],
    second: ['#project-handoffs', 'See the project handoffs'],
    feature: {
      id: 'project-handoffs', title: 'From enquiry to production release',
      intro: 'A project reference links the brief, samples, artwork and agreed specifications. Here is what each handoff should capture.',
      steps: [
        ['Scope the brief', 'Commercial', 'Share the intended use, fill size, target quantity and destination.', 'Project brief with quantities by SKU'],
        ['Compare sample candidates', 'Technical', 'Agree the equipment, fill and handling checks with the team that packs the product.', 'Candidate IDs and trial observations'],
        ['Approve drawings and artwork', 'Prepress', 'Review the drawing and each print version in a common size and orientation.', 'Approved drawing revision plus proof by SKU'],
        ['Release the order', 'Production and quality', 'Confirm the agreed structure, pack features and acceptance requirements.', 'Purchase order and released pack specification'],
      ],
    },
    example: ['Worked example · coffee range', 'Four artworks, one pouch drawing', 'A buyer planning four variants can trial the shared size and closure together. The artwork review still records a proof and revision for each SKU. Keep all four approvals with the drawing and sample IDs.', '/markets/coffee-tea/#coffee-quote-example', 'See a coffee packaging example'],
    questions: [
      ['Already have an approved specification?', 'Share the current revision, a sample reference and the quantity by SKU. Flag any differences from the pack you already run.'],
      ['Who should join a consultation?', 'Include the person responsible for filling or packaging equipment, and the person who can approve artwork or supplier requirements when relevant.'],
    ],
  },
  'on-the-road': {
    second: ['/booking/', 'Book an online meeting'],
    feature: {
      id: 'meeting-options', title: 'Choose how to meet the packaging team',
      cards: [
        ['Trade show', 'Confirm attendance before travelling. Share the event, city, dates and sample formats you would like to review.', event, 'Ask about an event'],
        ['Online consultation', 'Compare drawings, materials, artwork versions or a sample list by video with the project team.', '/booking/', 'Choose a time'],
        ['Factory visit enquiry', 'Ask about visit arrangements and tell us which manufacturing or quality topics you would like to cover.', '/booking/', 'Discuss a factory visit'],
      ],
    },
    example: ['Meeting preparation', 'Bring comparable samples', 'For a productive meeting, bring your current pack or drawing, one example of the intended finish, target quantities and any pending questions. Mark the current drawing revision so everyone discusses the same pack.', assets + 'packaging-project-brief.pdf', 'Download the project brief', true],
    questions: [
      ['Can I bring my own pouch or artwork?', 'Yes. Label a current sample or file revision and list the changes you want to discuss. Use a reference sample for colour or finish when available.'],
      ['How do I confirm details for an event?', 'Send the event name and the days you plan to attend. Ask the team to confirm attendance, meeting availability and which samples can be reviewed.'],
    ],
  },
  'keepin-it-green': {
    second: ['#switch-plan', 'See the change plan'],
    feature: {
      id: 'switch-plan', title: 'Set up a controlled packaging change',
      intro: 'Agree the outcome before selecting a replacement structure. Use the same pack function, fill and storage conditions for the baseline and candidate.',
      steps: [
        ['Describe the current pack', 'Baseline', 'Collect the material and closure specification, pack mass, existing artwork and markets.', 'Current pack and reason for change'],
        ['Define the target', 'Objective', 'Pick a specific goal such as less packaging mass or a design to assess for recycling.', 'Objective and requirements that must still be met'],
        ['Trial one candidate', 'Trade-offs', 'Compare seal quality, product protection, line fit and distribution with your current pack.', 'Candidate sample ID, test conditions and observations'],
        ['Review evidence before release', 'Approval', 'Agree who checks performance, market documentation and final artwork.', 'Decision record and approved revision'],
      ],
    },
    example: ['Worked example · dry food', 'A lighter pack for the same product', 'Compare the mass per finished pouch at the same fill weight. A lighter sample still needs to pass the agreed sealing, handling and product-protection checks. Keep its sample ID and the results together before revising the specification.', assets + 'mewepak-material-review.csv', 'Download the editable review sheet', true],
    questions: [
      ['What information helps if I do not know the film structure?', 'Bring an existing sample, a drawing or supplier specification if available. Identify the destination, fill and handling conditions so the gaps can be recorded in the review.'],
      ['Can I use the comparison as an on-pack claim?', 'Use the results to guide project decisions. Review the relevant documentation and market requirements with the people responsible for approving the final wording.'],
    ],
  },
  careers: {
    second: ['#career-areas', 'Explore the work'],
    feature: {
      id: 'career-areas', title: 'Build a career in flexible packaging',
      intro: 'Explore how work moves across departments, and use the enquiry to ask about current opportunities.',
      cards: [
        ['Artwork and product development', 'Work can include reviewing pouch drawings, preparing artwork files and following sample changes. Useful experience includes packaging design and print preparation.'],
        ['Production and quality', 'Work can include material handling, converting, inspection and documentation. Tell us which processes or equipment you have experience with.'],
        ['Commercial and customer support', 'Work can include gathering project details, coordinating samples and keeping approvals, timelines and communications clear.'],
      ],
    },
    example: ['Career enquiries', 'What to send', 'Include your preferred work area, location and relevant experience. A short summary is enough for the first enquiry. Ask the hiring contact which materials to provide if a relevant position is available.', '/contact/?topic=careers#project-enquiry', 'Get in touch about careers'],
    questions: [
      ['How can I check whether a role is currently open?', 'Send a careers enquiry with the position or department you are interested in. The team can confirm what is available and explain the application steps.'],
      ['Can I enquire about technical or production roles?', 'Yes. Include the packaging processes, quality systems or equipment you know so the enquiry can reach the relevant team.'],
    ],
  },
  'help-center': {
    second: ['/added-value/faq/', 'Browse packaging FAQs'],
    feature: {
      id: 'help-topics', title: 'Find help by what you need to do',
      cards: [
        ['Prepare artwork', 'Find the checklist, request a project dieline or review artwork and proofs.', '#artwork-resources', 'Artwork and dielines'],
        ['Trial a sample', 'Compare candidates under the same fill and handling conditions.', '#sample-resources', 'Samples and technical guides'],
        ['Prepare an enquiry', 'Build a project brief or prepare the supplier information your team needs.', '#purchase-resources', 'Quotes and supplier records'],
      ],
    },
    questions: [
      ['Can I use a generic dieline for production?', 'Confirm the project-specific drawing and its revision first. Clearances, closure and seal areas can change with the selected construction and size.'],
      ['How do I request a project specification or sample?', 'Share the product, fill size, required format, intended market and current sample or quote reference if you have one.'],
    ],
  },
  'sustainable-packaging': {
    second: ['#application-library', 'Explore application examples'],
    feature: {
      id: 'application-library', title: 'Compare changes in real packaging applications',
      intro: 'These are illustrative purchasing scenarios. Each starts with a product requirement and ends with a decision your project team can test.',
      cases: [
        ['/assets/media/blog-covers/pet-food-packaging-what-pet-owners-want.webp', 'Example flexible pouch for pet food', 'Dry food and pet treats', 'Explore a simpler structure', 'Inspect the whole pack, including layers, closure and ink. Match the barrier target to the current product and test the intended seal.', '/markets/pet-food/'],
        ['/assets/client-design/images/2d563e01a215d93d.webp', 'Refill pouch concept', 'Home-care refills', 'Assess a refill format', 'Use the real formulation to check dispensing, closure integrity, compatibility and the secondary pack during shipment.', '/markets/home-care/'],
        ['/assets/media/blog-covers/coffee-packaging-preserving-freshness-flavor.webp', 'Coffee pouch illustration', 'Coffee and dry goods', 'Compare pack weight', 'Weigh the complete pouch including valve or zipper. Validate protection and line fit using the current pack as the reference.', '/markets/coffee-tea/'],
      ],
    },
    example: ['Industry guidance', 'Document the complete pack', 'Use a recognised design guide for the destination market. Compare each component, the collection and sortation route, and the supporting evidence before closing the specification.', 'https://guidelines.ceflex.eu/guidelines/', 'Read the CEFLEX design guidance'],
    questions: [
      ['Are recycled content and recyclability the same assessment?', 'Recycled content looks at the input material and its documentation. A recyclability assessment considers the complete pack and its intended recovery stream. Review the two objectives independently.'],
      ['What should a material comparison include?', 'Keep product, shelf-life targets and filling assumptions consistent. Document the layers, closure, printing, barrier, sample checks and the intended market.'],
    ],
  },
  operations: {
    image: ['/assets/client-design/images/7ee11193feb99d0a.webp', 'Concept scenes of film printing, pouch converting and inspection', 'Concept visual · manufacturing and inspection'],
    second: ['#operations-evidence', 'Explore evidence by process'],
    feature: {
      id: 'operations-evidence', title: 'Set the scope before comparing site data',
      intro: 'Use one row for each site, process and reporting period. Record units, data sources and coverage with any number received.',
      matrix: {
        headers: ['Record area', 'Ask for', 'Check the scope'],
        rows: [
          ['Energy and emissions', 'Consumption or inventory data, energy sources and the calculation method', 'Site boundary, year, units and which processes or scopes are covered'],
          ['Production trim and scrap', 'Material streams, quantities and handling or recovery records', 'Waste categories, period, contractor and treatment route'],
          ['Water and air', 'Applicable monitoring records and measurement periods', 'Site, operation, units and data owner'],
          ['Project data', 'Material specification, packaging weights and process data available for the order', 'Which inputs are project-specific and which use an allocation or estimate'],
        ],
      },
    },
    example: ['Editable supplier worksheet', 'Keep environmental records comparable', 'Set the site and reporting period up front, then list the evidence you need, its requested unit and who owns the response.', assets + 'mewepak-operations-evidence.csv', 'Download operations evidence sheet', true],
    questions: [
      ['Can company-level results be used as specific order data?', 'Treat group, site and project data as separate levels. Ask for the site and coverage before using a figure in a packaging comparison.'],
      ['How do I ask for site evidence?', 'Include the product or quotation reference, requested facility, reporting period, needed units and your review deadline.'],
    ],
  },
  social: {
    second: ['#people-evidence', 'See the supplier review checklist'],
    feature: {
      id: 'people-evidence', title: 'Prepare the people and workplace review',
      intro: 'A supplier review works best when each request names the site, its time period and the level of detail needed.',
      cards: [
        ['Training and competence', 'Ask for role-based training scope, review periods and suitable evidence summaries for the relevant sites.'],
        ['Workplace health and safety', 'Specify the reporting period, site and type of policy, indicators or review evidence required.'],
        ['Responsible sourcing and grievances', 'Describe your supplier due-diligence questions, including the process or policy evidence and scope you need.'],
        ['Corrective actions', 'If your review identifies a gap, record the item, owner, target date and evidence needed for closure.'],
      ],
    },
    example: ['Supplier due diligence', 'Send one structured request', 'Use a summary by site and evidence topic. Where details cannot be shared publicly, ask what can be supplied for a supplier review and in what form.', assets + 'mewepak-social-evidence.csv', 'Download the review sheet', true],
    questions: [
      ['Does a policy cover every facility?', 'Ask which entity, sites and workforce the policy covers. Review site-level evidence separately when your assessment requires it.'],
      ['Can I include my company’s own supplier questionnaire?', 'Yes. Start with the items, site, due date and contact details. Agree how to share any confidential material with the assigned reviewer.'],
    ],
  },
  'impact-report': {
    second: ['#report-library', 'Explore the document register'],
    feature: {
      id: 'report-library', title: 'Supplier document and reporting register',
      intro: 'Use the register to identify the correct record. Confirm availability, reporting period and scope with the team for your enquiry.',
      matrix: {
        headers: ['Document to ask for', 'Scope to specify', 'Access'],
        rows: [
          ['Corporate or site sustainability report', 'Entity, requested year and sites that must be covered', ['Request a report', report]],
          ['Environmental operations evidence', 'Facility, process, period and required indicators', ['See operations evidence', '/sustainability/operations/#operations-evidence']],
          ['Social and workforce evidence', 'Facility, workforce scope and review deadline', ['See supplier review criteria', '/sustainability/social/#people-evidence']],
          ['Project-specific material and performance data', 'Packaging SKU, material revision, destination and requested test or declaration', ['Request a material review', material]],
          ['Certification or audit records', 'Exact standard or document, relevant facility and requested validity date', ['Request supplier documents', report]],
        ],
      },
    },
    example: ['Editable document register', 'Track the evidence for your review', 'Use the worksheet to record what you asked for, the scope and period, the reference you received and any evidence that still needs confirmation.', assets + 'mewepak-supplier-document-register.csv', 'Download document register', true],
    questions: [
      ['Where do I specify the year or facility?', 'List the desired reporting period and the exact site or entity in your request. Add the supplier qualification deadline and project or quotation reference.'],
      ['Which document should I request for a material claim?', 'Request material evidence tied to the proposed pack, revision and market. A company-wide report describes a different reporting scope.'],
    ],
  },
  'lca-tool': {
    second: ['#impact-dashboard', 'View the results dashboard'],
    example: ['Next step', 'Bring the comparison into your material review', 'Download the scenario CSV with your inputs and assumptions. Add the pack specification and required trial results before making a change.', '/solutions/recycling/', 'Review a material change'],
    questions: [
      ['What does the result cover?', 'The tool compares packaging mass and modelled climate impact for the materials, converting, freight and end-of-life stages in the entered scenario. Use matching boundaries for both packs.'],
      ['When is a deeper assessment useful?', 'When the decision depends on additional impacts, a broader life-cycle boundary, verified supplier data or public claims, agree the assessment scope and evidence requirements with your project team.'],
    ],
  },
};

export const guideItems = [
  ['Artwork and dielines', 'artwork-resources', [
    ['Artwork checklist', 'Record revisions, closure clearances and the artwork files required for proof review.', assets + 'artwork-checklist.pdf', 'Download PDF', 'PDF'],
    ['Request a production dieline', 'Specify the dimensions, closure, finished format and equipment for your project.', '/inquiry/?service=prepress#quote-request', 'Request a dieline', 'Request'],
    ['Artwork and proof workflow', 'See what to send for print preparation and how to record each approval.', '/solutions/prepress/#service-deliverables', 'Explore the workflow', 'Guide'],
    ['Printing and finish guide', 'Plan the colour, proof and surface finish you need to compare.', '/solutions/printing/', 'Compare print finishes', 'Guide'],
  ]],
  ['Samples and technical guides', 'sample-resources', [
    ['Filled-pack trial checklist', 'Compare candidate packs using the same product, fill and handling conditions.', assets + 'filled-pack-trial-checklist.pdf', 'Download PDF', 'PDF'],
    ['Request project samples', 'Describe the pouch, fill and features so the team can confirm sample options.', '/contact/?topic=samples#project-enquiry', 'Ask about samples', 'Request'],
    ['Planning a production trial', 'Walk through the sample and equipment compatibility checks.', trial, 'Discuss a trial', 'Request'],
    ['Material change worksheet', 'Record the current pack, candidate and validation requirements.', assets + 'mewepak-material-review.csv', 'Download CSV', 'CSV'],
    ['Packaging comparison tool', 'Compare screening estimates for two packaging scenarios.', '/sustainability/lca-tool/', 'Open the comparison', 'Tool'],
  ]],
  ['Quotes and supplier records', 'purchase-resources', [
    ['Packaging project brief', 'Prepare dimensions, artwork, quantities by SKU and delivery information.', assets + 'packaging-project-brief.pdf', 'Download PDF', 'PDF'],
    ['Supplier document register', 'Specify document scope and period, and track your request through review.', assets + 'mewepak-supplier-document-register.csv', 'Download CSV', 'CSV'],
    ['Packaging and delivery FAQs', 'Find answers about quantities, samples, artwork, delivery and ordering.', '/added-value/faq/', 'Browse the FAQs', 'Guide'],
    ['Operations evidence worksheet', 'Collect metrics, units and coverage by site and reporting period.', assets + 'mewepak-operations-evidence.csv', 'Download CSV', 'CSV'],
    ['Social evidence worksheet', 'Record workplace review questions, evidence status and follow-up.', assets + 'mewepak-social-evidence.csv', 'Download CSV', 'CSV'],
  ]],
];
