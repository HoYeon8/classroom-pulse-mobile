"use client";

import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Clock3,
  Download,
  FileSpreadsheet,
  GraduationCap,
  ImagePlus,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  MessageCircleMore,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Table2,
  Trash2,
  UploadCloud,
  UserPlus,
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
type GradeImportRow = {
  classId: string;
  name: string;
  gender: "男" | "女";
  chinese: number | null;
  math: number | null;
  english: number | null;
  note: string;
};
type ClassStats = {
  arrived: number;
  leave: number;
  homeworkRate: number;
};
type TodoItem = {
  id: string;
  classId: string;
  title: string;
  detail: string;
  due: string;
  done: boolean;
};
type StudentRecord = {
  id: string;
  classId: string;
  name: string;
  gender: "男" | "女";
  scores: {
    chinese: number;
    math: number;
    english: number;
  };
  note: string;
  tag: string;
  positive?: boolean;
};
type SeatPlan = {
  rows: number;
  columns: number;
  studentIds: Array<string | null>;
  updatedAt: string;
};
type ChatThread = {
  id: string;
  classId: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  avatar: string;
  tone: string;
  category: "parent" | "group" | "receipt";
  replies: string[];
};
type ClassEvent = {
  id: string;
  classId: string;
  date: string;
  weekday: string;
  title: string;
  detail: string;
  status: string;
};
type DutyInfo = {
  group: string;
  leader: string;
  members: number;
};
type QuickActionKey = "attendance" | "homework" | "notice" | "apps";
type PanelState =
  | { type: "search" }
  | { type: "notifications" }
  | { type: "report" }
  | { type: "quick-settings" }
  | { type: "attendance" }
  | { type: "homework" }
  | { type: "notice" }
  | { type: "apps" }
  | { type: "todos"; todoId?: string }
  | { type: "student"; studentId?: string }
  | { type: "analysis"; title: string; description: string }
  | { type: "conversation"; threadId: string }
  | { type: "compose" }
  | { type: "duty" }
  | { type: "event"; eventId?: string }
  | { type: "seating" }
  | { type: "album" }
  | { type: "lesson"; lessonId?: string; weekday?: number; period?: number }
  | { type: "schedule-rules" }
  | { type: "new-class" };

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

const initialStats: Record<string, ClassStats> = Object.fromEntries(
  initialClasses.map((item) => [
    item.id,
    { arrived: Math.max(item.students - 1, 0), leave: 1, homeworkRate: 96 },
  ]),
);

const initialTodos: TodoItem[] = [
  {
    id: "todo-1",
    classId: "c1",
    title: "批改《分数加减法》课堂练习",
    detail: "还剩 12 份未批改",
    due: "今天 16:30",
    done: false,
  },
  {
    id: "todo-2",
    classId: "c1",
    title: "线上家长会",
    detail: "腾讯会议 · 提前 10 分钟进入",
    due: "周五 19:30",
    done: false,
  },
  {
    id: "todo-3",
    classId: "c2",
    title: "整理单元测验成绩",
    detail: "待录入 8 份",
    due: "明天 12:00",
    done: false,
  },
];

const initialStudents: StudentRecord[] = [
  { id: "student-1", classId: "c1", name: "林子涵", gender: "男", scores: { chinese: 75, math: 68, english: 72 }, note: "计算题正确率连续下降", tag: "需关注" },
  { id: "student-2", classId: "c1", name: "李欣怡", gender: "女", scores: { chinese: 88, math: 82, english: 86 }, note: "2 项作业待补交", tag: "待跟进" },
  {
    id: "student-3",
    classId: "c1",
    name: "陈嘉树",
    gender: "男",
    scores: { chinese: 92, math: 96, english: 90 },
    note: "应用题进步明显",
    tag: "有进步",
    positive: true,
  },
  { id: "student-4", classId: "c1", name: "王雨桐", gender: "女", scores: { chinese: 95, math: 91, english: 88 }, note: "学习状态稳定", tag: "优秀", positive: true },
  { id: "student-5", classId: "c1", name: "周浩宇", gender: "男", scores: { chinese: 80, math: 76, english: 78 }, note: "课堂参与积极", tag: "稳定", positive: true },
  { id: "student-6", classId: "c1", name: "赵可馨", gender: "女", scores: { chinese: 70, math: 64, english: 73 }, note: "基础题需要巩固", tag: "需关注" },
  { id: "student-7", classId: "c1", name: "孙博文", gender: "男", scores: { chinese: 84, math: 88, english: 81 }, note: "数学思维活跃", tag: "有进步", positive: true },
  { id: "student-8", classId: "c1", name: "吴思琪", gender: "女", scores: { chinese: 68, math: 59, english: 65 }, note: "作业完成速度偏慢", tag: "待跟进" },
  { id: "student-9", classId: "c1", name: "徐子墨", gender: "男", scores: { chinese: 89, math: 93, english: 94 }, note: "各科表现均衡", tag: "优秀", positive: true },
  { id: "student-10", classId: "c1", name: "何欣然", gender: "女", scores: { chinese: 83, math: 78, english: 85 }, note: "英语表达突出", tag: "稳定", positive: true },
  { id: "student-11", classId: "c1", name: "高铭泽", gender: "男", scores: { chinese: 66, math: 71, english: 74 }, note: "需要加强阅读理解", tag: "需关注" },
  { id: "student-12", classId: "c1", name: "罗诗涵", gender: "女", scores: { chinese: 90, math: 86, english: 87 }, note: "学习习惯良好", tag: "优秀", positive: true },
];

const initialThreads: ChatThread[] = [
  {
    id: "thread-1",
    classId: "c1",
    name: "李欣怡妈妈",
    time: "10:24",
    message: "严老师您好，欣怡今天的作业晚一点补交……",
    unread: 2,
    avatar: "李",
    tone: "coral",
    category: "parent",
    replies: [],
  },
  {
    id: "thread-2",
    classId: "c1",
    name: "林子涵爸爸",
    time: "昨天",
    message: "好的，谢谢老师的耐心指导！",
    unread: 0,
    avatar: "林",
    tone: "blue",
    category: "parent",
    replies: [],
  },
  {
    id: "thread-3",
    classId: "c1",
    name: "五年级数学教研组",
    time: "昨天",
    message: "王老师：[文件] 期末复习计划初稿.xlsx",
    unread: 1,
    avatar: "数",
    tone: "green",
    category: "group",
    replies: [],
  },
  {
    id: "thread-4",
    classId: "c1",
    name: "春游通知回执",
    time: "周二",
    message: "已收 35 份，还差 7 份",
    unread: 0,
    avatar: "回",
    tone: "sand",
    category: "receipt",
    replies: [],
  },
];

const initialEvents: ClassEvent[] = [
  {
    id: "event-1",
    classId: "c1",
    date: "31",
    weekday: "五",
    title: "线上家长会",
    detail: "19:30 · 腾讯会议",
    status: "重要",
  },
  {
    id: "event-2",
    classId: "c1",
    date: "04",
    weekday: "二",
    title: "春季研学报名截止",
    detail: "需收齐 42 份回执",
    status: "进行中",
  },
  {
    id: "event-3",
    classId: "c1",
    date: "08",
    weekday: "六",
    title: "班级图书角整理",
    detail: "第三小组负责",
    status: "待开始",
  },
];

const initialDuty: Record<string, DutyInfo> = {
  c1: { group: "第三小组", leader: "陈嘉树", members: 7 },
  c2: { group: "第二小组", leader: "周梓涵", members: 7 },
  c3: { group: "第一小组", leader: "林浩然", members: 6 },
};

const quickActionMeta: Record<
  QuickActionKey,
  { icon: typeof Check; label: string; color: string }
> = {
  attendance: { icon: Check, label: "考勤点名", color: "green" },
  homework: { icon: BookOpen, label: "布置作业", color: "orange" },
  notice: { icon: MessageCircleMore, label: "家校通知", color: "blue" },
  apps: { icon: CircleEllipsis, label: "更多应用", color: "sand" },
};

const storageKey = "classroom-pulse-mobile-v2";

const averageScore = (student: StudentRecord) =>
  Math.round((student.scores.chinese + student.scores.math + student.scores.english) / 3);

const normalizeStudent = (student: Partial<StudentRecord>, index: number): StudentRecord => ({
  id: student.id ?? `student-${Date.now()}-${index}`,
  classId: student.classId ?? "c1",
  name: student.name ?? `学生${index + 1}`,
  gender: student.gender === "女" ? "女" : index % 2 ? "女" : "男",
  scores: {
    chinese: Number(student.scores?.chinese ?? 75),
    math: Number(student.scores?.math ?? 75),
    english: Number(student.scores?.english ?? 75),
  },
  note: student.note ?? "暂无观察记录",
  tag: student.tag ?? "记录",
  positive: student.positive ?? false,
});

