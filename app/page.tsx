'use client';
import React, { useState } from 'react';

interface SubjectMarks {
  sem1_tri: number;
  sem1_lek: number;
  sem1_swa: number;
  sem2_tri: number;
  sem2_lek: number;
  sem2_swa: number;
}

interface StudentRecord {
  id: string;
  roll_no: number;
  name: string;
  gr_no: string;
  birthdate: string;
  gender: string;
  caste: string;
  attendance_sem1: number;
  attendance_sem2: number;
  standard: string;
  school_name: string;
  taluka_dist: string;
  academic_year: string;
  marks: { [subjectId: string]: SubjectMarks };
  patrak_b_sem1: number;
  patrak_b_sem2: number;
}

export default function HomePage() {
  const standards = ['ધોરણ ૩', 'ધોરણ ૪', 'ધોરણ ૫', 'ધોરણ ૬', 'ધોરણ ૭', 'ધોરણ ૮'];

  const [schoolName, setSchoolName] = useState('પાલજ પ્રાથમિક શાળા');
  const [talukaDist, setTalukaDist] = useState('તા-જી-મહેસાણા');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [isEditingSchool, setIsEditingSchool] = useState(false);

  const [selectedStd, setSelectedStd] = useState<string>('ધોરણ ૩');
  const [selectedSem, setSelectedSem] = useState<'sem1' | 'sem2'>('sem1');
  const [selectedExamType, setSelectedExamType] = useState<string>('tri');
  const [selectedSubjectForSlip, setSelectedSubjectForSlip] = useState<string>('gujarati');

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Print Mode State ('patrak_c' | 'slips' | null)
  const [printMode, setPrintMode] = useState<'patrak_c' | 'slips' | null>(null);

  // 10 Questions Slip State
  const [questionMarks, setQuestionMarks] = useState<number[]>(Array(10).fill(0));

  const isUpperStd = ['ધોરણ ૬', 'ધોરણ ૭', 'ધોરણ ૮'].includes(selectedStd);

  // Varshik Patrak-F Modal State
  const [printPatrakF, setPrintPatrakF] = useState<StudentRecord | null>(null);

  // Saved Students List
  const [savedStudents, setSavedStudents] = useState<StudentRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('school_students_patrak_c');
      if (data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('Error loading local storage:', e);
        }
      }
    }
    return [];
  });

  const [studentInfo, setStudentInfo] = useState({
    roll_no: '',
    name: '',
    gr_no: '',
    birthdate: '',
    gender: 'કુમાર',
    caste: 'સામાન્ય',
    attendance_sem1: '0',
    attendance_sem2: '0',
  });

  const [marks, setMarks] = useState<{ [key: string]: SubjectMarks }>({});
  
  const currentMaxInput = isUpperStd ? 400 : 200;
  const [patrakBSem1, setPatrakBSem1] = useState<number>(currentMaxInput);
  const [patrakBSem2, setPatrakBSem2] = useState<number>(currentMaxInput);

  const handleStandardChange = (std: string) => {
    setSelectedStd(std);
    resetForm();
    const isUpper = ['ધોરણ ૬', 'ધોરણ ૭', 'ધોરણ ૮'].includes(std);
    const defaultVal = isUpper ? 400 : 200;
    setPatrakBSem1(defaultVal);
    setPatrakBSem2(defaultVal);
  };

  const getCalculatedPatrakB = (rawMarks: number) => {
    const val = Number(rawMarks) || 0;
    return val / 2;
  };

  const handleRollNoChange = (rNo: string) => {
    setStudentInfo((prev) => ({ ...prev, roll_no: rNo }));

    if (!rNo) return;

    const existing = savedStudents.find(
      (st) => st.standard === selectedStd && st.roll_no === parseInt(rNo)
    );

    if (existing) {
      setEditingStudentId(existing.id);
      setStudentInfo({
        roll_no: existing.roll_no.toString(),
        name: existing.name,
        gr_no: existing.gr_no,
        birthdate: existing.birthdate,
        gender: existing.gender,
        caste: existing.caste,
        attendance_sem1: (existing.attendance_sem1 || 0).toString(),
        attendance_sem2: (existing.attendance_sem2 || 0).toString(),
      });
      setMarks(existing.marks || {});
      setPatrakBSem1(existing.patrak_b_sem1 ?? (isUpperStd ? 400 : 200));
      setPatrakBSem2(existing.patrak_b_sem2 ?? (isUpperStd ? 400 : 200));
      setMessage(`ℹ️ રોલ નંબર ${rNo} નો જૂનો ડેટા મળી ગયો છે.`);
    } else {
      if (editingStudentId) {
        setEditingStudentId(null);
      }
    }
  };

  const getSubjectsForStd = (std: string, semester?: 'sem1' | 'sem2' | 'all') => {
    if (std === 'ધોરણ ૩') {
      return [
        { id: 'gujarati', name: 'ગુજરાતી' },
        { id: 'ganit', name: 'ગણિત' },
        { id: 'paryavaran', name: 'પર્યાવરણ' },
        { id: 'angreji', name: 'અંગ્રેજી' },
      ];
    }
    if (std === 'ધોરણ ૪') {
      const base = [
        { id: 'gujarati', name: 'ગુજરાતી' },
        { id: 'ganit', name: 'ગણિત' },
        { id: 'paryavaran', name: 'પર્યાવરણ' },
        { id: 'angreji', name: 'અંગ્રેજી' },
      ];
      if (semester === 'sem1') return base;
      base.push({ id: 'hindi', name: 'હિન્દી' });
      return base;
    }
    if (std === 'ધોરણ ૫') {
      return [
        { id: 'gujarati', name: 'ગુજરાતી' },
        { id: 'ganit', name: 'ગણિત' },
        { id: 'paryavaran', name: 'પર્યાવરણ' },
        { id: 'angreji', name: 'અંગ્રેજી' },
        { id: 'hindi', name: 'હિન્દી' },
      ];
    }
    return [
      { id: 'gujarati', name: 'ગુજરાતી' },
      { id: 'ganit', name: 'ગણિત' },
      { id: 'vigyan', name: 'વિજ્ઞાન' },
      { id: 'samajik_vigyan', name: 'સામાજિક વિજ્ઞાન' },
      { id: 'hindi', name: 'હિન્દી' },
      { id: 'angreji', name: 'અંગ્રેજી' },
      { id: 'sanskrut', name: 'સંસ્કૃત' },
    ];
  };

  const allPossibleSubjects = getSubjectsForStd(selectedStd, 'all');

  const calculateGrade = (obtained: number, total: number) => {
    if (!total || total === 0) return '-';
    const pr = (obtained / total) * 100;
    if (pr >= 80) return 'A';
    if (pr >= 65) return 'B';
    if (pr >= 50) return 'C';
    if (pr >= 35) return 'D';
    return 'E';
  };

  const calculateSubjectSemTotal = (tri: number, lek: number, swa: number) => {
    const triVal = Number(tri) || 0;
    const lekVal = Number(lek) || 0;
    const swaVal = Number(swa) || 0;
    const calcLek = isUpperStd ? lekVal / 2 : lekVal;
    return triVal + calcLek + swaVal;
  };

  const calculateSubjectGrandTotal = (subMarks?: SubjectMarks) => {
    if (!subMarks) return 0;
    const sem1 = calculateSubjectSemTotal(subMarks.sem1_tri, subMarks.sem1_lek, subMarks.sem1_swa);
    const sem2 = calculateSubjectSemTotal(subMarks.sem2_tri, subMarks.sem2_lek, subMarks.sem2_swa);
    return sem1 + sem2;
  };

  const calculateOverallGrandTotal = (st: StudentRecord) => {
    const isUpper = ['ધોરણ ૬', 'ધોરણ ૭', 'ધોરણ ૮'].includes(st.standard);
    const subsSem1 = getSubjectsForStd(st.standard, 'sem1');
    const subsSem2 = getSubjectsForStd(st.standard, 'sem2');

    let sem1Sum = 0;
    subsSem1.forEach((sub) => {
      const m = st.marks[sub.id];
      if (m) sem1Sum += calculateSubjectSemTotal(m.sem1_tri, m.sem1_lek, m.sem1_swa);
    });

    let sem2Sum = 0;
    subsSem2.forEach((sub) => {
      const m = st.marks[sub.id];
      if (m) sem2Sum += calculateSubjectSemTotal(m.sem2_tri, m.sem2_lek, m.sem2_swa);
    });

    const patrakBSem1Val = getCalculatedPatrakB(st.patrak_b_sem1);
    const patrakBSem2Val = getCalculatedPatrakB(st.patrak_b_sem2);

    const maxPatrakBSem1 = isUpper ? 200 : 100;
    const maxPatrakBSem2 = isUpper ? 200 : 100;

    const maxSem1 = subsSem1.length * 100 + maxPatrakBSem1;
    const maxSem2 = subsSem2.length * 100 + maxPatrakBSem2;

    const grandObtained = sem1Sum + sem2Sum + patrakBSem1Val + patrakBSem2Val;
    const grandMax = maxSem1 + maxSem2;
    const percentage = grandMax > 0 ? ((grandObtained / grandMax) * 100).toFixed(2) : '0';
    const grade = calculateGrade(grandObtained, grandMax);

    return { 
      sem1Sum, 
      sem2Sum, 
      patrakBSem1Val, 
      patrakBSem2Val, 
      maxPatrakBSem1,
      maxPatrakBSem2,
      grandObtained, 
      grandMax, 
      percentage, 
      grade 
    };
  };

  const resetForm = () => {
    setEditingStudentId(null);
    setStudentInfo({
      roll_no: '',
      name: '',
      gr_no: '',
      birthdate: '',
      gender: 'કુમાર',
      caste: 'સામાન્ય',
      attendance_sem1: '0',
      attendance_sem2: '0',
    });
    setMarks({});
    const defaultVal = isUpperStd ? 400 : 200;
    setPatrakBSem1(defaultVal);
    setPatrakBSem2(defaultVal);
    setQuestionMarks(Array(10).fill(0));
    setMessage('');
  };

  const handleEditStudent = (st: StudentRecord) => {
    const isUpper = ['ધોરણ ૬', 'ધોરણ ૭', 'ધોરણ ૮'].includes(st.standard);
    setEditingStudentId(st.id);
    setStudentInfo({
      roll_no: st.roll_no.toString(),
      name: st.name,
      gr_no: st.gr_no,
      birthdate: st.birthdate,
      gender: st.gender,
      caste: st.caste,
      attendance_sem1: (st.attendance_sem1 || 0).toString(),
      attendance_sem2: (st.attendance_sem2 || 0).toString(),
    });
    setMarks(st.marks || {});
    setPatrakBSem1(st.patrak_b_sem1 ?? (isUpper ? 400 : 200));
    setPatrakBSem2(st.patrak_b_sem2 ?? (isUpper ? 400 : 200));
    setMessage(`✏️ વિદ્યાર્થી ${st.name} નો ડેટા ફોર્મમાં આવી ગયો છે.`);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const deleteStudent = (id: string) => {
    if (confirm('શું તમે આ વિદ્યાર્થીનો ડેટા ડીલીટ કરવા માંગો છો?')) {
      const updated = savedStudents.filter((s) => s.id !== id);
      setSavedStudents(updated);
      localStorage.setItem('school_students_patrak_c', JSON.stringify(updated));
      setMessage('🗑️ વિદ્યાર્થીનો ડેટા ડીલીટ થઈ ગયો છે.');
    }
  };

  const handleMarkChange = (subId: string, field: keyof SubjectMarks, val: number) => {
    setMarks((prev) => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || { sem1_tri: 0, sem1_lek: 0, sem1_swa: 0, sem2_tri: 0, sem2_lek: 0, sem2_swa: 0 }),
        [field]: val,
      },
    }));
  };

  const handleQuestionMarkChange = (index: number, value: number) => {
    const updated = [...questionMarks];
    updated[index] = value;
    setQuestionMarks(updated);

    const totalSlipMarks = updated.reduce((a, b) => a + b, 0);

    if (selectedExamType === 'vyaktitva') {
      if (selectedSem === 'sem1') setPatrakBSem1(totalSlipMarks);
      else setPatrakBSem2(totalSlipMarks);
    } else {
      const fieldKey = `${selectedSem}_${selectedExamType}` as keyof SubjectMarks;
      handleMarkChange(selectedSubjectForSlip, fieldKey, totalSlipMarks);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rollNo = parseInt(studentInfo.roll_no);
    
    const existingIndex = savedStudents.findIndex(
      (st) => st.standard === selectedStd && (st.id === editingStudentId || st.roll_no === rollNo)
    );

    let updatedMarks = { ...marks };

    if (existingIndex !== -1) {
      const oldMarks = savedStudents[existingIndex].marks || {};
      Object.keys(marks).forEach((subId) => {
        updatedMarks[subId] = {
          ...oldMarks[subId],
          ...marks[subId],
        };
      });
    }

    const recordData: StudentRecord = {
      id: existingIndex !== -1 ? savedStudents[existingIndex].id : Date.now().toString(),
      roll_no: rollNo,
      name: studentInfo.name,
      gr_no: studentInfo.gr_no,
      birthdate: studentInfo.birthdate,
      gender: studentInfo.gender,
      caste: studentInfo.caste,
      attendance_sem1: Number(studentInfo.attendance_sem1),
      attendance_sem2: Number(studentInfo.attendance_sem2),
      standard: selectedStd,
      school_name: schoolName,
      taluka_dist: talukaDist,
      academic_year: academicYear,
      marks: updatedMarks,
      patrak_b_sem1: Number(patrakBSem1),
      patrak_b_sem2: Number(patrakBSem2),
    };

    let updatedList: StudentRecord[];
    if (existingIndex !== -1) {
      updatedList = [...savedStudents];
      updatedList[existingIndex] = recordData;
      setMessage('🎉 વિદ્યાર્થીનો ડેટા સફળતાપૂર્વક અપડેટ થઈ ગયો!');
    } else {
      updatedList = [...savedStudents, recordData];
      setMessage('🎉 નવો વિદ્યાર્થી સફળતાપૂર્વક ઉમેરાઈ ગયો!');
    }

    setSavedStudents(updatedList);
    localStorage.setItem('school_students_patrak_c', JSON.stringify(updatedList));
    resetForm();
  };

  // Filter and Sort in ASCENDING Order (Roll No 1, 2, 3...)
  const filteredStudents = savedStudents
    .filter((st) => st.standard === selectedStd)
    .sort((a, b) => a.roll_no - b.roll_no);

  const exportToCSV = () => {
    if (filteredStudents.length === 0) return alert('કોઈ ડેટા ઉપલબ્ધ નથી!');
    let csv = `ક્રમ,વિદ્યાર્થીનું નામ,G.R. નં,ધોરણ,પ્રથમ સત્ર ગુણ,દ્વિતીય સત્ર ગુણ,કુલ ગુણ,ટકા (%),આખરી ગ્રેડ\n`;
    filteredStudents.forEach((st) => {
      const overall = calculateOverallGrandTotal(st);
      csv += `"${st.roll_no}","${st.name}","${st.gr_no}","${st.standard}","${overall.sem1Sum + overall.patrakBSem1Val}","${overall.sem2Sum + overall.patrakBSem2Val}","${overall.grandObtained} / ${overall.grandMax}","${overall.percentage}%","${overall.grade}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Patrak_C_${selectedStd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const slipTotalSum = questionMarks.reduce((a, b) => a + b, 0);

  const getExamTitleText = () => {
    const semText = selectedSem === 'sem1' ? 'પ્રથમ સત્ર' : 'દ્વિતીય સત્ર';
    let examText = 'ત્રિમાસિક';
    if (selectedExamType === 'lek') examText = 'લેખિત';
    if (selectedExamType === 'swa') examText = 'સ્વાધ્યાય';
    if (selectedExamType === 'vyaktitva') examText = 'વ્યક્તિત્વ વિકાસ';
    return `${semText} - ${examText}`;
  };

  // Dedicated Print Handlers
  const handlePrintSlips = () => {
    setPrintMode('slips');
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 100);
  };

  const handlePrintPatrakC = () => {
    setPrintMode('patrak_c');
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 100);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-100 min-h-screen text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 rounded-3xl shadow-xl mb-6 relative print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide">{schoolName} ડેશબોર્ડ</h1>
            <p className="text-indigo-200 text-sm mt-1">📍 {talukaDist} | 🗓️ વર્ષ: {academicYear}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingSchool(!isEditingSchool)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/30 backdrop-blur"
            >
              ✏️ શાળા વિગત
            </button>
          </div>
        </div>

        {isEditingSchool && (
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-900">
            <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="શાળાનું નામ" className="p-2 rounded-lg border text-xs" />
            <input type="text" value={talukaDist} onChange={(e) => setTalukaDist(e.target.value)} placeholder="તાલુકો અને જિલ્લો" className="p-2 rounded-lg border text-xs" />
            <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="શૈક્ષણિક વર્ષ" className="p-2 rounded-lg border text-xs" />
          </div>
        )}
      </header>

      {/* Dropdown Selection Bar */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">1️⃣ ધોરણ પસંદ કરો:</label>
          <select
            value={selectedStd}
            onChange={(e) => handleStandardChange(e.target.value)}
            className="w-full p-3 bg-indigo-50 border border-indigo-200 rounded-2xl font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {standards.map((std) => (
              <option key={std} value={std}>{std}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">2️⃣ સત્ર પસંદ કરો:</label>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value as 'sem1' | 'sem2')}
            className="w-full p-3 bg-purple-50 border border-purple-200 rounded-2xl font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="sem1">પ્રથમ સત્ર (Sem-1)</option>
            <option value="sem2">દ્વિતીય સત્ર (Sem-2)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">3️⃣ પરીક્ષા / મૂલ્યાંકનનો પ્રકાર:</label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full p-3 bg-amber-50 border border-amber-200 rounded-2xl font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {selectedSem === 'sem1' ? (
              <>
                <option value="tri">પ્રથમ-ત્રિમાસિક (ત્રિ-40)</option>
                <option value="lek">પ્રથમ-લેખિત (લે-{isUpperStd ? 80 : 40})</option>
                <option value="swa">પ્રથમ-સ્વાધ્યાય (સ્વ-20)</option>
                <option value="vyaktitva">પ્રથમ-વ્યક્તિત્વ વિકાસ (પત્રક-B)</option>
              </>
            ) : (
              <>
                <option value="tri">દ્વિતીય-ત્રિમાસિક (ત્રિ-40)</option>
                <option value="lek">દ્વિતીય-લેખિત (લે-{isUpperStd ? 80 : 40})</option>
                <option value="swa">દ્વિતીય-સ્વાધ્યાય (સ્વ-20)</option>
                <option value="vyaktitva">દ્વિતીય-વ્યક્તિત્વ વિકાસ (પત્રક-B)</option>
              </>
            )}
          </select>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 print:hidden">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-lg font-bold text-indigo-900">
              📝 {editingStudentId ? 'વિદ્યાર્થી ગુણ અપડેટ કરો' : `નવી એન્ટ્રી (${selectedStd} - ${selectedSem === 'sem1' ? 'પ્રથમ સત્ર' : 'દ્વિતીય સત્ર'})`}
            </h2>
            {editingStudentId && (
              <button onClick={resetForm} className="text-xs text-red-500 font-bold bg-red-50 px-2.5 py-1 rounded-xl border border-red-200">
                કેન્સલ
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">રોલ નંબર (ઓટો-ફિલ)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="દા.ત. 1" 
                  value={studentInfo.roll_no} 
                  onChange={(e) => handleRollNoChange(e.target.value)} 
                  className="w-full p-2.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">G.R. નંબર</label>
                <input type="text" required placeholder="G.R. No" value={studentInfo.gr_no} onChange={(e) => setStudentInfo({ ...studentInfo, gr_no: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">વિદ્યાર્થીનું નામ</label>
              <input type="text" required placeholder="નામ, પિતાનું નામ, અટક" value={studentInfo.name} onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">જન્મ તારીખ</label>
                <input type="date" required value={studentInfo.birthdate} onChange={(e) => setStudentInfo({ ...studentInfo, birthdate: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">જાતિ</label>
                <select value={studentInfo.gender} onChange={(e) => setStudentInfo({ ...studentInfo, gender: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold">
                  <option value="કુમાર">કુમાર</option>
                  <option value="કન્યા">કન્યા</option>
                </select>
              </div>
            </div>

            {selectedExamType === 'vyaktitva' ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <h3 className="font-bold text-xs text-amber-900 mb-2">
                  વ્યક્તિત્વ વિકાસ ({selectedSem === 'sem1' ? 'પ્રથમ સત્ર' : 'દ્વિતીય સત્ર'}):
                </h3>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    min="0" 
                    max={currentMaxInput} 
                    value={selectedSem === 'sem1' ? patrakBSem1 : patrakBSem2} 
                    onChange={(e) => selectedSem === 'sem1' ? setPatrakBSem1(Number(e.target.value)) : setPatrakBSem2(Number(e.target.value))} 
                    className="w-full p-3 border rounded-xl font-bold text-amber-900 bg-white text-base text-center" 
                  />
                  <span className="text-xs font-bold text-amber-800 whitespace-nowrap">
                    ગણતરી (1/2): {getCalculatedPatrakB(selectedSem === 'sem1' ? patrakBSem1 : patrakBSem2)} / {isUpperStd ? 200 : 100}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider pt-2 border-t mb-3">
                  વિષયવાર એન્ટ્રી ({selectedSem === 'sem1' ? 'પ્રથમ સત્ર' : 'દ્વિતીય સત્ર'} - {selectedExamType.toUpperCase()}):
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {allPossibleSubjects.map((sub) => {
                    const isHindiSem1 = selectedStd === 'ધોરણ ૪' && sub.id === 'hindi' && selectedSem === 'sem1';
                    const subMarks = marks[sub.id] || { sem1_tri: 0, sem1_lek: 0, sem1_swa: 0, sem2_tri: 0, sem2_lek: 0, sem2_swa: 0 };
                    const fieldKey = `${selectedSem}_${selectedExamType}` as keyof SubjectMarks;

                    return (
                      <div key={sub.id} className="p-3 bg-slate-50 rounded-2xl border flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-800">{sub.name}</span>
                        {isHindiSem1 ? (
                          <span className="text-xs text-slate-400">લાગુ નથી</span>
                        ) : (
                          <input 
                            type="number" 
                            min="0"
                            value={subMarks[fieldKey]} 
                            onChange={(e) => handleMarkChange(sub.id, fieldKey, Number(e.target.value))}
                            className="w-20 p-2 border rounded-xl text-center font-bold bg-white text-indigo-900 focus:ring-2 focus:ring-indigo-500" 
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition">
              💾 {editingStudentId ? 'અપડેટ કરો / સેવ કરો' : 'ડેટા સેવ કરો'}
            </button>
          </form>
        </div>

        {/* 10 Questions Quick Entry Slip Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 border-b border-indigo-200 pb-3 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-indigo-900">📑 10 પ્રશ્નોની સ્લિપ</h3>
              </div>
              <p className="text-[10px] text-indigo-600">સ્લિપમાં ગુણ લખતા જ direct વિષયમાં ગુણ ઉમેરાઈ જશે.</p>
              
              <button 
                onClick={handlePrintSlips} 
                className="w-full mt-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                🖨️ વર્ગના તમામ બાળકોની સ્લિપ પ્રિન્ટ કરો
              </button>
            </div>

            {selectedExamType !== 'vyaktitva' && (
              <div className="mb-4">
                <label className="text-xs font-bold text-indigo-950 block mb-1">સ્લિપ કયા વિષય માટે વાપરવી છે?</label>
                <select
                  value={selectedSubjectForSlip}
                  onChange={(e) => setSelectedSubjectForSlip(e.target.value)}
                  className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-900 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {allPossibleSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4">
              {questionMarks.map((qMark, idx) => (
                <div key={idx} className="bg-white p-2 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-bold text-indigo-900">પ્રશ્ન {idx + 1}:</span>
                  <input
                    type="number"
                    min="0"
                    value={qMark}
                    onChange={(e) => handleQuestionMarkChange(idx, Number(e.target.value))}
                    className="w-14 p-1 border rounded-lg text-center font-bold text-indigo-900 bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-inner">
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-bold block">10 પ્રશ્નોનો કુલ સરવાળો</span>
              <span className="text-xl font-extrabold">{slipTotalSum} Marks</span>
            </div>
            <button 
              onClick={() => setQuestionMarks(Array(10).fill(0))}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold text-white backdrop-blur"
            >
              🔄 રિસેટ
            </button>
          </div>
        </div>
      </div>

      {message && <p className="mb-4 p-3 bg-indigo-100 text-indigo-900 rounded-2xl font-bold text-center print:hidden">{message}</p>}

      {/* Saved Records Collection */}
      <section className="mb-8 print:hidden">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-md font-bold text-slate-700 mb-3">
            Saved Marks Records - Collection: <span className="text-indigo-600 font-extrabold">{selectedStd}</span>
          </h3>

          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed">
              આ ધોરણમાં હજી સુધી કોઈ વિદ્યાર્થી સેવ કરેલ નથી.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredStudents.map((st) => {
                const overall = calculateOverallGrandTotal(st);
                return (
                  <div key={st.id} className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 flex justify-between items-center transition">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        {st.roll_no}. {st.name} <span className="text-[10px] text-slate-400">({st.gr_no})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        કુલ: <span className="font-bold text-indigo-700">{overall.grandObtained} / {overall.grandMax}</span> | ગ્રેડ: <span className="font-bold text-purple-700">{overall.grade}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setPrintPatrakF(st)} 
                        title="પત્રક-F જુઓ"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow-sm"
                      >
                        📄 પત્રક-F
                      </button>
                      <button 
                        onClick={() => handleEditStudent(st)} 
                        title="સુધારો કરો (Edit)"
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold shadow-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => deleteStudent(st.id)} 
                        title="ડીલીટ કરો (Delete)"
                        className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold shadow-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Complete Patrak-C Table */}
      <section className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-200 ${printMode === 'slips' ? 'hidden print:hidden' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-indigo-900">📊 પત્રક-C (વાર્ષિક સંકલિત પરિણામ પત્રક) - {selectedStd}</h2>
            <p className="text-xs text-slate-400 mt-0.5">સંપૂર્ણ પરિણામ પત્રક (Sem-1, Sem-2, પત્રક-B અને વાર્ષિક પરિણામ)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
              📥 Excel/CSV ડાઉનલોડ
            </button>
            <button onClick={handlePrintPatrakC} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow">
              🖨️ પત્રક-C પ્રિન્ટ કરો
            </button>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-center text-slate-400 py-6 text-sm">કોઈ ડેટા ઉપલબ્ધ નથી.</p>
        ) : (
          <div className="overflow-x-auto border rounded-2xl shadow-inner">
            <table className="w-full text-center border-collapse text-[11px]">
              <thead>
                <tr className="bg-indigo-900 text-white font-bold">
                  <th rowSpan={3} className="border p-2">ક્રમ</th>
                  <th rowSpan={3} className="border p-2 min-w-[140px]">વિદ્યાર્થીનું નામ</th>
                  <th rowSpan={3} className="border p-2">G.R. નં</th>

                  {allPossibleSubjects.map((sub) => (
                    <th key={sub.id} colSpan={8} className="border p-2 text-center bg-indigo-800">{sub.name}</th>
                  ))}

                  <th colSpan={2} className="border p-2 bg-amber-700">પત્રક-B (વ્યક્તિત્વ વિકાસ)</th>
                  <th colSpan={4} className="border p-2 bg-emerald-800">વાર્ષિક આખરી પરિણામ</th>
                </tr>

                <tr className="bg-indigo-100 text-indigo-950 font-bold">
                  {allPossibleSubjects.map((sub) => (
                    <React.Fragment key={sub.id}>
                      <th colSpan={3} className="border p-1">પ્રથમ સત્ર</th>
                      <th colSpan={3} className="border p-1">દ્વિતીય સત્ર</th>
                      <th rowSpan={2} className="border p-1 bg-indigo-200">કુલ (200)</th>
                      <th rowSpan={2} className="border p-1 bg-indigo-200">ગ્રેડ</th>
                    </React.Fragment>
                  ))}
                  <th rowSpan={2} className="border p-1 bg-amber-100">ગુણ ({isUpperStd ? 400 : 200})</th>
                  <th rowSpan={2} className="border p-1 bg-amber-100">ગ્રેડ</th>
                  <th rowSpan={2} className="border p-1 bg-emerald-100">કુલ ગુણ</th>
                  <th rowSpan={2} className="border p-1 bg-emerald-100">ટકા (%)</th>
                  <th rowSpan={2} className="border p-1 bg-emerald-100">ગ્રેડ</th>
                  <th rowSpan={2} className="border p-1 bg-emerald-100">પરિણામ</th>
                </tr>

                <tr className="bg-slate-100 text-slate-800 font-semibold">
                  {allPossibleSubjects.map((sub) => (
                    <React.Fragment key={sub.id}>
                      <th className="border p-1 text-[9px]">ત્રિ</th>
                      <th className="border p-1 text-[9px]">લે</th>
                      <th className="border p-1 text-[9px]">સ્વ</th>
                      <th className="border p-1 text-[9px]">ત્રિ</th>
                      <th className="border p-1 text-[9px]">લે</th>
                      <th className="border p-1 text-[9px]">સ્વ</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((st) => {
                  const overall = calculateOverallGrandTotal(st);
                  const patrakBTotalObtained = overall.patrakBSem1Val + overall.patrakBSem2Val;
                  const patrakBTotalMax = overall.maxPatrakBSem1 + overall.maxPatrakBSem2;

                  return (
                    <tr key={st.id} className="hover:bg-indigo-50/40 border-b">
                      <td className="border p-1.5 font-bold">{st.roll_no}</td>
                      <td className="border p-1.5 text-left font-semibold">{st.name}</td>
                      <td className="border p-1.5 text-slate-500">{st.gr_no}</td>

                      {allPossibleSubjects.map((sub) => {
                        const m = st.marks[sub.id] || { sem1_tri: 0, sem1_lek: 0, sem1_swa: 0, sem2_tri: 0, sem2_lek: 0, sem2_swa: 0 };
                        const isHindiSem1 = st.standard === 'ધોરણ ૪' && sub.id === 'hindi';
                        const subTotal = calculateSubjectGrandTotal(m);

                        return (
                          <React.Fragment key={sub.id}>
                            <td className="border p-1">{isHindiSem1 ? '-' : m.sem1_tri}</td>
                            <td className="border p-1">{isHindiSem1 ? '-' : m.sem1_lek}</td>
                            <td className="border p-1 font-semibold">{isHindiSem1 ? '-' : m.sem1_swa}</td>
                            <td className="border p-1 bg-purple-50/20">{m.sem2_tri}</td>
                            <td className="border p-1 bg-purple-50/20">{m.sem2_lek}</td>
                            <td className="border p-1 bg-purple-50/20 font-semibold">{m.sem2_swa}</td>
                            <td className="border p-1 font-extrabold text-indigo-900 bg-indigo-50">{subTotal}</td>
                            <td className="border p-1 font-bold text-indigo-700 bg-indigo-50">{calculateGrade(subTotal, isHindiSem1 ? 100 : 200)}</td>
                          </React.Fragment>
                        );
                      })}

                      <td className="border p-1 font-bold text-amber-900 bg-amber-50">{patrakBTotalObtained}</td>
                      <td className="border p-1 font-bold text-amber-800 bg-amber-50">{calculateGrade(patrakBTotalObtained, patrakBTotalMax)}</td>

                      <td className="border p-1 font-extrabold text-emerald-900 bg-emerald-50">{overall.grandObtained} / {overall.grandMax}</td>
                      <td className="border p-1 font-bold text-emerald-800 bg-emerald-50">{overall.percentage}%</td>
                      <td className="border p-1 font-extrabold text-indigo-800 bg-emerald-50">{overall.grade}</td>
                      <td className="border p-1 font-bold text-emerald-700 bg-emerald-50">પાસ</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SEPARATE PRINT LAYOUT FOR SLIPS */}
      {printMode === 'slips' && (
        <div className="hidden print:block p-2 text-slate-900">
          <div className="border-2 border-slate-900 p-3 rounded-lg mb-4 text-center bg-slate-50">
            <h1 className="text-xl font-extrabold uppercase tracking-wide">{schoolName}</h1>
            <p className="text-xs font-bold text-slate-600 mt-0.5">{talukaDist} | શૈક્ષણિક વર્ષ: {academicYear}</p>
            
            {/* UPDATED TITLE WITHOUT "મૂલ્યાંકન માર્ક્સ ગુણ પત્રક સ્લિપ - " */}
            <div className="mt-2 text-sm font-extrabold bg-indigo-900 text-white py-1 px-4 rounded-md inline-block">
              {selectedStd} ({getExamTitleText()})
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-bold mt-3 border-t pt-2 text-slate-800">
              <div>વિષય: <span className="font-extrabold underline">{selectedExamType === 'vyaktitva' ? 'વ્યક્તિત્વ વિકાસ' : allPossibleSubjects.find(s=>s.id===selectedSubjectForSlip)?.name}</span></div>
              <div>રજિસ્ટર સંખ્યા: <span className="font-extrabold underline">{filteredStudents.length}</span></div>
              <div>હાજર સંખ્યા: <span className="font-extrabold underline">_____</span></div>
            </div>
          </div>

          <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs">
            <thead>
              <tr className="bg-slate-200 font-extrabold text-slate-900 border-b-2 border-slate-900">
                <th className="border border-slate-800 p-2 w-12">રોલ નં</th>
                <th className="border border-slate-800 p-2 text-left min-w-[180px]">વિદ્યાર્થીનું નામ</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-1</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-2</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-3</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-4</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-5</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-6</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-7</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-8</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-9</th>
                <th className="border border-slate-800 p-2 w-8">પ્ર-10</th>
                <th className="border border-slate-800 p-2 w-16 bg-slate-300 font-extrabold">કુલ ગુણ</th>
              </tr>
            </thead>
            <tbody>
              {(filteredStudents.length > 0 ? filteredStudents : Array.from({ length: 15 }, (_, i) => ({ roll_no: i + 1, name: '', id: i.toString(), gr_no: '', birthdate: '', gender: '', caste: '', attendance_sem1: 0, attendance_sem2: 0, standard: selectedStd, school_name: schoolName, taluka_dist: talukaDist, academic_year: academicYear, marks: {}, patrak_b_sem1: 0, patrak_b_sem2: 0 }))).map((st, idx) => {
                const fieldKey = `${selectedSem}_${selectedExamType}` as keyof SubjectMarks;
                const subMarks = st.marks ? st.marks[selectedSubjectForSlip] : null;
                const totalVal = selectedExamType === 'vyaktitva' 
                  ? (selectedSem === 'sem1' ? st.patrak_b_sem1 : st.patrak_b_sem2) 
                  : (subMarks ? subMarks[fieldKey] : '');

                return (
                  <tr key={idx} className="border-b border-slate-800 h-9">
                    <td className="border border-slate-800 font-bold bg-slate-50">{st.roll_no}</td>
                    <td className="border border-slate-800 text-left px-2 font-bold">{st.name}</td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800"></td>
                    <td className="border border-slate-800 font-extrabold bg-slate-100">{totalVal || ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-center text-xs font-bold pt-6 mt-6 border-t border-slate-800">
            <div>વર્ગ શિક્ષકની સહી: __________________</div>
            <div>આચાર્યશ્રીની સહી: __________________</div>
          </div>
        </div>
      )}

      {/* Varshik Patrak-F Modal Popup */}
      {printPatrakF && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2 print:hidden">
              <h3 className="text-md font-bold text-indigo-900">📄 વાર્ષિક પ્રગતિ પત્રક (પત્રક-એફ)</h3>
              <button onClick={() => setPrintPatrakF(null)} className="text-red-500 font-bold">✖</button>
            </div>
            <div className="border-2 border-indigo-900 p-5 rounded-2xl text-slate-800">
              <div className="text-center border-b pb-3 mb-3">
                <h2 className="text-lg font-bold uppercase text-indigo-900">{printPatrakF.school_name}</h2>
                <p className="text-xs text-slate-500">{printPatrakF.taluka_dist}</p>
                <div className="mt-2 text-xs font-bold bg-indigo-50 text-indigo-800 py-1 rounded-lg">
                  વાર્ષિક પ્રગતિ પત્રક (પત્રક-એફ) - {printPatrakF.academic_year}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs font-semibold mb-3 bg-slate-50 p-2 rounded-xl">
                <p>નામ: {printPatrakF.name}</p>
                <p>રોલ નં: {printPatrakF.roll_no}</p>
                <p>ધોરણ: {printPatrakF.standard}</p>
                <p>G.R. નં: {printPatrakF.gr_no}</p>
              </div>
              <table className="w-full border-collapse border text-xs mb-3">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-1 text-left">વિષય</th>
                    <th className="border p-1 text-center">કુલ ગુણ</th>
                    <th className="border p-1 text-center">ગ્રેડ</th>
                  </tr>
                </thead>
                <tbody>
                  {getSubjectsForStd(printPatrakF.standard, 'all').map((sub) => {
                    const m = printPatrakF.marks[sub.id];
                    const obtained = calculateSubjectGrandTotal(m);
                    const isHindiSem1 = printPatrakF.standard === 'ધોરણ ૪' && sub.id === 'hindi';
                    const max = isHindiSem1 ? 100 : 200;
                    return (
                      <tr key={sub.id}>
                        <td className="border p-1 font-medium">{sub.name}</td>
                        <td className="border p-1 text-center">{obtained} / {max}</td>
                        <td className="border p-1 text-center font-bold">{calculateGrade(obtained, max)}</td>
                      </tr>
                    );
                  })}
                  {/* Patrak-B Row in Patrak-F */}
                  {(() => {
                    const isUpper = ['ધોરણ ૬', 'ધોરણ ૭', 'ધોરણ ૮'].includes(printPatrakF.standard);
                    const sem1Calc = getCalculatedPatrakB(printPatrakF.patrak_b_sem1);
                    const sem2Calc = getCalculatedPatrakB(printPatrakF.patrak_b_sem2);
                    const patrakBObtained = sem1Calc + sem2Calc;
                    const patrakBMax = isUpper ? 400 : 200;

                    return (
                      <tr className="bg-amber-50 font-bold">
                        <td className="border p-1">વ્યક્તિત્વ વિકાસ (પત્રક-B)</td>
                        <td className="border p-1 text-center">
                          {patrakBObtained} / {patrakBMax}
                        </td>
                        <td className="border p-1 text-center font-bold">
                          {calculateGrade(patrakBObtained, patrakBMax)}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
              <div className="flex justify-between items-center text-xs font-bold pt-2 border-t">
                <div>વર્ગ શિક્ષકની સહી</div>
                <div>આચાર્યશ્રીની સહી</div>
              </div>
            </div>
            <button onClick={() => window.print()} className="w-full mt-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow print:hidden">
              🖨️ પ્રિન્ટ કરો
            </button>
          </div>
        </div>
      )}
    </div>
  );
}