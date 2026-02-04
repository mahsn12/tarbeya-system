import React, { useMemo, useState, useRef } from 'react'
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

export default function Settings(){
  const initial = [
    {key:'هل سيقوم الطالب بالتسجيل؟',value:false,type:'bool'},
    {key:'هل توزيع الفرق تلقائي؟',value:true,type:'bool'},
    {key:'عدد الأفراد في التيم',value:4,type:'number'},
    {key:'الحد الأدنى لعدد الطلبة في التيم',value:2,type:'number'}
  ]
  const [rows,setRows] = useState(initial)
  const [faculties,setFaculties] = useState(['كلية الهندسة','كلية الطب','كلية الآداب'])
  const [research,setResearch] = useState(['بحث 1','بحث 2','بحث 3'])
  const gridRef = useRef()

  const columnDefs = useMemo(()=>[
    {field:'key',headerName:'الوصف',flex:1,editable:false},
    {field:'value',headerName:'القيمة',width:160,editable:true,cellRenderer:params=>{
      if(params.data.type==='bool'){
        return (<input type="checkbox" checked={!!params.value} onChange={(e)=>params.node.setDataValue('value',e.target.checked)} />)
      }
      return (<input style={{width:'100%'}} value={params.value} onChange={(e)=>params.node.setDataValue('value', e.target.value)} />)
    }}
  ],[])

  const addFaculty = ()=>{
    const name = prompt('أدخل اسم الكلية الجديدة:')
    if(name) setFaculties(s=>[...s,name])
  }
  const addResearch = ()=>{
    const name = prompt('أدخل عنوان البحث:')
    if(name) setResearch(s=>[...s,name])
  }
  const addPDF = async ()=>{
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e)=>{
      const file = e.target.files[0];
      if(!file) return;
      try{
        const form = new FormData();
        form.append('pdf', file);
        const res = await fetch('http://localhost:4000/api/ocr/upload', {
          method: 'POST',
          body: form
        });
        const data = await res.json();
        if(data.success){
          alert(`تم الرفع. عدد السجلات المضافة: ${data.inserted}`);
        } else {
          alert('فشل المعالجة: ' + (data.error || 'خطأ غير معروف'));
        }
      }catch(err){
        console.error(err);
        alert('خطأ أثناء الرفع: ' + err.message);
      }
    };
    input.click();
  }
  const distribute = ()=>{
    alert('تم تنفيذ التوزيع (محاكاة)')
  }

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="btn" onClick={addFaculty}>إضافة كلية جديدة</button>
        <button className="btn" onClick={addResearch}>إضافة بحث جديد</button>
        <button className="btn" onClick={addPDF}>إضافة ملف PDF</button>
        <button className="btn secondary" onClick={distribute}>توزيع</button>
      </div>

      <div className="settings-grid ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{resizable:true}}
          onCellValueChanged={(e)=>setRows(gridRef.current.api.getRenderedNodes().map(n=>n.data))}
        />
      </div>

      <div style={{marginTop:16}}>
        <strong>الكليات الحالية: </strong>{faculties.join(' ، ')}
      </div>
      <div style={{marginTop:8}}>
        <strong>الأبحاث الحالية: </strong>{research.join(' ، ')}
      </div>
    </div>
  )
}
