import { fmtM, sum } from '../../utils.js'

export function renderDrive(el) {
  let files = JSON.parse(localStorage.getItem('drive_files')||'[]')
  let parsing = false

  function render() {
    el.innerHTML=`
      <div class="grid-2" style="margin-bottom:14px">
        <div class="card" style="margin-bottom:0">
          <div class="card-header">
            <span class="card-title">Google Drive — Service Account</span>
            <span class="card-badge pill-green">Conectado</span>
          </div>
          <p style="font-size:12px;color:var(--txt2);margin-bottom:14px;line-height:1.6">
            Subí tu archivo <strong style="color:var(--txt)">.xlsx de planilla contable</strong> y los datos del dashboard se actualizarán automáticamente. También podés vincular tu Google Drive para sincronización automática.
          </p>

          <!-- File upload -->
          <div class="drive-drop" id="drop-zone">
            <div class="drive-drop-icon">📊</div>
            <div class="drive-drop-title">Arrastrá tu .xlsx acá</div>
            <div class="drive-drop-sub">o hacé click para seleccionar</div>
            <input type="file" id="file-input" accept=".xlsx,.xls,.csv" style="display:none"/>
          </div>

          <!-- Drive sync -->
          <div style="border-top:0.5px solid var(--border);padding-top:14px;margin-top:2px">
            <div class="card-title" style="margin-bottom:10px">Sincronizar con Google Drive</div>
            <div class="ff-field" style="margin-bottom:10px"><label class="ff-label">File ID del archivo en Drive</label>
              <input class="ff-input" id="drive-file-id" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" value="${localStorage.getItem('drive_file_id')||''}"/>
            </div>
            <button class="ff-btn ff-btn-primary" id="drive-sync-btn" style="width:100%">Sincronizar desde Drive</button>
            <div id="drive-status" style="margin-top:8px;font-size:12px"></div>
          </div>
        </div>

        <div class="card" style="margin-bottom:0">
          <div class="card-header">
            <span class="card-title">Archivos cargados</span>
            <span class="card-badge pill-blue">${files.length}</span>
          </div>
          ${files.length===0?`<div style="text-align:center;padding:30px;color:var(--txt3);font-size:12px">Sin archivos cargados todavía</div>`
          :files.map((f,i)=>`
            <div class="drive-file-row">
              <div class="drive-file-icon">📊</div>
              <div style="flex:1;overflow:hidden">
                <div class="drive-file-name">${f.name}</div>
                <div class="drive-file-size">${f.rows} filas · ${f.date}</div>
              </div>
              <button class="drive-file-btn ff-btn-primary" style="font-size:11px;padding:4px 10px" onclick="window.__applyFile(${i})">Aplicar</button>
              <button onclick="window.__removeFile(${i})" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:16px;padding:0 4px">×</button>
            </div>`).join('')}
        </div>
      </div>

      <div class="card" id="preview-card" style="display:none">
        <div class="card-header"><span class="card-title">Vista previa del archivo</span><span class="card-badge pill-green" id="preview-badge">—</span></div>
        <div id="preview-content"></div>
      </div>

    `
    bindDrop()
    bindSync()

    window.__removeFile = (i) => { files.splice(i,1); localStorage.setItem('drive_files',JSON.stringify(files)); render() }
    window.__applyFile = (i) => {
      const f = files[i]
      if (f.data) {
        localStorage.setItem('contable_data_override', JSON.stringify(f.data))
        showPreview(f)
        alert('✓ Datos aplicados al dashboard contable. Navegá a Overview para ver los cambios.')
      }
    }
  }

  function bindDrop() {
    const zone = document.getElementById('drop-zone')
    const input = document.getElementById('file-input')
    zone.addEventListener('click', ()=>input.click())
    zone.addEventListener('dragover', e=>{e.preventDefault();zone.classList.add('drag-over')})
    zone.addEventListener('dragleave', ()=>zone.classList.remove('drag-over'))
    zone.addEventListener('drop', e=>{e.preventDefault();zone.classList.remove('drag-over');handleFile(e.dataTransfer.files[0])})
    input.addEventListener('change', e=>handleFile(e.target.files[0]))
  }

  function bindSync() {
    document.getElementById('drive-sync-btn').addEventListener('click', async () => {
      const fileId = document.getElementById('drive-file-id').value.trim()
      if (!fileId) { alert('Ingresá el File ID del archivo'); return }
      localStorage.setItem('drive_file_id', fileId)
      const st = document.getElementById('drive-status')
      const btn = document.getElementById('drive-sync-btn')
      btn.disabled=true; btn.textContent='Sincronizando...'
      st.innerHTML=`<span style="color:var(--blue)">Conectando con Google Drive...</span>`
      try {
        const resp = await fetch('/api/core?action=drive', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({fileId})
        })
        const data = await resp.json()
        if (data.success) {
          const f = {name:data.fileName||'archivo-drive.xlsx', rows:data.rows||0, date:new Date().toLocaleDateString('es-AR'), data:data.parsed}
          files.push(f); localStorage.setItem('drive_files',JSON.stringify(files))
          st.innerHTML=`<span style="color:var(--green)">✓ ${f.rows} filas importadas desde Drive</span>`
          render()
          showPreview(f)
        } else {
          st.innerHTML=`<span style="color:var(--red)">Error: ${data.error}</span>`
        }
      } catch(e) {
        st.innerHTML=`<span style="color:var(--amber)">⚠ Error de conexión. ¿Configuraste GOOGLE_SERVICE_ACCOUNT_JSON en Vercel?</span>`
      }
      btn.disabled=false; btn.textContent='Sincronizar desde Drive'
    })
  }

  function handleFile(file) {
    if (!file) return
    const zone = document.getElementById('drop-zone')
    zone.innerHTML=`<div style="color:var(--blue);font-size:13px">Procesando ${file.name}...</div>`

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = e => {
        const lines = e.target.result.split('\n').filter(l=>l.trim())
        const headers = lines[0].split(',').map(h=>h.trim().replace(/"/g,''))
        const rows = lines.slice(1).map(l=>l.split(',').map(v=>v.trim().replace(/"/g,'')))
        const parsed = parseContableData(headers, rows)
        const f = {name:file.name, rows:lines.length-1, date:new Date().toLocaleDateString('es-AR'), data:parsed}
        files.push(f); localStorage.setItem('drive_files',JSON.stringify(files))
        render(); showPreview(f)
      }
      reader.readAsText(file)
    } else {
      // xlsx — call server
      const reader = new FileReader()
      reader.onload = async e => {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(e.target.result)))
        try {
          const resp = await fetch('/api/core?action=parse-xlsx', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({base64, name:file.name})
          })
          const data = await resp.json()
          const f = {name:file.name, rows:data.rows||0, date:new Date().toLocaleDateString('es-AR'), data:data.parsed}
          files.push(f); localStorage.setItem('drive_files',JSON.stringify(files))
          render(); showPreview(f)
        } catch(err) {
          render()
          alert('Error procesando el archivo. Intentá con CSV.')
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  function parseContableData(headers, rows) {
    // Try to extract ventas, CMV from generic xlsx
    return { headers, rows: rows.slice(0,20), raw: true }
  }

  function showPreview(f) {
    const card = document.getElementById('preview-card')
    const badge = document.getElementById('preview-badge')
    const content = document.getElementById('preview-content')
    if (!card) return
    card.style.display='block'
    badge.textContent = `${f.rows} filas`
    if (f.data?.raw && f.data?.rows) {
      content.innerHTML=`<div style="overflow-x:auto"><table class="tbl">
        <thead><tr>${(f.data.headers||[]).map(h=>`<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${f.data.rows.map(r=>`<tr>${r.map(v=>`<td style="font-size:11px">${v||''}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div><div style="font-size:11px;color:var(--txt3);margin-top:8px">Mostrando primeras 20 filas</div>`
    } else {
      content.innerHTML=`<div style="font-size:12px;color:var(--green)">✓ Archivo procesado y listo para aplicar al dashboard</div>`
    }
  }

  render()
}
