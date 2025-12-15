// Elements
const inpName = document.getElementById('inp-name');
const inpTitle = document.getElementById('inp-title');
const inpEvent = document.getElementById('inp-event');
const inpDate = document.getElementById('inp-date');
const inpLogo = document.getElementById('inp-logo');
const inpTheme = document.getElementById('inp-theme');

const certTitle = document.getElementById('cert-title');
const certName = document.getElementById('cert-name');
const certEvent = document.getElementById('cert-event');
const certDate = document.getElementById('cert-date');
const logoPreview = document.getElementById('logo-preview');
const certificate = document.getElementById('certificate');

const btnPNG = document.getElementById('download-png');
const btnPDF = document.getElementById('download-pdf');

// Live update functions
inpName.addEventListener('input', () => certName.textContent = inpName.value || 'Recipient Name');
inpTitle.addEventListener('input', () => certTitle.textContent = inpTitle.value || 'Certificate Title');
inpEvent.addEventListener('input', () => certEvent.textContent = inpEvent.value || 'For ...');
inpDate.addEventListener('input', () => certDate.textContent = inpDate.value || 'Date');

// Theme switch
inpTheme.addEventListener('change', () => {
  const t = inpTheme.value;
  certificate.classList.remove('theme-blue','theme-gold','theme-green','theme-simple');
  if (t === 'blue') certificate.classList.add('theme-blue');
  if (t === 'gold') certificate.classList.add('theme-gold');
  if (t === 'green') certificate.classList.add('theme-green');
  if (t === 'simple') certificate.classList.add('theme-simple');
});

// Logo upload preview
inpLogo.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    logoPreview.style.backgroundImage = `url(${ev.target.result})`;
    logoPreview.style.backgroundSize = 'cover';
    logoPreview.style.backgroundPosition = 'center';
    logoPreview.textContent = '';
  };
  reader.readAsDataURL(file);
});

// Download PNG
btnPNG.addEventListener('click', async () => {
  // scale up for higher resolution
  const scale = 2;
  const opts = {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null
  };
  try {
    const canvas = await html2canvas(certificate, opts);
    const link = document.createElement('a');
    link.download = `${(inpName.value || 'certificate').replace(/\s+/g,'_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert('Error generating image: ' + err.message);
  }
});

// Download PDF (A4 landscape)
btnPDF.addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const scale = 2; // for higher res
  try {
    const canvas = await html2canvas(certificate, { scale, useCORS:true, allowTaint:true, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');

    // A4 landscape in pt: 842 x 595 (approximately)
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // fit image into page while preserving aspect ratio
    const img = new Image();
    img.src = imgData;
    img.onload = function(){
      const imgW = img.width;
      const imgH = img.height;
      const ratio = Math.min(pageWidth / imgW, pageHeight / imgH);
      const w = imgW * ratio;
      const h = imgH * ratio;
      const x = (pageWidth - w) / 2;
      const y = (pageHeight - h) / 2;
      pdf.addImage(imgData, 'PNG', x, y, w, h, undefined, 'FAST');
      pdf.save(`${(inpName.value || 'certificate').replace(/\s+/g,'_')}.pdf`);
    };
  } catch (err) {
    alert('Error generating PDF: ' + err.message);
  }
});
