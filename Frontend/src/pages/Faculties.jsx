import React, { useMemo, useState, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'

export default function Faculties(){
  const [rowData, setRowData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch('http://localhost:4000/api/faculties')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const rows = Array.isArray(data)
          ? data.map((faculty) => ({
              facultyName: faculty.faculty_name || '',
              enrolledInCourse: faculty.enrolled_students ?? 0,
              registeredStudents: faculty.registered_students ?? 0,
              unregisteredStudents: faculty.unregistered_students ?? 0,
              registeredNotEnrolled: faculty.unregistered_unenrolled_students ?? 0,
              numberOfTeams: faculty.number_of_teams ?? 0
            }))
          : []

        setRowData(rows)
        setLoading(false)
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || String(err))
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const columnDefs = useMemo(
    () => [
      { field: 'facultyName', headerName: 'اسم الكلية', minWidth: 220, flex: 1 },
      { field: 'enrolledInCourse', headerName: 'عدد الطلبة المقيدين بالدورة', width: 210 },
      { field: 'registeredStudents', headerName: 'عدد الطلاب المسجلين', width: 180 },
      { field: 'unregisteredStudents', headerName: 'عدد الطلاب غير المسجلين', width: 190 },
      { field: 'registeredNotEnrolled', headerName: 'عدد الطلاب المسجلين غير المقيدين', width: 250 },
      { field: 'numberOfTeams', headerName: 'عدد الفرق', width: 120 }
    ],
    []
  )

  return (
    <div>
      {loading && <div>جارٍ تحميل بيانات الكليات...</div>}
      {error && <div style={{ color: 'red' }}>خطأ: {error}</div>}

      <div className="ag-theme-alpine grid-container">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          enableRangeSelection={true}
          animateRows={true}
        />
      </div>
    </div>
  )
}
