import "./Users.css";
import { useOutletContext } from "react-router-dom";

import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";

import { useUsersLogic } from "../../UI_Logic/UsersLogic.jsx";
import Table from "../../Components/Table/Table.jsx";
import Button from "../../Components/Button/Button";

import { USERS_TABLE_DATA } from "../../services/UsersServices.js";


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


  // const actions = [
  //   {
  //     element: (users) => (
  //       <Button
  //         variant="details"
  //         disabled={Boolean(deletingOrderId)}
  //         onClick={() => setSelectedOrder(order)}
  //       ></Button>
  //     ),
  //   },
  //   {
  //     element: (users) => (
  //       <Button
  //         variant="delete"
  //         onClick={() => deleteOrder(order)}
  //         disabled={Boolean(deletingOrderId)}
  //         // loading={deletingOrderId === orderId}
  //         aria-label={`Delete order ${order.orderNumber || ""}`}
  //       ></Button>
  //     ),
  //   },
  // ];

  // console.log(filteredUsers);
  
  if(loading) return <LoadingSpinner />
  
  return (
    <section className="users" data-theme={theme}>
      <ContentHeader
        title="Users"
        subTitle="Manage registered accounts and their access"
        user={user}
        action={
          <Button>
            add user
          </Button>
        }
      />



      <input
        className="users-search"
        type="search"
        placeholder="Search by name or email"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        aria-label="Search users by name or email"
      />

      <Table tableHeader={USERS_TABLE_DATA} tableBody={filteredUsers} />

    </section>
  );
}