import React, { useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'

export default function Research(){
  const [rowData,setRowData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    fetch('http://localhost:4000/api/research-topics')
      .then(r=>r.json())
      .then(data=>{ if(mounted){ setRowData(data.map(d=>({title:d.topic_name}))); setLoading(false)} })
      .catch(err=>{ if(mounted){ setError(err.message||String(err)); setLoading(false)} })
    return ()=> mounted = false
  },[])

  const columnDefs = [
    {field:'title',headerName:'اسم البحث',flex:1,editable:true}
  ]

  return (
    <div>
      <div className="controls">
        <button className="btn" onClick={()=>setRowData(prev=>[...prev,{title:''}])}>إضافة بحث</button>
      </div>
      {loading && <div>جارٍ التحميل...</div>}
      {error && <div style={{color:'red'}}>خطأ: {error}</div>}
      <div className="ag-theme-alpine grid-container">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{editable:true,filter:true,resizable:true}}
          enableRangeSelection={true}
        />
      </div>
    </div>
  )
}
