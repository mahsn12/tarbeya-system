import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'

const API_BASE = 'http://localhost:4000/api/registered-students'

export default function Students(){
  const [rowData,setRowData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetch(API_BASE)
      .then(r=>r.json())
      .then(data=>{
        if(!mounted) return
        const rows = data.map(d=>({
          _id: d._id,
          name: d.student_name,
          nid: d.national_id,
          serial: d.sequence_number,
          mobile: d.phone_number || '',
          faculty: d.faculty_name || '',
          year: d.educational_level || '',
          research: d.research_name || '',
          teamCode: d.team_code || '',
          regDate: d.registration_date ? new Date(d.registration_date).toLocaleDateString('ar-EG') : ''
        }))
        setRowData(rows)
        setLoading(false)
      })
      .catch(err=>{ if(mounted){ setError(err.message||String(err)); setLoading(false) } })
    return ()=> { mounted = false }
  },[])

  const updateStudent = useCallback(async (id, row) => {
    const payload = {
      student_name: row.name,
      national_id: Number(row.nid),
      sequence_number: Number(row.serial),
      phone_number: row.mobile,
      faculty_name: row.faculty,
      educational_level: row.year,
      research_name: row.research,
      team_code: row.teamCode
    }

    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('تعذر تحديث السجل')
    }
  },[])

  const addNewStudent = useCallback(async () => {
    setError(null)
    const stamp = Date.now()
    const payload = {
      student_name: `طالب جديد ${stamp}`,
      national_id: stamp,
      sequence_number: stamp % 1000000,
      phone_number: '01000000000',
      faculty_name: 'غير محدد',
      educational_level: 'غير محدد',
      research_name: 'غير محدد',
      team_code: `TEAM-${stamp}`
    }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error('تعذر إضافة طالب جديد')
      }
      const created = await response.json()
      setRowData(prev => [...prev, {
        _id: created._id,
        name: created.student_name,
        nid: created.national_id,
        serial: created.sequence_number,
        mobile: created.phone_number,
        faculty: created.faculty_name,
        year: created.educational_level,
        research: created.research_name,
        teamCode: created.team_code,
        regDate: created.registration_date ? new Date(created.registration_date).toLocaleDateString('ar-EG') : ''
      }])
    } catch (err) {
      setError(err.message || String(err))
    }
  },[])

  const columnDefs = useMemo(()=>[
    {field:'name', headerName:'الاسم', flex:1},
    {field:'nid', headerName:'الرقم القومي', width:150},
    {field:'serial', headerName:'الرقم المسلسل', width:120},
    {field:'mobile', headerName:'رقم الموبايل', width:130},
    {field:'faculty', headerName:'الكلية', width:160},
    {field:'year', headerName:'الفرقة', width:120},
    {field:'research', headerName:'البحث', width:160},
    {field:'teamCode', headerName:'كود الفريق', width:120},
    {field:'regDate', headerName:'موعد التسجيل', width:140, editable:false}
  ],[])

  const defaultColDef = useMemo(()=>({
    editable:true,
    sortable:true,
    filter:true,
    resizable:true,
    minWidth:80
  }),[])

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
          enableRangeSelection={true}
          rowSelection={'multiple'}
          animateRows={true}
          suppressRowClickSelection={false}
          onCellValueChanged={async (params)=>{
            const id = params.data?._id
            if (!id) return
            try {
              await updateStudent(id, params.data)
            } catch (err) {
              setError(err.message || String(err))
            }
          }}
        />
      </div>
    </div>
  )
}
