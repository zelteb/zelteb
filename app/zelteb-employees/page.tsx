// app/zelteb-employees/page.tsx

export default function ZeltebEmployeesPage() {
  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Zelteb Employees
      </h1>

      <p style={{ marginTop: "10px", color: "#555" }}>
        Welcome to the employees dashboard.
      </p>

      {/* Example content */}
      <div style={{ marginTop: "20px" }}>
        <ul>
          <li>👤 Employee 1</li>
          <li>👤 Employee 2</li>
          <li>👤 Employee 3</li>
        </ul>
      </div>
    </main>
  );
}