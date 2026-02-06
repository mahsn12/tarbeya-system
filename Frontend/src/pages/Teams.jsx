import React, { useMemo, useState, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'

export default function Teams(){
  const [rowData,setRowData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    fetch('http://localhost:4000/api/teams')
      .then(r=>r.json())
      .then(data=>{ if(mounted){
        const rows = data.map(t=>({
          teamCode: t.team_code,
          faculty: t.faculty_name,
          members: Array.isArray(t.student_names)? t.student_names.join('، ') : '',
          nid: Array.isArray(t.national_ids)? t.national_ids.join(',') : '',
          researches: Array.isArray(t.research_topics)? t.research_topics.join('، ') : ''
        }))
        setRowData(rows); setLoading(false)
      } })
      .catch(err=>{ if(mounted){ setError(err.message||String(err)); setLoading(false) } })
    return ()=> mounted = false
  },[])

  const columnDefs = useMemo(()=>[
    {field:'teamCode',headerName:'كود الفريق',width:120},
    {field:'faculty',headerName:'الكلية',width:160},
    {field:'members',headerName:'أسماء أعضاء الفريق',flex:1,editable:true},
    {field:'nid',headerName:'الرقم القومي',width:220,editable:true},
    {field:'researches',headerName:'أبحاث أعضاء الفريق',flex:1,editable:true}
  ],[])

  return (
    <div>
      <div className="controls">
        <button className="btn" onClick={()=>setRowData(prev=>[...prev,{teamCode:'',faculty:'',members:'',nid:'',researches:''}])}>إضافة فريق</button>
      </div>
      {loading && <div>جارٍ التحميل...</div>}
      {error && <div style={{color:'red'}}>خطأ: {error}</div>}
      <div className="ag-theme-alpine grid-container">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{editable:true,filter:true,sortable:true,resizable:true}}
          enableRangeSelection={true}
        />
      </div>
    </div>
  )
}
