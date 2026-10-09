import { useOutletContext } from "react-router-dom";
import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import { useUsersLogic } from "../../UI_Logic/UsersLogic.jsx";
import "./Users.css";

export default function Users() {
  const { theme, user } = useOutletContext() ?? {
    theme: "light",
    user: null,
  };

  const {
    users,
    filteredUsers,
    loading,
    error,
    q,
    setQ,
    load,
  } = useUsersLogic();

  return (
    <section className="users" data-theme={theme}>
      <ContentHeader
        title="Users"
        subTitle="Manage registered accounts and their access"
        user={user}
      />

      <input
        className="users-search"
        type="search"
        placeholder="Search by name or email"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        aria-label="Search users by name or email"
      />

      {loading && !users ? (
        <div className="dash-state" role="status">
          Loading users…
        </div>
      ) : error && !users ? (
        <div className="dash-state" role="alert">
          <b>Couldn't load users</b>
          <span>{error}</span>
          <button
            type="button"
            className="dash-btn dash-btn-primary"
            style={{ marginTop: 14 }}
            onClick={load}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="dash-state" role="alert">
              {error}
            </div>
          )}

          <p className="dash-hint">
            {(users || []).length} registered accounts
          </p>

          <div
            className="dash-card"
            style={{ padding: 0, overflowX: "auto" }}
          >
            <table className="dash-table users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="dash-hint"
                      style={{ padding: 24, textAlign: "center" }}
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name || "—"}</td>

                      <td className="users-email">
                        {item.email || "—"}
                      </td>

                      <td>
                        <span
                          className={`dash-badge dash-badge-${roleTone(
                            item.role?.name,
                          )}`}
                        >
                          {item.role?.name || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`dash-badge ${
                            item.isActive
                              ? "dash-badge-success"
                              : "dash-badge-danger"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="dash-hint">
                        {item.createdAt &&
                        !Number.isNaN(new Date(item.createdAt).getTime())
                          ? new Date(item.createdAt).toLocaleDateString(
                              "en-GB",
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function roleTone(role) {
  if (role === "owner" || role === "admin") return "accent";
  if (role === "customer") return "neutral";
  return "gold";
}