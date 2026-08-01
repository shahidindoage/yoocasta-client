import { useState, useEffect } from 'react';
import { getAdminBlogs, createBlog, deleteBlog, uploadBlogImage, updateBlog } from '../../api/admin.api';
import api from '../../api/axios';
import { Trash2, Pencil, Plus, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Blog {
  id: number;
  categoryId: number | null;
  category: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

const ManageWork = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [showHtml, setShowHtml] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    api.get('/blogs/categories').then((res) => {
      if (res.data?.data) setCategories(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAdminBlogs(page, 20);
        setBlogs(res.data.data.blogs);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotal(res.data.data.pagination.total);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, refreshKey]);

  const handleDelete = async (blogId: number) => {
    if (!window.confirm('Delete this work?')) return;
    try {
      await deleteBlog(blogId);
      setRefreshKey((k) => k + 1);
    } catch {
      alert('Failed to delete');
    }
  };

  const openAdd = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
    setExistingImageUrl('');
    setDate('');
    setCategoryId('');
    setShowHtml(false);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const openEdit = (blog: Blog) => {
    setEditId(blog.id);
    setTitle(blog.title);
    setDescription(blog.description);
    setDate(blog.date.split('T')[0]);
    setCategoryId(blog.categoryId || '');
    setExistingImageUrl(blog.image || '');
    setImageFile(null);
    setShowHtml(false);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
    setExistingImageUrl('');
    setDate('');
    setCategoryId('');
    setShowHtml(false);
    setError('');
    setSuccess('');
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['code-block'],
      ['clean']
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!date) { setError('Date is required'); return; }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      let finalImageUrl = existingImageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('blogImage', imageFile);
        const uploadRes = await uploadBlogImage(formData);
        finalImageUrl = uploadRes.data.data.url;
      }

      if (editId) {
        await updateBlog(editId, {
          title: title.trim(),
          description: description,
          ...(finalImageUrl && { image: finalImageUrl }),
          date: new Date(date).toISOString(),
          categoryId: categoryId ? Number(categoryId) : null,
        });
        setSuccess('Blog updated successfully');
      } else {
        await createBlog({
          title: title.trim(),
          description: description,
          image: finalImageUrl,
          date: new Date(date).toISOString(),
          categoryId: categoryId ? Number(categoryId) : null,
        });
        setSuccess('Blog created successfully');
      }

      setRefreshKey((k) => k + 1);
      setTimeout(() => closeModal(), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save blog');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#3835A4]">Work List</h2>
          <p className="text-xs text-stone-400">{total} total works</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#C6007E] text-white px-5 py-2.5 font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Work
        </button>
      </div>

      {success && !modalOpen && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

      <div className="bg-white border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {['Sl No', 'Category Name', 'Blog Title', 'Action'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Action' ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">Loading...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">No works found</td>
                </tr>
              ) : (
                blogs.map((b, idx) => (
                  <tr key={b.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{(page - 1) * 20 + idx + 1}</td>
                    <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{b.category}</td>
                    <td className="px-4 py-3 font-medium border-r border-stone-100">{b.title}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openEdit(b)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer mr-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                      <button onClick={() => handleDelete(b.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-1 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 text-xs font-bold text-[#3835A4] disabled:text-stone-300 border border-[#3835A4]/20 rounded disabled:border-stone-100 disabled:cursor-not-allowed cursor-pointer">Previous</button>
          <span className="px-3 py-2 text-xs font-bold text-stone-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 text-xs font-bold text-[#3835A4] disabled:text-stone-300 border border-[#3835A4]/20 rounded disabled:border-stone-100 disabled:cursor-not-allowed cursor-pointer">Next</button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3835A4]">{editId ? 'Edit Work' : 'Add New Work'}</h3>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer"><X /></button>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Blog Title *</label>
                <input
                  type="text" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                  placeholder="Enter blog title" autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Blog Date *</label>
                <input
                  type="date" value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Description</label>
                  <button
                    type="button"
                    onClick={() => setShowHtml(!showHtml)}
                    className="text-xs font-bold text-[#3835A4] hover:underline cursor-pointer"
                  >
                    {showHtml ? 'Show WYSIWYG' : 'Show HTML Code'}
                  </button>
                </div>
                <div className="bg-white pb-10">
                  {showHtml ? (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-[250px] p-4 border border-stone-300 rounded text-sm font-mono focus:outline-none focus:border-[#3835A4] resize-y"
                      placeholder="<p>Enter HTML code here...</p>"
                    />
                  ) : (
                    <div style={{ height: '250px' }}>
                      <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        modules={modules}
                        style={{ height: '100%' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2 pt-4">Image Upload</label>

                {existingImageUrl && !imageFile && (
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-stone-400 block mb-2">Current Image:</span>
                    <img src={existingImageUrl} alt="Current blog" className="h-24 w-auto object-contain border border-stone-200 rounded p-1" />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#3835A4]/10 file:text-[#3835A4] hover:file:bg-[#3835A4]/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal}
                  className="text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
                  {submitting ? 'Saving...' : (editId ? 'Update Blog' : 'Create Blog')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWork;
