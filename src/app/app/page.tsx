import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import AppPage from "./app-page";
import { getTasksForUser } from "../actions";

const page = async () => {
  const data = await serverAuth();
  console.log(data)
  if (!data?.session || !data.user) {
    return redirect("/sign-in");
  }

  const initialTasks = await getTasksForUser();

  return <AppPage initialTasks={initialTasks} user={data.user} />;
};

export default page;
