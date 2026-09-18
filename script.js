const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const controls = document.getElementById('controls');
const qualityInput = document.getElementById('quality');
const qualityVal = document.getElementById('qualityVal');
const origSizeEl = document.getElementById('origSize');
const compSizeEl = document.getElementById('compSize');
const savingsEl = document.getElementById('savings');
const previewImg = document.getElementById('previewImg');
const downloadBtn = document.getElementById('downloadBtn');

let originalFile = null;

browseBtn.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('click', (e) => {
    if (e.target !== browseBtn) fileInput.click();
});

fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(56, 189, 248, 0.2)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.background = 'rgba(56, 189, 248, 0.05)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(56, 189, 248, 0.05)';
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

function handleFile(file) {
    if (!file || !file.type.match('image.*')) return;
    originalFile = file;
    origSizeEl.textContent = formatBytes(file.size);
    
    // Show controls area and trigger simulated processing
    controls.style.display = 'block';
    processWithLoading();
}

qualityInput.addEventListener('input', (e) => {
    qualityVal.textContent = `${e.target.value}%`;
    compressImage();
});

function processWithLoading() {
    // Temporarily hide preview and show processing status
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Processing Image...';
    
    // Simulate a 1.2 second processing delay for realistic UX
    setTimeout(() => {
        compressImage();
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Compressed Image';
    }, 1200);
}

function compressImage() {
    if (!originalFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(originalFile);
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const quality = qualityInput.value / 100;
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            previewImg.src = compressedDataUrl;

            // Calculate compressed file size
            const head = 'data:image/jpeg;base64,';
            const sizeInBytes = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
            
            compSizeEl.textContent = formatBytes(sizeInBytes);
            const saved = Math.max(0, Math.round(((originalFile.size - sizeInBytes) / originalFile.size) * 100));
            savingsEl.textContent = `${saved}%`;

            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.download = `compressed-${originalFile.name}`;
                link.href = compressedDataUrl;
                link.click();
            };
        };
    };
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.floor(Math.log(bytes) / Math.log(k)));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}