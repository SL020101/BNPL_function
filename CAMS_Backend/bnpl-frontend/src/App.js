import React, { useMemo, useState } from "react";

const API = "http://localhost:8080";

const sampleProducts = [
  {
    id: 1,
    name: "Laptop Pro 14",
    price: 3999,
    category: "Electronics",
    description: "A premium laptop for study, work, and daily productivity.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Smartphone X",
    price: 2899,
    category: "Mobile",
    description: "A stylish smartphone with strong battery life and camera features.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Gaming Headset",
    price: 499,
    category: "Accessories",
    description: "Comfortable audio gear for gaming, online meetings, and entertainment.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Tablet Air",
    price: 2199,
    category: "Tablet",
    description: "A lightweight tablet for reading, note-taking, and streaming.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
  },
];

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : data?.message || "Request failed");
  }

  return data;
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
      <p style={{ marginTop: 8, color: "#475569" }}>{subtitle}</p>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{label}</label>
      <input
        {...props}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          outline: "none",
          fontSize: 14,
        }}
      />
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", ...props }) {
  const styles =
    variant === "secondary"
      ? {
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #cbd5e1",
        }
      : {
          background: "#2563eb",
          color: "#ffffff",
          border: "1px solid #2563eb",
        };

  return (
    <button
      {...props}
      style={{
        padding: "12px 18px",
        borderRadius: 12,
        fontWeight: 600,
        cursor: "pointer",
        ...styles,
      }}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("login");
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    uphoneno: "",
  });
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(sampleProducts[0]);
  const [months, setMonths] = useState(3);
  const [customAmount, setCustomAmount] = useState("");
  const [backendProducts, setBackendProducts] = useState(null);

  const payableAmount = useMemo(() => {
    const parsed = Number(customAmount);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    return selectedProduct?.price || 0;
  }, [customAmount, selectedProduct]);

  const monthlyPayment = useMemo(() => {
    if (!payableAmount || !months) return 0;
    return payableAmount / Number(months);
  }, [payableAmount, months]);

  const register = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify(registerData),
      });
      setResult(JSON.stringify(data, null, 2));
      setActiveTab("login");
    } catch (err) {
      setError(err.message);
      setResult("");
    } finally {
      setBusy(false);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });
      setCurrentUser({
        userid: data.userid,
        username: loginData.username,
        usergroup: data.usergroup,
      });
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
      setResult("");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    if (!currentUser?.userid) {
      setError("Please login first.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const data = await apiRequest("/logout", {
        method: "POST",
        body: JSON.stringify({ userid: currentUser.userid }),
      });
      setCurrentUser(null);
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
      setResult("");
    } finally {
      setBusy(false);
    }
  };

  //Load Backend Service
  const loadServices = async () => {
  setBusy(true);
  setError("");
  try {
    const data = await apiRequest("/services");
    setBackendProducts(data);
    if (data.length > 0) {
      setSelectedProduct(data[0]);
    }
    setResult(JSON.stringify(data, null, 2));
  } catch (err) {
    setError(err.message);
    setResult("");
  } finally {
    setBusy(false);
  }
};

// BNPL Payment Function
const simulateBnplPayment = async () => {
  if (!currentUser?.userid) {
    setError("Please login first before testing BNPL payment.");
    return;
  }

  setBusy(true);
  setError("");
  try {
    const data = await apiRequest("/bnpl/payment", {
      method: "POST",
      body: JSON.stringify({
        userid: currentUser.userid,
        amount: payableAmount,
        months: Number(months),
        productName: selectedProduct?.name,
      }),
    });
    setResult(JSON.stringify(data, null, 2));
  } catch (err) {
    setError(err.message);
    setResult("");
  } finally {
    setBusy(false);
  }
};

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <header
        style={{
          background: "#0f172a",
          color: "white",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700 }}>BNPL Demo Website</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "#cbd5e1" }}>
            {currentUser ? `Logged in as ${currentUser.username}` : "Not logged in"}
          </span>
          <Button onClick={logout} variant="secondary">Logout</Button>
        </div>
      </header>

      <section
        style={{
          padding: "60px 32px",
          background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #ffffff 100%)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
          <div>
            <div style={{ display: "inline-block", background: "#dbeafe", color: "#1d4ed8", padding: "8px 14px", borderRadius: 999, fontWeight: 700, fontSize: 13 }}>
              New BNPL Testing Platform
            </div>
            <h1 style={{ fontSize: 46, lineHeight: 1.1, margin: "18px 0 14px", color: "#0f172a" }}>
              Test your Buy Now Pay Later flow in a more standard website design.
            </h1>
            <p style={{ fontSize: 18, color: "#475569", maxWidth: 700, lineHeight: 1.7 }}>
              This demo lets you register, login, browse products, calculate installments, and submit a BNPL payment request using your backend API.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <Button onClick={loadServices}>Load Backend Products</Button>
              <Button variant="secondary" onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}>
                Explore Demo
              </Button>
            </div>
          </div>

          <Card style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 22, color: "#0f172a" }}>Account Access</h3>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <Button variant={activeTab === "login" ? "primary" : "secondary"} onClick={() => setActiveTab("login")}>Login</Button>
              <Button variant={activeTab === "register" ? "primary" : "secondary"} onClick={() => setActiveTab("register")}>Register</Button>
            </div>

            {activeTab === "login" ? (
              <form onSubmit={login}>
                <InputField
                  label="Username or Email"
                  placeholder="Enter username or email"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                />
                <InputField
                  label="Password"
                  placeholder="Enter password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <Button type="submit" disabled={busy}>{busy ? "Processing..." : "Login"}</Button>
              </form>
            ) : (
              <form onSubmit={register}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <InputField
                    label="First Name"
                    placeholder="First name"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  />
                  <InputField
                    label="Last Name"
                    placeholder="Last name"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                  />
                </div>
                <InputField
                  label="Username"
                  placeholder="Username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                />
                <InputField
                  label="Email"
                  placeholder="Email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
                <InputField
                  label="Password"
                  placeholder="Password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
                <InputField
                  label="Phone Number"
                  placeholder="Phone number"
                  value={registerData.uphoneno}
                  onChange={(e) => setRegisterData({ ...registerData, uphoneno: e.target.value })}
                />
                <Button type="submit" disabled={busy}>{busy ? "Processing..." : "Create Account"}</Button>
              </form>
            )}
          </Card>
        </div>
      </section>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 60px" }}>
        <SectionTitle
          title="Featured Products"
          subtitle="Choose a product for BNPL testing. You can use the sample products below even before wiring real backend product data."
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
          {sampleProducts.map((product) => (
            <Card key={product.id} style={{ overflow: "hidden" }}>
              <img src={product.image} alt={product.name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>{product.category}</div>
                <h3 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>{product.name}</h3>
                <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>{product.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>RM {product.price}</span>
                  <Button onClick={() => { setSelectedProduct(product); setCustomAmount(""); }}>Select</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "start" }}>
          <Card style={{ padding: 24 }}>
            <SectionTitle
              title="Checkout Summary"
              subtitle="Review the selected product and test installment-based BNPL payment."
            />

            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 18, alignItems: "center", marginBottom: 24 }}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ width: 140, height: 110, borderRadius: 16, objectFit: "cover" }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a" }}>{selectedProduct.name}</h3>
                <p style={{ color: "#475569", lineHeight: 1.7 }}>{selectedProduct.description}</p>
                <div style={{ fontWeight: 700, fontSize: 22, color: "#0f172a" }}>Base Price: Number(selectedProduct.base_price)</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <InputField
                label="Custom Amount (Optional)"
                placeholder="Enter custom amount or leave blank"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>Installment Months</label>
                <select
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    fontSize: 14,
                  }}
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 10 }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Payable Amount</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>RM {payableAmount.toFixed(2)}</div>
              </div>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Tenure</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{months} months</div>
              </div>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 13, color: "#1d4ed8", marginBottom: 8 }}>Monthly Payment</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#1d4ed8" }}>RM {monthlyPayment.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <Button onClick={simulateBnplPayment} disabled={busy}>
                {busy ? "Processing..." : "Submit BNPL Payment"}
              </Button>
              <Button variant="secondary" onClick={loadServices} disabled={busy}>
                Load Backend Products
              </Button>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 24 }}>
            <Card style={{ padding: 24 }}>
              <SectionTitle
                title="Backend Response"
                subtitle="See the live API response from register, login, product load, or BNPL payment."
              />
              {error ? (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: 16, borderRadius: 14 }}>
                  {error}
                </div>
              ) : (
                <pre
                  style={{
                    margin: 0,
                    background: "#0f172a",
                    color: "#e2e8f0",
                    padding: 18,
                    borderRadius: 16,
                    minHeight: 220,
                    overflow: "auto",
                    fontSize: 13,
                  }}
                >
                  {result || "No response yet"}
                </pre>
              )}
            </Card>

            <Card style={{ padding: 24 }}>
              <SectionTitle
                title="Backend Product Snapshot"
                subtitle="This section shows whether your backend /product route is returning data."
              />
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 16,
                  minHeight: 160,
                  maxHeight: 260,
                  overflow: "auto",
                  fontSize: 13,
                  color: "#334155",
                }}
              >
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {backendProducts ? JSON.stringify(backendProducts, null, 2) : "No backend products loaded yet"}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