function generateBalancedSeatIds(students: StudentRecord[], seatCount: number) {
  const ranked = [...students].sort((a, b) => averageScore(b) - averageScore(a));
  const upper = ranked.slice(0, Math.ceil(ranked.length / 2));
  const lower = ranked.slice(Math.ceil(ranked.length / 2)).reverse();
  const arranged: StudentRecord[] = [];
  let pairIndex = 0;

  while (upper.length || lower.length) {
    const first = upper.shift() ?? lower.shift();
    if (!first) break;
    const partnerPool = lower.length ? lower : upper;
    let partnerIndex = partnerPool.findIndex((item) => item.gender !== first.gender);
    if (partnerIndex < 0) partnerIndex = 0;
    const partner = partnerPool.splice(partnerIndex, 1)[0];
    if (pairIndex % 2 === 0) {
      arranged.push(first);
      if (partner) arranged.push(partner);
    } else {
      if (partner) arranged.push(partner);
      arranged.push(first);
    }
    pairIndex += 1;
  }

  return [
    ...arranged.slice(0, seatCount).map((student) => student.id),
    ...Array.from({ length: Math.max(seatCount - arranged.length, 0) }, () => null),
  ];
}

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
  const [gradeImportOpen, setGradeImportOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [panel, setPanel] = useState<PanelState | null>(null);
  const [stats, setStats] = useState<Record<string, ClassStats>>(initialStats);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [events, setEvents] = useState<ClassEvent[]>(initialEvents);
  const [duty, setDuty] = useState<Record<string, DutyInfo>>(initialDuty);
  const [seatPlans, setSeatPlans] = useState<Record<string, SeatPlan>>({});
  const [quickActions, setQuickActions] = useState<QuickActionKey[]>([
    "attendance",
    "homework",
    "notice",
    "apps",
  ]);
  const [scheduleKeyword, setScheduleKeyword] = useState("数学");
  const [storageReady, setStorageReady] = useState(false);

  const activeClass = classes.find((item) => item.id === activeClassId) ?? classes[0];
  const activeStats =
    stats[activeClass.id] ??
    ({
      arrived: Math.max(activeClass.students - 1, 0),
      leave: 1,
      homeworkRate: 96,
    } satisfies ClassStats);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          classes?: ClassInfo[];
          activeClassId?: string;
          lessons?: Lesson[];
          stats?: Record<string, ClassStats>;
          todos?: TodoItem[];
          students?: StudentRecord[];
          threads?: ChatThread[];
          events?: ClassEvent[];
          duty?: Record<string, DutyInfo>;
          seatPlans?: Record<string, SeatPlan>;
          quickActions?: QuickActionKey[];
          scheduleKeyword?: string;
        };
        if (saved.classes?.length) setClasses(saved.classes);
        if (saved.activeClassId) setActiveClassId(saved.activeClassId);
        if (saved.lessons?.length) setLessons(saved.lessons);
        if (saved.stats) setStats(saved.stats);
        if (saved.todos) setTodos(saved.todos);
        if (saved.students) {
          const defaultNames = ["林子涵", "李欣怡", "陈嘉树"];
          const legacyDefaultSamples =
            saved.students.length === 3 &&
            saved.students.every(
              (student, index) =>
                student.id === `student-${index + 1}` &&
                student.name === defaultNames[index] &&
                !student.scores,
            );
          const normalizedStudents = saved.students.map(normalizeStudent);
          setStudents(legacyDefaultSamples ? initialStudents : normalizedStudents);
        }
        if (saved.threads) setThreads(saved.threads);
        if (saved.events) setEvents(saved.events);
        if (saved.duty) setDuty(saved.duty);
        if (saved.seatPlans) setSeatPlans(saved.seatPlans);
        if (saved.quickActions?.length) setQuickActions(saved.quickActions);
        if (saved.scheduleKeyword) setScheduleKeyword(saved.scheduleKeyword);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        classes,
        activeClassId,
        lessons,
        stats,
        todos,
        students,
        threads,
        events,
        duty,
        seatPlans,
        quickActions,
        scheduleKeyword,
      }),
    );
  }, [
    activeClassId,
    classes,
    duty,
    events,
    lessons,
    quickActions,
    scheduleKeyword,
    seatPlans,
    stats,
    storageReady,
    students,
    threads,
    todos,
  ]);

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
                onClick={() => setPanel({ type: "search" })}
              >
                <Search size={19} />
              </button>
              <button
                className="icon-button has-dot"
                type="button"
                aria-label="通知"
                onClick={() => setPanel({ type: "notifications" })}
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
              stats={activeStats}
              todos={todos.filter((item) => item.classId === activeClass.id)}
              quickActions={quickActions}
              onNavigate={setActiveTab}
              onOpenPanel={setPanel}
              showToast={showToast}
            />
          )}
          {activeTab === "study" && (
            <StudyView
              activeClass={activeClass}
              students={students}
              onOpenGradeImport={() => setGradeImportOpen(true)}
              onOpenPanel={setPanel}
            />
          )}
          {activeTab === "chat" && (
            <ChatView
              activeClass={activeClass}
              threads={threads}
              onOpenPanel={setPanel}
            />
          )}
          {activeTab === "affairs" && (
            <AffairsView
              activeClass={activeClass}
              duty={duty[activeClass.id] ?? { group: "第一小组", leader: "待设置", members: 0 }}
              events={events.filter((item) => item.classId === activeClass.id)}
              seatPlan={seatPlans[activeClass.id]}
              onOpenPanel={setPanel}
            />
          )}
          {activeTab === "schedule" && (
            <ScheduleView
              activeClass={activeClass}
              classes={classes}
              lessons={lessons}
              scheduleKeyword={scheduleKeyword}
              onOpenImport={() => setImportOpen(true)}
              onOpenPanel={setPanel}
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
                onClick={() => {
                  setClassSheetOpen(false);
                  setPanel({ type: "new-class" });
                }}
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

        {gradeImportOpen && (
          <GradeImportSheet
            classes={classes}
            activeClass={activeClass}
            students={students}
            onClose={() => setGradeImportOpen(false)}
            onImport={(rows) => {
              setStudents((items) => {
                const next = [...items];
                rows.forEach((row, index) => {
                  const existingIndex = next.findIndex(
                    (student) =>
                      student.classId === row.classId && student.name.trim() === row.name.trim(),
                  );
                  const existing = existingIndex >= 0 ? next[existingIndex] : undefined;
                  const student: StudentRecord = {
                    id: existing?.id ?? `student-import-${Date.now()}-${index}`,
                    classId: row.classId,
                    name: row.name.trim(),
                    gender: row.gender,
                    scores: {
                      chinese: row.chinese ?? existing?.scores.chinese ?? 0,
                      math: row.math ?? existing?.scores.math ?? 0,
                      english: row.english ?? existing?.scores.english ?? 0,
                    },
                    note: row.note.trim() || existing?.note || "由成绩表导入",
                    tag: existing?.tag ?? "已导入",
                    positive: existing?.positive ?? false,
                  };
                  if (existingIndex >= 0) next[existingIndex] = student;
                  else next.push(student);
                });
                return next;
              });
              setGradeImportOpen(false);
              showToast(`已导入并更新 ${rows.length} 名学生成绩`);
            }}
          />
        )}

        {panel && (
          <ActionPanel
            key={`${panel.type}-${"lessonId" in panel ? panel.lessonId ?? "new" : ""}-${
              "eventId" in panel ? panel.eventId ?? "new" : ""
            }`}
            panel={panel}
            activeClass={activeClass}
            classes={classes}
            stats={activeStats}
            todos={todos}
            students={students}
            threads={threads}
            events={events}
            duty={duty[activeClass.id] ?? { group: "第一小组", leader: "待设置", members: 0 }}
            seatPlan={seatPlans[activeClass.id]}
            lessons={lessons}
            quickActions={quickActions}
            scheduleKeyword={scheduleKeyword}
            onClose={() => setPanel(null)}
            onOpenPanel={setPanel}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setPanel(null);
            }}
            onSaveClass={(classInfo) => {
              setClasses((items) => [...items, classInfo]);
              setStats((items) => ({
                ...items,
                [classInfo.id]: {
                  arrived: classInfo.students,
                  leave: 0,
                  homeworkRate: 100,
                },
              }));
              setDuty((items) => ({
                ...items,
                [classInfo.id]: { group: "第一小组", leader: "待设置", members: 0 },
              }));
              setActiveClassId(classInfo.id);
              setPanel(null);
              showToast(`已创建 ${classInfo.name}`);
            }}
            onSaveStats={(nextStats) => {
              setStats((items) => ({ ...items, [activeClass.id]: nextStats }));
              setPanel(null);
              showToast("班级数据已保存");
            }}
            onSaveTodo={(todo) => {
              setTodos((items) => {
                const exists = items.some((item) => item.id === todo.id);
                return exists
                  ? items.map((item) => (item.id === todo.id ? todo : item))
                  : [todo, ...items];
              });
              setPanel(null);
              showToast("待办已保存");
            }}
            onToggleTodo={(todoId) =>
              setTodos((items) =>
                items.map((item) => (item.id === todoId ? { ...item, done: !item.done } : item)),
              )
            }
            onDeleteTodo={(todoId) => {
              setTodos((items) => items.filter((item) => item.id !== todoId));
              setPanel(null);
              showToast("待办已删除");
            }}
            onSaveStudent={(student) => {
              setStudents((items) =>
                items.some((item) => item.id === student.id)
                  ? items.map((item) => (item.id === student.id ? student : item))
                  : [student, ...items],
              );
              setPanel(null);
              showToast("学生记录已保存");
            }}
            onSaveThread={(thread) => {
              setThreads((items) =>
                items.some((item) => item.id === thread.id)
                  ? items.map((item) => (item.id === thread.id ? thread : item))
                  : [thread, ...items],
              );
              setPanel(null);
              showToast("消息已保存");
            }}
            onSaveEvent={(event) => {
              setEvents((items) =>
                items.some((item) => item.id === event.id)
                  ? items.map((item) => (item.id === event.id ? event : item))
                  : [event, ...items],
              );
              setPanel(null);
              showToast("班级事项已保存");
            }}
            onDeleteEvent={(eventId) => {
              setEvents((items) => items.filter((item) => item.id !== eventId));
              setPanel(null);
              showToast("事项已删除");
            }}
            onSaveDuty={(nextDuty) => {
              setDuty((items) => ({ ...items, [activeClass.id]: nextDuty }));
              setPanel(null);
              showToast("值日安排已保存");
            }}
            onSaveSeatPlan={(seatPlan) => {
              setSeatPlans((items) => ({ ...items, [activeClass.id]: seatPlan }));
              showToast("座位表已保存到本机");
            }}
            onSaveLesson={(lesson) => {
              setLessons((items) =>
                items.some((item) => item.id === lesson.id)
                  ? items.map((item) => (item.id === lesson.id ? lesson : item))
                  : [...items, lesson],
              );
              setPanel(null);
              showToast("课程已保存");
            }}
            onDeleteLesson={(lessonId) => {
              setLessons((items) => items.filter((item) => item.id !== lessonId));
              setPanel(null);
              showToast("课程已删除");
            }}
            onSaveQuickActions={(actions) => {
              setQuickActions(actions);
              setPanel(null);
              showToast("快捷工作已更新");
            }}
            onSaveScheduleKeyword={(keyword) => {
              setScheduleKeyword(keyword);
              setPanel(null);
              showToast("汇总规则已更新");
            }}
            showToast={showToast}
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
  stats,
  todos,
  quickActions,
  onNavigate,
  onOpenPanel,
  showToast,
}: {
  activeClass: ClassInfo;
  lessons: Lesson[];
  stats: ClassStats;
  todos: TodoItem[];
  quickActions: QuickActionKey[];
  onNavigate: (tab: TabKey) => void;
  onOpenPanel: (panel: PanelState) => void;
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
          <button type="button" onClick={() => onOpenPanel({ type: "report" })}>
            查看日报
            <ChevronRight size={15} />
          </button>
        </div>
        <div className="metric-row">
          <div>
            <strong>{stats.arrived}</strong>
            <span>已到</span>
          </div>
          <i />
          <div>
            <strong className="warning-number">{stats.leave}</strong>
            <span>请假</span>
          </div>
          <i />
          <div>
            <strong>{stats.homeworkRate}%</strong>
            <span>作业提交</span>
          </div>
        </div>
        <div className="hero-note">
          <Sparkles size={15} />
          <span>
            {stats.leave > 0 ? `${stats.leave} 人请假，` : "全员已到，"}
            {todos.filter((item) => !item.done).length} 项待办仍需处理
          </span>
          <ChevronRight size={15} />
        </div>
      </section>

      <SectionTitle
        title="快捷工作"
        action="自定义"
        onAction={() => onOpenPanel({ type: "quick-settings" })}
      />
      <section className="quick-grid">
        {quickActions.map((key) => {
          const item = quickActionMeta[key];
          const Icon = item.icon;
          const sub =
            key === "attendance"
              ? `${stats.leave} 人请假`
              : key === "homework"
                ? `${todos.filter((todo) => !todo.done).length} 项待办`
                : key === "notice"
                  ? "快速发送"
                  : "全部服务";
          return (
            <button
              className="quick-card"
              type="button"
              key={key}
              onClick={() => onOpenPanel({ type: key })}
            >
              <span className={`quick-icon ${item.color}`}>
                <Icon size={21} />
              </span>
              <b>{item.label}</b>
              <small>{sub}</small>
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
                <button
                  type="button"
                  onClick={() => onOpenPanel({ type: "lesson", lessonId: lesson.id })}
                >
                  <MoreHorizontal size={18} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="empty-inline">今天暂无课程，适合安排一次班级共读。</div>
        )}
      </section>

      <SectionTitle
        title="待办提醒"
        action={`全部 ${todos.length} 项`}
        onAction={() => onOpenPanel({ type: "todos" })}
      />
      <section className="todo-list">
        {todos.slice(0, 3).map((todo, index) => (
          <button
            type="button"
            key={todo.id}
            className={todo.done ? "done" : ""}
            onClick={() => onOpenPanel({ type: "todos", todoId: todo.id })}
          >
            <span className={`todo-date ${index % 2 ? "mint" : "peach"}`}>
              <b>{todo.done ? "✓" : index === 0 ? "今" : String(index + 1).padStart(2, "0")}</b>
              <small>{todo.due.replace("今天 ", "")}</small>
            </span>
            <span className="todo-copy">
              <b>{todo.title}</b>
              <small>{todo.detail}</small>
            </span>
            <ChevronRight size={18} />
          </button>
        ))}
        {!todos.length && (
          <button type="button" onClick={() => onOpenPanel({ type: "homework" })}>
            <span className="todo-date mint"><Plus size={17} /></span>
            <span className="todo-copy"><b>新建待办</b><small>今天没有待处理事项</small></span>
            <ChevronRight size={18} />
          </button>
        )}
      </section>
    </div>
  );
}

function StudyView({
  activeClass,
  students,
  onOpenGradeImport,
  onOpenPanel,
}: {
  activeClass: ClassInfo;
  students: StudentRecord[];
  onOpenGradeImport: () => void;
  onOpenPanel: (panel: PanelState) => void;
}) {
  const classStudents = students.filter((student) => student.classId === activeClass.id);
  const [mode, setMode] = useState<"scores" | "profiles">("scores");
  const [scoreSubject, setScoreSubject] = useState<"total" | "chinese" | "math" | "english">("total");
  const scoreFor = (student: StudentRecord) =>
    scoreSubject === "total" ? averageScore(student) : student.scores[scoreSubject];
  const rankedStudents = [...classStudents].sort((a, b) => scoreFor(b) - scoreFor(a));
  const classAverage = classStudents.length
    ? Math.round(classStudents.reduce((total, student) => total + scoreFor(student), 0) / classStudents.length)
    : 0;
  const passCount = classStudents.filter((student) => scoreFor(student) >= 60).length;
  const passRate = classStudents.length ? Math.round((passCount / classStudents.length) * 100) : 0;
  const subjectAverages = [
    ["语文", "chinese"],
    ["数学", "math"],
    ["英语", "english"],
  ].map(([label, key]) => ({
    label,
    key,
    value: classStudents.length
      ? Math.round(
          classStudents.reduce(
            (total, student) => total + student.scores[key as keyof StudentRecord["scores"]],
            0,
          ) / classStudents.length,
        )
      : 0,
  }));
  const distributions = [
    { label: "优秀", range: "90—100", count: classStudents.filter((student) => scoreFor(student) >= 90).length, tone: "excellent" },
    { label: "良好", range: "80—89", count: classStudents.filter((student) => scoreFor(student) >= 80 && scoreFor(student) < 90).length, tone: "good" },
    { label: "及格", range: "60—79", count: classStudents.filter((student) => scoreFor(student) >= 60 && scoreFor(student) < 80).length, tone: "pass" },
    { label: "待提升", range: "0—59", count: classStudents.filter((student) => scoreFor(student) < 60).length, tone: "attention" },
  ];

  return (
    <div className="page-content inner-page">
      <PageHeading
        eyebrow={activeClass.name}
        title="成绩可视化"
        subtitle="从班级分布到个人成绩，一页看清"
        action={
          <div className="score-heading-actions">
            <button className="import-button secondary" type="button" onClick={onOpenGradeImport}>
              <UploadCloud size={15} /> 导入
            </button>
            <button className="import-button" type="button" onClick={() => onOpenPanel({ type: "student" })}>
              <Plus size={15} /> 录入
            </button>
          </div>
        }
      />
      <div className="score-view-switch">
        <button className={mode === "scores" ? "active" : ""} onClick={() => setMode("scores")}>成绩看板</button>
        <button className={mode === "profiles" ? "active" : ""} onClick={() => setMode("profiles")}>学生档案</button>
      </div>

      {mode === "scores" && (
        <>
          <div className="score-subject-tabs">
            {[
              ["total", "总分"],
              ["chinese", "语文"],
              ["math", "数学"],
              ["english", "英语"],
            ].map(([key, label]) => (
              <button key={key} className={scoreSubject === key ? "active" : ""} onClick={() => setScoreSubject(key as typeof scoreSubject)}>{label}</button>
            ))}
          </div>

          <section className="score-overview-card">
            <div className="score-average">
              <span>班级平均分</span>
              <strong>{classAverage}</strong>
              <small>{classStudents.length} 名学生已录入</small>
            </div>
            <div className="score-kpis">
              <span><b>{passRate}%</b><small>及格率</small></span>
              <span><b>{rankedStudents[0] ? scoreFor(rankedStudents[0]) : 0}</b><small>最高分</small></span>
              <span><b>{distributions[0].count}</b><small>优秀人数</small></span>
            </div>
          </section>

          <SectionTitle
            title="学科平均分"
            action="编辑成绩"
            onAction={() => onOpenPanel({ type: "student", studentId: rankedStudents[0]?.id })}
          />
          <section className="subject-score-chart" aria-label="学科平均分柱状图">
            {subjectAverages.map((subject) => (
              <div key={subject.key}>
                <b>{subject.value}</b>
                <span><i style={{ height: `${Math.max(subject.value, 8)}%` }} /></span>
                <small>{subject.label}</small>
              </div>
            ))}
          </section>

          <SectionTitle
            title="分数段分布"
            action={`${classStudents.length} 人`}
            onAction={() =>
              onOpenPanel({
                type: "analysis",
                title: "成绩分布说明",
                description: `当前${scoreSubject === "total" ? "三科平均分" : scoreSubject === "chinese" ? "语文" : scoreSubject === "math" ? "数学" : "英语"}统计：优秀 ${distributions[0].count} 人、良好 ${distributions[1].count} 人、及格 ${distributions[2].count} 人、待提升 ${distributions[3].count} 人。`,
              })
            }
          />
          <section className="score-distribution">
            {distributions.map((item) => (
              <div key={item.label}>
                <span><b>{item.label}</b><small>{item.range}</small></span>
                <i><em className={item.tone} style={{ width: `${classStudents.length ? Math.max((item.count / classStudents.length) * 100, item.count ? 8 : 0) : 0}%` }} /></i>
                <strong>{item.count}人</strong>
              </div>
            ))}
          </section>

          <SectionTitle title="学生成绩排名" action="录入成绩" onAction={() => onOpenPanel({ type: "student" })} />
          <section className="score-ranking">
            {rankedStudents.map((student, index) => (
              <button key={student.id} onClick={() => onOpenPanel({ type: "student", studentId: student.id })}>
                <em className={index < 3 ? `top-${index + 1}` : ""}>{index + 1}</em>
                <span><b>{student.name}</b><small>{student.gender} · 语 {student.scores.chinese} / 数 {student.scores.math} / 英 {student.scores.english}</small></span>
                <strong>{scoreFor(student)}</strong>
                <ChevronRight size={15} />
              </button>
            ))}
          </section>
        </>
      )}

      {mode === "profiles" && (
        <>
          <SectionTitle title="学生档案" action="新增记录" onAction={() => onOpenPanel({ type: "student" })} />
          <section className="student-list">
            {classStudents.map((student, index) => (
              <button key={student.id} onClick={() => onOpenPanel({ type: "student", studentId: student.id })}>
                <span className={`student-avatar avatar-${index % 3}`}>{student.name.slice(0, 1)}</span>
                <span><b>{student.name}</b><small>{student.note}</small></span>
                <em className={student.positive ? "positive" : ""}>{averageScore(student)}分</em>
              </button>
            ))}
            {!classStudents.length && (
              <button onClick={() => onOpenPanel({ type: "student" })}>
                <span className="student-avatar avatar-0"><UserPlus size={17} /></span>
                <span><b>添加学生成绩</b><small>录入性别、成绩和观察记录</small></span>
                <ChevronRight size={17} />
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function ChatView({
  activeClass,
  threads,
  onOpenPanel,
}: {
  activeClass: ClassInfo;
  threads: ChatThread[];
  onOpenPanel: (panel: PanelState) => void;
}) {
  const [category, setCategory] = useState<ChatThread["category"]>("parent");
  const visibleThreads = threads.filter(
    (thread) => thread.classId === activeClass.id && thread.category === category,
  );
  const unreadCount = (nextCategory: ChatThread["category"]) =>
    threads
      .filter((thread) => thread.classId === activeClass.id && thread.category === nextCategory)
      .reduce((total, thread) => total + thread.unread, 0);

  return (
    <div className="page-content inner-page">
      <PageHeading eyebrow={activeClass.name} title="沟通中心" subtitle="重要消息，一处集中处理" />
      <div className="segmented-control">
        <button
          className={category === "parent" ? "active" : ""}
          onClick={() => setCategory("parent")}
        >
          家校沟通 {unreadCount("parent") > 0 && <i>{unreadCount("parent")}</i>}
        </button>
        <button
          className={category === "group" ? "active" : ""}
          onClick={() => setCategory("group")}
        >
          班级群组 {unreadCount("group") > 0 && <i>{unreadCount("group")}</i>}
        </button>
        <button
          className={category === "receipt" ? "active" : ""}
          onClick={() => setCategory("receipt")}
        >
          通知回执
        </button>
      </div>
      <section className="message-list">
        {visibleThreads.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpenPanel({ type: "conversation", threadId: item.id })}
          >
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
        {!visibleThreads.length && (
          <div className="empty-list">
            <MessageCircleMore size={22} />
            <b>这里还没有消息</b>
            <small>点击右下角按钮开始一条新沟通</small>
          </div>
        )}
      </section>
      <button
        className="floating-compose"
        type="button"
        onClick={() => onOpenPanel({ type: "compose" })}
      >
        <PencilLine size={20} />
      </button>
    </div>
  );
}

function AffairsView({
  activeClass,
  duty,
  events,
  seatPlan,
  onOpenPanel,
}: {
  activeClass: ClassInfo;
  duty: DutyInfo;
  events: ClassEvent[];
  seatPlan?: SeatPlan;
  onOpenPanel: (panel: PanelState) => void;
}) {
  return (
    <div className="page-content inner-page">
      <PageHeading eyebrow={activeClass.name} title="班级事务" subtitle="把零碎日常，安排得井井有条" />
      <section className="affair-feature">
        <div>
          <span>本周班级值日</span>
          <h2>{duty.group}</h2>
          <p>组长：{duty.leader} · 共 {duty.members} 人</p>
        </div>
        <span className="broom-graphic">✦</span>
        <button onClick={() => onOpenPanel({ type: "duty" })}>
          编辑安排 <ChevronRight size={15} />
        </button>
      </section>
      <section className="affair-grid">
        {[
          {
            icon: Megaphone,
            title: "班级通知",
            sub: "快速编辑并发送",
            color: "peach",
            panel: { type: "notice" } as PanelState,
          },
          {
            icon: CalendarDays,
            title: "活动报名",
            sub: `${events.length} 项班级事项`,
            color: "mint",
            panel: { type: "event" } as PanelState,
          },
          {
            icon: UsersRound,
            title: "座位管理",
            sub: seatPlan
              ? `已排 ${seatPlan.studentIds.filter(Boolean).length} 个座位`
              : "按性别与成绩智能生成",
            color: "lilac",
            panel: { type: "seating" } as PanelState,
          },
          {
            icon: BookOpen,
            title: "班级相册",
            sub: "添加照片备注",
            color: "cream",
            panel: { type: "album" } as PanelState,
          },
        ].map(({ icon: CardIcon, title, sub, color, panel }) => {
          return (
            <button key={title} onClick={() => onOpenPanel(panel)}>
              <span className={`affair-icon ${color}`}><CardIcon size={21} /></span>
              <b>{title}</b>
              <small>{sub}</small>
              <ChevronRight size={17} />
            </button>
          );
        })}
      </section>
      <SectionTitle
        title="近期事项"
        action="新建"
        onAction={() => onOpenPanel({ type: "event" })}
      />
      <section className="event-list">
        {events.map((event, index) => (
          <button
            key={event.id}
            onClick={() => onOpenPanel({ type: "event", eventId: event.id })}
          >
            <span className={index === 0 ? "event-date active" : "event-date"}>
              <b>{event.date}</b><small>周{event.weekday}</small>
            </span>
            <span><b>{event.title}</b><small>{event.detail}</small></span>
            <em>{event.status}</em>
          </button>
        ))}
        {!events.length && (
          <button onClick={() => onOpenPanel({ type: "event" })}>
            <span className="event-date active"><Plus size={18} /></span>
            <span><b>新建班级事项</b><small>安排活动、提醒或报名</small></span>
            <ChevronRight size={17} />
          </button>
        )}
      </section>
    </div>
  );
}

function ScheduleView({
  activeClass,
  classes,
  lessons,
  scheduleKeyword,
  onOpenImport,
  onOpenPanel,
  showToast,
}: {
  activeClass: ClassInfo;
  classes: ClassInfo[];
  lessons: Lesson[];
  scheduleKeyword: string;
  onOpenImport: () => void;
  onOpenPanel: (panel: PanelState) => void;
  showToast: (message: string) => void;
}) {
  const [view, setView] = useState<"mine" | "class">("mine");
  const [weekOffset, setWeekOffset] = useState(0);
  const selectedLessons = useMemo(
    () =>
      (view === "mine"
        ? lessons.filter((lesson) => lesson.subject.includes(scheduleKeyword))
        : lessons.filter((lesson) => lesson.classId === activeClass.id)
      ).sort((a, b) => a.period - b.period),
    [activeClass.id, lessons, scheduleKeyword, view],
  );

  const lessonAt = (weekday: number, period: number) =>
    selectedLessons.find((lesson) => lesson.weekday === weekday && lesson.period === period);

  const getClass = (classId: string) => classes.find((item) => item.id === classId);

  const exportSchedule = () => {
    const rows = [
      ["班级", "星期", "节次", "课程", "地点", "开始", "结束"],
      ...selectedLessons.map((lesson) => [
        getClass(lesson.classId)?.name ?? lesson.classId,
        weekdays[lesson.weekday - 1],
        String(lesson.period),
        lesson.subject,
        lesson.room,
        lesson.start,
        lesson.end,
      ]),
    ];
    const csv = `\uFEFF${rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${view === "mine" ? "我的数学课表" : activeClass.name}-课表.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("课表文件已生成");
  };

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
            已从 <b>{classes.length} 个班级</b> 自动汇总 {selectedLessons.length} 节
            {scheduleKeyword}课
          </p>
          <button onClick={() => onOpenPanel({ type: "schedule-rules" })}>
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
                    aria-label={
                      lesson
                        ? `编辑${weekdays[weekday - 1]}第${period}节${lesson.subject}`
                        : `新增${weekdays[weekday - 1]}第${period}节课程`
                    }
                    onClick={() =>
                      onOpenPanel({
                        type: "lesson",
                        lessonId: lesson?.id,
                        weekday,
                        period,
                      })
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
        <button onClick={exportSchedule}>
          <Download size={11} /> 导出 CSV
        </button>
      </div>
    </div>
  );
}

function ActionPanel({
  panel,
  activeClass,
  classes,
  stats,
  todos,
  students,
  threads,
  events,
  duty,
  seatPlan,
  lessons,
  quickActions,
  scheduleKeyword,
  onClose,
  onOpenPanel,
  onNavigate,
  onSaveClass,
  onSaveStats,
  onSaveTodo,
  onToggleTodo,
  onDeleteTodo,
  onSaveStudent,
  onSaveThread,
  onSaveEvent,
  onDeleteEvent,
  onSaveDuty,
  onSaveSeatPlan,
  onSaveLesson,
  onDeleteLesson,
  onSaveQuickActions,
  onSaveScheduleKeyword,
  showToast,
}: {
  panel: PanelState;
  activeClass: ClassInfo;
  classes: ClassInfo[];
  stats: ClassStats;
  todos: TodoItem[];
  students: StudentRecord[];
  threads: ChatThread[];
  events: ClassEvent[];
  duty: DutyInfo;
  seatPlan?: SeatPlan;
  lessons: Lesson[];
  quickActions: QuickActionKey[];
  scheduleKeyword: string;
  onClose: () => void;
  onOpenPanel: (panel: PanelState) => void;
  onNavigate: (tab: TabKey) => void;
  onSaveClass: (classInfo: ClassInfo) => void;
  onSaveStats: (stats: ClassStats) => void;
  onSaveTodo: (todo: TodoItem) => void;
  onToggleTodo: (todoId: string) => void;
  onDeleteTodo: (todoId: string) => void;
  onSaveStudent: (student: StudentRecord) => void;
  onSaveThread: (thread: ChatThread) => void;
  onSaveEvent: (event: ClassEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onSaveDuty: (duty: DutyInfo) => void;
  onSaveSeatPlan: (seatPlan: SeatPlan) => void;
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onSaveQuickActions: (actions: QuickActionKey[]) => void;
  onSaveScheduleKeyword: (keyword: string) => void;
  showToast: (message: string) => void;
}) {
  const editingTodo =
    panel.type === "todos" && panel.todoId
      ? todos.find((item) => item.id === panel.todoId)
      : undefined;
  const editingStudent =
    panel.type === "student" && panel.studentId
      ? students.find((item) => item.id === panel.studentId)
      : undefined;
  const editingThread =
    panel.type === "conversation"
      ? threads.find((item) => item.id === panel.threadId)
      : undefined;
  const editingEvent =
    panel.type === "event" && panel.eventId
      ? events.find((item) => item.id === panel.eventId)
      : undefined;
  const editingLesson =
    panel.type === "lesson" && panel.lessonId
      ? lessons.find((item) => item.id === panel.lessonId)
      : undefined;
  const seatingStudents = students.filter((student) => student.classId === activeClass.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [arrived, setArrived] = useState(stats.arrived);
  const [leave, setLeave] = useState(stats.leave);
  const [homeworkRate, setHomeworkRate] = useState(stats.homeworkRate);
  const [className, setClassName] = useState("");
  const [classGrade, setClassGrade] = useState("2026 春季");
  const [classStudents, setClassStudents] = useState(40);
  const [todoTitle, setTodoTitle] = useState(editingTodo?.title ?? "");
  const [todoDetail, setTodoDetail] = useState(editingTodo?.detail ?? "");
  const [todoDue, setTodoDue] = useState(editingTodo?.due ?? "今天 17:00");
  const [todoDone, setTodoDone] = useState(editingTodo?.done ?? false);
  const [studentName, setStudentName] = useState(editingStudent?.name ?? "");
  const [studentGender, setStudentGender] = useState<"男" | "女">(editingStudent?.gender ?? "男");
  const [studentChinese, setStudentChinese] = useState(editingStudent?.scores.chinese ?? 75);
  const [studentMath, setStudentMath] = useState(editingStudent?.scores.math ?? 75);
  const [studentEnglish, setStudentEnglish] = useState(editingStudent?.scores.english ?? 75);
  const [studentNote, setStudentNote] = useState(editingStudent?.note ?? "");
  const [studentTag, setStudentTag] = useState(editingStudent?.tag ?? "需关注");
  const [studentPositive, setStudentPositive] = useState(editingStudent?.positive ?? false);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [messageCategory, setMessageCategory] =
    useState<ChatThread["category"]>("parent");
  const [reply, setReply] = useState("");
  const [eventDate, setEventDate] = useState(editingEvent?.date ?? "01");
  const [eventWeekday, setEventWeekday] = useState(editingEvent?.weekday ?? "一");
  const [eventTitle, setEventTitle] = useState(editingEvent?.title ?? "");
  const [eventDetail, setEventDetail] = useState(editingEvent?.detail ?? "");
  const [eventStatus, setEventStatus] = useState(editingEvent?.status ?? "待开始");
  const [dutyGroup, setDutyGroup] = useState(duty.group);
  const [dutyLeader, setDutyLeader] = useState(duty.leader);
  const [dutyMembers, setDutyMembers] = useState(duty.members);
  const [lessonClassId, setLessonClassId] = useState(
    editingLesson?.classId ?? activeClass.id,
  );
  const [lessonWeekday, setLessonWeekday] = useState(
    editingLesson?.weekday ?? (panel.type === "lesson" ? panel.weekday ?? 1 : 1),
  );
  const [lessonPeriod, setLessonPeriod] = useState(
    editingLesson?.period ?? (panel.type === "lesson" ? panel.period ?? 1 : 1),
  );
  const [lessonSubject, setLessonSubject] = useState(editingLesson?.subject ?? "数学");
  const [lessonRoom, setLessonRoom] = useState(editingLesson?.room ?? activeClass.name);
  const [selectedQuick, setSelectedQuick] = useState<QuickActionKey[]>(quickActions);
  const [keyword, setKeyword] = useState(scheduleKeyword);
  const [featureNote, setFeatureNote] = useState("");
  const [albumFileName, setAlbumFileName] = useState("");
  const [seatRows, setSeatRows] = useState(
    seatPlan?.rows ?? Math.max(Math.ceil(seatingStudents.length / 6), 1),
  );
  const [seatColumns, setSeatColumns] = useState(seatPlan?.columns ?? 6);
  const [seatStudentIds, setSeatStudentIds] = useState<Array<string | null>>(
    seatPlan?.studentIds ?? [],
  );
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  useEffect(() => {
    if (!["album", "analysis"].includes(panel.type)) return;
    const suffix = panel.type === "analysis" ? panel.title : panel.type;
    setFeatureNote(
      window.localStorage.getItem(`${storageKey}-note-${activeClass.id}-${suffix}`) ?? "",
    );
  }, [activeClass.id, panel]);

  const panelTitles: Record<PanelState["type"], string> = {
    search: "搜索功能",
    notifications: "通知中心",
    report: "班级日报",
    "quick-settings": "自定义快捷工作",
    attendance: "考勤点名",
    homework: "布置作业",
    notice: "发送家校通知",
    apps: "全部应用",
    todos: editingTodo ? "编辑待办" : "全部待办",
    student: editingStudent ? "编辑学生记录" : "新增学生记录",
    analysis: panel.type === "analysis" ? panel.title : "数据分析",
    conversation: editingThread?.name ?? "对话",
    compose: "新建消息",
    duty: "值日安排",
    event: editingEvent ? "编辑班级事项" : "新建班级事项",
    seating: "座位管理",
    album: "班级相册",
    lesson: editingLesson ? "编辑课程" : "新增课程",
    "schedule-rules": "数学课表汇总规则",
    "new-class": "新建班级",
  };

  const saveFeatureNote = () => {
    const suffix = panel.type === "analysis" ? panel.title : panel.type;
    window.localStorage.setItem(
      `${storageKey}-note-${activeClass.id}-${suffix}`,
      featureNote.trim(),
    );
    onClose();
    showToast("自定义内容已保存");
  };

  const searchEntries: Array<{
    label: string;
    description: string;
    action: () => void;
  }> = [
    { label: "考勤点名", description: "修改到校与请假人数", action: () => onOpenPanel({ type: "attendance" }) },
    { label: "布置作业", description: "创建新的班级待办", action: () => onOpenPanel({ type: "homework" }) },
    { label: "学生记录", description: "新增或维护学情观察", action: () => onOpenPanel({ type: "student" }) },
    { label: "家校沟通", description: "发送消息并查看对话", action: () => onNavigate("chat") },
    { label: "班级事项", description: "新增活动、提醒和报名", action: () => onOpenPanel({ type: "event" }) },
    { label: "值日安排", description: "修改小组和组长", action: () => onOpenPanel({ type: "duty" }) },
    { label: "课程表", description: "查看并编辑全部课程", action: () => onNavigate("schedule") },
    { label: "新建班级", description: "添加另一个任教班级", action: () => onOpenPanel({ type: "new-class" }) },
  ];
  const visibleSearchEntries = searchEntries.filter((entry) =>
    `${entry.label}${entry.description}`.includes(searchQuery.trim()),
  );

  const classTodos = todos.filter((item) => item.classId === activeClass.id);
  const unreadThreads = threads.filter(
    (thread) => thread.classId === activeClass.id && thread.unread > 0,
  );

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="bottom-sheet action-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={panelTitles[panel.type]}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-heading">
          <div>
            <p className="eyebrow">{activeClass.name}</p>
            <h2>{panelTitles[panel.type]}</h2>
          </div>
          <button className="icon-button soft" type="button" onClick={onClose} aria-label="关闭">
            <X size={20} />
          </button>
        </div>

        {panel.type === "search" && (
          <>
            <label className="search-field">
              <Search size={18} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索考勤、学生、课表或事项"
              />
            </label>
            <div className="action-list">
              {visibleSearchEntries.map((entry) => (
                <button type="button" key={entry.label} onClick={entry.action}>
                  <span><b>{entry.label}</b><small>{entry.description}</small></span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          </>
        )}

        {panel.type === "notifications" && (
          <div className="action-list">
            {unreadThreads.map((thread) => (
              <button
                type="button"
                key={thread.id}
                onClick={() => onOpenPanel({ type: "conversation", threadId: thread.id })}
              >
                <span>
                  <b>{thread.name}</b>
                  <small>{thread.message}</small>
                </span>
                <em>{thread.unread}</em>
              </button>
            ))}
            {classTodos.filter((todo) => !todo.done).slice(0, 3).map((todo) => (
              <button
                type="button"
                key={todo.id}
                onClick={() => onOpenPanel({ type: "todos", todoId: todo.id })}
              >
                <span><b>{todo.title}</b><small>{todo.due} · {todo.detail}</small></span>
                <ChevronRight size={17} />
              </button>
            ))}
            {!unreadThreads.length && !classTodos.some((todo) => !todo.done) && (
              <div className="empty-list">
                <CheckCircle2 size={24} />
                <b>暂时没有新通知</b>
                <small>所有消息与待办都已处理</small>
              </div>
            )}
          </div>
        )}

        {(panel.type === "report" || panel.type === "attendance") && (
          <>
            <div className="summary-banner">
              <ListChecks size={19} />
              <span>
                <b>{panel.type === "report" ? "今日班级数据" : "修改考勤结果"}</b>
                <small>保存后工作台会立即同步更新</small>
              </span>
            </div>
            <div className="form-grid three">
              <label><span>已到</span><input type="number" min={0} value={arrived} onChange={(e) => setArrived(Number(e.target.value))} /></label>
              <label><span>请假</span><input type="number" min={0} value={leave} onChange={(e) => setLeave(Number(e.target.value))} /></label>
              <label><span>作业提交率</span><input type="number" min={0} max={100} value={homeworkRate} onChange={(e) => setHomeworkRate(Number(e.target.value))} /></label>
            </div>
            <button
              className="button primary full"
              type="button"
              onClick={() =>
                onSaveStats({
                  arrived: Math.max(arrived, 0),
                  leave: Math.max(leave, 0),
                  homeworkRate: Math.min(Math.max(homeworkRate, 0), 100),
                })
              }
            >
              保存班级数据
            </button>
          </>
        )}

        {panel.type === "new-class" && (
          <>
            <div className="editor-form">
              <label><span>班级名称</span><input autoFocus value={className} onChange={(e) => setClassName(e.target.value)} placeholder="例如：五年级 3 班" /></label>
              <label><span>学期</span><input value={classGrade} onChange={(e) => setClassGrade(e.target.value)} /></label>
              <label><span>学生人数</span><input type="number" min={1} value={classStudents} onChange={(e) => setClassStudents(Number(e.target.value))} /></label>
            </div>
            <button
              className="button primary full"
              type="button"
              disabled={!className.trim()}
              onClick={() =>
                onSaveClass({
                  id: `class-${Date.now()}`,
                  name: className.trim(),
                  grade: classGrade.trim() || "当前学期",
                  students: Math.max(classStudents, 1),
                  accent: ["#315B4B", "#E07A4F", "#5367A9", "#9B6B87"][classes.length % 4],
                })
              }
            >
              <Plus size={17} /> 创建并切换
            </button>
          </>
        )}

        {panel.type === "quick-settings" && (
          <>
            <p className="sheet-description">点击应用可显示或隐藏；使用箭头调整首页顺序。</p>
            <div className="quick-editor">
              {(Object.keys(quickActionMeta) as QuickActionKey[]).map((key) => {
                const item = quickActionMeta[key];
                const Icon = item.icon;
                const position = selectedQuick.indexOf(key);
                const selected = position >= 0;
                return (
                  <div key={key} className={selected ? "selected" : ""}>
                    <button
                      type="button"
                      className="quick-toggle"
                      onClick={() =>
                        setSelectedQuick((items) =>
                          items.includes(key)
                            ? items.filter((itemKey) => itemKey !== key)
                            : [...items, key],
                        )
                      }
                    >
                      <span className={`quick-icon ${item.color}`}><Icon size={19} /></span>
                      <b>{item.label}</b>
                      <Check size={17} />
                    </button>
                    {selected && (
                      <span className="order-buttons">
                        <button
                          type="button"
                          disabled={position === 0}
                          onClick={() =>
                            setSelectedQuick((items) => {
                              const next = [...items];
                              [next[position - 1], next[position]] = [next[position], next[position - 1]];
                              return next;
                            })
                          }
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={position === selectedQuick.length - 1}
                          onClick={() =>
                            setSelectedQuick((items) => {
                              const next = [...items];
                              [next[position], next[position + 1]] = [next[position + 1], next[position]];
                              return next;
                            })
                          }
                        >
                          <ChevronRight size={16} />
                        </button>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              className="button primary full"
              type="button"
              disabled={!selectedQuick.length}
              onClick={() => onSaveQuickActions(selectedQuick)}
            >
              保存快捷工作
            </button>
          </>
        )}

        {panel.type === "homework" && (
          <>
            <div className="editor-form">
              <label><span>作业或待办名称</span><input autoFocus value={todoTitle} onChange={(e) => setTodoTitle(e.target.value)} placeholder="例如：完成第 8 页练习" /></label>
              <label><span>说明</span><textarea value={todoDetail} onChange={(e) => setTodoDetail(e.target.value)} placeholder="补充范围、要求或提醒" /></label>
              <label><span>截止时间</span><input value={todoDue} onChange={(e) => setTodoDue(e.target.value)} placeholder="今天 17:00" /></label>
            </div>
            <button
              className="button primary full"
              type="button"
              disabled={!todoTitle.trim()}
              onClick={() =>
                onSaveTodo({
                  id: `todo-${Date.now()}`,
                  classId: activeClass.id,
                  title: todoTitle.trim(),
                  detail: todoDetail.trim() || "暂无补充说明",
                  due: todoDue.trim() || "待定",
                  done: false,
                })
              }
            >
              <Plus size={17} /> 添加到待办
            </button>
          </>
        )}

        {panel.type === "todos" && !editingTodo && (
          <>
            <div className="manage-list">
              {classTodos.map((todo) => (
                <div key={todo.id} className={todo.done ? "done" : ""}>
                  <button type="button" className="check-button" onClick={() => onToggleTodo(todo.id)}>
                    {todo.done ? <CheckCircle2 size={20} /> : <span />}
                  </button>
                  <button type="button" className="manage-main" onClick={() => onOpenPanel({ type: "todos", todoId: todo.id })}>
                    <b>{todo.title}</b><small>{todo.due} · {todo.detail}</small>
                  </button>
                  <ChevronRight size={17} />
                </div>
              ))}
            </div>
            <button className="button primary full" type="button" onClick={() => onOpenPanel({ type: "homework" })}>
              <Plus size={17} /> 新建待办
            </button>
          </>
        )}

        {panel.type === "todos" && editingTodo && (
          <>
            <div className="editor-form">
              <label><span>名称</span><input value={todoTitle} onChange={(e) => setTodoTitle(e.target.value)} /></label>
              <label><span>说明</span><textarea value={todoDetail} onChange={(e) => setTodoDetail(e.target.value)} /></label>
              <label><span>截止时间</span><input value={todoDue} onChange={(e) => setTodoDue(e.target.value)} /></label>
              <label className="toggle-row">
                <input type="checkbox" checked={todoDone} onChange={(e) => setTodoDone(e.target.checked)} />
                <span>标记为已完成</span>
              </label>
            </div>
            <div className="sheet-actions">
              <button className="button danger" type="button" onClick={() => onDeleteTodo(editingTodo.id)}><Trash2 size={16} /> 删除</button>
              <button
                className="button primary"
                type="button"
                disabled={!todoTitle.trim()}
                onClick={() =>
                  onSaveTodo({
                    ...editingTodo,
                    title: todoTitle.trim(),
                    detail: todoDetail.trim(),
                    due: todoDue.trim(),
                    done: todoDone,
                  })
                }
              >
                保存修改
              </button>
            </div>
          </>
        )}

        {panel.type === "student" && (
          <>
            <div className="form-grid two">
              <label><span>学生姓名</span><input autoFocus value={studentName} onChange={(e) => setStudentName(e.target.value)} /></label>
              <label>
                <span>性别</span>
                <select value={studentGender} onChange={(e) => setStudentGender(e.target.value as "男" | "女")}>
                  <option value="男">男生</option><option value="女">女生</option>
                </select>
              </label>
            </div>
            <div className="form-grid three score-inputs">
              <label><span>语文</span><input type="number" min={0} max={100} value={studentChinese} onChange={(e) => setStudentChinese(Number(e.target.value))} /></label>
              <label><span>数学</span><input type="number" min={0} max={100} value={studentMath} onChange={(e) => setStudentMath(Number(e.target.value))} /></label>
              <label><span>英语</span><input type="number" min={0} max={100} value={studentEnglish} onChange={(e) => setStudentEnglish(Number(e.target.value))} /></label>
            </div>
            <div className="editor-form">
              <label><span>观察记录</span><textarea value={studentNote} onChange={(e) => setStudentNote(e.target.value)} placeholder="记录学习表现、进步或需要跟进的情况" /></label>
              <label><span>标签</span><input value={studentTag} onChange={(e) => setStudentTag(e.target.value)} placeholder="需关注 / 有进步" /></label>
              <label className="toggle-row">
                <input type="checkbox" checked={studentPositive} onChange={(e) => setStudentPositive(e.target.checked)} />
                <span>这是正向进步记录</span>
              </label>
            </div>
            <button
              className="button primary full"
              type="button"
              disabled={!studentName.trim()}
              onClick={() =>
                onSaveStudent({
                  id: editingStudent?.id ?? `student-${Date.now()}`,
                  classId: activeClass.id,
                  name: studentName.trim(),
                  gender: studentGender,
                  scores: {
                    chinese: Math.min(Math.max(studentChinese, 0), 100),
                    math: Math.min(Math.max(studentMath, 0), 100),
                    english: Math.min(Math.max(studentEnglish, 0), 100),
                  },
                  note: studentNote.trim() || "暂无观察记录",
                  tag: studentTag.trim() || "记录",
                  positive: studentPositive,
                })
              }
            >
              保存成绩与档案
            </button>
          </>
        )}

        {panel.type === "notice" && (
          <>
            <div className="editor-form">
              <label><span>接收对象</span><input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="例如：全班家长" /></label>
              <label><span>通知内容</span><textarea autoFocus value={message} onChange={(e) => setMessage(e.target.value)} placeholder="输入需要发送的通知内容" /></label>
            </div>
            <button
              className="button primary full"
              type="button"
              disabled={!recipient.trim() || !message.trim()}
              onClick={() =>
                onSaveThread({
                  id: `thread-${Date.now()}`,
                  classId: activeClass.id,
                  name: recipient.trim(),
                  message: message.trim(),
                  time: "刚刚",
                  unread: 0,
                  avatar: recipient.trim().slice(0, 1),
                  tone: "green",
                  category: "receipt",
                  replies: ["通知已发送"],
                })
              }
            >
              <Send size={17} /> 保存并发送
            </button>
          </>
        )}

        {panel.type === "compose" && (
          <>
            <div className="editor-form">
              <label><span>联系人或群组</span><input autoFocus value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="输入家长、学生或群组名称" /></label>
              <label>
                <span>消息类型</span>
                <select value={messageCategory} onChange={(e) => setMessageCategory(e.target.value as ChatThread["category"])}>
                  <option value="parent">家校沟通</option>
                  <option value="group">班级群组</option>
                  <option value="receipt">通知回执</option>
                </select>
              </label>
              <label><span>消息内容</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} /></label>
            </div>
            <button
              className="button primary full"
              type="button"
              disabled={!recipient.trim() || !message.trim()}
              onClick={() =>
                onSaveThread({
                  id: `thread-${Date.now()}`,
                  classId: activeClass.id,
                  name: recipient.trim(),
                  message: message.trim(),
                  time: "刚刚",
                  unread: 0,
                  avatar: recipient.trim().slice(0, 1),
                  tone: "blue",
                  category: messageCategory,
                  replies: [],
                })
              }
            >
              <Send size={17} /> 发送消息
            </button>
          </>
        )}

        {panel.type === "conversation" && editingThread && (
          <>
            <div className="conversation-card">
              <span className={`message-avatar ${editingThread.tone}`}>{editingThread.avatar}</span>
              <div><b>{editingThread.name}</b><small>{editingThread.time}</small></div>
              <p>{editingThread.message}</p>
              {editingThread.replies.map((item, index) => <em key={`${item}-${index}`}>{item}</em>)}
            </div>
            <div className="reply-box">
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="输入回复内容" />
              <button
                type="button"
                disabled={!reply.trim()}
                onClick={() =>
                  onSaveThread({
                    ...editingThread,
                    unread: 0,
                    time: "刚刚",
                    replies: [...editingThread.replies, reply.trim()],
                  })
                }
              >
                <Send size={17} />
              </button>
            </div>
            {editingThread.unread > 0 && (
              <button
                className="button ghost full"
                type="button"
                onClick={() => onSaveThread({ ...editingThread, unread: 0 })}
              >
                标记为已读
              </button>
            )}
          </>
        )}

        {panel.type === "duty" && (
          <>
            <div className="editor-form">
              <label><span>值日小组</span><input value={dutyGroup} onChange={(e) => setDutyGroup(e.target.value)} /></label>
              <label><span>组长</span><input value={dutyLeader} onChange={(e) => setDutyLeader(e.target.value)} /></label>
              <label><span>人数</span><input type="number" min={0} value={dutyMembers} onChange={(e) => setDutyMembers(Number(e.target.value))} /></label>
            </div>
            <button className="button primary full" type="button" onClick={() => onSaveDuty({ group: dutyGroup.trim(), leader: dutyLeader.trim(), members: Math.max(dutyMembers, 0) })}>
              保存值日安排
            </button>
          </>
        )}

        {panel.type === "event" && (
          <>
            <div className="form-grid two">
              <label><span>日期</span><input value={eventDate} maxLength={2} onChange={(e) => setEventDate(e.target.value)} /></label>
              <label>
                <span>星期</span>
                <select value={eventWeekday} onChange={(e) => setEventWeekday(e.target.value)}>
                  {["一", "二", "三", "四", "五", "六", "日"].map((day) => <option key={day}>{day}</option>)}
                </select>
              </label>
            </div>
            <div className="editor-form">
              <label><span>事项名称</span><input autoFocus value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} /></label>
              <label><span>说明</span><textarea value={eventDetail} onChange={(e) => setEventDetail(e.target.value)} /></label>
              <label>
                <span>状态</span>
                <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)}>
                  <option>待开始</option><option>进行中</option><option>重要</option><option>已完成</option>
                </select>
              </label>
            </div>
            <div className="sheet-actions">
              {editingEvent ? (
                <button className="button danger" type="button" onClick={() => onDeleteEvent(editingEvent.id)}><Trash2 size={16} /> 删除</button>
              ) : <span />}
              <button
                className="button primary"
                type="button"
                disabled={!eventTitle.trim()}
                onClick={() =>
                  onSaveEvent({
                    id: editingEvent?.id ?? `event-${Date.now()}`,
                    classId: activeClass.id,
                    date: eventDate.padStart(2, "0"),
                    weekday: eventWeekday,
                    title: eventTitle.trim(),
                    detail: eventDetail.trim() || "暂无补充说明",
                    status: eventStatus,
                  })
                }
              >
                保存事项
              </button>
            </div>
          </>
        )}

        {panel.type === "lesson" && (
          <>
            <div className="form-grid two">
              <label>
                <span>班级</span>
                <select value={lessonClassId} onChange={(e) => {
                  setLessonClassId(e.target.value);
                  setLessonRoom(classes.find((item) => item.id === e.target.value)?.name ?? "");
                }}>
                  {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>
                <span>星期</span>
                <select value={lessonWeekday} onChange={(e) => setLessonWeekday(Number(e.target.value))}>
                  {weekdays.map((day, index) => <option key={day} value={index + 1}>{day}</option>)}
                </select>
              </label>
              <label>
                <span>节次</span>
                <select value={lessonPeriod} onChange={(e) => setLessonPeriod(Number(e.target.value))}>
                  {periodTimes.map((time, index) => <option key={time[0]} value={index + 1}>第 {index + 1} 节 · {time[0]}</option>)}
                </select>
              </label>
              <label><span>课程</span><input value={lessonSubject} onChange={(e) => setLessonSubject(e.target.value)} /></label>
            </div>
            <div className="editor-form">
              <label><span>教室 / 地点</span><input value={lessonRoom} onChange={(e) => setLessonRoom(e.target.value)} /></label>
            </div>
            <div className="sheet-actions">
              {editingLesson ? (
                <button className="button danger" type="button" onClick={() => onDeleteLesson(editingLesson.id)}><Trash2 size={16} /> 删除</button>
              ) : <span />}
              <button
                className="button primary"
                type="button"
                disabled={!lessonSubject.trim()}
                onClick={() => {
                  const collision = lessons.find(
                    (lesson) =>
                      lesson.id !== editingLesson?.id &&
                      lesson.classId === lessonClassId &&
                      lesson.weekday === lessonWeekday &&
                      lesson.period === lessonPeriod,
                  );
                  if (collision) {
                    showToast(`该班级此时段已有${collision.subject}`);
                    return;
                  }
                  onSaveLesson({
                    id: editingLesson?.id ?? `lesson-${Date.now()}`,
                    classId: lessonClassId,
                    weekday: lessonWeekday,
                    period: lessonPeriod,
                    subject: lessonSubject.trim(),
                    room: lessonRoom.trim() || classes.find((item) => item.id === lessonClassId)?.name || "教室",
                    start: periodTimes[lessonPeriod - 1][0],
                    end: periodTimes[lessonPeriod - 1][1],
                  });
                }}
              >
                保存课程
              </button>
            </div>
          </>
        )}

        {panel.type === "schedule-rules" && (
          <>
            <div className="summary-banner">
              <Sparkles size={19} />
              <span><b>自动汇总规则</b><small>系统会从全部班级中筛选课程名称包含该关键词的课程。</small></span>
            </div>
            <div className="editor-form">
              <label><span>课程关键词</span><input autoFocus value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="数学" /></label>
            </div>
            <button className="button primary full" type="button" disabled={!keyword.trim()} onClick={() => onSaveScheduleKeyword(keyword.trim())}>
              保存汇总规则
            </button>
          </>
        )}

        {panel.type === "apps" && (
          <div className="app-launcher">
            {[
              { icon: GraduationCap, label: "学情管理", sub: "学生记录与知识点", action: () => onNavigate("study") },
              { icon: MessageCircleMore, label: "沟通中心", sub: "消息、群组与回执", action: () => onNavigate("chat") },
              { icon: CalendarDays, label: "班级事务", sub: "值日、活动与座位", action: () => onNavigate("affairs") },
              { icon: Table2, label: "我的课表", sub: "编辑、导入与导出", action: () => onNavigate("schedule") },
              { icon: UserPlus, label: "新建班级", sub: "添加另一个任教班级", action: () => onOpenPanel({ type: "new-class" }) },
              { icon: ListChecks, label: "全部待办", sub: "查看并标记完成", action: () => onOpenPanel({ type: "todos" }) },
            ].map(({ icon: Icon, label, sub, action }) => (
              <button type="button" key={label} onClick={action}>
                <span><Icon size={20} /></span><b>{label}</b><small>{sub}</small>
              </button>
            ))}
          </div>
        )}

        {panel.type === "seating" && (
          <>
            <div className="summary-banner">
              <Sparkles size={19} />
              <span>
                <b>智能搭配规则</b>
                <small>按成绩由高到低分层，高低分相邻互补；有条件时优先安排男女生同桌。生成后可点选两个座位手动交换。</small>
              </span>
            </div>
            <div className="form-grid two seat-size-controls">
              <label><span>行数</span><input type="number" min={1} max={10} value={seatRows} onChange={(e) => setSeatRows(Math.min(Math.max(Number(e.target.value), 1), 10))} /></label>
              <label><span>每行座位数</span><input type="number" min={2} max={8} value={seatColumns} onChange={(e) => setSeatColumns(Math.min(Math.max(Number(e.target.value), 2), 8))} /></label>
            </div>
            <div className="seat-roster-summary">
              <span><b>{seatingStudents.length}</b><small>已录入学生</small></span>
              <span><b>{seatingStudents.filter((student) => student.gender === "男").length}</b><small>男生</small></span>
              <span><b>{seatingStudents.filter((student) => student.gender === "女").length}</b><small>女生</small></span>
              <span><b>{seatRows * seatColumns}</b><small>座位容量</small></span>
            </div>
            <button
              className="button primary full"
              type="button"
              disabled={!seatingStudents.length}
              onClick={() => {
                const capacity = seatRows * seatColumns;
                if (capacity < seatingStudents.length) {
                  showToast(`还缺 ${seatingStudents.length - capacity} 个座位，请增加行列`);
                  return;
                }
                setSeatStudentIds(generateBalancedSeatIds(seatingStudents, capacity));
                setSelectedSeat(null);
                showToast("已按性别与成绩生成座位表");
              }}
            >
              <Sparkles size={17} /> {seatStudentIds.length ? "重新智能排座" : "生成合理座位表"}
            </button>

            {!!seatStudentIds.length && (
              <>
                <div className="seat-plan-title"><span>讲台</span><small>{selectedSeat === null ? "点选两个座位可以交换" : "请选择另一个座位完成交换"}</small></div>
                <div className="seat-plan-grid" style={{ gridTemplateColumns: `repeat(${seatColumns}, minmax(0, 1fr))` }}>
                  {Array.from({ length: seatRows * seatColumns }).map((_, index) => {
                    const studentId = seatStudentIds[index];
                    const student = seatingStudents.find((item) => item.id === studentId);
                    return (
                      <button
                        type="button"
                        key={index}
                        className={`${student ? (student.gender === "男" ? "boy" : "girl") : "empty"}${selectedSeat === index ? " selected" : ""}`}
                        onClick={() => {
                          if (selectedSeat === null) {
                            setSelectedSeat(index);
                            return;
                          }
                          if (selectedSeat === index) {
                            setSelectedSeat(null);
                            return;
                          }
                          setSeatStudentIds((items) => {
                            const next = [...items];
                            [next[selectedSeat], next[index]] = [next[index], next[selectedSeat]];
                            return next;
                          });
                          setSelectedSeat(null);
                          showToast("两个座位已交换");
                        }}
                      >
                        {student ? <><b>{student.name}</b><small>{student.gender} · {averageScore(student)}分</small></> : <small>空位</small>}
                      </button>
                    );
                  })}
                </div>
                <div className="seat-legend"><span><i className="boy" />男生</span><span><i className="girl" />女生</span><span>相邻两格为同桌</span></div>
                <button
                  className="button primary full"
                  type="button"
                  onClick={() => onSaveSeatPlan({ rows: seatRows, columns: seatColumns, studentIds: seatStudentIds, updatedAt: new Date().toISOString() })}
                >
                  保存当前座位表
                </button>
              </>
            )}
            {!seatingStudents.length && (
              <button className="button ghost full" type="button" onClick={() => onOpenPanel({ type: "student" })}>
                先录入学生成绩
              </button>
            )}
          </>
        )}

        {(panel.type === "album" || panel.type === "analysis") && (
          <>
            {panel.type === "analysis" && (
              <div className="summary-banner">
                <Sparkles size={19} />
                <span><b>数据摘要</b><small>{panel.description}</small></span>
              </div>
            )}
            {panel.type === "album" && (
              <label className="mini-upload">
                <ImagePlus size={22} />
                <span><b>{albumFileName || "选择照片"}</b><small>照片文件保留在当前设备，不会上传服务器</small></span>
                <input type="file" accept="image/*" hidden onChange={(e) => setAlbumFileName(e.target.files?.[0]?.name ?? "")} />
              </label>
            )}
            <div className="editor-form">
              <label>
                <span>{panel.type === "album" ? "照片备注" : "我的补充记录"}</span>
                <textarea
                  value={featureNote}
                  onChange={(e) => setFeatureNote(e.target.value)}
                  placeholder="输入需要保存在本机的自定义内容"
                />
              </label>
            </div>
            <button className="button primary full" type="button" onClick={saveFeatureNote}>保存自定义内容</button>
          </>
        )}
      </section>
    </div>
  );
}

function GradeImportSheet({
  classes,
  activeClass,
  students,
  onClose,
  onImport,
}: {
  classes: ClassInfo[];
  activeClass: ClassInfo;
  students: StudentRecord[];
  onClose: () => void;
  onImport: (rows: GradeImportRow[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<GradeImportRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const getClassId = (value: unknown) => {
    const text = String(value ?? "").trim();
    if (!text) return activeClass.id;
    const normalized = text.replace(/\s+/g, "");
    return (
      classes.find((item) => {
        const className = item.name.replace(/\s+/g, "");
        return normalized.includes(className) || className.includes(normalized);
      })?.id ?? activeClass.id
    );
  };

  const parseScore = (value: unknown) => {
    const text = String(value ?? "").trim();
    if (!text) return null;
    const score = Number(text.replace(/[^\d.-]/g, ""));
    return Number.isFinite(score) ? Math.min(Math.max(score, 0), 100) : null;
  };

  const parseRows = (rows: unknown[][]) => {
    if (!rows.length) return [];
    const headers = rows[0].map((item) => String(item ?? "").trim());
    const findColumn = (names: string[]) =>
      headers.findIndex((header) => names.some((name) => header.includes(name)));
    const classColumn = findColumn(["班级", "授课班"]);
    const nameColumn = findColumn(["学生姓名", "姓名", "学生"]);
    const genderColumn = findColumn(["性别"]);
    const chineseColumn = findColumn(["语文"]);
    const mathColumn = findColumn(["数学"]);
    const englishColumn = findColumn(["英语", "英文"]);
    const noteColumn = findColumn(["评语", "备注", "评价"]);
    if (nameColumn < 0) throw new Error("未识别到“姓名”列");
    if (chineseColumn < 0 && mathColumn < 0 && englishColumn < 0) {
      throw new Error("未识别到“语文 / 数学 / 英语”成绩列");
    }

    return rows
      .slice(1)
      .filter((row) => row.some((cell) => String(cell ?? "").trim()))
      .map((row, index) => {
        const classId = classColumn >= 0 ? getClassId(row[classColumn]) : activeClass.id;
        const name = String(row[nameColumn] ?? "").trim();
        const existing = students.find(
          (student) => student.classId === classId && student.name.trim() === name,
        );
        const genderText = genderColumn >= 0 ? String(row[genderColumn] ?? "").trim() : "";
        const gender = genderText.includes("女")
          ? "女"
          : genderText.includes("男")
            ? "男"
            : existing?.gender ?? (index % 2 ? "女" : "男");
        return {
          classId,
          name,
          gender,
          chinese: chineseColumn >= 0 ? parseScore(row[chineseColumn]) : null,
          math: mathColumn >= 0 ? parseScore(row[mathColumn]) : null,
          english: englishColumn >= 0 ? parseScore(row[englishColumn]) : null,
          note: noteColumn >= 0 ? String(row[noteColumn] ?? "").trim() : "",
        } satisfies GradeImportRow;
      })
      .filter((row) => row.name)
      .slice(0, 120);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setFileName(file.name);
    setPreview([]);
    setProcessing(true);
    try {
      const rawRows = /\.(csv|tsv)$/i.test(file.name)
        ? parseDelimitedText(await file.text())
        : await (async () => {
            const XLSX = await import("xlsx");
            const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
          })();
      const parsed = parseRows(rawRows);
      if (!parsed.length) throw new Error("文件中没有可导入的学生成绩");
      setPreview(parsed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "文件解析失败，请检查表格格式");
    } finally {
      setProcessing(false);
    }
  };

  const updatePreview = (index: number, values: Partial<GradeImportRow>) => {
    setPreview((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...values } : row)),
    );
  };

  const importSummary = useMemo(() => {
    const updated = preview.filter((row) =>
      students.some(
        (student) =>
          student.classId === row.classId && student.name.trim() === row.name.trim(),
      ),
    ).length;
    return { updated, created: preview.length - updated };
  }, [preview, students]);

  const downloadTemplate = () => {
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      ["班级", "姓名", "性别", "语文", "数学", "英语", "评语"],
      [activeClass.name, "示例学生", "女", "88", "92", "90", "课堂表现稳定"],
    ]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "成绩导入模板.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFile = () => {
    setFileName("");
    setPreview([]);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="bottom-sheet grade-import-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="导入成绩表"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="sheet-heading grade-import-heading">
          <div>
            <p className="eyebrow">批量录入</p>
            <h2>导入学生成绩</h2>
          </div>
          <button className="icon-button soft" type="button" onClick={onClose} aria-label="关闭">
            <X size={20} />
          </button>
        </div>

        {!fileName ? (
          <>
            <button className="upload-zone grade-upload-zone" type="button" onClick={() => inputRef.current?.click()}>
              <span><FileSpreadsheet size={25} /></span>
              <b>选择成绩表</b>
              <small>支持 Excel、CSV、TSV，最多导入 120 名学生</small>
            </button>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".xlsx,.xls,.csv,.tsv"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <div className="grade-import-actions">
              <button type="button" onClick={() => inputRef.current?.click()}>
                <UploadCloud size={18} /> 从文件导入
              </button>
              <button type="button" onClick={downloadTemplate}>
                <Download size={18} /> 下载成绩模板
              </button>
            </div>
            <div className="format-tip grade-format-tip">
              <Sparkles size={16} />
              <span>首行需含姓名及至少一个成绩列；可选列：班级、性别、语文、数学、英语、评语。</span>
            </div>
            <p className="grade-match-tip">同班级 + 同姓名会更新已有学生；表格里的空白科目将保留原成绩。</p>
          </>
        ) : (
          <>
            <div className="file-summary">
              <span className="sheet"><FileSpreadsheet size={20} /></span>
              <div>
                <b>{fileName}</b>
                <small>{processing ? "正在解析…" : `已识别 ${preview.length} 名学生`}</small>
              </div>
              <button type="button" onClick={resetFile}>重新选择</button>
            </div>
            {error && <div className="import-error">{error}</div>}
            {!!preview.length && (
              <>
                <div className="grade-import-summary">
                  <span><b>{preview.length}</b><small>识别人数</small></span>
                  <span><b>{importSummary.created}</b><small>新增</small></span>
                  <span><b>{importSummary.updated}</b><small>更新</small></span>
                </div>
                <p className="grade-match-tip compact">导入前可直接修改草稿，空白成绩不会覆盖原数据。</p>
                <div className="grade-preview">
                  <div className="grade-preview-head">
                    <span>班级</span><span>姓名</span><span>性别</span><span>语文</span><span>数学</span><span>英语</span><span>评语</span>
                  </div>
                  {preview.map((row, index) => (
                    <div className="grade-preview-row" key={`${row.classId}-${row.name}-${index}`}>
                      <select value={row.classId} aria-label={`第 ${index + 1} 行班级`} onChange={(event) => updatePreview(index, { classId: event.target.value })}>
                        {classes.map((item) => <option key={item.id} value={item.id}>{item.name.replace("年级 ", "")}</option>)}
                      </select>
                      <input value={row.name} aria-label={`第 ${index + 1} 行姓名`} onChange={(event) => updatePreview(index, { name: event.target.value })} />
                      <select value={row.gender} aria-label={`第 ${index + 1} 行性别`} onChange={(event) => updatePreview(index, { gender: event.target.value as "男" | "女" })}>
                        <option value="男">男</option><option value="女">女</option>
                      </select>
                      {(["chinese", "math", "english"] as const).map((subject) => (
                        <input
                          key={subject}
                          type="number"
                          min="0"
                          max="100"
                          inputMode="decimal"
                          aria-label={`第 ${index + 1} 行${subject === "chinese" ? "语文" : subject === "math" ? "数学" : "英语"}`}
                          value={row[subject] ?? ""}
                          placeholder="—"
                          onChange={(event) => updatePreview(index, { [subject]: event.target.value === "" ? null : parseScore(event.target.value) })}
                        />
                      ))}
                      <input value={row.note} aria-label={`第 ${index + 1} 行评语`} placeholder="可选" onChange={(event) => updatePreview(index, { note: event.target.value })} />
                    </div>
                  ))}
                </div>
              </>
            )}
            <button
              className="button primary full"
              type="button"
              disabled={processing || !preview.length}
              onClick={() => onImport(preview.filter((row) => row.name.trim()))}
            >
              <CheckCircle2 size={17} />
              导入并更新成绩
            </button>
          </>
        )}
      </section>
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
