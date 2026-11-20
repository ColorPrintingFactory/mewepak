export const buyingGuides = {
  prepress: {
    task: 'Prepare artwork for production',
    decision: 'Approve the dieline revision, proof method and release files for each SKU.',
    steps: [
      ['Confirm the pack drawing', 'Start with the intended pouch, closure and finished dimensions. Align the front and back panels with folds, seals and features.', 'Dieline revision and features confirmed for artwork.'],
      ['Review files and proofs', 'Pair every SKU with its artwork file. Compare copy, barcode positions, colour references and special layers against the drawing.', 'Proof linked to each SKU, plus a list of outstanding corrections.'],
      ['Release the approved revision', 'Record who approved each proof, what changed and which files can be used for the next stage.', 'A release list for the print enquiry or production handoff.'],
    ],
    checks: [
      ['Dieline and fit', 'Panel orientation, finished size, folds, seals, zipper, notch and valve placement.', 'Approved drawing and a marked-up copy of any open items.'],
      ['Artwork layers', 'Fonts, linked images, spot colours, opaque white and any separate finish layers.', 'Source file, review PDF and notes identifying special layers.'],
      ['Barcode and coding', 'SKU-to-barcode mapping, clear areas around the symbol, and space for lot or date coding.', 'Barcode reference and approved panel location.'],
      ['Proof and release', 'Revision name, artwork changes, signatures and the proof used as a reference.', 'Proof record and final artwork list by SKU.'],
    ],
    example: {
      title: 'Three coffee SKUs share a pouch size',
      situation: 'A roaster is preparing three designs for a 250 g pouch. The front panels differ, as do the back-panel product descriptions and barcodes.',
      review: 'Confirm one dieline revision for the three designs. Map each file to its SKU and barcode. Check that the date-code area stays clear on all designs and agree the artwork version to proof.',
      handoff: 'One approved drawing, three identified artwork files and a proof approval record for each design.',
    },
    fields: ['Pack style, finished width and height, gusset and closure', 'Dieline reference and version', 'SKU, artwork filename and artwork revision (repeat per SKU)', 'Supply PDF and editable artwork or links', 'Spot colours, white layer and special finish areas', 'Barcode file and lot/date coding position', 'Proof approver and due date'],
    faq: [
      ['What if I have a PDF but no editable file?', 'Send it for an initial review. Include any linked images, font or colour references you have and identify the changes you expect. The team can then flag any source assets needed for production artwork.'],
      ['Does a PDF proof confirm final print colour?', 'A PDF is useful for layout and copy review. If colour is important, agree on the physical reference and the proof or sample method before sign-off.'],
    ],
    resources: [
      ['https://helpx.adobe.com/acrobat/using/previewing-output-acrobat-pro.html', 'Adobe: preview print output and separations'],
      ['https://support.gs1.org/support/solutions/articles/43000734141-what-should-i-check-to-ensure-good-quality-barcodes-', 'GS1: barcode quality checks'],
    ],
  },
  printing: {
    task: 'Match a print reference or plan a new finish',
    decision: 'Agree on a substrate, a physical appearance reference and what the buyer will approve.',
    steps: [
      ['Define the reference', 'Identify the artwork revision, selected film appearance and the physical sample or colour standard to compare against.', 'A brief stating what should match, including the priority colours and panels.'],
      ['Evaluate the proof or sample', 'Review the agreed method with your team. Check colour, opacity, contrast and positioning of matte, gloss or spot finishes against the brief.', 'An annotated proof or sample record and an agreed list of changes.'],
      ['Set the order baseline', 'Record the approved artwork, finish and physical reference with the quantities for each version.', 'A print reference that can be cited when requesting a repeat run.'],
    ],
    checks: [
      ['Colour target', 'Brand colours, critical panels, light and dark backgrounds.', 'Physical sample or named colour reference with priority items marked.'],
      ['Film and white backing', 'Clear or opaque areas, viewing side and white backing requirements.', 'Substrate direction and a marked artwork showing which areas need backing.'],
      ['Finish zones', 'Gloss, matte or spot finish placement in relation to artwork and pack features.', 'Finish map and the agreed sample for visual review.'],
      ['Repeat order', 'Artwork revision, prior job reference and acceptable changes to film or finish.', 'Approved reference and sign-off method agreed for the next order.'],
    ],
    example: {
      title: 'A repeat run needs a closer colour match',
      situation: 'A snack brand has a previous pouch with a matte front and a priority brand colour. The new order uses updated ingredient copy.',
      review: 'Use the previous pouch as the physical reference, identify the priority colour and finish zones, and prepare the updated artwork as a separately named revision.',
      handoff: 'An identified previous sample, revised file and agreed way to evaluate print and finish before authorising production.',
    },
    fields: ['SKU and artwork revision', 'Pack style, film appearance and priority colours', 'Physical print reference or sample ID', 'White backing, clear areas and finish map', 'Quantities per design and order destination', 'Proof or sample reviewer and target approval date', 'Previous order or reference sample for repeat production'],
    faq: [
      ['What if the same artwork runs on two films?', 'List each film separately and identify the shared colour targets. Agree which combinations need samples so the buyer can compare their appearance before approval.'],
      ['How should I request a print review for a repeat order?', 'Provide the previous order reference, retained sample and any new artwork revisions. Call out the visual attributes that need to stay consistent.'],
    ],
  },
  technical: {
    task: 'Check whether a pack will fit the product and line',
    decision: 'Agree on candidate structures, trial conditions and the evidence needed for approval.',
    steps: [
      ['Capture the current pack and line', 'Share a current pack or drawing with fill weight, filling equipment and relevant line constraints.', 'A project brief with baseline dimensions, fill conditions and open constraints.'],
      ['Compare candidate designs', 'Review fit and handling, film requirements, sealing surfaces and closure options alongside the product needs.', 'Sample candidates and a short list of differences to evaluate.'],
      ['Agree on the filled-pack trial', 'Identify the trial site, sample conditions and the people responsible for recording results and approving changes.', 'A trial brief with named evaluation checks and acceptance criteria.'],
    ],
    checks: [
      ['Line interface', 'Pouch pickup and opening, machine clearance or film feed requirements.', 'Machine model, drawing or representative sample, and observations from a trial.'],
      ['Performance requirements', 'Storage, distribution conditions and any required barrier or handling targets.', 'Buyer specification or agreed test method and limits.'],
      ['Closure and seal', 'Access for filling and sealing, closure location and how the consumer opens the pack.', 'Filled samples, annotated photos or line observations.'],
      ['Approval to proceed', 'Unresolved items, trial decision and responsibility for closing gaps.', 'Reviewed trial record and a revision of the packaging specification.'],
    ],
    example: {
      title: 'A pouch works by hand but snags on the line',
      situation: 'An existing pouch packs successfully during hand filling, but the customer wants it to run on automated equipment.',
      review: 'Document where the snag occurs and provide empty samples, the machine model and dimensions. Compare the existing bag and candidate samples on the same equipment, with observations logged at the affected station.',
      handoff: 'A shortlist of trial samples and the line criteria the buyer will use to approve a change.',
    },
    fields: ['Product, intended fill weight and storage conditions', 'Pack drawing or sample reference and pack dimensions', 'Line manufacturer or model, fill and seal interface', 'Barrier targets, test methods and specified conditions', 'Closure, opening and handling requirements', 'Current issue, photos and affected production stage', 'Trial site, expected checks and approval owner'],
    faq: [
      ['What data helps compare barrier options?', 'Share any specified oxygen or water vapour transmission limits with the method and conditions. Include the expected storage and shelf-life requirements so the team can assess which measurements matter for the project.'],
      ['Can the pack size be set from fill weight alone?', 'Share fill weight together with a representative product, intended shape and the fill volume or current pack. Use a filled sample to review the proposed dimensions.'],
    ],
  },
  recycling: {
    task: 'Evaluate a material change or claim',
    decision: 'Separate material selection, performance evidence and labelling review for each sales market.',
    steps: [
      ['Set the market context', 'List the intended markets, retailer requirements and target collection or recycling route for each pack.', 'A market-by-market brief and a plan for reviewing claims.'],
      ['Map the current and candidate pack', 'Record the film layers and available component information, including closures, labels, inks or adhesives.', 'An itemised baseline and candidate materials to discuss.'],
      ['Compare tests and claim evidence', 'Agree on the product and line checks for candidate samples. Assign a separate review of any on-pack wording by market.', 'Evaluation record and an evidence checklist for each proposed claim.'],
    ],
    checks: [
      ['Sales market', 'Destination, intended collection route and retailer requirements.', 'Market list and current retailer or programme guidance.'],
      ['Whole-pack design', 'Film construction, attachments, closures, coatings and ink coverage.', 'Supplier component breakdown and a physical sample.'],
      ['Performance comparison', 'Barrier, seal, filling line and handling performance compared with the current pack.', 'Agreed trial or test plan using the intended product and storage conditions.'],
      ['Claims and artwork', 'Exact wording, target market and review responsibility.', 'Market-specific evidence and approved label artwork revision.'],
    ],
    example: {
      title: 'A zipper pouch is sold in two markets',
      situation: 'A brand is reviewing a new material option for an existing zipper pouch sold in two regions, each with different collection and labelling requirements.',
      review: 'Compare both markets separately, list the zipper, label and film components, then evaluate candidate samples against the current pouch on the same filling line.',
      handoff: 'A material comparison, trial notes and two separate claim review records before changing the artwork.',
    },
    fields: ['Sales markets and retailer or labelling requirements', 'Current pouch sample and known film layer structure', 'Details on zipper, valve, label, ink and adhesives', 'Target material or collection route, if known', 'Barrier, storage, shelf-life and line requirements', 'Proposed claim wording and designated review owner', 'Trial and approval timeline'],
    faq: [
      ['Does specifying one polymer settle the claim?', 'Review the entire pack and the target programme or market. The construction, attachments and applicable collection or sorting criteria may affect what can be supported.'],
      ['Can we evaluate material before approving artwork?', 'Yes. Treat candidate material evaluation and review of the label claim as separate decisions, with evidence attached to each.'],
    ],
    resources: [
      ['https://recyclass.eu/wp-content/uploads/2026/04/RecyClass-DfR-Guidelines-Natural-PE-Films.pdf', 'RecyClass: natural PE flexible films guidelines'],
    ],
  },
  retort: {
    task: 'Plan a pouch trial with your processing team',
    decision: 'Agree on the candidate pack and the handoff to your process authority and quality team.',
    steps: [
      ['Bring the established process brief', 'Identify the product, intended pack size and approved requirements from the plant or process authority.', 'Process and pack constraints supplied by the responsible team.'],
      ['Define the sample handoff', 'Agree which pouch dimensions and constructions to evaluate. Identify sample quantities, check owners and the expected reporting format.', 'A sample plan with the pouch revision and the trial responsibilities.'],
      ['Record the planned approvals', 'Align with production and quality on what needs to be reviewed before the pouch specification is released.', 'An approval checklist identifying the person responsible for each decision.'],
    ],
    checks: [
      ['Product and pack', 'Product, fill weight, finished dimensions and proposed pouch reference.', 'Buyer brief and identified pack drawing or sample.'],
      ['Filling and closing', 'Equipment constraints, sealing area and sample identification.', 'Line information and a documented sample specification.'],
      ['Processing requirements', 'Existing requirements and deliverables from the plant and process authority.', 'A process brief supplied by the responsible processor.'],
      ['Approval record', 'Packaging revision, sample results and open items to close before release.', 'Trial record and sign-off from the designated owners.'],
    ],
    example: {
      title: 'A meal range is considering a second pouch size',
      situation: 'A prepared-food supplier wants to evaluate a second pouch size for a meal already packed in a different size.',
      review: 'Identify the original and candidate pouch revisions. Share the new pack and fill details with the process authority, define the sample lot and agree who reviews the sample and documents the outcome.',
      handoff: 'A traceable sample brief and an approval checklist for the new size before changing the packing specification.',
    },
    fields: ['Product and proposed fill weight and pouch dimensions', 'Current pouch and candidate pack reference', 'Plant or process authority contact and existing process brief', 'Filling and sealing equipment constraints', 'Pouch sample quantity and destination', 'Plant, quality and process approval responsibilities', 'Required documents, owner and target approval date'],
    faq: [
      ['Can the same approval automatically cover a different pouch size?', 'Discuss the change with your process authority before relying on an existing approval. Identify the new pouch dimensions, fill and construction so the responsible team can review their scope.'],
      ['How should samples be identified for trials?', 'Agree a reference that identifies the pouch revision, size and intended SKU. Share the reference with the plant and include it in the trial and approval record.'],
    ],
    resources: [
      ['https://www.fda.gov/food/guidance-documents-regulatory-information-topic-food-and-dietary-supplements/acidified-low-acid-canned-foods-guidance-documents-regulatory-information', 'FDA: U.S. guidance for acidified and low-acid canned foods'],
    ],
  },
};
