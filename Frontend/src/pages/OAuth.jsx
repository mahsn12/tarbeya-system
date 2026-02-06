import React, { useState } from "react";

export default function OAuth(){

  const [code,setCode] = useState("");
  const [msg,setMsg] = useState("");

  const submit = async ()=>{

    if(!sessionStorage.getItem("pending_pdf")){
      alert("Upload PDF first from Settings.");
      return;
    }

    if(!code){
      alert("Paste code first");
      return;
    }

    try{

      const res = await fetch("http://localhost:4000/api/auth",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ code })
      });

      const data = await res.json();

      if(data.success){
        sessionStorage.removeItem("pending_pdf");
        setMsg("✅ تم التحديث , الرجاء العوده للاعدادات مره اخرى و رفع ملف PDF");
      }else{
        setMsg(JSON.stringify(data));
      }

    }catch(e){
      setMsg("Backend unreachable");
    }
  };

  return (
    <div style={{padding:40}}>

      <h2>Paste Google OAuth Code</h2>

      <textarea
        style={{width:"100%",height:100}}
        value={code}
        onChange={e=>setCode(e.target.value)}
      />

      <br/><br/>

      <button onClick={submit}>Submit</button>

      <p>{msg}</p>

    </div>
  );
}
