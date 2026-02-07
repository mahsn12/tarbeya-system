import React, { useEffect, useState, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'

const API_BASE = 'http://localhost:4000/api/research-topics'

export default function Research(){
  const [rowData,setRowData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    fetch(API_BASE)
      .then(r=>r.json())
      .then(data=>{ if(mounted){ setRowData(data.map(d=>({_id: d._id, title:d.topic_name}))); setLoading(false)} })
      .catch(err=>{ if(mounted){ setError(err.message||String(err)); setLoading(false)} })
    return ()=> { mounted = false }
  },[])

  const addResearch = useCallback(async () => {
    setError(null)
    const payload = { topic_name: `بحث جديد ${Date.now()}` }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error('تعذر إضافة البحث')
      }
      const created = await response.json()
      setRowData(prev => [...prev, { _id: created._id, title: created.topic_name }])
    } catch (err) {
      setError(err.message || String(err))
    }
  },[])

  const updateResearch = useCallback(async (id, title) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_name: title })
    })
    if (!response.ok) {
      throw new Error('تعذر تحديث البحث')
    }
  },[])

  const columnDefs = [
    {field:'title',headerName:'اسم البحث',flex:1,editable:true}
  ]

  return (
    <div>
      <div className="controls">
        <button className="btn" onClick={addResearch}>إضافة بحث</button>
      </div>
      {loading && <div>جارٍ التحميل...</div>}
      {error && <div style={{color:'red'}}>خطأ: {error}</div>}
      <div className="ag-theme-alpine grid-container">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{editable:true,filter:true,resizable:true}}
          enableRangeSelection={true}
          onCellValueChanged={async (params) => {
            const id = params.data?._id
            if (!id) return
            try {
              await updateResearch(id, params.newValue)
            } catch (err) {
              setError(err.message || String(err))
            }
          }}
        />
      </div>
    </div>
  )
}
