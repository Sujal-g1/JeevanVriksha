import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  CheckCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  Plus,
  FileText,
  ListTodo,
  CircleCheck,
  X,
  Star,
  Pencil,
  AlertCircle,
} from "lucide-react";
import AshaNavbar from "../components/AshaNavbar";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const TodoPage = () => {
  const [tasks, setTasks] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [taskType, setTaskType] = useState("");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [proofFiles, setProofFiles] = useState({});
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [taskView, setTaskView] = useState("pending");

  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      const res = await fetch(`${API}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${user?.token || ""}`,
        },
        signal: AbortSignal.timeout(15000),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Unable to fetch tasks.");
      }

      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch tasks error:", err);

      if (err.name === "TimeoutError") {
        alert("Fetching tasks timed out. Check whether your backend is running.");
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setPatientId("");
    setTaskType("");
    setNote("");
    setDueDate("");
    setEditingTaskId(null);
  };

  const saveTask = async (e) => {
    e.preventDefault();

    if (!taskType.trim()) {
      alert("Task title is required.");
      return;
    }

    let timeoutId;

    try {
      setSaving(true);

      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!user?.token) {
        alert("Please log in again to manage tasks.");
        return;
      }

      if (!API) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const url = editingTaskId
        ? `${API}/api/tasks/${editingTaskId}`
        : `${API}/api/tasks/create`;

      const controller = new AbortController();

      timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        method: editingTaskId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          patientId: patientId.trim() || null,
          taskType: taskType.trim(),
          note: note.trim(),
          dueDate: dueDate || null,
        }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Unable to save task.");
      }

      resetForm();
      await fetchTasks();

      alert(
        editingTaskId
          ? "Task updated successfully."
          : "Task created successfully."
      );
    } catch (err) {
      console.error("Save task error:", err);

      if (err.name === "AbortError") {
        alert(
          "The request timed out. Check your backend server and database connection."
        );
      } else {
        alert(err.message || "Unable to save task. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setSaving(false);
    }
  };

  const markComplete = async (taskId) => {
    const proofImage = proofFiles[taskId];

    if (!proofImage) {
      alert("Please upload a proof image before completing this task.");
      return;
    }

    let timeoutId;

    try {
      setCompletingTaskId(taskId);

      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!user?.token) {
        alert("Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("status", "completed");
      formData.append("proofImage", proofImage);

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Unable to complete task.");
      }

      setProofFiles((prev) => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });

      await fetchTasks();
    } catch (err) {
      console.error("Complete task error:", err);

      if (err.name === "AbortError") {
        alert("The upload timed out. Please check your connection and try again.");
      } else {
        alert(err.message || "Unable to complete task.");
      }
    } finally {
      clearTimeout(timeoutId);
      setCompletingTaskId(null);
    }
  };

  const togglePriority = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!user?.token) {
        alert("Please log in again.");
        return;
      }

      const res = await fetch(`${API}/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          isPriority: !task.isPriority,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Unable to update priority.");
      }

      await fetchTasks();
    } catch (error) {
      console.error("Toggle priority error:", error);
      alert(error.message || "Unable to update priority.");
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setTaskType(task.taskType || "");
    setNote(task.note || "");
    setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setPatientId(
      typeof task.patientId === "object"
        ? task.patientId?._id || ""
        : task.patientId || ""
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingTasks = tasks.filter(
    (task) => task.status !== "completed"
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  );

  const priorityTasks = pendingTasks.filter(
    (task) => task.isPriority
  );

  const visibleTasks =
    taskView === "completed"
      ? completedTasks
      : taskView === "priority"
        ? priorityTasks
        : pendingTasks;

  const overdueTasks = pendingTasks.filter((task) => {
    if (!task.dueDate) return false;

    const date = new Date(task.dueDate);
    date.setHours(0, 0, 0, 0);

    return date < today;
  });

  const getDueInfo = (dateValue) => {
    if (!dateValue) {
      return {
        label: "No due date",
        style: "bg-slate-100 text-slate-500",
        icon: CalendarDays,
      };
    }

    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);

    if (date < today) {
      return {
        label: "Overdue",
        style: "bg-rose-50 text-rose-700",
        icon: AlertCircle,
      };
    }

    if (date.getTime() === today.getTime()) {
      return {
        label: "Due today",
        style: "bg-amber-50 text-amber-700",
        icon: Clock3,
      };
    }

    return {
      label: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      style: "bg-blue-50 text-blue-700",
      icon: CalendarDays,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <AshaNavbar />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Header */}
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <ClipboardList size={14} />
              ASHA Workspace
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Task Manager
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Organize patient visits, follow-ups, and daily community
              healthcare activities in one place.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              document
                .getElementById("task-form")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Plus size={18} />
            New Task
          </button>
        </section>

        {/* Summary cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => setTaskView("pending")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 ${
              taskView === "pending"
                ? "border-blue-400 ring-2 ring-blue-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Tasks
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {pendingTasks.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Click to view pending tasks
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <ListTodo size={22} />
              </div>
            </div>
          </button>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Overdue Tasks
                </p>
                <p className="mt-2 text-3xl font-extrabold text-rose-600">
                  {overdueTasks.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Need follow-up
                </p>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                <Clock3 size={22} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setTaskView((current) =>
                current === "completed" ? "pending" : "completed"
              )
            }
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 ${
              taskView === "completed"
                ? "border-emerald-400 ring-2 ring-emerald-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Completed Tasks
                </p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                  {completedTasks.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Click to view completed tasks
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CircleCheck size={22} />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setTaskView((current) =>
                current === "priority" ? "pending" : "priority"
              )
            }
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-amber-300 ${
              taskView === "priority"
                ? "border-amber-400 ring-2 ring-amber-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Priority Tasks
                </p>
                <p className="mt-2 text-3xl font-extrabold text-amber-600">
                  {priorityTasks.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Click to view important tasks
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Star size={22} />
              </div>
            </div>
          </button>
        </section>

        {/* Main layout */}
        <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Create/edit form */}
          <div
            id="task-form"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  {editingTaskId ? (
                    <Pencil size={21} />
                  ) : (
                    <ClipboardList size={21} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingTaskId ? "Edit Task" : "Create a Task"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {editingTaskId
                      ? "Update the task details below."
                      : "Add a new activity to your task list."}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={saveTask} className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="taskType"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Task title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="taskType"
                  placeholder="e.g. Visit Anganwadi"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="patientId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Patient ID{" "}
                  <span className="font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="patientId"
                    placeholder="Enter patient record ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  Leave blank for general ASHA activities.
                </p>
              </div>

              <div>
                <label
                  htmlFor="note"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Notes{" "}
                  <span className="font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <FileText
                    size={17}
                    className="absolute left-3.5 top-3.5 text-slate-400"
                  />
                  <textarea
                    id="note"
                    placeholder="Add instructions, visit details, or follow-up notes..."
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dueDate"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Due date{" "}
                  <span className="font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    "Saving..."
                  ) : editingTaskId ? (
                    <>
                      <CheckCircle size={17} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Task
                    </>
                  )}
                </button>

                {editingTaskId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Task list */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {taskView === "completed"
                    ? "Completed Tasks"
                    : taskView === "priority"
                      ? "Priority Tasks"
                      : "Pending Tasks"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a task to edit its details.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {visibleTasks.length}{" "}
                {taskView === "completed"
                  ? "completed"
                  : taskView === "priority"
                    ? "priority"
                    : "pending"}
              </span>
            </div>

            <div className="max-h-[720px] space-y-3 overflow-y-auto p-4 sm:p-5">
              {visibleTasks.length === 0 ? (
                <div className="px-4 py-14 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <ClipboardList size={26} />
                  </div>
                  <h3 className="font-bold text-slate-800">
                    {taskView === "completed"
                      ? "No completed tasks"
                      : taskView === "priority"
                        ? "No priority tasks"
                        : "No pending tasks"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    {taskView === "completed"
                      ? "Completed tasks will appear here."
                      : taskView === "priority"
                        ? "Use Add Priority on a pending task to find it here."
                        : "Create your first task to keep track of visits and follow-up activities."}
                  </p>
                </div>
              ) : (
                visibleTasks.map((task) => {
                  const isCompleted = task.status === "completed";
                  const dueInfo = getDueInfo(task.dueDate);
                  const DueIcon = dueInfo.icon;

                  return (
                    <article
                      key={task._id}
                      className={`rounded-2xl border p-4 transition ${
                        editingTaskId === task._id
                          ? "border-blue-300 bg-blue-50/40 ring-2 ring-blue-500/10"
                          : "border-slate-200 bg-white hover:border-blue-200"
                      }`}
                    >
                      {/* Main task row */}
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => markComplete(task._id)}
                          disabled={isCompleted || taskView === "completed"}
                          title={isCompleted ? "Task completed" : "Mark task complete"}
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                        >
                          <CheckCircle size={19} />
                        </button>

                        <button
                          type="button"
                          onClick={() => startEditing(task)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`break-words text-sm font-bold ${
                                isCompleted
                                  ? "text-slate-400 line-through"
                                  : "text-slate-800"
                              }`}
                            >
                              {task.taskType || "Untitled task"}
                            </h3>

                            {isCompleted && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                Completed
                              </span>
                            )}

                            {!isCompleted && task.isPriority && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                <Star size={11} fill="currentColor" />
                                Priority
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <UserRound size={13} />
                              {task.patientId?.name ||
                                (task.patientId ? "Linked patient" : "Personal task")}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-semibold ${dueInfo.style}`}
                            >
                              <DueIcon size={12} />
                              {dueInfo.label}
                            </span>
                          </div>

                          {task.note && (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                              {task.note}
                            </p>
                          )}
                        </button>

                        <div className="flex shrink-0 items-center gap-1">
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => togglePriority(task)}
                              title={
                                task.isPriority
                                  ? "Remove from priority"
                                  : "Add to priority"
                              }
                              className={`inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                                task.isPriority
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  : "text-slate-400 hover:bg-amber-50 hover:text-amber-700"
                              }`}
                            >
                              <Star
                                size={16}
                                fill={task.isPriority ? "currentColor" : "none"}
                              />
                              <span className="hidden sm:inline">
                                {task.isPriority ? "Priority" : "Add Priority"}
                              </span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => startEditing(task)}
                            title="Edit task"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Compact proof upload section */}
                      {!isCompleted && (
                        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
                          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 transition hover:border-blue-300 hover:bg-blue-50/50">
                            <FileText
                              size={17}
                              className="shrink-0 text-blue-600"
                            />

                            <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                              {proofFiles[task._id]?.name || "Choose visit photo"}
                            </span>

                            <span className="shrink-0 text-xs font-semibold text-blue-700">
                              {proofFiles[task._id] ? "Change" : "Browse"}
                            </span>

                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                                  alert("Please select a JPG, PNG, or WebP image.");
                                  e.target.value = "";
                                  return;
                                }

                                if (file.size > 5 * 1024 * 1024) {
                                  alert("Image must be 5 MB or smaller.");
                                  e.target.value = "";
                                  return;
                                }

                                setProofFiles((prev) => ({
                                  ...prev,
                                  [task._id]: file,
                                }));
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => markComplete(task._id)}
                            disabled={
                              completingTaskId === task._id || !proofFiles[task._id]
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          >
                            <CheckCircle size={15} />

                            {completingTaskId === task._id
                              ? "Submitting..."
                              : proofFiles[task._id]
                                ? "Submit & Complete"
                                : "Select Photo First"}
                          </button>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-emerald-700">
                          <CheckCircle size={15} />
                          Task completed successfully
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>

            {visibleTasks.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
                <p className="text-xs text-slate-500">
                  Showing {visibleTasks.length}{" "}
                  {visibleTasks.length === 1 ? "task" : "tasks"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TodoPage;
