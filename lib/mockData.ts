export const corePanels = [
  { key: 'script', title: '剧本解析', status: 'Running', progress: 78, metric: '2,184 token/s' },
  { key: 'storyboard', title: '分镜生成', status: 'Queued', progress: 52, metric: '36 shots' },
  { key: 'lock', title: '角色与场景锁定', status: 'Synced', progress: 86, metric: '94.2% match' },
  { key: 'qc', title: '视频质检与审片', status: 'Review', progress: 64, metric: '18 clips' },
];

export const timelineShots = [
  { id: 'S01', scale: '大全景', movement: '航拍推进', mood: '压迫', status: 'approved', detail: '雨夜城市建立镜头，霓虹反射形成主色调。' },
  { id: 'S02', scale: '中景', movement: '斯坦尼康跟拍', mood: '悬疑', status: 'rendering', detail: '主角穿越走廊，光源从右后方扫过。' },
  { id: 'S03', scale: '近景', movement: '轻推', mood: '冷静', status: 'draft', detail: '角色凝视HUD，眼神与镜头轴线对齐。' },
  { id: 'S04', scale: '特写', movement: '锁定', mood: '爆发', status: 'approved', detail: '手部触发按钮，动作衔接下一镜。' },
  { id: 'S05', scale: '中近景', movement: '摇移', mood: '紧张', status: 'rendering', detail: '双人对峙，反打保持180度轴线。' },
  { id: 'S06', scale: '远景', movement: '升降拉远', mood: '释然', status: 'draft', detail: '尾镜拉远，露出全场调度与光带。' },
];

export const qcData = [
  { subject: '角色一致性', score: 92 },
  { subject: '场景连续性', score: 89 },
  { subject: '运镜稳定性', score: 84 },
  { subject: '色彩统一性', score: 87 },
  { subject: '音画同步', score: 90 },
  { subject: '合规风险', score: 78 },
];
