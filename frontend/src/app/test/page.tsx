"use client";

import { useTest } from "@/app/hooks/test/useTest";

export default function TestPage() {
  const { data, isPending, error } = useTest();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Test Page</h1>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
}
