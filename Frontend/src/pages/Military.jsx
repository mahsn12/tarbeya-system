import React, { useMemo, useState, useEffect, useCallback } from 'react'
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

export default function Military(){
  const [rowData,setRowData] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetch('http://localhost:4000/api/enrolled-students')
      .then(r=>r.json())
      .then(data=>{ if(mounted){
        const rows = data.map(d=>({
          _id: d._id || d.id,
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
    return ()=> mounted = false
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

  const rowClassRules = {
    'missing-both': params => !params.data.registered_research && !params.data.finished_research
  }

  const updateStudent = useCallback(async (id, patch) => {
    try{
      await fetch(`http://localhost:4000/api/enrolled-students/${id}`,{
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(patch)
      })
    }catch(err){ console.error('Update error', err) }
  },[])

  return (
    <div>
      <div className="controls">
        <button className="btn" onClick={()=>setRowData(prev=>[...prev,{_id:'',serial:'',name:'',nid:'',faculty:'',registered:false,submitted:false}])}>إضافة صف</button>
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
          rowClassRules={rowClassRules}
          onCellValueChanged={(params)=>{
            const id = params.data._id || params.data.id || (params.data._doc && params.data._doc._id)
            if(!id) return
            // map checkbox fields
            if(params.colDef.field === 'registered'){
              updateStudent(id, { registered_research: params.newValue })
            }
            if(params.colDef.field === 'submitted'){
              updateStudent(id, { finished_research: params.newValue })
            }
          }}
        />
      </div>
    </div>
  )
}
