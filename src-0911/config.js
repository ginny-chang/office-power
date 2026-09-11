// Two entry points share this source tree. The Production page marks itself with
// data-cases="off" on <html>; everything else keeps the case studies.
export const SHOW_CASE_STUDIES = document.documentElement.dataset.cases !== 'off';
