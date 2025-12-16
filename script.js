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

// Function to handle download
function downloadURI(uri, name) {
  // For mobile devices, we'll use a different approach
  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/i)) {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = uri;
    link.download = name;
    
    // iOS devices require the link to be in the document
    document.body.appendChild(link);
    
    // Create and dispatch a click event
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    // Try to trigger the download
    link.dispatchEvent(event);
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    
    // If the download didn't start, open in new tab as fallback
    setTimeout(() => {
      if (!link.download) {
        window.open(uri, '_blank');
      }
    }, 1000);
    
    return;
  }
  
  // For desktop browsers
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download PNG
btnPNG.addEventListener('click', async () => {
  try {
    // Show loading state
    btnPNG.textContent = 'Generating...';
    btnPNG.disabled = true;
    
    // Calculate scale based on device
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 1.5 : 2;
    
    const opts = {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY
    };

    // Temporarily adjust certificate size for better quality
    const originalWidth = certificate.style.width;
    const originalHeight = certificate.style.height;
    certificate.style.width = '820px';
    certificate.style.height = '580px';

    const canvas = await html2canvas(certificate, opts);
    
    // Restore original size
    certificate.style.width = originalWidth;
    certificate.style.height = originalHeight;
    
    const fileName = `${(inpName.value || 'certificate').replace(/\s+/g,'_')}.png`;
    const dataUrl = canvas.toDataURL('image/png');
    
    // Use our enhanced download function which handles both mobile and desktop
    downloadURI(dataUrl, fileName);
  } catch (err) {
    console.error('Error generating image:', err);
    alert('Error generating image. Please try again.');
  } finally {
    btnPNG.textContent = 'Download PNG';
    btnPNG.disabled = false;
  }
});

// Download PDF (A4 landscape)
btnPDF.addEventListener('click', async () => {
  try {
    // Show loading state
    btnPDF.textContent = 'Generating PDF...';
    btnPDF.disabled = true;
    
    const { jsPDF } = window.jspdf;
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 1.5 : 2;
    
    // Temporarily adjust certificate size for better quality
    const originalWidth = certificate.style.width;
    const originalHeight = certificate.style.height;
    certificate.style.width = '820px';
    certificate.style.height = '580px';
    
    const canvas = await html2canvas(certificate, { 
      scale,
      useCORS: true, 
      allowTaint: true, 
      backgroundColor: null,
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY
    });
    
    // Restore original size
    certificate.style.width = originalWidth;
    certificate.style.height = originalHeight;
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'pt', 
      format: 'a4' 
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Create image to get dimensions
    const img = new Image();
    img.src = imgData;
    
    return new Promise((resolve) => {
      img.onload = function() {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = Math.min((pageWidth - 40) / imgWidth, (pageHeight - 40) / imgHeight);
        const centerX = (pageWidth - (imgWidth * ratio)) / 2;
        const centerY = (pageHeight - (imgHeight * ratio)) / 2;
        
        pdf.addImage(imgData, 'PNG', centerX, centerY, imgWidth * ratio, imgHeight * ratio, undefined, 'FAST');
        
        const fileName = `${(inpName.value || 'certificate').replace(/\s+/g,'_')}.pdf`;
        
        // For both mobile and desktop, use the same method
        const pdfDataUrl = pdf.output('datauristring');
        downloadURI(pdfDataUrl, fileName);
        
        resolve();
      };
    });
  } catch (err) {
    console.error('Error generating PDF:', err);
    alert('Error generating PDF. Please try again.');
  } finally {
    btnPDF.textContent = 'Download PDF';
    btnPDF.disabled = false;
  }
});

// Handle mobile viewport
function handleViewport() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // Add mobile-specific classes or styles if needed
    document.body.classList.add('mobile-view');
  } else {
    document.body.classList.remove('mobile-view');
  }
}

// Initial check
handleViewport();

// Update on resize
window.addEventListener('resize', handleViewport);
