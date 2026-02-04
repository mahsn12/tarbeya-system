import React, { useMemo, useState, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'

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

export default function Students(){
  const [rowData,setRowData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetch('http://localhost:4000/api/registered-students')
      .then(r=>r.json())
      .then(data=>{
        if(!mounted) return
        // map backend fields to frontend columns
        const rows = data.map(d=>({
          name: d.student_name,
          nid: d.national_id,
          serial: d.sequence_number,
          mobile: d.phone_number || '',
          faculty: d.faculty_name || '',
          year: d.educational_level || '',
          research: d.research_name || '',
          teamCode: d.team_code || '',
          secret: false,
          regDate: d.registration_date ? new Date(d.registration_date).toLocaleDateString('ar-EG') : ''
        }))
        setRowData(rows)
        setLoading(false)
      })
      .catch(err=>{ if(mounted){ setError(err.message||String(err)); setLoading(false) } })
    return ()=> mounted = false
  },[])

  const columnDefs = useMemo(()=>[
    {field:'name', headerName:'الاسم', flex:1},
    {field:'nid', headerName:'الرقم القومي', width:150},
    {field:'serial', headerName:'الرقم المسلسل', width:120},
    {field:'mobile', headerName:'رقم الموبايل', width:130},
    {field:'faculty', headerName:'الكلية', width:160},
    {field:'year', headerName:'الفرقة', width:120},
    {field:'research', headerName:'البحث', width:160},
    {field:'teamCode', headerName:'كود الفريق', width:100},
    {field:'secret', headerName:'السرية', width:100, cellRenderer:CheckboxRenderer, editable:true},
    {field:'regDate', headerName:'موعد التسجيل', width:140}
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
        <button className="btn" onClick={()=>{/* create via API instead */}}>إضافة صف</button>
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
          onCellValueChanged={(params)=>{/* kept editable */}}
        />
      </div>
    </div>
  )
}
