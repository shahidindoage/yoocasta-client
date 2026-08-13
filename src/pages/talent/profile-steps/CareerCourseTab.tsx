import { useState } from 'react';
import { 
 addCareerHistory, updateCareerHistory, deleteCareerHistory, 
 addCourse, updateCourse, deleteCourse 
} from '../../../api/profile.api';

interface Props {
 existingProfile: any;
}

const CareerCourseTab = ({ existingProfile }: Props) => {
 const tp = existingProfile?.talentProfile;
 
 const [careers, setCareers] = useState<any[]>(tp?.careerHistory || []);
 const [courses, setCourses] = useState<any[]>(tp?.courses || []);
 
 const [editingCareerId, setEditingCareerId] = useState<string | null>(null);
 const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
 
 const [newCareer, setNewCareer] = useState({ title: '', description: '', startDate: '', endDate: '' });
 const [newCourse, setNewCourse] = useState({ title: '', institution: '', year: '' });
 
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const resetForms = () => {
  setNewCareer({ title: '', description: '', startDate: '', endDate: '' });
  setNewCourse({ title: '', institution: '', year: '' });
  setEditingCareerId(null);
  setEditingCourseId(null);
 };

const handleAddCareer = async () => {
   if (!newCareer.title) return setError('Career title is required');
   try {
    setError('');
    const res = await addCareerHistory(newCareer);
    const created = res.data?.data?.history;
    setCareers(prev => [...prev, { ...newCareer, ...(created || {}), startDate: newCareer.startDate || null, endDate: newCareer.endDate || null }]);
    setSuccess('Career added.');
    resetForms();
    setTimeout(() => setSuccess(''), 3000);
   } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to add career.');
   }
  };

 const handleUpdateCareer = async (historyId: string) => {
  try {
   setError('');
   await updateCareerHistory(historyId, newCareer);
   setCareers(prev => prev.map(c => c.id === historyId ? { ...c, ...newCareer } : c));
   setSuccess('Career updated.');
   setEditingCareerId(null);
   resetForms();
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError(err.response?.data?.message || 'Failed to update career.');
  }
 };

 const handleDeleteCareer = async (historyId: string) => {
  if (!confirm('Delete this career entry?')) return;
  try {
   await deleteCareerHistory(historyId);
   setCareers(prev => prev.filter(c => c.id !== historyId));
   setSuccess('Career deleted.');
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError('Failed to delete career.');
  }
 };

