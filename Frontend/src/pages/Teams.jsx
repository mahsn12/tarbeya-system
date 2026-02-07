import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'

const API_BASE = 'http://localhost:4000/api/teams'

const parseList = (value, asNumbers = false) => {
  const parts = String(value || '')
    .split(/[،,]/)
    .map(item => item.trim())
    .filter(Boolean)

  return asNumbers ? parts.map(Number).filter(Number.isFinite) : parts
}

export default function Teams(){
  const [rowData,setRowData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    fetch(API_BASE)
      .then(r=>r.json())
      .then(data=>{ if(mounted){
        const rows = data.map(t=>({
          _id: t._id,
          teamCode: t.team_code,
          faculty: t.faculty_name,
          members: Array.isArray(t.student_names)? t.student_names.join('، ') : '',
          nid: Array.isArray(t.national_ids)? t.national_ids.join(',') : '',
          researches: Array.isArray(t.research_topics)? t.research_topics.join('، ') : ''
        }))
        setRowData(rows); setLoading(false)
      } })
      .catch(err=>{ if(mounted){ setError(err.message||String(err)); setLoading(false) } })
    return ()=> { mounted = false }
  },[])

  const saveTeam = useCallback(async (id, row) => {
    const payload = {
      team_code: row.teamCode,
      faculty_name: row.faculty,
      student_names: parseList(row.members),
      national_ids: parseList(row.nid, true),
      research_topics: parseList(row.researches)
    }

    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.message || 'تعذر تحديث الفريق')
    }
  },[])

  const addTeam = useCallback(async () => {
    setError(null)
    const stamp = Date.now()
    const payload = {
      team_code: `TEAM-${stamp}`,
      faculty_name: 'غير محدد',
      student_names: [`عضو ${stamp}`],
      national_ids: [stamp],
      research_topics: ['بحث مبدئي']
    }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || 'تعذر إضافة فريق')
      }
      const created = await response.json()
      setRowData(prev => [...prev, {
        _id: created._id,
        teamCode: created.team_code,
        faculty: created.faculty_name,
        members: Array.isArray(created.student_names) ? created.student_names.join('، ') : '',
        nid: Array.isArray(created.national_ids) ? created.national_ids.join(',') : '',
        researches: Array.isArray(created.research_topics) ? created.research_topics.join('، ') : ''
      }])
    } catch (err) {
      setError(err.message || String(err))
    }
  },[])

  const columnDefs = useMemo(()=>[
    {field:'teamCode',headerName:'كود الفريق',width:140},
    {field:'faculty',headerName:'الكلية',width:160},
    {field:'members',headerName:'أسماء أعضاء الفريق',flex:1,editable:true},
    {field:'nid',headerName:'الرقم القومي',width:220,editable:true},
    {field:'researches',headerName:'أبحاث أعضاء الفريق',flex:1,editable:true}
  ],[])

  return (
    <div>
      <div className="controls">
        <button className="btn" onClick={addTeam}>إضافة فريق</button>
      </div>
      {loading && <div>جارٍ التحميل...</div>}
      {error && <div style={{color:'red'}}>خطأ: {error}</div>}
      <div className="ag-theme-alpine grid-container">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{editable:true,filter:true,sortable:true,resizable:true}}
          enableRangeSelection={true}
          onCellValueChanged={async (params) => {
            const id = params.data?._id
            if (!id) return
            try {
              await saveTeam(id, params.data)
            } catch (err) {
              setError(err.message || String(err))
            }
          }}
        />
      </div>
    </div>
  )
}
