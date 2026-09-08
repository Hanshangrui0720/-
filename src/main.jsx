import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import FoldText from './FoldText'
import DraggableCertificateGallery from './DraggableCertificateGallery'
import LogoLoop from './LogoLoop'
import TiltedCard from './TiltedCard'
import SpotlightCard from './SpotlightCard'
import BorderGlow from './BorderGlow'
import AnimatedList from './AnimatedList'
import './style.css'
import './hero.css'
import './brand.css'
import './certificates.css'
import './portrait.css'
import './work-art.css'
import './spacing.css'
import './portrait-fix.css'
import './resume-experience.css'
import './SpotlightGlobal.css'
import './services.css'

const Lanyard = lazy(() => import('./Lanyard'))
const ASSET_VERSION = '20260908'
const imageAsset = file => file.replace(/\.(png|jpe?g)$/i, '.webp')

const asset = path => {
  const [file, query] = path.replace(/^\//, '').split('?')
  const optimizedFile = /\.(png|jpe?g)$/i.test(file) ? imageAsset(file) : file
  return `${import.meta.env.BASE_URL}${optimizedFile}?v=${ASSET_VERSION}${query ? `&${query}` : ''}`
}

const HERO_VIDEO_SRC = asset('assets/hero-video-web.mp4')

const works = [
  { id: '01', title: 'Synapse / 品牌智能体', type: 'Brand identity · 2025', className: 'work-one', image: asset('assets/works/inframe-art.png'), desc: '将复杂的 AI 能力转译为一套克制、可感知的品牌语言。' },
  { id: '02', title: 'Lumen / 生成式影像', type: 'Generative visual · 2025', className: 'work-two', image: asset('assets/works/lumen-art.png'), desc: '探索提示词、算法与艺术直觉共创的动态视觉系统。' },
  { id: '03', title: 'Inframe / 体验设计', type: 'Generative visual · 2024', className: 'work-three', image: asset('assets/works/data-sculpture-art.png'), desc: '面向未来工作方式的沉浸式产品体验与交互叙事。' },
]

const aiCertificates = [
  { image: asset('assets/certificates/ai-engineer.png'), label: '智能体工程师认证', alt: 'AI大学堂智能体工程师认证证书' },
  { image: asset('assets/certificates/ai-tuning.png'), label: '微调工程师认证', alt: 'AI大学堂微调工程师认证证书' },
  { image: asset('assets/certificates/ai-rag.png'), label: 'RAG工程师认证', alt: 'AI大学堂RAG工程师认证证书' },
  { image: asset('assets/certificates/ai-prompt.png'), label: 'Prompt工程师认证', alt: 'AI大学堂Prompt工程师认证证书' },
  { image: asset('assets/certificates/ai-trainer-advanced.jpg'), label: '人工智能训练师 高级', alt: '人工智能训练师高级证书' },
]

const codingCertificates = [
  { image: asset('assets/certificates/ai-trainer-junior.jpg'), label: '人工智能训练师 初级', alt: '人工智能训练师初级证书' },
  { image: asset('assets/certificates/datawhale-prompt.png'), label: 'Datawhale Prompt Engineer', alt: 'Datawhale Prompt Engineer certificate' },
  { image: asset('assets/certificates/marscode-ai.png'), label: 'AI+编程能力认证', alt: 'AI+编程能力认证证书' },
  { image: asset('assets/certificates/ai4s-python.png'), label: 'AI4S Python基础能力', alt: 'AI4S Cup Python基础能力认证' },
  { image: asset('assets/certificates/itc-participation.png'), label: 'ITC AI Masterclass', alt: 'ITC Artificial Intelligence masterclass participation certificate' },
]

const certificateCards = [
  codingCertificates[1],
  codingCertificates[2],
  codingCertificates[3],
  codingCertificates[4],
  aiCertificates[0],
  aiCertificates[1],
  aiCertificates[2],
  aiCertificates[3],
  aiCertificates[4],
  codingCertificates[0],
].map((item, index) => ({
  ...item,
  rotate: [-4, 3, -2, 5, -6, 4, -3, 5, -4, 2][index],
}))

const certificateNames = certificateCards.map(({ label }) => label)

const services = [
  {
    number: '01',
    title: 'AI Coding',
    eyebrow: 'FROM IDEA TO PROTOTYPE',
    description: '把想法快速转化为可运行的互动原型。通过 Prompt、Python 与前端脚本搭建自动化流程、创意网页和轻量工具。',
    tags: 'SYS_CORE // PYTHON · PROMPT · WEB',
    className: 'service-coding',
  },
  {
    number: '02',
    title: 'PPT 优化',
    eyebrow: 'CONTENT / LAYOUT / DELIVERY',
    description: '为已有 PPT 做内容梳理、结构重组和视觉升级，让汇报重点更清晰、页面更统一，适用于答辩、课程展示、工作汇报与项目提案。',
    tags: 'PPTX // RESTRUCTURE · VISUAL · MOTION',
    className: 'service-ppt',
  },
]

const footerLogos = [
  ['01', 'AI', 'GENERATIVE VISUAL'],
  ['02', 'BRAND', 'SYSTEM THINKING'],
  ['03', 'RAG', 'KNOWLEDGE DESIGN'],
  ['04', 'UX', 'DIGITAL EXPERIENCE'],
  ['05', 'PROMPT', 'CREATIVE DIRECTION'],
  ['06', 'HAN', 'WELCOME TO MY SPACE'],
].map(([index, accent, label]) => ({ node: <span className="loop-mark"><i>{index}</i><b>{accent}</b><span>{label}</span></span> }))

function App() {
  const [activeWork, setActiveWork] = useState(null)
  const [copied, setCopied] = useState(false)
  const [navPinned, setNavPinned] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState(certificateNames[0])
  const [heroVideoReady, setHeroVideoReady] = useState(true)
  const heroVideoRef = useRef(null)
  const markHeroVideoReady = () => setHeroVideoReady(true)
  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return undefined
    video.play().catch(() => {})
  }, [])
  const copyEmail = async () => { await navigator.clipboard?.writeText('hello@yourname.design'); setCopied(true); setTimeout(() => setCopied(false), 1800) }
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setActiveWork(null) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    const onScroll = () => setNavPinned(window.scrollY > window.innerHeight * 0.82)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return undefined
    if (video.readyState >= 3) setHeroVideoReady(true)
    const fallback = window.setTimeout(() => setHeroVideoReady(true), 4200)
    return () => window.clearTimeout(fallback)
  }, [])
  useEffect(() => {
    const selector = '.work-card, .drag-cert-stage, .skills article, .resume-record, .stats > div, .contact'
    const surfaces = [...document.querySelectorAll(selector)]
    surfaces.forEach(surface => surface.classList.add('spotlight-global'))
    const onPointerMove = event => {
      const surface = event.target.closest('.spotlight-global')
      if (!surface) return
      const rect = surface.getBoundingClientRect()
      surface.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
      surface.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
    }
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      surfaces.forEach(surface => surface.classList.remove('spotlight-global'))
    }
  }, [])
  return <>
    <header className={`nav${navPinned ? ' nav-pinned' : ''}`}><a className="brand" href="#top" aria-label="韩尚睿"><FoldText text="韩尚睿" splitBy="char" hinge="top" trigger="hover" duration={0.95} stagger={0.06} ease="power3.out" perspective={520} creaseShading={0.4} fontSize="inherit" fontWeight={900} color="#f3392c" className="brand-fold" /></a><nav><a href="#about">ABOUT</a><a href="#services">SERVICES</a><a href="#works">WORKS</a><a href="#capability">EXPERTISE</a></nav><a className="nav-contact" href="#contact">LET'S TALK <i>↗</i></a></header>
    <main style={{ '--hero-fallback': `url("${asset('assets/hero-abstract.png')}")`, '--service-coding-image': `url("${asset('assets/services/ai-coding-generated-v2.png')}")`, '--service-ppt-image': `url("${asset('assets/services/ppt-optimization-generated.png')}")` }}>
      <section id="top" className={`hero hero-editorial${heroVideoReady ? ' hero-video-ready' : ''}`}><video ref={heroVideoRef} className="hero-media hero-video" src={HERO_VIDEO_SRC} poster={asset('assets/hero-abstract.png')} autoPlay muted loop playsInline preload="auto" fetchPriority="high" onLoadedData={markHeroVideoReady} onCanPlay={markHeroVideoReady} onPlaying={markHeroVideoReady} /><div className="hero-overlay" /><Suspense fallback={null}><Lanyard /></Suspense><div className="hero-content"><div className="hero-kickers"><span>PORTFOLIO / 2026</span><span>AI DESIGNER</span></div><h1>{heroVideoReady && <FoldText text={'HAN\nSHANGRUI'} splitBy="char" hinge="top" trigger="mount" duration={1.7} stagger={0.078} ease="power3.out" perspective={840} creaseShading={0.5} fontSize="inherit" fontWeight={400} color="#f3392c" className="hero-fold-title" />}</h1><div className="hero-bottom"><div className="hero-statement"><b>{heroVideoReady && <FoldText text="18" splitBy="char" hinge="top" trigger="mount" duration={1.05} stagger={0.08} ease="power3.out" perspective={600} creaseShading={0.45} fontSize="inherit" fontWeight={400} color="#f3392c" className="age-fold" />}</b><p>AI designer based in Shaoxing, Zhejiang<br/>探索生成式视觉与数字体验</p><a href="#works" className="start-button">开始查看 <i>↗</i></a></div><div className="hero-contact"><strong>DESIGN IS NOT<br/>DECORATION</strong><a href="mailto:1608558191@qq.com">1608558191@qq.com</a><a href="tel:19532634620">195 3263 4620</a></div></div></div><div className="scroll-line"><span>SCROLL TO DISCOVER</span></div></section>
      <section id="about" className="about section"><div className="section-tag">01 / PROFILE</div><div className="about-grid"><div className="portrait"><TiltedCard imageSrc="/assets/resume-portrait-soft.png" altText="韩尚睿简历头像" captionText="HAN SHANGRUI / RESUME PORTRAIT" rotateAmplitude={7} scaleOnHover={1.025} overlayContent={<span className="portrait-label">RESUME<br/>PORTRAIT</span>} /></div><BorderGlow className="profile-border-glow" edgeSensitivity={14} glowColor="4 82 58" backgroundColor="#101116" borderRadius={12} glowRadius={18} glowIntensity={.62} coneSpread={22} animated colors={['#f3392c','#852922','#f5f1ea']}><SpotlightCard className="profile-spotlight" spotlightColor="rgba(243, 57, 44, .18)"><div className="bio"><p className="large-copy">我是一名专注于<span>AI 视觉与内容创作</span>的实践者。通过系统课程与证书训练，持续探索生成式 AI、数据处理和互动体验在真实项目中的应用。</p><div className="bio-detail"><div><p>目前位于</p><strong>浙江绍兴 / 中国</strong></div><div><p>大学</p><strong>绍兴越秀外国语学院</strong></div><div><p>高中</p><strong>诸暨中学暨阳分校</strong></div><div><p>专注领域</p><strong>AI Tools · Content · Visual</strong></div><button onClick={copyEmail} className="email-button">{copied ? 'EMAIL COPIED ✓' : 'HELLO@YOURNAME.DESIGN ↗'}</button></div></div></SpotlightCard></BorderGlow></div><BorderGlow className="resume-summary-glow" edgeSensitivity={10} glowColor="4 82 58" backgroundColor="#0d0e12" borderRadius={8} glowRadius={28} glowIntensity={1.12} coneSpread={26} animated colors={['#f3392c','#a52e25','#f5f1ea']}><div className="stats"><div><b>10</b><p>AI CERTIFICATES</p></div><div><b>02</b><p>PRACTICE PROJECTS</p></div><div><b>03</b><p>CORE DIRECTIONS</p></div><div><b>03</b><p>LEARNING FIELDS</p></div></div><div className="resume-records"><article className="resume-record"><span>01 / TARGET ROLE</span><h3>求职意向</h3><p className="record-meta">新媒体运营 / 内容创作 / AI 数据标注与微调</p><ul><li>求职区域：绍兴 / 远程</li><li>熟练使用生成式 AI 工具链与自动化工作流</li><li>具备信息整理、内容表达与 AI 场景应用能力</li></ul></article><article className="resume-record"><span>02 / INDEPENDENT PROJECT</span><h3>AI 辅助独立开发互动小游戏</h3><p className="record-meta">2026.07 — 2026.08 · 绍兴</p><ul><li>从零构建 HTML5 Canvas 互动游戏，完成物理碰撞、关卡计分与响应式布局</li><li>通过 Prompt 设计优化代码生成，将开发周期从预计 2 周缩短至 5 天</li><li>累计编写 800+ 行核心代码，GitHub 开源并获社区 50+ 关注收藏</li></ul></article></div></BorderGlow></section>
      <section id="services" className="services section"><div className="services-rail"><span>02</span><h2>SERVICES</h2><p>凭手艺吃饭，<br/>我能为你做什么。</p><div className="services-index" aria-hidden="true"><i/><i/><i className="active"/><i/><i/></div></div><div className="services-content"><div className="services-intro"><div className="section-tag">02 / SERVICES</div><p>从构思、制作到呈现，<br/>让能力成为可交付的体验。</p></div><div className="service-card-grid">{services.map(service => <BorderGlow key={service.number} className={`service-border-glow ${service.className}`} edgeSensitivity={11} backgroundColor="rgba(13,14,18,.86)" borderRadius={14} glowRadius={25} glowIntensity={.92} coneSpread={24} animated colors={['#f3392c','#7c2922','#f2ebe2']}><SpotlightCard className="service-card" spotlightColor="rgba(243, 57, 44, .23)"><div className="service-card-top"><span>{service.number}</span><p>{service.eyebrow}</p></div><div className="service-card-body"><h3>{service.title}</h3><p>{service.description}</p></div><div className="service-card-bottom"><span>{service.tags}</span><b>↗</b></div></SpotlightCard></BorderGlow>)}</div></div></section>
      <section id="works" className="works section"><div className="section-head"><div className="section-tag">03 / SELECTED WORKS</div><p>每一个项目，都是一次从问题到<br/>新感知的系统性探索。</p></div><BorderGlow className="works-border-glow" edgeSensitivity={14} glowColor="4 82 58" backgroundColor="#101116" borderRadius={8} glowRadius={22} glowIntensity={.75} coneSpread={22} animated colors={['#f3392c','#822821','#f5f1ea']}><div className="works-list"><article className="certificate-showcase"><div className="certificate-showcase-head"><span>01 / CERTIFICATION ARCHIVE</span><b>10</b></div><h3>VERIFIED<br/><em>AI CREDENTIALS.</em></h3><p>已获得的 AI、工程与国际学习认证</p><AnimatedList items={certificateNames} onItemSelect={item => setSelectedCertificate(item)} showGradients enableArrowNavigation displayScrollbar initialSelectedIndex={0} /><div className="certificate-showcase-selected"><span>SELECTED</span><strong>{selectedCertificate}</strong></div></article>{works.slice(1).map(work => <article key={work.id} className={'work-card ' + work.className} onClick={() => setActiveWork(work)} tabIndex="0" onKeyDown={e => e.key === 'Enter' && setActiveWork(work)}><div className="work-art"><img src={work.image} alt="" loading="lazy" decoding="async" /><div className="work-art-shade"/><span className="work-art-id">{work.id}</span></div><div className="work-info"><span>{work.id}</span><h3>{work.title}</h3><p>{work.type}</p><button aria-label={'查看 ' + work.title}>↗</button></div></article>)}</div></BorderGlow></section>
      <section id="certificates" className="certificates section"><div className="section-head"><div className="section-tag">04 / CERTIFICATIONS</div><p>用系统学习和真实证书<br/>沉淀 AI 设计能力边界。</p></div><div className="certificate-copy"><h2>VERIFIED<br/><em>AI PRACTICE.</em></h2><p>我把 10 张证书改成可拖拽卡片陈列：鼠标悬浮会有 3D 倾斜与光泽反馈，按住卡片可以自由拖动重组画面。</p></div><BorderGlow className="certificates-border-glow" edgeSensitivity={13} glowColor="4 82 58" backgroundColor="#0d0e12" borderRadius={8} glowRadius={22} glowIntensity={.72} coneSpread={23} animated colors={['#f3392c','#8c2a23','#e8e3d7']}><DraggableCertificateGallery items={certificateCards} /></BorderGlow></section>
      <section id="capability" className="capability section"><div className="section-tag">05 / EXPERTISE</div><h2>BETWEEN IDEA<br/>&amp; <em>INTELLIGENCE.</em></h2><BorderGlow className="capability-border-glow" edgeSensitivity={14} glowColor="4 82 58" backgroundColor="#101116" borderRadius={8} glowRadius={22} glowIntensity={.72} coneSpread={22} animated colors={['#f3392c','#852922','#f5f1ea']}><div className="skills"><article><span>01</span><h3>AI ART<br/>DIRECTION</h3><p>构建从概念、风格到落地的一体化 AI 视觉叙事。</p><i>✦</i></article><article><span>02</span><h3>BRAND<br/>SYSTEMS</h3><p>让品牌在快速变化的语境中保持清晰、独特且可延展。</p><i>◒</i></article><article><span>03</span><h3>DIGITAL<br/>EXPERIENCE</h3><p>通过感官、交互与技术，设计令人愿意停留的体验。</p><i>⌁</i></article></div></BorderGlow></section>
      <section id="contact" className="contact"><div className="contact-ambient"/><p className="eyebrow">HAVE A PROJECT IN MIND?</p><h2>LET'S MAKE<br/><em>SOMETHING REAL.</em></h2><button onClick={copyEmail} className="contact-mail">{copied ? '已复制邮箱地址' : 'HELLO@YOURNAME.DESIGN'} <span>↗</span></button><div className="footer-logo-loop"><LogoLoop logos={footerLogos} speed={42} direction="left" logoHeight={30} gap={48} hoverSpeed={8} scaleOnHover fadeOut fadeOutColor="#101116" ariaLabel="AI design capabilities" /></div><footer><span>© 2025 YOUR NAME</span><span>DESIGNED WITH INTELLIGENCE</span><a href="#top">BACK TO TOP ↑</a></footer></section>
    </main>
    {activeWork && <div className="modal" onClick={() => setActiveWork(null)}><div className="modal-inner" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setActiveWork(null)}>×</button><p>{activeWork.type}</p><h2>{activeWork.title}</h2><div className={`modal-art ${activeWork.className}`}><span>{activeWork.id}</span></div><p className="modal-desc">{activeWork.desc}</p></div></div>}
  </>
}
createRoot(document.getElementById('root')).render(<App />)


