import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Code2, 
  Video, 
  GraduationCap, 
  Github, 
  Instagram, 
  Twitter, 
  Mail,
  ExternalLink,
  BrainCircuit,
  Heart,
  Star,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit3,
  X,
  LogOut
} from 'lucide-react';
import { supabase } from './supabase';

interface Project {
  id?: number;
  title: string;
  category: string;
  image: string;
  tags: string[];
}

interface Skill {
  id?: number;
  name: string;
  level: number;
  icon: string;
}

interface Experience {
  id?: number;
  company: string;
  position: string;
  period: string;
  short_description: string;
  description: string;
}

interface Social {
  id?: number;
  name: string;
  url: string;
  icon: string;
}

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <div className="flex flex-col mb-12">
    <div className="flex items-center gap-3 mb-2">
      <Icon size={20} className="text-maroon-main" />
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-maroon-soft">Bagian</span>
    </div>
    <h2 className="text-4xl md:text-5xl font-serif italic text-maroon-deep">{children}</h2>
    <div className="h-px w-24 bg-maroon-main mt-4 opacity-30" />
  </div>
);

const RoleCard: React.FC<{ title: string, description: string, icon: any, index: number, onClick?: () => void }> = ({ title, description, icon: Icon, index, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    onClick={onClick}
    className={`group p-8 rounded-[2rem] glass-card hover:bg-maroon-main hover:text-cream-bg transition-all duration-500 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
  >
    <div className="flex flex-col gap-6">
      <div className="w-14 h-14 rounded-2xl bg-maroon-main/10 flex items-center justify-center text-maroon-main group-hover:bg-cream-bg/20 group-hover:text-cream-bg transition-colors">
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-2xl font-serif font-bold mb-3">{title}</h3>
        <p className="text-sm leading-relaxed opacity-80">{description}</p>
      </div>
      <div className="pt-4 flex justify-end">
        <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </div>
  </motion.div>
);

const ProjectCard: React.FC<{ title: string, category: string, image: string, tags: string[], onClick?: () => void }> = ({ title, category, image, tags, onClick }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    onClick={onClick}
    className={`group relative overflow-hidden rounded-[2.5rem] bg-cream-accent shadow-xl shadow-maroon-deep/5 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="aspect-[4/5] overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="p-8">
      <div className="text-[10px] uppercase tracking-[0.2em] text-maroon-soft mb-2">{category}</div>
      <h4 className="text-2xl font-serif italic text-maroon-deep mb-4">{title}</h4>
      <div className="flex gap-2 flex-wrap">
        {tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] uppercase tracking-tighter text-maroon-deep/40">
            #{tag}
          </span>
        ))}
      </div>
    </div>
    <div className="absolute inset-0 bg-maroon-deep/90 translate-y-full group-hover:translate-y-0 transition-transform duration-500 p-8 flex flex-col justify-center items-center text-cream-bg text-center">
      <span className="text-xs uppercase tracking-widest mb-2 opacity-70">{category}</span>
      <h4 className="text-3xl font-serif italic mb-6">{title}</h4>
      <button className="flex items-center gap-2 text-sm font-bold group/btn border border-cream-bg/30 px-6 py-3 rounded-full hover:bg-cream-bg hover:text-maroon-deep transition-all">
        Lihat Proyek <ArrowUpRight size={16} />
      </button>
    </div>
  </motion.div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('semua');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [adminSection, setAdminSection] = useState<'projects' | 'skills' | 'experiences' | 'socials' | 'general'>('projects');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    category: 'Pemrograman AI',
    image: 'https://picsum.photos/seed/new/800/1000',
    tags: []
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState<Skill>({
    name: '',
    level: 80,
    icon: 'BrainCircuit'
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [newExperience, setNewExperience] = useState<Experience>({
    company: '',
    position: '',
    period: '',
    short_description: '',
    description: ''
  });

  // View State for Main Page
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const [socials, setSocials] = useState<Social[]>([]);
  const [editingSocial, setEditingSocial] = useState<Social | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [newSocial, setNewSocial] = useState<Social>({
    name: '',
    url: '',
    icon: 'Instagram'
  });

  const [content, setContent] = useState<Record<string, string>>({
    hero_badge_top: 'Portofolio 2025/2026',
    hero_title: 'Bening Creative',
    hero_subtitle: 'Pelajar, AI Programmer, dan Konten Kreator yang berfokus pada penggabungan teknologi canggih dengan estetika yang bermakna.',
    hero_image: 'https://picsum.photos/seed/bening/800/1000',
    hero_badge_bottom: 'Tetap Kreatif',
    about_title: 'Peran & Keahlian Saya',
    about_quote: 'Menjelajahi batas antara kode dan kreativitas, satu proyek pada satu waktu.',
    works_title: 'Karya Pilihan',
    contact_title: 'Mari buat sesuatu yang indah bersama.',
    contact_subtitle: 'Tertarik untuk berkolaborasi atau sekadar ingin menyapa? Pintu saya selalu terbuka untuk ide-ide baru.',
    contact_email: 'hello@bening.com'
  });

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Fetch Initial Data
  const fetchData = async () => {
    const { data: projectsData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (projectsData) setProjects(projectsData);

    const { data: skillsData } = await supabase.from('skills').select('*').order('level', { ascending: false });
    if (skillsData) setSkills(skillsData);

    const { data: experiencesData } = await supabase.from('experiences').select('*').order('period', { ascending: false });
    if (experiencesData) {
      setExperiences(experiencesData);
      
      // Jika hanya ada 1 data (mungkin Lead Developer lama) atau kosong, reset ke data baru
      const isOldData = experiencesData.length === 1 && experiencesData[0].position.toLowerCase().includes('lead developer');
      
      if (experiencesData.length === 0 || isOldData) {
        if (isOldData) {
          await supabase.from('experiences').delete().eq('id', experiencesData[0].id);
        }

        const initialExperiences = [
          {
            company: 'Bening Creative',
            position: 'AI Programmer',
            period: '2024 - Sekarang',
            short_description: 'Mengembangkan solusi AI inovatif untuk proyek kreatif.',
            description: 'Bertanggung jawab dalam merancang dan mengimplementasikan algoritma pembelajaran mesin untuk meningkatkan alur kerja kreatif dan efisiensi produksi konten.'
          },
          {
            company: 'YouTube & TikTok',
            position: 'Content Creator',
            period: '2022 - 2024',
            short_description: 'Memproduksi konten edukasi teknologi dan gaya hidup kreatif.',
            description: 'Mengelola seluruh proses produksi video mulai dari riset topik, penulisan naskah, pengambilan gambar, hingga penyuntingan akhir. Berhasil membangun komunitas yang antusias terhadap teknologi AI.'
          },
          {
            company: 'Freelance',
            position: 'UI/UX Designer',
            period: '2021 - 2022',
            short_description: 'Merancang antarmuka pengguna yang estetis dan fungsional.',
            description: 'Bekerja sama dengan berbagai klien untuk menciptakan desain aplikasi dan website yang berpusat pada pengguna, memastikan pengalaman navigasi yang mulus dan visual yang menarik.'
          }
        ];
        await supabase.from('experiences').insert(initialExperiences);
        const { data: refreshed } = await supabase.from('experiences').select('*').order('period', { ascending: false });
        if (refreshed) setExperiences(refreshed);
      }
    }

    const { data: socialsData } = await supabase.from('socials').select('*');
    if (socialsData) setSocials(socialsData);

    const { data: contentData } = await supabase.from('content').select('*');
    if (contentData) {
      const contentMap: any = {};
      contentData.forEach(item => {
        contentMap[item.key] = item.value;
      });
      if (Object.keys(contentMap).length > 0) {
        setContent(prev => ({ ...prev, ...contentMap }));
      }
    }
  };

  useEffect(() => {
    // Auth Listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setIsLoggedIn(true);
      } else if (!currentUser || currentUser.email !== 'admin@bening.com') {
        // Hanya reset jika bukan admin bypass
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    fetchData();

    // Real-time Subscriptions
    const projectsSub = supabase.channel('projects-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData()).subscribe();
    const skillsSub = supabase.channel('skills-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, () => fetchData()).subscribe();
    const experiencesSub = supabase.channel('experiences-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, () => fetchData()).subscribe();
    const socialsSub = supabase.channel('socials-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'socials' }, () => fetchData()).subscribe();
    const contentSub = supabase.channel('content-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => fetchData()).subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(projectsSub);
      supabase.removeChannel(skillsSub);
      supabase.removeChannel(experiencesSub);
      supabase.removeChannel(socialsSub);
      supabase.removeChannel(contentSub);
    };
  }, []);

  const handleSaveContent = async (key: string, value: string) => {
    try {
      const { error } = await supabase.from('content').upsert({ key, value });
      if (error) throw error;
    } catch (err) {
      console.error("Gagal menyimpan konten", err);
    }
  };

  const handleDeleteContent = async (key: string) => {
    if (!confirm(`Hapus key "${key}"?`)) return;
    try {
      const { error } = await supabase.from('content').delete().eq('key', key);
      if (error) throw error;
    } catch (err) {
      console.error("Gagal menghapus konten", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Bypass login untuk 'admin' dengan password 'sayaadminbening'
    if (loginData.username === 'admin' && loginData.password === 'sayaadminbening') {
      setIsLoggedIn(true);
      setCurrentUser({ email: 'admin@bening.com', user_metadata: { full_name: 'Admin Bening' } });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.username.includes('@') ? loginData.username : `${loginData.username}@bening.com`,
        password: loginData.password,
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setLoginError('Username atau password salah!');
        } else {
          setLoginError(error.message);
        }
      }
    } catch (err: any) {
      console.error("Login gagal", err);
      setLoginError('Terjadi kesalahan saat login.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Login Google gagal", err);
      setLoginError(`Google Error: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdminMode(false);
    } catch (err) {
      console.error("Logout gagal", err);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        const { error } = await supabase.from('projects').update(newProject).eq('id', editingProject.id);
        if (error) throw error;
        setStatusMessage({ text: "Proyek berhasil diperbarui!", type: 'success' });
      } else {
        const { error } = await supabase.from('projects').insert([{ ...newProject, created_at: new Date().toISOString() }]);
        if (error) throw error;
        setStatusMessage({ text: "Proyek berhasil dibuat!", type: 'success' });
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
      setNewProject({ title: '', category: 'Pemrograman AI', image: 'https://picsum.photos/seed/new/800/1000', tags: [] });
      await fetchData();
    } catch (err: any) {
      console.error("Gagal menyimpan proyek", err);
      setStatusMessage({ text: `Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    }
  };

  const handleDeleteProject = async (id: any) => {
    if (!id) {
      setStatusMessage({ text: "ID proyek tidak ditemukan!", type: 'error' });
      return;
    }
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setStatusMessage({ text: "Proyek berhasil dihapus!", type: 'success' });
      await fetchData();
    } catch (err: any) {
      console.error("Gagal menghapus proyek", err);
      setStatusMessage({ text: `Gagal menghapus: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        const { error } = await supabase.from('skills').update(newSkill).eq('id', editingSkill.id);
        if (error) throw error;
        setStatusMessage({ text: "Keahlian berhasil diperbarui!", type: 'success' });
      } else {
        const { error } = await supabase.from('skills').insert([newSkill]);
        if (error) throw error;
        setStatusMessage({ text: "Keahlian berhasil dibuat!", type: 'success' });
      }
      setIsSkillModalOpen(false);
      setEditingSkill(null);
      setNewSkill({ name: '', level: 80, icon: 'BrainCircuit' });
      await fetchData();
    } catch (err: any) {
      console.error("Gagal menyimpan keahlian", err);
      setStatusMessage({ text: `Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    }
  };

  const handleDeleteSkill = async (id: any) => {
    console.log("Mencoba menghapus skill dengan ID:", id);
    if (id === undefined || id === null) {
      setStatusMessage({ text: "ID keahlian tidak ditemukan!", type: 'error' });
      return;
    }
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      
      setSkills(prev => prev.filter(s => s.id !== id));
      setStatusMessage({ text: "Keahlian berhasil dihapus!", type: 'success' });
      await fetchData();
    } catch (err: any) {
      console.error("Gagal menghapus keahlian", err);
      setStatusMessage({ text: `Gagal menghapus: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setNewProject(project);
    setIsProjectModalOpen(true);
  };

  const openEditSkillModal = (skill: Skill) => {
    setEditingSkill(skill);
    setNewSkill(skill);
    setIsSkillModalOpen(true);
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExperience) {
        const { error } = await supabase.from('experiences').update(newExperience).eq('id', editingExperience.id);
        if (error) throw error;
        setStatusMessage({ text: "Pengalaman berhasil diperbarui!", type: 'success' });
      } else {
        const { error } = await supabase.from('experiences').insert([newExperience]);
        if (error) throw error;
        setStatusMessage({ text: "Pengalaman berhasil dibuat!", type: 'success' });
      }
      setIsExperienceModalOpen(false);
      setEditingExperience(null);
      setNewExperience({ company: '', position: '', period: '', short_description: '', description: '' });
      await fetchData();
    } catch (err: any) {
      console.error("Gagal menyimpan pengalaman", err);
      setStatusMessage({ text: `Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    }
  };

  const handleDeleteExperience = async (id: any) => {
    if (!id) {
      setStatusMessage({ text: "ID pengalaman tidak ditemukan!", type: 'error' });
      return;
    }
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', id);
      if (error) throw error;
      setStatusMessage({ text: "Pengalaman berhasil dihapus!", type: 'success' });
      await fetchData();
    } catch (err: any) {
      console.error("Gagal menghapus pengalaman", err);
      setStatusMessage({ text: `Gagal menghapus: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    }
  };

  const openEditExperienceModal = (exp: Experience) => {
    setEditingExperience(exp);
    setNewExperience(exp);
    setIsExperienceModalOpen(true);
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSocial) {
        const { error } = await supabase.from('socials').update(newSocial).eq('id', editingSocial.id);
        if (error) throw error;
        setStatusMessage({ text: "Media sosial berhasil diperbarui!", type: 'success' });
      } else {
        const { error } = await supabase.from('socials').insert([newSocial]);
        if (error) throw error;
        setStatusMessage({ text: "Media sosial berhasil dibuat!", type: 'success' });
      }
      setIsSocialModalOpen(false);
      setEditingSocial(null);
      setNewSocial({ name: '', url: '', icon: 'Instagram' });
      await fetchData();
    } catch (err: any) {
      console.error("Gagal menyimpan media sosial", err);
      setStatusMessage({ text: `Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    }
  };

  const handleDeleteSocial = async (id: any) => {
    if (!id) {
      setStatusMessage({ text: "ID media sosial tidak ditemukan!", type: 'error' });
      return;
    }
    try {
      const { error } = await supabase.from('socials').delete().eq('id', id);
      if (error) throw error;
      setStatusMessage({ text: "Media sosial berhasil dihapus!", type: 'success' });
      await fetchData();
    } catch (err: any) {
      console.error("Gagal menghapus media sosial", err);
      setStatusMessage({ text: `Gagal menghapus: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    }
  };

  const openEditSocialModal = (social: Social) => {
    setEditingSocial(social);
    setNewSocial(social);
    setIsSocialModalOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = { BrainCircuit, Star, Video, Code2, GraduationCap, Sparkles, Heart };
    const Icon = icons[iconName] || BrainCircuit;
    return <Icon size={28} />;
  };

  const filteredProjects = projects.filter(p => activeTab === 'semua' || p.category.toLowerCase().includes(activeTab.toLowerCase()));

  if (isAdminMode) {
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-cream-bg flex items-center justify-center p-6 font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-10 rounded-[3rem] glass-card shadow-2xl"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-maroon-main rounded-2xl flex items-center justify-center text-cream-bg mx-auto mb-4">
                <BrainCircuit size={32} />
              </div>
              <h2 className="text-3xl font-serif italic text-maroon-deep">Login Admin</h2>
              <p className="text-maroon-deep/60 text-sm mt-2">Masuk dengan username & kata sandi</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Nama Pengguna</label>
                <input 
                  type="text" 
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main transition-colors"
                  placeholder="admin"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Kata Sandi</label>
                <input 
                  type="password" 
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {loginError && <p className="text-red-600 text-xs font-bold text-center">{loginError}</p>}
              
              <button type="submit" className="w-full maroon-button py-5 rounded-2xl font-bold uppercase tracking-widest text-sm">
                Masuk
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-maroon-main/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-cream-bg px-2 text-maroon-soft">Atau</span></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-maroon-main/10 hover:bg-maroon-main/5 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <Github size={18} /> Masuk dengan Google
              </button>

              <button 
                type="button"
                onClick={() => setIsAdminMode(false)}
                className="w-full text-xs font-bold uppercase tracking-widest text-maroon-deep/40 hover:text-maroon-deep transition-colors"
              >
                Kembali ke Portofolio
              </button>
            </form>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-cream-bg font-sans flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-maroon-deep text-cream-bg p-8 flex flex-col">
          <div className="text-2xl font-serif italic mb-12">Bening. Admin</div>
          <nav className="flex-1 space-y-4">
            <button 
              onClick={() => setAdminSection('projects')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${adminSection === 'projects' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              Proyek
            </button>
            <button 
              onClick={() => setAdminSection('skills')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${adminSection === 'skills' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              Keahlian
            </button>
            <button 
              onClick={() => setAdminSection('experiences')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${adminSection === 'experiences' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              Pengalaman
            </button>
            <button 
              onClick={() => setAdminSection('socials')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${adminSection === 'socials' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              Media Sosial
            </button>
            <button 
              onClick={() => setAdminSection('general')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${adminSection === 'general' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              Pengaturan Umum
            </button>
          </nav>
          <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            <LogOut size={16} /> Keluar
          </button>
        </aside>

        {/* Admin Content */}
        <main className="flex-1 p-12 overflow-y-auto relative">
          <AnimatePresence>
            {statusMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm uppercase tracking-widest ${
                  statusMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {statusMessage.type === 'success' ? <Star size={18} /> : <X size={18} />}
                {statusMessage.text}
              </motion.div>
            )}
          </AnimatePresence>

          {adminSection === 'projects' && (
            <>
              <header className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-serif italic text-maroon-deep">Kelola Proyek</h2>
                <button 
                  onClick={() => { setEditingProject(null); setNewProject({ title: '', category: 'AI Programming', image: 'https://picsum.photos/seed/new/800/1000', tags: [] }); setIsProjectModalOpen(true); }}
                  className="maroon-button px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah Proyek
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <div key={project.id} className="p-6 rounded-[2.5rem] glass-card flex flex-col gap-4">
                    <div className="aspect-video rounded-2xl overflow-hidden">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-maroon-soft mb-1">{project.category}</div>
                      <h4 className="text-xl font-serif italic text-maroon-deep">{project.title}</h4>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => openEditModal(project)}
                        className="p-3 rounded-xl bg-maroon-main/10 text-maroon-main hover:bg-maroon-main hover:text-cream-bg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id!)}
                        className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminSection === 'skills' && (
            <>
              <header className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-serif italic text-maroon-deep">Kelola Keahlian</h2>
                <button 
                  onClick={() => { setEditingSkill(null); setNewSkill({ name: '', level: 80, icon: 'BrainCircuit' }); setIsSkillModalOpen(true); }}
                  className="maroon-button px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah Keahlian
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-6 rounded-[2.5rem] glass-card flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-maroon-main/10 flex items-center justify-center text-maroon-main">
                        {getIconComponent(skill.icon)}
                      </div>
                      <div>
                        <h4 className="text-xl font-serif italic text-maroon-deep">{skill.name}</h4>
                        <div className="text-[10px] uppercase tracking-widest text-maroon-soft">{skill.level}% Kemahiran</div>
                      </div>
                    </div>
                    <div className="w-full bg-maroon-main/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-maroon-main h-full" style={{ width: `${skill.level}%` }} />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => openEditSkillModal(skill)}
                        className="p-3 rounded-xl bg-maroon-main/10 text-maroon-main hover:bg-maroon-main hover:text-cream-bg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSkill(skill.id!)}
                        className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminSection === 'experiences' && (
            <>
              <header className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-serif italic text-maroon-deep">Kelola Pengalaman</h2>
                <button 
                  onClick={() => { setEditingExperience(null); setNewExperience({ company: '', position: '', period: '', description: '' }); setIsExperienceModalOpen(true); }}
                  className="maroon-button px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah Pengalaman
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-6 rounded-[2.5rem] glass-card flex flex-col gap-4">
                    <div>
                      <h4 className="text-xl font-serif italic text-maroon-deep">{exp.position}</h4>
                      <div className="text-[10px] uppercase tracking-widest text-maroon-soft">{exp.company} • {exp.period}</div>
                    </div>
                    <p className="text-sm text-maroon-deep/70 line-clamp-3">{exp.description}</p>
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => openEditExperienceModal(exp)}
                        className="p-3 rounded-xl bg-maroon-main/10 text-maroon-main hover:bg-maroon-main hover:text-cream-bg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteExperience(exp.id!)}
                        className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminSection === 'socials' && (
            <>
              <header className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-serif italic text-maroon-deep">Kelola Media Sosial</h2>
                <button 
                  onClick={() => { setEditingSocial(null); setNewSocial({ name: '', url: '', icon: 'Instagram' }); setIsSocialModalOpen(true); }}
                  className="maroon-button px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah Media Sosial
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {socials.map((social) => (
                  <div key={social.id} className="p-6 rounded-[2.5rem] glass-card flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-maroon-main/10 flex items-center justify-center text-maroon-main">
                        {social.name === 'Instagram' ? <Instagram size={24} /> : social.name === 'Github' ? <Github size={24} /> : <Twitter size={24} />}
                      </div>
                      <div>
                        <h4 className="text-xl font-serif italic text-maroon-deep">{social.name}</h4>
                        <div className="text-[10px] uppercase tracking-widest text-maroon-soft truncate max-w-[150px]">{social.url}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => openEditSocialModal(social)}
                        className="p-3 rounded-xl bg-maroon-main/10 text-maroon-main hover:bg-maroon-main hover:text-cream-bg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSocial(social.id!)}
                        className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminSection === 'general' && (
            <div className="max-w-4xl">
              <header className="mb-12">
                <h2 className="text-4xl font-serif italic text-maroon-deep">Pengaturan Konten Halaman</h2>
                <p className="text-maroon-deep/60 mt-2">Kelola isi konten untuk setiap halaman</p>
              </header>

              <div className="space-y-12">
                {/* Home Section */}
                <div className="glass-card p-10 rounded-[3rem]">
                  <h3 className="text-xl font-serif italic text-maroon-deep mb-6">Bagian Beranda</h3>
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Badge Atas (Tahun)</label>
                      <div className="flex gap-4">
                        <input type="text" value={content.hero_badge_top} onChange={(e) => setContent({...content, hero_badge_top: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('hero_badge_top', content.hero_badge_top)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Judul Hero</label>
                      <div className="flex gap-4">
                        <input type="text" value={content.hero_title} onChange={(e) => setContent({...content, hero_title: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('hero_title', content.hero_title)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Subjudul Hero</label>
                      <div className="flex gap-4">
                        <textarea value={content.hero_subtitle} onChange={(e) => setContent({...content, hero_subtitle: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main h-24 resize-none" />
                        <button onClick={() => handleSaveContent('hero_subtitle', content.hero_subtitle)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">URL Gambar Hero</label>
                      <div className="flex gap-4">
                        <input type="text" value={content.hero_image} onChange={(e) => setContent({...content, hero_image: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('hero_image', content.hero_image)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Teks Badge Bawah</label>
                      <div className="flex gap-4">
                        <input type="text" value={content.hero_badge_bottom} onChange={(e) => setContent({...content, hero_badge_bottom: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('hero_badge_bottom', content.hero_badge_bottom)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="glass-card p-10 rounded-[3rem]">
                  <h3 className="text-xl font-serif italic text-maroon-deep mb-6">Bagian Tentang</h3>
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Judul Tentang</label>
                      <div className="flex gap-4">
                        <input type="text" value={content.about_title} onChange={(e) => setContent({...content, about_title: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('about_title', content.about_title)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Kutipan Tentang</label>
                      <div className="flex gap-4">
                        <textarea value={content.about_quote} onChange={(e) => setContent({...content, about_quote: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main h-24 resize-none" />
                        <button onClick={() => handleSaveContent('about_quote', content.about_quote)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Works Section */}
                <div className="glass-card p-10 rounded-[3rem]">
                  <h3 className="text-xl font-serif italic text-maroon-deep mb-6">Bagian Karya</h3>
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Judul Karya</label>
                      <div className="flex gap-4">
                        <input type="text" value={content.works_title} onChange={(e) => setContent({...content, works_title: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('works_title', content.works_title)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="glass-card p-10 rounded-[3rem]">
                  <h3 className="text-xl font-serif italic text-maroon-deep mb-6">Bagian Kontak</h3>
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Judul Kontak</label>
                      <div className="flex gap-4">
                        <input type="text" value={content.contact_title} onChange={(e) => setContent({...content, contact_title: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('contact_title', content.contact_title)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Subjudul Kontak</label>
                      <div className="flex gap-4">
                        <textarea value={content.contact_subtitle} onChange={(e) => setContent({...content, contact_subtitle: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main h-24 resize-none" />
                        <button onClick={() => handleSaveContent('contact_subtitle', content.contact_subtitle)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Email Kontak</label>
                      <div className="flex gap-4">
                        <input type="email" value={content.contact_email} onChange={(e) => setContent({...content, contact_email: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('contact_email', content.contact_email)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Teks Footer</label>
                      <div className="flex gap-4">
                        <input type="text" value={content.footer_text} onChange={(e) => setContent({...content, footer_text: e.target.value})} className="flex-1 px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" />
                        <button onClick={() => handleSaveContent('footer_text', content.footer_text)} className="maroon-button px-6 rounded-2xl font-bold text-xs uppercase tracking-widest">Simpan</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Content Section */}
                <div className="glass-card p-10 rounded-[3rem]">
                  <header className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif italic text-maroon-deep">Kunci Konten Kustom</h3>
                    <button 
                      onClick={() => {
                        const key = prompt("Masukkan key baru (misal: my_custom_key):");
                        if (key) handleSaveContent(key, "Value baru");
                      }}
                      className="text-maroon-main hover:opacity-70 flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                    >
                      <Plus size={14} /> Tambah Kunci
                    </button>
                  </header>
                  <div className="grid gap-4">
                    {(Object.entries(content) as [string, string][]).map(([key, value]) => (
                      <div key={key} className="flex gap-4 items-center p-4 rounded-2xl bg-cream-accent/50 border border-maroon-main/5">
                        <div className="flex-1">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-maroon-soft mb-1">{key}</div>
                          <input 
                            type="text" 
                            value={value} 
                            onChange={(e) => setContent({...content, [key]: e.target.value})} 
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-maroon-deep"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveContent(key, value)} className="p-2 text-maroon-main hover:bg-maroon-main/10 rounded-lg"><Edit3 size={14} /></button>
                          <button onClick={() => handleDeleteContent(key)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Modal */}
          <AnimatePresence>
            {isSocialModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-maroon-deep/20 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-2xl p-10 rounded-[3rem] bg-cream-bg shadow-2xl relative"
                >
                  <button 
                    onClick={() => setIsSocialModalOpen(false)}
                    className="absolute top-8 right-8 text-maroon-deep/40 hover:text-maroon-deep"
                  >
                    <X size={24} />
                  </button>
                  <h3 className="text-3xl font-serif italic text-maroon-deep mb-8">
                    {editingSocial ? 'Edit Sosial' : 'Sosial Baru'}
                  </h3>
                  <form onSubmit={handleSaveSocial} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Nama</label>
                        <input 
                          type="text" 
                          required
                          value={newSocial.name}
                          onChange={(e) => setNewSocial({...newSocial, name: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                          placeholder="Instagram"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Ikon</label>
                        <select 
                          value={newSocial.icon}
                          onChange={(e) => setNewSocial({...newSocial, icon: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main"
                        >
                          <option>Instagram</option>
                          <option>Github</option>
                          <option>Twitter</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">URL</label>
                      <input 
                        type="url" 
                        required
                        value={newSocial.url}
                        onChange={(e) => setNewSocial({...newSocial, url: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                        placeholder="https://..."
                      />
                    </div>
                    <button type="submit" className="maroon-button w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm">
                      {editingSocial ? 'Perbarui Sosial' : 'Buat Sosial'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isProjectModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-maroon-deep/20 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-2xl p-10 rounded-[3rem] bg-cream-bg shadow-2xl relative"
                >
                  <button 
                    onClick={() => setIsProjectModalOpen(false)}
                    className="absolute top-8 right-8 text-maroon-deep/40 hover:text-maroon-deep"
                  >
                    <X size={24} />
                  </button>
                  <h3 className="text-3xl font-serif italic text-maroon-deep mb-8">
                    {editingProject ? 'Edit Proyek' : 'Proyek Baru'}
                  </h3>
                  <form onSubmit={handleSaveProject} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Judul</label>
                        <input 
                          type="text" 
                          required
                          value={newProject.title}
                          onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Kategori</label>
                        <select 
                          value={newProject.category}
                          onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main"
                        >
                          <option>Pemrograman AI</option>
                          <option>Pembuatan Konten</option>
                          <option>Desain</option>
                          {skills.map(s => <option key={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">URL Gambar</label>
                      <input 
                        type="text" 
                        required
                        value={newProject.image}
                        onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Tag (pisahkan dengan koma)</label>
                      <input 
                        type="text" 
                        value={newProject.tags.join(',')}
                        onChange={(e) => setNewProject({...newProject, tags: e.target.value.split(',').map(t => t.trim())})}
                        className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                        placeholder="React, AI, Python"
                      />
                    </div>
                    <button type="submit" className="maroon-button w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm">
                      {editingProject ? 'Perbarui Proyek' : 'Buat Proyek'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Skill Modal */}
          <AnimatePresence>
            {isSkillModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-maroon-deep/20 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-2xl p-10 rounded-[3rem] bg-cream-bg shadow-2xl relative"
                >
                  <button 
                    onClick={() => setIsSkillModalOpen(false)}
                    className="absolute top-8 right-8 text-maroon-deep/40 hover:text-maroon-deep"
                  >
                    <X size={24} />
                  </button>
                  <h3 className="text-3xl font-serif italic text-maroon-deep mb-8">
                    {editingSkill ? 'Edit Keahlian' : 'Keahlian Baru'}
                  </h3>
                  <form onSubmit={handleSaveSkill} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Nama Keahlian</label>
                        <input 
                          type="text" 
                          required
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Kemahiran (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          required
                          value={newSkill.level}
                          onChange={(e) => setNewSkill({...newSkill, level: parseInt(e.target.value)})}
                          className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Ikon (Nama Lucide)</label>
                      <select 
                        value={newSkill.icon}
                        onChange={(e) => setNewSkill({...newSkill, icon: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main"
                      >
                        <option value="BrainCircuit">BrainCircuit</option>
                        <option value="Star">Star</option>
                        <option value="Video">Video</option>
                        <option value="Code2">Code2</option>
                        <option value="GraduationCap">GraduationCap</option>
                        <option value="Sparkles">Sparkles</option>
                        <option value="Heart">Heart</option>
                      </select>
                    </div>
                    <button type="submit" className="maroon-button w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm">
                      {editingSkill ? 'Perbarui Keahlian' : 'Buat Keahlian'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          {/* Experience Modal */}
          <AnimatePresence>
            {isExperienceModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-maroon-deep/20 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-2xl p-10 rounded-[3rem] bg-cream-bg shadow-2xl relative"
                >
                  <button 
                    onClick={() => setIsExperienceModalOpen(false)}
                    className="absolute top-8 right-8 text-maroon-deep/40 hover:text-maroon-deep"
                  >
                    <X size={24} />
                  </button>
                  <h3 className="text-3xl font-serif italic text-maroon-deep mb-8">
                    {editingExperience ? 'Edit Pengalaman' : 'Pengalaman Baru'}
                  </h3>
                  <form onSubmit={handleSaveExperience} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Perusahaan</label>
                        <input 
                          type="text" 
                          required
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Posisi</label>
                        <input 
                          type="text" 
                          required
                          value={newExperience.position}
                          onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                          className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Periode (misal: 2023 - Sekarang)</label>
                      <input 
                        type="text" 
                        required
                        value={newExperience.period}
                        onChange={(e) => setNewExperience({...newExperience, period: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Penjelasan Singkat</label>
                      <input 
                        type="text" 
                        required
                        value={newExperience.short_description}
                        onChange={(e) => setNewExperience({...newExperience, short_description: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main" 
                        placeholder="Teaser singkat untuk halaman utama"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-maroon-soft mb-2">Deskripsi Lengkap</label>
                      <textarea 
                        required
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-cream-accent border border-maroon-main/10 focus:outline-none focus:border-maroon-main h-32 resize-none" 
                      />
                    </div>
                    <button type="submit" className="maroon-button w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm">
                      {editingExperience ? 'Perbarui Pengalaman' : 'Buat Pengalaman'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-maroon-main selection:text-cream-bg">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cream-accent/30" />
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-maroon-main/5" />
        <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full border border-maroon-main/5" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full glass-card shadow-2xl flex items-center gap-10">
        {['Beranda', 'Tentang', 'Keahlian', 'Pengalaman', 'Karya', 'Kontak'].map((item, idx) => {
          const ids = ['home', 'about', 'skills', 'experience', 'works', 'contact'];
          return (
            <a 
              key={item}
              href={`#${ids[idx]}`} 
              className="text-xs font-bold uppercase tracking-widest hover:text-maroon-main transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-maroon-main transition-all group-hover:w-full" />
            </a>
          );
        })}
        <button 
          onClick={() => setIsAdminMode(true)}
          className="text-xs font-bold uppercase tracking-widest p-2 rounded-full bg-maroon-main/10 text-maroon-main hover:bg-maroon-main hover:text-cream-bg transition-all"
        >
          <BrainCircuit size={16} />
        </button>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-maroon-main" />
              <span className="text-sm font-bold uppercase tracking-[0.3em] text-maroon-main">{content.hero_badge_top}</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-serif leading-[0.9] text-maroon-deep mb-8">
              {(content.hero_title || 'Bening Creative').split(' ')[0]} <br />
              <span className="italic pl-12 md:pl-24">{(content.hero_title || 'Bening Creative').split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-lg text-maroon-deep/70 max-w-md mb-12 leading-relaxed font-medium">
              {content.hero_subtitle || ''}
            </p>
            <div className="flex items-center gap-8">
              <button className="maroon-button px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest">
                Mulai Jelajahi
              </button>
              <div className="flex gap-4">
                <Instagram size={20} className="hover:text-maroon-main cursor-pointer transition-colors" />
                <Github size={20} className="hover:text-maroon-main cursor-pointer transition-colors" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-white shadow-2xl rotate-3">
              <img 
                src={content.hero_image} 
                alt="Bening" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-maroon-main rounded-full flex items-center justify-center text-cream-bg -rotate-12 shadow-xl">
              <div className="text-center">
                <Sparkles size={32} className="mx-auto mb-2" />
                <span className="text-xs font-bold uppercase tracking-tighter">
                  {(content.hero_badge_bottom || 'Stay Creative').split(' ').map((word, i) => (
                    <React.Fragment key={i}>
                      {word} {i === 0 && <br />}
                    </React.Fragment>
                  ))}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-maroon-deep text-cream-bg">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <SectionTitle icon={Heart}>{content.about_title}</SectionTitle>
            <p className="text-3xl md:text-5xl font-serif italic leading-tight mb-12">
              {content.about_quote}
            </p>
            <div className="h-px w-24 bg-maroon-main/30" />
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 px-6 bg-cream-bg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <SectionTitle icon={BrainCircuit}>{content.skills_title || 'My Expertise'}</SectionTitle>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill, index) => (
              <RoleCard 
                key={skill.id}
                index={index}
                title={skill.name}
                description={`${skill.level}% Kemahiran dalam ${skill.name}.`}
                onClick={() => setSelectedSkill(skill)}
                icon={({ size }: { size: number }) => {
                  const icons: any = { BrainCircuit, Star, Video, Code2, GraduationCap, Sparkles, Heart };
                  const Icon = icons[skill.icon] || BrainCircuit;
                  return <Icon size={size} />;
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-32 px-6 bg-maroon-deep text-cream-bg">
        <div className="max-w-7xl mx-auto">
          <SectionTitle icon={GraduationCap}>{content.experience_title || 'Professional Journey'}</SectionTitle>
          <div className="grid lg:grid-cols-2 gap-12 mt-20">
            {experiences.map((exp, index) => (
              <motion.div 
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedExperience(exp)}
                className="p-10 rounded-[3rem] border border-cream-bg/10 hover:border-maroon-main/50 transition-all group cursor-pointer"
              >
                <div className="text-sm font-bold text-maroon-main mb-4 tracking-widest">{exp.period}</div>
                <h3 className="text-3xl font-serif italic mb-2 group-hover:text-maroon-main transition-colors">{exp.position}</h3>
                <div className="text-xs uppercase tracking-[0.3em] opacity-60 mb-6">{exp.company}</div>
                <p className="text-maroon-main font-medium mb-4 italic">"{exp.short_description}"</p>
                <p className="text-cream-bg/60 leading-relaxed line-clamp-2 text-sm">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <SectionTitle icon={Star}>{content.works_title}</SectionTitle>
            <div className="flex gap-8 border-b border-maroon-main/10 pb-2">
              {['semua', ...Array.from(new Set(projects.map(p => p.category)))].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold uppercase tracking-widest transition-all relative ${
                    activeTab === tab ? 'text-maroon-main' : 'text-maroon-deep/40 hover:text-maroon-deep'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="tab-underline" className="absolute -bottom-[11px] left-0 right-0 h-0.5 bg-maroon-main" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id ?? index}
                title={project.title}
                category={project.category}
                image={project.image}
                tags={project.tags}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="bg-maroon-main rounded-[5rem] p-16 md:p-24 text-cream-bg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 text-center">
              <h2 className="text-5xl md:text-7xl font-serif italic mb-8">
                {(content.contact_title || 'Let\'s create something beautiful together.').split(' ').map((word, i) => (
                  <React.Fragment key={i}>
                    {word} {i === 3 && <br />}
                  </React.Fragment>
                ))}
              </h2>
              <p className="text-cream-bg/70 mb-12 max-w-lg mx-auto text-lg">
                {content.contact_subtitle || ''}
              </p>
              <a 
                href={`mailto:${content.contact_email}`} 
                className="inline-flex items-center gap-4 text-2xl md:text-4xl font-serif border-b-2 border-cream-bg/30 pb-2 hover:border-cream-bg transition-all"
              >
                {content.contact_email} <ArrowUpRight size={32} />
              </a>
              
              <div className="mt-20 flex justify-center gap-12">
                {socials.map(social => (
                  <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-maroon-main/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-serif italic text-maroon-deep">Bening.</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-maroon-deep/40">
            {content.footer_text || `© ${new Date().getFullYear()} Bening Creative Studio. All rights reserved.`}
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] uppercase tracking-widest font-bold hover:text-maroon-main transition-colors">Privasi</a>
            <a href="#" className="text-[10px] uppercase tracking-widest font-bold hover:text-maroon-main transition-colors">Ketentuan</a>
          </div>
        </div>
      </footer>

      {/* View Modals */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-maroon-deep/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] bg-cream-bg shadow-2xl relative"
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-maroon-deep hover:bg-maroon-main hover:text-white transition-all">
                <X size={24} />
              </button>
              <div className="aspect-video w-full">
                <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-12">
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-maroon-main mb-4">{selectedProject.category}</div>
                <h3 className="text-5xl font-serif italic text-maroon-deep mb-8">{selectedProject.title}</h3>
                <div className="flex gap-3 flex-wrap mb-8">
                  {selectedProject.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-maroon-main/5 rounded-full text-xs font-bold uppercase tracking-widest text-maroon-main">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-lg text-maroon-deep/70 leading-relaxed">
                  Detail proyek ini menunjukkan dedikasi terhadap kualitas dan estetika. Setiap elemen dirancang untuk memberikan pengalaman yang luar biasa bagi pengguna.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {selectedSkill && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-maroon-deep/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg p-12 rounded-[3rem] bg-cream-bg shadow-2xl relative text-center"
            >
              <button onClick={() => setSelectedSkill(null)} className="absolute top-8 right-8 text-maroon-deep/40 hover:text-maroon-deep">
                <X size={24} />
              </button>
              <div className="w-24 h-24 rounded-3xl bg-maroon-main/10 flex items-center justify-center text-maroon-main mx-auto mb-8">
                {(() => {
                  const icons: any = { BrainCircuit, Star, Video, Code2, GraduationCap, Sparkles, Heart };
                  const Icon = icons[selectedSkill.icon] || BrainCircuit;
                  return <Icon size={48} />;
                })()}
              </div>
              <h3 className="text-4xl font-serif italic text-maroon-deep mb-4">{selectedSkill.name}</h3>
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-maroon-main mb-8">Tingkat Keahlian: {selectedSkill.level}%</div>
              <div className="w-full h-2 bg-maroon-main/10 rounded-full overflow-hidden mb-8">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedSkill.level}%` }}
                  className="h-full bg-maroon-main"
                />
              </div>
              <p className="text-maroon-deep/60 leading-relaxed">
                Keahlian dalam {selectedSkill.name} memungkinkan pembuatan solusi yang inovatif dan efisien, menggabungkan logika teknis dengan visi kreatif.
              </p>
            </motion.div>
          </div>
        )}

        {selectedExperience && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-maroon-deep/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full max-w-2xl p-12 rounded-[3rem] bg-cream-bg shadow-2xl relative"
            >
              <button onClick={() => setSelectedExperience(null)} className="absolute top-8 right-8 text-maroon-deep/40 hover:text-maroon-deep">
                <X size={24} />
              </button>
              <div className="text-sm font-bold text-maroon-main mb-4 tracking-widest">{selectedExperience.period}</div>
              <h3 className="text-4xl font-serif italic text-maroon-deep mb-2">{selectedExperience.position}</h3>
              <div className="text-xs uppercase tracking-[0.3em] text-maroon-soft mb-10">{selectedExperience.company}</div>
              <div className="h-px w-full bg-maroon-main/10 mb-10" />
              <p className="text-lg text-maroon-deep/70 leading-relaxed whitespace-pre-wrap">
                {selectedExperience.description}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
