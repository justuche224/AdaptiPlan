import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import AppPage from "./app-page";
import { getTasksForUser } from "../actions";

const page = async () => {
  const data = await serverAuth();
  if (!data?.session) {
    return redirect("/sign-in");
  }

  const initialTasks = await getTasksForUser();

  return <AppPage initialTasks={initialTasks} />;
};

export default page;