const handleAddCourse = async () => {
   if (!newCourse.title) return setError('Course title is required');
   try {
    setError('');
    const res = await addCourse({ ...newCourse, year: newCourse.year ? parseInt(newCourse.year) : undefined });
    const created = res.data?.data?.course;
    setCourses(prev => [...prev, { ...newCourse, ...(created || {}) }]);
    setSuccess('Course added.');
    resetForms();
    setTimeout(() => setSuccess(''), 3000);
   } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to add course.');
   }
  };

 const handleUpdateCourse = async (courseId: string) => {
  try {
   setError('');
   await updateCourse(courseId, { ...newCourse, year: newCourse.year ? parseInt(newCourse.year) : undefined });
   setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...newCourse } : c));
   setSuccess('Course updated.');
   setEditingCourseId(null);
   resetForms();
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError(err.response?.data?.message || 'Failed to update course.');
  }
 };

 const handleDeleteCourse = async (courseId: string) => {
  if (!confirm('Delete this course?')) return;
  try {
   await deleteCourse(courseId);
   setCourses(prev => prev.filter(c => c.id !== courseId));
   setSuccess('Course deleted.');
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError('Failed to delete course.');
  }
 };

 return (
  <div className="space-y-12">
   
   {/* Title */}
   <div className="border-b border-neutral-100 pb-5">
    <h2 className="text-xl font-black" style={{ color: '#3835A4' }}>Career & Courses</h2>
    <p className="text-xs text-neutral-400 mt-1">Add your career history and courses.</p>
   </div>

    {/* Messages */}
   {(error || success) && (
    <div className="space-y-3 animate-fadeIn">
     {error && (
      <p className="text-xs font-bold text-red-500  bg-red-50 border border-red-100 px-4 py-3.5 rounded-xl">
       ⚠️ {error}
      </p>
     )}
     {success && (
      <p className="text-xs font-bold  bg-neutral-50 border px-4 py-3.5 rounded-xl" style={{ color: '#C6007E', borderColor: '#C6007E' }}>
       ✓ {success}
      </p>
     )}
    </div>
   )}

    {/* Career History */}
   <div className="space-y-6">
    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
     <h3 className="text-xs font-black text-neutral-400">
      Career History <span className="font-mono text-[10px] ml-1" style={{ color: '#3835A4' }}>({careers.length})</span>
     </h3>
     {editingCareerId !== 'new' && (
      <button 
       onClick={() => { resetForms(); setEditingCareerId('new'); }} 
       className="border font-black text-[10px]  px-4 py-2.5 rounded-xl transition-all duration-150"
       style={{ 
        color: '#3835A4', 
        borderColor: '#3835A4'
       }}
       onMouseEnter={(e) => {
        e.currentTarget.style.color = '#C6007E';
        e.currentTarget.style.borderColor = '#C6007E';
       }}
       onMouseLeave={(e) => {
        e.currentTarget.style.color = '#3835A4';
        e.currentTarget.style.borderColor = '#3835A4';
       }}
      >
        + Add Career
      </button>
     )}
    </div>

    {/* Add/Edit Career form */}
    {editingCareerId && (
     <div className="bg-neutral-50/60 border border-neutral-200/60 rounded-2xl p-6 space-y-5 animate-fadeIn">
      <h4 className="text-[10px] font-black text-neutral-400">
       {editingCareerId === 'new' ? 'Add Career' : 'Edit Career'}
      </h4>
      <div className="space-y-4">
       <div className="group border-b border-neutral-200 focus-within:border-neutral-950 transition-colors" style={{ '--tw-border-opacity': '1' } as any}>
        <label className="block text-[9px] font-extrabold text-neutral-400">Job Title *</label>
        <input 
         type="text"
         placeholder="e.g. Lead Actor" 
         value={newCareer.title} 
         onChange={(e) => setNewCareer({ ...newCareer, title: e.target.value })} 
         className="w-full bg-transparent py-2 text-sm font-medium placeholder-neutral-300 outline-none" 
         style={{ color: '#3835A4' }}
        />
       </div>

       <div className="group border-b border-neutral-200 focus-within:border-neutral-950 transition-colors">
        <label className="block text-[9px] font-extrabold text-neutral-400">Description (Optional)</label>
        <textarea 
         placeholder="Brief description of your role..." 
         value={newCareer.description}
         onChange={(e) => setNewCareer({ ...newCareer, description: e.target.value })}
         rows={2}
         className="w-full bg-transparent py-2 text-sm font-medium placeholder-neutral-300 outline-none resize-none" 
         style={{ color: '#3835A4' }}
        />
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="group border-b border-neutral-200 focus-within:border-neutral-950 transition-colors">
         <label className="block text-[9px] font-extrabold text-neutral-400">Start Date</label>
         <input 
          type="date" 
          value={newCareer.startDate} 
          onChange={(e) => setNewCareer({ ...newCareer, startDate: e.target.value })}
          className="w-full bg-transparent py-2 text-xs font-medium outline-none cursor-pointer text-neutral-800" 
         />
        </div>
        <div className="group border-b border-neutral-200 focus-within:border-neutral-950 transition-colors">
         <label className="block text-[9px] font-extrabold text-neutral-400">End Date</label>
         <input 
          type="date" 
          value={newCareer.endDate} 
          onChange={(e) => setNewCareer({ ...newCareer, endDate: e.target.value })}
          className="w-full bg-transparent py-2 text-xs font-medium outline-none cursor-pointer text-neutral-800" 
         />
        </div>
       </div>

       <div className="flex gap-3 pt-3">
        <button 
         onClick={() => editingCareerId === 'new' ? handleAddCareer() : handleUpdateCareer(editingCareerId)} 
         className="flex-1 text-white font-black text-[10px]  py-3.5 rounded-xl transition-all shadow-md"
         style={{ backgroundColor: '#3835A4', shadowColor: '#3835A4' } as any}
         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2987'}
         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3835A4'}
        >
         {editingCareerId === 'new' ? 'Save Career' : 'Update Career'}
        </button>
        <button 
         onClick={resetForms} 
         className="border border-neutral-200 text-neutral-600 font-black text-[10px]  px-6 py-3.5 rounded-xl transition-colors hover:border-neutral-400"
        >
         Cancel
        </button>
       </div>
      </div>
     </div>
    )}

    {/* Career list */}
    <div className="grid grid-cols-1 gap-4">
     {careers.map((career) => {
      const isTemp = career.id?.startsWith?.('temp-');
      return (
       <div 
        key={career.id} 
        className={`border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all duration-300 ${
         isTemp ? 'bg-neutral-50/80 border-dashed border-neutral-300' : 'bg-white border-neutral-200/80 hover:shadow-sm'
        }`}
        style={(!isTemp ? { borderColor: 'rgba(229, 229, 229, 0.8)' } : {})}
        onMouseEnter={(e) => { if(!isTemp) e.currentTarget.style.borderColor = '#3835A4'; }}
        onMouseLeave={(e) => { if(!isTemp) e.currentTarget.style.borderColor = 'rgba(229, 229, 229, 0.8)'; }}
       >
        <div className="space-y-1.5 max-w-2xl">
         <h4 className="text-sm font-black " style={{ color: '#3835A4' }}>{career.title}</h4>
         {(career.startDate || career.endDate) && (
          <p className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
           <span style={{ color: '#C6007E' }}>●</span>
           {career.startDate && `${new Date(career.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}`}
           {career.endDate ? ` — ${new Date(career.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}` : ' — Present'}
          </p>
         )}
         {career.description && (
          <p className="text-xs text-neutral-500 leading-relaxed pt-1 whitespace-pre-line">{career.description}</p>
         )}
        </div>
        
        <div className="flex sm:justify-end gap-4 sm:pt-0.5 border-t sm:border-t-0 border-neutral-50 pt-3">
         {!isTemp && (
          <button 
           onClick={() => { 
            setEditingCareerId(career.id); 
            setNewCareer({ 
             title: career.title, 
             description: career.description || '', 
             startDate: career.startDate?.split('T')[0] || '', 
             endDate: career.endDate?.split('T')[0] || '' 
            }); 
           }} 
           className="text-[10px] font-black  transition-colors"
           style={{ color: '#3835A4' }}
           onMouseEnter={(e) => e.currentTarget.style.color = '#C6007E'}
           onMouseLeave={(e) => e.currentTarget.style.color = '#3835A4'}
          >
           Edit
          </button>
         )}
         <button 
          onClick={() => handleDeleteCareer(career.id)} 
          className="text-[10px] font-black text-neutral-400 hover:text-red-500 transition-colors"
         >
          Delete
         </button>
        </div>
       </div>
      );
     })}
    </div>
   </div>

   {/* COURSES */}
   <div className="space-y-6 pt-4">
    <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
     <h3 className="text-xs font-black text-neutral-400">
      Courses <span className="font-mono text-[10px] ml-1" style={{ color: '#3835A4' }}>({courses.length})</span>
     </h3>
     {editingCourseId !== 'new' && (
      <button 
       onClick={() => { resetForms(); setEditingCourseId('new'); }} 
       className="border font-black text-[10px]  px-4 py-2.5 rounded-xl transition-all duration-150"
       style={{ 
        color: '#3835A4', 
        borderColor: '#3835A4'
       }}
       onMouseEnter={(e) => {
        e.currentTarget.style.color = '#C6007E';
        e.currentTarget.style.borderColor = '#C6007E';
       }}
       onMouseLeave={(e) => {
        e.currentTarget.style.color = '#3835A4';
        e.currentTarget.style.borderColor = '#3835A4';
       }}
      >
        + Add Course
      </button>
     )}
    </div>

    {/* Add/Edit Course form */}
    {editingCourseId && (
     <div className="bg-neutral-50/60 border border-neutral-200/60 rounded-2xl p-6 space-y-5 animate-fadeIn">
      <h4 className="text-[10px] font-black text-neutral-400">
       {editingCourseId === 'new' ? 'Add Course' : 'Edit Course'}
      </h4>
      <div className="space-y-4">
       <div className="group border-b border-neutral-200 focus-within:border-neutral-950 transition-colors">
        <label className="block text-[9px] font-extrabold text-neutral-400">Course Title *</label>
        <input 
         type="text" 
         placeholder="e.g. Acting Masterclass" 
         value={newCourse.title}
         onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} 
         className="w-full bg-transparent py-2 text-sm font-medium placeholder-neutral-300 outline-none" 
         style={{ color: '#3835A4' }}
        />
       </div>

       <div className="group border-b border-neutral-200 focus-within:border-neutral-950 transition-colors">
        <label className="block text-[9px] font-extrabold text-neutral-400">Institution (Optional)</label>
        <input 
         type="text" 
         placeholder="e.g. New York Film Academy" 
         value={newCourse.institution}
         onChange={(e) => setNewCourse({ ...newCourse, institution: e.target.value })} 
         className="w-full bg-transparent py-2 text-sm font-medium placeholder-neutral-300 outline-none" 
         style={{ color: '#3835A4' }}
        />
       </div>

       <div className="group border-b border-neutral-200 focus-within:border-neutral-950 transition-colors">
        <label className="block text-[9px] font-extrabold text-neutral-400">Year *</label>
        <input 
         type="number" 
         placeholder="2026" 
         value={newCourse.year}
         onChange={(e) => setNewCourse({ ...newCourse, year: e.target.value })} 
         className="w-full bg-transparent py-2 text-sm font-medium placeholder-neutral-300 outline-none" 
         style={{ color: '#3835A4' }}
        />
       </div>
       
       <div className="flex gap-3 pt-3">
        <button 
         onClick={() => editingCourseId === 'new' ? handleAddCourse() : handleUpdateCourse(editingCourseId)} 
         className="flex-1 text-white font-black text-[10px]  py-3.5 rounded-xl transition-all shadow-md"
         style={{ backgroundColor: '#3835A4', shadowColor: '#3835A4' } as any}
         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2987'}
         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3835A4'}
        >
         {editingCourseId === 'new' ? 'Save Course' : 'Update Course'}
        </button>
        <button 
         onClick={resetForms} 
         className="border border-neutral-200 text-neutral-600 font-black text-[10px]  px-6 py-3.5 rounded-xl transition-colors hover:border-neutral-400"
        >
         Cancel
        </button>
       </div>
      </div>
     </div>
    )}

    {/* Courses list */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
     {courses.map((course) => (
      <div 
       key={course.id} 
       className="border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 bg-white"
       style={{ borderColor: editingCourseId === course.id ? '#3835A4' : 'rgba(229, 229, 229, 0.8)' }}
       onMouseEnter={(e) => { if(editingCourseId !== course.id) e.currentTarget.style.borderColor = '#3835A4'; }}
       onMouseLeave={(e) => { if(editingCourseId !== course.id) e.currentTarget.style.borderColor = 'rgba(229, 229, 229, 0.8)'; }}
      >
       <div className="space-y-1">
        <h4 className="text-sm font-black " style={{ color: '#3835A4' }}>{course.title}</h4>
        {course.institution && (
         <p className="text-xs text-neutral-500 font-medium">{course.institution}</p>
        )}
        {course.year && (
         <p className="text-[10px] font-mono text-neutral-400 pt-1">Year: {course.year}</p>
        )}
       </div>
       
       <div className="flex items-center justify-between pt-3 border-t border-neutral-50">
        <span className="text-[9px] font-mono" style={{ color: '#C6007E' }}>Course</span>
        <div className="flex gap-4">
         <button 
          onClick={() => { setEditingCourseId(course.id); setNewCourse({ title: course.title, institution: course.institution || '', year: course.year || '' }); }} 
          className="text-[10px] font-black  transition-colors"
          style={{ color: '#3835A4' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#C6007E'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#3835A4'}
         >
          Edit
         </button>
         <button 
          onClick={() => handleDeleteCourse(course.id)} 
          className="text-[10px] font-black text-neutral-400 hover:text-red-500 transition-colors"
         >
          Delete
         </button>
        </div>
       </div>
      </div>
     ))}
    </div>
   </div>
  </div>
 );
};

export default CareerCourseTab;