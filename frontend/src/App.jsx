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

  // Dashboard data
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState([]);
  const [budgetRecords, setBudgetRecords] = useState([]);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingBudgetLimit, setEditingBudgetLimit] = useState("");
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
        setExpenses(response.data);
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
        setIncomes(response.data);
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

  if (isLoggedIn) {
    return (
      <div className="app">
        <header className="navbar">
          <h2>BudgetBuddy</h2>
          <button onClick={handleLogout}>Log Out</button>
        </header>

        <main className="dashboard">
          <h1>Welcome to your Dashboard!</h1>
          <p>Here is an overview of your finances.</p>

          <div className="dashboard-grid">
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
          </div>

          <section className="dashboard-section">
            <h2>Add Income</h2>
            <form onSubmit={handleAddIncome}>
              <label>Income source
                <input value={incomeSource}
                  onChange={(event) => setIncomeSource(event.target.value)}
                  placeholder="e.g. Salary or Scholarship" required />
              </label>
              <label>Amount (₹)
                <input type="number" min="0.01" step="0.01"
                  value={incomeAmount}
                  onChange={(event) => setIncomeAmount(event.target.value)} required />
              </label>
              <label>Date
                <input type="date" value={incomeDate}
                  onChange={(event) => setIncomeDate(event.target.value)} required />
              </label>
              <label>Notes (optional)
                <textarea value={incomeNotes}
                  onChange={(event) => setIncomeNotes(event.target.value)}
                  placeholder="Add notes" />
              </label>
              <button type="submit">Add Income</button>
            </form>
          </section>

          <section className="dashboard-section">
            <h2>Your Income</h2>
            {incomeLoading && <p>Loading income records...</p>}
            {incomeError && <p role="alert">{incomeError}</p>}
            {!incomeLoading && incomes.length === 0 &&
              <p>No income records found. Add your first income above.</p>}
            {incomes.map((income) => (
              <div className="summary-card" key={income.id}>
                <h3>{income.source}</h3>
                <p>Date: {income.date}</p>
                <p>Amount: ₹{Number(income.amount).toFixed(2)}</p>
                {income.notes && <p>Notes: {income.notes}</p>}
                {editingIncomeId === income.id ? (
                  <div>
                    <label>New amount (₹)
                      <input type="number" min="0.01" step="0.01"
                        value={editingIncomeAmount}
                        onChange={(event) => setEditingIncomeAmount(event.target.value)} />
                    </label>
                    <button onClick={() => handleUpdateIncome(income.id)}>Save</button>
                    <button onClick={() => {
                      setEditingIncomeId(null);
                      setEditingIncomeAmount("");
                    }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => {
                    setEditingIncomeId(income.id);
                    setEditingIncomeAmount(String(income.amount));
                  }}>Edit Amount</button>
                )}
                <button onClick={() => handleDeleteIncome(income.id)}>Delete</button>
              </div>
            ))}
          </section>

          <section className="dashboard-section">
            <h2>Add an Expense</h2>
            <form onSubmit={handleAddExpense}>
              <label>Expense title
                <input value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Lunch" maxLength={100} required />
              </label>
              <label>Category
                <select value={category}
                  onChange={(event) => setCategory(event.target.value)} required>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Education">Education</option>
                  <option value="Bills">Bills</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>Amount (₹)
                <input type="number" value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  min="0.01" step="0.01" required />
              </label>
              <label>Date
                <input type="date" value={date}
                  onChange={(event) => setDate(event.target.value)} required />
              </label>
              <label>Notes (optional)
                <textarea value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add notes" />
              </label>
              <button type="submit">Add Expense</button>
            </form>
          </section>

          <section className="dashboard-section">
            <h2>Your Expenses</h2>
            {expenseLoading && <p>Loading expenses...</p>}
            {expenseError && <p role="alert">{expenseError}</p>}
            {!expenseLoading && expenses.length === 0 &&
              <p>No expenses found. Add your first expense above.</p>}
            {expenses.map((expense) => (
              <div className="summary-card" key={expense.id}>
                <h3>{expense.title}</h3>
                <p>Category: {expense.category}</p>
                <p>Date: {expense.date}</p>
                <p>Amount: ₹{Number(expense.amount).toFixed(2)}</p>
                {expense.notes && <p>Notes: {expense.notes}</p>}
                {editingId === expense.id ? (
                  <div>
                    <label>New amount (₹)
                      <input type="number" min="0.01" step="0.01"
                        value={editingAmount}
                        onChange={(event) => setEditingAmount(event.target.value)} />
                    </label>
                    <button onClick={() => handleUpdateExpense(expense.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => {
                    setEditingId(expense.id);
                    setEditingAmount(String(expense.amount));
                  }}>Edit Amount</button>
                )}
                <button onClick={() => handleDeleteExpense(expense.id)}>Delete</button>
              </div>
            ))}
          </section>

          <section className="dashboard-section">
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
            <h2>This Month's Budget Summary</h2>
            {budgetLoading && <p>Loading budget summary...</p>}
            {budgetError && <p role="alert">{budgetError}</p>}
            {!budgetLoading && budgetSummary.length === 0 &&
              <p>No budget found for this month. Create a budget using the API.</p>}
            {budgetSummary.map((budget) => {
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
                  <p>Budget limit: ₹{Number(budget.budget_limit).toFixed(2)}</p>
                  <p>Spent: ₹{Number(budget.total_spent).toFixed(2)}</p>
                  <p>Remaining: ₹{Number(budget.remaining).toFixed(2)}</p>
                  <p>Budget used: {Number(budget.percentage_used).toFixed(2)}%</p>
                  {budget.is_exceeded
                    ? <p role="alert">Warning: You have exceeded this budget.</p>
                    : <p>Within budget</p>}

                  {budgetRecord && (editingBudgetId === budgetRecord.id ? (
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
                      <button onClick={() => handleUpdateBudget(budgetRecord.id)}>Save Budget</button>
                      <button onClick={() => {
                        setEditingBudgetId(null);
                        setEditingBudgetLimit("");
                      }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => {
                      setEditingBudgetId(budgetRecord.id);
                      setEditingBudgetLimit(String(budgetRecord.limit_amount));
                      setBudgetError("");
                    }}>Edit Budget</button>
                  ))}
                  {budgetRecord && (
                    <button onClick={() => handleDeleteBudget(budgetRecord.id)}>Delete Budget</button>
                  )}
                </div>
              );
            })}
          </section>

          <section className="dashboard-section">
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

          {message && <p role="status" aria-live="polite">{message}</p>}
        </main>
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
