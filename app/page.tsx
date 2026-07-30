"use client";

import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Clock3,
  FileSpreadsheet,
  GraduationCap,
  ImagePlus,
  LayoutDashboard,
  Megaphone,
  MessageCircleMore,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Table2,
  UploadCloud,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type TabKey = "desk" | "study" | "chat" | "affairs" | "schedule";
type ClassInfo = {
  id: string;
  name: string;
  grade: string;
  students: number;
  accent: string;
};
type Lesson = {
  id: string;
  classId: string;
  weekday: number;
  period: number;
  subject: string;
  room: string;
  start: string;
  end: string;
};
type ImportRow = Omit<Lesson, "id" | "start" | "end">;

const weekdays = ["周一", "周二", "周三", "周四", "周五"];
const periodTimes = [
  ["08:00", "08:40"],
  ["08:50", "09:30"],
  ["10:00", "10:40"],
  ["10:50", "11:30"],
  ["14:00", "14:40"],
  ["14:50", "15:30"],
  ["15:50", "16:30"],
];

const initialClasses: ClassInfo[] = [
  {
    id: "c1",
    name: "五年级 2 班",
    grade: "2026 春季",
    students: 42,
    accent: "#315B4B",
  },
  {
    id: "c2",
    name: "五年级 5 班",
    grade: "2026 春季",
    students: 40,
    accent: "#E07A4F",
  },
  {
    id: "c3",
    name: "六年级 1 班",
    grade: "2026 春季",
    students: 38,
    accent: "#5367A9",
  },
];

const lessonSeed: Array<Omit<Lesson, "id" | "start" | "end">> = [
  { classId: "c1", weekday: 1, period: 1, subject: "数学", room: "五（2）班" },
  { classId: "c1", weekday: 1, period: 3, subject: "语文", room: "五（2）班" },
  { classId: "c1", weekday: 2, period: 4, subject: "数学", room: "五（2）班" },
  { classId: "c1", weekday: 3, period: 2, subject: "数学", room: "五（2）班" },
  { classId: "c1", weekday: 3, period: 6, subject: "体育", room: "操场" },
  { classId: "c1", weekday: 4, period: 3, subject: "科学", room: "实验室" },
  { classId: "c1", weekday: 5, period: 1, subject: "数学", room: "五（2）班" },
  { classId: "c2", weekday: 1, period: 3, subject: "数学", room: "五（5）班" },
  { classId: "c2", weekday: 1, period: 5, subject: "英语", room: "五（5）班" },
  { classId: "c2", weekday: 2, period: 1, subject: "数学", room: "五（5）班" },
  { classId: "c2", weekday: 2, period: 5, subject: "美术", room: "美术室" },
  { classId: "c2", weekday: 3, period: 4, subject: "数学", room: "五（5）班" },
  { classId: "c2", weekday: 4, period: 2, subject: "数学", room: "五（5）班" },
  { classId: "c2", weekday: 5, period: 3, subject: "语文", room: "五（5）班" },
  { classId: "c3", weekday: 1, period: 5, subject: "数学", room: "六（1）班" },
  { classId: "c3", weekday: 2, period: 3, subject: "数学", room: "六（1）班" },
  { classId: "c3", weekday: 2, period: 6, subject: "英语", room: "六（1）班" },
  { classId: "c3", weekday: 3, period: 1, subject: "数学", room: "六（1）班" },
  { classId: "c3", weekday: 4, period: 4, subject: "数学", room: "六（1）班" },
  { classId: "c3", weekday: 5, period: 2, subject: "数学", room: "六（1）班" },
];

const initialLessons: Lesson[] = lessonSeed.map((lesson, index) => ({
  ...lesson,
  id: `lesson-${index}`,
  start: periodTimes[lesson.period - 1][0],
  end: periodTimes[lesson.period - 1][1],
}));

const navItems: Array<{
  key: TabKey;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { key: "desk", label: "工作台", icon: LayoutDashboard },
  { key: "study", label: "学情管理", icon: GraduationCap },
  { key: "chat", label: "沟通中心", icon: MessageCircleMore },
  { key: "affairs", label: "班级事务", icon: CalendarDays },
  { key: "schedule", label: "我的课表", icon: Table2 },
];

