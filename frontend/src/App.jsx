
import { useState } from "react";
import "./App.css";
import api from "./api";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Restore login state after refreshing the page.
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(sessionStorage.getItem("accessToken"))
  );

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

        // Save the JWT access token for this browser tab.
        sessionStorage.setItem("accessToken", response.data.access);

        // Save the refresh token if Django returns one.
        if (response.data.refresh) {
          sessionStorage.setItem("refreshToken", response.data.refresh);
        }

        setIsLoggedIn(true);
        setMessage("Login successful! Welcome to BudgetBuddy.");
        setPassword("");
      } else {
        await api.post("auth/register/", {
          username,
          email,
          password,
        });

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
            `${field}: ${
              Array.isArray(errors) ? errors.join(", ") : errors
            }`
          )
          .join(" | ");

        setMessage(details || "Request failed. Please try again.");
      } else {
        setMessage(
          "Cannot connect to the backend. Check that Django is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setMessage("");
    setPassword("");
  };

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
              <p>₹0.00</p>
            </div>

            <div className="summary-card">
              <h3>Total Expenses</h3>
              <p>₹0.00</p>
            </div>

            <div className="summary-card">
              <h3>Available Balance</h3>
              <p>₹0.00</p>
            </div>

            <div className="summary-card">
              <h3>Savings Goals</h3>
              <p>0 active goals</p>
            </div>
          </div>

          <section className="dashboard-section">
            <h2>Quick Actions</h2>
            <p>Income and expense management will be added next.</p>
          </section>
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
          <p>
            Track expenses, plan your budget, and work towards
            your savings goals.
          </p>
        </section>

        <section className="auth-card">
          <h2>{isLogin ? "Welcome Back!" : "Create Account"}</h2>
          <p>
            {isLogin
              ? "Log in to manage your finances."
              : "Join BudgetBuddy to manage your money."}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username"
                  required
                />
              </label>
            )}

            <label>
              {isLogin ? "Username" : "Email"}
              <input
                type={isLogin ? "text" : "email"}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={
                  isLogin ? "Enter your username" : "Enter your email"
                }
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Log In"
                  : "Register"}
            </button>
          </form>

          {message && (
            <p role="status" aria-live="polite">
              {message}
            </p>
          )}

          <p className="switch-text">
            {isLogin ? "New to BudgetBuddy?" : "Already have an account?"}
            <button
              className="switch-button"
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
                setPassword("");
              }}
            >
              {isLogin ? "Create account" : "Log in"}
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
