import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import UserManagement from "../../components/admin/UserManagement";
import { UsersRound, CalendarDays, LineChart, TriangleAlert, Ban, CheckCircle, } from "lucide-react";
const STATS = [
    {
        label: "Total Users",
        value: "1,248",
        icon: UsersRound,
        color: "text-info",
        bg: "bg-info-bg",
    },
    {
        label: "Active Organizers",
        value: "42",
        icon: CheckCircle,
        color: "text-success",
        bg: "bg-success-bg",
    },
    {
        label: "Upcoming Events",
        value: "156",
        icon: CalendarDays,
        color: "text-brand",
        bg: "bg-brand-soft",
    },
    {
        label: "Suspended Accounts",
        value: "3",
        icon: Ban,
        color: "text-danger",
        bg: "bg-danger-bg",
    },
];
const ALERTS = [
    "User reported inappropriate event",
    "Organizer 'TechHub' requested verification",
    "3 failed login attempts from IP 192.168.1.1",
];
const TABS = ["overview", "users", "events", "logs"];
const CARD = "bg-surface rounded-xl border border-border shadow-sm";
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    return (_jsx("div", { className: "min-h-screen bg-background p-4 sm:p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-text tracking-tight", children: "System Admin" }), _jsx("p", { className: "text-text-soft mt-1", children: "Platform management and security overview." })] }), _jsx("div", { role: "tablist", className: "flex bg-surface rounded-lg p-1 shadow-sm border border-border overflow-x-auto", children: TABS.map((tab) => (_jsx("button", { role: "tab", "aria-selected": activeTab === tab, onClick: () => setActiveTab(tab), className: `px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus ${activeTab === tab
                                    ? "bg-panel-admin text-text-on-dark"
                                    : "text-text-soft hover:text-text hover:bg-surface-muted"}`, children: tab }, tab))) })] }), activeTab === "overview" && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: STATS.map((stat) => {
                                const Icon = stat.icon;
                                return (_jsxs("div", { className: `${CARD} p-6 flex items-center gap-4`, children: [_jsx("div", { className: `p-3 rounded-lg ${stat.bg} ${stat.color}`, children: _jsx(Icon, { size: 24 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-soft", children: stat.label }), _jsx("p", { className: "text-2xl font-bold text-text", children: stat.value })] })] }, stat.label));
                            }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: `lg:col-span-2 ${CARD} p-6`, children: [_jsxs("h3", { className: "text-lg font-semibold text-text mb-4 flex items-center gap-2", children: [_jsx(LineChart, { size: 20, className: "text-brand" }), "System Health"] }), _jsx("div", { className: "h-48 flex items-center justify-center border-2 border-dashed border-border-strong rounded-lg text-text-soft text-sm bg-surface-muted", children: "[Chart Placeholder: Registrations over time]" })] }), _jsxs("div", { className: `${CARD} p-6`, children: [_jsxs("h3", { className: "text-lg font-semibold text-text mb-4 flex items-center gap-2", children: [_jsx(TriangleAlert, { size: 20, className: "text-warning" }), "Needs Attention"] }), _jsx("ul", { className: "space-y-3", children: ALERTS.map((alert) => (_jsxs("li", { className: "flex items-start gap-3 text-sm text-warning bg-warning-bg p-3 rounded-lg border border-warning-border", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" }), alert] }, alert))) })] })] })] })), activeTab === "users" && _jsx(UserManagement, {}), activeTab === "events" && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: _jsxs("div", { className: `${CARD} p-12 text-center text-text-muted`, children: [_jsx(CalendarDays, { size: 48, className: "mx-auto mb-4 text-border-strong" }), _jsx("h2", { className: "text-xl font-medium text-text", children: "Global Event Control" }), _jsx("p", { className: "mt-2", children: "This is where you will manage, delete, and oversee all platform events." })] }) })), activeTab === "logs" && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, children: _jsxs("div", { className: `${CARD} p-12 text-center text-text-muted`, children: [_jsx(LineChart, { size: 48, className: "mx-auto mb-4 text-border-strong" }), _jsx("h2", { className: "text-xl font-medium text-text", children: "System Audit Logs" }), _jsx("p", { className: "mt-2", children: "This is where we will display the chronological feed of all platform actions." })] }) }))] }) }));
}
