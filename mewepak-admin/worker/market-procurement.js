// Candidate packs and sample checks tailored to how each product is filled, sold and used.
export const marketProcurement = {
  'coffee-tea': {
    focus: ['Confirm the valve and closure on a filled pack', 'Bring the roast-to-pack interval, fill volume and desired use. Position the valve and zipper against the fill level and the sealing area before artwork is approved.'],
    rows: [
      ['Whole bean coffee', 'Upright or flat-bottom pouch', 'Roast-to-pack interval, valve position and filled footprint'],
      ['Ground coffee', 'Resealable pouch or compatible roll stock', 'Fill method, seal area and barrier target'],
      ['Loose-leaf tea', 'Flat or upright pouch sized to leaf volume', 'Light and moisture protection, opening and reclosure'],
    ],
  },
  'snacks-sweets': {
    focus: ['Use the actual snack in the trial', 'Compare how the portion pours, how much room the filled bag needs and how it survives the intended distribution case. Check the portion separately from the display artwork.'],
    rows: [
      ['Crisps and fragile snacks', 'Upright or pillow pack', 'Headspace, breakage and case fit'],
      ['Nuts and sharing mixes', 'Resealable stand-up pouch', 'Barrier target, zipper clearance and repeat use'],
      ['Candy and single servings', 'Flat or shaped pouch', 'Seal area, opening and display requirements'],
    ],
  },
  supplement: {
    focus: ['Plan artwork by serving size and SKU', 'List each variant, fill size and required panel information together. Review scoop clearance, headspace and the print area on the selected size.'],
    rows: [
      ['Powders and blends', 'Resealable stand-up or flat-bottom pouch', 'Bulk density, scoop access and powder near the seal'],
      ['Capsules and tablets', 'Flat or stand-up pouch', 'Unit count, access and product protection'],
      ['Single servings', 'Flat sachet or roll-stock format', 'Dose, opening, seal area and line compatibility'],
    ],
  },
  'pet-food': {
    focus: ['Compare handling at the finished fill weight', 'Ask for a filled-pack review across retail and larger sizes. Agree the pack footprint, opening, repeated closure and the distribution checks your team will run.'],
    rows: [
      ['Dry kibble', 'Flat-bottom or quad-seal bag', 'Filled footprint, carrying and case or pallet layout'],
      ['Treats and small portions', 'Resealable stand-up pouch', 'Opening size, zipper use and format by portion'],
      ['Wet recipes', 'Pouch matched to the planned process', 'Product profile, planned process and samples for validation'],
    ],
  },
  'sauce-soup': {
    focus: ['Test the way the product dispenses', 'Bring a product description, viscosity and the size of inclusions. Select a closure and opening to review with the filled pack before confirming artwork.'],
    rows: [
      ['Pourable sauces', 'Spout pouch or larger dispense format', 'Flow, closure and reseal after use'],
      ['Soups with pieces', 'Open-top or wide-access candidate', 'Largest inclusion, filling method and seal area'],
      ['Single servings', 'Flat sachet or process-matched pouch', 'Portion, tear and storage or processing route'],
    ],
  },
  'baby-food': {
    focus: ['Review the finished pack with the processing team', 'Describe the recipe, fill format, closure and intended storage so the relevant sample checks and supporting documents can be agreed together.'],
    rows: [
      ['Purées', 'Spouted portion pouch to review', 'Closure, dispense handling and filled-pack checks'],
      ['Dry snacks', 'Flat or upright portion pouch', 'Portion access, breakage and storage'],
      ['Processed meals', 'Pouch matched to the planned process', 'Product details, process requirements and approval responsibilities'],
    ],
  },
  beverage: {
    focus: ['Mock up the pack at the intended capacity', 'Compare dispensing and upright stability with a filled sample. Record the filling method, case configuration and how the customer will store and use the pack.'],
    rows: [
      ['Single-serve drinks', 'Spout pouch to evaluate', 'Capacity, opening size and handling'],
      ['Concentrates', 'Spout or dispense pouch', 'Flow, closure and repeat dispensing'],
      ['Foodservice volumes', 'Bag-in-box or tap format', 'Fitment, carton fit and dispensing position'],
    ],
  },
  'frozen-food': {
    focus: ['Set sample checks around the cold chain', 'List filling condition, storage range and pack handling. Use an actual filled pack to evaluate the seal area, handling after storage and fit in the intended case.'],
    rows: [
      ['Frozen fruit and vegetables', 'Upright or machine-filled flexible pack', 'Piece shape, seal area and handling after cold storage'],
      ['Prepared frozen meals', 'Flat pouch or compatible roll stock', 'Portion shape, opening and line compatibility'],
      ['Resealable multi-serve packs', 'Zippered stand-up pouch', 'Reclosure, filled bag stability and case fit'],
    ],
  },
  'home-care': {
    focus: ['Review compatibility with the real formulation', 'Bring the formulation type, dose and use conditions. Compare the dispensing features, pack stability and shipping handling under your project conditions.'],
    rows: [
      ['Liquid refills', 'Spout pouch or tap format', 'Flow, closure, stability and dispense handling'],
      ['Cleaning powders', 'Upright pack with wide access', 'Powder flow, dosing and reseal'],
      ['Tablets and pods', 'Upright or flat-bottom pouch', 'Unit count, moisture protection and closure requirements'],
    ],
  },
  'meat-poultry': {
    focus: ['Trial the actual cuts and portion sizes', 'Describe the cut, retained liquid and packing conditions. Check product contact areas, the seal region and handling after storage with the team that fills the pack.'],
    rows: [
      ['Chilled portions', 'Flat pouch or equipment-compatible film', 'Liquid near seal, cut shape and storage conditions'],
      ['Frozen cuts', 'Flat pack or suitable roll stock', 'Edges, puncture concerns and case handling'],
      ['Cooked preparations', 'Pouch selected for the project process', 'Process details, filled sample and approval requirements'],
    ],
  },
  'beauty-care': {
    focus: ['Test the first opening and the last dispense', 'Compare how a filled sample behaves through the entire use cycle. For a family of products, review viscosity and fill volume before selecting a shared pouch or opening.'],
    rows: [
      ['Shampoo and lotion refills', 'Spouted pouch', 'Viscosity, flow and reclosure'],
      ['Travel sizes', 'Spout or shaped pouch to review', 'Dispense volume, grip and fit in a kit'],
      ['Trial portions', 'Flat sachet', 'Tear position, portion and artwork panel'],
    ],
  },
  'sea-food': {
    focus: ['Bring the pack through the intended handling route', 'Record the shape and condition of the seafood at filling, storage and dispatch. Use the same assumptions for each sample you compare.'],
    rows: [
      ['Chilled fillets', 'Flat pouch or film to review', 'Drip, product profile and seal area'],
      ['Frozen seafood', 'Flat pouch or roll-stock system', 'Ice, sharp edges and cold-chain handling'],
      ['Seasoned and ready preparations', 'Process-matched pouch candidate', 'Product profile, opening and validation plan'],
    ],
  },
  'fruits-veggies': {
    focus: ['Start with the condition of the produce', 'Document whether the contents are fresh-cut, frozen or dried. Use a filled sample to check display, opening and handling in the relevant storage and transport conditions.'],
    rows: [
      ['Fresh-cut produce', 'Film or bag for the planned line', 'Product condition, required exchange and shelf display'],
      ['Frozen pieces', 'Flat or upright pack', 'Cold handling, shape and seal area'],
      ['Dried fruit', 'Resealable upright pouch', 'Moisture protection, portion and repeat use'],
    ],
  },
  cbd: {
    focus: ['Share the destination and required packaging documents', 'Start with your accepted packaging specification and any required closure or printing documentation. Confirm service and sample scope directly for the destination.'],
    rows: [
      ['Retail packs', 'Upright or shaped pouch to discuss', 'Finished dimensions, display and specified closure'],
      ['Samples or small units', 'Flat pouch to discuss', 'Pack quantity, artwork area and open method'],
      ['Multiple variants', 'Existing approved pack, with artwork versions', 'Market, variant list and required supporting documents'],
    ],
  },
  cosmetics: {
    focus: ['Review print on the selected pack size', 'Use a proof at finished size to verify that the opening, product name and required information all have space. Handle a filled sample to review the texture and dispensing.'],
    rows: [
      ['Skincare samples', 'Flat sachet', 'Dose, tear position and fine text'],
      ['Mask or treatment packs', 'Flat or shaped pouch', 'Insert dimensions, handling and finish'],
      ['Cream or gel refills', 'Spout pouch to evaluate', 'Viscosity, dispense and seal area'],
    ],
  },
  'powder-spices': {
    focus: ['Use bulk density to choose a starting size', 'Bring actual fill weight, bulk volume and the dosing method. Check how the powder settles and whether particles are present in the sealing area.'],
    rows: [
      ['Fine powders', 'Flat or upright pouch', 'Dust near seal, settled volume and dosing'],
      ['Granulated seasonings', 'Resealable upright pouch', 'Pour control, repeat use and moisture protection'],
      ['Whole spices or blends', 'Flat-bottom or upright pouch', 'Pack window, visibility and case fit if applicable'],
    ],
  },
  fashion: {
    focus: ['Size the pack around the folded item', 'Measure the garment as it will be packed, including hang tags and any inserts. Confirm the opening, barcode position and whether retail and dispatch use the same pack.'],
    rows: [
      ['Folded garments', 'Polybag or flat pack', 'Folded length, width and thickness'],
      ['Retail display', 'Flat or upright pack', 'Visibility, display position and barcode'],
      ['Multipacks', 'Pack sized to the assembled set', 'Total dimensions, closing method and shipping case'],
    ],
  },
  'tobacco-filters': {
    focus: ['Confirm the approved pack specification first', 'Share the packaging drawing, dimensions, artwork requirements and destination. Ask which formats and documentation are available for the project.'],
    rows: [
      ['Small units', 'Flat pouch to discuss', 'Unit dimensions, count and access'],
      ['Retail multipacks', 'Upright or flat pack to discuss', 'Filled dimensions, presentation and closing method'],
      ['Equipment-led projects', 'Roll stock to discuss', 'Machine type, web width and print register'],
    ],
  },
  'cbd-thc': {
    focus: ['Match the request to one specification per destination', 'Separate the destination, required packaging documentation and artwork versions for each SKU. The project review can then confirm the formats and sample scope available.'],
    rows: [
      ['Pack development', 'Flat or stand-up pouch to discuss', 'Sizing, requested closure and required documents'],
      ['Artwork revisions', 'Retain the approved format where applicable', 'Market versions, artwork IDs and sign-off'],
      ['Roll-stock enquiries', 'Film to match the identified filling line', 'Web details, equipment and specification approval'],
    ],
  },
  cannabis: {
    focus: ['Send an existing drawing or sample when available', 'Identify the destination and required packaging specifications. Include the approved dimensions or an existing sample reference and contact the team for project availability.'],
    rows: [
      ['Single units', 'Flat packaging to discuss', 'Product dimensions, opening and artwork space'],
      ['Retail pouches', 'Upright pack to discuss', 'Display, requested closure and filled size'],
      ['Repeat programmes', 'Pack family by specification', 'Destination, variants and supporting documents'],
    ],
  },
  accessories: {
    focus: ['Compare a fully assembled pack', 'Pack the actual item with its inserts or hardware. Check the clearance, where the label will sit and how the product will be opened at retail or after delivery.'],
    rows: [
      ['Small accessories', 'Flat pouch or polybag', 'Part dimensions, fit and opening'],
      ['Retail sets', 'Upright or flat display pack', 'Visibility, display and identifier placement'],
      ['Refill kits', 'Format sized to the grouped components', 'Count, contents layout and pack closing'],
    ],
  },
};
