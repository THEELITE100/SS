// import React, { useState } from 'react';
// import apiClient from '../../utils/apiClient';
// import Input from '../common/Input';
// import Button from '../common/Button';
// import FileUploadDropzone from '../common/FileUploadDropzone';

// const CreateGigModal = ({ isOpen, onClose, onSuccess }) => {
//   if (!isOpen) return null;

//   const [formData, setFormData] = useState({
//     title: '',
//     category: 'Web Development',
//     description: '',
//     skillsInput: '',
//     budgetType: 'fixed',
//     minBudget: '',
//     maxBudget: '',
//     locationRequirement: 'hyperlocal',
//     coordinates: [77.3910, 28.5355],
//     documentUrl: '',
//   });

//   const [isLocating, setIsLocating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   const categories = [
//     'Web Development',
//     'AI & Machine Learning',
//     'UI/UX Design',
//     'Mobile Apps',
//     'DevOps & Cloud',
//   ];

//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({ ...prev, [id]: value }));
//   };

//   const handleDetectGPS = () => {
//     if (!navigator.geolocation) {
//       alert('Geolocation is not supported by your browser.');
//       return;
//     }
//     setIsLocating(true);
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setFormData((prev) => ({
//           ...prev,
//           coordinates: [position.coords.longitude, position.coords.latitude],
//         }));
//         setIsLocating(false);
//       },
//       () => {
//         setIsLocating(false);
//         alert('Could not retrieve precise location. Using regional fallback.');
//       }
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     const requiredSkills = formData.skillsInput
//       .split(',')
//       .map((s) => s.trim())
//       .filter(Boolean);

//     if (requiredSkills.length === 0) {
//       setError('Please provide at least one required skill.');
//       setIsSubmitting(false);
//       return;
//     }

//     if (Number(formData.minBudget) > Number(formData.maxBudget)) {
//       setError('Minimum budget cannot exceed maximum budget.');
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const payload = {
//         title: formData.title,
//         category: formData.category,
//         description: formData.description,
//         requiredSkills,
//         budgetType: formData.budgetType,
//         budgetRange: {
//           min: Number(formData.minBudget),
//           max: Number(formData.maxBudget),
//         },
//         locationRequirement: formData.locationRequirement,
//         targetCoordinates: formData.coordinates,
//       };

//       await apiClient.post('/gigs', payload);
//       setIsSubmitting(false);
//       onSuccess();
//       onClose();
//     } catch (err) {
//       setIsSubmitting(false);
//       setError(err.response?.data?.message || 'Failed to post project opportunity.');
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
//       <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100">
        
//         <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-6">
//           <div>
//             <span className="text-[11px] font-bold uppercase tracking-widest text-premium-accent">
//               New Opportunity
//             </span>
//             <h2 className="text-xl sm:text-2xl font-extrabold text-premium-dark mt-0.5">
//               Post a Project
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
//           >
//             ✕
//           </button>
//         </div>

//         {error && (
//           <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//           <Input
//             id="title"
//             label="Project Title"
//             placeholder="e.g. Senior React & Tailwind Developer for Luxury Portal"
//             value={formData.title}
//             onChange={handleChange}
//             required
//           />

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
//                 Domain Category <span className="text-red-500">*</span>
//               </label>
//               <select
//                 id="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 rounded-xl bg-white text-premium-dark text-sm border border-gray-200 focus:border-premium-dark outline-none transition-all"
//               >
//                 {categories.map((cat) => (
//                   <option key={cat} value={cat}>{cat}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
//                 Engagement Model <span className="text-red-500">*</span>
//               </label>
//               <select
//                 id="budgetType"
//                 value={formData.budgetType}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 rounded-xl bg-white text-premium-dark text-sm border border-gray-200 focus:border-premium-dark outline-none transition-all"
//               >
//                 <option value="fixed">Fixed Project Budget</option>
//                 <option value="hourly">Hourly Contract Rate</option>
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Input
//               id="minBudget"
//               label={`Min Budget (${formData.budgetType === 'hourly' ? '₹/hr' : '₹ INR'})`}
//               type="number"
//               placeholder="50000"
//               value={formData.minBudget}
//               onChange={handleChange}
//               required
//             />
//             <Input
//               id="maxBudget"
//               label={`Max Budget (${formData.budgetType === 'hourly' ? '₹/hr' : '₹ INR'})`}
//               type="number"
//               placeholder="120000"
//               value={formData.maxBudget}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
//               Project Description & Requirements <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               id="description"
//               rows={4}
//               required
//               placeholder="Detail deliverables, architecture goals, and expected milestones..."
//               value={formData.description}
//               onChange={handleChange}
//               className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:border-premium-dark outline-none transition-all"
//             />
//           </div>

//           <Input
//             id="skillsInput"
//             label="Required Tech Stack (Comma-Separated)"
//             placeholder="e.g. React, Node.js, Tailwind CSS, Socket.IO"
//             value={formData.skillsInput}
//             onChange={handleChange}
//             required
//           />

//           <FileUploadDropzone
//             label="Attach Technical Brief / Architectural Wireframes (Optional)"
//             accept=".pdf,.zip,.png,.jpg,.docx"
//             maxSizeMB={25}
//             onFileSelect={(file, cdnUrl) => {
//               setFormData((prev) => ({ ...prev, documentUrl: cdnUrl }));
//             }}
//           />

//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
//             <div className="flex flex-col gap-1">
//               <span className="text-xs font-bold text-premium-dark uppercase tracking-wider">Work Environment</span>
//               <div className="flex items-center gap-4 mt-1">
//                 {['hyperlocal', 'remote'].map((type) => (
//                   <label key={type} className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold capitalize text-gray-700">
//                     <input
//                       type="radio"
//                       name="locationRequirement"
//                       checked={formData.locationRequirement === type}
//                       onChange={() => setFormData((prev) => ({ ...prev, locationRequirement: type }))}
//                       className="accent-premium-dark"
//                     />
//                     {type}
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {formData.locationRequirement === 'hyperlocal' && (
//               <button
//                 type="button"
//                 onClick={handleDetectGPS}
//                 disabled={isLocating}
//                 className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-premium-accent hover:bg-gray-100 flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
//               >
//                 <span>📍</span>
//                 {isLocating ? 'Detecting GPS...' : 'Anchor to Current GPS'}
//               </button>
//             )}
//           </div>

//           <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
//             <Button variant="outline" size="md" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
//               {isSubmitting ? 'Publishing Listing...' : 'Post Opportunity Now'}
//             </Button>
//           </div>
//         </form>

//       </div>
//     </div>
//   );
// };

// export default CreateGigModal;

import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import Input from '../common/Input';
import Button from '../common/Button';

const CreateGigModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [maxBudget, setMaxBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/gigs', {
        title,
        description,
        category,
        maxBudget: Number(maxBudget)
      });
      setIsLoading(false);
      
      setTitle('');
      setDescription('');
      setMaxBudget('');
      
      onSuccess();
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError('Failed to post project. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 flex flex-col gap-5">
        
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">New Opportunity</span>
            <h2 className="text-xl font-extrabold text-premium-dark mt-0.5">Post a Project</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold">✕</button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="title" label="Project Title" placeholder="e.g., Full-Stack React Developer Needed" value={title} onChange={(e) => setTitle(e.target.value)} required />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Project Scope & Details</label>
            <textarea
              rows={4}
              placeholder="Describe the exact requirements, timeline, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 text-xs outline-none focus:border-black transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-black bg-white transition-all"
            >
              <option value="Web Development">Web Development</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Mobile Apps">Mobile Apps</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
            </select>
          </div>

          <Input id="maxBudget" label="Maximum Allocation (INR)" type="number" placeholder="75000" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} required />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
              {isLoading ? 'Encrypting Ledger...' : 'Publish to Marketplace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGigModal;