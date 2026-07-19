"use client";

import { useState, useEffect, FormEvent, DragEvent, useRef } from "react";
import Image from "next/image";
import StatusIcons from "./status-icons";
import DateTime from "./date-time";
import { FaCalculator, FaCalendar, FaCamera, FaChrome, FaDownload, FaFolder, FaUserAstronaut } from "react-icons/fa6";
import CalculatorApp from "./calculator-app";
import CalendarApp from "./calendar-app";
import { VscVscode } from "react-icons/vsc";
import { LuListTodo } from "react-icons/lu";
import { BiCamera, BiSolidNotepad } from "react-icons/bi";
import { IoSettings } from "react-icons/io5";
import { RiGamepadFill } from "react-icons/ri";
import { BsCloudSunFill } from "react-icons/bs";
import WeatherApp, { WeatherWidget } from "./weather-app";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@iconify/react";
import MainClock from "./main-clock";
import { FaRedo } from "react-icons/fa";
import { Games } from "./gamesApp"
import { HackaTimeWidget } from "./hackatime-widget";
type Tab = {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  refreshKey: number;
};

type WindowProps = {
  label: string;
  icon: any;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  onFocus: () => void;
  isDragging: boolean;
  isResizing: boolean;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
};

const generateId = () => Math.random().toString(36).substring(2, 9);

function AppIcon({ icon: IconComponent, label, onClick, open }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: label,
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`group relative app ${open ? "open" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : transition,
      }}
      onClick={onClick}
    >
      <IconComponent />

      <span className="top-full left-1/2 z-9999 absolute bg-white/10 opacity-0 group-hover:opacity-100 shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl mt-2 px-3 py-1.5 border border-white/20 rounded-xl font-medium text-white text-sm whitespace-nowrap transition-all -translate-x-1/2 translate-y-2 group-hover:translate-y-0 duration-200 pointer-events-none tooltip">
        {label}
      </span>
    </button>
  );
}

function Window({
  label,
  icon: IconComponent,
  isOpen,
  isMinimized,
  isMaximized,
  x,
  y,
  w,
  h,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onDragStart,
  onResizeStart,
  onFocus,
  isDragging,
  isResizing,
  children,
  headerContent,
}: WindowProps) {
  if (!isOpen) return null;

  return (
    <div
      onMouseDown={onFocus}
      className={`absolute flex flex-col bg-zinc-950/40 shadow-2xl backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden ${isDragging || isResizing
        ? "transition-none"
        : "transition-all duration-200"
        } ${isMinimized ? "opacity-0 scale-95 pointer-events-none translate-y-10" : "opacity-100 scale-100"}`}
      style={
        isMaximized
          ? {
            top: "3.25rem",
            left: 0,
            width: "100vw",
            height: "calc(100vh - 3.25rem)",
            borderRadius: 0,
            zIndex,
          }
          : {
            top: y,
            left: x,
            width: w,
            height: h,
            zIndex,
          }
      }
    >
      <div
        onMouseDown={onDragStart}
        className="flex justify-between items-center gap-2 bg-white/5 px-4 py-2 border-white/5 border-b cursor-default select-none shrink-0"
      >
        <div className="flex flex-1 items-center gap-2 min-w-0">
          {headerContent ? (
            headerContent
          ) : (
            <>
              <IconComponent className="size-4 text-gray-300 shrink-0" />
              <span className="font-medium text-gray-300 text-sm truncate">
                {label}
              </span>
            </>
          )}
        </div>

        <div className="flex gap-1 pr-1 pb-1 nodrag shrink-0">
          <button
            onClick={onMinimize}
            className="hover:bg-white/10 p-2 rounded text-gray-300"
          >
            <Icon icon="mdi:window-minimize" width={16} />
          </button>
          <button
            onClick={onMaximize}
            className="hover:bg-white/10 p-2 rounded text-gray-300"
          >
            <Icon
              icon={isMaximized ? "mdi:window-restore" : "mdi:window-maximize"}
              width={16}
            />
          </button>
          <button
            onClick={onClose}
            className="hover:bg-red-500/80 p-2 rounded text-gray-300 hover:text-white transition-colors"
          >
            <Icon icon="mdi:close" width={16} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-col flex-1 overflow-hidden">
        {children}
      </div>

      {!isMaximized && (
        <div
          onMouseDown={onResizeStart}
          className="right-0 bottom-0 z-99999 absolute w-4 h-4 cursor-se-resize"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.2) 50%)",
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  const [online, setOnline] = useState(false);
  const [battery, setBattery] = useState(100);
  const [charging, setCharging] = useState(false);
  const [wifiStrength, setWifiStrength] = useState<0 | 1 | 2 | 3 | 4>(4);
  const [currentScreen, setCurrentScreen] = useState("LOGIN");
  const [pin, setPin] = useState("");

  const [wallpaper, setWallpaper] = useState("/wallpaper-2.jpg");
  const [settingsTab, setSettingsTab] = useState("personalization");
  const [settingsWifi, setSettingsWifi] = useState(true);
  const [settingsBluetooth, setSettingsBluetooth] = useState(false);

  const [cpuUsage, setCpuUsage] = useState(24);
  const [memUsage, setMemUsage] = useState(48);

  const [vscodeActiveFile, setVscodeActiveFile] = useState("page.tsx");

  const [notepadText, setNotepadText] = useState(
    "Welcome to Notepad on GlassOS!\nFeel free to write anything here.",
  );

  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState([
    {
      id: "1",
      text: "Design clean and transparent OS layout",
      completed: true,
    },
    {
      id: "2",
      text: "Implement multiple draggable application windows",
      completed: true,
    },
    {
      id: "3",
      text: "Create custom application boilerplates",
      completed: false,
    },
    { id: "4", text: "Fix window z-index layering issues", completed: false },
  ]);

  const [gameBoard, setGameBoard] = useState<(string | null)[]>(
    Array(9).fill(null),
  );
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [gameScores, setGameScores] = useState({ player: 0, ai: 0, ties: 0 });

  const [deviceInfo, setDeviceInfo] = useState<Record<string, string | number>>(
    {},
  );

  useEffect(() => {
    const handleCalcMode = (e: Event) => {
      const customEvent = e as CustomEvent;
      const mode = customEvent.detail.mode;
      setWindows((prev) => {
        const calc = prev["Calculator"];
        if (!calc) return prev;
        let targetWidth = 360;
        let targetHeight = 580;
        if (mode === "both") {
          targetWidth = 720;
          targetHeight = 440;
        } else if (mode === "scientific") {
          targetWidth = 380;
          targetHeight = 580;
        }
        return {
          ...prev,
          Calculator: {
            ...calc,
            w: targetWidth,
            h: targetHeight,
          },
        };
      });
    };
    window.addEventListener("calculatorModeChange", handleCalcMode);
    return () => window.removeEventListener("calculatorModeChange", handleCalcMode);
  }, []);

  const [windows, setWindows] = useState<
    Record<
      string,
      {
        isOpen: boolean;
        isMinimized: boolean;
        isMaximized: boolean;
        x: number;
        y: number;
        w: number;
        h: number;
        zIndex: number;
      }
    >
  >({
    Settings: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 120,
      y: 70,
      w: 650,
      h: 500,
      zIndex: 1,
    },
    "Visual Studio Code": {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 140,
      y: 90,
      w: 800,
      h: 550,
      zIndex: 1,
    },
    Notepad: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 180,
      y: 130,
      w: 550,
      h: 400,
      zIndex: 1,
    },
    Camera: {
      isOpen: false,
      isMinimized: false,
      isMaximized: true,
      x: 240,
      y: 130,
      w: 550,
      h: 400,
      zIndex: 1,
    },
    Calculator: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 180,
      y: 100,
      w: 360,
      h: 580,
      zIndex: 1,
    },
    Calendar: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 240,
      y: 90,
      w: 800,
      h: 560,
      zIndex: 1,
    },
    "To-Do": {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 200,
      y: 150,
      w: 450,
      h: 450,
      zIndex: 1,
    },
    "Google Chrome": {
      isOpen: false,
      isMinimized: false,
      isMaximized: true,
      x: 100,
      y: 50,
      w: 900,
      h: 600,
      zIndex: 1,
    },
    Games: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 220,
      y: 170,
      w: 500,
      h: 480,
      zIndex: 1,
    },
    Weather: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 160,
      y: 100,
      w: 800,
      h: 580,
      zIndex: 1,
    },
  });

  const [maxZIndex, setMaxZIndex] = useState(10);
  const [draggedWindow, setDraggedWindow] = useState<string | null>(null);
  const [resizedWindow, setResizedWindow] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: generateId(),
      title: "Portfolio",
      url: "https://www.thenicedev.xyz",
      history: ["https://www.thenicedev.xyz"],
      historyIndex: 0,
      refreshKey: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [addressBarInput, setAddressBarInput] = useState(tabs[0].url);
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");

  useEffect(() => {
    (async () => {
      await navigator.mediaDevices.getUserMedia({ video: true });

      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter(d => d.kind === "videoinput");

      setDevices(cams);

      if (cams.length) {
        setCameraId(cams[0].deviceId);
      }
    })();

    return stopCamera;
  }, []);

  useEffect(() => {
    if (cameraId) startCamera(cameraId);
  }, [cameraId]);

  async function init() {
    await startCamera();

    const allDevices = await navigator.mediaDevices.enumerateDevices();

    const cams = allDevices.filter((d) => d.kind === "videoinput");

    setDevices(cams);

    if (cams.length) setCameraId(cams[0].deviceId);
  }

  async function startCamera(deviceId?: string) {
    stopCamera();

    const media = await navigator.mediaDevices.getUserMedia({
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: "environment" },
      audio: false,
    });

    streamRef.current = media;

    if (videoRef.current) {
      videoRef.current.srcObject = media;
      await videoRef.current.play();
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }

  function capture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    setPhoto(canvas.toDataURL("image/png"));
  }

  function download() {
    if (!photo) return;

    const a = document.createElement("a");
    a.href = photo;
    a.download = `photo-${Date.now()}.png`;
    a.click();
  }

  async function retake() {
    setPhoto(null);

    if (cameraId) {
      await startCamera(cameraId);
    } else {
      await startCamera();
    }
  }

  const bringToFront = (label: string) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows((prev) => ({
      ...prev,
      [label]: {
        ...prev[label],
        zIndex: nextZ,
        isMinimized: false,
      },
    }));
  };

  const handleWindowDragStart = (e: React.MouseEvent, label: string) => {
    const win = windows[label];
    if (!win || win.isMaximized) return;
    if ((e.target as HTMLElement).closest(".nodrag")) return;

    bringToFront(label);
    setDraggedWindow(label);

    const startX = e.clientX - win.x;
    const startY = e.clientY - win.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setWindows((prev) => {
        const w = prev[label];
        if (!w) return prev;

        const topBoundary = 52;
        const headerHeight = 40;

        let newX = moveEvent.clientX - startX;
        let newY = moveEvent.clientY - startY;

        const maxY = window.innerHeight - headerHeight;
        newY = Math.max(topBoundary, Math.min(maxY, newY));

        const minX = 100 - w.w;
        const maxX = window.innerWidth - 100;
        newX = Math.max(minX, Math.min(maxX, newX));

        return {
          ...prev,
          [label]: {
            ...w,
            x: newX,
            y: newY,
          },
        };
      });
    };

    const handleMouseUp = () => {
      setDraggedWindow(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, label: string) => {
    e.stopPropagation();
    const win = windows[label];
    if (!win) return;

    bringToFront(label);
    setResizedWindow(label);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.w;
    const startH = win.h;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setWindows((prev) => {
        const w = prev[label];
        if (!w) return prev;
        return {
          ...prev,
          [label]: {
            ...w,
            w: Math.max(400, startW + (moveEvent.clientX - startX)),
            h: Math.max(300, startH + (moveEvent.clientY - startY)),
          },
        };
      });
    };

    const handleMouseUp = () => {
      setResizedWindow(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleAppClick = (label: string) => {
    const win = windows[label];
    if (!win) return;

    if (!win.isOpen) {
      const nextZ = maxZIndex + 1;
      setMaxZIndex(nextZ);
      setWindows((prev) => ({
        ...prev,
        [label]: {
          ...prev[label],
          isOpen: true,
          isMinimized: false,
          zIndex: nextZ,
        },
      }));
    } else if (win.isMinimized) {
      const nextZ = maxZIndex + 1;
      setMaxZIndex(nextZ);
      setWindows((prev) => ({
        ...prev,
        [label]: {
          ...prev[label],
          isMinimized: false,
          zIndex: nextZ,
        },
      }));
    } else {
      const isFrontmost = Object.keys(windows).every((key) => {
        return (
          !windows[key].isOpen ||
          windows[key].isMinimized ||
          windows[key].zIndex <= win.zIndex
        );
      });

      if (isFrontmost) {
        setWindows((prev) => ({
          ...prev,
          [label]: {
            ...prev[label],
            isMinimized: true,
          },
        }));
      } else {
        bringToFront(label);
      }
    }
  };

  const addNewTab = () => {
    const newTab: Tab = {
      id: generateId(),
      title: "New Tab",
      url: "https://example.com",
      history: ["https://example.com"],
      historyIndex: 0,
      refreshKey: 0,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setAddressBarInput(newTab.url);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      setWindows((prev) => ({
        ...prev,
        "Google Chrome": { ...prev["Google Chrome"], isOpen: false },
      }));
      return;
    }
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      const closedIndex = tabs.findIndex((t) => t.id === id);
      const nextTab = newTabs[Math.max(0, closedIndex - 1)];
      setActiveTabId(nextTab.id);
      setAddressBarInput(nextTab.url);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTabId(tab.id);
    setAddressBarInput(tab.url);
  };

  const handleTabDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedTabIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTabDrop = (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedTabIndex === null || draggedTabIndex === targetIndex) return;
    const newTabs = [...tabs];
    const [draggedTab] = newTabs.splice(draggedTabIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);
    setTabs(newTabs);
    setDraggedTabIndex(null);
  };

  const handleTabDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleNavigate = (e: FormEvent) => {
    e.preventDefault();
    let finalUrl = addressBarInput.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }
    setTabs(
      tabs.map((tab) => {
        if (tab.id === activeTabId) {
          const newHistory = tab.history.slice(0, tab.historyIndex + 1);
          newHistory.push(finalUrl);
          return {
            ...tab,
            url: finalUrl,
            title: new URL(finalUrl).hostname,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }
        return tab;
      }),
    );
    setAddressBarInput(finalUrl);
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const newUrl = activeTab.history[newIndex];
      updateActiveTabHistory(newIndex, newUrl);
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const newUrl = activeTab.history[newIndex];
      updateActiveTabHistory(newIndex, newUrl);
    }
  };

  const updateActiveTabHistory = (newIndex: number, newUrl: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, historyIndex: newIndex, url: newUrl }
          : tab,
      ),
    );
    setAddressBarInput(newUrl);
  };

  const handleRefresh = () => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, refreshKey: tab.refreshKey + 1 }
          : tab,
      ),
    );
  };

  const handleLogin = (value: string) => {
    setCurrentScreen("HOME");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
    if (value.length === 4) handleLogin(value);
  };

  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      if (!connection) {
        setWifiStrength(navigator.onLine ? 4 : 0);
        return;
      }
      const downlink = connection.downlink ?? 0;
      if (!navigator.onLine) setWifiStrength(0);
      else if (downlink < 1) setWifiStrength(1);
      else if (downlink < 5) setWifiStrength(2);
      else if (downlink < 20) setWifiStrength(3);
      else setWifiStrength(4);
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    connection?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (!("getBattery" in navigator)) return;
    let batteryManager: any;
    const updateBattery = () => {
      setBattery(Math.round(batteryManager.level * 100));
      setCharging(batteryManager.charging);
    };
    (navigator as any).getBattery().then((battery: any) => {
      batteryManager = battery;
      updateBattery();
      battery.addEventListener("levelchange", updateBattery);
      battery.addEventListener("chargingchange", updateBattery);
    });
    return () => {
      if (!batteryManager) return;
      batteryManager.removeEventListener("levelchange", updateBattery);
      batteryManager.removeEventListener("chargingchange", updateBattery);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 20) + 15);
      setMemUsage(Math.floor(Math.random() * 10) + 40);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const conn = (navigator as any).connection;
    const info = {
      "User Agent": navigator.userAgent,
      "System Language": navigator.language,
      "Logical CPU Cores": navigator.hardwareConcurrency || "Unknown",
      "Estimated Memory": (navigator as any).deviceMemory
        ? `${(navigator as any).deviceMemory} GB`
        : "Unknown",
      "Screen Resolution": `${window.screen.width} x ${window.screen.height}`,
      "Viewport Size": `${window.innerWidth} x ${window.innerHeight}`,
      "Device Pixel Ratio": window.devicePixelRatio,
      "Network Protocol":
        conn?.effectiveType || (navigator.onLine ? "Online" : "Offline"),
      "Network Downlink": conn?.downlink ? `${conn.downlink} Mbps` : "Unknown",
      "Local Time Zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    setDeviceInfo(info);
  }, [battery, charging, online]);

  const initialApps = [
    { icon: FaCalculator, label: "Calculator" },
    { icon: FaCalendar, label: "Calendar" },
    { icon: FaCamera, label: "Camera" },
    { icon: IoSettings, label: "Settings" },
    { icon: VscVscode, label: "Visual Studio Code" },
    { icon: BiSolidNotepad, label: "Notepad" },
    { icon: LuListTodo, label: "To-Do" },
    { icon: FaChrome, label: "Google Chrome" },
    { icon: RiGamepadFill, label: "Games" },
    { icon: BsCloudSunFill, label: "Weather" },
  ];
  const [items, setItems] = useState(initialApps);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedWallpaper = localStorage.getItem("glassos_wallpaper");
      if (savedWallpaper) setWallpaper(savedWallpaper);

      const savedNotepad = localStorage.getItem("glassos_notepadText");
      if (savedNotepad) setNotepadText(savedNotepad);

      const savedTodos = localStorage.getItem("glassos_todos");
      if (savedTodos) setTodos(JSON.parse(savedTodos));

      const savedScores = localStorage.getItem("glassos_gameScores");
      if (savedScores) setGameScores(JSON.parse(savedScores));

      const savedWindows = localStorage.getItem("glassos_windows");
      if (savedWindows) {
        const parsed = JSON.parse(savedWindows);
        setWindows((prev) => {
          const merged = { ...prev };
          Object.keys(parsed).forEach((key) => {
            if (merged[key]) {
              merged[key] = { ...merged[key], ...parsed[key] };
            }
          });
          return merged;
        });
      }

      const savedTabs = localStorage.getItem("glassos_tabs");
      if (savedTabs) setTabs(JSON.parse(savedTabs));

      const savedActiveTabId = localStorage.getItem("glassos_activeTabId");
      if (savedActiveTabId) setActiveTabId(savedActiveTabId);

      const savedTaskbar = localStorage.getItem("glassos_taskbar_order");
      if (savedTaskbar) {
        const orderedLabels = JSON.parse(savedTaskbar);
        const orderedApps = orderedLabels
          .map((label: string) =>
            initialApps.find((app) => app.label === label),
          )
          .filter(Boolean) as any[];

        initialApps.forEach((app: any) => {
          if (!orderedLabels.includes(app.label)) {
            orderedApps.push(app);
          }
        });
        setItems(orderedApps);
      }

      const savedVscodeFile = localStorage.getItem("glassos_vscodeActiveFile");
      if (savedVscodeFile) setVscodeActiveFile(savedVscodeFile);

      const savedWifi = localStorage.getItem("glassos_settingsWifi");
      if (savedWifi) setSettingsWifi(savedWifi === "true");

      const savedBluetooth = localStorage.getItem("glassos_settingsBluetooth");
      if (savedBluetooth) setSettingsBluetooth(savedBluetooth === "true");

      const savedScreen = localStorage.getItem("glassos_currentScreen");
      if (savedScreen) setCurrentScreen(savedScreen);
    } catch (e) {
      console.error("Error loading states from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_wallpaper", wallpaper);
    }
  }, [wallpaper]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_notepadText", notepadText);
    }
  }, [notepadText]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_todos", JSON.stringify(todos));
    }
  }, [todos]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_gameScores", JSON.stringify(gameScores));
    }
  }, [gameScores]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_windows", JSON.stringify(windows));
    }
  }, [windows]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_tabs", JSON.stringify(tabs));
    }
  }, [tabs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_activeTabId", activeTabId);
    }
  }, [activeTabId]);

  useEffect(() => {
    if (typeof window !== "undefined" && items) {
      const labels = items.map((app) => app.label);
      localStorage.setItem("glassos_taskbar_order", JSON.stringify(labels));
    }
  }, [items]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_vscodeActiveFile", vscodeActiveFile);
    }
  }, [vscodeActiveFile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_settingsWifi", String(settingsWifi));
    }
  }, [settingsWifi]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "glassos_settingsBluetooth",
        String(settingsBluetooth),
      );
    }
  }, [settingsBluetooth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_currentScreen", currentScreen);
    }
  }, [currentScreen]);

  const renderChrome = () => {
    return (
      <div className="flex flex-col flex-1 bg-[#2b2c2f]">
        <div className="flex items-center gap-2 bg-[#2b2c2f] px-3 border-zinc-700 border-b h-12">
          <button
            onClick={handleBack}
            disabled={activeTab.historyIndex === 0}
            className="hover:bg-white/10 disabled:opacity-30 p-2 rounded-full text-gray-300"
          >
            <Icon icon="mdi:arrow-left" width={18} />
          </button>
          <button
            onClick={handleForward}
            disabled={activeTab.historyIndex === activeTab.history.length - 1}
            className="hover:bg-white/10 disabled:opacity-30 p-2 rounded-full text-gray-300"
          >
            <Icon icon="mdi:arrow-right" width={18} />
          </button>
          <button
            onClick={handleRefresh}
            className="hover:bg-white/10 p-2 rounded-full text-gray-300"
          >
            <Icon icon="mdi:refresh" width={18} />
          </button>

          <form onSubmit={handleNavigate} className="flex flex-1 mx-2">
            <div className="flex flex-1 items-center bg-[#1e1e20] focus-within:bg-[#1e1e20] px-4 py-1.5 border border-zinc-600 focus-within:border-blue-500 rounded-full transition-all">
              <Icon
                icon="mdi:lock-outline"
                width={16}
                className="mr-2 text-green-400 shrink-0"
              />
              <input
                type="text"
                value={addressBarInput}
                onChange={(e) => setAddressBarInput(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-200 text-sm"
                placeholder="Search Google or type a URL"
              />
              <Icon
                icon="mdi:star-outline"
                width={18}
                className="ml-2 text-gray-400 hover:text-gray-200 cursor-pointer shrink-0"
              />
            </div>
          </form>

          <button className="hover:bg-white/10 p-2 rounded-full text-gray-300">
            <Icon icon="mdi:dots-vertical" width={18} />
          </button>
        </div>

        <div className="relative flex-1 bg-white">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`absolute inset-0 ${tab.id === activeTabId ? "z-10 block" : "z-0 hidden"}`}
            >
              <iframe
                key={`${tab.id}-${tab.refreshKey}`}
                src={tab.url}
                className={`bg-white border-none w-full h-full ${draggedWindow || resizedWindow ? "pointer-events-none" : ""}`}
                title={tab.title}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="flex flex-row flex-1 bg-zinc-950/20 text-white">
        <div className="flex flex-col gap-2 bg-zinc-950/40 p-4 border-white/5 border-r w-48 overflow-y-auto text-left shrink-0">
          <button
            onClick={() => setSettingsTab("personalization")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left cursor-pointer ${settingsTab === "personalization" ? "bg-white/10 font-semibold" : "opacity-75 hover:bg-white/5"}`}
          >
            <Icon icon="mdi:palette" width={16} />
            <span>Personalization</span>
          </button>
          <button
            onClick={() => setSettingsTab("system")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left cursor-pointer ${settingsTab === "system" ? "bg-white/10 font-semibold" : "opacity-75 hover:bg-white/5"}`}
          >
            <Icon icon="mdi:cog" width={16} />
            <span>System Info</span>
          </button>
          <button
            onClick={() => setSettingsTab("about")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left cursor-pointer ${settingsTab === "about" ? "bg-white/10 font-semibold" : "opacity-75 hover:bg-white/5"}`}
          >
            <Icon icon="mdi:information" width={16} />
            <span>About OS</span>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {settingsTab === "personalization" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 font-semibold text-lg">
                  Desktop Wallpaper
                </h3>
                <p className="mb-3 text-white/50 text-xs">
                  Choose a background image for your workspace.
                </p>
                <div className="gap-4 grid grid-cols-2">
                  <button
                    onClick={() => setWallpaper("/wallpaper-1.jpg")}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${wallpaper === "/wallpaper-1.jpg" ? "border-blue-500 scale-[1.02]" : "border-white/10 hover:border-white/30"}`}
                  >
                    <Image
                      src="/wallpaper-1.jpg"
                      alt="Wallpaper 1"
                      fill
                      className="object-cover"
                    />
                  </button>
                  <button
                    onClick={() => setWallpaper("/wallpaper-2.jpg")}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${wallpaper === "/wallpaper-2.jpg" ? "border-blue-500 scale-[1.02]" : "border-white/10 hover:border-white/30"}`}
                  >
                    <Image
                      src="/wallpaper-2.jpg"
                      alt="Wallpaper 2"
                      fill
                      className="object-cover"
                    />
                  </button>
                  <button
                    onClick={() => setWallpaper("/wallpaper-3.jpg")}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${wallpaper === "/wallpaper-3.jpg" ? "border-blue-500 scale-[1.02]" : "border-white/10 hover:border-white/30"}`}
                  >
                    <Image
                      src="/wallpaper-3.jpg"
                      alt="Wallpaper 3"
                      fill
                      className="object-cover"
                    />
                  </button>
                  <button
                    onClick={() => setWallpaper("/wallpaper-4.jpg")}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${wallpaper === "/wallpaper-4.jpg" ? "border-blue-500 scale-[1.02]" : "border-white/10 hover:border-white/30"}`}
                  >
                    <Image
                      src="/wallpaper-4.jpg"
                      alt="Wallpaper 4"
                      fill
                      className="object-cover"
                    />
                  </button>
                  <button
                    onClick={() => setWallpaper("/wallpaper-5.jpg")}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${wallpaper === "/wallpaper-5.jpg" ? "border-blue-500 scale-[1.02]" : "border-white/10 hover:border-white/30"}`}
                  >
                    <Image
                      src="/wallpaper-5.jpg"
                      alt="Wallpaper 5"
                      fill
                      className="object-cover"
                    />
                  </button>
                  <button
                    onClick={() => setWallpaper("/wallpaper-6.jpg")}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${wallpaper === "/wallpaper-6.jpg" ? "border-blue-500 scale-[1.02]" : "border-white/10 hover:border-white/30"}`}
                  >
                    <Image
                      src="/wallpaper-6.jpg"
                      alt="Wallpaper 6"
                      fill
                      className="object-cover"
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "system" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg">System Resources</h3>
                <div className="gap-4 grid grid-cols-2">
                  <div className="bg-white/5 p-4 border border-white/5 rounded-2xl">
                    <div className="flex justify-between mb-2 text-white/60 text-sm">
                      <span>CPU Usage</span>
                      <span>{cpuUsage}%</span>
                    </div>
                    <div className="bg-white/10 rounded-full w-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 border border-white/5 rounded-2xl">
                    <div className="flex justify-between mb-2 text-white/60 text-sm">
                      <span>Memory Usage</span>
                      <span>{memUsage}%</span>
                    </div>
                    <div className="bg-white/10 rounded-full w-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full transition-all duration-500"
                        style={{ width: `${memUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg">
                  Network & Connections
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 p-3 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon
                        icon="mdi:wifi"
                        className="text-blue-400"
                        width={20}
                      />
                      <div>
                        <div className="font-semibold text-sm">
                          Wi-Fi Connection
                        </div>
                        <div className="text-white/50 text-xs">
                          {settingsWifi
                            ? "Connected to GlassNet"
                            : "Disconnected"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettingsWifi(!settingsWifi)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${settingsWifi ? "bg-blue-500" : "bg-white/20"}`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settingsWifi ? "translate-x-6" : ""}`}
                      ></div>
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-3 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Icon
                        icon="mdi:bluetooth"
                        className="text-blue-400"
                        width={20}
                      />
                      <div>
                        <div className="font-semibold text-sm">Bluetooth</div>
                        <div className="text-white/50 text-xs">
                          {settingsBluetooth
                            ? "Searching for devices..."
                            : "Off"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettingsBluetooth(!settingsBluetooth)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${settingsBluetooth ? "bg-blue-500" : "bg-white/20"}`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${settingsBluetooth ? "translate-x-6" : ""}`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "about" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-white/5 border-b">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <FaUserAstronaut className="size-12 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">GlassOS</h3>
                  <p className="text-white/60 text-xs">
                    Version 1.0.0 (Build 2026.07)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-white/70 text-sm select-none">
                  Device Specifications
                </h4>
                <div className="gap-3 grid grid-cols-1 md:grid-cols-2 text-white/80 text-xs">
                  {Object.entries(deviceInfo).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between bg-white/5 backdrop-blur-md p-2.5 border border-white/5 rounded-xl"
                    >
                      <span className="text-white/40">{key}</span>
                      <span
                        className="max-w-[60%] font-medium text-right truncate"
                        title={String(val)}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-white/70 text-sm select-none">
                  System Applications
                </h4>
                <div className="gap-3 grid grid-cols-2">
                  {initialApps.map((app) => {
                    const win = windows[app.label];
                    const isOpen = win ? win.isOpen : false;
                    return (
                      <div
                        key={app.label}
                        className="flex justify-between items-center bg-white/5 hover:bg-white/10 backdrop-blur-md p-3 border border-white/5 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <app.icon className="size-5 text-white/70 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs truncate">
                              {app.label}
                            </div>
                            <div className="text-[10px] text-white/40">
                              {isOpen ? "Running" : "Closed"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAppClick(app.label)}
                          className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg font-semibold text-[10px] text-white transition-all cursor-pointer shrink-0"
                        >
                          {isOpen ? "Focus" : "Launch"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVSCode = () => {
    const vscodeFiles = {
      "page.tsx": `"use client"
import React, { useState } from 'react';
import Desktop from './components/Desktop';

export default function Home() {
  const [isReady, setIsReady] = useState(true);
  return <Desktop ready={isReady} />;
}`,
      "globals.css": `@theme {
  --color-glass-bg: rgba(255, 255, 255, 0.1);
  --color-glass-border: rgba(255, 255, 255, 0.2);
}

.glass {
  background: var(--color-glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
}`,
      "package.json": `{
  "name": "glass-os",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`,
    };

    return (
      <div className="flex flex-col flex-1 bg-[#1e1e1e]/85 backdrop-blur-md font-mono text-white text-xs">
        <div className="flex flex-row flex-1 min-h-0">
          <div className="flex flex-col bg-[#252526]/80 border-[#1e1e1e]/50 border-r w-48 overflow-y-auto shrink-0">
            <div className="px-3 py-2 font-bold text-[10px] text-white/50 uppercase tracking-wider select-none">
              Explorer
            </div>
            <div className="flex flex-col gap-1 p-2">
              {Object.keys(vscodeFiles).map((filename) => (
                <button
                  key={filename}
                  onClick={() => setVscodeActiveFile(filename)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-left transition-all cursor-pointer ${vscodeActiveFile === filename ? "bg-[#37373d]/70 text-white" : "text-white/60 hover:bg-[#2a2a2b]/70"}`}
                >
                  <Icon
                    icon="vscode-icons:file-type-typescript-official"
                    width={14}
                  />
                  <span>{filename}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-transparent min-w-0">
            <div className="flex bg-[#2d2d2d]/60 border-[#1e1e1e]/50 border-b h-9 shrink-0">
              <div className="flex items-center gap-2 bg-[#1e1e1e]/55 px-4 py-2 border-t border-t-blue-500 text-xs select-none">
                <Icon
                  icon="vscode-icons:file-type-typescript-official"
                  width={14}
                />
                <span>{vscodeActiveFile}</span>
              </div>
            </div>
            <textarea
              readOnly
              value={
                vscodeFiles[vscodeActiveFile as keyof typeof vscodeFiles] || ""
              }
              className="flex-1 bg-transparent p-4 border-none outline-none overflow-auto font-mono text-blue-300 leading-relaxed whitespace-pre resize-none"
            />
          </div>
        </div>
        <div className="flex flex-col bg-[#1e1e1e]/90 border-[#2d2d2d]/50 border-t h-32 shrink-0">
          <div className="flex items-center gap-2 bg-[#252526]/60 px-4 py-1.5 font-bold text-[10px] text-white/50 uppercase select-none">
            <Icon icon="mdi:terminal" width={12} />
            <span>Terminal</span>
          </div>
          <div className="flex-1 p-3 overflow-y-auto text-green-400 leading-relaxed">
            <div>$ npm run dev</div>
            <div className="text-white/70">
              ready - started server on 0.0.0.0:3000, url: http://localhost:3000
            </div>
            <div className="text-white/70">
              event - compiled client and server successfully in 321ms (18
              modules)
            </div>
            <div className="text-green-500">compiled successfully!</div>
            <div className="inline-block bg-white ml-1 w-1.5 h-3.5 align-middle animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };

  const renderCamera = () => {

    return (
      <div className="flex flex-col flex-1 gap-4 bg-amber-50/5 backdrop-blur-md p-4 overflow-hidden text-stone-100">
        <select
          className="bg-black/40 p-2 rounded"
          value={cameraId}
          onChange={(e) => setCameraId(e.target.value)}
        >
          {devices.map((d, i) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${i + 1}`}
            </option>
          ))}
        </select>

        <div className="flex flex-1 justify-center items-center rounded-xl overflow-hidden">
          {photo ? (
            <img
              src={photo}
              alt="Captured"
              className="rounded-xl w-full h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="rounded-xl w-full h-full object-cover aspect-video"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-center gap-3">
          {!photo ? (
            <button
              onClick={capture}
              className="bg-white p-4 rounded-full text-black"
            >
              <FaCamera />
            </button>
          ) : (
            <>
              <button
                onClick={retake}
                className="bg-yellow-500 p-4 rounded-full"
              >
                <FaRedo />
              </button>

              <button
                onClick={download}
                className="bg-green-600 p-4 rounded-full"
              >
                <FaDownload />
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderNotepad = () => {
    return (
      <div className="flex flex-col flex-1 bg-amber-50/5 backdrop-blur-md p-4 text-stone-100">
        <div className="flex items-center gap-2 mb-2 pb-2 border-white/5 border-b select-none">
          <button
            onClick={() => {
              alert("New file created!");
              setNotepadText("");
            }}
            className="hover:bg-white/10 px-3 py-1 rounded text-white text-xs transition-all cursor-pointer"
          >
            New
          </button>
          <button
            onClick={() => {
              alert("Text saved to local device (simulated)");
            }}
            className="hover:bg-white/10 px-3 py-1 rounded text-white text-xs transition-all cursor-pointer"
          >
            Save
          </button>
        </div>
        <textarea
          value={notepadText}
          onChange={(e) => setNotepadText(e.target.value)}
          className="flex-1 bg-transparent p-2 border-none outline-none font-sans text-white/95 placeholder:text-white/20 text-sm leading-relaxed resize-none"
          placeholder="Start writing..."
        />
      </div>
    );
  };

  const renderToDo = () => {
    const activeCount = todos.filter((t) => !t.completed).length;
    const progress = todos.length
      ? Math.round(
        (todos.filter((t) => t.completed).length / todos.length) * 100,
      )
      : 0;

    const handleAddTodo = (e: React.FormEvent) => {
      e.preventDefault();
      if (!todoInput.trim()) return;
      setTodos([
        ...todos,
        { id: generateId(), text: todoInput.trim(), completed: false },
      ]);
      setTodoInput("");
    };

    const toggleTodo = (id: string) => {
      setTodos(
        todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    };

    const deleteTodo = (id: string) => {
      setTodos(todos.filter((t) => t.id !== id));
    };

    return (
      <div className="flex flex-col flex-1 bg-zinc-950/50 backdrop-blur-md p-6 overflow-y-auto text-white">
        <div className="flex justify-between items-center mb-4 select-none shrink-0">
          <div>
            <h3 className="font-bold text-lg">Productivity To-Do</h3>
            <p className="text-white/40 text-xs">
              {activeCount} tasks remaining
            </p>
          </div>
          <div className="font-semibold text-blue-400 text-xs">
            {progress}% Done
          </div>
        </div>

        <div className="bg-white/10 mb-6 rounded-full w-full h-1.5 overflow-hidden shrink-0">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <form onSubmit={handleAddTodo} className="flex gap-2 mb-6 shrink-0">
          <input
            type="text"
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            className="flex-1 bg-white/5 px-4 py-2 border border-white/10 focus:border-blue-500 rounded-xl outline-none text-sm transition-colors"
            placeholder="Add a new task..."
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl font-semibold text-white text-sm transition-colors cursor-pointer"
          >
            <Icon icon="mdi:plus" width={16} />
            <span>Add</span>
          </button>
        </form>

        <div className="flex-1 space-y-2 min-h-0 overflow-y-auto">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex justify-between items-center bg-white/5 hover:bg-white/10 px-4 py-3 border border-white/5 rounded-xl transition-colors"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => toggleTodo(todo.id)}
              >
                <Icon
                  icon={
                    todo.completed
                      ? "mdi:checkbox-marked-circle"
                      : "mdi:checkbox-blank-circle-outline"
                  }
                  className={
                    todo.completed ? "text-green-400" : "text-white/40"
                  }
                  width={20}
                />
                <span
                  className={`text-sm ${todo.completed ? "line-through text-white/40" : "text-white"}`}
                >
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 rounded text-white/40 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Icon icon="mdi:delete" width={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalculator = () => {
    return <CalculatorApp />;
  }

  const renderCalendar = () => {
    return <CalendarApp />;
  }

  const renderAppContent = (label: string) => {
    switch (label) {
      case "Google Chrome":
        return renderChrome();
      case "Settings":
        return renderSettings();
      case "Camera":
        return renderCamera();
      case "Visual Studio Code":
        return renderVSCode();
      case "Notepad":
        return renderNotepad();
      case "Calculator":
        return renderCalculator();
      case "Calendar":
        return renderCalendar();
      case "To-Do":
        return renderToDo();
      case "Games":
        return <Games />;
      case "Weather":
        return <WeatherApp />;
      default:
        return null;
    }
  };

  const chromeHeader = (
    <div className="flex flex-1 items-end gap-1 mt-1 overflow-x-auto no-scrollbar nodrag">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleTabDragStart(e, index)}
            onDrop={(e) => handleTabDrop(e, index)}
            onDragOver={handleTabDragOver}
            onClick={() => switchTab(tab)}
            className={`group flex items-center gap-2 max-w-50 min-w-30 px-4 py-2 rounded-t-xl text-sm cursor-pointer transition-colors ${isActive
              ? "bg-[#2b2c2f] text-gray-100"
              : "bg-transparent text-gray-400 hover:bg-white/5"
              }`}
          >
            <Icon icon="mdi:web" className="shrink-0" width={16} />
            <span className="flex-1 font-medium truncate">{tab.title}</span>
            <Icon
              icon="mdi:close"
              width={14}
              onClick={(e: React.MouseEvent) => closeTab(e, tab.id)}
              className={`shrink-0 rounded-full hover:bg-white/20 p-px transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
            />
          </div>
        );
      })}
      <button
        onClick={addNewTab}
        className="hover:bg-white/10 mb-1.5 ml-1 p-1 rounded-full text-gray-400 transition-colors cursor-pointer"
      >
        <Icon icon="mdi:plus" width={18} />
      </button>
    </div>
  );

  return (
    <div className="relative w-dvw h-dvh overflow-hidden">
      <div
        className={`z-0 absolute inset-0 bg-black size-full ${currentScreen === "LOGIN" && "blur-lg"} transition-all`}
      >
        <Image
          src={wallpaper}
          alt="Background"
          fill
          className="opacity-80 object-cover"
        />
      </div>

      {currentScreen !== "LOGIN" ? (
        <>
          <div className="top-0 z-1 absolute flex flex-row justify-between items-center bg-black/20 backdrop-blur-md px-4 border-white/10 border-b w-full h-13 glass-navbar">
            <div className="flex flex-col justify-center items-start text-white text-start leading-none select-none">
              <DateTime />
            </div>

            <div className="flex flex-row items-center gap-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (!over || active.id === over.id) return;
                  setItems((items) => {
                    const oldIndex = items.findIndex(
                      (i) => i.label === active.id,
                    );
                    const newIndex = items.findIndex(
                      (i) => i.label === over.id,
                    );
                    return arrayMove(items, oldIndex, newIndex);
                  });
                }}
              >
                <SortableContext
                  items={items.map((i) => i.label)}
                  strategy={horizontalListSortingStrategy}
                >
                  {items.map((app) => {
                    const win = windows[app.label];
                    const isOpen = win ? win.isOpen : false;
                    const onClick = () => handleAppClick(app.label);
                    return (
                      <AppIcon
                        key={app.label}
                        {...app}
                        open={isOpen}
                        onClick={onClick}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>

            <div className="flex flex-row items-center gap-2 text-white">
              <StatusIcons
                battery={battery}
                charging={charging}
                wifiStrength={wifiStrength}
                online={online}
              />
            </div>
          </div>

          <div className="top-1/2 left-1/2 absolute flex flex-col items-center gap-2 -translate-1/2">
            <MainClock />
            <WeatherWidget onClick={() => handleAppClick("Weather")} />
          </div>

          <div className="right-5 bottom-10 absolute flex flex-col items-center gap-2">
            <HackaTimeWidget />
          </div>

          {Object.entries(windows).map(([label, win]) => {
            if (!win.isOpen) return null;
            const app =
              items.find((i) => i.label === label) ||
              initialApps.find((i) => i.label === label);
            if (!app) return null;

            return (
              <Window
                key={label}
                label={label}
                icon={app.icon}
                isOpen={win.isOpen}
                isMinimized={win.isMinimized}
                isMaximized={win.isMaximized}
                x={win.x}
                y={win.y}
                w={win.w}
                h={win.h}
                zIndex={win.zIndex}
                isDragging={draggedWindow === label}
                isResizing={resizedWindow === label}
                onClose={() => {
                  setWindows((prev) => ({
                    ...prev,
                    [label]: { ...prev[label], isOpen: false },
                  }));
                }}
                onMinimize={() => {
                  setWindows((prev) => ({
                    ...prev,
                    [label]: { ...prev[label], isMinimized: true },
                  }));
                }}
                onMaximize={() => {
                  setWindows((prev) => ({
                    ...prev,
                    [label]: {
                      ...prev[label],
                      isMaximized: !prev[label].isMaximized,
                    },
                  }));
                }}
                onDragStart={(e) => handleWindowDragStart(e, label)}
                onResizeStart={(e) => handleResizeStart(e, label)}
                onFocus={() => bringToFront(label)}
                headerContent={
                  label === "Google Chrome" ? chromeHeader : undefined
                }
              >
                {renderAppContent(label)}
              </Window>
            );
          })}
        </>
      ) : (
        <div className="z-1 relative flex flex-col justify-center items-center gap-4 size-full text-center select-none">
          <div className="bg-white/10 backdrop-blur-lg px-6 pt-8 pb-4 rounded-full">
            <FaUserAstronaut className="size-20 text-white/80" />
          </div>
          <h1 className="font-bold text-white text-3xl">Glass Astronaut</h1>

          <div className="space-y-2">
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={pin}
              onChange={handleChange}
              placeholder="PIN"
              name="password"
              className="bg-white/10 backdrop-blur-xl px-4 py-3 border border-white/10 focus:border-none rounded-full outline-none focus:ring-2 focus:ring-white/20 w-full font-semibold tabular-nums text-white placeholder:text-white/30 text-2xl text-center tracking-0 focus:tracking-[0.5em] transition-all"
            />
            <label htmlFor="password" className="text-white/70 text-sm">
              Hint: 1234
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
