import { useEffect, useState } from "react";
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
          <div className="topbar-actions"><span className="secure-label">Your money, in focus</span><button onClick={handleLogout}>Log Out</button></div>
        </header>

        <div className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)}></div>
        <div className="workspace">
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <p className="sidebar-label">WORKSPACE</p>
            <button type="button" className={`side-link ${activePage === "dashboard" ? "active" : ""}`} onClick={() => { setActivePage("dashboard"); setSidebarOpen(false); }}><span>▦</span> Overview</button>
            <button type="button" className={`side-link ${activePage === "transactions" ? "active" : ""}`} onClick={() => { setActivePage("transactions"); setSidebarOpen(false); }}><span>↗</span> Transactions</button>
            <button type="button" className={`side-link ${activePage === "budgets" ? "active" : ""}`} onClick={() => { setActivePage("budgets"); setSidebarOpen(false); }}><span>◫</span> Budgets</button>
            <button type="button" className={`side-link ${activePage === "savings" ? "active" : ""}`} onClick={() => { setActivePage("savings"); setSidebarOpen(false); }}><span>◎</span> Savings goals</button>
            <div className="sidebar-note"><strong>Small steps add up.</strong><p>Keep tracking. Keep growing.</p></div>
          </aside>

          <main className="dashboard">
          <div className="page-heading" id="overview"><div><p className="eyebrow">YOUR FINANCIAL OVERVIEW</p><h1>{activePage === "dashboard" ? `${greeting}, ${displayName || "there"}!` : activePage === "transactions" ? "Transactions & History" : activePage === "budgets" ? "Your Budgets" : "Savings Goals"}</h1></div><span className="date-chip">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
          <p className="page-subtitle">{activePage === "dashboard" ? "Here is your money overview for today." : activePage === "transactions" ? "See every rupee coming in and going out." : activePage === "budgets" ? "Plan your spending and stay within your limits." : "Track your progress, one step at a time."}</p>

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

          {activePage === "dashboard" && <section className="analytics-section">
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
                    const used = Math.min(Number(budget.percentage_used) || 0, 100);
                    return <div className="budget-snapshot-item" key={budget.category}>
                      <div><strong>{budget.category}</strong><span>{used.toFixed(0)}% used</span></div>
                      <div className="budget-track"><span style={{ width: `${used}%` }} /></div>
                      <small>₹{Number(budget.total_spent).toFixed(2)} spent of ₹{Number(budget.budget_limit).toFixed(2)}</small>
                    </div>;
                  })}
                </div>}
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
                          ? <p role="alert">Warning: You have exceeded this budget.</p>
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
