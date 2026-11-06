import { useEffect, useRef, useState } from "react";
import "./App.css";
import api from "./api";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(sessionStorage.getItem("accessToken"))
  );
  const [activePage, setActivePage] = useState("dashboard");
  const [monthlyTrendRange, setMonthlyTrendRange] = useState("6");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState(
    () => sessionStorage.getItem("displayName") || ""
  );
  const [historyMonth, setHistoryMonth] = useState("all");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [transactionCategoryFilter, setTransactionCategoryFilter] = useState("all");
  const [transactionPage, setTransactionPage] = useState(1);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [newTransactionType, setNewTransactionType] = useState("expense");

  // Dashboard data
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState([]);
  const [budgetRecords, setBudgetRecords] = useState([]);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingBudgetLimit, setEditingBudgetLimit] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState("monthly");
  const [budgetCategoryFilter, setBudgetCategoryFilter] = useState("all");
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [expenseError, setExpenseError] = useState("");
  const [incomeError, setIncomeError] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [refreshData, setRefreshData] = useState(0);

  // Budget creation form
  const [budgetCategory, setBudgetCategory] = useState("Food");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(String(new Date().getMonth() + 1));
  const [budgetYear, setBudgetYear] = useState(String(new Date().getFullYear()));

  // Savings goals
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [savingsLoading, setSavingsLoading] = useState(false);
  const [savingsError, setSavingsError] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalDate, setGoalDate] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingGoalAmount, setEditingGoalAmount] = useState("");
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState(null);
  const notificationMessagesRef = useRef(new Map());
  const notificationsInitializedRef = useRef(false);

  // Financial reports
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportDownloading, setReportDownloading] = useState(null);

  // Generate and organize financial reports
  const [reportTitle, setReportTitle] = useState(
    `${new Date().toLocaleString("en-IN", { month: "long" })} ${new Date().getFullYear()} Financial Report`
  );
  const [reportStartDate, setReportStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString("en-CA");
  });
  const [reportEndDate, setReportEndDate] = useState(
    () => new Date().toLocaleDateString("en-CA")
  );
  const [reportCreating, setReportCreating] = useState(false);
  const [reportCreateError, setReportCreateError] = useState("");
  const [reportSearch, setReportSearch] = useState("");

  // Expense form and editing
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingAmount, setEditingAmount] = useState("");

  // Income form
  const [incomeSource, setIncomeSource] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [incomeNotes, setIncomeNotes] = useState("");
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [editingIncomeAmount, setEditingIncomeAmount] = useState("");

  // Fetch expenses
  useEffect(() => {
    if (!isLoggedIn) return;
    const load = async () => {
      setExpenseLoading(true);
      setExpenseError("");
      try {
        const response = await api.get("expenses/");
        setExpenses(Array.isArray(response.data) ? response.data : (response.data.results || []));
      } catch (error) {
        setExpenseError(error.response?.status === 401
          ? "Your session expired. Please log in again."
          : "Unable to load expenses.");
      } finally {
        setExpenseLoading(false);
      }
    };
    load();
  }, [isLoggedIn, refreshData]);

  // Fetch incomes
  useEffect(() => {
    if (!isLoggedIn) return;
    const load = async () => {
      setIncomeLoading(true);
      setIncomeError("");
      try {
        const response = await api.get("incomes/");
        setIncomes(Array.isArray(response.data) ? response.data : (response.data.results || []));
      } catch (error) {
        setIncomeError(error.response?.status === 401
          ? "Your session expired. Please log in again."
          : "Unable to load income records.");
      } finally {
        setIncomeLoading(false);
      }
    };
    load();
  }, [isLoggedIn, refreshData]);

  // Fetch current month's budget summary
  useEffect(() => {
    if (!isLoggedIn) return;
    const load = async () => {
      setBudgetLoading(true);
      setBudgetError("");
      try {
        const response = await api.get("budgets/summary/");
        setBudgetSummary(response.data);
      } catch (error) {
        setBudgetError(error.response?.status === 401
          ? "Your session expired. Please log in again."
          : "Unable to load budget summary.");
      } finally {
        setBudgetLoading(false);
      }
    };
    load();
  }, [isLoggedIn, refreshData]);

  // Fetch budget records so each summary can support edit and delete
  useEffect(() => {
    if (!isLoggedIn) return;
    const load = async () => {
      try {
        const response = await api.get("budgets/");
        setBudgetRecords(response.data);
      } catch (error) {
        setBudgetError(error.response?.data
          ? JSON.stringify(error.response.data)
          : "Unable to load budget records.");
      }
    };
    load();
  }, [isLoggedIn, refreshData]);

  // Fetch savings goals
  useEffect(() => {
    if (!isLoggedIn) return;
    const load = async () => {
      setSavingsLoading(true);
      setSavingsError("");
      try {
        const response = await api.get("savings-goals/");
        setSavingsGoals(response.data);
      } catch (error) {
        setSavingsError(error.response?.status === 401
          ? "Your session expired. Please log in again."
          : "Unable to load savings goals.");
      } finally {
        setSavingsLoading(false);
      }
    };
    load();
  }, [isLoggedIn, refreshData]);
// Load notifications and check periodically for new budget alerts.
useEffect(() => {
  if (!isLoggedIn) {
    notificationMessagesRef.current = new Map();
    notificationsInitializedRef.current = false;
    setNotifications([]);
    return undefined;
  }

  let isActive = true;

  const loadNotifications = async () => {
    if (!notificationsInitializedRef.current) {
      setNotificationsLoading(true);
    }
    setNotificationsError("");

    try {
      const response = await api.get("notifications/");
      if (!isActive) return;

      const latestNotifications = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      // Do not show popups for old notifications on the first load.
      if (notificationsInitializedRef.current) {
        const newUnread = latestNotifications.filter((item) =>
          !item.is_read &&
          (!notificationMessagesRef.current.has(item.id) ||
            notificationMessagesRef.current.get(item.id) !== item.message)
        );

        if (newUnread.length > 0) {
          const newest = newUnread[0];
          setNotificationToast(newest);

          // Send a desktop alert only after the user has granted permission.
          if (
            "Notification" in window &&
            window.Notification.permission === "granted"
          ) {
            try {
              new window.Notification("BudgetBuddy", {
                body: newest.message,
                icon: "/favicon.svg",
              });
            } catch (desktopAlertError) {
              // Keep in-app notifications working if desktop alerts are unavailable.
            }
          }
        }
      } else {
        notificationsInitializedRef.current = true;
      }

      notificationMessagesRef.current = new Map(
        latestNotifications.map((item) => [item.id, item.message])
      );
      setNotifications(latestNotifications);
    } catch (error) {
      if (isActive) {
        setNotificationsError("Unable to load notifications.");
      }
    } finally {
      if (isActive) setNotificationsLoading(false);
    }
  };

  loadNotifications();
  const pollId = window.setInterval(loadNotifications, 12000);

  return () => {
    isActive = false;
    window.clearInterval(pollId);
  };
}, [isLoggedIn, refreshData]);

