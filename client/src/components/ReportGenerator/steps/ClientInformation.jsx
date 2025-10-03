export default function ClientInformation({ data, updateData }) {
  return (
    <div>
      <h3>Client Information</h3>

      <div style={{ marginTop: "1rem" }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}
        >
          Name:
        </label>
        <input
          type="text"
          value={data.name || ""}
          onChange={(e) => updateData({ ...data, name: e.target.value })}
          style={{ width: "100%", padding: "8px" }}
          placeholder="Enter client name"
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}
        >
          DOB:
        </label>
        <input
          type="text"
          value={data.dob || ""}
          onChange={(e) => updateData({ ...data, dob: e.target.value })}
          style={{ width: "100%", padding: "8px" }}
          placeholder="Enter date of birth"
        />
      </div>
    </div>
  );
}