const subjectClass: Record<string, string> = {
  数学: "math",
  语文: "chinese",
  英语: "english",
  体育: "sports",
  科学: "science",
  美术: "art",
};

const normalizeWeekday = (value: unknown) => {
  const text = String(value ?? "").trim();
  const chinese = ["一", "二", "三", "四", "五"];
  const direct = Number(text.replace(/[^\d]/g, ""));
  if (direct >= 1 && direct <= 5) return direct;
  const matched = chinese.findIndex((day) => text.includes(day));
  return matched >= 0 ? matched + 1 : 1;
};

const normalizePeriod = (value: unknown) => {
  const period = Number(String(value ?? "").replace(/[^\d]/g, ""));
  return period >= 1 && period <= 7 ? period : 1;
};

function parseDelimitedText(text: string) {
  const source = text.replace(/^\uFEFF/, "");
  return source
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const delimiter = line.includes("\t") ? "\t" : ",";
      const cells: string[] = [];
      let value = "";
      let quoted = false;
      for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (character === '"') {
          if (quoted && line[index + 1] === '"') {
            value += '"';
            index += 1;
          } else {
            quoted = !quoted;
          }
        } else if (character === delimiter && !quoted) {
          cells.push(value.trim());
          value = "";
        } else {
          value += character;
        }
      }
      cells.push(value.trim());
      return cells;
    });
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDate(date: Date) {
  const datePart = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
  }).format(date);
  const day = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][
    date.getDay()
  ];
  return `${datePart} · ${day}`;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("desk");
  const [classes, setClasses] = useState(initialClasses);
  const [activeClassId, setActiveClassId] = useState("c1");
  const [lessons, setLessons] = useState(initialLessons);
  const [now, setNow] = useState(new Date());
  const [classSheetOpen, setClassSheetOpen] = useState(false);
  const [editClassId, setEditClassId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState("");

  const activeClass = classes.find((item) => item.id === activeClassId) ?? classes[0];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const openRename = (classInfo: ClassInfo) => {
    setEditClassId(classInfo.id);
    setEditName(classInfo.name);
  };

  const commitRename = () => {
    const nextName = editName.trim();
    if (!editClassId || !nextName) return;
    setClasses((items) =>
      items.map((item) => (item.id === editClassId ? { ...item, name: nextName } : item)),
    );
    setEditClassId(null);
    showToast("班级名称已更新");
  };

  return (
    <main className="app-stage">
      <div className="phone-shell">
        <header className="top-header">
          <div className="top-line">
            <button
              className="class-trigger"
              type="button"
              onClick={() => setClassSheetOpen(true)}
              aria-label="切换班级"
            >
              <span>{activeClass.name}</span>
              <ChevronDown size={16} strokeWidth={2.5} />
            </button>
            <div className="header-actions">
              <button
                className="icon-button"
                type="button"
                aria-label="搜索"
                onClick={() => showToast("搜索功能已唤起")}
              >
                <Search size={19} />
              </button>
              <button
                className="icon-button has-dot"
                type="button"
                aria-label="通知"
                onClick={() => showToast("你有 3 条新通知")}
              >
                <Bell size={19} />
              </button>
            </div>
          </div>
          <div className="date-line">
            <span>{formatDate(now)}</span>
            <span className="live-time">
              <i aria-hidden="true" />
              {formatClock(now)}
            </span>
          </div>
        </header>

        <div className="page-scroll">
          {activeTab === "desk" && (
            <Dashboard
              activeClass={activeClass}
              lessons={lessons}
              onNavigate={setActiveTab}
              showToast={showToast}
            />
          )}
          {activeTab === "study" && <StudyView activeClass={activeClass} showToast={showToast} />}
          {activeTab === "chat" && <ChatView activeClass={activeClass} showToast={showToast} />}
          {activeTab === "affairs" && <AffairsView activeClass={activeClass} showToast={showToast} />}
          {activeTab === "schedule" && (
            <ScheduleView
              activeClass={activeClass}
              classes={classes}
              lessons={lessons}
              onOpenImport={() => setImportOpen(true)}
              showToast={showToast}
            />
          )}
        </div>

        <nav className="bottom-nav" aria-label="主要导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                type="button"
                key={item.key}
                className={active ? "nav-item active" : "nav-item"}
                onClick={() => setActiveTab(item.key)}
              >
                <span className="nav-icon-wrap">
                  <Icon size={21} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {classSheetOpen && (
          <div className="modal-layer" role="presentation" onMouseDown={() => setClassSheetOpen(false)}>
            <section
              className="bottom-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="选择班级"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="sheet-handle" />
              <div className="sheet-heading">
                <div>
                  <p className="eyebrow">我的班级</p>
                  <h2>切换班级</h2>
                </div>
                <button className="icon-button soft" onClick={() => setClassSheetOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="class-list">
                {classes.map((classInfo) => (
                  <div
                    className={
                      activeClassId === classInfo.id ? "class-choice selected" : "class-choice"
                    }
                    key={classInfo.id}
                  >
                    <button
                      className="class-choice-main"
                      type="button"
                      onClick={() => {
                        setActiveClassId(classInfo.id);
                        setClassSheetOpen(false);
                        showToast(`已切换至 ${classInfo.name}`);
                      }}
                    >
                      <span
                        className="class-avatar"
                        style={{ backgroundColor: classInfo.accent }}
                      >
                        {classInfo.name.replace(/[^\d]/g, "").slice(-1)}
                      </span>
                      <span>
                        <b>{classInfo.name}</b>
                        <small>
                          {classInfo.grade} · {classInfo.students} 名学生
                        </small>
                      </span>
                    </button>
                    <button
                      className="rename-button"
                      type="button"
                      aria-label={`修改${classInfo.name}`}
                      onClick={() => openRename(classInfo)}
                    >
                      <PencilLine size={17} />
                    </button>
                    {activeClassId === classInfo.id && <Check size={18} className="choice-check" />}
                  </div>
                ))}
              </div>
              <button
                className="add-class-button"
                type="button"
                onClick={() => showToast("新建班级功能已准备好")}
              >
                <Plus size={18} />
                新建班级
              </button>
            </section>
          </div>
        )}

        {editClassId && (
          <div className="modal-layer centered">
            <section className="dialog-card" role="dialog" aria-modal="true" aria-label="修改班级名称">
              <div className="dialog-icon">
                <PencilLine size={20} />
              </div>
              <h3>修改班级名称</h3>
              <p>名称将同步显示在工作台与课表中。</p>
              <input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && commitRename()}
                autoFocus
                maxLength={20}
              />
              <div className="dialog-actions">
                <button className="button ghost" onClick={() => setEditClassId(null)}>
                  取消
                </button>
                <button className="button primary" onClick={commitRename}>
                  保存修改
                </button>
              </div>
            </section>
          </div>
        )}

        {importOpen && (
          <ImportSheet
            classes={classes}
            activeClass={activeClass}
            onClose={() => setImportOpen(false)}
            onImport={(rows) => {
              const imported: Lesson[] = rows.map((row, index) => ({
                ...row,
                id: `imported-${Date.now()}-${index}`,
                start: periodTimes[row.period - 1][0],
                end: periodTimes[row.period - 1][1],
              }));
              setLessons((items) => [...items, ...imported]);
              setImportOpen(false);
              showToast(`已导入 ${imported.length} 节课程，课表已更新`);
            }}
          />
        )}

        {toast && (
          <div className="toast" role="status">
            <Check size={16} />
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}

function Dashboard({
  activeClass,
  lessons,
  onNavigate,
  showToast,
}: {
  activeClass: ClassInfo;
  lessons: Lesson[];
  onNavigate: (tab: TabKey) => void;
  showToast: (message: string) => void;
}) {
  const classLessons = lessons
    .filter((lesson) => lesson.classId === activeClass.id && lesson.weekday === 1)
    .sort((a, b) => a.period - b.period)
    .slice(0, 3);

  return (
    <div className="page-content dashboard">
      <section className="greeting">
        <div>
          <p className="eyebrow">早上好，严老师</p>
          <h1>今天也一起，<br />照看好每一次成长。</h1>
        </div>
        <span className="sun-orbit" aria-hidden="true">
          <span>☀</span>
        </span>
      </section>

      <section className="hero-card">
        <div className="hero-title">
          <span className="hero-icon">
            <UsersRound size={21} />
          </span>
          <div>
            <small>班级今日概览</small>
            <strong>{activeClass.name}</strong>
          </div>
          <button type="button" onClick={() => showToast("班级日报已打开")}>
            查看日报
            <ChevronRight size={15} />
          </button>
        </div>
        <div className="metric-row">
          <div>
            <strong>{activeClass.students - 1}</strong>
            <span>已到</span>
          </div>
          <i />
          <div>
            <strong className="warning-number">1</strong>
            <span>请假</span>
          </div>
          <i />
          <div>
            <strong>96%</strong>
            <span>作业提交</span>
          </div>
        </div>
        <div className="hero-note">
          <Sparkles size={15} />
          <span>班级状态良好，李欣怡的作业仍待提交</span>
          <ChevronRight size={15} />
        </div>
      </section>

      <SectionTitle title="快捷工作" action="自定义" onAction={() => showToast("快捷工作可自定义")} />
      <section className="quick-grid">
        {[
          { icon: Check, label: "考勤点名", sub: "1 人请假", color: "green" },
          { icon: BookOpen, label: "布置作业", sub: "2 项进行中", color: "orange" },
          { icon: MessageCircleMore, label: "家校通知", sub: "3 条待回复", color: "blue" },
          { icon: CircleEllipsis, label: "更多应用", sub: "全部服务", color: "sand" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              className="quick-card"
              type="button"
              key={item.label}
              onClick={() => showToast(`${item.label}已打开`)}
            >
              <span className={`quick-icon ${item.color}`}>
                <Icon size={21} />
              </span>
              <b>{item.label}</b>
              <small>{item.sub}</small>
            </button>
          );
        })}
      </section>

      <SectionTitle
        title="今日课程"
        action="查看课表"
        onAction={() => onNavigate("schedule")}
      />
      <section className="timeline-card">
        {classLessons.length ? (
          classLessons.map((lesson, index) => (
            <div className="timeline-item" key={lesson.id}>
              <div className="timeline-time">
                <b>{lesson.start}</b>
                <span>{lesson.end}</span>
              </div>
              <div className="timeline-track">
                <i className={subjectClass[lesson.subject] ?? "default"} />
                {index !== classLessons.length - 1 && <span />}
              </div>
              <div className="timeline-info">
                <b>{lesson.subject}</b>
                <span>
                  第 {lesson.period} 节 · {lesson.room}
                </span>
              </div>
              {index === 0 ? (
                <em>下一节</em>
              ) : (
                <button type="button" onClick={() => showToast("课程详情已打开")}>
                  <MoreHorizontal size={18} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="empty-inline">今天暂无课程，适合安排一次班级共读。</div>
        )}
      </section>

      <SectionTitle title="待办提醒" action="全部 4 项" onAction={() => showToast("全部待办已展开")} />
      <section className="todo-list">
        <button type="button" onClick={() => showToast("已进入作业批改")}>
          <span className="todo-date peach">
            <b>今</b>
            <small>16:30</small>
          </span>
          <span className="todo-copy">
            <b>批改《分数加减法》课堂练习</b>
            <small>还剩 12 份未批改</small>
          </span>
          <ChevronRight size={18} />
        </button>
        <button type="button" onClick={() => showToast("家长会提醒已打开")}>
          <span className="todo-date mint">
            <b>31</b>
            <small>周五</small>
          </span>
          <span className="todo-copy">
            <b>线上家长会</b>
            <small>五年级 2 班 · 19:30</small>
          </span>
          <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
}

function StudyView({
  activeClass,
  showToast,
}: {
  activeClass: ClassInfo;
  showToast: (message: string) => void;
}) {
  return (
    <div className="page-content inner-page">
      <PageHeading eyebrow={activeClass.name} title="学情管理" subtitle="用数据看见每位学生的进步" />
      <section className="learning-hero">
        <div>
          <span>本周学习指数</span>
          <strong>87.6</strong>
          <small>
            <i>↑ 4.2%</i> 较上周
          </small>
        </div>
        <div className="score-ring">
          <div>
            <b>A</b>
            <span>良好</span>
          </div>
        </div>
      </section>
      <section className="split-metrics">
        <button onClick={() => showToast("已查看正确率趋势")}>
          <span className="mini-chart bars">
            <i /><i /><i /><i /><i />
          </span>
          <b>84.5%</b>
          <small>平均正确率</small>
        </button>
        <button onClick={() => showToast("已查看作业完成情况")}>
          <span className="mini-chart line">⌁</span>
          <b>39 / 42</b>
          <small>按时完成人数</small>
        </button>
      </section>
      <SectionTitle title="重点关注" action="查看全部" onAction={() => showToast("学生列表已展开")} />
      <section className="student-list">
        {[
          ["林子涵", "计算题正确率连续下降", "需关注", "林"],
          ["李欣怡", "2 项作业待补交", "待跟进", "李"],
          ["陈嘉树", "应用题进步明显", "有进步", "陈"],
        ].map(([name, sub, tag, avatar], index) => (
          <button key={name} onClick={() => showToast(`${name}的学情档案已打开`)}>
            <span className={`student-avatar avatar-${index}`}>{avatar}</span>
            <span>
              <b>{name}</b>
              <small>{sub}</small>
            </span>
            <em className={index === 2 ? "positive" : ""}>{tag}</em>
          </button>
        ))}
      </section>
      <SectionTitle title="知识点掌握" action="本单元" onAction={() => showToast("单元筛选已打开")} />
      <section className="mastery-card">
        {[
          ["分数的意义", 92],
          ["分数加减法", 84],
          ["约分与通分", 71],
        ].map(([label, score]) => (
          <div key={String(label)}>
            <span>
              <b>{label}</b>
              <em>{score}%</em>
            </span>
            <i>
              <span style={{ width: `${score}%` }} />
            </i>
          </div>
        ))}
      </section>
    </div>
  );
}

function ChatView({
  activeClass,
  showToast,
}: {
  activeClass: ClassInfo;
  showToast: (message: string) => void;
}) {
  return (
    <div className="page-content inner-page">
      <PageHeading eyebrow={activeClass.name} title="沟通中心" subtitle="重要消息，一处集中处理" />
      <div className="segmented-control">
        <button className="active">家校沟通 <i>3</i></button>
        <button onClick={() => showToast("班级群组已切换")}>班级群组</button>
        <button onClick={() => showToast("通知回执已切换")}>通知回执</button>
      </div>
      <section className="message-list">
        {[
          {
            name: "李欣怡妈妈",
            time: "10:24",
            message: "严老师您好，欣怡今天的作业晚一点补交……",
            unread: 2,
            avatar: "李",
            tone: "coral",
          },
          {
            name: "林子涵爸爸",
            time: "昨天",
            message: "好的，谢谢老师的耐心指导！",
            unread: 0,
            avatar: "林",
            tone: "blue",
          },
          {
            name: "五年级数学教研组",
            time: "昨天",
            message: "王老师：[文件] 期末复习计划初稿.xlsx",
            unread: 1,
            avatar: "数",
            tone: "green",
          },
          {
            name: "陈嘉树妈妈",
            time: "周二",
            message: "这周孩子做题主动多了，感谢老师鼓励。",
            unread: 0,
            avatar: "陈",
            tone: "sand",
          },
        ].map((item) => (
          <button key={item.name} type="button" onClick={() => showToast(`正在打开与${item.name}的对话`)}>
            <span className={`message-avatar ${item.tone}`}>{item.avatar}</span>
            <span className="message-copy">
              <span>
                <b>{item.name}</b>
                <time>{item.time}</time>
              </span>
              <small>{item.message}</small>
            </span>
            {item.unread > 0 && <em>{item.unread}</em>}
          </button>
        ))}
      </section>
      <button className="floating-compose" type="button" onClick={() => showToast("新建消息")}>
        <PencilLine size={20} />
      </button>
    </div>
  );
}

function AffairsView({
  activeClass,
  showToast,
}: {
  activeClass: ClassInfo;
  showToast: (message: string) => void;
}) {
  return (
    <div className="page-content inner-page">
      <PageHeading eyebrow={activeClass.name} title="班级事务" subtitle="把零碎日常，安排得井井有条" />
      <section className="affair-feature">
        <div>
          <span>本周班级值日</span>
          <h2>第三小组</h2>
          <p>组长：陈嘉树 · 共 7 人</p>
        </div>
        <span className="broom-graphic">✦</span>
        <button onClick={() => showToast("值日安排已打开")}>查看安排 <ChevronRight size={15} /></button>
      </section>
      <section className="affair-grid">
        {[
          { icon: Megaphone, title: "班级通知", sub: "2 条进行中", color: "peach" },
          { icon: CalendarDays, title: "活动报名", sub: "春游 · 35/42", color: "mint" },
          { icon: UsersRound, title: "座位管理", sub: "上次调整 7天前", color: "lilac" },
          { icon: BookOpen, title: "班级相册", sub: "本周新增 28 张", color: "cream" },
        ].map(({ icon: CardIcon, title, sub, color }) => {
          return (
            <button key={title} onClick={() => showToast(`${title}已打开`)}>
              <span className={`affair-icon ${color}`}><CardIcon size={21} /></span>
              <b>{title}</b>
              <small>{sub}</small>
              <ChevronRight size={17} />
            </button>
          );
        })}
      </section>
      <SectionTitle title="近期事项" action="新建" onAction={() => showToast("新建班级事项")} />
      <section className="event-list">
        {[
          ["31", "五", "线上家长会", "19:30 · 腾讯会议", "重要"],
          ["04", "二", "春季研学报名截止", "需收齐 42 份回执", "进行中"],
          ["08", "六", "班级图书角整理", "第三小组负责", "待开始"],
        ].map(([date, day, title, sub, status], index) => (
          <button key={title} onClick={() => showToast(`${title}详情已打开`)}>
            <span className={index === 0 ? "event-date active" : "event-date"}>
              <b>{date}</b><small>周{day}</small>
            </span>
            <span><b>{title}</b><small>{sub}</small></span>
            <em>{status}</em>
          </button>
        ))}
      </section>
    </div>
  );
}

function ScheduleView({
  activeClass,
  classes,
  lessons,
  onOpenImport,
  showToast,
}: {
  activeClass: ClassInfo;
  classes: ClassInfo[];
  lessons: Lesson[];
  onOpenImport: () => void;
  showToast: (message: string) => void;
}) {
  const [view, setView] = useState<"mine" | "class">("mine");
  const [weekOffset, setWeekOffset] = useState(0);
  const selectedLessons = useMemo(
    () =>
      (view === "mine"
        ? lessons.filter((lesson) => lesson.subject.includes("数学"))
        : lessons.filter((lesson) => lesson.classId === activeClass.id)
      ).sort((a, b) => a.period - b.period),
    [activeClass.id, lessons, view],
  );

  const lessonAt = (weekday: number, period: number) =>
    selectedLessons.find((lesson) => lesson.weekday === weekday && lesson.period === period);

  const getClass = (classId: string) => classes.find((item) => item.id === classId);

  return (
    <div className="page-content inner-page schedule-page">
      <PageHeading
        eyebrow="多班课表"
        title="我的课表"
        subtitle="所有任教班级，一张表看清"
        action={
          <button className="import-button" type="button" onClick={onOpenImport}>
            <UploadCloud size={17} />
            导入
          </button>
        }
      />
      <div className="schedule-switch">
        <button className={view === "mine" ? "active" : ""} onClick={() => setView("mine")}>
          我的数学课表
        </button>
        <button className={view === "class" ? "active" : ""} onClick={() => setView("class")}>
          {activeClass.name}全课表
        </button>
      </div>
      <section className="week-control">
        <button onClick={() => setWeekOffset((value) => value - 1)} aria-label="上一周">
          <ChevronLeft size={19} />
        </button>
        <div>
          <b>{weekOffset === 0 ? "本周" : weekOffset > 0 ? `${weekOffset} 周后` : `${Math.abs(weekOffset)} 周前`}</b>
          <small>7月27日 — 7月31日</small>
        </div>
        <button onClick={() => setWeekOffset((value) => value + 1)} aria-label="下一周">
          <ChevronRight size={19} />
        </button>
      </section>

      {view === "mine" && (
        <div className="smart-note">
          <span><Sparkles size={16} /></span>
          <p>
            已从 <b>{classes.length} 个班级</b> 自动汇总 {selectedLessons.length} 节数学课
          </p>
          <button onClick={() => showToast("汇总规则：课程名称包含“数学”")}>
            <Settings2 size={16} />
          </button>
        </div>
      )}

      <section className="schedule-board">
        <div className="schedule-grid header-row">
          <div className="corner-cell">节次</div>
          {weekdays.map((day, index) => (
            <div key={day} className={index === 2 ? "today" : ""}>
              <b>{day}</b>
              <small>{27 + index}</small>
            </div>
          ))}
        </div>
        <div className="schedule-scroll">
          {[1, 2, 3, 4, 5, 6, 7].map((period) => (
            <div className="schedule-grid lesson-row" key={period}>
              <div className="period-cell">
                <b>{period}</b>
                <small>{periodTimes[period - 1][0]}</small>
              </div>
              {[1, 2, 3, 4, 5].map((weekday) => {
                const lesson = lessonAt(weekday, period);
                const classInfo = lesson ? getClass(lesson.classId) : null;
                return (
                  <button
                    key={weekday}
                    className={lesson ? `lesson-cell ${subjectClass[lesson.subject] ?? "default"}` : "lesson-cell empty"}
                    type="button"
                    onClick={() =>
                      lesson &&
                      showToast(`${weekdays[weekday - 1]}第 ${period} 节 · ${lesson.subject} · ${lesson.room}`)
                    }
                  >
                    {lesson && (
                      <>
                        <b>{lesson.subject}</b>
                        <span>{view === "mine" ? classInfo?.name.replace("年级 ", "") : lesson.room}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      <div className="schedule-legend">
        <span><i className="math" /> 数学</span>
        <span><i className="chinese" /> 语文</span>
        <span><i className="english" /> 英语</span>
        <button onClick={() => showToast("课表可导出为 PNG 或 Excel")}>
          导出课表
        </button>
      </div>
    </div>
  );
}

function ImportSheet({
  classes,
  activeClass,
  onClose,
  onImport,
}: {
  classes: ClassInfo[];
  activeClass: ClassInfo;
  onClose: () => void;
  onImport: (rows: ImportRow[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<"image" | "sheet" | null>(null);
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const getClassId = (value: unknown) => {
    const text = String(value ?? "").trim();
    return (
      classes.find((item) => text.includes(item.name) || item.name.includes(text))?.id ??
      activeClass.id
    );
  };

  const parseRows = (rows: unknown[][]) => {
    if (!rows.length) return [];
    const headers = rows[0].map((item) => String(item ?? "").trim());
    const findColumn = (names: string[]) =>
      headers.findIndex((header) => names.some((name) => header.includes(name)));
    const classColumn = findColumn(["班级", "授课班"]);
    const weekdayColumn = findColumn(["星期", "周"]);
    const periodColumn = findColumn(["节次", "课次", "第几节"]);
    const subjectColumn = findColumn(["课程", "科目", "学科"]);
    const roomColumn = findColumn(["教室", "地点", "上课地点"]);
    if (weekdayColumn < 0 || periodColumn < 0 || subjectColumn < 0) {
      throw new Error("未识别到“星期 / 节次 / 课程”列");
    }
    return rows
      .slice(1)
      .filter((row) => row.some((cell) => String(cell ?? "").trim()))
      .map((row) => ({
        classId: classColumn >= 0 ? getClassId(row[classColumn]) : activeClass.id,
        weekday: normalizeWeekday(row[weekdayColumn]),
        period: normalizePeriod(row[periodColumn]),
        subject: String(row[subjectColumn] ?? "课程").trim() || "课程",
        room: roomColumn >= 0 ? String(row[roomColumn] ?? "").trim() : activeClass.name,
      }))
      .slice(0, 40);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setFileName(file.name);
    setProcessing(true);
    try {
      if (file.type.startsWith("image/")) {
        setFileType("image");
        setPreview([
          { classId: activeClass.id, weekday: 1, period: 2, subject: "数学", room: activeClass.name },
          { classId: activeClass.id, weekday: 2, period: 4, subject: "数学", room: activeClass.name },
          { classId: activeClass.id, weekday: 4, period: 1, subject: "数学", room: activeClass.name },
        ]);
      } else {
        setFileType("sheet");
        const rawRows = /\.csv$/i.test(file.name)
          ? parseDelimitedText(await file.text())
          : await (async () => {
              const XLSX = await import("xlsx");
              const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
              const sheet = workbook.Sheets[workbook.SheetNames[0]];
              return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
                header: 1,
                defval: "",
              });
            })();
        const parsed = parseRows(rawRows);
        if (!parsed.length) throw new Error("文件中没有可导入的课程");
        setPreview(parsed);
      }
    } catch (caught) {
      setPreview([]);
      setError(caught instanceof Error ? caught.message : "文件解析失败，请检查格式");
    } finally {
      setProcessing(false);
    }
  };

  const updatePreview = (index: number, field: keyof ImportRow, value: string | number) => {
    setPreview((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
  };

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="bottom-sheet import-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="导入课表"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-heading">
          <div>
            <p className="eyebrow">智能生成</p>
            <h2>导入班级课表</h2>
          </div>
          <button className="icon-button soft" onClick={onClose}><X size={20} /></button>
        </div>
        {!fileName ? (
          <>
            <button className="upload-zone" type="button" onClick={() => inputRef.current?.click()}>
              <span><UploadCloud size={25} /></span>
              <b>选择课表文件</b>
              <small>支持图片、Excel、CSV，单个文件不超过 10MB</small>
            </button>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/*,.xlsx,.xls,.csv"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <div className="import-options">
              <button onClick={() => inputRef.current?.click()}>
                <ImagePlus size={20} />
                <span><b>拍照 / 图片</b><small>上传后核对识别草稿</small></span>
                <ChevronRight size={17} />
              </button>
              <button onClick={() => inputRef.current?.click()}>
                <FileSpreadsheet size={20} />
                <span><b>Excel / CSV</b><small>自动匹配班级和节次</small></span>
                <ChevronRight size={17} />
              </button>
            </div>
            <div className="format-tip">
              <Sparkles size={16} />
              <span>文档首行建议包含：班级、星期、节次、课程、地点。</span>
            </div>
          </>
        ) : (
          <>
            <div className="file-summary">
              <span className={fileType === "image" ? "image" : "sheet"}>
                {fileType === "image" ? <ImagePlus size={20} /> : <FileSpreadsheet size={20} />}
              </span>
              <div>
                <b>{fileName}</b>
                <small>{processing ? "正在解析…" : `已生成 ${preview.length} 条课程草稿`}</small>
              </div>
              <button
                onClick={() => {
                  setFileName("");
                  setFileType(null);
                  setPreview([]);
                  setError("");
                }}
              >
                重新选择
              </button>
            </div>
            {fileType === "image" && !processing && !error && (
              <p className="image-disclaimer">图片已载入。以下为可编辑识别草稿，请核对后导入。</p>
            )}
            {error && <div className="import-error">{error}</div>}
            {!!preview.length && (
              <div className="preview-table">
                <div className="preview-head"><span>班级</span><span>星期</span><span>节次</span><span>课程</span></div>
                {preview.map((row, index) => (
                  <div className="preview-row" key={`${row.classId}-${index}`}>
                    <select value={row.classId} onChange={(e) => updatePreview(index, "classId", e.target.value)}>
                      {classes.map((item) => <option key={item.id} value={item.id}>{item.name.replace("年级 ", "")}</option>)}
                    </select>
                    <select value={row.weekday} onChange={(e) => updatePreview(index, "weekday", Number(e.target.value))}>
                      {weekdays.map((day, dayIndex) => <option key={day} value={dayIndex + 1}>{day}</option>)}
                    </select>
                    <select value={row.period} onChange={(e) => updatePreview(index, "period", Number(e.target.value))}>
                      {periodTimes.map((_, periodIndex) => <option key={periodIndex} value={periodIndex + 1}>{periodIndex + 1}</option>)}
                    </select>
                    <input value={row.subject} onChange={(e) => updatePreview(index, "subject", e.target.value)} />
                  </div>
                ))}
              </div>
            )}
            <button
              className="button primary full"
              type="button"
              disabled={processing || !preview.length}
              onClick={() => onImport(preview)}
            >
              <Sparkles size={17} />
              确认导入并生成课表
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <button type="button" onClick={onAction}>
        {action}
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      {action}
    </div>
  );
}
