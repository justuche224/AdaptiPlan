import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import AppPage from "./app-page";

const page = async () => {
  const data = await serverAuth();
  if (!data?.session) {
    return redirect("/sign-in");
  }
  return <AppPage />;
};

export default page;
