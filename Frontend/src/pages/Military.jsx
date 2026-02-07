import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'

const API_BASE = 'http://localhost:4000/api/enrolled-students'

const CheckboxRenderer = (props) => {
  const checked = !!props.value
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e)=>props.node.setDataValue(props.colDef.field, e.target.checked)}
    />
  )
}

export default function Military(){
  const [rowData,setRowData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetch(API_BASE)
      .then(r=>r.json())
      .then(data=>{ if(mounted){
        const rows = data.map(d=>({
          _id: d._id,
          serial: d.sequence_number,
          name: d.student_name,
          nid: d.national_id,
          faculty: d.faculty_name,
          registered: !!d.registered_research,
          submitted: !!d.finished_research
        }))
        setRowData(rows); setLoading(false)
      } })
      .catch(err=>{ if(mounted){ setError(err.message||String(err)); setLoading(false)} })
    return ()=> { mounted = false }
  },[])

  const saveRow = useCallback(async (id, row) => {
    const payload = {
      sequence_number: Number(row.serial),
      student_name: row.name,
      national_id: Number(row.nid),
      faculty_name: row.faculty,
      registered_research: !!row.registered,
      finished_research: !!row.submitted
    }

    const response = await fetch(`${API_BASE}/${id}`,{
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('تعذر تحديث بيانات الطالب')
    }
  },[])

  const addNewStudent = useCallback(async () => {
    setError(null)
    const stamp = Date.now()
    const payload = {
      sequence_number: stamp % 1000000,
      student_name: `طالب دورة ${stamp}`,
      national_id: stamp,
      faculty_name: 'غير محدد',
      registered_research: false,
      finished_research: false
    }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error('تعذر إضافة الطالب')
      }
      const created = await response.json()
      setRowData(prev => [...prev, {
        _id: created._id,
        serial: created.sequence_number,
        name: created.student_name,
        nid: created.national_id,
        faculty: created.faculty_name,
        registered: !!created.registered_research,
        submitted: !!created.finished_research
      }])
    } catch (err) {
      setError(err.message || String(err))
    }
  },[])

  const columnDefs = useMemo(()=>[
    {field:'serial',headerName:'رقم مسلسل',width:110},
    {field:'name',headerName:'الاسم',flex:1},
    {field:'nid',headerName:'الرقم القومي',width:150},
    {field:'faculty',headerName:'الكلية',width:160},
    {field:'registered',headerName:'حالة تسجيل البحث',width:160,cellRenderer:CheckboxRenderer,editable:true},
    {field:'submitted',headerName:'حالة تسليم البحث',width:160,cellRenderer:CheckboxRenderer,editable:true}
  ],[])

  const defaultColDef = useMemo(()=>({editable:true,filter:true,sortable:true,resizable:true}),[])

  return (
    <div>
      <div className="controls">
        <button className="btn" onClick={addNewStudent}>إضافة صف</button>
      </div>
      {loading && <div>جارٍ التحميل...</div>}
      {error && <div style={{color:'red'}}>خطأ: {error}</div>}
      <div className="ag-theme-alpine grid-container">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          enableRtl={true}
          enableRangeSelection={true}
          rowSelection={'multiple'}
          onCellValueChanged={async (params)=>{
            const id = params.data?._id
            if(!id) return
            try {
              await saveRow(id, params.data)
            } catch (err) {
              setError(err.message || String(err))
            }
          }}
        />
      </div>
    </div>
  )
}
