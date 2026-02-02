import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const CheckboxRenderer = (props) => {
  const [checked, setChecked] = useState(props.value === true || props.value === 'true');

  const handleChange = () => {
    const newValue = !checked;
    setChecked(newValue);
    props.setValue(newValue);
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      style={{ cursor: 'pointer', width: '20px', height: '20px' }}
    />
  );
};

const NumberRenderer = (props) => {
  const [value, setValue] = useState(props.value || '');

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    props.setValue(val ? parseInt(val) : null);
  };

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      style={{ width: '100%', padding: '5px', fontFamily: 'Cairo, sans-serif' }}
    />
  );
};

export default function Settings() {
  const [rowData, setRowData] = useState([
    { الإعداد: 'هل سيقوم الطالب بالتسجيل؟', القيمة: true },
    { الإعداد: 'هل توزيع الفرق تلقائي؟', القيمة: false },
    { الإعداد: 'عدد الأفراد في التيم', القيمة: 5 },
    { الإعداد: 'الحد الأدنى لعدد الطلبة في التيم', القيمة: 2 },
  ]);

  const [columnDefs] = useState([
    { field: 'الإعداد', headerName: 'الإعداد', editable: false, width: 400 },
    {
      field: 'القيمة',
      headerName: 'القيمة',
      editable: true,
      cellRenderer: (props) => {
        const setting = props.data.الإعداد;
        if (setting === 'هل سيقوم الطالب بالتسجيل؟' || setting === 'هل توزيع الفرق تلقائي؟') {
          return <CheckboxRenderer {...props} />;
        } else if (setting === 'عدد الأفراد في التيم' || setting === 'الحد الأدنى لعدد الطلبة في التيم') {
          return <NumberRenderer {...props} />;
        }
        return props.value;
      },
      flex: 1,
    },
  ]);

  const defaultColDef = {
    resizable: true,
  };

  const handleAddCollege = () => {
    alert('إضافة كلية جديدة');
  };

  const handleAddResearch = () => {
    alert('إضافة بحث جديد');
  };

  const handleAddPDF = () => {
    alert('إضافة ملف PDF');
  };

  const handleDistribute = () => {
    alert('توزيع الفرق');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ marginBottom: '20px' }}>
        <div className="grid-container ag-theme-alpine" style={{ height: '300px' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={40}
            headerHeight={50}
            enableRtl={true}
          />
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        direction: 'rtl'
      }}>
        <button onClick={handleAddCollege} style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cairo' }}>
          إضافة كلية جديدة
        </button>
        <button onClick={handleAddResearch} style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cairo' }}>
          إضافة بحث جديد
        </button>
        <button onClick={handleAddPDF} style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cairo' }}>
          إضافة ملف PDF
        </button>
        <button onClick={handleDistribute} style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cairo' }}>
          توزيع
        </button>
      </div>
    </div>
  );
}