// Automatically dismiss the in-app alert after a short time.
useEffect(() => {
  if (!notificationToast) return undefined;
  const timeoutId = window.setTimeout(
    () => setNotificationToast(null),
    8000
  );
  return () => window.clearTimeout(timeoutId);
}, [notificationToast]);
  // Clear status messages a few seconds after login so they don't stay on screen.
  useEffect(() => {
    if (!message || !isLoggedIn) return undefined;
    const timeoutId = window.setTimeout(() => setMessage(""), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [message, isLoggedIn]);

  // Fetch financial reports
  useEffect(() => {
    if (!isLoggedIn) return;
    const loadReports = async () => {
      setReportsLoading(true);
      setReportsError("");
      try {
        const response = await api.get("reports/");
        setReports(Array.isArray(response.data) ? response.data : (response.data.results || []));
      } catch (error) {
        setReportsError("Unable to load financial reports.");
      } finally {
        setReportsLoading(false);
      }
    };
    loadReports();
  }, [isLoggedIn, refreshData]);

  // Download one report as a PDF using the authenticated API client
  const downloadPDF = async (reportId) => {
    setReportDownloading(`${reportId}-pdf`);
    try {
      const response = await api.get(`reports/${reportId}/pdf/`, { responseType: "blob" });
      const fileURL = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(fileURL), 1000);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Unable to download PDF. Please check your login and try again.");
    } finally {
      setReportDownloading(null);
    }
  };

  // Download one report as an Excel file using the authenticated API client
  const downloadExcel = async (reportId) => {
    setReportDownloading(`${reportId}-excel`);
    try {
      const response = await api.get(`reports/${reportId}/excel/`, { responseType: "blob" });
      const fileURL = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `report_${reportId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(fileURL), 1000);
    } catch (error) {
      console.error("Excel download failed:", error);
      alert("Unable to download Excel report. Please check your login and try again.");
    } finally {
      setReportDownloading(null);
    }
  };

  // Create a report for the selected date range
  const handleGenerateReport = async (event) => {
    event.preventDefault();
    setReportCreateError("");

    const cleanTitle = reportTitle.trim();

    if (!cleanTitle) {
      setReportCreateError("Please enter a report title.");
      return;
    }

    if (!reportStartDate || !reportEndDate) {
      setReportCreateError("Please select both report dates.");
      return;
    }

    if (reportStartDate > reportEndDate) {
      setReportCreateError("Start date cannot be later than end date.");
      return;
    }

    const duplicateExists = reports.some((report) =>
      String(report.title || "").trim().toLowerCase() === cleanTitle.toLowerCase() &&
      report.start_date === reportStartDate &&
      report.end_date === reportEndDate
    );

    if (duplicateExists) {
      setReportCreateError(
        "A report with this title and date range already exists. Change the title or dates."
      );
      return;
    }

    setReportCreating(true);

    try {
      const response = await api.post("reports/", {
        title: cleanTitle,
        start_date: reportStartDate,
        end_date: reportEndDate,
      });

      setReports((previous) => [response.data, ...previous]);
      setReportSearch("");
      setMessage("Financial report generated successfully.");
      setReportCreateError("");
    } catch (error) {
      console.error("Report generation failed:", error);
      const data = error.response?.data;
      setReportCreateError(
        data
          ? Object.entries(data)
              .map(([field, errors]) =>
                `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`
              )
              .join(" | ")
          : "Unable to generate the report. Please check your login and try again."
      );
    } finally {
      setReportCreating(false);
    }
  };

  // Delete a saved report after confirmation
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Delete this saved report? This will not delete your income or expense records.")) {
      return;
    }

    try {
      await api.delete(`reports/${reportId}/`);
      setReports((previous) => previous.filter((report) => report.id !== reportId));
      setMessage("Saved report deleted.");
    } catch (error) {
      console.error("Report deletion failed:", error);
      setReportsError("Unable to delete this report. Please try again.");
    }
  };

  // Login and registration
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      if (isLogin) {
        const response = await api.post("auth/login/", {
          username: email,
          password,
        });
        sessionStorage.setItem("accessToken", response.data.access);
        sessionStorage.setItem("displayName", email);
        setDisplayName(email);
        if (response.data.refresh) {
          sessionStorage.setItem("refreshToken", response.data.refresh);
        }
        setIsLoggedIn(true);
        setMessage("Login successful! Welcome to BudgetBuddy.");
        setPassword("");
      } else {
        await api.post("auth/register/", { username, email, password });
        setMessage("Registration successful! You can now log in.");
        setIsLogin(true);
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      const data = error.response?.data;
      if (data) {
        const details = Object.entries(data)
          .map(([field, errors]) =>
            `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`
          ).join(" | ");
        setMessage(details || "Request failed. Please try again.");
      } else {
        setMessage("Cannot connect to the backend. Check that Django is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Add expense
  const handleAddExpense = async (event) => {
    event.preventDefault();
    setExpenseError("");
    setMessage("");
    try {
      await api.post("expenses/", { title, category, amount, date, notes });
      setTitle("");
      setCategory("Food");
      setAmount("");
      setDate(new Date().toLocaleDateString("en-CA"));
      setNotes("");
      setMessage("Expense added successfully!");
      setShowTransactionModal(false);
      setRefreshData((value) => value + 1);
    } catch (error) {
      setExpenseError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to add expense. Please try again.");
    }
  };

  // Update expense amount
  const handleUpdateExpense = async (id) => {
    const numericAmount = Number(editingAmount);
    if (!editingAmount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setExpenseError("Enter an amount greater than zero.");
      return;
    }
    try {
      await api.patch(`expenses/${id}/`, { amount: numericAmount.toFixed(2) });
      setEditingId(null);
      setEditingAmount("");
      setMessage("Expense updated successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setExpenseError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to update expense.");
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`expenses/${id}/`);
      setMessage("Expense deleted successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setExpenseError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to delete expense.");
    }
  };

  // Add income
  const handleAddIncome = async (event) => {
    event.preventDefault();
    setIncomeError("");
    setMessage("");
    try {
      await api.post("incomes/", {
        source: incomeSource,
        amount: incomeAmount,
        date: incomeDate,
        notes: incomeNotes,
      });
      setIncomeSource("");
      setIncomeAmount("");
      setIncomeDate(new Date().toLocaleDateString("en-CA"));
      setIncomeNotes("");
      setMessage("Income added successfully!");
      setShowTransactionModal(false);
      setRefreshData((value) => value + 1);
    } catch (error) {
      setIncomeError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to add income.");
    }
  };

  // Update income amount
  const handleUpdateIncome = async (id) => {
    const numericAmount = Number(editingIncomeAmount);
    if (!editingIncomeAmount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setIncomeError("Enter an amount greater than zero.");
      return;
    }
    setIncomeError("");
    try {
      await api.patch(`incomes/${id}/`, { amount: numericAmount.toFixed(2) });
      setEditingIncomeId(null);
      setEditingIncomeAmount("");
      setMessage("Income updated successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setIncomeError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to update income record.");
    }
  };

  // Delete income
  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income record?")) return;
    try {
      await api.delete(`incomes/${id}/`);
      setMessage("Income record deleted successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setIncomeError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to delete income record.");
    }
  };

  // Create a monthly budget
  const handleAddBudget = async (event) => {
    event.preventDefault();
    setBudgetError("");
    setMessage("");
    try {
      await api.post("budgets/", {
        category: budgetCategory,
        limit_amount: budgetLimit,
        month: Number(budgetMonth),
        year: Number(budgetYear),
      });
      setBudgetLimit("");
      setMessage("Budget created successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setBudgetError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to create budget. Check whether this category already has a budget for that month.");
    }
  };

  // Update an existing budget limit
  const handleUpdateBudget = async (id) => {
    const numericLimit = Number(editingBudgetLimit);
    if (!editingBudgetLimit.trim() || !Number.isFinite(numericLimit) || numericLimit <= 0) {
      setBudgetError("Enter a budget limit greater than zero.");
      return;
    }
    setBudgetError("");
    try {
      await api.patch(`budgets/${id}/`, {
        limit_amount: numericLimit.toFixed(2),
      });
      setEditingBudgetId(null);
      setEditingBudgetLimit("");
      setMessage("Budget updated successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setBudgetError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to update budget.");
    }
  };

  // Delete an existing budget
  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    setBudgetError("");
    try {
      await api.delete(`budgets/${id}/`);
      setMessage("Budget deleted successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setBudgetError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to delete budget.");
    }
  };

  // Create a savings goal
  const handleAddGoal = async (event) => {
    event.preventDefault();
    setSavingsError("");
    setMessage("");
    try {
      await api.post("savings-goals/", {
        title: goalTitle,
        target_amount: goalTarget,
        current_amount: goalCurrent || "0",
        target_date: goalDate || null,
      });
      setGoalTitle("");
      setGoalTarget("");
      setGoalCurrent("0");
      setGoalDate("");
      setMessage("Savings goal created successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setSavingsError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to create savings goal.");
    }
  };

  // Update saved amount for a goal
  const handleUpdateGoal = async (id) => {
    const savedAmount = Number(editingGoalAmount);
    if (!editingGoalAmount.trim() || !Number.isFinite(savedAmount) || savedAmount < 0) {
      setSavingsError("Enter a valid saved amount (zero or more).");
      return;
    }
    try {
      await api.patch(`savings-goals/${id}/`, {
        current_amount: savedAmount.toFixed(2),
      });
      setEditingGoalId(null);
      setEditingGoalAmount("");
      setMessage("Savings progress updated!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setSavingsError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to update savings progress.");
    }
  };

  // Delete a savings goal
  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) return;
    try {
      await api.delete(`savings-goals/${id}/`);
      setMessage("Savings goal deleted successfully!");
      setRefreshData((value) => value + 1);
    } catch (error) {
      setSavingsError(error.response?.data
        ? JSON.stringify(error.response.data)
        : "Unable to delete savings goal.");
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.patch(`notifications/${notificationId}/`, { is_read: true });
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
    } catch (error) {
      setNotificationsError("Unable to mark this notification as read.");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`notifications/${notificationId}/`);
      setNotifications((previous) =>
        previous.filter((item) => item.id !== notificationId)
      );
    } catch (error) {
      setNotificationsError("Unable to delete this notification.");
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const unreadItems = notifications.filter((item) => !item.is_read);
    if (unreadItems.length === 0) return;

    try {
      await Promise.all(
        unreadItems.map((item) =>
          api.patch(`notifications/${item.id}/`, { is_read: true })
        )
      );
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: true }))
      );
    } catch (error) {
      setNotificationsError("Unable to update all notifications.");
    }
  };

  const requestDesktopNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setMessage("This browser does not support desktop notifications.");
      return;
    }

    try {
      const permission = await window.Notification.requestPermission();
      setMessage(
        permission === "granted"
          ? "Desktop notifications are enabled."
          : "Desktop notifications were not enabled. Check your browser site settings."
      );
      setNotificationPanelOpen(false);
    } catch (error) {
      setMessage("Unable to request desktop notification permission.");
    }
  };

  const unreadNotificationCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("displayName");
    setDisplayName("");
    setIsLoggedIn(false);
    setExpenses([]);
    setIncomes([]);
    setBudgetSummary([]);
    setBudgetRecords([]);
    setSavingsGoals([]);
    setNotifications([]);
    notificationMessagesRef.current = new Map();
    notificationsInitializedRef.current = false;
    setNotificationToast(null);
    setNotificationPanelOpen(false);
    setReports([]);
    setReportDownloading(null);
    setMessage("");
    setPassword("");
  };

  // Dashboard totals
  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount), 0
  );
  const totalIncome = incomes.reduce(
    (total, income) => total + Number(income.amount), 0
  );
  const balance = totalIncome - totalExpenses;
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";
  const monthLabel = (value) => {
    const [year, month] = value.split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };
  const allTransactions = [
    ...incomes.map((item) => ({
      id: `income-${item.id}`, type: "Income", title: item.source,
      category: "Income", amount: Number(item.amount), date: item.date, notes: item.notes,
    })),
    ...expenses.map((item) => ({
      id: `expense-${item.id}`, type: "Expense", title: item.title,
      category: item.category, amount: Number(item.amount), date: item.date, notes: item.notes,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  const availableHistoryMonths = [...new Set(
    allTransactions.filter((item) => item.date).map((item) => String(item.date).slice(0, 7))
  )].sort((a, b) => b.localeCompare(a));
  const filteredTransactions = allTransactions.filter((item) =>
    historyMonth === "all" || String(item.date).slice(0, 7) === historyMonth
  );
  const historyIncome = filteredTransactions.filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);
  const historyExpenses = filteredTransactions.filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const transactionCategories = [...new Set(allTransactions.map((item) => item.category).filter(Boolean))].sort();
  const searchedTransactions = filteredTransactions.filter((item) => {
    const query = transactionSearch.trim().toLowerCase();
    const matchesSearch = !query || [item.title, item.category, item.type, item.notes, item.date]
      .some((value) => String(value || "").toLowerCase().includes(query));
    const matchesType = transactionTypeFilter === "all" || item.type.toLowerCase() === transactionTypeFilter;
    const matchesCategory = transactionCategoryFilter === "all" || item.category === transactionCategoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });
  const transactionsPerPage = 10;
  const totalTransactionPages = Math.max(1, Math.ceil(searchedTransactions.length / transactionsPerPage));
  const safeTransactionPage = Math.min(transactionPage, totalTransactionPages);
  const paginatedTransactions = searchedTransactions.slice(
    (safeTransactionPage - 1) * transactionsPerPage,
    safeTransactionPage * transactionsPerPage
  );
  // Budget summary filters
const budgetCategories = [
  ...new Set([
    ...budgetSummary.map((budget) => budget.category),
    ...expenses.map((expense) => expense.category),
  ].filter(Boolean)),
].sort();

const today = new Date();

const getBudgetDateRange = () => {
  let start;
  let end;

  if (budgetPeriod === "weekly") {
    const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);
    end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
  } else if (budgetPeriod === "monthly") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    start = new Date(today.getFullYear(), 0, 1);
    end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  return { start, end };
};

const budgetDateRange = getBudgetDateRange();

const filteredBudgetExpenses = expenses.filter((expense) => {
  const [expenseYear, expenseMonth, expenseDay] = String(expense.date || "")
    .split("-")
    .map(Number);
  const expenseDate = new Date(expenseYear, expenseMonth - 1, expenseDay);

  const matchesDate =
    expenseDate >= budgetDateRange.start &&
    expenseDate <= budgetDateRange.end;

  const matchesCategory =
    budgetCategoryFilter === "all" ||
    expense.category === budgetCategoryFilter;

  return matchesDate && matchesCategory;
});

const filteredBudgetSpent = filteredBudgetExpenses.reduce(
  (total, expense) => total + Number(expense.amount),
  0
);

  // Overview analytics derived from the transactions already loaded from the API.
  const expenseCategoryBreakdown = Object.values(expenses.reduce((groups, item) => {
    const categoryName = item.category || "Other";
    if (!groups[categoryName]) groups[categoryName] = { category: categoryName, total: 0 };
    groups[categoryName].total += Number(item.amount) || 0;
    return groups;
  }, {})).sort((a, b) => b.total - a.total);
  const analyticsColors = ["#078568", "#f0a35b", "#5b8def", "#9a78d1", "#d96f79", "#75a99a"];
  let categoryAngle = 0;
  const categoryGradient = expenseCategoryBreakdown.length
    ? `conic-gradient(${expenseCategoryBreakdown.map((item, index) => {
        const start = categoryAngle;
        categoryAngle += totalExpenses ? (item.total / totalExpenses) * 100 : 0;
        return `${analyticsColors[index % analyticsColors.length]} ${start}% ${categoryAngle}%`;
      }).join(", ")})`
    : "conic-gradient(#e8efeb 0% 100%)";
  const highestExpenseCategory = expenseCategoryBreakdown[0] || null;

  // Group income records by source so users can see where their money comes from.
  // Source names are grouped without case sensitivity to avoid duplicate labels
  // such as "Salary" and "salary" appearing separately.
  const incomeSourceBreakdown = Object.values(incomes.reduce((groups, item) => {
    const rawSource = String(item.source || "").trim();
    const sourceKey = rawSource.toLocaleLowerCase() || "__unspecified__";

    if (!groups[sourceKey]) {
      groups[sourceKey] = { source: rawSource || "Unspecified", total: 0, count: 0 };
    }

    groups[sourceKey].total += Number(item.amount) || 0;
    groups[sourceKey].count += 1;
    return groups;
  }, {})).sort((a, b) => b.total - a.total);
  const highestIncomeSource = incomeSourceBreakdown[0] || null;
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthExpenses = expenses.filter((item) => String(item.date || "").slice(0, 7) === currentMonthKey)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const previousMonthExpenses = expenses.filter((item) => String(item.date || "").slice(0, 7) === previousMonthKey)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const monthlyExpenseChange = previousMonthExpenses > 0
    ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
    : null;

  // Build a selectable monthly income and expense comparison for the dashboard chart.
  // "All time" starts at the earliest recorded transaction month and ends at the current month.
  const recordedMonthKeys = allTransactions
    .map((item) => String(item.date || "").slice(0, 7))
    .filter((monthKey) => /^\d{4}-\d{2}$/.test(monthKey))
    .sort();
  const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();
  const firstRecordedMonthDate = recordedMonthKeys.length
    ? new Date(`${recordedMonthKeys[0]}-01T00:00:00`)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const firstRecordedMonthIndex = firstRecordedMonthDate.getFullYear() * 12 + firstRecordedMonthDate.getMonth();
  const allTimeMonthCount = Math.max(
    1,
    currentMonthIndex - Math.min(firstRecordedMonthIndex, currentMonthIndex) + 1
  );
  const monthlyTrendCount = monthlyTrendRange === "all"
    ? allTimeMonthCount
    : Number(monthlyTrendRange);
  const monthlyTrendData = Array.from({ length: monthlyTrendCount }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (monthlyTrendCount - 1 - index), 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const monthIncome = incomes
      .filter((item) => String(item.date || "").slice(0, 7) === monthKey)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const monthExpenses = expenses
      .filter((item) => String(item.date || "").slice(0, 7) === monthKey)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return {
      key: monthKey,
      label: monthDate.toLocaleDateString(
        "en-IN",
        monthlyTrendRange === "all" ? { month: "short", year: "2-digit" } : { month: "short" }
      ),
      fullLabel: monthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      income: monthIncome,
      expenses: monthExpenses,
    };
  });
  const monthlyTrendMax = Math.max(
    1,
    ...monthlyTrendData.flatMap((month) => [month.income, month.expenses])
  );
  const hasMonthlyTrendData = monthlyTrendData.some(
    (month) => month.income > 0 || month.expenses > 0
  );
  const monthlyTrendRangeLabel = monthlyTrendRange === "all"
    ? "ALL RECORDED HISTORY"
    : `LAST ${monthlyTrendRange} MONTHS`;
  const monthlyTrendHasHorizontalScroll = monthlyTrendRange === "all" && monthlyTrendData.length > 8;

  // Savings progress is calculated from the logged-in user's savings goals.
  const totalSavingsTarget = savingsGoals.reduce(
    (sum, goal) => sum + (Number(goal.target_amount) || 0), 0
  );
  const totalSavingsCurrent = savingsGoals.reduce(
    (sum, goal) => sum + (Number(goal.current_amount) || 0), 0
  );
  const overallSavingsProgress = totalSavingsTarget > 0
    ? Math.min((totalSavingsCurrent / totalSavingsTarget) * 100, 100)
    : 0;
  const completedSavingsGoals = savingsGoals.filter((goal) =>
    Number(goal.target_amount) > 0 && Number(goal.current_amount) >= Number(goal.target_amount)
  ).length;

  const formatReportCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatReportDate = (value, includeYear = true) => {
    if (!value) return "—";
    const parsedDate = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return String(value);
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      ...(includeYear ? { year: "numeric" } : {}),
    });
  };

  const getReportPreview = (report) => {
    const startDate = String(report.start_date || "");
    const endDate = String(report.end_date || "");

    const reportIncomes = incomes
      .filter((item) => String(item.date || "") >= startDate && String(item.date || "") <= endDate)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const reportExpenses = expenses
      .filter((item) => String(item.date || "") >= startDate && String(item.date || "") <= endDate)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const incomeTotal = reportIncomes.reduce(
      (total, item) => total + (Number(item.amount) || 0), 0
    );
    const expenseTotal = reportExpenses.reduce(
      (total, item) => total + (Number(item.amount) || 0), 0
    );

    const categoryTotals = reportExpenses.reduce((groups, item) => {
      const categoryName = item.category || "Other";
      groups[categoryName] = (groups[categoryName] || 0) + (Number(item.amount) || 0);
      return groups;
    }, {});

    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0] || null;

    return {
      incomes: reportIncomes,
      expenses: reportExpenses,
      incomeTotal,
      expenseTotal,
      balance: incomeTotal - expenseTotal,
      topCategory,
    };
  };

  const filteredNotifications = notifications.filter((notification) =>
    notificationFilter === "unread"
      ? !notification.is_read
      : notificationFilter === "read"
        ? notification.is_read
        : true
  );

  const formatNotificationTime = (value) => {
    if (!value) return "Recently";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Recently";
    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

     const getNotificationKind = (notification) => {
    const content = String(notification.message || "").toLowerCase();
    if (content.startsWith("monthly report")) return "report";
    if (content.startsWith("budget alert")) return "budget";
    if (content.startsWith("savings")) return "goal";
    return "general";
  };

  const filteredReports = reports.filter((report) => {
    const query = reportSearch.trim().toLowerCase();
    if (!query) return true;
    return [
      report.title,
      report.start_date,
      report.end_date,
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });

  if (isLoggedIn) {
    return (
      <div className="app">
        <header className="navbar">
          <div className="navbar-left">
            <button type="button" className="menu-toggle"
              aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((open) => !open)}>
              <span></span><span></span><span></span>
            </button>
            <a className="brand" href="#overview" onClick={() => { setActivePage("dashboard"); setSidebarOpen(false); }}>
              <span className="brand-mark">B</span><span>BudgetBuddy<small>PERSONAL FINANCE</small></span>
            </a>
          </div>
          <div className="topbar-actions">
            <span className="secure-label">Your money, in focus</span>
            <div className="notification-menu">
              <button
                type="button"
                className="notification-bell-button"
                aria-label={`Notifications, ${unreadNotificationCount} unread`}
                aria-expanded={notificationPanelOpen}
                onClick={() => setNotificationPanelOpen((open) => !open)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                </svg>
                {unreadNotificationCount > 0 && (
                  <span className="notification-badge">
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {notificationPanelOpen && (
                <div className="notification-popover">
                  <div className="notification-popover-heading">
                    <strong>Notifications</strong>
                    <span>{unreadNotificationCount} unread</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="notification-popover-empty">You're all caught up.</p>
                  ) : (
                    <div className="notification-popover-list">
                      {notifications.slice(0, 4).map((item) => (
                        <button
                          type="button"
                          className={`notification-popover-item ${item.is_read ? "read" : "unread"}`}
                          key={item.id}
                          onClick={() => {
                            setActivePage("notifications");
                            setNotificationPanelOpen(false);
                          }}
                        >
                          <span className="notification-popover-dot" />
                          <span>
                            <strong>{item.message}</strong>
                            <small>{formatNotificationTime(item.created_at)}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="notification-popover-actions">
                    {"Notification" in window && window.Notification.permission !== "granted" && (
                      <button type="button" onClick={requestDesktopNotificationPermission}>
                        Enable desktop alerts
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage("notifications");
                        setNotificationPanelOpen(false);
                      }}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button type="button" onClick={handleLogout}>Log Out</button>
          </div>
        </header>

        {notificationToast && (
          <div className="notification-toast" role="status" aria-live="polite">
            <div className="notification-toast-icon">!</div>
            <div className="notification-toast-content">
              <strong>New BudgetBuddy alert</strong>
              <p>{notificationToast.message}</p>
              <button
                type="button"
                onClick={() => {
                  setActivePage("notifications");
                  setNotificationToast(null);
                }}
              >
                View notification
              </button>
            </div>
            <button
              type="button"
              className="notification-toast-close"
              aria-label="Dismiss notification"
              onClick={() => setNotificationToast(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)}></div>
        <div className="workspace">
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <p className="sidebar-label">WORKSPACE</p>
            <button type="button" className={`side-link ${activePage === "dashboard" ? "active" : ""}`} onClick={() => { setActivePage("dashboard"); setSidebarOpen(false); }}><span>▦</span> Overview</button>
            <button type="button" className={`side-link ${activePage === "transactions" ? "active" : ""}`} onClick={() => { setActivePage("transactions"); setSidebarOpen(false); }}><span>↗</span> Transactions</button>
            <button type="button" className={`side-link ${activePage === "budgets" ? "active" : ""}`} onClick={() => { setActivePage("budgets"); setSidebarOpen(false); }}><span>◫</span> Budgets</button>
            <button type="button" className={`side-link ${activePage === "savings" ? "active" : ""}`} onClick={() => { setActivePage("savings"); setSidebarOpen(false); }}><span>◎</span> Savings goals</button>
            <button type="button" className={`side-link ${activePage === "analytics" ? "active" : ""}`} onClick={() => { setActivePage("analytics"); setSidebarOpen(false); }}><span>◔</span> Analytics</button>
            <button
              type="button"
              className={`side-link ${activePage === "notifications" ? "active" : ""}`}
              onClick={() => {
                setActivePage("notifications");
                setSidebarOpen(false);
              }}
            >
              <span>◉</span> Notifications
            </button>
            <button type="button" className={`side-link ${activePage === "reports" ? "active" : ""}`} onClick={() => { setActivePage("reports"); setSidebarOpen(false); }}><span>▤</span> Reports</button>
            <div className="sidebar-note"><strong>Small steps add up.</strong><p>Keep tracking. Keep growing.</p></div>
          </aside>

          <main className="dashboard">
          <div className="page-heading" id="overview"><div><p className="eyebrow">YOUR FINANCIAL OVERVIEW</p><h1>{activePage === "dashboard" ? `${greeting}, ${displayName || "there"}!` : activePage === "transactions" ? "Transactions & History" : activePage === "budgets" ? "Your Budgets" : activePage === "savings" ? "Savings Goals" : activePage === "analytics" ? "Financial Analytics" : activePage === "notifications" ? "Notifications" : "Financial Reports"}</h1></div><span className="date-chip">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
          <p className="page-subtitle">{activePage === "dashboard" ? "Here is your money overview for today." : activePage === "transactions" ? "See every rupee coming in and going out." : activePage === "budgets" ? "Plan your spending and stay within your limits." : activePage === "savings" ? "Track your progress, one step at a time." : activePage === "analytics" ? "Understand your spending, income and savings habits." : activePage === "notifications" ? "Stay updated on your budgets and savings." : "Generate, review and export your financial activity."}</p>

          {activePage === "dashboard" && <div className="dashboard-grid">
            <div className="summary-card">
              <h3>Total Income</h3>
              <p>₹{totalIncome.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Expenses</h3>
              <p>₹{totalExpenses.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Available Balance</h3>
              <p>₹{balance.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Savings Goals</h3>
              <p>{savingsGoals.length} active goals</p>
            </div>
          </div>}

          {activePage === "analytics" && <section className="analytics-section">
            <div className="analytics-heading">
              <div><p className="eyebrow">YOUR MONEY, VISUALIZED</p><h2>Spending analytics</h2><p>Understand where your money goes and how your cash flow looks.</p></div>
              <span className="analytics-period">All recorded transactions</span>
            </div>
            <div className="analytics-grid">
              <article className="analytics-card category-analytics-card">
                <div className="analytics-card-heading"><div><h3>Expense breakdown</h3><p>Spending by category</p></div><span className="analytics-mini-label">BY CATEGORY</span></div>
                {expenseCategoryBreakdown.length === 0 ? <div className="analytics-empty">Add expenses to see your category breakdown.</div> : <div className="category-chart-layout">
                  <div className="category-donut" style={{ background: categoryGradient }}><div><strong>₹{totalExpenses.toFixed(0)}</strong><span>Total spent</span></div></div>
                  <div className="category-legend">{expenseCategoryBreakdown.map((item, index) => <div className="category-legend-row" key={item.category}><span className="legend-dot" style={{ background: analyticsColors[index % analyticsColors.length] }}></span><span className="legend-name">{item.category}</span><strong>₹{item.total.toFixed(0)}</strong></div>)}</div>
                </div>}
              </article>
              <article className="analytics-card cashflow-card">
                <div className="analytics-card-heading"><div><h3>Income vs expenses</h3><p>Compare your recorded cash flow</p></div><span className="analytics-mini-label">OVERVIEW</span></div>
                {totalIncome + totalExpenses === 0 ? <div className="analytics-empty">Add income or expenses to see your cash flow.</div> : <div className="cashflow-chart">
                  <div className="cashflow-row"><div><span className="cashflow-dot income-dot"></span>Income</div><strong className="income-amount">₹{totalIncome.toFixed(2)}</strong></div>
                  <div className="cashflow-track"><span className="cashflow-income-bar" style={{ width: `${totalIncome / Math.max(totalIncome, totalExpenses, 1) * 100}%` }} /></div>
                  <div className="cashflow-row"><div><span className="cashflow-dot expense-dot"></span>Expenses</div><strong className="expense-amount">₹{totalExpenses.toFixed(2)}</strong></div>
                  <div className="cashflow-track"><span className="cashflow-expense-bar" style={{ width: `${totalExpenses / Math.max(totalIncome, totalExpenses, 1) * 100}%` }} /></div>
                  <div className="cashflow-balance"><span>Net balance</span><strong>₹{balance.toFixed(2)}</strong></div>
                </div>}
              </article>
            </div>
            <div className="insights-grid">
              <article className="insight-card"><span className="insight-icon">↗</span><div><p>Highest spending category</p><strong>{highestExpenseCategory ? highestExpenseCategory.category : "No expenses yet"}</strong><small>{highestExpenseCategory ? `₹${highestExpenseCategory.total.toFixed(2)} recorded` : "Your category insights will appear here."}</small></div></article>
              <article className="insight-card"><span className="insight-icon">▦</span><div><p>Current month spending</p><strong>₹{currentMonthExpenses.toFixed(2)}</strong><small>{monthLabel(currentMonthKey)}{monthlyExpenseChange === null ? " · No previous-month comparison" : ` · ${Math.abs(monthlyExpenseChange).toFixed(1)}% ${monthlyExpenseChange > 0 ? "higher" : monthlyExpenseChange < 0 ? "lower" : "unchanged"} than last month`}</small></div></article>
            </div>

            <article className="analytics-card" style={{ marginTop: 18 }}>
              <div className="analytics-card-heading" style={{ marginBottom: 16 }}>
                <div>
                  <h3>Income by source</h3>
                  <p>See which sources contribute to your recorded income</p>
                </div>
                <span className="analytics-mini-label">INCOME SOURCES</span>
              </div>

              {incomeLoading ? (
                <p style={{ color: "#819087", fontSize: 12 }}>Loading income sources...</p>
              ) : incomeError ? (
                <p role="alert">{incomeError}</p>
              ) : incomeSourceBreakdown.length === 0 ? (
                <div className="analytics-empty">Add income records with a source name to see this breakdown.</div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                    <div>
                      <span style={{ display: "block", color: "#819087", fontSize: 10, marginBottom: 5 }}>TOTAL RECORDED INCOME</span>
                      <strong style={{ color: "#087f62", font: "800 22px Manrope, sans-serif" }}>{formatReportCurrency(totalIncome)}</strong>
                    </div>
                    <span style={{ color: "#819087", fontSize: 11 }}>
                      {incomeSourceBreakdown.length} {incomeSourceBreakdown.length === 1 ? "source" : "sources"} · {incomes.length} {incomes.length === 1 ? "record" : "records"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
                    {incomeSourceBreakdown.map((item, index) => {
                      const share = totalIncome > 0 ? (item.total / totalIncome) * 100 : 0;
                      const sourceColor = analyticsColors[index % analyticsColors.length];

                      return (
                        <div key={item.source.toLocaleLowerCase()} style={{ padding: "14px 15px", border: "1px solid #e8efeb", borderRadius: 11, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 9 }}>
                            <strong style={{ color: "#29463a", fontSize: 12, overflowWrap: "anywhere" }}>{item.source}</strong>
                            <span style={{ color: "#718279", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{share.toFixed(1)}%</span>
                          </div>
                          <strong style={{ display: "block", color: "#087f62", font: "700 16px Manrope, sans-serif", marginBottom: 10 }}>{formatReportCurrency(item.total)}</strong>
                          <div
                            role="progressbar"
                            aria-label={`${item.source} share of income`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(share)}
                            style={{ height: 8, borderRadius: 999, overflow: "hidden", background: "#edf3ef" }}
                          >
                            <div style={{ width: `${Math.min(share, 100)}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${sourceColor}, #53b994)`, transition: "width 0.25s ease" }} />
                          </div>
                          <span style={{ display: "block", marginTop: 7, color: "#8a9991", fontSize: 10 }}>
                            {item.count} {item.count === 1 ? "transaction" : "transactions"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {highestIncomeSource && (
                    <p style={{ margin: "14px 0 0", color: "#718279", fontSize: 11 }}>
                      Largest income source: <strong style={{ color: "#087f62" }}>{highestIncomeSource.source}</strong> ({formatReportCurrency(highestIncomeSource.total)}).
                    </p>
                  )}
                </>
              )}
            </article>

            <article className="analytics-card" style={{ marginTop: 18 }}>
              <div
                className="analytics-card-heading"
                style={{ marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}
              >
                <div>
                  <h3>Monthly cash flow</h3>
                  <p>Compare your income and expenses month by month</p>
                </div>
                <label
                  htmlFor="monthly-trend-range"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#63756b", fontSize: 11, fontWeight: 600 }}
                >
                  Compare
                  <select
                    id="monthly-trend-range"
                    value={monthlyTrendRange}
                    onChange={(event) => setMonthlyTrendRange(event.target.value)}
                    style={{
                      padding: "8px 30px 8px 10px",
                      border: "1px solid #dce9e1",
                      borderRadius: 9,
                      background: "#fff",
                      color: "#29463a",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <option value="3">Last 3 months</option>
                    <option value="6">Last 6 months</option>
                    <option value="12">Last 12 months</option>
                    <option value="all">All time</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#63756b", fontSize: 11 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: "#078568", display: "inline-block" }} /> Income
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#63756b", fontSize: 11 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: "#e47b69", display: "inline-block" }} /> Expenses
                </span>
                <span className="analytics-mini-label">{monthlyTrendRangeLabel}</span>
              </div>

              {!hasMonthlyTrendData ? (
                <div className="analytics-empty">
                  Add income or expenses in the selected period to see your monthly trend.
                </div>
              ) : (
                <div style={{ overflowX: monthlyTrendHasHorizontalScroll ? "auto" : "visible", paddingBottom: 4 }}>
                  <div
                    role="img"
                    aria-label={`Bar chart comparing monthly income and expenses for ${monthlyTrendRange === "all" ? "all recorded history" : `the last ${monthlyTrendRange} months`}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${monthlyTrendData.length}, minmax(0, 1fr))`,
                      gap: 10,
                      alignItems: "end",
                      width: "100%",
                      minWidth: monthlyTrendHasHorizontalScroll ? `${monthlyTrendData.length * 62}px` : 0,
                    }}
                  >
                    {monthlyTrendData.map((month) => {
                      const incomeHeight = month.income > 0
                        ? Math.max((month.income / monthlyTrendMax) * 100, 2)
                        : 0;
                      const expenseHeight = month.expenses > 0
                        ? Math.max((month.expenses / monthlyTrendMax) * 100, 2)
                        : 0;

                      return (
                        <div key={month.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0, gap: 8 }}>
                          <div
                            style={{
                              width: "100%",
                              height: 176,
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "center",
                              gap: 5,
                              borderBottom: "1px solid #e5eee9",
                              padding: "0 2px",
                            }}
                          >
                            <span
                              title={`${month.fullLabel} income: ${formatReportCurrency(month.income)}`}
                              aria-label={`${month.fullLabel} income ${formatReportCurrency(month.income)}`}
                              style={{
                                display: "block",
                                width: "min(24px, 42%)",
                                height: `${incomeHeight}%`,
                                minHeight: month.income > 0 ? 3 : 0,
                                borderRadius: "6px 6px 0 0",
                                background: "linear-gradient(180deg, #53b994, #087f62)",
                              }}
                            />
                            <span
                              title={`${month.fullLabel} expenses: ${formatReportCurrency(month.expenses)}`}
                              aria-label={`${month.fullLabel} expenses ${formatReportCurrency(month.expenses)}`}
                              style={{
                                display: "block",
                                width: "min(24px, 42%)",
                                height: `${expenseHeight}%`,
                                minHeight: month.expenses > 0 ? 3 : 0,
                                borderRadius: "6px 6px 0 0",
                                background: "linear-gradient(180deg, #f1ad91, #e47b69)",
                              }}
                            />
                          </div>
                          <span style={{ color: "#718279", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                            {month.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <p style={{ margin: "12px 0 0", color: "#8a9991", fontSize: 10, lineHeight: 1.5 }}>
                Hover over a bar to see its exact amount. All months in the selected period use the same scale.
                {monthlyTrendHasHorizontalScroll ? " Scroll horizontally to explore older months." : ""}
              </p>
            </article>

            <article className="analytics-card" style={{ marginTop: 18 }}>
              <div className="analytics-card-heading" style={{ marginBottom: 16 }}>
                <div>
                  <h3>Savings progress</h3>
                  <p>Track how close you are to your savings goals</p>
                </div>
                <span className="analytics-mini-label">GOAL TRACKER</span>
              </div>

              {savingsLoading ? (
                <p style={{ color: "#819087", fontSize: 12 }}>Loading savings goals...</p>
              ) : savingsError ? (
                <p role="alert">{savingsError}</p>
              ) : savingsGoals.length === 0 ? (
                <div className="analytics-empty">Create a savings goal to see your progress here.</div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: "14px 16px", borderRadius: 11, background: "#f4faf7" }}>
                      <span style={{ display: "block", color: "#819087", fontSize: 10, marginBottom: 6 }}>TOTAL SAVED</span>
                      <strong style={{ color: "#087f62", fontSize: 18 }}>{formatReportCurrency(totalSavingsCurrent)}</strong>
                    </div>
                    <div style={{ padding: "14px 16px", borderRadius: 11, background: "#f8faf9" }}>
                      <span style={{ display: "block", color: "#819087", fontSize: 10, marginBottom: 6 }}>TOTAL TARGET</span>
                      <strong style={{ color: "#29463a", fontSize: 18 }}>{formatReportCurrency(totalSavingsTarget)}</strong>
                    </div>
                    <div style={{ padding: "14px 16px", borderRadius: 11, background: "#f8faf9" }}>
                      <span style={{ display: "block", color: "#819087", fontSize: 10, marginBottom: 6 }}>GOALS COMPLETED</span>
                      <strong style={{ color: "#29463a", fontSize: 18 }}>{completedSavingsGoals} / {savingsGoals.length}</strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8, color: "#63756b", fontSize: 11 }}>
                      <strong style={{ color: "#29463a" }}>Overall savings progress</strong>
                      <strong style={{ color: "#087f62" }}>{overallSavingsProgress.toFixed(1)}%</strong>
                    </div>
                    <div
                      role="progressbar"
                      aria-label="Overall savings progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(overallSavingsProgress)}
                      style={{ height: 10, borderRadius: 999, overflow: "hidden", background: "#edf3ef" }}
                    >
                      <div style={{ width: `${overallSavingsProgress}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #087f62, #53b994)", transition: "width 0.25s ease" }} />
                    </div>
                    <p style={{ margin: "7px 0 0", color: "#8a9991", fontSize: 10 }}>
                      {formatReportCurrency(totalSavingsCurrent)} saved out of {formatReportCurrency(totalSavingsTarget)} across all goals.
                    </p>
                  </div>

                  <div style={{ display: "grid", gap: 15 }}>
                    {savingsGoals.map((goal) => {
                      const target = Number(goal.target_amount) || 0;
                      const saved = Number(goal.current_amount) || 0;
                      const progress = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
                      const isComplete = target > 0 && saved >= target;

                      return (
                        <div key={goal.id} style={{ padding: "13px 14px", border: "1px solid #e8efeb", borderRadius: 11 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ display: "block", color: "#29463a", fontSize: 12, overflowWrap: "anywhere" }}>{goal.title}</strong>
                              <span style={{ display: "block", marginTop: 4, color: "#819087", fontSize: 10 }}>
                                {formatReportCurrency(saved)} of {formatReportCurrency(target)}
                              </span>
                            </div>
                            <span style={{ flexShrink: 0, color: isComplete ? "#087f62" : "#718279", fontSize: 11, fontWeight: 700 }}>
                              {isComplete ? "Completed" : `${progress.toFixed(0)}%`}
                            </span>
                          </div>
                          <div
                            role="progressbar"
                            aria-label={`${goal.title} progress`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(progress)}
                            style={{ height: 8, borderRadius: 999, overflow: "hidden", background: "#edf3ef" }}
                          >
                            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 999, background: isComplete ? "#087f62" : "linear-gradient(90deg, #53b994, #087f62)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </article>
          </section>}

          {activePage === "dashboard" && <>
            <div className="dashboard-panels">
              <section className="dashboard-section overview-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent Transactions</h2>
                    <p>Your latest income and expenses</p>
                  </div>
                  <button type="button" className="text-action" onClick={() => setActivePage("transactions")}>View all</button>
                </div>
                {incomeLoading || expenseLoading ? <p>Loading recent activity...</p> : (
                  allTransactions.length === 0
                    ? <div className="empty-state">
                        <div className="empty-icon">↗</div>
                        <strong>No transactions yet</strong>
                        <p>Add your first income or expense to see your activity here.</p>
                        <button type="button" onClick={() => setActivePage("transactions")}>Add a transaction</button>
                      </div>
                    : <div className="recent-list">
                        {allTransactions.slice(0, 5).map((item) => (
                          <div className="recent-row" key={item.id}>
                            <div className={`recent-icon ${item.type.toLowerCase()}`}>{item.type === "Income" ? "↙" : "↗"}</div>
                            <div className="recent-info">
                              <strong>{item.title}</strong>
                              <span>{item.category} · {item.date}</span>
                            </div>
                            <strong className={item.type === "Income" ? "income-amount" : "expense-amount"}>
                              {item.type === "Income" ? "+" : "−"}₹{item.amount.toFixed(2)}
                            </strong>
                          </div>
                        ))}
                      </div>
                )}
              </section>
              <section className="dashboard-section overview-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Budget Snapshot</h2>
                    <p>This month's spending limits</p>
                  </div>
                  <button type="button" className="text-action" onClick={() => setActivePage("budgets")}>Manage</button>
                </div>
                {budgetLoading ? <p>Loading budgets...</p> : budgetSummary.length === 0 ? (
                  <div className="empty-state compact">
                    <div className="empty-icon">◫</div>
                    <strong>No monthly budgets yet</strong>
                    <p>Create category limits to keep your spending on track.</p>
                    <button type="button" onClick={() => setActivePage("budgets")}>Create a budget</button>
                  </div>
                ) : <div className="budget-snapshot-list">
                  {budgetSummary.slice(0, 4).map((budget) => {
                    const actualUsed = Number(budget.percentage_used) || 0;
                    const barWidth = Math.min(actualUsed, 100);
                    const overAmount = Math.max(
                      Number(budget.total_spent) - Number(budget.budget_limit),
                      0
                    );
                    return <div className="budget-snapshot-item" key={budget.category}>
                      <div>
                        <strong>{budget.category}</strong>
                        <span className={budget.is_exceeded ? "over-budget-label" : ""}>
                          {actualUsed.toFixed(0)}% used
                        </span>
                      </div>
                      <div className="budget-track"><span style={{ width: `${barWidth}%`, ...(budget.is_exceeded ? { background: "#d9534f" } : {}) }} /></div>
                      <small>
                        ₹{Number(budget.total_spent).toFixed(2)} spent of ₹{Number(budget.budget_limit).toFixed(2)}
                        {budget.is_exceeded ? ` · ₹${overAmount.toFixed(2)} over limit` : ""}
                      </small>
                    </div>;
                  })}
                </div>}
              </section>
            </div>

            <div className="dashboard-panels">
              <section className="dashboard-section overview-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Savings Goals</h2>
                    <p>Your progress so far</p>
                  </div>
                  <button type="button" className="text-action" onClick={() => setActivePage("savings")}>View all</button>
                </div>
                {savingsGoals.length === 0 ? (
                  <p>No savings goals yet.</p>
                ) : savingsGoals.slice(0, 3).map((goal) => {
                  const target = Number(goal.target_amount) || 0;
                  const saved = Number(goal.current_amount) || 0;
                  const progress = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
                  return (
                    <div className="budget-snapshot-item" key={goal.id}>
                      <div>
                        <strong>{goal.title}</strong>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="budget-track"><span style={{ width: `${progress}%` }} /></div>
                      <small>₹{saved.toFixed(2)} saved of ₹{target.toFixed(2)}</small>
                    </div>
                  );
                })}
              </section>
              <section className="dashboard-section overview-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Latest Alerts</h2>
                    <p>Your unread notifications</p>
                  </div>
                  <button type="button" className="text-action" onClick={() => setActivePage("notifications")}>View all</button>
                </div>
                {notifications.filter((item) => !item.is_read).length === 0 ? (
                  <p>You're all caught up.</p>
                ) : [...notifications]
                    .filter((item) => !item.is_read)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3)
                    .map((item) => (
                      <div className="budget-snapshot-item" key={item.id}>
                        <small>{item.message}</small>
                        <small>{new Date(item.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small>
                      </div>
                    ))}
              </section>
            </div>
          </>}

          {activePage === "transactions" && <>
            <section className="dashboard-section compact-transactions">
              <div className="transactions-toolbar">
                <div>
                  <h2>Transaction History</h2>
                  <p>Search, filter and manage all your income and expenses.</p>
                </div>
                <button type="button" className="add-transaction-button" onClick={() => setShowTransactionModal(true)}>＋ Add Transaction</button>
              </div>
              <div className="history-totals">
                <div><span>Income</span><strong className="income-amount">+₹{historyIncome.toFixed(2)}</strong></div>
                <div><span>Expenses</span><strong className="expense-amount">−₹{historyExpenses.toFixed(2)}</strong></div>
                <div><span>Net balance</span><strong>₹{(historyIncome - historyExpenses).toFixed(2)}</strong></div>
              </div>
              <div className="transaction-filters">
                <label className="transaction-search">Search transactions
                  <input type="search" value={transactionSearch} onChange={(event) => { setTransactionSearch(event.target.value); setTransactionPage(1); }} placeholder="Search title, category, notes..." />
                </label>
                <label>Month
                  <select value={historyMonth} onChange={(event) => { setHistoryMonth(event.target.value); setTransactionPage(1); }}>
                    <option value="all">All months</option>
                    {availableHistoryMonths.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}
                  </select>
                </label>
                <label>Type
                  <select value={transactionTypeFilter} onChange={(event) => { setTransactionTypeFilter(event.target.value); setTransactionPage(1); }}>
                    <option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option>
                  </select>
                </label>
                <label>Category
                  <select value={transactionCategoryFilter} onChange={(event) => { setTransactionCategoryFilter(event.target.value); setTransactionPage(1); }}>
                    <option value="all">All categories</option>
                    {transactionCategories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              {incomeError && <p role="alert">{incomeError}</p>}
              {expenseError && <p role="alert">{expenseError}</p>}
              {incomeLoading || expenseLoading ? <p>Loading transactions...</p> : searchedTransactions.length === 0 ? (
                <p className="history-empty">No transactions match your search or filters.</p>
              ) : <>
                <div className="history-table-wrap">
                  <table className="history-table compact-history-table">
                    <thead><tr><th>Date</th><th>Transaction</th><th>Category</th><th>Type</th><th>Amount</th><th>Actions</th></tr></thead>
                    <tbody>
                      {paginatedTransactions.map((item) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td><strong>{item.title}</strong>{item.notes && <small>{item.notes}</small>}</td>
                          <td>{item.category}</td>
                          <td><span className={`transaction-type ${item.type.toLowerCase()}`}>{item.type}</span></td>
                          <td className={item.type === "Income" ? "income-amount" : "expense-amount"}>{item.type === "Income" ? "+" : "−"}₹{item.amount.toFixed(2)}</td>
                          <td className="transaction-actions">
                            {item.type === "Income" ? <>
                              {editingIncomeId === Number(String(item.id).replace("income-", "")) ? <>
                                <input aria-label="New income amount" className="inline-amount-input" type="number" min="0.01" step="0.01" value={editingIncomeAmount} onChange={(event) => setEditingIncomeAmount(event.target.value)} />
                                <button type="button" onClick={() => handleUpdateIncome(Number(String(item.id).replace("income-", "")))}>Save</button>
                                <button type="button" className="secondary-action" onClick={() => setEditingIncomeId(null)}>Cancel</button>
                              </> : <button type="button" className="secondary-action" onClick={() => { setEditingIncomeId(Number(String(item.id).replace("income-", ""))); setEditingIncomeAmount(String(item.amount)); }}>Edit</button>}
                              <button type="button" className="delete-action" onClick={() => handleDeleteIncome(Number(String(item.id).replace("income-", "")))}>Delete</button>
                            </> : <>
                              {editingId === Number(String(item.id).replace("expense-", "")) ? <>
                                <input aria-label="New expense amount" className="inline-amount-input" type="number" min="0.01" step="0.01" value={editingAmount} onChange={(event) => setEditingAmount(event.target.value)} />
                                <button type="button" onClick={() => handleUpdateExpense(Number(String(item.id).replace("expense-", "")))}>Save</button>
                                <button type="button" className="secondary-action" onClick={() => setEditingId(null)}>Cancel</button>
                              </> : <button type="button" className="secondary-action" onClick={() => { setEditingId(Number(String(item.id).replace("expense-", ""))); setEditingAmount(String(item.amount)); }}>Edit</button>}
                              <button type="button" className="delete-action" onClick={() => handleDeleteExpense(Number(String(item.id).replace("expense-", "")))}>Delete</button>
                            </>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="transaction-pagination">
                  <span>Showing {(safeTransactionPage - 1) * transactionsPerPage + 1}–{Math.min(safeTransactionPage * transactionsPerPage, searchedTransactions.length)} of {searchedTransactions.length}</span>
                  <div>
                    <button type="button" className="secondary-action" disabled={safeTransactionPage === 1} onClick={() => setTransactionPage((page) => Math.max(1, page - 1))}>Previous</button>
                    <span>Page {safeTransactionPage} of {totalTransactionPages}</span>
                    <button type="button" className="secondary-action" disabled={safeTransactionPage >= totalTransactionPages} onClick={() => setTransactionPage((page) => Math.min(totalTransactionPages, page + 1))}>Next</button>
                  </div>
                </div>
              </>}
            </section>

            {showTransactionModal && <div className="transaction-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowTransactionModal(false); }}>
              <section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
                <div className="modal-heading"><div><h2 id="transaction-modal-title">Add a transaction</h2><p>Record money coming in or going out.</p></div><button type="button" className="modal-close" aria-label="Close" onClick={() => setShowTransactionModal(false)}>×</button></div>
                <div className="transaction-type-switch"><button type="button" className={newTransactionType === "expense" ? "selected" : ""} onClick={() => setNewTransactionType("expense")}>Expense</button><button type="button" className={newTransactionType === "income" ? "selected" : ""} onClick={() => setNewTransactionType("income")}>Income</button></div>
                {newTransactionType === "income" ? <form onSubmit={handleAddIncome}>
                  <label>Income source<input value={incomeSource} onChange={(event) => setIncomeSource(event.target.value)} placeholder="e.g. Salary or Scholarship" required /></label>
                  <label>Amount (₹)<input type="number" min="0.01" step="0.01" value={incomeAmount} onChange={(event) => setIncomeAmount(event.target.value)} required /></label>
                  <label>Date<input type="date" value={incomeDate} onChange={(event) => setIncomeDate(event.target.value)} required /></label>
                  <label>Notes (optional)<textarea value={incomeNotes} onChange={(event) => setIncomeNotes(event.target.value)} placeholder="Add notes" /></label>
                  {incomeError && <p role="alert">{incomeError}</p>}
                  <div className="modal-actions"><button type="button" className="secondary-action" onClick={() => setShowTransactionModal(false)}>Cancel</button><button type="submit">Save Income</button></div>
                </form> : <form onSubmit={handleAddExpense}>
                  <label>Expense title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Lunch" maxLength={100} required /></label>
                  <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)} required><option>Food</option><option>Travel</option><option>Shopping</option><option>Education</option><option>Bills</option><option>Health</option><option>Other</option></select></label>
                  <label>Amount (₹)<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
                  <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
                  <label className="modal-full-field">Notes (optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add notes" /></label>
                  {expenseError && <p role="alert">{expenseError}</p>}
                  <div className="modal-actions"><button type="button" className="secondary-action" onClick={() => setShowTransactionModal(false)}>Cancel</button><button type="submit">Save Expense</button></div>
                </form>}
              </section>
            </div>}
          </>}

          {activePage === "budgets" && <>
          <section className="dashboard-section" id="budgets">
            <h2>Create a Monthly Budget</h2>
            <form onSubmit={handleAddBudget}>
              <label>Category
                <select value={budgetCategory}
                  onChange={(event) => setBudgetCategory(event.target.value)} required>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Education">Education</option>
                  <option value="Bills">Bills</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>Monthly limit (₹)
                <input type="number" min="0.01" step="0.01"
                  value={budgetLimit}
                  onChange={(event) => setBudgetLimit(event.target.value)} required />
              </label>
              <label>Month
                <select value={budgetMonth}
                  onChange={(event) => setBudgetMonth(event.target.value)} required>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={String(index + 1)}>
                      {new Date(2000, index, 1).toLocaleString("en", { month: "long" })}
                    </option>
                  ))}
                </select>
              </label>
              <label>Year
                <input type="number" min="2020" max="2100"
                  value={budgetYear}
                  onChange={(event) => setBudgetYear(event.target.value)} required />
              </label>
              <button type="submit">Create Budget</button>
            </form>
            {budgetError && <p role="alert">{budgetError}</p>}
          </section>

          <section className="dashboard-section">
            <h2>Budget Summary</h2>

            <div className="transaction-filters">
              <label>
                Period
                <select
                  value={budgetPeriod}
                  onChange={(event) => setBudgetPeriod(event.target.value)}
                >
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                </select>
              </label>

              <label>
                Category
                <select
                  value={budgetCategoryFilter}
                  onChange={(event) => setBudgetCategoryFilter(event.target.value)}
                >
                  <option value="all">All Categories</option>
                  {budgetCategories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            {budgetError && <p role="alert">{budgetError}</p>}

            {budgetPeriod === "monthly" ? (
              <>
                {budgetLoading && <p>Loading budget summary...</p>}

                {budgetSummary
                  .filter((budget) =>
                    budgetCategoryFilter === "all" ||
                    budget.category === budgetCategoryFilter
                  )
                  .map((budget) => {
                    const currentMonth = new Date().getMonth() + 1;
                    const currentYear = new Date().getFullYear();

                    const budgetRecord = budgetRecords.find((record) =>
                      record.category === budget.category &&
                      Number(record.month) === currentMonth &&
                      Number(record.year) === currentYear
                    );

                    return (
                      <div className="summary-card" key={budgetRecord?.id ?? budget.category}>
                        <h3>{budget.category}</h3>
                        <p>Monthly budget limit: ₹{Number(budget.budget_limit).toFixed(2)}</p>
                        <p>Spent: ₹{Number(budget.total_spent).toFixed(2)}</p>
                        <p>Remaining: ₹{Number(budget.remaining).toFixed(2)}</p>
                        <p>Budget used: {Number(budget.percentage_used).toFixed(2)}%</p>

                        {budget.is_exceeded
                          ? <p className="budget-exceeded-message" role="alert">Warning: You are ₹{(Number(budget.total_spent) - Number(budget.budget_limit)).toFixed(2)} over this budget.</p>
                          : <p>Within budget</p>}

                        {budgetRecord && (
                          editingBudgetId === budgetRecord.id ? (
                            <div>
                              <label>New monthly limit (₹)
                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={editingBudgetLimit}
                                  onChange={(event) => setEditingBudgetLimit(event.target.value)}
                                />
                              </label>
                              <button type="button" onClick={() => handleUpdateBudget(budgetRecord.id)}>
                                Save Budget
                              </button>
                              <button type="button" onClick={() => {
                                setEditingBudgetId(null);
                                setEditingBudgetLimit("");
                              }}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => {
                              setEditingBudgetId(budgetRecord.id);
                              setEditingBudgetLimit(String(budgetRecord.limit_amount));
                              setBudgetError("");
                            }}>
                              Edit Budget
                            </button>
                          )
                        )}

                        {budgetRecord && (
                          <button type="button" onClick={() => handleDeleteBudget(budgetRecord.id)}>
                            Delete Budget
                          </button>
                        )}
                      </div>
                    );
                  })}

                {!budgetLoading && budgetSummary.filter((budget) =>
                  budgetCategoryFilter === "all" ||
                  budget.category === budgetCategoryFilter
                ).length === 0 && (
                  <p>No monthly budget found for this category.</p>
                )}
              </>
            ) : (
              <div className="summary-card">
                <h3>
                  {budgetPeriod === "weekly" ? "This Week's Spending" : "This Year's Spending"}
                </h3>
                <p>Total spent: ₹{filteredBudgetSpent.toFixed(2)}</p>
                <p>Transactions: {filteredBudgetExpenses.length}</p>
                <p>
                  This view shows actual recorded expenses. Monthly budget limits are
                  available in the Monthly view.
                </p>
              </div>
            )}
          </section>
          </>}

          {activePage === "savings" && <>
          <section className="dashboard-section" id="savings">
            <h2>Create a Savings Goal</h2>
            <form onSubmit={handleAddGoal}>
              <label>Goal title
                <input value={goalTitle}
                  onChange={(event) => setGoalTitle(event.target.value)}
                  placeholder="e.g. Buy a laptop" maxLength={100} required />
              </label>
              <label>Target amount (₹)
                <input type="number" min="0.01" step="0.01"
                  value={goalTarget}
                  onChange={(event) => setGoalTarget(event.target.value)} required />
              </label>
              <label>Already saved (₹)
                <input type="number" min="0" step="0.01"
                  value={goalCurrent}
                  onChange={(event) => setGoalCurrent(event.target.value)} />
              </label>
              <label>Target date (optional)
                <input type="date" value={goalDate}
                  onChange={(event) => setGoalDate(event.target.value)} />
              </label>
              <button type="submit">Create Savings Goal</button>
            </form>
          </section>

          <section className="dashboard-section">
            <h2>Your Savings Goals</h2>
            {savingsLoading && <p>Loading savings goals...</p>}
            {savingsError && <p role="alert">{savingsError}</p>}
            {!savingsLoading && savingsGoals.length === 0 &&
              <p>No savings goals yet. Create your first goal above.</p>}
            {savingsGoals.map((goal) => {
              const target = Number(goal.target_amount);
              const saved = Number(goal.current_amount);
              const progress = target > 0
                ? Math.min((saved / target) * 100, 100)
                : 0;
              return (
                <div className="summary-card" key={goal.id}>
                  <h3>{goal.title}</h3>
                  <p>Target: ₹{target.toFixed(2)}</p>
                  <p>Saved: ₹{saved.toFixed(2)}</p>
                  <p>Remaining: ₹{Math.max(target - saved, 0).toFixed(2)}</p>
                  {goal.target_date && <p>Target date: {goal.target_date}</p>}
                  <p>Progress: {progress.toFixed(1)}%</p>
                  <progress value={progress} max="100" />
                  {editingGoalId === goal.id ? (
                    <div>
                      <label>Updated saved amount (₹)
                        <input type="number" min="0" step="0.01"
                          value={editingGoalAmount}
                          onChange={(event) => setEditingGoalAmount(event.target.value)} />
                      </label>
                      <button onClick={() => handleUpdateGoal(goal.id)}>Save Progress</button>
                      <button onClick={() => setEditingGoalId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => {
                      setEditingGoalId(goal.id);
                      setEditingGoalAmount(String(goal.current_amount));
                    }}>Update Progress</button>
                  )}
                  <button onClick={() => handleDeleteGoal(goal.id)}>Delete Goal</button>
                </div>
              );
            })}
          </section>
          </>}
          {activePage === "notifications" && (
            <section className="notifications-page dashboard-section">
              <div className="notifications-page-heading">
                <div>
                  <h2>Your notifications</h2>
                  <p>Important updates about your budgets and savings goals.</p>
                </div>
                <div className="notifications-page-count">
                  <strong>{unreadNotificationCount}</strong>
                  <span>unread</span>
                </div>
              </div>

              <div className="notifications-toolbar">
                <div className="notification-filters" role="group" aria-label="Filter notifications">
                  <button
                    type="button"
                    className={notificationFilter === "all" ? "selected" : ""}
                    onClick={() => setNotificationFilter("all")}
                  >All ({notifications.length})</button>
                  <button
                    type="button"
                    className={notificationFilter === "unread" ? "selected" : ""}
                    onClick={() => setNotificationFilter("unread")}
                  >Unread ({unreadNotificationCount})</button>
                  <button
                    type="button"
                    className={notificationFilter === "read" ? "selected" : ""}
                    onClick={() => setNotificationFilter("read")}
                  >Read</button>
                </div>
                <button
                  type="button"
                  className="notification-mark-all"
                  onClick={handleMarkAllNotificationsRead}
                  disabled={unreadNotificationCount === 0}
                >
                  Mark all as read
                </button>
              </div>

              {notificationsLoading && <p>Loading notifications...</p>}
              {notificationsError && <p className="notification-error" role="alert">{notificationsError}</p>}

              {!notificationsLoading && filteredNotifications.length === 0 && (
                <div className="notification-empty-state">
                  <span className="notification-empty-icon">✓</span>
                  <strong>{notificationFilter === "unread" ? "You're all caught up" : "No notifications here"}</strong>
                  <p>{notificationFilter === "unread" ? "New budget and savings alerts will appear here." : "Budget alerts and savings updates will appear here."}</p>
                </div>
              )}

              <div className="notification-list">
                {filteredNotifications.map((notification) => {
                  const kind = getNotificationKind(notification);
                  return (
                    <article
                      className={`notification-card ${notification.is_read ? "is-read" : "is-unread"}`}
                      key={notification.id}
                    >
                      <div className={`notification-type-icon ${kind}`} aria-hidden="true">
                      {kind === "budget" ? "₹" : kind === "goal" ? "★" : kind === "report" ? "▤" : "i"}
                      </div>
                      <div className="notification-card-content">
                        <div className="notification-card-title-row">
                        <strong>{kind === "budget" ? "Budget alert" : kind === "goal" ? "Savings update" : kind === "report" ? "Report reminder" : "Account update"}</strong>
                          <span className={`notification-status ${notification.is_read ? "read" : "unread"}`}>
                            {notification.is_read ? "Read" : "Unread"}
                          </span>
                        </div>
                        <p>{notification.message}</p>
                        <small>{formatNotificationTime(notification.created_at)}</small>
                      </div>
                      <div className="notification-card-actions">
                        {!notification.is_read && (
                          <button type="button" onClick={() => handleMarkNotificationRead(notification.id)}>
                            Mark as read
                          </button>
                        )}
                        <button
                          type="button"
                          className="notification-delete-button"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {activePage === "reports" && (
            <div className="reports-page">
              <section className="report-builder dashboard-section">
                <div className="report-section-heading">
                  <div>
                    <span className="report-eyebrow">REPORT BUILDER</span>
                    <h2>Create a financial report</h2>
                    <p>Select a date range to review and export your income and expenses.</p>
                  </div>
                  <div className="report-builder-mark" aria-hidden="true">▤</div>
                </div>

                <form className="report-generator-form" onSubmit={handleGenerateReport}>
                  <label className="report-title-field">
                    Report title
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(event) => setReportTitle(event.target.value)}
                      placeholder="e.g. November 2026 Financial Report"
                      maxLength={100}
                      required
                    />
                  </label>

                  <label>
                    Start date
                    <input
                      type="date"
                      value={reportStartDate}
                      max={reportEndDate}
                      onChange={(event) => setReportStartDate(event.target.value)}
                      required
                    />
                  </label>

                  <label>
                    End date
                    <input
                      type="date"
                      value={reportEndDate}
                      min={reportStartDate}
                      onChange={(event) => setReportEndDate(event.target.value)}
                      required
                    />
                  </label>

                  <div className="report-form-footer">
                    <p>Includes income, expenses, category totals and balance.</p>
                    <button type="submit" disabled={reportCreating}>
                      {reportCreating ? "Generating report..." : "＋ Generate report"}
                    </button>
                  </div>
                </form>

                {reportCreateError && (
                  <p className="report-inline-error" role="alert">{reportCreateError}</p>
                )}
              </section>

              <section className="reports-library">
                <div className="report-library-heading">
                  <div>
                    <span className="report-eyebrow">YOUR REPORT LIBRARY</span>
                    <h2>Saved reports</h2>
                    <p>Review key figures here, or expand a report to inspect its transactions.</p>
                  </div>

                  <div className="report-library-controls">
                    <span className="report-count">
                      {filteredReports.length} of {reports.length}
                    </span>
                    <label className="report-search-label">
                      <span className="sr-only">Search reports</span>
                      <input
                        type="search"
                        value={reportSearch}
                        onChange={(event) => setReportSearch(event.target.value)}
                        placeholder="Search reports..."
                      />
                    </label>
                  </div>
                </div>

                {reportsLoading && <p className="report-list-message">Loading saved reports...</p>}
                {reportsError && <p className="report-inline-error" role="alert">{reportsError}</p>}

                {!reportsLoading && !reportsError && reports.length === 0 && (
                  <div className="report-empty-state">
                    <span className="report-empty-icon" aria-hidden="true">▤</span>
                    <h3>No reports yet</h3>
                    <p>Create your first report above. It will appear here with a financial preview and download options.</p>
                  </div>
                )}

                {!reportsLoading && !reportsError && reports.length > 0 && filteredReports.length === 0 && (
                  <div className="report-empty-state compact">
                    <h3>No matching reports</h3>
                    <p>Try a different title or date.</p>
                  </div>
                )}

                <div className="report-history-list">
                  {filteredReports.map((report) => {
                    const preview = getReportPreview(report);
                    const pdfBusy = reportDownloading === `${report.id}-pdf`;
                    const excelBusy = reportDownloading === `${report.id}-excel`;
                    const generatedDate = report.created_at
                      ? new Date(report.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <article className="report-history-card" key={report.id}>
                        <div className="report-card-header">
                          <div className="report-file-mark" aria-hidden="true">▤</div>
                          <div className="report-card-title">
                            <span className="report-card-kicker">FINANCIAL REPORT</span>
                            <h3>{report.title}</h3>
                            <p>
                              {formatReportDate(report.start_date)} – {formatReportDate(report.end_date)}
                            </p>
                          </div>
                          <div className="report-generated">
                            <span>GENERATED</span>
                            <strong>{generatedDate}</strong>
                          </div>
                        </div>

                        <div className="report-metric-grid">
                          <div className="report-metric income">
                            <span>Total income</span>
                            <strong>{formatReportCurrency(preview.incomeTotal)}</strong>
                          </div>
                          <div className="report-metric expense">
                            <span>Total expenses</span>
                            <strong>{formatReportCurrency(preview.expenseTotal)}</strong>
                          </div>
                          <div className="report-metric balance">
                            <span>Net balance</span>
                            <strong>{formatReportCurrency(preview.balance)}</strong>
                          </div>
                        </div>

                        <div className="report-card-insight">
                          <span>Highest expense category</span>
                          {preview.topCategory ? (
                            <strong>
                              {preview.topCategory[0]}
                              <span>{formatReportCurrency(preview.topCategory[1])}</span>
                            </strong>
                          ) : (
                            <strong>No expenses recorded</strong>
                          )}
                        </div>

                        <div className="report-card-footer">
                          <details className="report-transaction-preview">
                            <summary>
                              Preview transactions
                              <span>{preview.incomes.length + preview.expenses.length} records</span>
                            </summary>

                            <div className="report-preview-content">
                              <div className="report-preview-group">
                                <h4>Income <span>{preview.incomes.length}</span></h4>
                                {preview.incomes.length === 0 ? (
                                  <p className="report-no-rows">No income records in this period.</p>
                                ) : (
                                  <div className="report-preview-table-wrap">
                                    <table className="report-preview-table">
                                      <thead>
                                        <tr><th>Date</th><th>Source</th><th>Amount</th></tr>
                                      </thead>
                                      <tbody>
                                        {preview.incomes.map((item) => (
                                          <tr key={`report-${report.id}-income-${item.id}`}>
                                            <td>{formatReportDate(item.date)}</td>
                                            <td>{item.source}</td>
                                            <td>{formatReportCurrency(item.amount)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              <div className="report-preview-group">
                                <h4>Expenses <span>{preview.expenses.length}</span></h4>
                                {preview.expenses.length === 0 ? (
                                  <p className="report-no-rows">No expense records in this period.</p>
                                ) : (
                                  <div className="report-preview-table-wrap">
                                    <table className="report-preview-table">
                                      <thead>
                                        <tr><th>Date</th><th>Expense</th><th>Category</th><th>Amount</th></tr>
                                      </thead>
                                      <tbody>
                                        {preview.expenses.map((item) => (
                                          <tr key={`report-${report.id}-expense-${item.id}`}>
                                            <td>{formatReportDate(item.date)}</td>
                                            <td>{item.title}</td>
                                            <td>{item.category}</td>
                                            <td>{formatReportCurrency(item.amount)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          </details>

                          <div className="report-download-actions">
                            <button
                              type="button"
                              className="report-download-pdf"
                              disabled={Boolean(reportDownloading)}
                              onClick={() => downloadPDF(report.id)}
                            >
                              {pdfBusy ? "Preparing PDF..." : "↓ Download PDF"}
                            </button>
                            <button
                              type="button"
                              className="report-download-excel"
                              disabled={Boolean(reportDownloading)}
                              onClick={() => downloadExcel(report.id)}
                            >
                              {excelBusy ? "Preparing Excel..." : "▦ Download Excel"}
                            </button>
                            <button
                              type="button"
                              className="report-delete-button"
                              onClick={() => handleDeleteReport(report.id)}
                              aria-label={`Delete ${report.title}`}
                              title="Delete saved report"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {message && <p className="status-message" role="status" aria-live="polite">{message}</p>}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <h2>BudgetBuddy</h2>
        <span>Manage your money wisely</span>
      </header>
      <main className="main-content">
        <section className="welcome">
          <h1>Your money, your future.</h1>
          <p>Track expenses, plan your budget, and work towards your savings goals.</p>
        </section>
        <section className="auth-card">
          <h2>{isLogin ? "Welcome Back!" : "Create Account"}</h2>
          <p>{isLogin
            ? "Log in to manage your finances."
            : "Join BudgetBuddy to manage your money."}</p>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <label>Username
                <input type="text" value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username" required />
              </label>
            )}
            <label>{isLogin ? "Username" : "Email"}
              <input type={isLogin ? "text" : "email"} value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={isLogin ? "Enter your username" : "Enter your email"}
                required />
            </label>
            <label>Password
              <input type="password" value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password" minLength={8} required />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Log In" : "Register"}
            </button>
          </form>
          {message && <p role="status" aria-live="polite">{message}</p>}
          <p className="switch-text">
            {isLogin ? "New to BudgetBuddy?" : "Already have an account?"}
            <button className="switch-button" type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
                setPassword("");
              }}>
              {isLogin ? "Create account" : "Log in"}
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;