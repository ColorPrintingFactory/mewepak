export const solutionDeliverables = {
  prepress: {
    action: 'Request artwork review',
    image: 'prepress-proof',
    alt: 'Concept photograph of a pouch, paper artwork proof and colour swatches',
    caption: 'Concept visual · sample proofing setup',
    heading: 'Three things to agree before print',
    lead: 'Share the pouch drawing and artwork versions. Keep the drawing, proof and approved file list together so each SKU is released against the right revision.',
    outcomes: [
      ['Dieline preview', 'Review the front and back panels, seals, folds and usable artwork area on the drawing for your pouch.'],
      ['Marked-up artwork', 'Compare the layout with the supplied drawing. Flag areas for barcode placement, coding, colour references or a separate white layer.'],
      ['Proof and version record', 'Keep the file reference, requested changes and final approval for each variant.'],
    ],
    record: {
      title: 'One pouch drawing, three artwork files',
      columns: ['Example SKU', 'Drawing / artwork', 'Check on the proof'],
      rows: [
        ['House blend', 'Pouch A-03 / House v4', 'Confirm the front panel and clear barcode space.'],
        ['Dark roast', 'Pouch A-03 / Dark v2', 'Confirm the variant colour and the correct back panel.'],
        ['Decaf', 'Pouch A-03 / Decaf v3', 'Verify the product name and the latest corrected artwork.'],
      ],
    },
  },
  printing: {
    action: 'Discuss print samples',
    image: 'print-finishes',
    alt: 'Three illustrative pouches with the same design shown with matte, gloss and selective gloss effects',
    caption: 'Concept visual · matte, gloss and selective gloss',
    heading: 'What each type of proof can tell you',
    lead: 'Choose the reference that matches the decision you need to make. Record the substrate and finish alongside the accepted sample.',
    outcomes: [
      ['Digital proof', 'Compare the content, layout and version at the intended finished size.'],
      ['Physical colour reference', 'Review the colour direction against your reference and the agreed material if available.'],
      ['Finished pack or film sample', 'Compare the surface, handling and appearance under the same viewing conditions.'],
    ],
    record: {
      title: 'Plan a finish comparison',
      columns: ['Candidate', 'Where to compare', 'Keep with the brief'],
      rows: [
        ['Matte surface', 'Large colour areas and readability', 'Sample reference and viewing conditions'],
        ['Gloss surface', 'Appearance and legibility at retail angles', 'Approved material and finish reference'],
        ['Selective finish', 'Placement and alignment at the intended size', 'Artwork layer and approved proof revision'],
      ],
    },
  },
  technical: {
    action: 'Discuss a packaging trial',
    heading: 'Plan a trial around your product and equipment',
    lead: 'Set the checks before the sample is made. Use the same product, fill and handling conditions when you compare candidates.',
    outcomes: [
      ['Product and equipment brief', 'Document the product profile, fill method, equipment and handling.'],
      ['Filled sample check', 'Agree the pack dimensions, opening, seal area and fit in the case after filling.'],
      ['Trial record', 'Record sample IDs, observations, open points and who will make the next decision.'],
    ],
    record: {
      title: 'What to record in a packaging trial',
      columns: ['Check', 'Bring to the trial', 'Record afterward'],
      rows: [
        ['Filling and closing', 'Product, fill volume and equipment details', 'Machine fit and condition of the seal area'],
        ['Handling', 'Case dimensions and intended handling', 'Stability and filled-pack dimensions'],
        ['Use after opening', 'User scenario and closure requirement', 'Opening, dispensing or reclosure observations'],
      ],
    },
  },
  recycling: {
    action: 'Request a material review',
    heading: 'Compare your current pack with a candidate',
    lead: 'Bring the current structure and destination market. Agree the performance targets and the evidence required before making a material or on-pack claim decision.',
    outcomes: [
      ['Baseline pack', 'Document the material, format, barrier target and current claims or labelling.'],
      ['Candidate construction', 'Compare the proposed construction against the same product and distribution needs.'],
      ['Validation brief', 'Agree sample checks, market assumptions and documentation to request.'],
    ],
    record: {
      title: 'A structure change review',
      columns: ['Subject', 'Current pack', 'Candidate to verify'],
      rows: [
        ['Protection', 'Record the shelf-life and storage targets.', 'Ask for matching test data or a trial plan.'],
        ['Production', 'Record the filling method and seal conditions used.', 'Check equipment fit with the intended line.'],
        ['Market evidence', 'Record where the product is sold.', 'Identify applicable guidance and supporting records.'],
      ],
    },
  },
  retort: {
    action: 'Discuss a retort pouch trial',
    heading: 'Agree the sample and approval responsibilities',
    lead: 'Coordinate the pouch specification with the team responsible for the product and its processing. Bring their requirements into the trial brief before ordering samples.',
    outcomes: [
      ['Pouch brief', 'Agree the intended format, dimensions, fill profile and requested document set.'],
      ['Processing team review', 'Have the processing team define and review the applicable process and validation plan.'],
      ['Sample decision', 'Record the trial sample, checks and approval responsibilities before moving to production.'],
    ],
    record: {
      title: 'Who contributes what to a trial',
      columns: ['Workstream', 'Packaging team', 'Product or processing team'],
      rows: [
        ['Pack format', 'Discuss the pouch candidate and drawing.', 'Provide pack and line requirements.'],
        ['Sample and documents', 'Confirm the sample scope and available records.', 'Share the trial plan and required documents.'],
        ['Approval', 'Record the agreed pack revision.', 'Confirm the processing validation and product release.'],
      ],
    },
  },
};
