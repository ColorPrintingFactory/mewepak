const legacyProcessSections = new Set([
  '#process-stages', '#project-enquiry', '#why-mewepak', '#packaging-help', '#get-in-touch',
]);
if (legacyProcessSections.has(location.hash)) {
  location.replace('/sustainability/our-process/' + location.search + location.hash);
}
