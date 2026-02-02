import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function Students() {
  const [rowData, setRowData] = useState([]);

  const addRow = () => {
    const newRow = {
      الاسم: '',
      الرقم_القومي: '',
      الرقم_المسلسل: '',
      رقم_الموبايل: '',
      الكلية: '',
      الفرقة: '',
      البحث: '',
      كود_الفريق: '',
      السرية: '',
      موعد_التسجيل: '',
    };
    setRowData([...rowData, newRow]);
  };

  const [columnDefs] = useState([
    { field: 'الاسم', headerName: 'الاسم', editable: true, filter: true, sortable: true },
    { field: 'الرقم_القومي', headerName: 'الرقم القومي', editable: true, filter: true, sortable: true },
    { field: 'الرقم_المسلسل', headerName: 'الرقم المسلسل', editable: true, filter: true, sortable: true },
    { field: 'رقم_الموبايل', headerName: 'رقم الموبايل', editable: true, filter: true, sortable: true },
    { field: 'الكلية', headerName: 'الكلية', editable: true, filter: true, sortable: true },
    { field: 'الفرقة', headerName: 'الفرقة', editable: true, filter: true, sortable: true },
    { field: 'البحث', headerName: 'البحث', editable: true, filter: true, sortable: true },
    { field: 'كود_الفريق', headerName: 'كود الفريق', editable: true, filter: true, sortable: true },
    { field: 'السرية', headerName: 'السرية', editable: true, filter: true, sortable: true },
    { field: 'موعد_التسجيل', headerName: 'موعد التسجيل', editable: true, filter: true, sortable: true },
  ]);

  const defaultColDef = {
    flex: 1,
    minWidth: 120,
    resizable: true,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ marginBottom: '15px' }}>
        <button onClick={addRow} style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cairo' }}>
          إضافة طالب جديد
        </button>
      </div>
      <div className="grid-container ag-theme-alpine">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          suppressRowClickSelection={true}
          enableCellTextSelection={true}
          rowHeight={40}
          headerHeight={50}
          enableRtl={true}
        />
      </div>
    </div>
  );
}
