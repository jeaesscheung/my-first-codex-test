'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Clapperboard, ScanText, Bot, CheckCircle2 } from 'lucide-react';
import { corePanels, timelineShots, qcData } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

const icons = [ScanText, Clapperboard, Bot, CheckCircle2];

export default function LandingPage() {
  const [selected, setSelected] = useState(timelineShots[0]);
  return <main className='relative overflow-hidden film-grain'>
    <section className='min-h-screen px-6 py-16 bg-grid [background-size:40px_40px]'>
      <div className='mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center'>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <p className='text-cyan-300 tracking-[0.3em] mb-4'>金泰 AI影视导演工作台</p>
          <h1 className='text-5xl lg:text-7xl font-black leading-tight'>AI Film Director Cockpit</h1>
          <p className='mt-6 text-slate-300 text-lg'>从剧本、分镜、角色、场景、运镜到审片质检的一体化 AI 影视导演工作台</p>
          <div className='mt-8 flex gap-4'><Button>进入导演控制台</Button><Button className='bg-gold/20 border-gold/40 text-gold'>查看工作流</Button></div>
        </motion.div>
        <motion.div className='panel p-6' initial={{opacity:0,scale:.95}} whileInView={{opacity:1,scale:1}}>
          <h3 className='text-xl mb-4'>实时生成中的镜头任务面板</h3>
          {corePanels.map((p,i)=><div key={p.key} className='mb-4'> <div className='flex justify-between text-sm'><span>{p.title}</span><span>{p.metric}</span></div><div className='h-2 mt-2 rounded-full bg-white/10'><motion.div className='h-full rounded-full bg-gradient-to-r from-cyan-400 to-gold' initial={{width:0}} whileInView={{width:`${p.progress}%`}} transition={{delay:i*.1}}/></div></div>)}
        </motion.div>
      </div>
    </section>

    <section className='px-6 py-20'><div className='mx-auto max-w-7xl grid md:grid-cols-2 xl:grid-cols-4 gap-5'>
      {corePanels.map((p,i)=>{const Icon=icons[i]; return <motion.div key={p.key} whileHover={{y:-8}} className='panel p-5'><Icon className='text-cyan-300 mb-3'/><h4>{p.title}</h4><p className='text-xs text-slate-400'>{p.status}</p></motion.div>})}
    </div></section>

    <section className='px-6 py-20'><div className='mx-auto max-w-7xl panel p-8'>
      <h2 className='text-3xl mb-6'>镜头连续性圣经</h2>
      <div className='grid md:grid-cols-2 gap-8'>
        <svg viewBox='0 0 400 260' className='w-full rounded-xl bg-slate-900/70 p-4'>
          <path d='M20 220 C120 60, 230 60, 360 200' stroke='#44d9ff' strokeWidth='3' fill='none'/>
          <path d='M60 230 L60 40 L340 40' stroke='#d9b46d' strokeDasharray='6 6' fill='none'/>
        </svg>
        <div className='space-y-2 text-sm text-slate-300'><p>人物站位 A/B 锁定 · 镜头轴线 180° 约束 · 摄影机路线 曲线推进</p><p>主光源 45° 顶侧 · 道具位置保持 92% 一致性</p><p>上一镜头结束动作：抬手触控；下一镜头开始动作：手指落点确认</p></div>
      </div></div></section>

    <section className='px-6 py-20'><div className='mx-auto max-w-7xl panel p-8'><h2 className='text-3xl mb-6'>AI模型调度</h2><p>Director Queue → H100（理解/RAG/质检） 与 5090（ComfyUI/角色/分镜）</p><motion.div className='mt-6 h-2 bg-white/10 rounded-full overflow-hidden'><motion.div className='h-full w-1/3 bg-cyan-400' animate={{x:['-100%','320%']}} transition={{duration:3,repeat:Infinity,ease:'linear'}}/></motion.div></div></section>

    <section className='px-6 py-20'><div className='mx-auto max-w-7xl grid lg:grid-cols-3 gap-6'><div className='lg:col-span-2 panel p-6'><h2 className='text-3xl mb-6'>分镜时间线</h2><div className='grid md:grid-cols-3 gap-3'>{timelineShots.map(s=><button key={s.id} onClick={()=>setSelected(s)} className='text-left panel p-3 hover:border-cyan-300/60'><p className='font-semibold'>{s.id}</p><p className='text-xs text-slate-400'>{s.scale} · {s.movement}</p></button>)}</div></div><div className='panel p-6'><h3 className='text-xl'>{selected.id} 详情</h3><p className='mt-3 text-slate-300'>{selected.detail}</p></div></div></section>

    <section className='px-6 py-20'><div className='mx-auto max-w-7xl panel p-8'><h2 className='text-3xl mb-6'>资产库 & 审片质检</h2><div className='grid lg:grid-cols-2 gap-8'><div className='grid sm:grid-cols-2 gap-3'>{['角色资产','场景资产','风格板','提示词版本','视频版本'].map((a,i)=><div key={a} className='panel p-4 hover:-translate-y-1 transition'><p>{a}</p><p className='text-xs text-slate-400 mt-1'>v{i+3}.2 · 审核通过 · 相似度{90-i}%</p></div>)}</div><div className='h-72'><ResponsiveContainer width='100%' height='100%'><RadarChart data={qcData}><PolarGrid stroke='rgba(255,255,255,.2)'/><PolarAngleAxis dataKey='subject' tick={{fill:'#cbd5e1',fontSize:12}}/><Radar dataKey='score' stroke='#44d9ff' fill='#44d9ff' fillOpacity={0.35}/></RadarChart></ResponsiveContainer></div></div></div></section>

    <section className='px-6 py-24 text-center'><h2 className='text-4xl font-bold'>让 AI 不再随机生成，而是按导演意图执行</h2><Button className='mt-8'>启动一个影视项目</Button></section>
  </main>;
}
