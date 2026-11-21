export const solutions = {
  prepress: {
    name: 'Prepress',
    heading: 'Packaging artwork & prepress',
    lead: 'Review your dieline, artwork and version requirements before approving a proof for print.',
    card: 'Check the dieline, artwork and version list before a file goes to print.',
    alt: 'Flexible pouch, dieline drawing, colour swatches and a magnifier on a workbench',
    scope: [
      ['Dieline and layout', 'Confirm the format and dimensions. Review panels, seals, folds, closures and the placement of required text or barcodes.'],
      ['Artwork and colour references', 'Identify the current artwork revision, intended colour references and any special finish or opaque areas.'],
      ['Proof and version control', 'Agree on the proof type, the list of SKUs and who will approve each artwork revision.'],
    ],
    inputs: ['Target pack dimensions or the current dieline', 'Editable artwork or a review PDF, with colour references', 'Artwork versions, barcode positions and the approval contact'],
    outputs: ['A list of file and dieline items to resolve', 'An agreed proof and artwork revision for review', 'A record of the files and versions approved to proceed'],
    faq: [
      ['Can I start without a final dieline?', 'Yes. Share the intended format and dimensions or an existing pouch. Confirm the production dieline before locking the artwork.'],
      ['How should I handle several SKUs?', 'Use consistent file names and provide one version list pairing each file with the SKU, dimensions and artwork revision.'],
    ],
    related: [
      ['/solutions/printing/', 'Printing & finishes'],
      ['/products/', 'Browse packaging formats'],
    ],
  },
  printing: {
    name: 'Printing',
    heading: 'Custom packaging printing',
    lead: 'Align artwork, film appearance and finish with the print sample or proof you plan to approve.',
    card: 'Plan colour, finish and proof review before printing your pouches or roll stock.',
    alt: 'Teal flexible packaging film feeding through printing rollers',
    scope: [
      ['Colour and substrate', 'Discuss how the film, artwork and any white backing are intended to look. Share a colour reference or previous sample when available.'],
      ['Finish and sample review', 'Compare the intended matte, gloss or featured finish. Agree which areas should be evaluated on a sample.'],
      ['Approval and repeat orders', 'Confirm the approved reference, artwork revision, quantity by SKU and expectations for repeat production.'],
    ],
    inputs: ['Artwork and dieline for each SKU', 'Colour reference, finish direction and substrate constraints', 'Quantities by design, delivery destination and target date'],
    outputs: ['A print and finish brief for quoting', 'An agreed proof or sample and approval criteria', 'A reference for the approved artwork and finish'],
    faq: [
      ['Can I send a sample from a previous run?', 'Yes. Identify what needs to match, such as the overall colour, gloss level or a particular panel. Discuss how the comparison will be made.'],
      ['What should I approve before printing?', 'Check the artwork revision, colour reference, film and finish direction. Ask which aspects can be reviewed using the proposed proof.'],
    ],
    related: [
      ['/solutions/prepress/', 'Artwork & prepress'],
      ['/products/roll-stock-films/', 'Roll stock films'],
    ],
  },
  technical: {
    name: 'Technical',
    heading: 'Technical packaging support',
    lead: 'Turn filling, handling and storage requirements into a packaging brief that can be reviewed and trialled.',
    card: 'Compare format, film, closure and filling-line requirements for your product.',
    alt: 'Flexible pouch samples, film layers and a caliper on a quality review workbench',
    scope: [
      ['Product and filling line', 'Review the fill weight, pack dimensions, fill conditions and how the line handles the pouch or roll stock.'],
      ['Structure and closure', 'Discuss barrier priorities, sealing surfaces and closure options against intended storage, handling and use.'],
      ['Trial and acceptance', 'Agree what to check on a filled sample. Record the intended test conditions, acceptance criteria and owner of each check.'],
    ],
    inputs: ['Product type, fill weight and intended storage conditions', 'Machine type and key dimensions or an existing packaging sample', 'Known barrier, sealing, opening or handling requirements'],
    outputs: ['Candidate formats and material directions for discussion', 'A list of dimensions and performance details to confirm', 'A sample or line-trial brief for the next decision'],
    faq: [
      ['Can you review a problem with our current pack?', 'Share an unused sample, the product and fill conditions, and when the issue occurs. Photos and a short description of the affected area can help narrow the review.'],
      ['What if the material structure is still open?', 'Start with the product, storage and line requirements. Use those details to compare candidates and decide what must be confirmed by trial.'],
    ],
    related: [
      ['/solutions/recycling/', 'Recycling & material selection'],
      ['/products/', 'Browse packaging formats'],
    ],
  },
  recycling: {
    name: 'Recycling',
    heading: 'Recycling & material selection',
    lead: 'Compare material options against pack performance, the intended market and the evidence needed for any recycling claim.',
    card: 'Review materials and recycling considerations for specific markets and pack requirements.',
    alt: 'Teal flexible pouch, translucent film samples and polymer granules',
    scope: [
      ['Market and objective', 'Identify where the pack will be sold and the intended collection or recycling route. Share any retailer or customer requirements.'],
      ['Material and components', 'Review the film structure alongside closures, labels and other components. Discuss which alternatives are worth evaluating.'],
      ['Performance and evidence', 'Compare candidates against the existing pack. Agree what requires testing or evidence before a material or label claim is approved.'],
    ],
    inputs: ['Sales countries or regions and any retailer guidelines', 'Current structure, sample or specifications', 'Product protection, shelf-life and filling-line requirements'],
    outputs: ['A shortlist of material options to evaluate', 'Performance trade-offs and sample checks to discuss', 'A list of market-specific checks before approving claims'],
    faq: [
      ['Can the same pack use one recycling claim everywhere?', 'Review the exact structure and components against the requirements and collection routes for each sales market before approving any claim or label.'],
      ['Can we keep our current format when changing materials?', 'It may be a candidate. Compare the new material against barrier, seal, line and handling requirements using your existing pack as a reference.'],
    ],
    related: [
      ['/solutions/technical/', 'Technical packaging support'],
      ['/sustainability/', 'Sustainability approach'],
    ],
  },
  retort: {
    name: 'Retort',
    heading: 'Retort pouch project support',
    lead: 'Bring your product, filling line and existing process requirements together before selecting and trialling a pouch.',
    card: 'Plan pouch structure, filled-pack sample review and handoff to your validation team.',
    alt: 'Illustration of sealed flexible pouches resting in a stainless-steel rack',
    scope: [
      ['Product and process brief', 'Identify the product, target fill, current pack and process requirements provided by the plant or process authority.'],
      ['Pouch and seal requirements', 'Review dimensions, opening, handling and pack presentation with the team responsible for filling and sealing.'],
      ['Sample and validation handoff', 'Agree which pouch options to sample and what your production and food safety teams need to review before approval.'],
    ],
    inputs: ['Product, fill weight, pack dimensions and existing process brief', 'Filling and sealing line details, including constraints on the pack', 'Trial responsibilities, required documentation and target timeline'],
    outputs: ['Candidate pouch dimensions and construction for evaluation', 'A filled-pack trial checklist and approval responsibilities', 'A clearer brief for the sample and packaging quote'],
    faq: [
      ['Who approves the product’s thermal process?', 'Your process authority and food safety team are responsible for process validation. Share their established requirements so packaging can be evaluated against them.'],
      ['What should we bring to the first discussion?', 'Bring the process brief, product and fill details, line requirements, target dimensions and a representative sample if available.'],
    ],
    related: [
      ['/products/retort-pouch/', 'Explore retort pouches'],
      ['/solutions/technical/', 'Technical packaging support'],
    ],
  },
};
