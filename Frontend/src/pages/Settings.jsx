import React, { useEffect, useMemo, useState, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'

export default function Settings(){
  const API_BASE = 'http://localhost:4000/api'

  const initial = [
    {key:'هل سيقوم الطالب بالتسجيل؟',value:false,type:'bool'},
    {key:'هل توزيع الفرق تلقائي؟',value:true,type:'bool'},
    {key:'عدد الأفراد في التيم',value:4,type:'number'},
    {key:'الحد الأدنى لعدد الطلبة في التيم',value:2,type:'number'}
  ]

  const [rows,setRows] = useState(initial)
  const [faculties,setFaculties] = useState([])
  const [research,setResearch] = useState([])
  const gridRef = useRef()

  useEffect(()=>{
    let mounted = true

    fetch(`${API_BASE}/research-topics`)
      .then(res=>{
        if(!res.ok){
          throw new Error('Failed to load research topics')
        }
        return res.json()
      })
      .then(data=>{
        if(mounted){
          setResearch(data.map(topic=>topic.topic_name))
        }
      })
      .catch(error=>{
        console.error(error)
      })


    fetch(`${API_BASE}/faculties`)
      .then(res=>{
        if(!res.ok){
          throw new Error('Failed to load faculties')
        }
        return res.json()
      })
      .then(data=>{
        if(mounted){
          setFaculties(data.map(faculty=>faculty.faculty_name))
        }
      })
      .catch(error=>{
        console.error(error)
      })

    return ()=>{
      mounted = false
    }
  },[])

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

  const addFaculty = async ()=>{
    const name=prompt('أدخل اسم الكلية الجديدة:')?.trim();
    if(!name) return;

    try{
      const response = await fetch(`${API_BASE}/faculties`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({faculty_name:name})
      });

      const data = await response.json();

      if(!response.ok){
        throw new Error(data.message || 'فشل إضافة الكلية');
      }

      setFaculties(prev=>[...prev,data.faculty_name]);
      alert('تمت إضافة الكلية بنجاح');
    }catch(error){
      alert(error.message || 'فشل إضافة الكلية');
      console.error(error);
    }
  };

  const addResearch = async ()=>{
    const name = prompt('أدخل عنوان البحث:')?.trim();
    if(!name) return;

    try{
      const response = await fetch(`${API_BASE}/research-topics`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({topic_name:name})
      });

      const data = await response.json();

      if(!response.ok){
        throw new Error(data.message || 'فشل إضافة البحث');
      }

      setResearch(prev=>[...prev,data.topic_name]);
      alert('تمت إضافة البحث بنجاح');
    }catch(error){
      alert(error.message || 'فشل إضافة البحث');
      console.error(error);
    }
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
          enableRtl={true}
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
