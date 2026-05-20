import type { AnalysisResult, ImageInfo } from './types.js'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeJsString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
}

function generateImageCards(
  images: ImageInfo[],
  usedPaths: Set<string>,
  type: 'all' | 'used' | 'unused',
): string {
  return images.map((img, index) => {
    const isUsed = type === 'used' || (type === 'all' && usedPaths.has(img.relativePath))
    const badgeClass = isUsed ? 'badge-used' : 'badge-unused'
    const badgeText = isUsed ? '✓ Used' : '✗ Unused'
    const sizeKB = (img.size / 1024).toFixed(2)
    const encodedPath = encodeURIComponent(img.relativePath)
    const escapedPath = escapeJsString(img.relativePath)

    return `
      <div class="image-card" data-name="${escapeHtml(img.name.toLowerCase())}" data-path="${escapeHtml(img.relativePath.toLowerCase())}">
        <div class="image-wrapper">
          <img src="/${encodedPath}" alt="${escapeHtml(img.name)}" loading="lazy" />
        </div>
        <div class="image-info">
          <span class="badge ${badgeClass}">${badgeText}</span>
          <div class="image-name" title="${escapeHtml(img.name)}">${escapeHtml(img.name)}</div>
          <div class="image-path" title="${escapeHtml(img.relativePath)}">${escapeHtml(img.relativePath)}</div>
          <div class="image-size">${sizeKB} KB</div>
          <div class="actions">
            <button class="btn btn-copy" onclick="copyPath('${escapedPath}')">Copy path</button>
            ${!isUsed ? `<button class="btn btn-delete" onclick="deleteImage(${index}, '${escapedPath}')">Delete</button>` : ''}
          </div>
        </div>
      </div>
    `
  }).join('')
}

const REPORT_STYLES = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1600px; margin: 0 auto; }
    .header {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header h1 { color: #333; margin-bottom: 15px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .stat-card {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-card.total { background: #e3f2fd; color: #1976d2; }
    .stat-card.used { background: #e8f5e9; color: #388e3c; }
    .stat-card.unused { background: #ffebee; color: #d32f2f; }
    .stat-card.savings { background: #fff3e0; color: #f57c00; }
    .stat-value { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
    .stat-label { font-size: 14px; opacity: 0.8; }
    .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
    .tab {
      padding: 12px 24px;
      background: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .tab.active { background: #1976d2; color: white; }
    .tab:hover:not(.active) { background: #e0e0e0; }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .image-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .image-card:hover { transform: translateY(-4px); }
    .image-wrapper {
      width: 100%;
      height: 200px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .image-wrapper img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .image-info { padding: 15px; }
    .image-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .image-path {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
      word-break: break-all;
    }
    .image-size { font-size: 13px; color: #666; margin-bottom: 10px; }
    .actions { display: flex; gap: 8px; }
    .btn {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .btn-copy { background: #1976d2; color: white; }
    .btn-copy:hover { background: #1565c0; }
    .btn-delete { background: #d32f2f; color: white; }
    .btn-delete:hover { background: #c62828; }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .badge-used { background: #e8f5e9; color: #388e3c; }
    .badge-unused { background: #ffebee; color: #d32f2f; }
    .hidden { display: none; }
    .search-box { margin-bottom: 20px; }
    .search-box input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
    }
    .search-box input:focus {
      outline: none;
      border-color: #1976d2;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
`

export function generateReportHtml(result: AnalysisResult): string {
  const { allImages, usedImages, imageAudit } = result
  const imageSize = imageAudit.reduce((sum, img) => sum + img.size, 0)
  const usedList = allImages.filter(img => usedImages.has(img.relativePath))

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Audit Report</title>
  <style>${REPORT_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🖼️ Image Audit Report</h1>
      <p>Find unused image assets and optimize bundle size</p>
      <div class="stats">
        <div class="stat-card total">
          <div class="stat-value">${allImages.length}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card used">
          <div class="stat-value">${usedImages.size}</div>
          <div class="stat-label">Used</div>
        </div>
        <div class="stat-card unused">
          <div class="stat-value">${imageAudit.length}</div>
          <div class="stat-label">Unused</div>
        </div>
        <div class="stat-card savings">
          <div class="stat-value">${(imageSize / 1024).toFixed(2)} KB</div>
          <div class="stat-label">Potential savings</div>
        </div>
      </div>
    </div>
    <div class="warning">
      ⚠️ <strong>Note:</strong> Results are heuristic only. Verify before deleting — some images may load at runtime or via CSS.
    </div>
    <div class="tabs">
      <button class="tab active" onclick="showTab('all', this)">All (${allImages.length})</button>
      <button class="tab" onclick="showTab('unused', this)">Unused (${imageAudit.length})</button>
      <button class="tab" onclick="showTab('used', this)">Used (${usedImages.size})</button>
    </div>
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Search by name or path..." onkeyup="filterImages()" />
    </div>
    <div id="all-images" class="gallery">
      ${generateImageCards(allImages, usedImages, 'all')}
    </div>
    <div id="image-audit" class="gallery hidden">
      ${generateImageCards(imageAudit, usedImages, 'unused')}
    </div>
    <div id="used-images" class="gallery hidden">
      ${generateImageCards(usedList, usedImages, 'used')}
    </div>
  </div>
  <script>
    function showTab(tab, el) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      ['all-images', 'image-audit', 'used-images'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
      });
      document.getElementById(tab + '-images').classList.remove('hidden');
    }
    function filterImages() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const visibleGallery = document.querySelector('.gallery:not(.hidden)');
      visibleGallery.querySelectorAll('.image-card').forEach(card => {
        const name = card.dataset.name;
        const path = card.dataset.path;
        card.style.display = (name.includes(searchTerm) || path.includes(searchTerm)) ? 'block' : 'none';
      });
    }
    function copyPath(relativePath) {
      navigator.clipboard.writeText(relativePath).then(() => {
        alert('Copied: ' + relativePath);
      });
    }
    function deleteImage(index, relativePath) {
      if (!confirm('Delete this image?\\n' + relativePath)) return;
      fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: relativePath })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            window.location.href = window.location.pathname + '?t=' + Date.now();
          } else {
            alert('Delete failed: ' + data.error);
          }
        })
        .catch(err => alert('Request failed: ' + err.message));
    }
  </script>
</body>
</html>`

  return html.replaceAll('div', 'div')
}
