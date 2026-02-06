import React, { useMemo, useState, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'

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

  // ================= API TOGGLE =================

  const toggleRegistration = async (newValue) => {

    const res = await fetch('http://localhost:4000/api/config/registration-status',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({registration_status:newValue})
    });

    const data = await res.json();
    return data.registration_status;
  };

  // ================= GRID =================

  const columnDefs = useMemo(()=>[
    {field:'key',headerName:'الوصف',flex:1},
    {field:'value',headerName:'القيمة',width:160,cellRenderer:params=>{

      if(params.data.type==='bool'){
        return (
          <input
            type="checkbox"
            checked={!!params.value}
            onChange={async e=>{

              const newVal=e.target.checked;
              const oldVal=params.value;

              params.node.setDataValue('value',newVal);

              if(params.data.key==='هل سيقوم الطالب بالتسجيل؟'){
                try{
                  const saved=await toggleRegistration(newVal);
                  params.node.setDataValue('value',saved);
                }catch{
                  params.node.setDataValue('value',oldVal);
                }
              }
            }}
          />
        );
      }

      return (
        <input
          style={{width:'100%'}}
          value={params.value}
          onChange={e=>params.node.setDataValue('value',e.target.value)}
        />
      );
    }}
  ],[]);

  const addFaculty = ()=>{
    const name=prompt('أدخل اسم الكلية الجديدة:');
    if(name) setFaculties(s=>[...s,name]);
  };

  const addResearch = ()=>{
    const name=prompt('أدخل عنوان البحث:');
    if(name) setResearch(s=>[...s,name]);
  };

  // ================= PDF =================

const addPDF = ()=>{

  const input=document.createElement("input");
  input.type="file";
  input.accept="application/pdf";

  input.onchange=async e=>{

    const file=e.target.files[0];
    if(!file) return;

    // Save PDF temporarily
    sessionStorage.setItem("pending_pdf","1");

    const form=new FormData();
    form.append("pdf",file);

    try{

      const res=await fetch("http://localhost:4000/api/ocr/upload",{
        method:"POST",
        body:form
      });

      const data=await res.json();

      if(data.requiresAuth){

        alert("You will be redirected to Google.\nAfter login copy CODE then open /oauth");

        // FULL redirect (not popup)
        window.location.href = data.authUrl;
        return;
      }

      alert(`Inserted ${data.inserted}`);

    }catch(e){
      alert("Backend unreachable");
      console.error(e);
    }
  };

  input.click();
};

const resetTrainingCycle = async ()=>{
  const confirmed = window.confirm('هل أنت متأكد من إنهاء الدورة التدريبية؟');
  if(!confirmed) return;

  try{
    const res = await fetch('http://localhost:4000/api/admin/reset',{
      method:'POST'
    });

    if(!res.ok){
      throw new Error('Reset failed');
    }

    alert('تم إنهاء الدورة التدريبية بنجاح');
  }catch(e){
    alert('فشل إنهاء الدورة التدريبية');
    console.error(e);
  }
};


  return (
    <div>

      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="btn" onClick={addFaculty}>إضافة كلية جديدة</button>
        <button className="btn" onClick={addResearch}>إضافة بحث جديد</button>
        <button className="btn" onClick={addPDF}>إضافة ملف PDF</button>
        <button className="btn" onClick={resetTrainingCycle}>انهاء الدورة التدريبيه</button>
      </div>

      <div className="settings-grid ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{resizable:true}}
          onCellValueChanged={()=>setRows(gridRef.current.api.getRenderedNodes().map(n=>n.data))}
        />
      </div>

      <div style={{marginTop:16}}>
        <strong>الكليات الحالية:</strong> {faculties.join(' ، ')}
      </div>

      <div style={{marginTop:8}}>
        <strong>الأبحاث الحالية:</strong> {research.join(' ، ')}
      </div>

    </div>
  );
}
